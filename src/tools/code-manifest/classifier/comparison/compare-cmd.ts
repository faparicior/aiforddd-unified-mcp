import { readFileSync, writeFileSync, existsSync } from 'fs'
import { MarkdownParser, HashComparer } from './hash-comparer.js'

/**
 * CompareCommand handles comparison of markdown files
 */
export class CompareCommand {
  private parser: MarkdownParser
  private comparer: HashComparer

  constructor() {
    this.parser = new MarkdownParser()
    this.comparer = new HashComparer()
  }

  /**
   * Compares two markdown files and prints the results
   */
  compareFiles(oldFilePath: string, newFilePath: string): void {
    // Read old file
    const oldContent = readFileSync(oldFilePath, 'utf-8')

    // Read new file
    const newContent = readFileSync(newFilePath, 'utf-8')

    // Parse old entries
    const oldEntries = this.parser.parseMarkdownTable(oldContent)

    // Parse new entries
    const newEntries = this.parser.parseMarkdownTable(newContent)

    // Compare entries
    const result = this.comparer.compare(oldEntries, newEntries)

    // Print results
    console.log(`Comparing: ${oldFilePath} -> ${newFilePath}`)
    console.log(`Old entries: ${oldEntries.length}, New entries: ${newEntries.length}\n`)

    this.comparer.printComparisonResult(result)
  }

  /**
   * Compares current generated files with repository state
   */
  compareWithRepository(currentFilePath: string): void {
    // Check if we have a backup/previous version
    const backupPath = `${currentFilePath}.backup`
    if (!existsSync(backupPath)) {
      console.log(`No backup file found at ${backupPath}`)
      console.log(`Current file has ${this.countEntries(currentFilePath)} entries`)
      return
    }

    this.compareFiles(backupPath, currentFilePath)
  }

  /**
   * Counts entries in a markdown file
   */
  private countEntries(filePath: string): number {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const entries = this.parser.parseMarkdownTable(content)
      return entries.length
    } catch (error) {
      return 0
    }
  }

  /**
   * Creates a backup of the current file
   */
  createBackup(filePath: string): void {
    const content = readFileSync(filePath, 'utf-8')
    const backupPath = `${filePath}.backup`
    writeFileSync(backupPath, content, 'utf-8')
    console.log(`Backup created: ${backupPath}`)
  }
}

