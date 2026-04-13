<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $campaign->subject }}</title>
</head>
<body style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'; line-height: 1.5; color: #1a1a1a; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        @if($campaign->preview_text)
            <div style="color: #666; font-size: 14px; margin-bottom: 16px;">
                {{ $campaign->preview_text }}
            </div>
        @endif

        <div style="background: #ffffff; padding: 24px; border-radius: 8px;">
            {!! $content !!}
        </div>

        @if(isset($campaign->id))
            <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
                <p style="font-size: 12px; color: #666; margin: 0;">
                    <a href="{{ url('/newsletter/unsubscribe?campaign=' . $campaign->id) }}" style="color: #666; text-decoration: underline;">
                        Unsubscribe
                    </a>
                </p>
            </div>
        @endif
    </div>
</body>
</html>