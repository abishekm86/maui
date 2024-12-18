import { batch, computed, signal } from '@preact/signals'

import { AsyncFn, ChainableAsyncState } from '../types'
import { $computed } from './signals'
import { addAsyncChainMethods, createTrigger } from './utils'

/**
 * Async computation: does not run the computation until the state is read. Once read, it runs the computation.
 * @template T - The output type of the async computation.
 * @param {AsyncFn<T>} fn - The function to compute asynchronously.
 * @returns {[AsyncState<T>, Trigger]} A tuple of the async state and a trigger to refresh.
 */
export function $await<T>(fn: AsyncFn<T>): ChainableAsyncState<T | undefined> {
  const valueSignal = signal<T | undefined>(undefined)
  const errorSignal = signal<Error | null>(null)
  const loadingSignal = signal(true)
  const refreshingSignal = signal(false)
  // TODO: add last updated time & reloading state

  const [triggerSignal, trigger] = createTrigger() // trigger a lazy refresh
  let lastTrigger = 0

  let computationId = 0
  let abortController: AbortController | null = null

  const lazyRunner = computed(() => {
    if (loadingSignal.peek()) {
      // ignore refreshes while in loading state
      if (triggerSignal.value !== lastTrigger) {
        lastTrigger = triggerSignal.value
        return
      }
    }

    computationId += 1
    const currentId = computationId

    if (abortController) abortController.abort()
    abortController = new AbortController()

    // if manually triggered, this is a "refresh"
    if (triggerSignal.value !== lastTrigger) {
      refreshingSignal.value = true
      lastTrigger = triggerSignal.value
    } else {
      // a dependency changed, this is a "load"/"reload"
      loadingSignal.value = true
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

  const asyncState = addAsyncChainMethods<T | undefined>({
    value: finalValue,
    error: finalError,
    loading: finalLoading,
    refreshing: finalRefreshing,
    refresh: trigger,
  })

  return addAsyncChainMethods(asyncState)
}
