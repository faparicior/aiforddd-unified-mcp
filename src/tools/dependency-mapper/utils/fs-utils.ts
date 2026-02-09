import * as path from 'path';
import { promises as fs, accessSync, constants } from 'fs';

/**
 * Finds the project root directory by looking for common project markers
 */
export function findProjectRoot(startDir: string): string {
  let currentDir = path.resolve(startDir);
  const maxLevelsUp = 10;

  for (let i = 0; i < maxLevelsUp; i++) {
    // Check for common project root indicators
    const potentialMarkers = [
      'package.json',
      'build.gradle',
      'build.gradle.kts',
      'pom.xml',
      'Cargo.toml',
      'go.mod',
      '.git',
      'composer.json'
    ];

    for (const marker of potentialMarkers) {
      try {
        accessSync(path.join(currentDir, marker), constants.R_OK);
        return currentDir;
      } catch {
        // Marker not found, continue
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break; // Reached filesystem root
    currentDir = parentDir;
  }

  // Fallback to going up 3 levels from the start directory
  return path.resolve(startDir, '..', '..', '..');
}

/**
 * Recursively searches for a file in a directory tree
 */
export async function findFileInDirectory(dir: string, fileName: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip common non-source directories
        const skipDirs = [
          'node_modules', '.git', 'build', 'dist', 'out', 'target',
          '.gradle', '.idea', '.vscode', '.settings', 'bin', 'obj',
          'proc', 'sys', 'dev', 'run', 'tmp', 'var', 'etc',
          'boot', 'usr', 'lib', 'lib64', 'sbin', 'bin',
          'root', 'home', 'mnt', 'media', 'srv', 'opt',
          'lost+found', 'cdrom', 'snap', 'docker', 'containerd', 'vendor'
        ];
        if (!skipDirs.includes(entry.name)) {
          const found = await findFileInDirectory(fullPath, fileName);
          if (found) return found;
        }
      } else if (entry.isFile() && entry.name === fileName) {
        return fullPath;
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return null;
}

/**
 * Recursively finds all files with specific extension in a directory
 */
export async function findFilesWithExtension(dir: string, extension: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip common non-source directories
        const skipDirs = [
          'node_modules', '.git', 'build', 'dist', 'out', 'target',
          '.gradle', '.idea', '.vscode', '.settings', 'bin', 'obj',
          'proc', 'sys', 'dev', 'run', 'tmp', 'var', 'etc',
          'boot', 'usr', 'lib', 'lib64', 'sbin', 'bin',
          'root', 'home', 'mnt', 'media', 'srv', 'opt',
          'lost+found', 'cdrom', 'snap', 'docker', 'containerd', 'vendor'
        ];
        if (!skipDirs.includes(entry.name)) {
          files.push(...await findFilesWithExtension(fullPath, extension));
        }
      } else if (entry.isFile() && entry.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Silently ignore directories we can't read
  }

  return files;
}
