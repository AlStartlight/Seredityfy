#!/bin/bash
# ===========================================
# SEREDITFY - Deployment Script
# ===========================================
# Usage: ./deploy.sh [domain]

set -e

DOMAIN=${1:-"your-domain.com"}
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   SEREDITFY DEPLOYMENT SCRIPT${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo -e "${YELLOW}Please copy .env.example to .env and configure it first.${NC}"
    exit 1
fi

# Pull latest code from git
echo -e "${YELLOW}Pulling latest code...${NC}"
git pull origin main

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down

# Rebuild containers
echo -e "${YELLOW}Building Docker containers...${NC}"
docker-compose build --no-cache

# Start containers
echo -e "${YELLOW}Starting containers...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 10

# Check container status
echo ""
echo -e "${YELLOW}Container Status:${NC}"
docker-compose ps

# Run database migrations
echo ""
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose exec app npx prisma migrate deploy || true

# Generate Prisma client
echo ""
echo -e "${YELLOW}Generating Prisma client...${NC}"
docker-compose exec app npx prisma generate

# Restart worker to pick up new code
echo ""
echo -e "${YELLOW}Restarting worker...${NC}"
docker-compose restart worker

# Show logs
echo ""
echo -e "${YELLOW}Recent logs (app):${NC}"
docker-compose logs --tail=20 app

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "App should be running at: https://$DOMAIN"
echo "Worker logs: ${YELLOW}docker-compose logs -f worker${NC}"
echo "App logs: ${YELLOW}docker-compose logs -f app${NC}"
echo ""
