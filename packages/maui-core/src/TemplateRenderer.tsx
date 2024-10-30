import { JSX } from 'preact/jsx-runtime'
import { useState, useMemo } from 'preact/hooks'
import { findBestTemplate } from './findBestTemplate'
import { BaseConfig, TemplateModule } from './types'
import { processConfig } from './processConfig'

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
  loadingFallback = config => <div>Loading template for {config}...</div>,
  errorFallback = error => <div>Render Error: {error}</div>,
}: TemplateRendererProps) {
  const [templateModule, setTemplateModule] = useState<TemplateModule | null>(null)
  const [error, setError] = useState<string | null>(null)

  useMemo(() => {
    if (!context) {
      setError('Search criteria or template must be provided')
      return
    }

    findBestTemplate(config.schema, context)
      .then(module => {
        if (!module || !module.template || !module.metadata) {
          throw new Error(`No suitable template found`)
        }

        setTemplateModule({ template: module.template, metadata: module.metadata })
      })
      .catch(err => {
        setError(`Failed to load template for ${config.schema}: ${err.message}`)
      })
  }, [config.schema, context])

  if (error) {
    return errorFallback(error)
  }

  if (!templateModule) {
    return loadingFallback(config.schema)
  }

  const { template, metadata } = templateModule

  const processedConfig = processConfig(config, metadata!.defaults)

  return template!(processedConfig)
}
