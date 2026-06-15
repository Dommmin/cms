import type { BlockType } from '@/types/api';

import {
    BLOCK_CONTRACT_VIOLATION_WARNING,
    validateBlockContract,
    warnBlockContractViolation,
} from './block-validation-service';

export function usePreRenderBlockValidation(blockType: BlockType): void {
    const validation = validateBlockContract(blockType);

    if (validation.valid) {
        return;
    }

    warnBlockContractViolation(blockType, validation.errors);

    throw new Error(
        `${BLOCK_CONTRACT_VIOLATION_WARNING}: ${blockType} (${validation.errors.join('; ')})`,
    );
}
