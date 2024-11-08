import { JSX } from 'preact/jsx-runtime'
import { useState, useMemo } from 'preact/hooks'
import { findBestTemplate } from './findBestTemplate'
import { BaseConfig, TemplateModule } from './types'
import { processConfig } from './processConfig'

export interface TemplateRendererProps {
  config: BaseConfig
  id: string
  requestedFeatures?: { [key: string]: string }
  loadingFallback?: (config: string) => JSX.Element
  errorFallback?: (error: string) => JSX.Element
}

// TODO: template lifecycle - active; hidden; suspended - LRU cache
export function TemplateRenderer({
  config,
  id,
  requestedFeatures,
  loadingFallback = config => <div>Loading template for {config}...</div>,
  errorFallback = error => <div>Render Error: {error}</div>,
}: TemplateRendererProps) {
  const [templateModule, setTemplateModule] = useState<TemplateModule | null>(null)
  const [error, setError] = useState<string | null>(null)

  const schema = config.schema
  useMemo(() => {
    if (!requestedFeatures) {
      setError('Search criteria or template must be provided')
      return
    }

    findBestTemplate(schema, requestedFeatures)
      .then(module => {
        if (!module || !module.template || !module.metadata) {
          throw new Error(`No suitable template found`)
        }

        setTemplateModule({ template: module.template, metadata: module.metadata })
      })
      .catch(err => {
        setError(`Failed to load template for ${schema}: ${err.message}`)
      })
  }, [schema, requestedFeatures])

  if (error) {
    return errorFallback(error)
  }

  if (!templateModule) {
    return loadingFallback(schema)
  }

  const { template, metadata } = templateModule
  const processedConfig = processConfig(id, config.configFn, metadata?.transform)

  // TODO: pass in requested features to let template adjust dynamically
  return template!(processedConfig, requestedFeatures)
}
