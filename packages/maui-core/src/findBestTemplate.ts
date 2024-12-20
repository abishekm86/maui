import { withCache } from './cache'
import { TemplateEntry, TemplateModule, searchMatrix, templateRegistry } from './types'

export const findBestTemplate = withCache(findBestTemplateInternal, { cacheLimit: 50 })

// TODO: implement exact match flag
// TODO: support weighted features
// TODO: support array of supported features in metadata
async function findBestTemplateInternal<U extends Record<string, string>>(
  templateName: string,
  requestedFeatures: U,
): Promise<TemplateModule | undefined> {
  const matchingTemplates = templateRegistry.filter(
    template => template.metadata.schema === templateName,
  )

  let bestTemplates: TemplateEntry[] = []
  let lowestPenalty = Infinity

  for (const template of matchingTemplates) {
    const penalty = calculatePenalty(requestedFeatures, template.metadata.features, searchMatrix)
    if (penalty < lowestPenalty) {
      lowestPenalty = penalty
      bestTemplates = [template]
    } else if (penalty < Infinity && penalty === lowestPenalty) {
      bestTemplates.push(template)
    }
  }

  if (bestTemplates.length === 0) {
    return matchingTemplates.length > 0
      ? await resolveTemplate(matchingTemplates[0]) // TODO: return most generic template instead
      : undefined
  }

  if (bestTemplates.length > 1) {
    // TODO: support tiebreaker
    // bestTemplates.sort((a, b) =>
    //   tieBreaker(...),
    // )
  }

  return await resolveTemplate(bestTemplates[0])
}

function calculatePenalty(
  requestedFeatures: { [key: string]: string },
  templateFeatures: { [key: string]: string },
  searchMatrix: Map<string, string[]>,
): number {
  let totalPenalty = 0

  for (const [feature, searchValues] of searchMatrix) {
    if (!searchValues?.length) {
      continue
    }

    let requestedValue = requestedFeatures[feature] ?? searchValues.at(-1) // search matrix ordered from most specific to most generic by feature
    const templateValue = templateFeatures[feature] ?? searchValues.at(-1)

    let requestedIndex = searchValues.indexOf(requestedValue)
    let templateIndex = searchValues.indexOf(templateValue)

    if (requestedIndex === -1) {
      // if a feature is not requested, or requested feature is not in search matrix, default to most generic value for the feature
      requestedIndex = searchValues.length - 1
    }

    if (templateIndex < requestedIndex) {
      // if template is more specific than requested, reject it
      totalPenalty = Infinity
    } else {
      const deviation = templateIndex - requestedIndex
      totalPenalty += deviation
    }

    if (totalPenalty === Infinity) {
      break // shortcircuit, since penalty is additive
    }
  }

  return totalPenalty
}

async function resolveTemplate(templateEntry: TemplateEntry): Promise<TemplateModule | undefined> {
  if (!templateEntry) return undefined

  const module = await templateEntry.templatePromise
  if (!module) return undefined

  return {
    template: module.template,
    metadata: templateEntry.metadata,
  }
}
