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
}

export const template: Template<Color.v2> = function (config) {
  const { color = { value: '#666666' }, colorText = { value: 'grey' } } = config.theme ?? {}
  return (
    <Typography variant="h4">
      {`${config.heading ?? 'color'}: `}
      <span style={{ color: color.value }}>
        <b>{colorText.value}</b>
      </span>
    </Typography>
  )
}
