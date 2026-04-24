#!/bin/bash
# ===========================================
# SEREDITFY - VPS Initial Setup Script
# ===========================================
# Run this script ONCE on a fresh VPS

set -e

echo "=========================================="
echo "   SEREDITFY VPS SETUP SCRIPT"
echo "=========================================="
echo ""

# Variables
DOMAIN=${1:-""}
EMAIL=${2:-"admin@example.com"}

if [ -z "$DOMAIN" ]; then
    echo "Usage: ./setup-vps.sh <domain> [email]"
    echo "Example: ./setup-vps.sh seredityfy.com admin@seredityfy.com"
    exit 1
fi

echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
echo "Installing essential packages..."
apt install -y curl wget git unzip ufw fail2ban

# Install Docker
echo "Installing Docker..."
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
echo "Installing Docker Compose..."
apt install -y docker-compose

# Enable and start Docker
systemctl enable docker
systemctl start docker

# Setup UFW Firewall
echo "Setting up firewall..."
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Setup automatic security updates
echo "Setting up automatic security updates..."
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# Create app directory
echo "Creating application directory..."
mkdir -p /var/www/seredityfy
cd /var/www/seredityfy

# Clone repository (you need to replace this with your actual repo)
echo ""
echo "=========================================="
echo "NEXT STEP: Clone your repository"
echo "=========================================="
echo "Run these commands manually:"
echo ""
echo "  cd /var/www/seredityfy"
echo "  git clone <your-git-repo-url> ."
echo "  cp .env.example .env"
echo "  nano .env  # Edit with your configuration"
echo ""
echo "Then run: ./deploy.sh $DOMAIN"
echo "=========================================="
echo ""

# Create SSL directory for Let's Encrypt
mkdir -p /var/www/seredityfy/nginx/ssl

echo ""
echo "Setup complete! Follow the steps above to continue."
