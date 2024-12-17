import { batch, computed, effect, signal } from '@preact/signals'

import { ChainableState } from '../types'
import { addChainMethods, createGetter } from './utils'

// expose signals with solidjs-style getter and setter
export function $state<T>(initialValue: T): [ChainableState<T>, (newValue: T) => void] {
  const internalSignal = signal<T>(initialValue)
  const getValue = addChainMethods(createGetter(internalSignal))
  const setValue = (newValue: T) => {
    internalSignal.value = newValue
  }

  return [getValue, setValue]
}

export function $computed<T>(fn: () => T): ChainableState<T> {
  const computedSignal = computed(fn)
  const getValue = addChainMethods(createGetter(computedSignal))

  return getValue
}

export const $batch = batch
export const $effect = effect
