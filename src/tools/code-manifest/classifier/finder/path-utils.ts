/**
 * Trims the base path from a full path to create a relative path
 * @param path Full file path
 * @param base Base path to trim
 * @returns Relative path
 */
export function trimBasePath(path: string, base: string): string {
  // Clean the base path by removing leading "./" if present
  const cleanBase = base.replace(/^\.\//, '')

  // Split base path to get the parent directory (without "/main" if present)
  const baseParts = cleanBase.split('/')
  if (baseParts.length === 0) {
    return path
  }

  // Remove "/main" from the end to get the actual search pattern
  let searchPath = cleanBase
  if (baseParts[baseParts.length - 1] === 'main' && baseParts.length > 1) {
    searchPath = baseParts.slice(0, -1).join('/')
  }

  // Find where the search path appears in the full path
  const index = path.indexOf(searchPath)
  if (index === -1) {
    return path // Return original if not found
  }

  // Extract the part starting from the search path
  const relativePath = path.substring(index)

  // If base ended with "/main", add it back to the relative path
  if (cleanBase.endsWith('/main') && relativePath.startsWith(searchPath + '/')) {
    return searchPath + '/main' + relativePath.substring(searchPath.length)
  }

  return relativePath
}
