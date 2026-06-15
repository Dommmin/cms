#!/usr/bin/env node

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const clientRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
);
const isCheck = process.argv.includes('--check');

const libCandidates = [
    path.resolve(
        clientRoot,
        '../server/scripts/blocks-schema-to-typescript.mjs',
    ),
    '/var/www/server-scripts/blocks-schema-to-typescript.mjs',
];

const schemaCandidates = [
    path.resolve(
        clientRoot,
        '../server/tests/Unit/PageBuilder/snapshots/blocks.schema.json',
    ),
    '/var/www/blocks-schema/blocks.schema.json',
];

const libPath = libCandidates.find((candidate) => existsSync(candidate));
const schemaPath =
    process.env.BLOCKS_SCHEMA_PATH ??
    schemaCandidates.find((candidate) => existsSync(candidate));

if (!libPath) {
    console.error(
        `Blocks codegen library not found. Checked:\n${libCandidates.map((candidate) => `  - ${candidate}`).join('\n')}`,
    );
    process.exit(1);
}

if (!schemaPath) {
    console.error(
        `Schema file not found. Checked:\n${schemaCandidates.map((candidate) => `  - ${candidate}`).join('\n')}`,
    );
    process.exit(1);
}

const { runBlocksTypeGeneration } = await import(pathToFileURL(libPath).href);

await runBlocksTypeGeneration({
    schemaPath,
    outputPath: path.join(clientRoot, 'types/generated/blocks.generated.ts'),
    regenerateHint: 'docker compose exec node npm run generate:blocks-types',
    isCheck,
    cwd: clientRoot,
});
