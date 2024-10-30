import { Box } from '@mui/material'
import { Color } from 'src/schemas'
import { Template, TemplateMetadata } from 'maui-core'
import { TemplateFeatures } from 'src'

export const metadata: TemplateMetadata<Color.v1, TemplateFeatures> = {
  schema: 'color@1',
  features: {
    theme: 'material',
    density: 'summary',
  },
  id: 'color.v1.material.summary',
  defaults: {},
}

export const template: Template<Color.v1> = function ({ color }) {
  return <Box style={{ backgroundColor: color.value, padding: '24px' }} />
}
