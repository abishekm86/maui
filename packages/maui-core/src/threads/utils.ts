import { Signal, signal } from '@preact/signals'

import {
  AsyncState,
  ChainableAsyncState,
  ChainableState,
  IS_SIGNAL,
  State,
  Trigger,
} from '../types'
import { $await } from './async'
import { $computed } from './signals'

export function deepFreeze(obj) {
  Object.freeze(obj)

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      deepFreeze(obj[key])
    }
  }

  return obj
}

export function createGetter<T>(signal: Signal<T>): State<T> {
  const getValue = () => signal.value
  getValue.peek = () => signal.peek()
  getValue[IS_SIGNAL] = true as true

  // TODO: Return an immutable wrapper to prevent unintended mutation outside reactive chain?
  return getValue
}

export function addChainMethods<T>(getValue: State<T>): ChainableState<T> {
  const chainable = getValue as ChainableState<T>

  chainable.transform = fn => {
    return $computed(() => fn(getValue()))
  }

  chainable.await = fn => {
    return $await(abort => fn(getValue(), abort))
  }

  // chainable.do = fn => {
  //   effect(() => {
  //     fn(getValue())
  //   })
  //   return chainable
  // }

  return chainable
}

// Wrap in a function to add mapValue method
export function addAsyncChainMethods<T>(state: AsyncState<T>): ChainableAsyncState<T> {
  const chainedState = state as ChainableAsyncState<T>

  chainedState.transform = fn => {
    return addAsyncChainMethods({
      value: state.value.transform(fn),
      error: state.error,
      loading: state.loading,
      refreshing: state.refreshing,
      refresh: state.refresh,
    })
  }

  return chainedState
}

export function createTrigger(): [Signal<number>, Trigger] {
  const triggerSignal = signal(0)
  const canTrigger = signal(true)

  const trigger = () => canTrigger.peek() && triggerSignal.value++

  return [triggerSignal, trigger]
}
