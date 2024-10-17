import { Typography } from '@mui/material'
import { Size } from 'src/schemas'
import { Template, TemplateMetadata } from 'maui-core'
import { TemplateFeatures } from 'src'

export const metadata: TemplateMetadata<Size.v1, TemplateFeatures> = {
  schema: 'size@1',
  features: {
    theme: 'material',
    density: 'detailed',
  },
  id: 'size.v1.material.detailed',
}

export const template: Template<Size.v1> = function ({ size }) {
  return (
    <Typography variant="h4">
      <b>{size}</b>
    </Typography>
  )
}
