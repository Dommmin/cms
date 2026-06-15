#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { runBlocksTypeGeneration } from './blocks-schema-to-typescript.mjs';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isCheck = process.argv.includes('--check');

await runBlocksTypeGeneration({
    schemaPath: path.join(
        serverRoot,
        'tests/Unit/PageBuilder/snapshots/blocks.schema.json',
    ),
    outputPath: path.join(
        serverRoot,
        'resources/js/types/generated/blocks.generated.ts',
    ),
    regenerateHint: 'docker compose exec php npm run generate:blocks-types',
    isCheck,
    cwd: serverRoot,
});
