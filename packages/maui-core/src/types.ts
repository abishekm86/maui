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
  defaults: Defaults<T>
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
export type Value<T> = T | (() => T) | Signal<T>

// Helper types for processed configs
// TODO: handle array values
// TODO: testing
type IsPrimitive<T> = T extends string | number | boolean | bigint | symbol | null | undefined
  ? true
  : false

type Transform<T> = [T] extends [never]
  ? never
  : T extends (...args: any[]) => infer U
    ? { value: U }
    : T extends Signal<infer U>
      ? { value: U }
      : IsPrimitive<T> extends true
        ? { value: T }
        : T extends object
          ? ProcessedConfig<T>
          : { value: T }

export type ProcessedConfig<T> = {
  [K in keyof T]-?: Transform<Exclude<T[K], undefined>>
}

// Helper types for template defaults
// TODO: handle array values
// TODO: testing
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
