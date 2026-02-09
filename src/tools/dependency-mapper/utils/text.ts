/**
 * Removes single-line and multi-line comments from code
 * Works for C-style comment languages (Java, Kotlin, TS, PHP, C#, etc.)
 */
export function removeComments(content: string): string {
  // Remove multi-line comments
  let result = content.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove single-line comments
  result = result.replace(/\/\/.*$/gm, '');
  return result;
}
