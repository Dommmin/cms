<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Order Confirmation',
                'key' => 'order.confirmation',
                'subject' => 'Order Confirmation #{{order_id}}',
                'description' => 'Sent to the customer immediately after placing an order.',
                'is_active' => true,
                'variables' => ['{{customer_name}}', '{{order_id}}', '{{order_total}}', '{{order_items}}', '{{shipping_address}}', '{{shop_name}}'],
                'body' => <<<'HTML'
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2d6a4f;">Thank you for your order, {{customer_name}}!</h1>
    <p>We have received your order <strong>#{{order_id}}</strong> and are processing it now.</p>
    <h2 style="font-size: 16px;">Order Summary</h2>
    <div>{{order_items}}</div>
    <p><strong>Total: {{order_total}}</strong></p>
    <h2 style="font-size: 16px;">Shipping To</h2>
    <p>{{shipping_address}}</p>
    <p>Thank you for shopping with <strong>{{shop_name}}</strong>!</p>
</body>
</html>
HTML,
            ],
            [
                'name' => 'Order Shipped',
                'key' => 'order.shipped',
                'subject' => 'Your Order #{{order_id}} Has Shipped!',
                'description' => 'Sent when the order is dispatched and tracking information is available.',
                'is_active' => true,
                'variables' => ['{{customer_name}}', '{{order_id}}', '{{tracking_number}}', '{{carrier_name}}', '{{tracking_url}}', '{{shop_name}}'],
                'body' => <<<'HTML'
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2d6a4f;">Your order is on its way, {{customer_name}}!</h1>
    <p>Great news! Order <strong>#{{order_id}}</strong> has been shipped.</p>
    <p><strong>Carrier:</strong> {{carrier_name}}</p>
    <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
    <p><a href="{{tracking_url}}" style="color: #2d6a4f;">Track your package</a></p>
    <p>Thank you for shopping with <strong>{{shop_name}}</strong>!</p>
</body>
</html>
HTML,
            ],
            [
                'name' => 'Order Cancelled',
                'key' => 'order.cancelled',
                'subject' => 'Your Order #{{order_id}} Has Been Cancelled',
                'description' => 'Sent when an order is cancelled, with refund information if applicable.',
                'is_active' => true,
                'variables' => ['{{customer_name}}', '{{order_id}}', '{{cancellation_reason}}', '{{refund_amount}}', '{{shop_name}}'],
                'body' => <<<'HTML'
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #c0392b;">Order Cancellation Notice</h1>
    <p>Hello {{customer_name}},</p>
    <p>Your order <strong>#{{order_id}}</strong> has been cancelled.</p>
    <p><strong>Reason:</strong> {{cancellation_reason}}</p>
    <p>If a payment was made, a refund of <strong>{{refund_amount}}</strong> will be processed within 5–10 business days.</p>
    <p>If you have any questions, please contact our support team.</p>
    <p>— <strong>{{shop_name}}</strong></p>
</body>
</html>
HTML,
            ],
            [
                'name' => 'Password Reset',
                'key' => 'password.reset',
                'subject' => 'Reset Your Password',
                'description' => 'Sent when a user requests a password reset link.',
                'is_active' => true,
                'variables' => ['{{customer_name}}', '{{reset_url}}', '{{expires_in}}', '{{shop_name}}'],
                'body' => <<<'HTML'
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1>Reset Your Password</h1>
    <p>Hello {{customer_name}},</p>
    <p>We received a request to reset the password for your account. Click the button below to set a new password.</p>
    <p style="text-align: center; margin: 30px 0;">
        <a href="{{reset_url}}" style="background-color: #2d6a4f; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
    </p>
    <p>This link will expire in <strong>{{expires_in}}</strong>.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>— <strong>{{shop_name}}</strong></p>
</body>
</html>
HTML,
            ],
            [
                'name' => 'Email Verification',
                'key' => 'email.verification',
                'subject' => 'Verify Your Email Address',
                'description' => "Sent after registration to confirm the customer's email address.",
                'is_active' => true,
                'variables' => ['{{customer_name}}', '{{verification_url}}', '{{shop_name}}'],
                'body' => <<<'HTML'
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1>Verify Your Email Address</h1>
    <p>Hello {{customer_name}},</p>
    <p>Thank you for registering! Please click the button below to verify your email address and activate your account.</p>
    <p style="text-align: center; margin: 30px 0;">
        <a href="{{verification_url}}" style="background-color: #2d6a4f; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a>
    </p>
    <p>If you did not create an account, no further action is required.</p>
    <p>— <strong>{{shop_name}}</strong></p>
</body>
</html>
HTML,
            ],
            [
                'name' => 'Newsletter Welcome',
                'key' => 'newsletter.welcome',
                'subject' => 'Welcome to Our Newsletter!',
                'description' => 'Sent automatically when a new subscriber joins the newsletter.',
                'is_active' => true,
                'variables' => ['{{subscriber_email}}', '{{shop_name}}', '{{unsubscribe_url}}'],
                'body' => <<<'HTML'
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2d6a4f;">Welcome to {{shop_name}}!</h1>
    <p>Hello!</p>
    <p>You have successfully subscribed to our newsletter. You'll be the first to know about:</p>
    <ul>
        <li>New products and collections</li>
        <li>Exclusive discounts and promotions</li>
        <li>Company news and updates</li>
    </ul>
    <p>Stay tuned for great content!</p>
    <p style="font-size: 12px; color: #999; margin-top: 40px;">
        You're receiving this email because you subscribed at {{shop_name}}.
        <a href="{{unsubscribe_url}}" style="color: #999;">Unsubscribe</a>
    </p>
</body>
</html>
HTML,
            ],
            [
                'name' => 'Return Request Approved',
                'key' => 'return.approved',
                'subject' => 'Your Return Request Has Been Approved',
                'description' => 'Sent when a return request is approved by an admin.',
                'is_active' => true,
                'variables' => ['{{customer_name}}', '{{order_id}}', '{{return_id}}', '{{refund_amount}}', '{{return_instructions}}', '{{shop_name}}'],
                'body' => <<<'HTML'
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2d6a4f;">Return Request Approved</h1>
    <p>Hello {{customer_name}},</p>
    <p>Your return request <strong>#{{return_id}}</strong> for order <strong>#{{order_id}}</strong> has been approved.</p>
    <h2 style="font-size: 16px;">Return Instructions</h2>
    <div>{{return_instructions}}</div>
    <p>Once we receive the returned items, a refund of <strong>{{refund_amount}}</strong> will be processed within 5–10 business days.</p>
    <p>Thank you for your patience.</p>
    <p>— <strong>{{shop_name}}</strong></p>
</body>
</html>
HTML,
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::query()->updateOrCreate(
                ['key' => $template['key']],
                $template,
            );
        }
    }
}
