import type { ComponentType } from 'react';

import type { BlockType } from '@/types/api';

import type { BlockRendererProps } from './block-renderer.types';

export type BlockRegistryComponent = ComponentType<BlockRendererProps>;

export type BlockRegistry = Record<BlockType, BlockRegistryComponent>;
