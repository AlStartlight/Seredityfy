# ===========================================
# SEREDITFY - VPS Deployment Guide
# ===========================================

## Prerequisites

- VPS with Ubuntu 22.04 LTS (8GB RAM recommended)
- SSH access to VPS
- Domain name (optional, but recommended)
- Git repository with your code

---

## Quick Setup (Step by Step)

### Step 1: SSH to your VPS

```bash
ssh root@YOUR_VPS_IP
```

### Step 2: Run Initial Setup

```bash
cd /var/www/seredityfy

# If you haven't cloned yet:
git clone <your-repo-url> .

# Copy and edit environment variables
cp .env.example .env
nano .env  # Fill in all the values
```

### Step 3: Setup SSL Directory

```bash
mkdir -p nginx/ssl
```

### Step 4: Start Services

```bash
# Start all containers
docker-compose up -d

# Check status
docker-compose ps

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma client
docker-compose exec app npx prisma generate
```

### Step 5: Get SSL Certificate (After DNS Setup)

Once your domain points to your VPS:

```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Stop nginx temporarily
docker-compose stop nginx

# Get certificate
certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/

# Start nginx
docker-compose up -d nginx
```

---

## Managing Services

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f worker
docker-compose logs -f redis
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
docker-compose restart worker
```

### Stop Services

```bash
docker-compose down
```

### Update & Redeploy

```bash
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma generate
```

---

## Troubleshooting

### Check if services are running

```bash
docker-compose ps
docker ps
```

### Check logs for errors

```bash
docker-compose logs app --tail=100
docker-compose logs worker --tail=100
docker-compose logs postgres --tail=100
docker-compose logs redis --tail=100
```

### Rebuild without cache

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Reset database

```bash
docker-compose exec postgres psql -U seredityfy -d seredityfy -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker-compose exec app npx prisma migrate deploy
```

### Redis troubleshooting

```bash
# Connect to Redis
docker-compose exec redis redis-cli -a YOUR_REDIS_PASSWORD

# Check keys
KEYS *
```

---

## Health Check URLs

After deployment:

- `https://your-domain.com/health` - App health check
- `https://your-domain.com/api/generate` - API endpoint

---

## Cron Jobs (Optional)

Add to crontab for automatic SSL renewal:

```bash
crontab -e

# Add this line:
0 3 * * * certbot renew --standalone --post-hook "docker-compose restart nginx"
```

---

## Support

For issues, check logs:
```bash
docker-compose logs -f --tail=50
```
