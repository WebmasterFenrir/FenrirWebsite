# FenrirWebsite
website fenrir

## Services

This project uses Docker Compose to orchestrate multiple services:

- **nginx-proxy**: Reverse proxy with automatic SSL/TLS certificate generation
- **PocketBase**: Backend service with admin dashboard
- **Site**: Main Fenrir website

## PocketBase Admin Dashboard

The PocketBase admin dashboard is accessible at:
- Production: `https://admin.fenrirclub.be/`

**Note:** The API endpoints are NOT exposed to the outside. They are only accessible internally within the Docker network.

### Configuration

PocketBase is configured via environment variables in a `.env` file (not committed to git):

```bash
PB_ADMIN_EMAIL=your-email@example.com
PB_ADMIN_PASSWORD=your-secure-password
```

## Deployment

The site uses nginx-proxy for automatic SSL certificate generation via Let's Encrypt.

```bash
docker compose up -d
```
