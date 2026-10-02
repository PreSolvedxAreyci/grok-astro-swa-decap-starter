# Decap CMS GitHub OAuth (Azure SWA)

In-repo Azure Functions proxy (no Netlify Identity):

| Path | Role |
|------|------|
| `GET /api/auth` | Redirect to GitHub authorize |
| `GET /api/callback` | Exchange `code` → token; `postMessage` to Decap |

## GitHub OAuth App

- Homepage URL: `https://grokdemo.juankibin.space`
- Authorization callback URL: `https://grokdemo.juankibin.space/api/callback`
- Create under org/user: GitHub → Settings → Developer settings → OAuth Apps

## SWA Application settings (never commit)

| Name | Purpose |
|------|---------|
| `GITHUB_CLIENT_ID` | OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | OAuth App client secret |
| `SITE_URL` | `https://grokdemo.juankibin.space` |
| `OAUTH_REDIRECT_URI` | `https://grokdemo.juankibin.space/api/callback` |
| `GITHUB_OAUTH_SCOPE` | Optional; default `repo,user` |

```bash
az staticwebapp appsettings set \
  -n grok-astro-swa-decap \
  -g rg-website-hosting-sea \
  --setting-names \
    GITHUB_CLIENT_ID=... \
    GITHUB_CLIENT_SECRET=... \
    SITE_URL=https://grokdemo.juankibin.space \
    OAUTH_REDIRECT_URI=https://grokdemo.juankibin.space/api/callback
```

## Decap `config.yml`

```yaml
backend:
  base_url: https://grokdemo.juankibin.space
  auth_endpoint: api/auth
```
