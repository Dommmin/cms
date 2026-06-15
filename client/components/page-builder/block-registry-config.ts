export const BLOCK_NOT_REGISTERED_WARNING = 'Block not registered in registry';

export function isBlockRegistryStrictMode(): boolean {
    return process.env.BLOCK_REGISTRY_STRICT_MODE === 'true';
}

export function warnBlockNotRegistered(blockType: string): void {
    console.warn(BLOCK_NOT_REGISTERED_WARNING, { blockType });
}
