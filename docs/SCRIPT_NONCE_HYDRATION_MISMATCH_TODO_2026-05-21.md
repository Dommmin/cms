# Script Nonce Hydration Mismatch - TODO

Data: 2026-05-21

## Problem

W lokalnym smoke teście publicznego frontendu Next.js pojawia się błąd hydracji:

```text
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
...
<Script id="theme-init" ...>
  <script
+   nonce={undefined}
-   nonce=""
...
<Script id="consent-de..." ...>
  <script
+   nonce={undefined}
-   nonce=""
```

Problem był widoczny na:

- `http://localhost:3000/products`
- `http://localhost:3000/products/sony-43-full-hd-smart-tv-ultra-syfjv`

## Dlaczego To Naprawić

React nie patchuje tej różnicy po hydracji. W trybie dev powoduje błąd konsoli, a w produkcji może maskować realne problemy hydracji oraz utrudniać debugowanie CSP/nonce dla skryptów inline.

## Prawdopodobna Przyczyna

`next/script` renderuje atrybut `nonce` inaczej po stronie serwera i klienta. SSR zwraca pusty nonce (`nonce=""`), a klient renderuje `nonce={undefined}`.

Do sprawdzenia w pierwszej kolejności:

- `client/app/layout.tsx`
- komponenty lub helpery ustawiające CSP nonce dla `<Script />`
- konfiguracja nagłówków CSP w `client/next.config.ts` lub warstwie proxy/nginx

## Zalecana Naprawa

Ujednolicić przekazywanie `nonce` do wszystkich inline `<Script />`:

- albo zawsze przekazywać prawidłowy nonce z requestu,
- albo nie renderować atrybutu `nonce`, jeśli nonce nie jest dostępny,
- unikać sytuacji, w której SSR renderuje pusty string, a klient `undefined`.

Po naprawie uruchomić:

```bash
docker compose exec node npx tsc
docker compose exec node npm run build
```

I wykonać browser smoke test dla:

- `/products`
- przykładowej strony produktu

