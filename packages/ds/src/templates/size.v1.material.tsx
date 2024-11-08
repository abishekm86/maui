import { Typography } from '@mui/material'
import { Size } from 'src/schemas'
import { Template, Async, ProcessedConfig, Value } from 'maui-core'
import { Metadata, TemplateFeatures } from 'src/types'

export const metadata: Metadata<Size.v1> = {
  schema: 'size@1',
  features: {
    theme: 'material',
  },
}

// TODO: simplify typing this:
export const DetailedComponent = function ({
  size,
}: ProcessedConfig<{ size: Value<Async<number>> }>) {
  return (
    <div>
      <Typography variant="h4">
        Value: <b>{size.value.loading ? '-' : size.value.value}</b>
      </Typography>
      <span>
        {size.value.refreshing ? 'refreshing...' : size.value.loading ? 'loading...' : <br />}
      </span>
    </div>
  )
}

export const SummaryComponent = function ({
  size,
}: ProcessedConfig<{ size: Value<Async<number>> }>) {
  return (
    <div>
      <Typography variant="h4">
        <b>
          <span style={{ color: size.value.refreshing ? '#ff0000' : '#000000' }}>
            {size.value.loading ? '-' : size.value.value}
          </span>
        </b>
      </Typography>
    </div>
  )
}

export const template: Template<Size.v1, TemplateFeatures> = function ({ size }, features) {
  return (
    <>
      <Typography variant="h6">Hello world.. this shouldn't rerender</Typography>
      {features?.density === 'summary' ? (
        // Tip: Dereferencing value will cause the containing component to renrender to change. Don't do this:
        // <Typography variant="h4">{size.value.value}</Typography>
        // Tip: Passing a signal directly instead of its value optimizes rendering
        <SummaryComponent size={size} />
      ) : (
        <DetailedComponent size={size} />
      )}
      <Typography variant="h6">And neither should this...</Typography>
    </>
  )
}
