import { ParsedFile } from '../parsers/index.js'

/**
 * File represents a file in the file system
 */
export interface File {
  value: string
}

/**
 * FilesFound represents a collection of discovered files
 */
export interface FilesFound {
  fileList: File[]
}

/**
 * Stats represents statistics about file processing
 */
export interface Stats {
  totalFiles: number
  applicationServices: number
  orphanFiles: number
  multipleCategories: number
}

/**
 * ClassifiedFileByClass represents a file with its extracted class structure
 */
export interface ClassifiedFileByClass {
  file: File
  classSpecsFound: ParsedFile
}

/**
 * ClassifiedClassList is a collection of classified files
 */
export type ClassifiedClassList = ClassifiedFileByClass[]
