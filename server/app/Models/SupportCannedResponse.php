<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $title
 * @property string $shortcut
 * @property string $body
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Database\Factories\SupportCannedResponseFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportCannedResponse newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportCannedResponse newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportCannedResponse query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportCannedResponse whereBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportCannedResponse whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportCannedResponse whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportCannedResponse whereShortcut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportCannedResponse whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupportCannedResponse whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'title', 'shortcut', 'body',
])]
#[Table(name: 'support_canned_responses')]
class SupportCannedResponse extends Model
{
    use HasFactory;
}
