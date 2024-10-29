import { JSX } from 'preact'

// Helper types for Template Defaults
type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never
}[keyof T]

type Requireds<T> = {
  [K in keyof T]-?: T[K] extends object ? Defaults<T[K]> : never
}

type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K]
}

export type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T

export type Defaults<T extends object> = DeepRequired<Pick<T, OptionalKeys<T>>> &
  OmitNever<Requireds<T>>

export function applyDefaults<T extends object>(config: T, defaults: Defaults<T>): DeepRequired<T> {
  const result = { ...config } as any

  const keys = Object.keys(defaults) as Array<keyof Defaults<T>>
  for (const key of keys) {
    const defaultValue = defaults[key]
    const configValue = result[key]

    if (configValue === undefined) {
      result[key] = defaultValue
    } else if (
      typeof defaultValue === 'object' &&
      defaultValue !== null &&
      typeof configValue === 'object' &&
      configValue !== null &&
      !Array.isArray(defaultValue) && // TODO: support merging arrays
      !Array.isArray(configValue)
    ) {
      // Use type assertions to 'any' to prevent deep type instantiation
      result[key] = applyDefaults(configValue as any, defaultValue as any) as any
    }
    // Else, keep the config value (no action needed for primitives)
  }

  return result as DeepRequired<T>
}

// TODO: cache full configs?
export function withDefaults<T extends object>(
  defaults: Defaults<T>,
  template: (config: DeepRequired<T>) => JSX.Element,
): (config: T) => JSX.Element {
  return function (config: T) {
    const fullConfig = applyDefaults(config, defaults)
    return template(fullConfig)
  }
}
