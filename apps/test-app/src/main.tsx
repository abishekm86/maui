import { templateMetadataRegistry } from 'ds'
import { registerSearchMatrix, registerTemplates } from 'maui-core'
import { render } from 'preact'

import { App } from './App'
import './assets/index.css'

async function initTemplates() {
  registerSearchMatrix(
    new Map([
      ['theme', ['chakra', 'material']],
      ['density', ['graphical', 'summary', 'detailed']],
      ['mode', ['dark', 'light']],
    ]),
  )

  const modules = import.meta.glob('/node_modules/ds/dist/templates/**/!(index).js')
  registerTemplates(templateMetadataRegistry, id => {
    const templateModuleFn = modules[`/node_modules/ds/dist/templates/${id}.js`]
    return templateModuleFn && templateModuleFn()
  })
}

async function main() {
  await initTemplates() // TODO: Global error handler

  const rootElement = document.getElementById('app')
  if (rootElement) {
    render(<App />, rootElement)
  }
}

main()
