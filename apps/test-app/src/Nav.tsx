// Nav.tsx
import { BaseConfig } from 'maui-core'

interface NavProps {
  configRegistry: Record<string, Omit<BaseConfig, 'id'>>
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
  )
}
