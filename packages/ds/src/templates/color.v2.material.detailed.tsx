import { Typography } from '@mui/material'
import { Color } from 'src/schemas'
import { Template, TemplateMetadata } from 'maui-core'
import { TemplateFeatures } from 'src'

export const metadata: TemplateMetadata<Color.v2, TemplateFeatures> = {
  schema: 'color@2',
  features: {
    theme: 'material',
    density: 'detailed',
  },
  id: 'color.v2.material.detailed',
  defaults: {
    theme: {
      color: '#666666',
      colorText: 'grey',
    },
    heading: 'color',
  },
}

export const template: Template<Color.v2> = function ({ theme, heading }) {
  const { color, colorText } = theme
  return (
    <Typography variant="h4">
      {`${heading.value}: `}
      <span style={{ color: color.value }}>
        <b>{colorText.value}</b>
      </span>
    </Typography>
  )
}
