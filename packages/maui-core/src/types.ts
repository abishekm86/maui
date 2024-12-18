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
> = (props: ProcessedConfig<T>, requestedFeatures: F) => VNode

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

export interface AsyncValue<T> {
  value: Value<T>
  error?: Value<Error | null>
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
export type State<T> = {
  (): T
  peek: () => T
  [IS_SIGNAL]: true
}

export const IS_SIGNAL = Symbol('Signal Getter')

export type AsyncFn<T> = (signal: AbortSignal) => Promise<T>

export type Chainable<T> = {
  transform<U>(fn: (value: T) => U): ChainableState<U>
  // do(fn: (value: T) => void): ChainableState<T>
  await<U>(fn: (value: T, signal: AbortSignal) => Promise<U>): ChainableAsyncState<U | undefined>
}

export type ChainableState<T> = State<T> & Chainable<T>

export type ArrayState<T, K> = {
  length: () => number
  keys: () => K[]
  get: (key: K) => T | undefined
  at: (index: number) => T | undefined
  set: (items: T[]) => void
}

interface ChainableAsync<T> {
  transform<U>(fn: (value: T) => U): ChainableAsyncState<U>
}

export interface AsyncState<T> {
  value: ChainableState<T>
  error: ChainableState<Error | null>
  loading: ChainableState<boolean>
  refreshing: ChainableState<boolean>
  refresh: Trigger
}

export type ChainableAsyncState<T> = AsyncState<T> & ChainableAsync<T>

export type Trigger = () => void

type IsValue<T> = [T] extends [Value<infer _U>] ? true : false

export type ProcessedConfig<T> = {
  [K in keyof T]: IsValue<Exclude<T[K], undefined>> extends true
    ? Exclude<T[K], undefined> extends Value<infer U>
      ? State<Exclude<U, Fn<U> | State<U>>>
      : never
    : Exclude<T[K], undefined> extends object //  TODO: does this support arrays?
      ? ProcessedConfig<T[K]>
      : State<T[K]> // TODO: when is this branch met?
}
