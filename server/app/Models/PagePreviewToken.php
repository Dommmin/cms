<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $page_id
 * @property int|null $page_version_id
 * @property string $token_hash
 * @property Carbon $expires_at
 * @property int|null $created_by
 * @property int $id
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $creator
 * @property-read Page $page
 * @property-read PageVersion|null $version
 *
 * @method static Builder<static>|PagePreviewToken newModelQuery()
 * @method static Builder<static>|PagePreviewToken newQuery()
 * @method static Builder<static>|PagePreviewToken query()
 * @method static Builder<static>|PagePreviewToken whereCreatedAt($value)
 * @method static Builder<static>|PagePreviewToken whereCreatedBy($value)
 * @method static Builder<static>|PagePreviewToken whereExpiresAt($value)
 * @method static Builder<static>|PagePreviewToken whereId($value)
 * @method static Builder<static>|PagePreviewToken wherePageId($value)
 * @method static Builder<static>|PagePreviewToken wherePageVersionId($value)
 * @method static Builder<static>|PagePreviewToken whereTokenHash($value)
 * @method static Builder<static>|PagePreviewToken whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'page_id', 'page_version_id', 'token_hash', 'expires_at', 'created_by',
])]
#[Table(name: 'page_preview_tokens')]
class PagePreviewToken extends Model
{
    use HasFactory;

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'page_id');
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(PageVersion::class, 'page_version_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
