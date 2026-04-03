# Contract Testing API ↔ Frontend

## OpenAPI Specification

Generate API documentation:

```bash
php artisan scribe:generate
```

Configuration in `config/scribe.php`:

```php
'type' => 'openapi',
'base_url' => env('APP_URL') . '/api/v1',
'routes' => [
    ['match' => ['api/*']],
],
```

## Frontend Type Generation

Install `openapi-typescript`:

```bash
npm install --save-dev openapi-typescript
```

Generate types:

```bash
npx openapi-typescript http://localhost/api/docs.json -o client/types/generated.ts
```

## Contract Tests

### Backend Tests

```php
// tests/Feature/Contract/ApiContractTest.php
it('returns correct product structure', function (): void {
    $product = Product::factory()->create();
    
    $response = $this->getJson("/api/v1/products/{$product->slug}");
    
    $response->assertJsonStructure([
        'data' => [
            'id',
            'name',
            'slug',
            'price',
            'variants' => [
                '*' => [
                    'id',
                    'sku',
                    'price',
                    'stock',
                ],
            ],
        ],
    ]);
});
```

### Frontend Tests

```typescript
// client/__tests__/api/product.test.ts
import { describe, it, expect } from 'vitest';
import type { Product } from '@/types/generated';

describe('Product API contract', () => {
    it('matches TypeScript type', async () => {
        const response = await fetch('/api/v1/products/test-product');
        const data: Product = await response.json();
        
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('slug');
        expect(typeof data.price).toBe('number');
    });
});
```

## Breaking Change Detection

Run in CI:

```yaml
- name: Validate API Contract
  run: |
    php artisan scribe:generate
    npx openapi-typescript ./public/docs/openapi.json -o /tmp/types.ts
    diff -u client/types/generated.ts /tmp/types.ts || (echo "API contract changed" && exit 1)
```

## Type Safety

Backend uses PHPStan:

```bash
vendor/bin/phpstan analyse
```

Frontend uses TypeScript strict mode:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
```
