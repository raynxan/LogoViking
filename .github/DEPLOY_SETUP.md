# Deploying LogoViking to Hostinger

## One-time setup (do this before your first push)

### 1. Push code to GitHub
Create a private repo on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/logoviking.git
git push -u origin main
```

### 2. Add GitHub Secrets
Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret.

Add these 4 secrets:

| Secret name | Where to find the value |
|---|---|
| `HOSTINGER_HOST` | hPanel → Advanced → SSH Access → Hostname (e.g. `srv1234.hstgr.io`) |
| `HOSTINGER_USER` | hPanel → Advanced → SSH Access → Username (e.g. `u123456789`) |
| `HOSTINGER_SSH_KEY` | Your private SSH key (see step 3 below) |
| `HOSTINGER_REMOTE_PATH` | Full path to your app folder, e.g. `/home/u123456789/domains/yourdomain.com/public_html` |

### 3. Generate and register an SSH key
On your local machine (or Replit shell):
```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/hostinger_deploy -N ""
cat ~/.ssh/hostinger_deploy       # <-- paste this entire output as HOSTINGER_SSH_KEY
cat ~/.ssh/hostinger_deploy.pub   # <-- add this to Hostinger
```

In hPanel → Advanced → SSH Keys → paste the `.pub` content and click Add Key.

### 4. Set environment variables on Hostinger
In hPanel → your Node.js app → Environment Variables, add:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=<64-char random string>
GOOGLE_CLIENT_ID=<your OAuth client id>
GOOGLE_CLIENT_SECRET=<your OAuth client secret>
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
ALLOWED_ORIGINS=https://yourdomain.com
```

Generate a strong SESSION_SECRET with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Install PM2 on Hostinger (first time only)
SSH into Hostinger and run:
```bash
npm install -g pm2
pm2 startup    # follow the instructions it prints
```

### 6. Configure the Node.js app in hPanel
hPanel → Websites → your domain → Node.js:
- Node.js version: 20 or 22
- Application root: `/home/u123456789/domains/yourdomain.com/public_html`
- Application startup file: `dist/index.mjs`

---

## How it works after setup

Every time you push to `main`:
1. GitHub Actions installs dependencies and runs `tsc` typecheck
2. Builds the API server (`esbuild` → `dist/index.mjs`)
3. Builds the React frontend (`vite build` → `public/`)
4. `rsync`s only changed files to Hostinger (fast, skips `.env`)
5. SSHes in and runs `pm2 restart logoviking`

The whole deploy takes ~2-3 minutes.

## Database (PostgreSQL)

Hostinger shared hosting only includes MySQL. Use one of these free PostgreSQL options:
- **Neon** (neon.tech) — free tier, serverless Postgres, get a connection string and paste it as `DATABASE_URL`
- **Supabase** (supabase.com) — free tier, includes Postgres

After first deploy, run the database migration once via SSH:
```bash
ssh user@srv1234.hstgr.io
cd /home/u123456789/domains/yourdomain.com/public_html
npx drizzle-kit push --config ./drizzle.config.ts   # if config is deployed
# or manually run the SQL from lib/db/migrations/
```
