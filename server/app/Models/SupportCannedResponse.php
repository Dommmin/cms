<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\SupportCannedResponseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $title
 * @property string $shortcut
 * @property string $body
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 *
 * @method static SupportCannedResponseFactory factory($count = null, $state = [])
 * @method static Builder<static>|SupportCannedResponse newModelQuery()
 * @method static Builder<static>|SupportCannedResponse newQuery()
 * @method static Builder<static>|SupportCannedResponse query()
 * @method static Builder<static>|SupportCannedResponse whereBody($value)
 * @method static Builder<static>|SupportCannedResponse whereCreatedAt($value)
 * @method static Builder<static>|SupportCannedResponse whereId($value)
 * @method static Builder<static>|SupportCannedResponse whereShortcut($value)
 * @method static Builder<static>|SupportCannedResponse whereTitle($value)
 * @method static Builder<static>|SupportCannedResponse whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'title', 'shortcut', 'body',
])]
#[Table(name: 'support_canned_responses')]
class SupportCannedResponse extends Model
{
    use HasFactory;
}
