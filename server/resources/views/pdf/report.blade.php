<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $report->name }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #333; padding: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
        .header p { color: #666; font-size: 12px; }
        .meta { display: flex; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; background: #f0f0f0; color: #555; border: 1px solid #ddd; }
        .summary { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .summary-card { flex: 1; min-width: 120px; border: 1px solid #ddd; border-radius: 6px; padding: 12px 16px; }
        .summary-card .label { font-size: 10px; text-transform: uppercase; color: #999; letter-spacing: 0.5px; margin-bottom: 4px; }
        .summary-card .value { font-size: 18px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead tr { background: #f5f5f5; }
        th { padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 0.5px; border-bottom: 2px solid #ddd; white-space: nowrap; }
        td { padding: 8px 10px; border-bottom: 1px solid #eee; }
        tr:last-child td { border-bottom: none; }
        tr:nth-child(even) td { background: #fafafa; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; color: #999; font-size: 11px; text-align: center; }
        .empty { text-align: center; padding: 40px; color: #999; font-style: italic; }
        .row-count { margin-top: 12px; font-size: 11px; color: #999; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $report->name }}</h1>
        <p>
            Generated: {{ now()->format('d/m/Y H:i') }}
            &nbsp;&mdash;&nbsp;
            Data source: {{ ucfirst($report->data_source) }}
            @if($report->chart_type)
                &nbsp;&mdash;&nbsp;
                Chart: {{ ucfirst($report->chart_type) }}
            @endif
        </p>
        @if($report->description)
        <p style="margin-top: 6px; color: #555;">{{ $report->description }}</p>
        @endif
    </div>

    @if(!empty($report->metrics))
    <div class="meta">
        @foreach($report->metrics as $metric)
        <span class="badge">{{ $metric }}</span>
        @endforeach
    </div>
    @endif

    @php
        $summary = $results['summary'] ?? [];
        $data    = $results['data'] ?? [];
        $columns = $results['columns'] ?? (empty($data) ? [] : array_keys($data[0]));
    @endphp

    @if(!empty($summary))
    <div class="summary">
        @foreach($summary as $key => $value)
        <div class="summary-card">
            <div class="label">{{ str_replace('_', ' ', $key) }}</div>
            <div class="value">{{ $value }}</div>
        </div>
        @endforeach
    </div>
    @endif

    @if(empty($data))
        <div class="empty">No data found for this report configuration.</div>
    @else
    <table>
        <thead>
            <tr>
                @foreach($columns as $col)
                <th>{{ str_replace('_', ' ', $col) }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($data as $row)
            <tr>
                @foreach($columns as $col)
                <td>{{ $row[$col] ?? '—' }}</td>
                @endforeach
            </tr>
            @endforeach
        </tbody>
    </table>
    <div class="row-count">{{ count($data) }} row{{ count($data) !== 1 ? 's' : '' }}</div>
    @endif

    <div class="footer">
        <p>{{ config('app.name') }} &mdash; Custom Report Export</p>
    </div>
</body>
</html>
