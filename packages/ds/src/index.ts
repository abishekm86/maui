import { createMetadataRegistry } from 'maui-core'

export * from './schemas'

type TemplateTheme = 'material' | 'chakra'
type TemplateDensity = 'summary' | 'compact' | 'detailed'
type TemplateMode = 'dark' | 'light'

export type TemplateFeatures = {
  theme?: TemplateTheme
  density?: TemplateDensity
  mode?: TemplateMode
}

// TODO: automate keeping this file up to date
import { metadata as colorV1MaterialDetailed } from './templates/color.v1.material.detailed'
import { metadata as colorV2MaterialDetailed } from './templates/color.v2.material.detailed'
import { metadata as colorV1MaterialSummary } from './templates/color.v1.material.summary'
import { metadata as sizeV1MaterialDetailed } from './templates/size.v1.material.detailed'
import { metadata as infoV1Material } from './templates/info.v1.material'
// import other template metadata files...

export const templateMetadataRegistry = createMetadataRegistry([
  colorV1MaterialDetailed,
  colorV2MaterialDetailed,
  colorV1MaterialSummary,
  sizeV1MaterialDetailed,
  infoV1Material,
])
