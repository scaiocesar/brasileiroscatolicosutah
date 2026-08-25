# Brasileiros Católicos Utah

Site moderno da comunidade **Brasileiros Católicos Utah** (`brasileiroscatolicosutah.org`), com área administrativa multi-usuário, destaque automático da arte da missa, calendário de eventos e SEO em português.

## Stack

- [Astro 5](https://astro.build/) + Tailwind CSS
- Cloudflare Workers (Static Assets) + D1 + R2
- Auth próprio (e-mail/senha, papéis `admin` e `editor`)

## Desenvolvimento local

Requisitos: **Node.js 22.12+** e conta Cloudflare (para deploy).

```bash
npm install
npx wrangler login
```

### 1. Criar D1 e R2 (uma vez, no Cloudflare)

No dashboard ou via CLI:

```bash
npx wrangler d1 create brasileiroscatolicosutah
npx wrangler r2 bucket create brasileiroscatolicosutah-media
```

Copie o `database_id` gerado para [`wrangler.jsonc`](wrangler.jsonc) no campo `d1_databases[0].database_id`.

### 2. Migrar e popular o banco local

```bash
npm run db:migrate:local
npm run db:seed
```

Credenciais padrão do seed:

- E-mail: `admin@brasileiroscatolicosutah.org`
- Senha: `TrocarSenha123!`

Para customizar:

```bash
node scripts/generate-seed.mjs seu@email.com 'SuaSenhaSegura' 'Seu Nome'
npx wrangler d1 execute brasileiroscatolicosutah --local --file=scripts/seed-admin.sql
```

### 3. Rodar o site

```bash
npm run dev
```

- Site: http://localhost:4321
- Admin: http://localhost:4321/admin/login

## Deploy em produção

```bash
npm run db:migrate:remote
npm run db:seed:remote
npm run deploy
```

Depois, no Cloudflare Dashboard → Workers → `brasileiroscatolicosutah` → Settings → Domains:

1. Adicione o domínio customizado `brasileiroscatolicosutah.org`
2. Aponte o DNS do domínio para a Cloudflare

### Redirect do site antigo (opcional)

Quando o DNS do `.com` estiver na Cloudflare, crie um redirect 301 de `brasileiroscatolicosemsaltlake.com` → `https://brasileiroscatolicosutah.org`.

## Área admin

| Papel | Pode |
|-------|------|
| **admin** | Usuários, configurações, artes, horários, eventos |
| **editor** | Artes da missa, horários, eventos |

### Arte da missa em evidência

1. Em **Arte da missa**, envie a imagem e a data/hora do evento
2. Enquanto a data não passou, a arte aparece **logo abaixo do banner** na home (e na página de missa)
3. Depois da data, some automaticamente — sem precisar apagar

## Páginas públicas

- `/` — início + destaque da missa
- `/missa` — horário e local
- `/eventos` — calendário
- `/contato` — telefone, WhatsApp, redes
- `/admin` — painel

## SEO

Meta tags, Open Graph, `sitemap.xml`, `robots.txt` e JSON-LD (`CatholicChurch` + `Event`) com palavras-chave como *missa em português*, *missa Utah*, *brasileiros católicos Salt Lake City*, etc.

## Estrutura útil

```
migrations/0001_init.sql   # schema D1
scripts/generate-seed.mjs  # gera seed do admin
src/pages/                 # páginas e APIs
src/lib/                   # auth, db, datas
public/images/             # logo, hero, QR (do site antigo)
```
