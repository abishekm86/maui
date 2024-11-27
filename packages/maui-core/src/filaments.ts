import { batch, computed, effect, signal, untracked } from '@preact/signals'

import { AsyncState, SIGNAL_GETTER, State } from './types'
import { defaultResult } from './utils'

type Trigger = () => void
type Dispose = () => void
type ComputeFunction<O> = (abort?: AbortSignal) => O | Promise<O>

export const $batch = batch

// Expose Signals using a combination of svelte rune syntax, with solidjs style getter and setter
export function $state<T>(initialValue: T): [State<T>, (newValue: T) => void] {
  const internalSignal = signal<T>(initialValue)

  const getValue = createGetterWithProxy(() => internalSignal.value)

  const setValue = (newValue: T) => {
    internalSignal.value = newValue
  }

  return [getValue, setValue]
}

export function $computed<T>(computeFn: () => T): State<T> {
  const getValue = createGetterWithProxy(computeFn)

  return getValue
}

export const $effect = effect

/**
 * Asynchronous action handler. Executes the provided function and returns its state.
 * @template O - The output type of the async computation.
 * @param {ComputeFunction<O>} fn - The function to compute asynchronously.
 * @returns {[AsyncState<O>, Trigger]} A tuple of the async state and a trigger function.
 */
export function $asyncEffect<O>(fn: ComputeFunction<O>): [AsyncState<O>, Trigger] {
  const [result, setResult] = $state(defaultResult<O>())
  const [loading, setLoading] = $state(true)
  const [refreshing, setRefreshing] = $state(false)
  const [triggerSignal, setTriggerSignal] = $state(0)
  // TODO: add last updated time

  let computationId = 0
  let abortController: AbortController | null = null

  const computedFn = $computed(() => fn)

  effect(() => {
    triggerSignal() // Ensure effect depends on triggerSignal

    computationId += 1
    const currentId = computationId

    // Abort any previous computation
    if (abortController) abortController.abort()
    abortController = new AbortController()

    const compute = async () => {
      try {
        const resultValue = await Promise.resolve(computedFn()(abortController!.signal))
        // Update result only if computation matches current ID and value has changed
        // TODO: support custom equality check
        if (currentId === computationId && resultValue !== result.peek().value) {
          setResult({ value: resultValue, error: null })
        }
      } catch (error: any) {
        if (error.name !== 'AbortError' && currentId === computationId) {
          // TODO: should we reset to undefined?
          setResult({
            value: result.peek().value,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      } finally {
        $batch(() => {
          setLoading(false)
          setRefreshing(false)
        })
      }
    }

    if (!loading.peek()) setRefreshing(true) // Mark as refreshing if not loading
    compute()
  })

  return [{ result, loading, refreshing }, () => setTriggerSignal(triggerSignal() + 1)]
}

/**
 * Updater effect handler, allowing manual triggering of a provided function.
 * @param {() => void} fn - The function to execute on trigger.
 * @returns {Trigger} A trigger function to manually control the effect.
 */
export function $mutate(fn: () => void): Trigger {
  const [triggerSignal, setTriggerSignal] = $state(0)
  let firstRun = true

  effect(() => {
    triggerSignal() // Ensure effect depends on triggerSignal
    if (!firstRun) untracked(fn) // run without subscribing to any signals referenced in fn
    firstRun = false
  })

  return () => setTriggerSignal(triggerSignal() + 1)
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

  if (options instanceof Function) {
    ;[cachedSignal, setCachedSignal] = $state<T>(options())
    conditionalValue = $computed(() => (condition() ? options() : cachedSignal()))
  } else {
    const { initialValue, $then, $else = prev => prev } = options as IfOptions<T>
    ;[cachedSignal, setCachedSignal] = $state<T>(initialValue)
    conditionalValue = $computed(() =>
      condition() ? $then(cachedSignal.peek()) : $else(cachedSignal.peek()),
    )
  }

  effect(() => setCachedSignal(conditionalValue()))
  return cachedSignal
}

/**
 * Asynchronous signal wrapper. Converts a signal into an async state.
 * @template T - The type of the signal's value.
 * @param {State<T>} signal - The state signal to wrap.
 * @returns {AsyncState<T>} The async state representation.
 */
export function $asAsync<T>(signal: () => T): AsyncState<T> {
  const [result] = $asyncEffect(() => signal())
  return result
}

// Return an immutable wrapper to prevent unintended mutation outside reactive chain
function createGetterWithProxy<T>(computeFn: () => T): State<T> & { [SIGNAL_GETTER]: true } {
  const computedSignal = computed(() => {
    const value = computeFn()

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        // Create a Proxy specifically for arrays
        return new Proxy(value as unknown as T & any[], arrayProxyHandler)
      } else {
        // Create a Proxy for objects
        return new Proxy(value as T & object, objectProxyHandler)
      }
    } else {
      return value
    }
  })

  const getValue = () => computedSignal.value

  getValue.peek = () => computedSignal.peek()
  getValue[SIGNAL_GETTER] = true

  return getValue as State<T> & { [SIGNAL_GETTER]: true }
}

const objectProxyHandler: ProxyHandler<object> = {
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver)
  },
  set(_target, prop) {
    console.warn(`Attempt to modify property '${String(prop)}' is not allowed.`)
    return true // TODO: return false in dev mode
  },
}

const arrayProxyHandler: ProxyHandler<any[]> = {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver)

    if (typeof value === 'function') {
      // If it's a function (method), check if it's a mutating method
      return function (...args: any[]) {
        const mutatingMethods = [
          'copyWithin',
          'fill',
          'pop',
          'push',
          'reverse',
          'shift',
          'sort',
          'splice',
          'unshift',
          // And any other mutating methods
        ]

        if (mutatingMethods.includes(prop as string)) {
          console.warn(`Attempt to modify array using method '${String(prop)}' is not allowed.`)
          return receiver // Return the proxy itself to maintain chainability
        } else {
          // For non-mutating methods, call the method normally
          return value.apply(target, args)
        }
      }
    } else {
      // For non-function properties, return the value
      return value
    }
  },
  set(_target, prop) {
    console.warn(`Attempt to modify property '${String(prop)}' is not allowed.`)
    return true // TODO: return false in dev mode
  },
}
