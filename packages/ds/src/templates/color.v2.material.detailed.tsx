import { Typography } from '@mui/material'
import { Color } from 'src/schemas'
import { Template, TemplateMetadata, Defaults, withDefaults } from 'maui-core'
import { TemplateFeatures } from 'src'

export const metadata: TemplateMetadata<Color.v2, TemplateFeatures> = {
  schema: 'color@2',
  features: {
    theme: 'material',
    density: 'detailed',
  },
  id: 'color.v2.material.detailed',
}

const defaults: Defaults<Color.v2> = {
  theme: {
    color: '#666666',
    colorText: 'grey',
  },
  heading: 'color',
}

export const template: Template<Color.v2> = withDefaults(defaults, config => {
  const { theme, heading } = config
  const { color, colorText } = theme
  return (
    <Typography variant="h4">
      {`${heading}: `}
      <span style={{ color }}>
        <b>{colorText}</b>
      </span>
    </Typography>
  )
})
