# Server Setup Guide - Docker Deployment

This guide explains how to set up automated deployment of the groceries admin panel to your VPS server using Docker and GitHub Actions.

## Prerequisites

### Server Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- Git installed
- SSH access configured
- Port 80 available

### GitHub Repository Setup
- Repository pushed to GitHub
- SSH key configured for server access
- GitHub secrets configured (see below)

## Server Setup

### 1. Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. Create Application Directory

```bash
# Create directory for the application
sudo mkdir -p /opt/groceries-admin
sudo chown $USER:$USER /opt/groceries-admin
cd /opt/groceries-admin

# Clone the repository
git clone https://github.com/YOUR_USERNAME/groceries-admin.git .
```

### 3. Configure Environment

```bash
# Copy environment template
cp env.example .env.local

# Edit environment variables
nano .env.local
```

Update the following variables in `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://91.99.95.75/api/v1
NODE_ENV=production
```

## GitHub Secrets Configuration

To enable automated deployment, configure the following secrets in your GitHub repository:

### Required Secrets

1. **SERVER_SSH_KEY**
   - Your private SSH key for server access
   - Generate with: `ssh-keygen -t rsa -b 4096 -C "github-actions"`
   - Add public key to server: `cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys`

2. **SERVER_USERNAME**
   - Username for SSH access to your server
   - Usually your server username (e.g., `ubuntu`, `root`, or your custom username)

### How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact names above

## Manual Deployment

### First-Time Setup

```bash
# SSH into your server
ssh your-username@91.99.95.75

# Navigate to application directory
cd /opt/groceries-admin

# Pull latest code
git pull origin main

# Run deployment script
./deploy.sh
```

### Deployment Commands

```bash
# Full deployment
./deploy.sh deploy

# Stop containers
./deploy.sh stop

# Restart containers
./deploy.sh restart

# Check status
./deploy.sh status

# View logs
./deploy.sh logs
```

## Automated Deployment

Once GitHub secrets are configured, the deployment will happen automatically on every push to the `main` branch.

### Deployment Process

1. **Code Push**: Push changes to `main` branch
2. **Build**: GitHub Actions builds and tests the application
3. **Deploy**: If build succeeds, deploys to server via SSH
4. **Health Check**: Verifies deployment is successful

### Monitoring Deployment

- Check GitHub Actions tab in your repository
- View deployment logs in the Actions workflow
- Monitor server logs: `./deploy.sh logs`

## Service URLs

After successful deployment:

- **Admin Panel**: http://91.99.95.75/admin
- **Health Check**: http://91.99.95.75/health
- **API Endpoint**: http://91.99.95.75/api/v1 (if backend is running)

## Troubleshooting

### Common Issues

#### 1. SSH Connection Failed
```bash
# Test SSH connection
ssh -i ~/.ssh/id_rsa your-username@91.99.95.75

# Check SSH key permissions
chmod 600 ~/.ssh/id_rsa
```

#### 2. Docker Permission Denied
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

#### 3. Port 80 Already in Use
```bash
# Check what's using port 80
sudo netstat -tlnp | grep :80

# Stop conflicting service
sudo systemctl stop apache2  # or nginx
```

#### 4. Container Health Check Failed
```bash
# Check container logs
docker logs groceries-admin-panel
docker logs groceries-nginx

# Check container status
docker ps -a
```

#### 5. Build Failed
```bash
# Check Docker build logs
docker-compose build --no-cache

# Check available disk space
df -h
```

### Log Locations

- **Application Logs**: `docker logs groceries-admin-panel`
- **Nginx Logs**: `docker logs groceries-nginx`
- **System Logs**: `/var/log/syslog`

### Performance Monitoring

```bash
# Check resource usage
docker stats

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

## Security Considerations

### Firewall Configuration
```bash
# Allow SSH (port 22)
sudo ufw allow 22

# Allow HTTP (port 80)
sudo ufw allow 80

# Allow HTTPS (port 443) - if using SSL
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

### SSL/HTTPS Setup
For production, consider setting up SSL certificates:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Maintenance

### Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d
```

### Backup Strategy
```bash
# Backup application data
tar -czf groceries-admin-backup-$(date +%Y%m%d).tar.gz /opt/groceries-admin

# Backup Docker volumes (if any)
docker run --rm -v groceries-admin_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check server logs: `./deploy.sh logs`
4. Verify all prerequisites are met
5. Ensure GitHub secrets are correctly configured

## Next Steps

- Set up SSL certificates for HTTPS
- Configure monitoring and alerting
- Set up automated backups
- Consider using a reverse proxy like Traefik
- Implement log aggregation and monitoring
