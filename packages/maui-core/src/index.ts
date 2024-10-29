export * from './TemplateRenderer'
export type { Schema, Config, TemplateMetadata, Template, BaseConfig } from './types'
export { createMetadataRegistry, registerTemplates, registerSearchMatrix } from './registry'
export { applyDefaults, withDefaults } from './defaults'
export type { Defaults, DeepRequired } from './defaults'
