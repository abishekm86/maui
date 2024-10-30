import { Typography } from '@mui/material'
import { Color } from 'src/schemas'
import { Template, TemplateMetadata } from 'maui-core'
import { TemplateFeatures } from 'src'

export const metadata: TemplateMetadata<Color.v1, TemplateFeatures> = {
  schema: 'color@1',
  features: {
    theme: 'material',
    density: 'detailed',
  },
  id: 'color.v1.material.detailed',
  defaults: {},
}

export const template: Template<Color.v1> = function ({ color, colorText }) {
  return (
    <Typography variant="h4">
      <b>
        <span style={{ color: color.value }}> {colorText.value}</span>
      </b>
    </Typography>
  )
}
