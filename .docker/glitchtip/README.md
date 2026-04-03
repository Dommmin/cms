# GlitchTip Local Stack

Repo keeps GlitchTip as a separate self-hosted stack so the CMS app compose stays focused on the product itself.

## 1. Download upstream compose

Use the official GlitchTip compose file from the deployment guide:

```bash
cd /Users/domin/projects/laravel/cms/.docker/glitchtip
wget https://raw.githubusercontent.com/glitchtip/glitchtip/master/compose.sample.yml -O compose.yml
```

For a lighter local setup you can use `compose.minimal.yml` instead of `compose.sample.yml`.

## 2. Configure env

```bash
cp .env.example .env
```

Set strong passwords and a real `SECRET_KEY`.

## 3. Run

From the repo root:

```bash
make glitchtip-up
```

Then open [http://localhost:8000](http://localhost:8000), create:

- organization: `cms`
- project: `cms-api`
- project: `cms-frontend`

Copy DSNs into:

- `server/.env` → `GLITCHTIP_DSN`
- client build env → `NEXT_PUBLIC_GLITCHTIP_DSN`
