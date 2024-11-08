import { Box, Typography } from '@mui/material'
import { Color } from 'src/schemas'
import { Schema, Template, Value } from 'maui-core'
import { Metadata, TemplateFeatures } from 'src/types'

interface TemplateProps extends Schema<'color@2'> {
  color: Value<string>
  colorText: Value<string>
  heading: Value<string>
}

export const metadata: Metadata<Color.v2, TemplateProps> = {
  schema: 'color@2',
  features: {
    theme: 'material',
  },
  transform: config => {
    return {
      schema: 'color@2',
      color: config.theme?.color ?? '#6666',
      colorText: config.theme?.colorText ?? (() => 'grey'),
      heading: config.heading ?? (() => 'color'),
    }
  },
}

export const template: Template<TemplateProps, TemplateFeatures> = function (props, features) {
  const { color, colorText, heading } = props

  if (features?.density === 'summary') {
    return <Box style={{ backgroundColor: color.value, padding: '24px' }} />
  } else {
    return (
      <Typography variant="h4">
        {`${heading.value}: `}
        <span style={{ color: color.value }}>
          <b>{colorText.value}</b>
        </span>
      </Typography>
    )
  }
}
