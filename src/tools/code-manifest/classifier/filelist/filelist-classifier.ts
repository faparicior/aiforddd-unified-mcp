import { extractClassStructure } from '../parsers/index.js'
import { FilesFound, ClassifiedClassList } from '../types/types.js'

/**
 * Classifies files by extracting their class structure
 * @param files List of files found
 * @returns List of classified files with their class specs
 */
export function classifyFilesByClass(files: FilesFound): ClassifiedClassList {
  const classifiedFileList: ClassifiedClassList = []

  for (const file of files.fileList) {
    const result = extractClassStructure(file.value)

    if (result) {
      classifiedFileList.push({
        file: file,
        classSpecsFound: result
      })
    }
  }

  return classifiedFileList
}

