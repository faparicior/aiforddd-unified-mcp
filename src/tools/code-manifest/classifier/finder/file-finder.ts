import { readdirSync } from 'fs'
import { join } from 'path'
import { FilesFound, File } from '../types/types.js'

/**
 * Recursively finds all files in a folder that match the given suffix
 * @param folder Root folder to search
 * @param suffix File extension to filter (e.g., ".kt")
 * @returns FilesFound object containing list of matching files
 */
export function findFiles(folder: string, suffix: string): FilesFound {
  const fileList: File[] = []

  /**
   * Recursive walker function
   */
  function walk(currentPath: string): void {
    try {
      const entries = readdirSync(currentPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name)

        try {
          if (entry.isDirectory()) {
            // Recursively walk directories
            walk(fullPath)
          } else if (entry.isFile() && entry.name.endsWith(suffix)) {
            // Add matching files to the list
            fileList.push({ value: fullPath })
          }
        } catch (err) {
          // Log but continue on individual file errors
          console.error(`Error processing ${fullPath}:`, err)
        }
      }
    } catch (err) {
      // Log but continue on directory read errors
      console.error(`Error reading directory ${currentPath}:`, err)
    }
  }

  // Start the recursive walk
  walk(folder)

  return { fileList }
}

/**
 * Gets statistics about the files found
 * @param filesFound FilesFound object
 * @returns Total count of files
 */
export function getFileCount(filesFound: FilesFound): number {
  return filesFound.fileList.length
}
