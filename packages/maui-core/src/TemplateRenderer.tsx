import { JSX } from 'preact/jsx-runtime'
import { useState, useMemo } from 'preact/hooks'
import { findBestTemplate } from './findBestTemplate'
import { BaseConfig } from './types'

export interface TemplateRendererProps {
  config: BaseConfig
  context?: { [key: string]: string }
  loadingFallback?: (config: string) => JSX.Element
  errorFallback?: (error: string) => JSX.Element
}

// TODO: template lifecycle - active; hidden; suspended - LRU cache
export function TemplateRenderer({
  config,
  context,
  loadingFallback = config => <div>Loading template for {config}...</div>, // Default loading fallback
  errorFallback = error => <div>Render Error: {error}</div>, // Default error handler
}: TemplateRendererProps) {
  const [SelectedTemplate, setSelectedTemplate] = useState<JSX.ElementType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useMemo(() => {
    if (!context) {
      setError('Search criteria or template must be provided')
      return
    }

    findBestTemplate(config.schema, context)
      .then(template => {
        if (!template) {
          throw new Error(`No suitable template found`)
        }
        setSelectedTemplate(() => template as unknown as JSX.ElementType)
      })
      .catch(err => {
        setError(`Failed to load template for ${config.schema}: ${err.message}`)
      })
  }, [config.schema, context])

  if (error) {
    return errorFallback(error)
  }

  if (!SelectedTemplate) {
    return loadingFallback(config.schema)
  }

  return <SelectedTemplate {...config} />
}
