import { Signal, computed, effect, signal, untracked } from '@preact/signals'

import { AsyncState, State } from './types'
import { defaultResult } from './utils'

// TODO: make triggerable
export const $action = effect

type ComputeFunction<O> = (abort?: AbortSignal) => O | Promise<O>

// TODO: add last updated
export function $asyncAction<O>(fn: ComputeFunction<O>): [AsyncState<O>, () => void] {
  const [result, setResult] = $(defaultResult<O>())
  const [loading, setLoading] = $(true)
  const [refreshing, setRefreshing] = $(false)
  const [triggerSignal, setTriggerSignal] = $(0)

  let computationId = 0
  let abortController: AbortController | null = null

  const computedFn = computed(() => fn)

  effect(() => {
    triggerSignal.value // This will cause the effect to depend on `triggerSignal`

    computationId += 1
    const currentId = computationId

    // Abort previous computation
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    const compute = async () => {
      try {
        const resultValue = await Promise.resolve(computedFn.value(abortController!.signal))

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

// TODO: add last updated
export function $updater(fn: () => void): () => void {
  const [triggerSignal, setTriggerSignal] = $(0)
  let firstRun = true

  effect(() => {
    triggerSignal.value // This will cause the effect to depend on `triggerSignal`
    !firstRun && untracked(fn)
    firstRun = false
  })

  // Return both the output signal and a trigger function to control the effect manually
  return () => setTriggerSignal(triggerSignal.value + 1)
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

type IfOptions<T> = {
  $then: () => T
  $else?: (prev: T) => T
  initialValue: T
}

export function $if<T>(condition: () => boolean, options: IfOptions<T> | State<T>): State<T> {
  const computedCondition = computed(() => condition)

  let cachedSignal: Signal<T>
  let computeValue: () => T

  if (options instanceof Signal) {
    cachedSignal = signal<T>(options.value)
    computeValue = () => (computedCondition.value() ? options.value : cachedSignal.value)
  } else {
    const { initialValue, $then, $else = prev => prev } = options as IfOptions<T>
    cachedSignal = signal<T>(initialValue)
    const computedIfTrue = computed(() => $then)
    const computedIfFalse = computed(() => $else)
    computeValue = () =>
      computedCondition.value() ? computedIfTrue.value() : computedIfFalse.value(cachedSignal.value)
  }

  // Create a computed signal that updates based on the condition and options
  const result = computed(() => {
    cachedSignal.value = computeValue()
    return cachedSignal.value
  })

  return result
}

// TODO: rethink this
export function $async<T>(signal: State<T>) {
  const [result] = $asyncAction(() => signal.value)
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
