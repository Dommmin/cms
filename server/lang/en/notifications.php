<?php

declare(strict_types=1);

return [
    'newsletter_confirmation' => [
        'subject' => 'Please confirm your newsletter subscription',
        'greeting' => 'Hello:name!',
        'line1' => 'Thank you for subscribing to our newsletter.',
        'line2' => 'Please click the button below to confirm your subscription.',
        'action' => 'Confirm Subscription',
        'line3' => 'If you did not sign up for this newsletter, you can safely ignore this email.',
    ],
    'newsletter_welcome' => [
        'subject' => 'Welcome to our newsletter!',
        'greeting' => 'Welcome:name!',
        'line1' => "Your subscription has been confirmed. You're now on our list!",
        'line2' => "You'll receive updates about new products, promotions, and news from us.",
        'line3' => 'If you ever want to unsubscribe, click the link below.',
        'action' => 'Unsubscribe',
    ],
];
