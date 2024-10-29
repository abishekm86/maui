import { useState } from 'preact/hooks'
import { BaseConfig, TemplateRenderer } from 'maui-core'
import { configList } from './configRegistry'
import { Nav } from './Nav'
import { ErrorBoundary } from './ErrorBoundary'

export function App() {
  const [selectedConfig, setSelectedConfig] = useState<BaseConfig | null>(null)
  const [pinnedConfig, setPinnedConfig] = useState<BaseConfig | null>(null)

  const currentConfig = pinnedConfig ?? selectedConfig

  return (
    <div className="container">
      <nav>
        <h2>Configs</h2>
        <Nav
          configList={configList}
          pinnedConfig={pinnedConfig}
          setSelectedConfig={setSelectedConfig}
          setPinnedConfig={setPinnedConfig}
        />
      </nav>

      <div className="main-content">
        <div className="template-content">
          <h1>Selected Configuration</h1>
          {currentConfig && (
            <ErrorBoundary key={currentConfig.id}>
              <TemplateRenderer
                config={currentConfig}
                context={{ theme: 'material', density: 'summary' }}
              />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  )
}
