/**
 * ClassEntry represents a single class entry from the markdown table
 */
export interface ClassEntry {
  status: string
  identifier: string
  contentHash: string
  alias: string
  catalogued: string
  processed: string
  reviewLayer: string
  class: string
  file: string
  type: string
  layer: string
  description: string
  /** Extra columns beyond the 12 standard fields, preserved as-is on re-generation */
  extraFields?: string[]
}

/**
 * ComparisonResult represents the result of comparing two class sets
 */
export interface ComparisonResult {
  newClasses: ClassEntry[]
  changedClasses: ClassChanges[]
  deletedClasses: ClassEntry[]
  unchangedCount: number
}

/**
 * ClassChanges represents a class that has changed content
 */
export interface ClassChanges {
  identifier: string
  class: string
  file: string
  oldContentHash: string
  newContentHash: string
}

/**
 * Status constants
 */
export const Status = {
  NEW: 'NEW',
  CHANGED: 'CHANGED',
  DELETED: 'DELETED',
  MOVED: 'MOVED',
  RENAMED: 'RENAMED',
  UNCHANGED: ''
} as const

/**
 * MarkdownParser parses markdown table content into ClassEntry arrays
 */
export class MarkdownParser {
  /**
   * Parses a markdown table string into an array of ClassEntry
   */
  parseMarkdownTable(markdownContent: string): ClassEntry[] {
    const entries: ClassEntry[] = []
    const lines = markdownContent.split('\n')

    let lineNumber = 0
    for (const line of lines) {
      const trimmedLine = line.trim()
      lineNumber++

      // Skip header and separator lines
      if (lineNumber <= 2 || trimmedLine === '') {
        continue
      }

      // Parse table row
      const entry = this.parseTableRow(trimmedLine)
      if (entry) {
        entries.push(entry)
      }
    }

    return entries
  }

  /**
   * Parses a single table row into a ClassEntry
   */
  private parseTableRow(line: string): ClassEntry | null {
    // Remove leading and trailing pipes and spaces
    line = line.replace(/^\|\s*|\s*\|$/g, '')

    // Skip empty lines
    if (line === '') {
      return null
    }

    // Split by pipe and clean each field
    const fields = line.split('|').map(f => f.trim())

    // Handle tables with Status + Review layer (12+ fields), Status only (11+ fields), or neither (10+ fields)
    if (fields.length >= 12) {
      // New format with Status column and Review layer column
      return {
        status: fields[0],
        identifier: fields[1],
        contentHash: fields[2],
        alias: fields[3],
        catalogued: fields[4],
        processed: fields[5],
        reviewLayer: fields[6],
        class: fields[7],
        file: fields[8],
        type: fields[9],
        layer: fields[10],
        description: fields[11],
        extraFields: fields.slice(12)
      }
    } else if (fields.length >= 11) {
      // Old format with Status column but without Review layer
      return {
        status: fields[0],
        identifier: fields[1],
        contentHash: fields[2],
        alias: fields[3],
        catalogued: fields[4],
        processed: fields[5],
        reviewLayer: '',
        class: fields[6],
        file: fields[7],
        type: fields[8],
        layer: fields[9],
        description: fields[10],
        extraFields: fields.slice(11)
      }
    } else if (fields.length >= 10) {
      // Very old format without Status column
      return {
        status: '', // Empty status for old format
        identifier: fields[0],
        contentHash: fields[1],
        alias: fields[2],
        catalogued: fields[3],
        processed: fields[4],
        reviewLayer: '',
        class: fields[5],
        file: fields[6],
        type: fields[7],
        layer: fields[8],
        description: fields[9],
        extraFields: fields.slice(10)
      }
    } else {
      throw new Error(`Expected at least 10 fields, got ${fields.length}`)
    }
  }
}

/**
 * HashComparer compares two sets of class entries
 */
export class HashComparer {
  /**
   * Determines status comparing old and new entries using dual comparison logic
   */
  determineStatus(oldEntries: ClassEntry[], newEntries: ClassEntry[]): ClassEntry[] {
    // Create maps for efficient lookup
    const oldByIdentifier = new Map<string, ClassEntry>()
    const oldByContentHash = new Map<string, ClassEntry>()
    const processedOldEntries = new Set<string>()

    for (const entry of oldEntries) {
      oldByIdentifier.set(entry.identifier, entry)
      oldByContentHash.set(entry.contentHash, entry)
    }

    const resultEntries: ClassEntry[] = []

    // Process new entries with dual comparison
    for (const newEntry of newEntries) {
      const entryCopy = { ...newEntry } // Create a copy to modify
      const status = this.determineSingleEntryStatus(
        newEntry,
        oldByIdentifier,
        oldByContentHash,
        processedOldEntries
      )
      entryCopy.status = status

      // Preserve user-edited columns from the old entry for non-NEW rows
      if (status !== Status.NEW) {
        const oldEntry = oldByIdentifier.get(newEntry.identifier)
          ?? oldByContentHash.get(newEntry.contentHash)
        if (oldEntry) {
          entryCopy.catalogued = oldEntry.catalogued
          entryCopy.processed = oldEntry.processed
          entryCopy.reviewLayer = oldEntry.reviewLayer
          entryCopy.type = oldEntry.type
          entryCopy.layer = oldEntry.layer
          entryCopy.description = oldEntry.description
          entryCopy.extraFields = oldEntry.extraFields
        }
      }

      resultEntries.push(entryCopy)
    }

    return resultEntries
  }

  /**
   * Determines the status of a single entry using dual comparison
   */
  private determineSingleEntryStatus(
    newEntry: ClassEntry,
    oldByIdentifier: Map<string, ClassEntry>,
    oldByContentHash: Map<string, ClassEntry>,
    processedOldEntries: Set<string>
  ): string {
    // Case 1: Exact match (same identifier and content)
    const oldEntryById = oldByIdentifier.get(newEntry.identifier)
    if (oldEntryById) {
      processedOldEntries.add(newEntry.identifier)
      if (oldEntryById.contentHash === newEntry.contentHash) {
        return Status.UNCHANGED
      } else {
        return Status.CHANGED
      }
    }

    // Case 2: Same content, different identifier (moved/renamed)
    const oldEntryByContent = oldByContentHash.get(newEntry.contentHash)
    if (oldEntryByContent) {
      if (!processedOldEntries.has(oldEntryByContent.identifier)) {
        processedOldEntries.add(oldEntryByContent.identifier)
        return this.classifyMoveOrRename(oldEntryByContent, newEntry)
      }
    }

    // Case 3: New entry (no match by identifier or content)
    return Status.NEW
  }

  /**
   * Classifies if an entry was moved or renamed
   */
  private classifyMoveOrRename(oldEntry: ClassEntry, newEntry: ClassEntry): string {
    // Extract path and class name from the entries
    const [oldPath, oldClass] = this.extractPathAndClass(oldEntry)
    const [newPath, newClass] = this.extractPathAndClass(newEntry)

    // Same class name, different path = MOVED
    if (oldClass === newClass && oldPath !== newPath) {
      return Status.MOVED
    }

    // Same path, different class name = RENAMED
    if (oldPath === newPath && oldClass !== newClass) {
      return Status.RENAMED
    }

    // Both path and class changed = could be both, default to MOVED
    return Status.MOVED
  }

  /**
   * Extracts path and class name from entry
   */
  private extractPathAndClass(entry: ClassEntry): [string, string] {
    // Extract directory path from file path
    const filePath = entry.file
    const lastSlash = filePath.lastIndexOf('/')
    const dirPath = lastSlash > 0 ? filePath.substring(0, lastSlash) : ''

    return [dirPath, entry.class]
  }

  /**
   * Formats entries as markdown table with Status column
   */
  formatAsMarkdown(entries: ClassEntry[], header: string): string {
    const lines: string[] = []

    // Add header if provided (but only the non-table part)
    if (header) {
      const headerLines = header.split('\n')
      for (const line of headerLines) {
        const trimmedLine = line.trim()
        if (trimmedLine !== '' && !trimmedLine.startsWith('|')) {
          lines.push(line)
        }
      }
    }

    // Use the provided header instead of hardcoding
    const headerLines = header.split('\n').filter(line => line.trim().startsWith('|'))
    if (headerLines.length < 2) {
      throw new Error('Invalid header: expected at least 2 table lines starting with |')
    }
    lines.push(headerLines[0]) // Header row
    lines.push(headerLines[1]) // Separator row

    // Count extra columns from header to know how many cells to emit beyond the 11 base fields
    const headerRow = headerLines[0] || ''
    const columnCount = (headerRow.match(/\|/g) || []).length - 1
    const baseFields = 12
    const extraColumnCount = Math.max(0, columnCount - baseFields)

    // Add entries
    for (const entry of entries) {
      const baseRow = `| ${entry.status} | ${entry.identifier} | ${entry.contentHash} | ${entry.alias} | ${entry.catalogued} | ${entry.processed} | ${entry.reviewLayer} | ${entry.class} | ${entry.file} | ${entry.type} | ${entry.layer} | ${entry.description} |`

      // Append extra fields, padding with empty cells if needed
      const extra = entry.extraFields ?? []
      const extraCells = Array.from({ length: extraColumnCount }, (_, i) => extra[i] ?? '')
      const fullRow = baseRow + extraCells.map(v => ` ${v} |`).join('')
      lines.push(fullRow)
    }

    return lines.join('\n')
  }

  /**
   * Compares old and new class entries and returns the differences
   */
  compare(oldEntries: ClassEntry[], newEntries: ClassEntry[]): ComparisonResult {
    const result: ComparisonResult = {
      newClasses: [],
      changedClasses: [],
      deletedClasses: [],
      unchangedCount: 0
    }

    // Create maps for efficient lookup
    const oldMap = new Map<string, ClassEntry>()
    const newMap = new Map<string, ClassEntry>()

    for (const entry of oldEntries) {
      oldMap.set(entry.identifier, entry)
    }

    for (const entry of newEntries) {
      newMap.set(entry.identifier, entry)
    }

    // Find new and changed classes
    for (const [identifier, newEntry] of newMap) {
      const oldEntry = oldMap.get(identifier)
      if (oldEntry) {
        // Class exists in both - check if content changed
        if (oldEntry.contentHash !== newEntry.contentHash) {
          result.changedClasses.push({
            identifier,
            class: newEntry.class,
            file: newEntry.file,
            oldContentHash: oldEntry.contentHash,
            newContentHash: newEntry.contentHash
          })
        } else {
          result.unchangedCount++
        }
      } else {
        // New class
        result.newClasses.push(newEntry)
      }
    }

    // Find deleted classes
    for (const [identifier, oldEntry] of oldMap) {
      if (!newMap.has(identifier)) {
        result.deletedClasses.push(oldEntry)
      }
    }

    return result
  }

  /**
   * Prints a formatted comparison result
   */
  printComparisonResult(result: ComparisonResult): void {
    console.log('=== CLASS COMPARISON RESULTS ===')
    console.log(`Unchanged: ${result.unchangedCount} classes`)
    console.log(`New: ${result.newClasses.length} classes`)
    console.log(`Changed: ${result.changedClasses.length} classes`)
    console.log(`Deleted: ${result.deletedClasses.length} classes`)
    console.log()

    if (result.newClasses.length > 0) {
      console.log('NEW CLASSES:')
      for (const entry of result.newClasses) {
        console.log(`  + ${entry.class} (${entry.identifier}) - ${entry.file}`)
      }
      console.log()
    }

    if (result.changedClasses.length > 0) {
      console.log('CHANGED CLASSES:')
      for (const change of result.changedClasses) {
        console.log(`  ~ ${change.class} (${change.identifier}) - ${change.file}`)
        console.log(`    Old hash: ${change.oldContentHash}`)
        console.log(`    New hash: ${change.newContentHash}`)
      }
      console.log()
    }

    if (result.deletedClasses.length > 0) {
      console.log('DELETED CLASSES:')
      for (const entry of result.deletedClasses) {
        console.log(`  - ${entry.class} (${entry.identifier}) - ${entry.file}`)
      }
      console.log()
    }
  }
}

