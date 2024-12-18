import { batch } from '@preact/signals'

import { Trigger } from '../types'

type Dispose = () => void

/**
 * Create a triggerable action.
 * @param {() => void} fn - The function to execute on trigger.
 * @returns {Trigger} A trigger function to manually control the effect.
 */
export function $action(fn: () => void): Trigger {
  const trigger = () => batch(fn) // Batch updates inside the trigger

  return trigger
}

/**
 * Unified function for periodic or single invocation of a trigger function.
 * @param {Trigger} trigger - The function to invoke.
 * @param {Object} [options] - Options to control the behavior of the invocation.
 * @param {number} [options.interval] - Interval time in milliseconds for periodic invocation.
 * @param {number} [options.delay] - Delay in milliseconds before invoking the trigger (for single invocation).
 * @returns {Dispose| void} If interval is provided, returns a stop function to clear the interval. Otherwise, returns void.
 */
export function $invoke(
  trigger: Trigger,
  options?: { interval?: number; delay?: number; stopAfter?: number }, // TODO: support startAfter, startWhen, stopWhen, restart
): Dispose {
  const { interval, delay, stopAfter = 0 } = options || {}
  // TODO: create an event loop to sync and batch invocations
  if (interval !== undefined) {
    const intervalId = setInterval(trigger, interval)
    const stop = () => clearInterval(intervalId)
    if (stopAfter > 0) setTimeout(stop, stopAfter)
    return stop
  } else if (delay !== undefined) {
    setTimeout(trigger, delay)
    return () => {}
  } else {
    trigger()
    return () => {}
  }
}
