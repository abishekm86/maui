import { BaseConfig } from 'maui-core'

interface NavProps {
  configList: BaseConfig[]
  pinnedConfig: BaseConfig | null
  setSelectedConfig: (config: BaseConfig | null) => void
  setPinnedConfig: (config: BaseConfig | null) => void
}

export function Nav({ configList, pinnedConfig, setSelectedConfig, setPinnedConfig }: NavProps) {
  const handleConfigHover = (config: BaseConfig) => {
    if (!pinnedConfig) {
      setSelectedConfig(config)
    }
  }

  const handleConfigClick = (config: BaseConfig) => {
    if (pinnedConfig?.id === config.id) {
      setPinnedConfig(null)
    } else {
      setPinnedConfig(config)
    }
  }

  return (
    <ul>
      {configList.map(config => (
        <li
          key={config.id}
          onMouseEnter={() => handleConfigHover(config)}
          onClick={() => handleConfigClick(config)}
          className={pinnedConfig?.id === config.id ? 'pinned' : ''}
        >
          {config.id}
        </li>
      ))}
    </ul>
  )
}
