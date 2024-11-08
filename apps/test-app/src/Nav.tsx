// Nav.tsx
import { ConfigRegistry } from 'maui-core'

interface NavProps {
  configRegistry: ConfigRegistry
  pinnedConfigId: string | null
  setSelectedConfigId: (id: string | null) => void
  setPinnedConfigId: (id: string | null) => void
}

export function Nav({
  configRegistry,
  pinnedConfigId,
  setSelectedConfigId,
  setPinnedConfigId,
}: NavProps) {
  const handleConfigHover = (id: string) => {
    if (!pinnedConfigId) {
      setSelectedConfigId(id)
    }
  }

  const handleConfigClick = (id: string) => {
    if (pinnedConfigId === id) {
      setPinnedConfigId(null)
    } else {
      setPinnedConfigId(id)
    }
  }

  return (
    <>
      <h3>Configs</h3>
      <ul>
        {Object.entries(configRegistry).map(([id]) => (
          <li
            key={id}
            onMouseEnter={() => handleConfigHover(id)}
            onClick={() => handleConfigClick(id)}
            className={pinnedConfigId === id ? 'pinned' : ''}
          >
            {id}
          </li>
        ))}
      </ul>
    </>
  )
}
