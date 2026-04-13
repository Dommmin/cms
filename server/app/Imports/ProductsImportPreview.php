<?php

declare(strict_types=1);

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithLimit;

class ProductsImportPreview implements SkipsEmptyRows, ToCollection, WithHeadingRow, WithLimit
{
    /** @var string[] */
    private const array REQUIRED_HEADERS = ['name', 'sku', 'price'];

    private const int PREVIEW_LIMIT = 10;

    /** @var Collection<int, mixed> */
    private Collection $rows;

    public function __construct()
    {
        $this->rows = new Collection;
    }

    /** @param Collection<int, mixed> $collection */
    public function collection(Collection $collection): void
    {
        $this->rows = $collection;
    }

    public function limit(): int
    {
        return self::PREVIEW_LIMIT;
    }

    /** @return Collection<int, mixed> */
    public function getRows(): Collection
    {
        return $this->rows;
    }

    /**
     * @param  string[]  $headers
     * @return string[]
     */
    public function validateHeaders(array $headers): array
    {
        $normalizedHeaders = array_map(
            fn (string $h): string => mb_strtolower(mb_trim($h)),
            $headers,
        );

        $missing = [];

        foreach (self::REQUIRED_HEADERS as $required) {
            if (! in_array($required, $normalizedHeaders, true)) {
                $missing[] = $required;
            }
        }

        return $missing;
    }
}
