<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Theme
 */
class ThemeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Theme $theme */
        $theme = $this->resource;

        return [
            'slug' => $theme->slug,
            'tokens' => $theme->tokens,
            'dark_tokens' => $theme->dark_tokens,
            'typography' => $theme->typography,
            'spacing' => $theme->spacing,
            'buttons' => $theme->buttons,
            'containers' => $theme->containers,
            'font_sources' => $theme->font_sources,
            'branding' => $theme->branding,
        ];
    }
}
