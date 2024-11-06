import { Signal, signal, effect, computed } from '@preact/signals'
import { Async } from './types'
import { defaultAsync } from './utils'

type ComputeFunction<I, O> = (input: I, abortSignal?: AbortSignal) => Promise<O>

export function asyncEffect<I, O>(
  inputSignal: Signal<I>,
  fn: ComputeFunction<I, O>,
): Signal<Async<O>> {
  const outputSignal = signal<Async<O>>(defaultAsync())

  let computationId = 0
  let abortController: AbortController | null = null

  effect(() => {
    const inputValue = inputSignal.value
    computationId += 1
    const currentId = computationId

    // Abort previous computation
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    if (!outputSignal.peek().loading) {
      outputSignal.value = { ...outputSignal.peek(), refreshing: true }
    }

    const compute = async () => {
      try {
        const result = await fn(inputValue, abortController!.signal)

        if (currentId === computationId) {
          outputSignal.value = {
            loading: false,
            refreshing: false,
            value: result,
            error: null,
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError' && currentId === computationId) {
          outputSignal.value = {
            loading: false,
            refreshing: false,
            value: outputSignal.peek().value, // TODO: reset to undefined instead or previous value?
            error: error instanceof Error ? error : new Error(String(error)),
          }
        }
      }
    }

    compute()
  })

  return outputSignal
}

type ConditionFunction<T> = (value: T) => boolean

export function conditionalComputed<T>(
  inputSignal: Signal<T>,
  condition: ConditionFunction<T>,
): Signal<T> {
  // Start with the initial value, assuming it satisfies the condition
  const cachedSignal = signal<T>(inputSignal.value)

  // Create a computed signal that only updates when the condition is met
  return computed(() => {
    const currentValue = inputSignal.value
    if (condition(currentValue)) {
      cachedSignal.value = currentValue
    }
    return cachedSignal.value
  })
}
