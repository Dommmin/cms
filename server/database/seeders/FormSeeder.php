<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Form;
use App\Models\FormField;
use Illuminate\Database\Seeder;

class FormSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedContactForm();
    }

    private function seedContactForm(): void
    {
        $form = Form::query()->updateOrCreate(['slug' => 'contact'], [
            'name' => 'Contact Form',
            'description' => 'General contact form',
            'notification_email' => null,
            'success_message' => "Thank you for your message! We'll get back to you within 1-2 business days.",
            'allow_multiple' => true,
            'is_active' => true,
        ]);

        $form->fields()->delete();

        $fields = [
            [
                'name' => 'name',
                'label' => 'Full Name',
                'type' => 'text',
                'position' => 1,
                'is_required' => true,
            ],
            [
                'name' => 'email',
                'label' => 'Email Address',
                'type' => 'email',
                'position' => 2,
                'is_required' => true,
            ],
            [
                'name' => 'subject',
                'label' => 'Subject',
                'type' => 'text',
                'position' => 3,
                'is_required' => true,
            ],
            [
                'name' => 'message',
                'label' => 'Message',
                'type' => 'textarea',
                'position' => 4,
                'is_required' => true,
            ],
        ];

        foreach ($fields as $field) {
            FormField::query()->create(array_merge($field, ['form_id' => $form->id]));
        }
    }
}
