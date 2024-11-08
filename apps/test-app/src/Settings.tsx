interface SettingsProps {
  density: string
  setDensity: (value: string) => void
  theme: string
  setTheme: (value: string) => void
}

export function Settings({ density, setDensity, theme, setTheme }: SettingsProps) {
  return (
    <div className="settings-toggle">
      <h3>Settings</h3>

      <span>
        <label>Density</label>
        <select value={density} onChange={e => setDensity(e.currentTarget.value)}>
          <option value="detailed">Detailed</option>
          <option value="summary">Summary</option>
        </select>
      </span>

      <span>
        <label>Theme</label>
        <select value={theme} onChange={e => setTheme(e.currentTarget.value)}>
          <option value="material">Material</option>
          <option value="chakra">Chakra</option>
        </select>
      </span>
    </div>
  )
}
