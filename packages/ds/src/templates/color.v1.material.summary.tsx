import { Box } from '@mui/material'
import { Color } from 'src/schemas'
import { Template } from 'maui-core'
import { Metadata } from 'src/types'

export const metadata: Metadata<Color.v1> = {
  schema: 'color@1',
  features: {
    theme: 'material',
    density: 'summary',
  },
}

export const template: Template<Color.v1> = function ({ color }) {
  return <Box style={{ backgroundColor: color.value, padding: '24px' }} />
}
