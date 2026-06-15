import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';

/** @type {Map<string, string>} */
const nestedTypeDefinitions = new Map();

/**
 * @param {string} blockKey
 * @returns {string}
 */
function toPascalCase(blockKey) {
    return blockKey
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

/**
 * @param {string} blockName
 * @param {string} propertyName
 * @returns {string}
 */
function toItemTypeName(blockName, propertyName) {
    return `${blockName}BlockConfiguration${toPascalCase(propertyName)}Item`;
}

/**
 * @param {Record<string, unknown>} property
 * @param {string} blockName
 * @param {string} [propertyName]
 * @returns {string}
 */
function resolveTsType(property, blockName, propertyName) {
    const type = /** @type {string} */ (property.type);

    if (type === 'string') {
        if (Array.isArray(property.enum) && property.enum.length > 0) {
            return property.enum
                .map((value) => `'${String(value).replace(/'/g, "\\'")}'`)
                .join(' | ');
        }

        return 'string';
    }

    if (type === 'integer' || type === 'number') {
        return 'number';
    }

    if (type === 'boolean') {
        return 'boolean';
    }

    if (type === 'array') {
        const items = /** @type {Record<string, unknown>} */ (property.items);
        const itemTypeName = toItemTypeName(blockName, propertyName ?? 'Item');
        ensureObjectType(itemTypeName, items);

        return `${itemTypeName}[]`;
    }

    if (type === 'object') {
        return emitInlineObjectType(
            /** @type {Record<string, Record<string, unknown>>} */ (
                property.properties ?? {}
            ),
            blockName,
        );
    }

    return 'unknown';
}

/**
 * @param {Record<string, Record<string, unknown>>} properties
 * @param {string} blockName
 * @returns {string}
 */
function emitInlineObjectType(properties, blockName) {
    const entries = Object.entries(properties);

    if (entries.length === 0) {
        return 'Record<string, unknown>';
    }

    const lines = entries.map(([name, prop]) => {
        const optional = prop.required === true ? '' : '?';
        const tsType = resolveTsType(prop, blockName, name);

        return `${name}${optional}: ${tsType};`;
    });

    return `{\n${indent(lines.join('\n'), 4)}\n}`;
}

/**
 * @param {string} typeName
 * @param {Record<string, unknown>} objectSchema
 */
function ensureObjectType(typeName, objectSchema) {
    if (nestedTypeDefinitions.has(typeName)) {
        return;
    }

    const blockName = typeName.replace(/BlockConfiguration.*$/, '');
    const properties = /** @type {Record<string, Record<string, unknown>>} */ (
        objectSchema.properties ?? {}
    );
    const lines = Object.entries(properties).map(([name, prop]) => {
        const optional = prop.required === true ? '' : '?';
        const tsType = resolveTsType(prop, blockName, name);

        return `    ${name}${optional}: ${tsType};`;
    });

    nestedTypeDefinitions.set(
        typeName,
        `export type ${typeName} = {\n${lines.join('\n')}\n};`,
    );
}

/**
 * @param {string} blockKey
 * @param {Record<string, unknown>} block
 * @returns {string}
 */
function emitBlockConfigurationType(blockKey, block) {
    const blockName = toPascalCase(blockKey);
    const typeName = `${blockName}BlockConfiguration`;
    const schema = /** @type {Record<string, unknown>} */ (block.schema);
    const properties = /** @type {Record<string, Record<string, unknown>>} */ (
        schema.properties ?? {}
    );

    const lines = Object.entries(properties).map(([name, prop]) => {
        const optional = prop.required === true ? '' : '?';
        const tsType = resolveTsType(prop, blockName, name);

        return `    ${name}${optional}: ${tsType};`;
    });

    return `export type ${typeName} = {\n${lines.join('\n')}\n};`;
}

/**
 * @param {string} text
 * @param {number} spaces
 * @returns {string}
 */
function indent(text, spaces) {
    const pad = ' '.repeat(spaces);

    return text
        .split('\n')
        .map((line) => (line.length > 0 ? `${pad}${line}` : line))
        .join('\n');
}

/**
 * @param {Record<string, unknown>} schemaPayload
 * @param {string} hint
 * @returns {string}
 */
function generateSource(schemaPayload, hint) {
    nestedTypeDefinitions.clear();

    const contextDependencyKeys =
        /** @type {string[] | undefined} */ (
            schemaPayload.__meta?.context_dependency_keys
        ) ?? [
            'currentProduct',
            'currentCategory',
            'currentCollection',
            'cartState',
            'userSegment',
        ];
    const blockEntries = Object.fromEntries(
        Object.entries(schemaPayload).filter(([key]) => key !== '__meta'),
    );
    const blockKeys = Object.keys(blockEntries).sort();
    const configurationTypes = [];
    const configurationMapEntries = [];

    for (const blockKey of blockKeys) {
        configurationTypes.push(
            emitBlockConfigurationType(blockKey, blockEntries[blockKey]),
        );
        configurationMapEntries.push(
            `    ${blockKey}: ${toPascalCase(blockKey)}BlockConfiguration;`,
        );
    }

    const dataStrategies = new Set(
        blockKeys.map(
            (key) => /** @type {string} */ (blockEntries[key].data_strategy),
        ),
    );
    dataStrategies.add('cached');

    const blockTypeUnion = blockKeys.map((key) => `'${key}'`).join(' | ');
    const dataStrategyUnion = [...dataStrategies]
        .sort()
        .map((strategy) => `'${strategy}'`)
        .join(' | ');

    const nestedTypes = [...nestedTypeDefinitions.values()].join('\n\n');

    const definitionEntries = blockKeys.map((blockKey) => {
        const block = blockEntries[blockKey];
        const allowedChildren = block.allowed_children;
        const allowedChildrenType =
            allowedChildren === null
                ? 'null'
                : `[${/** @type {string[]} */ (allowedChildren).map((child) => `'${child}'`).join(', ')}]`;

        return `    ${blockKey}: {
        type: '${blockKey}';
        data_strategy: BlockDataStrategy;
        context_dependencies: string[];
        allowed_children: ${allowedChildrenType};
    };`;
    });

    const contractRuntimeEntries = blockKeys.map((blockKey) => {
        const block = blockEntries[blockKey];
        const allowedChildren = block.allowed_children;
        const allowedChildrenValue =
            allowedChildren === null
                ? 'null'
                : `[${/** @type {string[]} */ (allowedChildren).map((child) => `'${child}'`).join(', ')}]`;

        return `    ${blockKey}: {
        type: '${blockKey}',
        data_strategy: '${block.data_strategy}',
        context_dependencies: ${JSON.stringify(block.context_dependencies ?? [])},
        allowed_children: ${allowedChildrenValue},
    },`;
    });

    const contextDependencyKeysLiteral = JSON.stringify(contextDependencyKeys);

    return `/**
 * AUTO-GENERATED FILE — DO NOT EDIT MANUALLY.
 *
 * Contract: blocks.schema.json (server snapshot)
 * Regenerate: ${hint}
 */

export type BlockType = ${blockTypeUnion};

export type BlockDataStrategy = ${dataStrategyUnion};

export type BlockDefinitionExport = {
${definitionEntries.join('\n')}
};

export const VALID_BLOCK_CONTEXT_DEPENDENCIES = ${contextDependencyKeysLiteral} as const;

export type BlockContractRuntime = {
    type: BlockType;
    data_strategy: BlockDataStrategy;
    context_dependencies: readonly string[];
    allowed_children: readonly BlockType[] | null;
};

export const BLOCK_CONTRACTS: Record<BlockType, BlockContractRuntime> = {
${contractRuntimeEntries.join('\n')}
};

${nestedTypes}${nestedTypes.length > 0 ? '\n\n' : ''}${configurationTypes.join('\n\n')}

export type BlockConfigurationByType = {
${configurationMapEntries.join('\n')}
};

export type BlockConfiguration<T extends BlockType> = BlockConfigurationByType[T];
`;
}

/**
 * @param {{
 *   schemaPath: string,
 *   outputPath: string,
 *   regenerateHint: string,
 *   isCheck?: boolean,
 *   cwd: string,
 * }} options
 */
export async function runBlocksTypeGeneration(options) {
    const {
        schemaPath,
        outputPath,
        regenerateHint,
        isCheck = false,
        cwd,
    } = options;

    if (!existsSync(schemaPath)) {
        console.error(`Schema file not found: ${schemaPath}`);
        process.exit(1);
    }

    const require = createRequire(path.join(cwd, 'package.json'));
    const prettier = require('prettier');
    const blocks = JSON.parse(readFileSync(schemaPath, 'utf8'));
    const prettierConfig = (await prettier.resolveConfig(outputPath)) ?? {};
    const output = await prettier.format(generateSource(blocks, regenerateHint), {
        parser: 'typescript',
        semi: true,
        singleQuote: true,
        printWidth: 80,
        tabWidth: 4,
        trailingComma: 'all',
        ...prettierConfig,
        filepath: outputPath,
    });
    const outputLabel = path.relative(cwd, outputPath);

    if (isCheck) {
        if (!existsSync(outputPath)) {
            console.error(`${outputLabel} is missing. Run: ${regenerateHint}`);
            process.exit(1);
        }

        const existing = readFileSync(outputPath, 'utf8');

        if (existing !== output) {
            console.error(`${outputLabel} is out of date. Run: ${regenerateHint}`);
            process.exit(1);
        }

        console.log(`${outputLabel} is up to date.`);
        return;
    }

    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, output, 'utf8');
    console.log(`Wrote ${outputLabel}`);
}
