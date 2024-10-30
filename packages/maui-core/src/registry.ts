import {
  BaseTemplateMetadata,
  searchMatrix,
  TemplateEntry,
  TemplateMetadataRegistry,
  TemplateModule,
  templateRegistry,
} from './types'

export function createMetadataRegistry(metadataArray: BaseTemplateMetadata[]) {
  const metadataRegistry: Record<string, BaseTemplateMetadata> = {}
  for (const metadata of metadataArray) {
    if (metadata.id in metadataRegistry) {
      console.error(`Duplicate template id found during registration: ${metadata.id}. Skipping...`)
    } else {
      metadataRegistry[metadata.id] = metadata
    }
  }
  return metadataRegistry
}

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
  getTemplateModulePromise: (templateMetadata: BaseTemplateMetadata) => Promise<unknown>,
) {
  for (const id in templateMetadataRegistry) {
    const templateMetadata = templateMetadataRegistry[id]
    if (templateMetadata.id !== id) {
      console.error(`Malformed template metadata: ${templateMetadata.id}. Skipping...`)
      continue
    }
    try {
      const templateModule = getTemplateModulePromise(templateMetadata)
      registerTemplate(templateMetadata, templateModule)
    } catch (error) {
      console.error(`Unable to load template: ${id}. Skipping...`)
    }
  }
}

export async function resolveTemplate(
  templateEntry: TemplateEntry,
): Promise<TemplateModule | undefined> {
  if (!templateEntry) return undefined

  const module = await templateEntry.templatePromise
  if (!module) return undefined

  return {
    template: module.template,
    metadata: templateEntry.metadata,
  }
}
