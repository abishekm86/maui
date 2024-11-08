import { useState } from 'preact/hooks'
import { TemplateRenderer } from 'maui-core'
import { configRegistry } from './configRegistry'
import { Nav } from './Nav'
import { ErrorBoundary } from './ErrorBoundary'
import { Settings } from './Settings'

export function App() {
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null)
  const [pinnedConfigId, setPinnedConfigId] = useState<string | null>(null)
  const [density, setDensity] = useState<'detailed' | 'summary'>('detailed')
  const [theme, setTheme] = useState<'material' | 'chakra'>('material')

  // Retrieve the current selected or pinned config from the registry
  const currentConfigId = pinnedConfigId || selectedConfigId || 'none'
  const currentConfig =
    (pinnedConfigId && configRegistry[pinnedConfigId]) ||
    (selectedConfigId && configRegistry[selectedConfigId]) ||
    null

  return (
    <div className="container">
      <nav>
        <Nav
          configRegistry={configRegistry}
          pinnedConfigId={pinnedConfigId}
          setSelectedConfigId={setSelectedConfigId}
          setPinnedConfigId={setPinnedConfigId}
        />
        {/* @ts-ignore */}
        <Settings density={density} setDensity={setDensity} theme={theme} setTheme={setTheme} />
      </nav>

      <div className="main-content">
        <div className="template-content">
          <h1>Selected Configuration</h1>
          {currentConfigId !== null && currentConfig && (
            <ErrorBoundary key={currentConfigId}>
              <TemplateRenderer
                config={currentConfig}
                id={currentConfigId}
                requestedFeatures={{ theme, density }}
              />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  )
}
