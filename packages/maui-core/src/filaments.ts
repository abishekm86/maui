import { Signal, computed, effect, signal, untracked } from '@preact/signals'

import { AsyncState, State } from './types'
import { defaultResult } from './utils'

type Trigger = () => void
type Dispose = () => void
type ComputeFunction<O> = (abort?: AbortSignal) => O | Promise<O>

export const $action = effect
export const $compute = computed

/**
 * Asynchronous action handler. Executes the provided function and returns its state.
 * @template O - The output type of the async computation.
 * @param {ComputeFunction<O>} fn - The function to compute asynchronously.
 * @returns {[AsyncState<O>, Trigger]} A tuple of the async state and a trigger function.
 */
export function $asyncAction<O>(fn: ComputeFunction<O>): [AsyncState<O>, Trigger] {
  const [result, setResult] = $(defaultResult<O>())
  const [loading, setLoading] = $(true)
  const [refreshing, setRefreshing] = $(false)
  const [triggerSignal, setTriggerSignal] = $(0)
  // TODO: add last updated time

  let computationId = 0
  let abortController: AbortController | null = null

  const computedFn = $compute(() => fn)

  $action(() => {
    triggerSignal.value // Ensure effect depends on triggerSignal

    computationId += 1
    const currentId = computationId

    // Abort any previous computation
    if (abortController) abortController.abort()
    abortController = new AbortController()

    const compute = async () => {
      try {
        const resultValue = await Promise.resolve(computedFn.value(abortController!.signal))

        // Update result only if computation matches current ID and value has changed
        // TODO: support custom equality check
        if (currentId === computationId && resultValue !== result.peek().value) {
          setResult({ value: resultValue, error: null })
        }
      } catch (error: any) {
        if (error.name !== 'AbortError' && currentId === computationId) {
          setResult({
            value: result.peek().value, // TODO: should we reset to undefined?
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    if (!loading.peek()) setRefreshing(true) // Mark as refreshing if not loading
    compute()
  })

  return [{ result, loading, refreshing }, () => setTriggerSignal(triggerSignal.value + 1)]
}

/**
 * Updater effect handler, allowing manual triggering of a provided function.
 * @param {() => void} fn - The function to execute on trigger.
 * @returns {Trigger} A trigger function to manually control the effect.
 */
export function $updater(fn: () => void): Trigger {
  const [triggerSignal, setTriggerSignal] = $(0)
  let firstRun = true

  $action(() => {
    triggerSignal.value // Ensure effect depends on triggerSignal
    if (!firstRun) untracked(fn) // run without subscribing to any signals referenced in fn
    firstRun = false
  })

  return () => setTriggerSignal(triggerSignal.value + 1)
}

/**
 * Unified function for periodic or single invocation of a trigger function.
 * @param {Trigger} trigger - The function to trigger.
 * @param {Object} [options] - Options to control the behavior of the trigger.
 * @param {number} [options.interval] - Interval time in milliseconds for periodic invocation.
 * @param {number} [options.delay] - Delay in milliseconds before invoking the trigger (for single invocation).
 * @returns {Dispose| void} If interval is provided, returns a stop function to clear the interval. Otherwise, returns void.
 */
export function $invoke(
  trigger: Trigger,
  options?: { interval?: number; delay?: number },
): Dispose {
  if (options?.interval !== undefined) {
    const intervalId = setInterval(trigger, options.interval)
    return () => clearInterval(intervalId)
  } else if (options?.delay !== undefined) {
    setTimeout(trigger, options.delay)
    return () => {}
  } else {
    trigger()
    return () => {}
  }
}

type IfOptions<T> = {
  $then: (prev: T) => T
  $else?: (prev: T) => T
  initialValue: T
}

/**
 * Conditional signal logic based on a predicate.
 * @template T - The type of the state.
 * @param {() => boolean} condition - The condition to evaluate.
 * @param {IfOptions<T> | State<T>} options - Options for true/false behavior or a signal gated by the condition.
 * @returns {State<T>} A computed signal based on the condition.
 */
export function $if<T>(condition: () => boolean, options: IfOptions<T> | State<T>): State<T> {
  let cachedSignal: State<T>
  let setCachedSignal: (newValue: T) => void
  let conditionalValue: State<T>

  if (options instanceof Signal) {
    ;[cachedSignal, setCachedSignal] = $<T>(options.value)
    conditionalValue = $compute(() => (condition() ? options.value : cachedSignal.value))
  } else {
    const { initialValue, $then, $else = prev => prev } = options as IfOptions<T>
    ;[cachedSignal, setCachedSignal] = $<T>(initialValue)
    conditionalValue = $compute(() =>
      condition() ? $then(cachedSignal.peek()) : $else(cachedSignal.peek()),
    )
  }

  $action(() => setCachedSignal(conditionalValue.value))
  return cachedSignal
}

/**
 * Asynchronous signal wrapper. Converts a signal into an async state.
 * @template T - The type of the signal's value.
 * @param {State<T>} signal - The state signal to wrap.
 * @returns {AsyncState<T>} The async state representation.
 */
export function $async<T>(signal: State<T>): AsyncState<T> {
  const [result] = $asyncAction(() => signal.value)
  return result
}

/**
 * Signal utility that provides a value and a setter with immutability protections for objects.
 * @template T - The type of the signal.
 * @param {T} initialValue - The initial value of the signal.
 * @returns {[State<T>, (newValue: T) => void]} A tuple of the state and its setter.
 */
export function $<T>(initialValue: T): [State<T>, (newValue: T) => void] {
  const internalSignal = signal<T>(initialValue)

  const readonlySignal = $compute(() => {
    const value = internalSignal.value

    if (typeof value === 'object' && value !== null) {
      return new Proxy(value as T & object, {
        get(target, prop, receiver) {
          return Reflect.get(target, prop, receiver)
        },
        set(_target, prop) {
          console.warn(`Attempt to modify property '${String(prop)}' is not allowed.`)
          return true // TODO: return false in dev mode
        },
      })
    } else {
      return value
    }
  })

  const setValue = (newValue: T) => {
    internalSignal.value = newValue
  }

  return [readonlySignal, setValue]
}
