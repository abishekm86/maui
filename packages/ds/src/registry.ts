// TODO: automate keeping this file up to date
import { TemplateMetadataRegistry } from 'maui-core'

import { metadata as colorV1MaterialDetailed } from './templates/color.v1.material.detailed'
import { metadata as colorV1MaterialSummary } from './templates/color.v1.material.summary'
import { metadata as colorV2Material } from './templates/color.v2.material'
import { metadata as greetingV1Material } from './templates/greeting.v1.material'
import { metadata as listingV1Material } from './templates/listing.v1.material'

// import other template metadata files...

export const templateMetadataRegistry: TemplateMetadataRegistry = {
  'color.v1.material.detailed': colorV1MaterialDetailed,
  'color.v1.material.summary': colorV1MaterialSummary,
  'color.v2.material': colorV2Material,
  'greeting.v1.material': greetingV1Material,
  'listing.v1.material': listingV1Material,
}
