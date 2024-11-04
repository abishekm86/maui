import { Signal, signal, effect } from '@preact/signals'
import { Async } from './types'
import { defaultAsync } from './utils'

type ComputeFunction<I, O> = (input: I, abortSignal?: AbortSignal) => Promise<O>

export function asyncComputed<I, O>(
  inputSignal: Signal<I>,
  computeFn: ComputeFunction<I, O>,
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
        const result = await computeFn(inputValue, abortController!.signal)

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
