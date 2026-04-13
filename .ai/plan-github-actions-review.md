# Plan: AI Code Review via GitHub Actions

> **Status:** Plan (do wdrożenia opcjonalnie)
> **Cel:** Automatyczny code review na każdym PR przez AI (Claude + opcjonalnie Codex)

---

## Architektura

```
PR opened/updated
       │
       ▼
┌──────────────────┐
│ GitHub Actions    │
│ ai-review.yml    │
└──────┬───────────┘
       │
       ├──► Job 1: Claude Review (claude-code CLI)
       │    - Security scan
       │    - Standards compliance
       │    - Performance review
       │
       ├──► Job 2: Codex Review (opcjonalnie)
       │    - Code quality
       │    - Bug detection
       │    - Suggestions
       │
       └──► Job 3: Summary
            - Zbiera wyniki obu reviewerów
            - Komentarz na PR
```

---

## Job 1: Claude Review

### Wymagania
- Secret: `ANTHROPIC_API_KEY`
- Claude Code CLI zainstalowany w runnerze

### Workflow

```yaml
# .github/workflows/ai-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize, ready_for_review]

# Nie uruchamiaj na draft PR
concurrency:
  group: ai-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  claude-review:
    if: "!github.event.pull_request.draft"
    runs-on: ubuntu-latest
    timeout-minutes: 10
    permissions:
      pull-requests: write
      contents: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # pełna historia dla diff

      - name: Get changed files
        id: changed
        run: |
          echo "files=$(git diff --name-only origin/${{ github.base_ref }}...HEAD | tr '\n' ' ')" >> $GITHUB_OUTPUT
          echo "diff<<EOF" >> $GITHUB_OUTPUT
          git diff origin/${{ github.base_ref }}...HEAD >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Claude Review
        id: review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # Przygotuj prompt z diffem
          claude -p "
          Zrób code review tego diffu z projektu CMS (Laravel + Next.js).

          Sprawdź:
          1. Bezpieczeństwo (OWASP Top 10, XSS, SQL injection, CSRF)
          2. Wydajność (N+1, eager loading, unnecessary renders)
          3. Standardy:
             - PHP: declare(strict_types=1), Model::query(), FormRequest, ApiController
             - TS: typy w .types.ts, brak 'as any', useLocalePath()
          4. Pokrycie testami

          Format: markdown z severity [CRITICAL/HIGH/MEDIUM/LOW]
          Jeśli wszystko OK — napisz 'LGTM' z krótkim podsumowaniem.

          Zmienione pliki: ${{ steps.changed.outputs.files }}

          Diff:
          ${{ steps.changed.outputs.diff }}
          " --output-format text > review.md

      - name: Post review comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('review.md', 'utf8');
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## 🤖 Claude Code Review\n\n${review}\n\n---\n*Automated review by Claude Sonnet*`
            });
```

### Konfiguracja

| Setting | Wartość | Uwagi |
|---------|---------|-------|
| Model | sonnet | Tańszy, wystarczający do review |
| Timeout | 10 min | Limit kosztu |
| Trigger | PR opened + synchronize | Nie na draft |
| Concurrency | Per PR | Cancel starszych reviewów |

### Koszt szacunkowy
- ~$0.01-0.05 per review (sonnet, średni diff ~500 linii)
- ~$5-25/miesiąc przy 20 PR/tydzień

---

## Job 2: Codex Review (opcjonalnie)

### Wymagania
- Secret: `OPENAI_API_KEY`
- OpenAI Codex CLI lub API

### Opcja A: Codex CLI (codex-cli)

```yaml
  codex-review:
    if: "!github.event.pull_request.draft"
    runs-on: ubuntu-latest
    timeout-minutes: 10
    permissions:
      pull-requests: write
      contents: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Codex CLI
        run: npm install -g @openai/codex

      - name: Run Codex Review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          DIFF=$(git diff origin/${{ github.base_ref }}...HEAD)
          codex --approval-mode full-auto \
            --quiet \
            "Review this code diff for bugs, security issues, and improvements. Output markdown. Diff: $DIFF" \
            > codex-review.md

      - name: Post Codex review
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('codex-review.md', 'utf8');
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## 🔍 Codex Code Review\n\n${review}\n\n---\n*Automated review by OpenAI Codex*`
            });
```

### Opcja B: OpenAI API (bezpośrednio)

```yaml
      - name: Run OpenAI Review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          DIFF=$(git diff origin/${{ github.base_ref }}...HEAD | head -c 50000)
          curl -s https://api.openai.com/v1/chat/completions \
            -H "Authorization: Bearer $OPENAI_API_KEY" \
            -H "Content-Type: application/json" \
            -d "$(jq -n --arg diff "$DIFF" '{
              model: "o3-mini",
              messages: [{
                role: "system",
                content: "You are a code reviewer for a Laravel + Next.js CMS. Review for security, performance, and code quality. Output concise markdown."
              }, {
                role: "user",
                content: ("Review this diff:\n\n" + $diff)
              }]
            }')" | jq -r '.choices[0].message.content' > codex-review.md
```

---

## Job 3: Summary (opcjonalnie)

Zbiera wyniki obu reviewerów i tworzy podsumowanie:

```yaml
  review-summary:
    needs: [claude-review, codex-review]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Summary label
        uses: actions/github-script@v7
        with:
          script: |
            // Dodaj label na podstawie wyników
            const labels = [];
            if ('${{ needs.claude-review.result }}' === 'success') labels.push('ai-reviewed');
            if (labels.length > 0) {
              await github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                labels
              });
            }
```

---

## Wdrożenie krok po kroku

1. Dodaj `ANTHROPIC_API_KEY` do GitHub Secrets
2. (Opcjonalnie) Dodaj `OPENAI_API_KEY`
3. Utwórz `.github/workflows/ai-review.yml` z Job 1
4. Przetestuj na testowym PR
5. Dostosuj prompt na podstawie jakości reviewów
6. (Opcjonalnie) Dodaj Job 2 (Codex) i Job 3 (Summary)

## Ryzyka i mitigacje

| Ryzyko | Mitigacja |
|--------|-----------|
| Koszty przy dużej ilości PR | Concurrency + cancel-in-progress, timeout 10min |
| Fałszywe alarmy | Instrukcja "LGTM jeśli OK", severity levels |
| Secrets w logach | `--quiet` mode, nie loguj pełnego diffu |
| Rate limits API | Retry z backoff, concurrency group |
| Duże diffy (>100KB) | `head -c 50000` na diff, skip binary files |
