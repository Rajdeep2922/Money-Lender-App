# Production Deployment Guide

## HTTPS Configuration

### Option 1: Reverse Proxy (Recommended)

Use a reverse proxy like **Nginx** or **Caddy** to handle SSL/TLS termination.

#### Nginx Configuration Example

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend (static files)
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

#### Let's Encrypt SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (runs automatically)
sudo certbot renew --dry-run
```

---

### Option 2: Cloud Platform (Easier)

#### Vercel (Frontend)
- Deploy frontend to Vercel - HTTPS is automatic
- Set `VITE_API_URL` to your backend URL

#### Railway/Render (Backend)
- Deploy backend to Railway or Render
- HTTPS is provided automatically
- Set environment variables in dashboard

---

### Option 3: Node.js HTTPS (Direct)

Only if you need to run HTTPS directly in Node.js:

```javascript
const https = require('https');
const fs = require('fs');
const app = require('./src/server');

const options = {
    key: fs.readFileSync('/path/to/private.key'),
    cert: fs.readFileSync('/path/to/certificate.crt'),
};

https.createServer(options, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
});
```

---

## Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/moneylender
JWT_SECRET=your-very-long-random-secret-at-least-32-characters
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
RATE_LIMIT_MAX=100
```

---

## Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ random characters)
- [ ] Configure proper `FRONTEND_URL` for CORS
- [ ] Set appropriate rate limits
- [ ] Enable HTTPS/SSL
- [ ] Keep dependencies updated
- [ ] Set up database backups
- [ ] Configure logging and monitoring

---

## Deployment Commands

### Backend
```bash
# Build and start
npm install --production
npm start
```

### Frontend
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Output in dist/ folder - deploy to static hosting
```
