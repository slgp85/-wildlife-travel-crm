# Deploying to a VPS

Requirements: a Linux VPS with Docker + Docker Compose, a domain whose **A record points to the server IP**, and ports 80/443 open.

```bash
git clone https://github.com/slgp85/-wildlife-travel-crm.git app && cd app
cp .env.production.example .env      # then edit: DOMAIN, POSTGRES_PASSWORD, SECRET_KEY
docker compose -f docker-compose.prod.yml up -d --build
```

Caddy obtains the HTTPS certificate automatically on first request (DNS must already resolve).

**Immediately after the first start, open `https://YOUR_DOMAIN` and create your account.**
Until the first account exists, sign-up is open to anyone who finds the site. After that it closes.

Update later: `git pull && docker compose -f docker-compose.prod.yml up -d --build`

Backup: `docker compose -f docker-compose.prod.yml exec -T db pg_dump -U crm wildlife_travel_crm > backup.sql`
