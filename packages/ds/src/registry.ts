// TODO: automate keeping this file up to date
import { metadata as colorV1MaterialDetailed } from './templates/color.v1.material.detailed'
import { metadata as colorV2MaterialDetailed } from './templates/color.v2.material.detailed'
import { metadata as colorV1MaterialSummary } from './templates/color.v1.material.summary'
import { metadata as sizeV1MaterialDetailed } from './templates/size.v1.material.detailed'
import { TemplateMetadataRegistry } from 'maui-core'
// import other template metadata files...

export const templateMetadataRegistry: TemplateMetadataRegistry = {
  'color.v1.material.detailed': colorV1MaterialDetailed,
  'color.v1.material.summary': colorV1MaterialSummary,
  'color.v2.material.detailed': colorV2MaterialDetailed,
  'size.v1.material.detailed': sizeV1MaterialDetailed,
}
