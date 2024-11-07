import { useState } from 'preact/hooks'
import { TemplateRenderer } from 'maui-core'
import { configRegistry } from './configRegistry'
import { Nav } from './Nav'
import { ErrorBoundary } from './ErrorBoundary'

export function App() {
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null)
  const [pinnedConfigId, setPinnedConfigId] = useState<string | null>(null)

  // Retrieve the current selected or pinned config from the registry
  const currentConfigId = pinnedConfigId || selectedConfigId || 'none'
  const currentConfig =
    (pinnedConfigId && configRegistry[pinnedConfigId]) ||
    (selectedConfigId && configRegistry[selectedConfigId]) ||
    null

  return (
    <div className="container">
      <nav>
        <h2>Configs</h2>
        <Nav
          configRegistry={configRegistry}
          pinnedConfigId={pinnedConfigId}
          setSelectedConfigId={setSelectedConfigId}
          setPinnedConfigId={setPinnedConfigId}
        />
      </nav>

      <div className="main-content">
        <div className="template-content">
          <h1>Selected Configuration</h1>
          {currentConfigId !== null && currentConfig && (
            <ErrorBoundary key={currentConfigId}>
              <TemplateRenderer
                config={currentConfig}
                id={currentConfigId}
                context={{ theme: 'material', density: 'detailed' }}
              />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  )
}
