<?php

declare(strict_types=1);

namespace App\Events;

use App\Modules\Forms\Domain\Models\Form;
use App\Modules\Forms\Domain\Models\FormSubmission;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Form Submitted Event
 * Dispatched when a form is submitted
 */
class FormSubmitted
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public readonly FormSubmission $submission,
        public readonly Form $form
    ) {}
}
