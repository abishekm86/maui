import { Typography } from '@mui/material'
import { Info } from 'src/schemas'
import { Template, TemplateMetadata } from 'maui-core'
import { TemplateFeatures } from 'src'

export const metadata: TemplateMetadata<Info.v1, TemplateFeatures> = {
  schema: 'info@1',
  features: {
    theme: 'material',
  },
  id: 'info.v1.material',
}

export const template: Template<Info.v1> = function ({ message }) {
  return (
    <Typography variant="h1">
      <b>{message.value}</b>
    </Typography>
  )
}
