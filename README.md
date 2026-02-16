# FenrirWebsite
website fenrir

## Services

This project uses Docker Compose to orchestrate multiple services:

- **nginx-proxy**: Reverse proxy with automatic SSL/TLS certificate generation
- **PocketBase**: Backend service and admin dashboard
- **Site**: Main Fenrir website

## PocketBase Admin Dashboard

The PocketBase admin dashboard is accessible at:
- Production: `https://pocketbase.fenrirclub.be/admin`
- The dashboard was previously at `/_/` but has been moved to `/admin` for better accessibility

### Configuration

PocketBase is configured via environment variables in a `.env` file (not committed to git):

```bash
PB_ADMIN_EMAIL=your-email@example.com
PB_ADMIN_PASSWORD=your-secure-password
```

### API Access

The PocketBase API is available at:
- `https://pocketbase.fenrirclub.be/api/`

## Deployment

The site uses nginx-proxy for automatic SSL certificate generation via Let's Encrypt.

```bash
docker compose up -d
```
