import { Typography } from '@mui/material'
import { Size } from 'src/schemas'
import { Template } from 'maui-core'
import { Metadata } from 'src/types'

export const metadata: Metadata<Size.v1> = {
  schema: 'size@1',
  features: {
    theme: 'material',
    density: 'detailed',
  },
}

// @ts-ignore
export const CustomComponent = function ({ size }) {
  return (
    <div>
      <Typography variant="h4">
        Value:{' '}
        <b>
          {size.value.loading ? (
            'loading...'
          ) : (
            <span style={{ color: size.value.refreshing ? '#ff0000' : '#000000' }}>
              {size.value.value}
            </span>
          )}
        </b>
      </Typography>
    </div>
  )
}

export const template: Template<Size.v1> = function ({ size }) {
  return (
    <>
      <Typography variant="h6">Hello world.. this shouldn't rerender</Typography>
      {/* Passing a signal directly  instead of its value optimizes rendering */}
      <CustomComponent size={size} />
      <Typography variant="h6">And neither should this...</Typography>
    </>
  )
}
