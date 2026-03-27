import { readFileSync, writeFileSync } from "fs";

export type MarkdownTableRow = Record<string, string>;

/**
 * Parse a markdown table from file content (defaults to first table for backward compatibility)
 * @param filePath Path to the markdown file
 * @param tableIndex Index of the table to parse (0-based, defaults to 0)
 * @returns Array of objects where each object represents a row with header names as keys
 */
export function parseMarkdownTable(filePath: string, tableIndex: number = 0): MarkdownTableRow[] {
  return parseMarkdownTableByIndex(filePath, tableIndex);
}

/**
 * Count the number of rows in a markdown table (excluding header and separator)
 * @param filePath Path to the markdown file
 * @param tableIndex Index of the table to count (0-based, defaults to 0)
 * @returns Number of data rows in the table
 */
export function countMarkdownTableRows(filePath: string, tableIndex: number = 0): number {
  const rows = parseMarkdownTableByIndex(filePath, tableIndex);
  return rows.length;
}

/**
 * Filter markdown table rows by column value and return the count
 * @param filePath Path to the markdown file
 * @param columnName Name of the column to filter by
 * @param value Value to match in the column
 * @param tableIndex Index of the table to filter (0-based, defaults to 0)
 * @returns Number of rows where the column matches the value
 */
export function filterAndCountRows(
  filePath: string,
  columnName: string,
  value: string,
  tableIndex: number = 0,
  extraFilters?: Record<string, string>,
  excludeFilters?: Record<string, string>
): number {
  const rows = parseMarkdownTableByIndex(filePath, tableIndex);

  if (rows.length === 0) {
    return 0;
  }

  // Check if column exists
  const firstRow = rows[0];
  if (!(columnName in firstRow)) {
    throw new Error(`Column '${columnName}' does not exist in the table`);
  }

  // Build combined inclusion filters (primary + extras)
  const allFilters: Record<string, string> = { [columnName]: value, ...extraFilters };

  // Count rows matching all inclusion filters (AND logic) and not matching any exclusion filter
  let count = 0;
  for (const row of rows) {
    if (!Object.entries(allFilters).every(([col, val]) => row[col] === val)) continue;
    if (excludeFilters && Object.entries(excludeFilters).some(([col, val]) => row[col] === val)) continue;
    count++;
  }

  return count;
}

/**
 * Get a specific row from a markdown table by index
 * @param filePath Path to the markdown file
 * @param rowIndex Zero-based index of the row to retrieve
 * @param tableIndex Index of the table to get row from (0-based, defaults to 0)
 * @returns The row object with column names as keys
 */
export function getRow(filePath: string, rowIndex: number, tableIndex: number = 0): MarkdownTableRow {
  if (rowIndex < 0) {
    throw new Error("Row index must be non-negative");
  }

  const rows = parseMarkdownTableByIndex(filePath, tableIndex);

  if (rowIndex >= rows.length) {
    throw new Error(
      `Row index ${rowIndex} is out of bounds. Table has ${rows.length} rows (valid indices: 0-${rows.length - 1})`
    );
  }

  return rows[rowIndex];
}

/**
 * Find a specific row by column name and value (must be unique)
 * @param filePath Path to the markdown file
 * @param columnName Name of the column to search by
 * @param value Value to search for in the column
 * @param tableIndex Index of the table to search in (0-based, defaults to 0)
 * @returns The matching row object
 * @throws Error if no rows match, multiple rows match, or column doesn't exist
 */
export function findRow(
  filePath: string,
  columnName: string,
  value: string,
  tableIndex: number = 0
): MarkdownTableRow {
  const rows = parseMarkdownTableByIndex(filePath, tableIndex);

  if (rows.length === 0) {
    throw new Error("Table is empty");
  }

  // Check if column exists
  const firstRow = rows[0];
  if (!(columnName in firstRow)) {
    throw new Error(`Column '${columnName}' does not exist in the table`);
  }

  // Find all matching rows
  const matchingRows = rows.filter((row) => row[columnName] === value);

  if (matchingRows.length === 0) {
    throw new Error(
      `No row found where ${columnName} = '${value}'`
    );
  }

  if (matchingRows.length > 1) {
    throw new Error(
      `Multiple rows found where ${columnName} = '${value}' (found ${matchingRows.length}). Value must be unique.`
    );
  }

  return matchingRows[0];
}

/**
 * Get the first row that matches a column value (does not require uniqueness)
 * @param filePath Path to the markdown file
 * @param columnName Name of the column to search by
 * @param value Value to search for in the column
 * @param tableIndex Index of the table to search in (0-based, defaults to 0)
 * @returns The first matching row object
 * @throws Error if no rows match or column doesn't exist
 */
export function getFirstRowByColumn(
  filePath: string,
  columnName: string,
  value: string,
  tableIndex: number = 0
): MarkdownTableRow {
  const rows = parseMarkdownTableByIndex(filePath, tableIndex);

  if (rows.length === 0) {
    throw new Error("Table is empty");
  }

  // Check if column exists
  const firstRow = rows[0];
  if (!(columnName in firstRow)) {
    throw new Error(`Column '${columnName}' does not exist in the table`);
  }

  // Find first matching row
  const matchingRow = rows.find((row) => row[columnName] === value);

  if (!matchingRow) {
    throw new Error(
      `No row found where ${columnName} = '${value}'`
    );
  }

  return matchingRow;
}

/**
 * Get all rows that match a column value
 * @param filePath Path to the markdown file
 * @param columnName Name of the column to search by
 * @param value Value to search for in the column
 * @param maxRows Optional maximum number of rows to return
 * @param tableIndex Index of the table to search in (0-based, defaults to 0)
 * @returns Array of matching row objects
 * @throws Error if column doesn't exist
 */
export function getMultipleRowsByColumn(
  filePath: string,
  columnName: string,
  value: string,
  maxRows?: number,
  tableIndex: number = 0,
  excludeFilters?: Record<string, string>
): MarkdownTableRow[] {
  const rows = parseMarkdownTableByIndex(filePath, tableIndex);

  if (rows.length === 0) {
    throw new Error("Table is empty");
  }

  // Check if column exists
  const firstRow = rows[0];
  if (!(columnName in firstRow)) {
    throw new Error(`Column '${columnName}' does not exist in the table`);
  }

  // Find all matching rows
  let matchingRows = rows.filter((row) => row[columnName] === value);

  // Exclude rows where any excludeFilters column matches the specified value
  if (excludeFilters && Object.keys(excludeFilters).length > 0) {
    matchingRows = matchingRows.filter((row) =>
      !Object.entries(excludeFilters).some(([col, val]) => row[col] === val)
    );
  }

  // Apply maxRows limit if specified
  if (maxRows !== undefined && maxRows >= 0) {
    return matchingRows.slice(0, maxRows);
  }

  return matchingRows;
}

/**
 * Get all rows that match multiple column values (AND logic)
 * @param filePath Path to the markdown file
 * @param filters Object with column names as keys and values to match
 * @param maxRows Optional maximum number of rows to return
 * @param tableIndex Index of the table to search in (0-based, defaults to 0)
 * @returns Array of matching row objects
 * @throws Error if any column doesn't exist
 */
export function getMultipleRowsByMultipleColumns(
  filePath: string,
  filters: Record<string, string>,
  maxRows?: number,
  tableIndex: number = 0,
  excludeFilters?: Record<string, string>,
  selectColumns?: string[]
): MarkdownTableRow[] {
  const rows = parseMarkdownTableByIndex(filePath, tableIndex);

  if (rows.length === 0) {
    throw new Error("Table is empty");
  }

  // Check if all columns exist
  const firstRow = rows[0];
  for (const columnName of Object.keys(filters)) {
    if (!(columnName in firstRow)) {
      throw new Error(`Column '${columnName}' does not exist in the table`);
    }
  }

  // Find all matching rows (AND logic)
  let matchingRows = rows.filter((row) => {
    return Object.entries(filters).every(([columnName, value]) => row[columnName] === value);
  });

  // Exclude rows where any excludeFilters column matches the specified value
  if (excludeFilters && Object.keys(excludeFilters).length > 0) {
    matchingRows = matchingRows.filter((row) =>
      !Object.entries(excludeFilters).some(([col, val]) => row[col] === val)
    );
  }

  // Apply maxRows limit if specified
  if (maxRows !== undefined && maxRows >= 0) {
    matchingRows = matchingRows.slice(0, maxRows);
  }

  // Project to selected columns if specified
  if (selectColumns && selectColumns.length > 0) {
    return matchingRows.map((row) => {
      const projected: MarkdownTableRow = {};
      for (const col of selectColumns) {
        if (col in row) projected[col] = row[col];
      }
      return projected;
    });
  }

  return matchingRows;
}

/**
 * Update a row in a markdown table by matching a "before" JSON object
 * @param filePath Path to the markdown file
 * @param before JSON object representing the current row values
 * @param after JSON object representing the new row values
 * @param tableIndex Index of the table to update (0-based, defaults to 0)
 * @returns Number of rows updated
 */
export function updateRowByMatch(
  filePath: string,
  before: MarkdownTableRow,
  after: MarkdownTableRow,
  tableIndex: number = 0
): number {
  // Validate that before and after have the same keys
  const beforeKeys = Object.keys(before).sort();
  const afterKeys = Object.keys(after).sort();
  
  if (beforeKeys.length !== afterKeys.length || 
      !beforeKeys.every((key, index) => key === afterKeys[index])) {
    throw new Error("Before and after JSON objects must have the same columns");
  }

  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Find the table at the specified index
  let currentTableIndex = 0;
  let tableStartIndex = -1;
  let tableLength = 0;

  for (let i = 0; i < lines.length; i++) {
    if (isTableHeader(lines[i])) {
      if (currentTableIndex === tableIndex) {
        tableStartIndex = i;
        tableLength = getTableLength(lines, i);
        break;
      }
      currentTableIndex++;
      // Skip to end of this table
      i += getTableLength(lines, i) - 1;
    }
  }

  if (tableStartIndex === -1) {
    throw new Error(`Table index ${tableIndex} not found in file`);
  }

  // Parse header for the specific table
  const headerLine = lines[tableStartIndex].trim();
  const headers = parseTableRow(headerLine);

  // Find matching row within this table
  let matchingRowIndex = -1;
  let matchCount = 0;

  for (let i = tableStartIndex + 2; i < tableStartIndex + tableLength; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row = parseTableRow(line);
    const rowObject: MarkdownTableRow = {};
    headers.forEach((header, index) => {
      rowObject[header] = row[index];
    });

    // Check if this row matches the "before" object
    const matches = beforeKeys.every(key => rowObject[key] === before[key]);
    if (matches) {
      matchCount++;
      matchingRowIndex = i;
    }
  }

  if (matchCount === 0) {
    throw new Error("No row found matching the 'before' JSON object");
  }

  if (matchCount > 1) {
    throw new Error(
      `Multiple rows found matching the 'before' JSON object (found ${matchCount}). Row must be unique.`
    );
  }

  // Update the matching row
  const updatedCells = headers.map(header => after[header] ?? "");
  lines[matchingRowIndex] = `| ${updatedCells.join(" | ")} |`;

  // Write back to file
  writeFileSync(filePath, lines.join("\n"));

  return 1;
}

/**
 * Update a row in a markdown table by finding it with a unique column value
 * @param filePath Path to the markdown file
 * @param columnName Name of the column to use as identifier
 * @param columnValue Value to search for in the identifier column
 * @param updates Object with column names and new values to update
 * @param tableIndex Index of the table to update (0-based, defaults to 0)
 * @returns Number of rows updated
 */
export function updateRowByColumn(
  filePath: string,
  columnName: string,
  columnValue: string,
  updates: MarkdownTableRow,
  tableIndex: number = 0
): number {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Find the table at the specified index
  let currentTableIndex = 0;
  let tableStartIndex = -1;
  let tableLength = 0;

  for (let i = 0; i < lines.length; i++) {
    if (isTableHeader(lines[i])) {
      if (currentTableIndex === tableIndex) {
        tableStartIndex = i;
        tableLength = getTableLength(lines, i);
        break;
      }
      currentTableIndex++;
      // Skip to end of this table
      i += getTableLength(lines, i) - 1;
    }
  }

  if (tableStartIndex === -1) {
    throw new Error(`Table index ${tableIndex} not found in file`);
  }

  // Parse header for the specific table
  const headerLine = lines[tableStartIndex].trim();
  const headers = parseTableRow(headerLine);

  // Check if identifier column exists
  if (!headers.includes(columnName)) {
    throw new Error(`Column '${columnName}' does not exist in the table`);
  }

  // Check if all update columns exist
  for (const updateColumn of Object.keys(updates)) {
    if (!headers.includes(updateColumn)) {
      throw new Error(`Column '${updateColumn}' does not exist in the table`);
    }
  }

  // Find matching row within this table
  let matchingRowIndex = -1;
  let matchCount = 0;

  for (let i = tableStartIndex + 2; i < tableStartIndex + tableLength; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row = parseTableRow(line);
    const rowObject: MarkdownTableRow = {};
    headers.forEach((header, index) => {
      rowObject[header] = row[index];
    });

    // Check if this row matches the column value
    if (rowObject[columnName] === columnValue) {
      matchCount++;
      matchingRowIndex = i;
    }
  }

  if (matchCount === 0) {
    throw new Error(`No row found where ${columnName} = '${columnValue}'`);
  }

  if (matchCount > 1) {
    throw new Error(
      `Multiple rows found where ${columnName} = '${columnValue}' (found ${matchCount}). Value must be unique.`
    );
  }

  // Parse the matching row
  const matchingLine = lines[matchingRowIndex].trim();
  const currentCells = parseTableRow(matchingLine);
  const rowObject: MarkdownTableRow = {};
  headers.forEach((header, index) => {
    rowObject[header] = currentCells[index];
  });

  // Apply updates
  for (const [column, value] of Object.entries(updates)) {
    rowObject[column] = value;
  }

  // Build updated row
  const updatedCells = headers.map(header => rowObject[header]);
  lines[matchingRowIndex] = `| ${updatedCells.join(" | ")} |`;

  // Write back to file
  writeFileSync(filePath, lines.join("\n"));

  return 1;
}

/**
 * Empty all rows for a specific column in a markdown table
 * @param filePath Path to the markdown file
 * @param columnName Name of the column to empty
 * @param tableIndex Index of the table to modify (0-based, defaults to 0)
 * @returns Number of rows updated
 */
export function emptyColumn(
  filePath: string,
  columnName: string,
  tableIndex: number = 0
): number {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Find the table at the specified index
  let currentTableIndex = 0;
  let tableStartIndex = -1;
  let tableLength = 0;

  for (let i = 0; i < lines.length; i++) {
    if (isTableHeader(lines[i])) {
      if (currentTableIndex === tableIndex) {
        tableStartIndex = i;
        tableLength = getTableLength(lines, i);
        break;
      }
      currentTableIndex++;
      // Skip to end of this table
      i += getTableLength(lines, i) - 1;
    }
  }

  if (tableStartIndex === -1) {
    throw new Error(`Table index ${tableIndex} not found in file`);
  }

  // Parse header for the specific table
  const headerLine = lines[tableStartIndex].trim();
  const headers = parseTableRow(headerLine);

  // Check if column exists
  const columnIndex = headers.indexOf(columnName);
  if (columnIndex === -1) {
    throw new Error(`Column '${columnName}' does not exist in the table`);
  }

  // Update all data rows within this table
  let rowsUpdated = 0;
  for (let i = tableStartIndex + 2; i < tableStartIndex + tableLength; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (!line.startsWith("|") || !line.endsWith("|")) {
      continue; // Skip non-table lines
    }

    const cells = parseTableRow(line);
    if (cells.length === headers.length) {
      // Empty the specified column
      cells[columnIndex] = "";
      lines[i] = `| ${cells.join(" | ")} |`;
      rowsUpdated++;
    }
  }

  // Write back to file
  writeFileSync(filePath, lines.join("\n"));

  return rowsUpdated;
}

/**
 * Add a new column to a markdown table at the specified position
 * @param filePath Path to the markdown file
 * @param columnName Name of the new column to add
 * @param position Position to insert the column (0-based index)
 * @param tableIndex Index of the table to update (0-based, defaults to 0)
 * @returns Number of rows updated (including header)
 */
export function addColumn(
  filePath: string,
  columnName: string,
  position: number,
  tableIndex: number = 0
): number {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Find the table at the specified index
  let currentTableIndex = 0;
  let tableStartIndex = -1;
  let tableLength = 0;

  for (let i = 0; i < lines.length; i++) {
    if (isTableHeader(lines[i])) {
      if (currentTableIndex === tableIndex) {
        tableStartIndex = i;
        tableLength = getTableLength(lines, i);
        break;
      }
      currentTableIndex++;
      // Skip to end of this table
      i += getTableLength(lines, i) - 1;
    }
  }

  if (tableStartIndex === -1) {
    throw new Error(`Table index ${tableIndex} not found in file`);
  }

  // Parse header for the specific table
  const headerLine = lines[tableStartIndex].trim();
  const headers = parseTableRow(headerLine);

  // Validate position
  if (position < 0 || position > headers.length) {
    throw new Error(`Position ${position} is out of bounds. Table has ${headers.length} columns.`);
  }

  // Check if column name already exists
  if (headers.includes(columnName)) {
    throw new Error(`Column '${columnName}' already exists in the table`);
  }

  // Insert new column header
  headers.splice(position, 0, columnName);
  lines[tableStartIndex] = `| ${headers.join(" | ")} |`;

  // Detect separator format from existing separator line
  const originalSeparatorLine = lines[tableStartIndex + 1];
  const separatorParts = originalSeparatorLine.split("|").filter(part => part.trim() !== "");
  const hasSpacesAroundPipes = originalSeparatorLine.includes(" | ");
  
  // Insert separator for the new column
  const separators = parseTableRow(originalSeparatorLine);
  separators.splice(position, 0, "---");
  
  if (hasSpacesAroundPipes) {
    lines[tableStartIndex + 1] = `| ${separators.join(" | ")} |`;
  } else {
    lines[tableStartIndex + 1] = `|${separators.join("|")}|`;
  }

  // Update all data rows within this table
  let rowsUpdated = 2; // header and separator
  for (let i = tableStartIndex + 2; i < tableStartIndex + tableLength; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (!line.startsWith("|") || !line.endsWith("|")) {
      continue; // Skip non-table lines
    }

    const cells = parseTableRow(line);
    if (cells.length === headers.length - 1) { // Original number of columns
      // Insert empty cell at the specified position
      cells.splice(position, 0, "");
      lines[i] = `| ${cells.join(" | ")} |`;
      rowsUpdated++;
    }
  }

  // Write back to file
  writeFileSync(filePath, lines.join("\n"));

  return rowsUpdated;
}

/**
 * Delete a column from a markdown table by name
 * @param filePath Path to the markdown file
 * @param columnName Name of the column to delete
 * @param tableIndex Index of the table to update (0-based, defaults to 0)
 * @returns Number of rows updated (including header and separator)
 */
export function deleteColumn(
  filePath: string,
  columnName: string,
  tableIndex: number = 0
): number {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Find the table at the specified index
  let currentTableIndex = 0;
  let tableStartIndex = -1;
  let tableLength = 0;

  for (let i = 0; i < lines.length; i++) {
    if (isTableHeader(lines[i])) {
      if (currentTableIndex === tableIndex) {
        tableStartIndex = i;
        tableLength = getTableLength(lines, i);
        break;
      }
      currentTableIndex++;
      // Skip to end of this table
      i += getTableLength(lines, i) - 1;
    }
  }

  if (tableStartIndex === -1) {
    throw new Error(`Table index ${tableIndex} not found in file`);
  }

  // Parse header for the specific table
  const headerLine = lines[tableStartIndex].trim();
  const headers = parseTableRow(headerLine);

  // Check if column exists
  const columnIndex = headers.indexOf(columnName);
  if (columnIndex === -1) {
    throw new Error(`Column '${columnName}' does not exist in the table`);
  }

  // Check if this would delete the last column
  if (headers.length === 1) {
    throw new Error(`Cannot delete the last remaining column '${columnName}'`);
  }

  // Remove column from header
  headers.splice(columnIndex, 1);
  lines[tableStartIndex] = `| ${headers.join(" | ")} |`;

  // Remove separator for the deleted column
  const separatorLine = lines[tableStartIndex + 1].trim();
  const separators = parseTableRow(separatorLine);
  separators.splice(columnIndex, 1);
  
  // Detect separator format from existing separator line
  const originalSeparatorLine = lines[tableStartIndex + 1];
  const hasSpacesAroundPipes = originalSeparatorLine.includes(" | ");
  
  if (hasSpacesAroundPipes) {
    lines[tableStartIndex + 1] = `| ${separators.join(" | ")} |`;
  } else {
    lines[tableStartIndex + 1] = `|${separators.join("|")}|`;
  }

  // Update all data rows within this table
  let rowsUpdated = 2; // header and separator
  for (let i = tableStartIndex + 2; i < tableStartIndex + tableLength; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (!line.startsWith("|") || !line.endsWith("|")) {
      continue; // Skip non-table lines
    }

    const cells = parseTableRow(line);
    if (cells.length === headers.length + 1) { // Original number of columns
      // Remove the specified column
      cells.splice(columnIndex, 1);
      lines[i] = `| ${cells.join(" | ")} |`;
      rowsUpdated++;
    }
  }

  // Write back to file
  writeFileSync(filePath, lines.join("\n"));

  return rowsUpdated;
}

/**
 * Get unique values from a specific column in a markdown table
 * @param filePath Path to the markdown file
 * @param columnName Name of the column to get unique values from
 * @param tableIndex Index of the table to read from (0-based, defaults to 0)
 * @returns Array of unique values in the column
 */
export function getUniqueColumnValues(filePath: string, columnName: string, tableIndex: number = 0): string[] {
  const rows = parseMarkdownTableByIndex(filePath, tableIndex);

  if (rows.length === 0) {
    return [];
  }

  // Check if column exists
  const firstRow = rows[0];
  if (!(columnName in firstRow)) {
    throw new Error(`Column '${columnName}' does not exist in the table`);
  }

  // Collect unique values
  const values = new Set<string>();
  for (const row of rows) {
    values.add(row[columnName]);
  }

  return Array.from(values);
}

/**
 * Parse all markdown tables from file content
 * @param filePath Path to the markdown file
 * @returns Array of tables, where each table is an array of row objects
 */
export function parseAllMarkdownTables(filePath: string): MarkdownTableRow[][] {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const tables: MarkdownTableRow[][] = [];
  let i = 0;

  while (i < lines.length) {
    // Skip non-table content until we find a table
    while (i < lines.length && !isTableHeader(lines[i])) {
      i++;
    }

    if (i >= lines.length) break;

    // Found a table header, try to parse the table
    const table = parseTableFromLines(lines, i);
    if (table !== null) {
      tables.push(table);
    }

    // Move past this table
    i += getTableLength(lines, i);
  }

  return tables;
}

/**
 * Parse a specific markdown table by index from file content
 * @param filePath Path to the markdown file
 * @param tableIndex Index of the table to parse (0-based)
 * @returns Array of row objects for the specified table
 */
export function parseMarkdownTableByIndex(filePath: string, tableIndex: number = 0): MarkdownTableRow[] {
  const tables = parseAllMarkdownTables(filePath);

  if (tableIndex < 0 || tableIndex >= tables.length) {
    throw new Error(`Table index ${tableIndex} is out of bounds. File contains ${tables.length} tables.`);
  }

  return tables[tableIndex];
}

/**
 * Check if a line is a potential table header
 */
function isTableHeader(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.includes("|");
}

/**
 * Parse a table starting from a specific line index
 * Returns null if no valid table found, empty array for valid table with no data rows
 */
function parseTableFromLines(lines: string[], startIndex: number): MarkdownTableRow[] | null {
  if (startIndex + 1 >= lines.length) {
    return null;
  }

  const headerLine = lines[startIndex].trim();
  const separatorLine = lines[startIndex + 1].trim();

  // Validate it's actually a table
  if (!headerLine.startsWith("|") || !headerLine.endsWith("|")) {
    return null;
  }

  if (!separatorLine.startsWith("|") || !separatorLine.endsWith("|")) {
    return null;
  }

  const headers = parseTableRow(headerLine);
  const separators = parseTableRow(separatorLine);

  if (separators.length !== headers.length) {
    return null;
  }

  // Validate separator cells contain dashes
  for (const separator of separators) {
    if (!separator.includes("-")) {
      return null;
    }
  }

  // Parse data rows
  const result: MarkdownTableRow[] = [];
  for (let i = startIndex + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    if (!line.startsWith("|") || !line.endsWith("|")) {
      break;
    }

    const row = parseTableRow(line);
    if (row.length !== headers.length) {
      break;
    }

    // Convert row array to object using headers as keys
    const rowObject: MarkdownTableRow = {};
    headers.forEach((header, index) => {
      rowObject[header] = row[index];
    });
    result.push(rowObject);
  }

  return result; // Return empty array for valid table with no data rows
}

/**
 * Get the length (number of lines) of a table starting from a specific index
 */
function getTableLength(lines: string[], startIndex: number): number {
  let length = 2; // header + separator

  for (let i = startIndex + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    if (!line.startsWith("|") || !line.endsWith("|")) {
      break;
    }

    length++;
  }

  return length;
}

/**
 * Parse a single table row, handling pipes and trimming whitespace
 * @param line The table row line
 * @returns Array of cell values
 */
function parseTableRow(line: string): string[] {
  // Remove leading and trailing pipes
  const content = line.substring(1, line.length - 1);
  
  // Split by pipe and trim each cell
  return content.split("|").map((cell) => cell.trim());
}
