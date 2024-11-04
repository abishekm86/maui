import { Signal } from '@preact/signals'
import { VNode } from 'preact'

export type Schema<T extends string> = {
  schema: T
}

export type Config<T extends Schema<string>> = T & {
  id: string
  schema: T['schema']
}

export type TemplateMetadata<T extends Schema<string>, U extends Record<string, string>> = {
  id: string
  schema: T['schema']
  features: U
}

export type Template<T extends Schema<string>> = (props: ProcessedConfig<T>) => VNode

export type BaseConfig = Config<Schema<string>>

export type BaseTemplateMetadata = TemplateMetadata<Schema<string>, Record<string, string>>

export type BaseTemplate = Template<Schema<string>>

// Template Registry types
export type TemplateModule = { template?: BaseTemplate; metadata?: BaseTemplateMetadata }

export type TemplateEntry = {
  metadata: BaseTemplateMetadata
  templatePromise?: Promise<TemplateModule>
}

export type TemplateMetadataRegistry = Record<string, BaseTemplateMetadata>

export type TemplateRegistry = TemplateEntry[]

export const templateRegistry: TemplateRegistry = []

export const searchMatrix = new Map<string, string[]>()

// Config value types
type Fn<T> = () => T

type Primitive = string | number | boolean | bigint | symbol

export type Value<T> = T extends Primitive ? T | Fn<T> | Signal<T> : Fn<T> | Signal<T>

export interface Async<T> {
  loading: boolean
  refreshing: boolean
  value?: T
  error: Error | null | undefined
}

// Helper types for processed configs
// TODO: handle array values

/* Test cases:
type Config<T> = {
  a?: T
  b: T
  c?: { d?: T, e: T }
  f: { g?: T, h: T }
}

ProcessedConfig<string> should be { a?: Signal<string>, ... }
ProcessedConfig<Value<string>> should be { a?: Signal<string>, ... }
ProcessedConfig<Async<string>> should be { a?: { loading: Signal<boolean>, ... }, ... }
ProcessedConfig<Value<Async<string>>> should be { a?: Signal<Async<string>>, ... }
*/
type IsValue<T> = [T] extends [Value<infer _U>] ? true : false

export type ProcessedConfig<T> = {
  [K in keyof T]: IsValue<Exclude<T[K], undefined>> extends true
    ? Exclude<T[K], undefined> extends Value<infer U>
      ? Signal<Exclude<U, undefined | Fn<U> | Signal<U>>>
      : never
    : Exclude<T[K], undefined> extends object
      ? ProcessedConfig<T[K]>
      : Signal<Exclude<T[K], undefined>>
}

// TODO: check for correctness and replace ProcessedConfig with this:
// type Required<T> = Exclude<T, undefined>
// export type SimplifiedProcessedConfig<T> = {
//   [K in keyof T]: [Required<T[K]>] extends [Value<infer U>]
//     ? Signal<Exclude<Required<U>, Fn<U> | Signal<U>>>
//     : Required<T[K]> extends object
//       ? SimplifiedProcessedConfig<T[K]>
//       : Signal<Required<T[K]>>
// }
