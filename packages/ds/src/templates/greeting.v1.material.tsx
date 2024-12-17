import { Typography } from '@mui/material'
import { $state, ProcessedConfig, Schema, Template } from 'maui-core'
import { Greeting } from 'src/schemas'
import { Metadata, TemplateFeatures } from 'src/types'

interface TemplateProps extends Schema<'greeting@1'> {
  message: Required<Greeting.v1['message']>
}

export const metadata: Metadata<Greeting.v1, TemplateProps> = {
  schema: 'greeting@1',
  features: {
    theme: 'material',
  },
  transform: config => {
    return {
      schema: 'greeting@1',
      message: {
        ...config.message,
        loading: config.message.loading ?? false,
        refreshing: config.message.refreshing ?? false,
        error: config.message.error ?? null,
      },
    }
  },
}

export const DetailedComponent = function ({
  value,
  refreshing,
  loading,
}: ProcessedConfig<TemplateProps['message']>) {
  const [show, setShow] = $state(true)

  const handleClick = () => {
    setShow(!show())
  }

  const Button = () => (
    <button onClick={handleClick}>{show() ? 'Hide Message' : 'Show Message'}</button>
  )
  const AsyncIndicator = () => (
    <span>{loading() ? 'loading...' : refreshing() ? 'refreshing...' : <br />}</span>
  )

  const Display = () => (
    <>
      {show() && (
        <div>
          <Typography variant="h5">
            Message: <b>{value() ?? '-'}</b>
          </Typography>
          <AsyncIndicator />
        </div>
      )}
    </>
  )

  return (
    <>
      <Button />
      <Display />
    </>
  )
}

export const SummaryComponent = function ({
  value,
  refreshing,
  loading,
}: ProcessedConfig<TemplateProps['message']>) {
  return (
    <div>
      <Typography variant="h4">
        <b>
          <span style={{ color: refreshing() ? '#ff0000' : '#000000' }}>
            {loading() ? '-' : (value() ?? '-')}
          </span>
        </b>
      </Typography>
    </div>
  )
}

export const template: Template<TemplateProps, TemplateFeatures> = function (
  { message },
  features,
) {
  return (
    <>
      <Typography variant="h6">Hello world.. this shouldn't rerender</Typography>
      {features?.density === 'summary' ? (
        // Tip: Dereferencing value will cause the containing component to renrender to change. Don't do this:
        // <Typography variant="h4">{size.value.value}</Typography>
        // Tip: Passing a signal directly instead of its value optimizes rendering
        <SummaryComponent {...message} />
      ) : (
        <DetailedComponent {...message} />
      )}
      <Typography variant="h6">And neither should this...</Typography>
    </>
  )
}
