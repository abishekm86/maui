import { Schema, TemplateMetadata } from 'maui-core'

type TemplateTheme = 'material' | 'chakra'
type TemplateDensity = 'summary' | 'compact' | 'detailed'
type TemplateMode = 'dark' | 'light'

type TemplateFeatures = {
  theme?: TemplateTheme
  density?: TemplateDensity
  mode?: TemplateMode
}

export type Metadata<
  Input extends Schema<string>,
  Output extends Schema<Input['schema']> = Input,
> = TemplateMetadata<TemplateFeatures, Input, Output>
