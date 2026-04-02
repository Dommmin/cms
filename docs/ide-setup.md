# IDE Setup — Auto-formatting

Configure your IDE to auto-format on save, so `make fix` runs less often.

---

## PhpStorm

### PHP (Pint)
1. Settings → PHP → Quality Tools → PHP CS Fixer
2. Set path: `<project>/server/vendor/bin/pint` (local PHP must be available, or use Docker interpreter)
3. Alternatively: use **Laravel Pint** plugin from JetBrains Marketplace
4. Settings → Editor → Code Style → PHP → Set from… → PSR-12

### Prettier (TS/TSX/CSS)
1. Settings → Languages & Frameworks → JavaScript → Prettier
2. Prettier package: `<project>/server/node_modules/prettier` (or `client/node_modules/prettier`)
3. Enable **"Run on save"**
4. File patterns: `{**/*.ts,**/*.tsx,**/*.css,**/*.json}`

### ESLint
1. Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Enable **Automatic ESLint configuration**
3. Enable **"Run eslint --fix on save"**

### Tailwind CSS
Install **Tailwind CSS** plugin — gives class autocomplete and ordering hints.

---

## VS Code

### Extensions to install
```
esbenp.prettier-vscode          # Prettier
dbaeumer.vscode-eslint          # ESLint
bmewburn.vscode-intelephense-client  # PHP IntelliSense
onecentlin.laravel-blade        # Blade syntax
bradlc.vscode-tailwindcss       # Tailwind autocomplete
```

### `.vscode/settings.json` (add to repo or personal settings)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[php]": {
    "editor.defaultFormatter": null,
    "editor.formatOnSave": false
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.workingDirectories": [
    { "directory": "server", "changeProcessCWD": true },
    { "directory": "client", "changeProcessCWD": true }
  ],
  "prettier.configPath": "client/.prettierrc",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

### PHP formatting in VS Code
Prettier does not format PHP. Use one of:
- **php cs fixer** extension + configure to use `server/vendor/bin/pint` binary
- Or just run `make fix` manually after PHP changes — Pint runs fast

---

## What auto-formatting covers

| Tool                      | Auto-fixes                             | Must still run manually      |
|---------------------------|----------------------------------------|------------------------------|
| Prettier (IDE)            | TS/TSX/CSS/JSON spacing, imports order | —                            |
| ESLint --fix (IDE)        | Fixable lint rules                     | Non-auto-fixable lint errors |
| Pint (IDE, if configured) | PHP style (PSR-12)                     | —                            |
| `make fix`                | Everything above + Rector refactors    | —                            |
| `make check`              | —                                      | Run before every push        |

Even with IDE auto-format, always run `make fix && make check` before committing — IDE formatters
may miss files or have slightly different configs than the project's Prettier/ESLint config.
