import { Box, Typography } from '@mui/material'
import { Schema, Template, Value } from 'maui-core'
import { Color } from 'src/schemas'
import { Metadata, TemplateFeatures } from 'src/types'

interface TransformedSchema extends Schema<'color@2'> {
  color: Value<string>
  colorText: Value<string>
  heading: Value<string>
}

export const metadata: Metadata<Color.v2, TransformedSchema> = {
  schema: 'color@2',
  features: {
    theme: 'material',
  },
  transform: config => {
    // transforms can be shared across templates
    return {
      schema: 'color@2',
      color: config.theme?.color ?? '#666666',
      colorText: config.theme?.colorText ?? 'grey',
      heading: config.heading ? config.heading().text : 'color',
    }
  },
}

export const template: Template<TransformedSchema, TemplateFeatures> = function (
  props,
  requestedFeatures,
) {
  const { color, colorText, heading } = props
  if (requestedFeatures?.density === 'summary') {
    return <Box style={{ backgroundColor: color(), padding: '24px' }} />
  } else {
    return (
      <Typography variant="h4">
        {`${heading()}: `}
        <span style={{ color: color() }}>
          <b>{colorText()}</b>
        </span>
      </Typography>
    )
  }
}
