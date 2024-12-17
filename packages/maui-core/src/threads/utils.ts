import { Signal, effect, signal } from '@preact/signals'

import { AsyncState, ChainableAsyncState, ChainableState, IS_SIGNAL, State } from '../types'
import { $computed } from './signals'

export function deepFreeze(obj) {
  // Freeze the object itself
  Object.freeze(obj)

  // Iterate through the object's properties
  for (const key in obj) {
    // Check if the property is an object or array
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively call deepFreeze on the nested object/array
      deepFreeze(obj[key])
    }
  }

  return obj
}

// Return an immutable wrapper to prevent unintended mutation outside reactive chain
export function createGetter<T>(signal: Signal<T>): State<T> {
  const getValue = () => signal.value
  getValue.peek = () => signal.peek()
  getValue[IS_SIGNAL] = true as true

  return getValue
}

export function addChainMethods<T>(getValue: State<T>): ChainableState<T> {
  const chainable = getValue as ChainableState<T>

  chainable.then = fn => {
    return $computed(() => fn(getValue()))
  }

  chainable.do = fn => {
    effect(() => {
      fn(getValue())
    })
    return chainable
  }

  return chainable
}

// Wrap in a function to add mapValue method
export function addAsyncChainMethods<T>(state: AsyncState<T>): ChainableAsyncState<T> {
  const chainedState = state as ChainableAsyncState<T>
  chainedState.then = <U>(fn: (value: T | undefined) => U): ChainableAsyncState<U> => {
    return addAsyncChainMethods({
      value: state.value.then(fn),
      error: state.error,
      loading: state.loading,
      refreshing: state.refreshing,
    })
  }
  return chainedState
}

export type Trigger = () => void

export function createTrigger(): [Signal<number>, Trigger] {
  const triggerSignal = signal(0)
  const canTrigger = signal(true)

  const trigger = () => canTrigger.peek() && triggerSignal.value++

  return [triggerSignal, trigger]
}
