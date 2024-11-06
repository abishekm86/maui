import { createMetadataRegistry, Schema, TemplateMetadata } from 'maui-core'

export * from './schemas'

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

// TODO: automate keeping this file up to date
import { metadata as colorV1MaterialDetailed } from './templates/color.v1.material.detailed'
import { metadata as colorV2MaterialDetailed } from './templates/color.v2.material.detailed'
import { metadata as colorV1MaterialSummary } from './templates/color.v1.material.summary'
import { metadata as sizeV1MaterialDetailed } from './templates/size.v1.material.detailed'
// import other template metadata files...

export const templateMetadataRegistry = createMetadataRegistry([
  colorV1MaterialDetailed,
  colorV2MaterialDetailed,
  colorV1MaterialSummary,
  sizeV1MaterialDetailed,
])
