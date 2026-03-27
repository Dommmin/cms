/**
 * extract-types.mjs
 * Extracts interface/type declarations from .tsx files into colocated .types.ts files.
 *
 * Usage:
 *   node scripts/extract-types.mjs [--dry-run] [--dir client/components]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename, extname } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const TARGET_DIR = process.argv.find((a) => a.startsWith('--dir='))?.slice(6) ?? null;
const ROOT = process.cwd();

// ─── helpers ──────────────────────────────────────────────────────────────────

function walk(dir, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.next', 'dist', '.git'].includes(entry.name)) {
      walk(full, results);
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

/** Convert kebab-case or PascalCase filename → PascalCase prefix for Props */
function fileToPascal(filename) {
  return basename(filename, '.tsx')
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

/**
 * Extract top-level interface and type declarations from source.
 * Returns array of { raw: string, name: string, isExported: boolean, start: number, end: number }
 */
function extractDeclarations(lines) {
  const decls = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Match: (export )?(interface|type) Name ...
    const m = line.match(/^(export\s+)?(interface|type)\s+(\w+)/);
    if (!m) { i++; continue; }

    const isExported = !!m[1];
    const keyword    = m[2];
    const name       = m[3];
    const start      = i;

    // Find end: brace-counting for interface / type = { ... }
    // For single-line `type Foo = string;` — ends on same line
    let depth = 0;
    let foundOpen = false;
    let end = i;

    for (let j = i; j < lines.length; j++) {
      const l = lines[j];
      for (const ch of l) {
        if (ch === '{') { depth++; foundOpen = true; }
        if (ch === '}') depth--;
      }
      end = j;
      if (foundOpen && depth === 0) break;
      // Single-line type without braces
      if (!foundOpen && keyword === 'type' && l.trimEnd().endsWith(';')) break;
      if (!foundOpen && keyword === 'type' && j > i + 8) break; // safety: give up after 8 lines
    }

    decls.push({
      name,
      isExported,
      start,
      end,
      raw: lines.slice(start, end + 1).join('\n'),
    });

    i = end + 1;
  }
  return decls;
}

/**
 * Given declaration text, collect identifiers that likely come from imports.
 * Returns a Set of potential type names used.
 */
function usedIdentifiers(declsRaw) {
  // Remove string literals and comments
  const clean = declsRaw
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/"[^"]*"|'[^']*'|`[^`]*`/g, '');
  const ids = new Set();
  for (const m of clean.matchAll(/\b([A-Z][A-Za-z0-9_]*)\b/g)) {
    ids.add(m[1]);
  }
  return ids;
}

/**
 * Parse import lines to extract { specifier → source } mapping.
 * Returns array of { source, specifiers: string[], raw: string }
 */
function parseImports(lines) {
  const imports = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.match(/^import\s/)) continue;

    // Collect multi-line import
    let raw = line;
    let j = i;
    while (!raw.includes('from') && j < lines.length - 1) {
      j++;
      raw += '\n' + lines[j];
    }

    // Extract specifiers
    const specMatch = raw.match(/\{([^}]+)\}/);
    const defaultMatch = raw.match(/^import\s+type\s+(\w+)|^import\s+(\w+)\s+from/);
    const sourceMatch = raw.match(/from\s+['"]([^'"]+)['"]/);
    if (!sourceMatch) continue;

    const source = sourceMatch[1];
    const specifiers = specMatch
      ? specMatch[1].split(',').map((s) => s.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim())
      : defaultMatch
        ? [defaultMatch[1] || defaultMatch[2]]
        : [];

    imports.push({ source, specifiers, raw });
  }
  return imports;
}

// ─── main ─────────────────────────────────────────────────────────────────────

const dirs = TARGET_DIR
  ? [join(ROOT, TARGET_DIR)]
  : [join(ROOT, 'client/components'), join(ROOT, 'client/app'), join(ROOT, 'server/resources/js')];

const files = dirs.flatMap((d) => (existsSync(d) ? walk(d) : []));

let changed = 0;
let skipped = 0;

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');

  const decls = extractDeclarations(lines);
  if (decls.length === 0) { skipped++; continue; }

  // Skip if .types.ts already exists (don't overwrite manual work)
  const typesFile = file.replace(/\.tsx$/, '.types.ts');
  if (existsSync(typesFile)) { skipped++; continue; }

  const pascal = fileToPascal(file);

  // Collect all declaration text
  const allDeclsRaw = decls.map((d) => d.raw).join('\n\n');
  const used = usedIdentifiers(allDeclsRaw);

  // Find imports from the .tsx that the types file needs
  const allImports = parseImports(lines);
  const neededImports = allImports.filter(({ specifiers, source }) => {
    // Keep: type imports where at least one specifier is used in the decls
    // Skip: React, hooks, component imports (lowercase source paths likely)
    if (source === 'react' || source.startsWith('react/')) return false;
    if (!source.includes('/') && !source.includes('.')) {
      // node_modules — only keep if specifier is used
    }
    return specifiers.some((s) => used.has(s));
  });

  // Build .types.ts content
  const importLines = neededImports.map(({ raw }) => {
    // Ensure it uses `import type`
    return raw.replace(/^import\s+(?!type)/, 'import type ');
  });

  // Rename bare `Props` → `{Pascal}Props` inside declarations
  const renamedDecls = decls.map((d) => {
    let raw = d.raw;
    // Only rename if name is exactly `Props`
    if (d.name === 'Props') {
      raw = raw.replace(
        /^(export\s+)?(interface|type)\s+Props(\s|<|{|=)/m,
        (_, exp, kw, after) => `${exp ?? ''}${kw} ${pascal}Props${after}`,
      );
    }
    // Ensure exported
    if (!d.isExported) {
      raw = raw.replace(/^(interface|type)\s+/, 'export $1 ');
    }
    return raw;
  });

  const typesContent = [
    ...(importLines.length ? importLines : []),
    ...(importLines.length ? [''] : []),
    ...renamedDecls,
    '',
  ].join('\n');

  // Build updated .tsx: remove extracted declarations, add import from .types.ts
  const linesToRemove = new Set();
  for (const d of decls) {
    for (let ln = d.start; ln <= d.end; ln++) linesToRemove.add(ln);
    // Also remove blank line immediately before declaration
    if (d.start > 0 && lines[d.start - 1].trim() === '') linesToRemove.add(d.start - 1);
  }

  // Build import for types
  const exportedNames = decls.map((d) => (d.name === 'Props' ? `${pascal}Props` : d.name));
  const typeImportLine = `import type { ${exportedNames.join(', ')} } from './${basename(file, '.tsx')}.types';`;

  // Insert import after last existing import line
  const lastImportIdx = lines.reduce((acc, l, i) => (l.match(/^import\s/) ? i : acc), -1);
  const newLines = lines
    .map((l, i) => {
      if (linesToRemove.has(i)) return null;
      return l;
    })
    .filter((l) => l !== null);

  // Insert type import after last import
  const insertAt = lastImportIdx >= 0 ? lastImportIdx + 1 - [...linesToRemove].filter((i) => i <= lastImportIdx).length : 0;
  newLines.splice(insertAt, 0, typeImportLine);

  // Fix references: replace `Props` with `{Pascal}Props` in component function signatures
  const updatedSrc = newLines
    .join('\n')
    .replace(/\b(?<![A-Za-z])Props(?![A-Za-z])/g, (m, offset, str) => {
      // Only replace if it looks like usage (not declaration, which was removed)
      return `${pascal}Props`;
    });

  if (DRY_RUN) {
    console.log(`\n[DRY] ${file.replace(ROOT + '/', '')}`);
    console.log(`  → extract: ${decls.map((d) => d.name).join(', ')}`);
    console.log(`  → rename: ${decls.filter((d) => d.name === 'Props').map(() => `Props → ${pascal}Props`)}`);
  } else {
    writeFileSync(typesFile, typesContent, 'utf8');
    writeFileSync(file, updatedSrc, 'utf8');
    console.log(`✓ ${file.replace(ROOT + '/', '')}  (${decls.map((d) => d.name).join(', ')})`);
  }
  changed++;
}

console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Done: ${changed} files extracted, ${skipped} skipped.`);
