const ts = require('typescript')
const path = require('path')
const fs = require('fs')

// Define the path to your main schemas file
const SCHEMAS_FILE_PATH = path.resolve('src/schemas/index.ts')

// Helper function to extract the schema value from the extended generic type (e.g., Schema<'color@1'>)
function extractSchemaFromHeritageClause(heritageClause, templates) {
  if (heritageClause && heritageClause.types) {
    heritageClause.types.forEach(type => {
      if (type.expression && type.expression.escapedText === 'Schema') {
        // Get the type argument passed to Schema, e.g., 'color@1'
        const schemaArgument = type.typeArguments && type.typeArguments[0]
        if (schemaArgument && ts.isLiteralTypeNode(schemaArgument) && schemaArgument.literal) {
          const schemaValue = schemaArgument.literal.text.replace(/'/g, '')
          templates.push(schemaValue)
          console.log(`Extracted schema '${schemaValue}' from extended Schema`)
        }
      }
    })
  }
}

// Recursively process nodes (handle namespaces, interfaces, imports, and exports)
function processNode(node, templates, fileName) {
  if (ts.isModuleDeclaration(node)) {
    // Handle namespaces (modules)
    if (node.body && ts.isModuleBlock(node.body)) {
      node.body.statements.forEach(childNode => processNode(childNode, templates, fileName))
    }
  } else if (ts.isInterfaceDeclaration(node)) {
    // Handle interfaces and extract schema from the heritage clause (extends clause)
    if (node.heritageClauses) {
      node.heritageClauses.forEach(clause => extractSchemaFromHeritageClause(clause, templates))
    }
  } else if (ts.isImportDeclaration(node)) {
    // Handle imports
    const importPath = node.moduleSpecifier.text
    const importedFilePath = resolveImportPath(importPath, fileName)
    if (importedFilePath && fs.existsSync(importedFilePath)) {
      extractTemplates(importedFilePath, templates) // Recursively extract templates from the imported file
    }
  } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
    // Handle exports (e.g., export * from './Color')
    const exportPath = node.moduleSpecifier.text
    const exportedFilePath = resolveImportPath(exportPath, fileName)
    if (exportedFilePath && fs.existsSync(exportedFilePath)) {
      extractTemplates(exportedFilePath, templates) // Recursively extract templates from the exported file
    }
  }
}

// Function to resolve the path of the imported or exported file
function resolveImportPath(importPath, currentFile) {
  let resolvedPath = ''
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    resolvedPath = path.resolve(path.dirname(currentFile), `${importPath}.ts`)
  }
  return resolvedPath
}

// Function to extract schema values from a file
function extractTemplates(fileName, templates = []) {
  const program = ts.createProgram([fileName], {})
  const sourceFile = program.getSourceFile(fileName)

  if (sourceFile) {
    // Traverse all nodes in the file, handling namespaces, interfaces, imports, and exports
    ts.forEachChild(sourceFile, node => processNode(node, templates, fileName))
  }

  return templates
}

// Function to validate schema values for uniqueness
function validateTemplates(templates) {
  const schemaRegistry = new Set()

  for (const schema of templates) {
    if (schemaRegistry.has(schema)) {
      throw new Error(`Duplicate schema found: '${schema}'`)
    }
    schemaRegistry.add(schema)
  }

  console.log('All schemas are valid.')
}

// Extract and validate schemas from the main schemas file
const templates = extractTemplates(SCHEMAS_FILE_PATH)
validateTemplates(templates)
