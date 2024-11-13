import { Typography } from '@mui/material'
import { Size } from 'src/schemas'
import { Template, Schema, ProcessedConfig, AsyncValue } from 'maui-core'
import { Metadata, TemplateFeatures } from 'src/types'

interface TemplateProps extends Schema<'size@1'> {
  size: Required<AsyncValue<number>>
}

export const metadata: Metadata<Size.v1, TemplateProps> = {
  schema: 'size@1',
  features: {
    theme: 'material',
  },
  transform: config => {
    return {
      schema: 'size@1',
      size: {
        ...config.size,
        loading: config.size.loading ?? false,
        refreshing: config.size.refreshing ?? false,
      },
    }
  },
}

export const DetailedComponent = function ({
  result,
  refreshing,
  loading,
}: ProcessedConfig<TemplateProps['size']>) {
  const AsyncIndicator = () => (
    <span>{refreshing.value ? 'refreshing...' : loading.value ? 'loading...' : <br />}</span>
  )
  return (
    <div>
      <Typography variant="h4">
        Value: <b>{loading.value ? '-' : (result.value.value ?? NaN)}</b>
      </Typography>
      <AsyncIndicator />
    </div>
  )
}

export const SummaryComponent = function ({
  result,
  refreshing,
  loading,
}: ProcessedConfig<TemplateProps['size']>) {
  return (
    <div>
      <Typography variant="h4">
        <b>
          <span style={{ color: refreshing.value ? '#ff0000' : '#000000' }}>
            {loading.value ? '-' : (result.value.value ?? NaN)}
          </span>
        </b>
      </Typography>
    </div>
  )
}

export const template: Template<TemplateProps, TemplateFeatures> = function ({ size }, features) {
  return (
    <>
      <Typography variant="h6">Hello world.. this shouldn't rerender</Typography>
      {features?.density === 'summary' ? (
        // Tip: Dereferencing value will cause the containing component to renrender to change. Don't do this:
        // <Typography variant="h4">{size.value.value}</Typography>
        // Tip: Passing a signal directly instead of its value optimizes rendering
        <SummaryComponent {...size} />
      ) : (
        <DetailedComponent {...size} />
      )}
      <Typography variant="h6">And neither should this...</Typography>
    </>
  )
}
