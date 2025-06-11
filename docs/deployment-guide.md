# Deployment Guide

## Overview
This guide covers deploying the Hotel Reception System using Docker Compose for production environments.

## Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+ recommended) or macOS
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 10GB free space
- **Network**: Open ports 80 (HTTP) and 443 (HTTPS)

### Installation of Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Deployment Steps

### 1. Clone and Prepare
```bash
# Clone the repository
git clone <repository-url>
cd hotel-reception-app

# Create required directories
mkdir -p logs/nginx
mkdir -p database/backups
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Important**: Update these critical settings in `.env`:
- `DB_PASSWORD`: Strong database password
- `REDIS_PASSWORD`: Secure Redis password  
- `JWT_SECRET`: Random 32+ character string
- `HOTEL_NAME`: Your hotel's name

### 3. Deploy Frontend Only (Current Version)
```bash
# Build and start the frontend
docker-compose up -d hotel-frontend

# Check status
docker-compose ps
docker-compose logs hotel-frontend
```

### 4. Deploy Full Stack (Future Backend)
```bash
# Start all services including database
docker-compose --profile backend up -d

# Initialize database (when backend is ready)
docker-compose exec hotel-database psql -U hotel_admin -d hotel_reception -f /docker-entrypoint-initdb.d/init.sql
```

## Configuration Management

### Hotel Configuration Files
Configuration files are mounted from the host for easy updates:

```bash
# Configuration location
frontend/public/config/
├── roomData.json       # Hotel rooms and types
├── hotelLayout.json    # Room layout by floor
├── priceData.json      # Room pricing
└── bookingOptions.json # Booking types
```

### Updating Configuration
```bash
# Edit configuration files
nano frontend/public/config/roomData.json

# Restart frontend to apply changes
docker-compose restart hotel-frontend
```

## Monitoring and Maintenance

### Health Checks
```bash
# Check application health
curl http://localhost/health

# Check all service status
docker-compose ps

# View service logs
docker-compose logs -f hotel-frontend
```

### Log Management
```bash
# View nginx access logs
tail -f logs/nginx/access.log

# View application logs
docker-compose logs --tail=100 hotel-frontend
```

### Database Backup (When Backend is Ready)
```bash
# Create backup
docker-compose exec hotel-database pg_dump -U hotel_admin hotel_reception > database/backups/backup-$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T hotel-database psql -U hotel_admin hotel_reception < database/backups/backup-20231201.sql
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt install certbot

# Obtain SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update docker-compose.yml to mount certificates
# Add to hotel-frontend service volumes:
# - /etc/letsencrypt:/etc/letsencrypt:ro
```

### Update Nginx Configuration for SSL
Create `nginx-ssl.conf` and mount it instead of `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Rest of configuration...
}

server {
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

## Performance Optimization

### Production Settings
```bash
# Increase file limits
echo "fs.file-max = 65536" >> /etc/sysctl.conf

# Configure Docker daemon for production
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

sudo systemctl restart docker
```

### Resource Limits
Update `docker-compose.yml` with resource constraints:

```yaml
services:
  hotel-frontend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
docker-compose logs hotel-frontend

# Check disk space
df -h

# Check Docker daemon
sudo systemctl status docker
```

#### Configuration Not Loading
```bash
# Verify file permissions
ls -la frontend/public/config/

# Check file syntax
cat frontend/public/config/roomData.json | jq .

# Restart with fresh container
docker-compose down
docker-compose up -d
```

#### Database Connection Issues (Future)
```bash
# Check database status
docker-compose exec hotel-database pg_isready -U hotel_admin

# Check network connectivity
docker-compose exec hotel-backend ping hotel-database

# Review environment variables
docker-compose exec hotel-backend env | grep DB_
```

## Security Considerations

### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Regular Updates
```bash
# Update Docker images
docker-compose pull
docker-compose up -d

# Update system packages
sudo apt update && sudo apt upgrade
```

### Backup Strategy
```bash
# Create automated backup script
cat > /opt/hotel-backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T hotel-database pg_dump -U hotel_admin hotel_reception > /backups/hotel_$DATE.sql
find /backups -name "hotel_*.sql" -mtime +30 -delete
EOF

chmod +x /opt/hotel-backup.sh

# Add to crontab for daily backups
echo "0 2 * * * /opt/hotel-backup.sh" | crontab -
```

## Scaling Considerations

### Horizontal Scaling (Future)
- Load balancer configuration
- Database read replicas
- Redis clustering
- CDN for static assets

### Monitoring Integration
- Prometheus metrics collection
- Grafana dashboards
- Log aggregation with ELK stack
- Uptime monitoring

This deployment guide ensures a production-ready setup with proper security, monitoring, and maintenance procedures.