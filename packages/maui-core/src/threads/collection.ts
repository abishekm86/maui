import { Signal, batch, signal } from '@preact/signals'

import { ArrayState } from '../types'

type GetKey<T, K> = (item: T, index?: number) => K
const defaultKey: GetKey<any, number> = (item, index?) => item?.id ?? item?.key ?? index

/**
 * Create a keyed array signal.
 */
export function $collection<T, K = number>(
  initialArray: T[],
  getKey: GetKey<T, K> = defaultKey as GetKey<T, K>,
): ArrayState<T, K> {
  const items = new Map<K, Signal<T>>()
  let _keys: K[] = initialArray.map((item, index) => {
    const key = getKey(item, index) // TODO: ensure getKey has to return a unique key
    items.set(key, signal(item))
    return key
  })
  const keysSignal = signal<K[]>(_keys)

  function length() {
    return keysSignal.value.length
  }

  function keys() {
    return keysSignal.value
  }
  function get(key: K) {
    return items.get(key)?.value
  }
  function at(index: number) {
    const key = keysSignal.value[index]
    return key !== undefined ? items.get(key)!.value : undefined
  }

  function set(newArray: T[]) {
    const newKeys = new Array(newArray.length)

    const sameLength = newArray.length === _keys.length
    let sameKeys = true
    let sameOrder = sameLength

    batch(() => {
      for (let i = 0; i < newArray.length; i++) {
        const k = getKey(newArray[i], i)
        const v = newArray[i]

        newKeys[i] = k

        if (sameLength && newKeys[i] !== _keys[i]) {
          sameOrder = false
        }

        if (items.has(k)) {
          console.log('reusing', k)
          // Key exists, just update value if changed
          const childSignal = items.get(k)!
          childSignal.value = v
        } else {
          // New key, create new signal
          items.set(k, signal(v))
          sameKeys = false
        }
      }

      // Remove old keys no longer present
      const newKeysSet = new Set(newKeys)
      for (const oldKey of _keys) {
        if (!newKeysSet.has(oldKey)) {
          items.delete(oldKey)
          sameKeys = false
        }
      }

      // Any structural change triggers a parent update.
      if (!sameLength || !sameKeys || !sameOrder) {
        console.log('changed')
        keysSignal.value = newKeys
      }
    })
  }

  return {
    keys,
    length,
    get,
    set,
    at,
  }
}
