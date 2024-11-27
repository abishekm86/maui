import { Typography } from '@mui/material'
import { Template } from 'maui-core'
import { Color } from 'src/schemas'
import { Metadata } from 'src/types'

export const metadata: Metadata<Color.v1> = {
  schema: 'color@1',
  features: {
    theme: 'material',
    density: 'detailed',
  },
}

export const template: Template<Color.v1> = function ({ color, colorText }) {
  return (
    <Typography variant="h4">
      <b>
        <span style={{ color: color() }}>{colorText()}</span>
      </b>
    </Typography>
  )
}
