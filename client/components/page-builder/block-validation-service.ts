import {
    BLOCK_CONTRACTS,
    VALID_BLOCK_CONTEXT_DEPENDENCIES,
    type BlockType,
} from '@/types/generated/blocks.generated';

import { blockRegistry } from './block-registry';
import type { BlockValidationResult } from './block-validation-service.types';

const VALID_CONTEXT_DEPENDENCY_SET = new Set<string>(
    VALID_BLOCK_CONTEXT_DEPENDENCIES,
);

const VALID_DATA_STRATEGIES = new Set([
    'none',
    'server',
    'client',
    'hybrid',
    'cached',
]);

export const BLOCK_CONTRACT_VIOLATION_WARNING =
    'Block contract validation failed';

export function warnBlockContractViolation(
    blockType: string,
    errors: string[],
): void {
    console.warn(BLOCK_CONTRACT_VIOLATION_WARNING, { blockType, errors });
}

export function validateBlockContract(
    blockType: string,
): BlockValidationResult {
    const errors: string[] = [];

    if (!(blockType in BLOCK_CONTRACTS)) {
        errors.push(`Block type [${blockType}] is not registered in contract.`);

        return { valid: false, errors };
    }

    const contract = BLOCK_CONTRACTS[blockType as BlockType];

    if (!contract.data_strategy) {
        errors.push(
            `Block type [${blockType}] is missing required field [data_strategy].`,
        );
    } else if (!VALID_DATA_STRATEGIES.has(contract.data_strategy)) {
        errors.push(
            `Block type [${blockType}] has invalid data_strategy [${contract.data_strategy}].`,
        );
    }

    const seenDependencies = new Set<string>();

    for (const dependency of contract.context_dependencies) {
        if (!VALID_CONTEXT_DEPENDENCY_SET.has(dependency)) {
            errors.push(
                `Block type [${blockType}] has invalid context dependency [${dependency}].`,
            );
        }

        if (seenDependencies.has(dependency)) {
            errors.push(
                `Block type [${blockType}] context_dependencies contains duplicate [${dependency}].`,
            );
        }

        seenDependencies.add(dependency);
    }

    if (contract.allowed_children !== null) {
        if (contract.allowed_children.length === 0) {
            errors.push(
                `Block type [${blockType}] field [allowed_children] must not be empty when defined.`,
            );
        }

        const seenChildren = new Set<string>();

        for (const childType of contract.allowed_children) {
            if (!(childType in BLOCK_CONTRACTS)) {
                errors.push(
                    `Block type [${blockType}] allowed_children references unknown block type [${childType}].`,
                );
            }

            if (seenChildren.has(childType)) {
                errors.push(
                    `Block type [${blockType}] allowed_children contains duplicate [${childType}].`,
                );
            }

            seenChildren.add(childType);
        }
    }

    if (!(blockType in blockRegistry)) {
        errors.push(
            `Block type [${blockType}] is not registered in storefront renderer registry.`,
        );
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
