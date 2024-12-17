import { batch, effect, untracked } from '@preact/signals'

import { Trigger, createTrigger } from './utils'

type Dispose = () => void

/**
 * Create a triggerable action.
 * @param {() => void} fn - The function to execute on trigger.
 * @returns {Trigger} A trigger function to manually control the effect.
 */
export function $action(fn: () => void): Trigger {
  const [triggerSignal, trigger] = createTrigger()

  effect(() => {
    // Run only if triggered
    if (triggerSignal.value > 0) batch(() => untracked(fn)) // run without subscribing to any signals referenced in fn
  })

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
  options?: { interval?: number; delay?: number },
): Dispose {
  // TODO: batch invocations
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
