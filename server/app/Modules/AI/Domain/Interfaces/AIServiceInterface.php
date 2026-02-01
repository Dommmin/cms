<?php

declare(strict_types=1);

namespace App\Modules\AI\Domain\Interfaces;

/**
 * AI Service Interface
 * For content generation, module generation, etc.
 */
interface AIServiceInterface
{
    /**
     * Generate content based on prompt
     */
    public function generateContent(string $prompt, array $context = []): string;

    /**
     * Generate Laravel module structure
     */
    public function generateModule(string $moduleName, array $requirements): array;

    /**
     * Generate Filament form component code
     */
    public function generateForm(array $fields): string;

    /**
     * Generate privacy policy or terms
     */
    public function generatePolicy(string $type, array $context): string;

    /**
     * Generate product description
     */
    public function generateProductDescription(array $productData): string;
}

