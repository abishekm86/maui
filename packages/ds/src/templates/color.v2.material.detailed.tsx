import { Typography } from '@mui/material'
import { Color } from 'src/schemas'
import { Schema, Template, Value } from 'maui-core'
import { Metadata } from 'src'

interface TemplateProps extends Schema<'color@2'> {
  color: Value<string>
  colorText: Value<string>
  heading: Value<string>
}

export const metadata: Metadata<Color.v2, TemplateProps> = {
  schema: 'color@2',
  features: {
    theme: 'material',
    density: 'detailed',
  },
  id: 'color.v2.material.detailed',
  transform: config => {
    return {
      schema: 'color@2',
      color: config.theme?.color ?? '#6666',
      colorText: config.theme?.colorText ?? 'grey',
      heading: config.heading ?? 'colour',
    }
  },
}

export const template: Template<TemplateProps> = function (props) {
  const { color, colorText, heading } = props
  return (
    <Typography variant="h4">
      {`${heading}: `}
      <span style={{ color: color.value }}>
        <b>{colorText.value}</b>
      </span>
    </Typography>
  )
}
