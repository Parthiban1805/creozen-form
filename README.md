# Creozen Form Handler

A production-ready Node.js backend service for handling form submissions from the Creozen website. This application is deployed on AWS and integrates with Google Sheets API for automated data storage and management.

## 🌟 Overview

This project serves as a backend API for processing form submissions from the Creozen website. It receives form data, validates it, and automatically stores the information in Google Sheets for easy tracking and management. The application is designed for production deployment on AWS infrastructure.

## 📁 Project Structure

```
creozen-form/
├── server.js                                    # Main Express server application
├── package.json                                 # Node.js dependencies and scripts
├── package-lock.json                           # Dependency lock file
├── creozen-website-forms-d79194a54ef8.json    # Google Service Account credentials
└── README.md                                    # Project documentation
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript (100%)
- **APIs**: Google Sheets API
- **Authentication**: Google Service Account
- **Deployment**: AWS (EC2/Elastic Beanstalk/Lambda)
- **Process Manager**: PM2 (recommended for production)

## 📋 Prerequisites

Before deploying this application, ensure you have:

- Node.js (v14.x or higher)
- npm or yarn package manager
- Google Cloud Platform account with Sheets API enabled
- Google Service Account credentials
- AWS account for deployment
- Git for version control

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Parthiban1805/creozen-form.git
cd creozen-form
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google Sheets API
4. Create a Service Account:
   - Navigate to IAM & Admin > Service Accounts
   - Create new service account
   - Download the JSON key file
   - Rename it to match the credentials file in the repository
5. Share your Google Sheet with the service account email (found in the JSON file)

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Google Sheets Configuration
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com

# CORS Configuration
ALLOWED_ORIGINS=https://creozen.com,https://www.creozen.com

# Security
API_SECRET_KEY=your_secret_key_here
```

### 5. Run Locally

```bash
# Development mode
npm start

# Or with nodemon for auto-restart
npm run dev
```

The server will start on `http://localhost:3000`

## ☁️ AWS Production Deployment

### Option 1: EC2 Deployment

#### 1. Launch EC2 Instance

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Update system packages
sudo yum update -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/Parthiban1805/creozen-form.git
cd creozen-form

# Install dependencies
npm install --production

# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start server.js --name creozen-form

# Configure PM2 to start on system boot
pm2 startup
pm2 save
```

#### 3. Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo yum install nginx -y

# Edit Nginx configuration
sudo nano /etc/nginx/conf.d/creozen-form.conf
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 4. SSL Configuration (Let's Encrypt)

```bash
# Install Certbot
sudo yum install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Option 2: AWS Elastic Beanstalk

#### 1. Install EB CLI

```bash
pip install awsebcli --upgrade --user
```

#### 2. Initialize Elastic Beanstalk

```bash
eb init -p node.js creozen-form --region us-east-1
```

#### 3. Create Environment

```bash
eb create creozen-form-production
```

#### 4. Deploy

```bash
eb deploy
```

### Option 3: AWS Lambda + API Gateway

For serverless deployment, convert the Express app to Lambda-compatible format using AWS Serverless Express.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| PORT | Server port | No | 3000 |
| NODE_ENV | Environment mode | Yes | development |
| GOOGLE_SHEET_ID | Target Google Sheet ID | Yes | - |
| ALLOWED_ORIGINS | CORS allowed origins | Yes | - |
| API_SECRET_KEY | API authentication key | Yes | - |

### Google Sheets Setup

1. Create a new Google Sheet
2. Note the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
3. Share the sheet with your service account email
4. Grant "Editor" permissions

## 📡 API Endpoints

### POST /api/submit-form

Submit form data to be stored in Google Sheets.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Inquiry about services",
  "company": "Acme Corp",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "rowNumber": 42
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message description",
  "error": "Detailed error information"
}
```

### GET /health

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400
}
```

## 🔒 Security

### Best Practices Implemented

- **API Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS Configuration**: Restricts access to authorized domains only
- **Input Validation**: Sanitizes all form inputs
- **HTTPS Only**: SSL/TLS encryption for all communications
- **Secret Management**: Credentials stored securely (never in code)
- **Google Service Account**: Limited permissions, no user credentials exposed

### AWS Security Group Rules

```
Inbound Rules:
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- SSH (22): Your IP only

Outbound Rules:
- All traffic: 0.0.0.0/0 (for API calls to Google)
```

## 📊 Monitoring & Logging

### CloudWatch Integration

```bash
# Install CloudWatch agent on EC2
sudo yum install amazon-cloudwatch-agent

# Configure logs
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/config.json
```

### PM2 Monitoring

```bash
# View logs
pm2 logs creozen-form

# Monitor processes
pm2 monit

# Generate status
pm2 status
```

### Application Logs

Logs are stored in:
- Development: `./logs/app.log`
- Production: `/var/log/creozen-form/`

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Load testing
npm run test:load
```

### Manual Testing

```bash
# Test form submission
curl -X POST http://localhost:3000/api/submit-form \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message"
  }'
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to EC2
        env:
          PRIVATE_KEY: ${{ secrets.EC2_SSH_KEY }}
          HOST: ${{ secrets.EC2_HOST }}
        run: |
          echo "$PRIVATE_KEY" > private_key && chmod 600 private_key
          ssh -o StrictHostKeyChecking=no -i private_key ec2-user@${HOST} '
            cd /home/ec2-user/creozen-form &&
            git pull &&
            npm install --production &&
            pm2 restart creozen-form
          '
```

## 🐛 Troubleshooting

### Common Issues

**Issue: Port already in use**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 PID
```

**Issue: Google Sheets authentication failed**
- Verify service account credentials are correct
- Check if Sheet is shared with service account email
- Ensure Google Sheets API is enabled

**Issue: CORS errors**
- Verify allowed origins in environment variables
- Check frontend URL matches exactly (including protocol)

**Issue: PM2 not starting on reboot**
```bash
pm2 unstartup
pm2 startup
pm2 save
```

## 📈 Performance Optimization

- **Caching**: Implement Redis for session management
- **Load Balancing**: Use AWS ELB for high traffic
- **Database**: Consider migrating to RDS for better scalability
- **CDN**: Use CloudFront for static assets
- **Compression**: Enable gzip compression in Nginx

## 📝 Maintenance

### Regular Tasks

- **Weekly**: Review application logs for errors
- **Monthly**: Update dependencies (`npm audit fix`)
- **Quarterly**: Review and rotate API keys
- **Yearly**: Renew SSL certificates (automatic with Let's Encrypt)

### Backup Strategy

```bash
# Backup Google Sheet data weekly
# Automated using Google Apps Script or cron job
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Creozen. All rights reserved.

## 👤 Author

**Parthiban**
- GitHub: [@Parthiban1805](https://github.com/Parthiban1805)

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact: support@creozen.com

## 🔮 Roadmap

- [ ] Add email notifications for form submissions
- [ ] Implement form submission analytics dashboard
- [ ] Add support for file uploads
- [ ] Integrate with CRM systems
- [ ] Add multi-language support
- [ ] Implement webhook notifications
- [ ] Add form submission queue system
- [ ] Create admin panel for form management

## ⚠️ Important Notes

1. **Never commit** the Google Service Account credentials file to public repositories
2. **Always use** environment variables for sensitive configuration
3. **Keep** dependencies updated for security patches
4. **Monitor** AWS costs regularly
5. **Backup** data regularly from Google Sheets

## 📚 Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Node.js Production Practices](https://nodejs.org/en/docs/guides/simple-profiling/)

---

**Production Status**: ✅ Live on AWS  
**Last Updated**: February 2026  
**Version**: 1.0.0

Made with ❤️ for Creozen
