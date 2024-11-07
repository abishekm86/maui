import {
  BaseTemplateMetadata,
  searchMatrix,
  TemplateEntry,
  TemplateMetadataRegistry,
  TemplateModule,
  templateRegistry,
} from './types'

export function registerSearchMatrix(newEntries: Map<string, string[]>) {
  newEntries.forEach((value, key) => {
    searchMatrix.set(key, value)
  })
}

function registerTemplate(
  templateMetadata: BaseTemplateMetadata,
  templateModule: Promise<unknown>,
) {
  const templateEntry: TemplateEntry = { metadata: templateMetadata }
  templateEntry.templatePromise = templateModule as Promise<TemplateModule> // optimistically assign, but validate when resolving
  templateRegistry.push(templateEntry)
}

export function registerTemplates(
  templateMetadataRegistry: TemplateMetadataRegistry,
  getTemplateModulePromise: (templateMetadataId: string) => Promise<unknown>,
) {
  for (const id in templateMetadataRegistry) {
    const templateMetadata = templateMetadataRegistry[id]
    try {
      const templateModule = getTemplateModulePromise(id)
      registerTemplate(templateMetadata, templateModule)
    } catch (error) {
      console.error(`Unable to load template: ${id}. Skipping...`)
    }
  }
}
