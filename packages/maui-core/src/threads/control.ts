import { signal } from '@preact/signals'
import { State } from 'src/types'

import { $computed } from './signals'

/**
 * Conditional signal logic based on a predicate.
 * @template T - The type of the state.
 * @param {() => boolean} condition - The condition to evaluate.
 * @param {IfOptions<T> | State<T>} $then - Options for true/false behavior or a signal gated by the condition.
 * @returns {State<T>} A computed signal based on the condition.
 */
export function $if<T>(
  condition: () => boolean,
  $then: () => T,
  $else: (prev) => T = prev => prev,
): State<T> {
  const previousSignal = signal<T | undefined>(undefined)
  return $computed(() => {
    const result = condition() ? $then() : $else(previousSignal.peek())
    previousSignal.value = result
    return result
  })
}
