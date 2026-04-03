---
name: fix
description: Uruchamia make fix (pint + rector + eslint + prettier) na projekcie. Auto-fix formatowania.
disable-model-invocation: true
---

Uruchom auto-fix formatting na całym projekcie:

```bash
make fix
```

To uruchamia sekwencyjnie:
1. PHP: pint → rector → pint
2. JS/TS: eslint --fix → prettier

Pokaż wynik. Jeśli są błędy których auto-fix nie naprawił — wylistuj je.
