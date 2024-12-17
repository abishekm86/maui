import { batch, computed, signal } from '@preact/signals'

import { AsyncState, ChainableAsyncState } from '../types'
import { $computed } from './signals'
import { Trigger, addAsyncChainMethods, createTrigger } from './utils'

type AsyncFn<T> = (signal: AbortSignal) => Promise<T>

/**
 * Async computation: does not run the computation until the state is read. Once read, it runs the computation.
 * @template T - The output type of the async computation.
 * @param {AsyncFn<T>} fn - The function to compute asynchronously.
 * @returns {[AsyncState<T>, Trigger]} A tuple of the async state and a trigger to refresh.
 */
export function $async<T>(fn: AsyncFn<T>): [ChainableAsyncState<T>, Trigger] {
  const valueSignal = signal<T | undefined>(undefined)
  const errorSignal = signal<Error | null | undefined>(undefined)
  const loadingSignal = signal(true)
  const refreshingSignal = signal(false)
  // TODO: add last updated time & reload functionality

  const [triggerSignal, trigger] = createTrigger() // trigger a lazy refresh

  let computationId = 0
  let abortController: AbortController | null = null

  const lazyRunner = computed(() => {
    triggerSignal.value // depend on trigger
    computationId += 1
    const currentId = computationId

    if (abortController) abortController.abort()
    abortController = new AbortController()

    // If it's not the first load, this is a "refresh"
    if (!loadingSignal.peek()) {
      refreshingSignal.value = true
    }

    Promise.resolve(fn(abortController.signal))
      .then(resultValue => {
        if (currentId === computationId) {
          batch(() => {
            loadingSignal.value = false
            refreshingSignal.value = false
            valueSignal.value = resultValue
            errorSignal.value = null
          })
        }
      })
      .catch(err => {
        if (err?.name !== 'AbortError' && currentId === computationId) {
          batch(() => {
            loadingSignal.value = false
            refreshingSignal.value = false
            errorSignal.value = err instanceof Error ? err : new Error(String(err))
          })
        }
      })
  })

  // Wrap each state property so that reading it triggers the computation if needed
  const finalValue = $computed(() => {
    lazyRunner.value
    return valueSignal.value
  })

  const finalError = $computed(() => {
    lazyRunner.value
    return errorSignal.value
  })

  const finalLoading = $computed(() => {
    lazyRunner.value
    return loadingSignal.value
  })

  const finalRefreshing = $computed(() => {
    lazyRunner.value
    return refreshingSignal.value
  })

  const asyncState: AsyncState<T> = {
    value: finalValue,
    error: finalError,
    loading: finalLoading,
    refreshing: finalRefreshing,
  }

  return [addAsyncChainMethods(asyncState), trigger]
}
