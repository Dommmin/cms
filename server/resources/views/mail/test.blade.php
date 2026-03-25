<x-mail::message>
# Mail Configuration Test

This is a test email sent from **{{ config('app.name') }}** to verify your mail configuration is working correctly.

| Detail | Value |
|--------|-------|
| Sent at | {{ $sentAt }} |
| Host | {{ config('mail.mailers.smtp.host') }} |
| Port | {{ config('mail.mailers.smtp.port') }} |
| From | {{ config('mail.from.address') }} |

If you received this email, your mail settings are configured correctly.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
