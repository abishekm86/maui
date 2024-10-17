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

export type Template<T extends Schema<string>> = (props: T) => VNode

export type BaseConfig = Config<Schema<string>>

export type BaseTemplateMetadata = TemplateMetadata<Schema<string>, Record<string, string>>

export type BaseTemplate = Template<Schema<string>>
