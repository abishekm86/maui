import { signal, effect, computed } from '@preact/signals'
import { AsyncState, State } from './types'
import { defaultResult } from './utils'

type ComputeFunction<I extends any[], O> = (...input: [...I, AbortSignal?]) => O | Promise<O>

// TODO: add last updated
export function $action<I extends any[], O>(
  fn: ComputeFunction<I, O>,
  binds: { [K in keyof I]?: State<I[K]> },
): [AsyncState<O>, () => void] {
  const [result, setResult] = $(defaultResult<O>())
  const [loading, setLoading] = $(true)
  const [refreshing, setRefreshing] = $(false)
  const [triggerSignal, setTriggerSignal] = $(0)

  let computationId = 0
  let abortController: AbortController | null = null

  effect(() => {
    triggerSignal.value // This will cause the effect to depend on `triggerSignal`

    const inputValues = binds.map(signal => signal && signal.value) as [...I]
    computationId += 1
    const currentId = computationId

    // Abort previous computation
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    const compute = async () => {
      try {
        const resultValue = await Promise.resolve(fn(...inputValues, abortController!.signal))
        // TODO: support custom equality check
        if (currentId === computationId && resultValue !== result.peek().value) {
          setResult({
            value: resultValue,
            error: null,
          })
        }
      } catch (error: any) {
        if (error.name !== 'AbortError' && currentId === computationId) {
          setResult({
            value: result.peek().value, // TODO: reset to undefined instead of the previous value?
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      }
      setLoading(false)
      setRefreshing(false)
    }

    // If the output signal is not currently in a loading state, mark it as refreshing
    if (!loading.peek()) {
      setRefreshing(true)
    }
    compute()
  })

  // Return both the output signal and a trigger function to control the effect manually
  return [{ result, loading, refreshing }, () => setTriggerSignal(triggerSignal.value + 1)]
}

export function $invoke(trigger: () => void, interval: number): () => void {
  const intervalId = setInterval(() => {
    trigger() // Invoke the trigger function to re-trigger the effect
  }, interval)

  // Provide a way to stop the interval
  const stop = () => {
    clearInterval(intervalId)
  }

  // Return a stop function to control the repeated invocation
  return stop
}

type ConditionFunction<T> = (value: T) => boolean

export function $filter<T>(condition: ConditionFunction<T>, inputSignal: State<T>): State<T> {
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

export function $async<T>(signal: State<T>) {
  const [result] = $action(x => x, [signal])
  return result
}

// Introduce solid.js style signals using familiar React idioms
export function $<T>(initialValue: T): [State<T>, (newValue: T) => void] {
  const internalSignal = signal<T>(initialValue)
  const readonlySignal = computed(() => {
    const value = internalSignal.value

    if (typeof value === 'object' && value !== null) {
      // Use a proxy for objects to lock down the properties
      return new Proxy(value as T & object, {
        get(target, prop, receiver) {
          return Reflect.get(target, prop, receiver)
        },
        set(_target, prop, _newValue) {
          console.warn(`Attempt to modify property '${String(prop)}' is not allowed.`)
          return true // TODO: return false in dev-mode to bubble error up
        },
      })
    } else {
      // Directly return the value for non-objects (primitives)
      return value
    }
  })
  const setValue = (newValue: T) => {
    internalSignal.value = newValue
  }

  return [readonlySignal, setValue]
}
