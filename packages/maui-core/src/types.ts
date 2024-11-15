import { ReadonlySignal } from '@preact/signals'
import { VNode } from 'preact'

export type Schema<T extends string> = {
  schema: T
}

export type Config<T extends Schema<string>> = {
  schema: T['schema']
  configFn: () => Omit<T, 'schema'>
}

export type TemplateMetadata<
  Features extends Record<string, string>,
  Input extends Schema<string>,
  Output extends Schema<Input['schema']> = Input,
> = {
  schema: Input['schema']
  features: Features
  transform?: <T extends Input = Input>(config: Omit<T, 'schema'>) => Output
}

export type Template<
  T extends Schema<string>,
  F extends Record<string, string> = Record<string, string>,
> = (props: ProcessedConfig<T>, requestedFeatures?: F) => VNode

export type BaseConfig = Config<Schema<string>>

export type BaseTemplateMetadata = TemplateMetadata<Record<string, string>, Schema<string>>

export type BaseTemplate = Template<Schema<string>>

// Template Registry types
export type TemplateModule = { template?: BaseTemplate; metadata?: BaseTemplateMetadata }

export type TemplateEntry = {
  metadata: BaseTemplateMetadata
  templatePromise?: Promise<TemplateModule>
}

export type ConfigRegistry = Record<string, BaseConfig>

export type TemplateMetadataRegistry = Record<string, BaseTemplateMetadata>

export type TemplateRegistry = TemplateEntry[]

export const templateRegistry: TemplateRegistry = []

export const searchMatrix = new Map<string, string[]>()

// Config value types
type Fn<T> = () => T

type Primitive = string | number | boolean | bigint | symbol

export type Value<T> = [T] extends [Primitive] ? T | Fn<T> | State<T> : Fn<T> | State<T>

export interface Result<T> {
  value?: T
  error?: Error | null
}

export interface AsyncValue<T> {
  result: Value<Result<T>>
  loading?: Value<boolean>
  refreshing?: Value<boolean>
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

ProcessedConfig<string> should be { a?: State<string>, ... }
ProcessedConfig<Value<string>> should be { a?: State<string>, ... }
ProcessedConfig<Async<string>> should be { a?: { loading: State<boolean>, ... }, ... }
ProcessedConfig<Value<Async<string>>> should be { a?: State<Async<string>>, ... }
*/
export type State<T> = ReadonlySignal<T>

export interface AsyncState<T> {
  result: State<Result<T>>
  loading?: State<boolean>
  refreshing?: State<boolean>
}

type IsValue<T> = [T] extends [Value<infer _U>] ? true : false

export type ProcessedConfig<T> = {
  [K in keyof T]: IsValue<Exclude<T[K], undefined>> extends true
    ? Exclude<T[K], undefined> extends Value<infer U>
      ? State<Exclude<U, undefined | Fn<U> | State<U>>>
      : never
    : Exclude<T[K], undefined> extends object
      ? ProcessedConfig<T[K]>
      : State<Exclude<T[K], undefined>>
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
