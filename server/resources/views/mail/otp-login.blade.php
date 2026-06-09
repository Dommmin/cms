<x-mail::message>
# Jednorazowy kod logowania

Użyj poniższego kodu, aby zalogować się do swojego konta w **{{ config('app.name') }}**:

<x-mail::panel>
# {{ $code }}
</x-mail::panel>

Kod jest ważny przez 5 minut. Jeśli to nie Ty próbowałeś się zalogować, zignoruj tę wiadomość.

Dziękujemy,<br>
Zespół {{ config('app.name') }}
</x-mail::message>
