import { Signal, batch, signal } from '@preact/signals'

import { State } from '../types'
import { $computed, $effect } from './signals'

// Your chainable computed and effect
type GetKey<T, K> = (item: T, index?: number) => K

interface ChainableCollection<T, K> {
  keys(): K[]
  length(): number
  get(key: K): T | undefined
  at(index: number): T | undefined
  set(newArray: T[]): void

  map<U>(fn: (value: T, key: K) => U): ChainableCollection<U, K>
  forEach(fn: (value: T, key: K) => void): this
  reduce<U>(fn: (acc: U, value: T, key: K, index: number) => U, initial: U): State<U>
}

const defaultKey: GetKey<any, number> = (item, i) => item?.id ?? item?.key ?? i

interface CollectionInternals<T, K> {
  keysSignal: Signal<K[]>
  getItemState: (key: K) => State<T> | undefined
  setItems: (items: T[]) => void // either sets or throws for derived
}

function attachCollectionMethods<T, K>(
  internals: CollectionInternals<T, K>,
): ChainableCollection<T, K> {
  const { keysSignal, getItemState, setItems } = internals

  function keys() {
    return keysSignal.value
  }
  function length() {
    return keys().length
  }
  function get(key: K) {
    return getItemState(key)?.()
  }
  function at(index: number) {
    const k = keys()[index]
    return k !== undefined ? get(k) : undefined
  }

  function set(newArray: T[]) {
    setItems(newArray)
  }

  function map<U>(fn: (value: T, key: K) => U): ChainableCollection<U, K> {
    const sourceKeysSignal = keysSignal
    const itemMap = new Map<K, State<U>>()

    // Keep itemMap in sync with keys and items
    $effect(() => {
      const currentKeys = sourceKeysSignal.value
      const oldKeys = Array.from(itemMap.keys())

      // Remove old keys no longer present
      for (const oldKey of oldKeys) {
        if (!currentKeys.includes(oldKey)) {
          itemMap.delete(oldKey)
        }
      }

      // Add new keys
      for (const k of currentKeys) {
        if (!itemMap.has(k)) {
          // Create computed for each transformed item
          const state = $computed(() => {
            const src = getItemState(k)?.()
            return fn(src!, k)
          })
          itemMap.set(k, state)
        }
      }
    })

    // Derived collection: cannot set
    const derivedInternals: CollectionInternals<U, K> = {
      keysSignal: sourceKeysSignal,
      getItemState: (key: K) => itemMap.get(key),
      setItems: () => {
        throw new Error('Cannot set on a derived collection.')
      },
    }

    return attachCollectionMethods(derivedInternals)
  }

  function forEach(fn: (value: T, key: K) => void): ChainableCollection<T, K> {
    const disposers = new Map<K, () => void>()

    $effect(() => {
      const currentKeys = keys()
      const oldKeys = Array.from(disposers.keys())

      // Dispose removed
      for (const oldKey of oldKeys) {
        if (!currentKeys.includes(oldKey)) {
          disposers.get(oldKey)?.()
          disposers.delete(oldKey)
        }
      }

      // Add effects for new keys
      for (const k of currentKeys) {
        if (!disposers.has(k)) {
          const stop = $effect(() => {
            const val = get(k)!
            fn(val, k)
          })
          disposers.set(k, stop)
        }
      }
    })

    return collection
  }

  function reduce<U>(fn: (acc: U, value: T, key: K, index: number) => U, initial: U): State<U> {
    return $computed(() => {
      const ks = keys()
      let acc = initial
      ks.forEach((k, i) => {
        acc = fn(acc, get(k)!, k, i)
      })
      return acc
    })
  }

  const collection: ChainableCollection<T, K> = { keys, length, get, at, set, map, forEach, reduce }
  return collection
}

export function $collection<T, K = number>(
  initialArray: T[],
  getKey: GetKey<T, K> = defaultKey as GetKey<T, K>,
): ChainableCollection<T, K> {
  const items = new Map<K, Signal<T>>()

  const _keys: K[] = initialArray.map((item, i) => {
    const k = getKey(item, i)
    items.set(k, signal(item))
    return k
  })
  const keysSignal = signal<K[]>(_keys)

  function setItems(newArray: T[]) {
    const newKeys = new Array(newArray.length)
    const oldKeys = keysSignal.value

    const sameLength = newArray.length === oldKeys.length
    let sameKeys = true,
      sameOrder = sameLength

    batch(() => {
      for (let i = 0; i < newArray.length; i++) {
        const k = getKey(newArray[i], i)
        newKeys[i] = k
        if (sameLength && newKeys[i] !== oldKeys[i]) {
          sameOrder = false
        }

        if (items.has(k)) {
          items.get(k)!.value = newArray[i]
        } else {
          items.set(k, signal(newArray[i]))
          sameKeys = false
        }
      }

      const newKeysSet = new Set(newKeys)
      for (const oldKey of oldKeys) {
        if (!newKeysSet.has(oldKey)) {
          items.delete(oldKey)
          sameKeys = false
        }
      }

      if (!sameLength || !sameKeys || !sameOrder) {
        keysSignal.value = newKeys
      }
    })
  }

  const internals: CollectionInternals<T, K> = {
    keysSignal: () => keysSignal.value,
    getItemState: (key: K) => items.get(key),
    setItems,
  }

  return attachCollectionMethods(internals)
}
