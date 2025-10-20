# 🌐 Hướng Dẫn Triển Khai LMS trên Azure Cloud với Backup On-Premise

## 📋 Mục Lục
1. [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
2. [Chuẩn Bị Môi Trường Azure](#chuẩn-bị-môi-trường-azure)
3. [Triển Khai Backend Services](#triển-khai-backend-services)
4. [Triển Khai Frontend Applications](#triển-khai-frontend-applications)
5. [Cấu Hình Database](#cấu-hình-database)
6. [Thiết Lập Backup On-Premise](#thiết-lập-backup-on-premise)
7. [Bảo Mật và Networking](#bảo-mật-và-networking)
8. [Monitoring và Logging](#monitoring-và-logging)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Chi Phí và Tối Ưu](#chi-phí-và-tối-ưu)

---

## 🏗️ Tổng Quan Kiến Trúc

### Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                      AZURE CLOUD                            │
│                                                              │
│  ┌────────────────┐      ┌─────────────────┐               │
│  │  Azure CDN     │◄─────│  Static Web App │               │
│  │                │      │  (Frontend)      │               │
│  └────────────────┘      └─────────────────┘               │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌─────────────────────────────────────────┐               │
│  │      Azure Application Gateway           │               │
│  │         (WAF + Load Balancer)           │               │
│  └─────────────────────────────────────────┘               │
│                       │                                      │
│          ┌────────────┼────────────┐                        │
│          ▼            ▼            ▼                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ App Service │ │ App Service │ │ App Service │          │
│  │ (Gateway)   │ │ (User Mgmt) │ │ (Content)   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│          │            │            │                        │
│          └────────────┼────────────┘                        │
│                       ▼                                      │
│  ┌──────────────────────────────────────────┐              │
│  │     Azure Database for PostgreSQL        │              │
│  │          (Flexible Server)                │              │
│  └──────────────────────────────────────────┘              │
│                       │                                      │
│                       │ Replication                          │
│                       ▼                                      │
│  ┌──────────────────────────────────────────┐              │
│  │    Azure Backup (Automated Daily)        │              │
│  └──────────────────────────────────────────┘              │
│                       │                                      │
└───────────────────────┼──────────────────────────────────┘
                        │
                        │ Secure VPN/ExpressRoute
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│               ON-PREMISE BACKUP SERVER                     │
│                                                             │
│  ┌─────────────────┐      ┌──────────────────┐           │
│  │  PostgreSQL     │      │  File Storage    │           │
│  │  Backup         │      │  (Media/Docs)    │           │
│  └─────────────────┘      └──────────────────┘           │
│                                                             │
│  ┌─────────────────────────────────────────┐              │
│  │       Backup Automation Script          │              │
│  │  - Daily sync từ Azure                  │              │
│  │  - Weekly full backup                   │              │
│  │  - Monthly archive                      │              │
│  └─────────────────────────────────────────┘              │
└───────────────────────────────────────────────────────────┘
```

### Các Services Sử Dụng

#### Azure Services
- **Azure App Service**: Backend microservices (Python FastAPI)
- **Azure Static Web Apps**: Frontend applications (React)
- **Azure Database for PostgreSQL**: Primary database
- **Azure Blob Storage**: File storage (media, documents)
- **Azure Key Vault**: Secrets management
- **Azure Application Gateway**: Load balancer + WAF
- **Azure VPN Gateway**: Kết nối on-premise
- **Azure Backup**: Automated backup
- **Azure Monitor**: Logging và monitoring

#### On-Premise Components
- **PostgreSQL Server**: Backup database
- **File Server**: Backup storage
- **VPN Gateway**: Kết nối tới Azure

---

## 🛠️ Chuẩn Bị Môi Trường Azure

### 1. Tạo Azure Account và Resource Group

```bash
# Cài đặt Azure CLI
# Windows (PowerShell as Admin):
winget install Microsoft.AzureCLI

# Login vào Azure
az login

# Tạo Resource Group
az group create \
  --name lms-production-rg \
  --location southeastasia

# List available locations
az account list-locations --output table
```

### 2. Thiết Lập Subscription và Tags

```bash
# Set default subscription
az account set --subscription "Your-Subscription-ID"

# Tạo tags cho resource management
az tag create --name Environment --value Production
az tag create --name Project --value LMS
az tag create --name CostCenter --value Education
```

---

## 🐍 Triển Khai Backend Services

### 1. Chuẩn Bị Backend Code

Tạo file `requirements.txt` cho production:

```bash
# d:\XProject\X1.1MicroService\lms_micro_services\api-gateway\requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
httpx==0.25.1
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic==2.5.0
pydantic-settings==2.1.0
# Azure specific
azure-storage-blob==12.19.0
azure-keyvault-secrets==4.7.0
azure-identity==1.15.0
```

### 2. Tạo Dockerfile cho mỗi service

```dockerfile
# d:\XProject\X1.1MicroService\lms_micro_services\api-gateway\Dockerfile

FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. Deploy Backend lên Azure App Service

```bash
# Tạo App Service Plan (Linux)
az appservice plan create \
  --name lms-backend-plan \
  --resource-group lms-production-rg \
  --location southeastasia \
  --is-linux \
  --sku B2  # Basic tier với 2 cores, 3.5GB RAM

# Tạo Web Apps cho từng service
services=("api-gateway" "user-service" "content-service" "assignment-service")

for service in "${services[@]}"; do
  az webapp create \
    --name lms-$service \
    --resource-group lms-production-rg \
    --plan lms-backend-plan \
    --runtime "PYTHON:3.10"
  
  # Cấu hình container deployment
  az webapp config container set \
    --name lms-$service \
    --resource-group lms-production-rg \
    --docker-custom-image-name <your-registry>/$service:latest \
    --docker-registry-server-url https://<your-registry>.azurecr.io
done

# Deploy code (using ZIP deployment)
cd d:\XProject\X1.1MicroService\lms_micro_services\api-gateway
az webapp deployment source config-zip \
  --resource-group lms-production-rg \
  --name lms-api-gateway \
  --src api-gateway.zip

# Hoặc deploy từ GitHub (recommended)
az webapp deployment source config \
  --name lms-api-gateway \
  --resource-group lms-production-rg \
  --repo-url https://github.com/your-username/lms-microservices \
  --branch main \
  --manual-integration
```

### 4. Cấu Hình Environment Variables

```bash
# Tạo Key Vault để lưu secrets
az keyvault create \
  --name lms-keyvault \
  --resource-group lms-production-rg \
  --location southeastasia

# Thêm secrets vào Key Vault
az keyvault secret set \
  --vault-name lms-keyvault \
  --name DatabasePassword \
  --value "your-secure-password"

az keyvault secret set \
  --vault-name lms-keyvault \
  --name JWTSecret \
  --value "your-jwt-secret-key"

# Cấu hình App Service để sử dụng Key Vault
az webapp config appsettings set \
  --resource-group lms-production-rg \
  --name lms-api-gateway \
  --settings \
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://lms-keyvault.vault.azure.net/secrets/DatabaseURL/)" \
    JWT_SECRET="@Microsoft.KeyVault(SecretUri=https://lms-keyvault.vault.azure.net/secrets/JWTSecret/)" \
    ENVIRONMENT="production"

# Enable managed identity
az webapp identity assign \
  --name lms-api-gateway \
  --resource-group lms-production-rg

# Grant Key Vault access
principal_id=$(az webapp identity show --name lms-api-gateway --resource-group lms-production-rg --query principalId -o tsv)
az keyvault set-policy \
  --name lms-keyvault \
  --object-id $principal_id \
  --secret-permissions get list
```

---

## ⚛️ Triển Khai Frontend Applications

### 1. Build Frontend cho Production

Tạo file `.env.production`:

```bash
# d:\XProject\X1.1MicroService\lms_micro_services\frontend-student\.env.production
REACT_APP_API_URL=https://lms-api-gateway.azurewebsites.net
REACT_APP_ENVIRONMENT=production
REACT_APP_CDN_URL=https://lms-cdn.azureedge.net
```

Build applications:

```bash
# Build Student Frontend
cd d:\XProject\X1.1MicroService\lms_micro_services\frontend-student
npm install
npm run build

# Build Teacher Frontend
cd d:\XProject\X1.1MicroService\lms_micro_services\frontend-teacher
npm install
npm run build

# Build Admin Frontend
cd d:\XProject\X1.1MicroService\lms_micro_services\frontend-admin
npm install
npm run build
```

### 2. Deploy Frontend lên Azure Static Web Apps

```bash
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Deploy Student Frontend
cd d:\XProject\X1.1MicroService\lms_micro_services\frontend-student
az staticwebapp create \
  --name lms-student-app \
  --resource-group lms-production-rg \
  --source . \
  --location southeastasia \
  --branch main \
  --app-location "/" \
  --output-location "build"

# Deploy Teacher Frontend
az staticwebapp create \
  --name lms-teacher-app \
  --resource-group lms-production-rg \
  --source ../frontend-teacher \
  --location southeastasia \
  --branch main \
  --app-location "/" \
  --output-location "build"

# Deploy Admin Frontend
az staticwebapp create \
  --name lms-admin-app \
  --resource-group lms-production-rg \
  --source ../frontend-admin \
  --location southeastasia \
  --branch main \
  --app-location "/" \
  --output-location "build"
```

### 3. Cấu Hình Custom Domain và SSL

```bash
# Thêm custom domain
az staticwebapp hostname set \
  --name lms-student-app \
  --resource-group lms-production-rg \
  --hostname student.yourdomain.com

az staticwebapp hostname set \
  --name lms-teacher-app \
  --resource-group lms-production-rg \
  --hostname teacher.yourdomain.com

az staticwebapp hostname set \
  --name lms-admin-app \
  --resource-group lms-production-rg \
  --hostname admin.yourdomain.com

# SSL certificates tự động được cung cấp bởi Azure
```

---

## 🗄️ Cấu Hình Database

### 1. Tạo Azure Database for PostgreSQL

```bash
# Tạo PostgreSQL Flexible Server
az postgres flexible-server create \
  --name lms-postgres-server \
  --resource-group lms-production-rg \
  --location southeastasia \
  --admin-user lmsadmin \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B2s \
  --tier Burstable \
  --version 14 \
  --storage-size 32 \
  --backup-retention 30 \
  --geo-redundant-backup Enabled

# Tạo database
az postgres flexible-server db create \
  --resource-group lms-production-rg \
  --server-name lms-postgres-server \
  --database-name lms_production

# Cấu hình firewall rule cho Azure services
az postgres flexible-server firewall-rule create \
  --resource-group lms-production-rg \
  --name lms-postgres-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Thêm firewall rule cho on-premise server
az postgres flexible-server firewall-rule create \
  --resource-group lms-production-rg \
  --name lms-postgres-server \
  --rule-name AllowOnPremise \
  --start-ip-address <your-onpremise-ip> \
  --end-ip-address <your-onpremise-ip>
```

### 2. Migration Database lên Production

```bash
# Export database từ local
pg_dump -h localhost -U postgres -d postgres > lms_local_dump.sql

# Import vào Azure PostgreSQL
psql "host=lms-postgres-server.postgres.database.azure.com port=5432 dbname=lms_production user=lmsadmin password=YourSecurePassword123! sslmode=require" < lms_local_dump.sql

# Run migrations
cd d:\XProject\X1.1MicroService\lms_micro_services\user-service
# Update .env với Azure connection string
python run_migrations.py
```

### 3. Tạo Azure Blob Storage cho Files

```bash
# Tạo Storage Account
az storage account create \
  --name lmsstorageaccount \
  --resource-group lms-production-rg \
  --location southeastasia \
  --sku Standard_LRS \
  --kind StorageV2

# Tạo containers
az storage container create \
  --name media \
  --account-name lmsstorageaccount \
  --public-access blob

az storage container create \
  --name documents \
  --account-name lmsstorageaccount \
  --public-access blob

# Get storage connection string
az storage account show-connection-string \
  --name lmsstorageaccount \
  --resource-group lms-production-rg
```

---

## 💾 Thiết Lập Backup On-Premise

### 1. Cài Đặt On-Premise Server

**Yêu Cầu Hệ Thống:**
- OS: Ubuntu Server 22.04 LTS hoặc Windows Server 2022
- RAM: Minimum 8GB
- Storage: Minimum 500GB (SSD recommended)
- Network: Static IP, VPN capability

**Cài đặt PostgreSQL:**

```bash
# Ubuntu
sudo apt update
sudo apt install postgresql-14 postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create backup user
sudo -u postgres createuser --replication backup_user
sudo -u postgres psql -c "ALTER USER backup_user WITH PASSWORD 'backup_password';"
```

### 2. Cấu Hình VPN Connection

#### Option A: Azure VPN Gateway (Recommended)

```bash
# Tạo Virtual Network
az network vnet create \
  --name lms-vnet \
  --resource-group lms-production-rg \
  --address-prefix 10.0.0.0/16 \
  --subnet-name GatewaySubnet \
  --subnet-prefix 10.0.1.0/24

# Tạo VPN Gateway
az network vnet-gateway create \
  --name lms-vpn-gateway \
  --resource-group lms-production-rg \
  --vnet lms-vnet \
  --public-ip-addresses lms-vpn-ip \
  --gateway-type Vpn \
  --vpn-type RouteBased \
  --sku VpnGw1 \
  --no-wait

# Tạo Local Network Gateway (your on-premise)
az network local-gateway create \
  --name onpremise-gateway \
  --resource-group lms-production-rg \
  --gateway-ip-address <your-onpremise-public-ip> \
  --local-address-prefixes 192.168.1.0/24

# Create VPN Connection
az network vpn-connection create \
  --name azure-to-onpremise \
  --resource-group lms-production-rg \
  --vnet-gateway1 lms-vpn-gateway \
  --local-gateway2 onpremise-gateway \
  --shared-key "YourVPNSharedKey123!"
```

#### Option B: Point-to-Site VPN (Cheaper, for small scale)

```bash
# Generate certificates
# Windows PowerShell:
$cert = New-SelfSignedCertificate -Type Custom -KeySpec Signature `
  -Subject "CN=P2SRootCert" -KeyExportPolicy Exportable `
  -HashAlgorithm sha256 -KeyLength 2048 `
  -CertStoreLocation "Cert:\CurrentUser\My" -KeyUsageProperty Sign -KeyUsage CertSign

# Export certificate
Export-Certificate -Cert $cert -FilePath "C:\temp\P2SRootCert.cer"

# Configure Point-to-Site
az network vnet-gateway update \
  --name lms-vpn-gateway \
  --resource-group lms-production-rg \
  --address-prefixes 172.16.0.0/24 \
  --client-protocol IkeV2 SSTP \
  --root-cert-name P2SRootCert \
  --root-cert-data <base64-encoded-certificate>
```

### 3. Script Backup Tự Động

Tạo script backup trên on-premise server:

```bash
# /opt/lms-backup/backup_database.sh

#!/bin/bash

# Configuration
AZURE_DB_HOST="lms-postgres-server.postgres.database.azure.com"
AZURE_DB_PORT="5432"
AZURE_DB_NAME="lms_production"
AZURE_DB_USER="lmsadmin"
AZURE_DB_PASSWORD="YourSecurePassword123!"

LOCAL_BACKUP_DIR="/backup/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$LOCAL_BACKUP_DIR/lms_backup_$DATE.sql"
LOG_FILE="/var/log/lms-backup.log"

# Create backup directory if not exists
mkdir -p $LOCAL_BACKUP_DIR

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

log_message "Starting database backup..."

# Backup database từ Azure
PGPASSWORD=$AZURE_DB_PASSWORD pg_dump \
    -h $AZURE_DB_HOST \
    -p $AZURE_DB_PORT \
    -U $AZURE_DB_USER \
    -d $AZURE_DB_NAME \
    -F c \
    -f $BACKUP_FILE

if [ $? -eq 0 ]; then
    log_message "Database backup completed successfully: $BACKUP_FILE"
    
    # Compress backup
    gzip $BACKUP_FILE
    log_message "Backup compressed: ${BACKUP_FILE}.gz"
    
    # Calculate backup size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    log_message "Backup size: $BACKUP_SIZE"
    
    # Delete backups older than 30 days
    find $LOCAL_BACKUP_DIR -name "lms_backup_*.sql.gz" -mtime +30 -delete
    log_message "Old backups cleaned up"
    
    # Send notification (optional)
    curl -X POST https://lms-api-gateway.azurewebsites.net/api/notifications/backup-success \
        -H "Content-Type: application/json" \
        -d "{\"date\":\"$DATE\",\"size\":\"$BACKUP_SIZE\"}"
else
    log_message "ERROR: Database backup failed!"
    
    # Send alert
    curl -X POST https://lms-api-gateway.azurewebsites.net/api/notifications/backup-failed \
        -H "Content-Type: application/json" \
        -d "{\"date\":\"$DATE\",\"error\":\"Backup failed\"}"
    
    exit 1
fi

log_message "Backup process completed"
```

### 4. Backup Files từ Azure Blob Storage

```bash
# /opt/lms-backup/backup_files.sh

#!/bin/bash

# Configuration
AZURE_STORAGE_ACCOUNT="lmsstorageaccount"
AZURE_STORAGE_KEY="<your-storage-key>"
LOCAL_FILES_DIR="/backup/files"
DATE=$(date +%Y%m%d)
LOG_FILE="/var/log/lms-backup.log"

# Install Azure CLI if not installed
if ! command -v az &> /dev/null; then
    curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
fi

# Login to Azure (use service principal)
az login --service-principal \
    --username <app-id> \
    --password <password> \
    --tenant <tenant-id>

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

log_message "Starting file backup from Azure Blob Storage..."

# Sync media files
az storage blob download-batch \
    --account-name $AZURE_STORAGE_ACCOUNT \
    --account-key $AZURE_STORAGE_KEY \
    --source media \
    --destination "$LOCAL_FILES_DIR/media_$DATE" \
    --pattern "*"

# Sync documents
az storage blob download-batch \
    --account-name $AZURE_STORAGE_ACCOUNT \
    --account-key $AZURE_STORAGE_KEY \
    --source documents \
    --destination "$LOCAL_FILES_DIR/documents_$DATE" \
    --pattern "*"

log_message "File backup completed"

# Delete old file backups (keep 7 days)
find $LOCAL_FILES_DIR -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \;
```

### 5. Cấu Hình Cron Jobs

```bash
# Edit crontab
sudo crontab -e

# Add cron jobs
# Daily database backup at 2 AM
0 2 * * * /opt/lms-backup/backup_database.sh

# Weekly file backup on Sunday at 3 AM
0 3 * * 0 /opt/lms-backup/backup_files.sh

# Monthly full system backup on 1st at 4 AM
0 4 1 * * /opt/lms-backup/full_backup.sh
```

### 6. Script Restore từ Backup

```bash
# /opt/lms-backup/restore_database.sh

#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file>"
    echo "Available backups:"
    ls -lh /backup/postgresql/
    exit 1
fi

BACKUP_FILE=$1
LOCAL_DB="lms_production_restore"
LOG_FILE="/var/log/lms-restore.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

log_message "Starting database restore from: $BACKUP_FILE"

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE > /tmp/restore_temp.sql
    RESTORE_FILE="/tmp/restore_temp.sql"
else
    RESTORE_FILE=$BACKUP_FILE
fi

# Create restore database
sudo -u postgres createdb $LOCAL_DB

# Restore database
sudo -u postgres pg_restore -d $LOCAL_DB $RESTORE_FILE

if [ $? -eq 0 ]; then
    log_message "Database restore completed successfully"
    log_message "Restored database: $LOCAL_DB"
    log_message "To use this database, update your application configuration"
else
    log_message "ERROR: Database restore failed!"
    exit 1
fi

# Cleanup
rm -f /tmp/restore_temp.sql
```

---

## 🔒 Bảo Mật và Networking

### 1. Cấu Hình Network Security Groups (NSG)

```bash
# Tạo NSG
az network nsg create \
  --name lms-backend-nsg \
  --resource-group lms-production-rg

# Allow HTTPS từ Internet
az network nsg rule create \
  --name AllowHTTPS \
  --nsg-name lms-backend-nsg \
  --resource-group lms-production-rg \
  --priority 100 \
  --direction Inbound \
  --source-address-prefixes Internet \
  --source-port-ranges '*' \
  --destination-port-ranges 443 \
  --access Allow \
  --protocol Tcp

# Allow PostgreSQL từ on-premise
az network nsg rule create \
  --name AllowPostgreSQL \
  --nsg-name lms-backend-nsg \
  --resource-group lms-production-rg \
  --priority 110 \
  --direction Inbound \
  --source-address-prefixes <onpremise-ip> \
  --destination-port-ranges 5432 \
  --access Allow \
  --protocol Tcp

# Deny all other inbound traffic
az network nsg rule create \
  --name DenyAllInbound \
  --nsg-name lms-backend-nsg \
  --resource-group lms-production-rg \
  --priority 4096 \
  --direction Inbound \
  --source-address-prefixes '*' \
  --access Deny \
  --protocol '*'
```

### 2. Cấu Hình Web Application Firewall (WAF)

```bash
# Tạo WAF Policy
az network application-gateway waf-policy create \
  --name lms-waf-policy \
  --resource-group lms-production-rg \
  --location southeastasia

# Enable OWASP rules
az network application-gateway waf-policy managed-rule rule-set add \
  --policy-name lms-waf-policy \
  --resource-group lms-production-rg \
  --type OWASP \
  --version 3.2
```

### 3. SSL/TLS Configuration

```bash
# Upload SSL certificate
az keyvault certificate import \
  --vault-name lms-keyvault \
  --name lms-ssl-cert \
  --file certificate.pfx \
  --password <cert-password>

# Bind certificate to App Service
az webapp config ssl bind \
  --name lms-api-gateway \
  --resource-group lms-production-rg \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

---

## 📊 Monitoring và Logging

### 1. Cấu Hình Azure Monitor

```bash
# Tạo Log Analytics Workspace
az monitor log-analytics workspace create \
  --resource-group lms-production-rg \
  --workspace-name lms-logs \
  --location southeastasia

# Enable Application Insights
az monitor app-insights component create \
  --app lms-monitoring \
  --location southeastasia \
  --resource-group lms-production-rg \
  --workspace lms-logs

# Connect App Services to Application Insights
for service in api-gateway user-service content-service assignment-service; do
  az webapp config appsettings set \
    --resource-group lms-production-rg \
    --name lms-$service \
    --settings APPLICATIONINSIGHTS_CONNECTION_STRING="<connection-string>"
done
```

### 2. Thiết Lập Alerts

```bash
# CPU usage alert
az monitor metrics alert create \
  --name lms-high-cpu \
  --resource-group lms-production-rg \
  --scopes "/subscriptions/<subscription-id>/resourceGroups/lms-production-rg/providers/Microsoft.Web/sites/lms-api-gateway" \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action <action-group-id>

# Database connection alert
az monitor metrics alert create \
  --name lms-db-connections \
  --resource-group lms-production-rg \
  --scopes "/subscriptions/<subscription-id>/resourceGroups/lms-production-rg/providers/Microsoft.DBforPostgreSQL/flexibleServers/lms-postgres-server" \
  --condition "avg active_connections > 80" \
  --window-size 5m
```

### 3. Dashboard Monitoring

Tạo file Azure Dashboard configuration:

```json
{
  "lenses": {
    "0": {
      "parts": {
        "0": {
          "position": { "x": 0, "y": 0, "colSpan": 6, "rowSpan": 4 },
          "metadata": {
            "type": "Extension/HubsExtension/PartType/MonitorChartPart",
            "settings": {
              "content": {
                "options": {
                  "chart": {
                    "metrics": [
                      {
                        "resourceMetadata": { "id": "/subscriptions/<id>/resourceGroups/lms-production-rg/providers/Microsoft.Web/sites/lms-api-gateway" },
                        "name": "CpuTime",
                        "aggregationType": 4
                      }
                    ],
                    "title": "API Gateway CPU Usage"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 🚀 CI/CD Pipeline

### 1. GitHub Actions Workflow

Tạo file `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  AZURE_WEBAPP_NAME: lms-api-gateway
  PYTHON_VERSION: '3.10'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        pip install pytest pytest-cov
        pytest tests/ --cov=./ --cov-report=xml
    
    - name: Build application
      run: |
        zip -r app.zip . -x "*.git*" "*.env*" "tests/*"
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./app.zip
    
    - name: Run database migrations
      run: |
        python run_migrations.py
      env:
        DATABASE_URL: ${{ secrets.AZURE_DATABASE_URL }}

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: build-and-deploy
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install and build frontend
      run: |
        cd frontend-student
        npm install
        npm run build
    
    - name: Deploy to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/frontend-student"
        output_location: "build"
```

### 2. Azure DevOps Pipeline (Alternative)

Tạo file `azure-pipelines.yml`:

```yaml
trigger:
  branches:
    include:
    - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  pythonVersion: '3.10'
  azureSubscription: 'your-service-connection'

stages:
- stage: Build
  jobs:
  - job: BuildBackend
    steps:
    - task: UsePythonVersion@0
      inputs:
        versionSpec: '$(pythonVersion)'
    
    - script: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
      displayName: 'Install dependencies'
    
    - task: ArchiveFiles@2
      inputs:
        rootFolderOrFile: '$(System.DefaultWorkingDirectory)'
        includeRootFolder: false
        archiveType: 'zip'
        archiveFile: '$(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip'
    
    - publish: $(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip
      artifact: backend

- stage: Deploy
  dependsOn: Build
  jobs:
  - deployment: DeployBackend
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            inputs:
              azureSubscription: '$(azureSubscription)'
              appType: 'webAppLinux'
              appName: 'lms-api-gateway'
              package: '$(Pipeline.Workspace)/backend/*.zip'
```

---

## 💰 Chi Phí và Tối Ưu

### Ước Tính Chi Phí Hàng Tháng (Southeast Asia)

| Service | Tier | Monthly Cost (USD) |
|---------|------|-------------------|
| App Service Plan (B2) | Basic | $55 |
| App Service x4 | - | Included |
| Static Web Apps x3 | Free | $0 |
| PostgreSQL Flexible Server | Burstable B2s | $45 |
| Blob Storage (100GB) | Standard LRS | $2 |
| VPN Gateway | Basic | $27 |
| Application Insights | Basic | $5 |
| Bandwidth (100GB out) | - | $8 |
| **Total** | | **~$142/month** |

### Tối Ưu Chi Phí

1. **Sử dụng Reserved Instances** (giảm 30-40%)
```bash
az reservations reservation-order purchase \
  --reservation-order-id <order-id> \
  --sku Standard_B2s \
  --term P1Y \
  --quantity 1
```

2. **Auto-scaling** để tiết kiệm trong giờ thấp điểm
```bash
az monitor autoscale create \
  --resource-group lms-production-rg \
  --resource lms-api-gateway \
  --min-count 1 \
  --max-count 3 \
  --count 1
```

3. **Lifecycle Management** cho Blob Storage
```bash
az storage account management-policy create \
  --account-name lmsstorageaccount \
  --policy @policy.json
```

policy.json:
```json
{
  "rules": [
    {
      "enabled": true,
      "name": "move-to-cool",
      "type": "Lifecycle",
      "definition": {
        "actions": {
          "baseBlob": {
            "tierToCool": { "daysAfterModificationGreaterThan": 30 },
            "tierToArchive": { "daysAfterModificationGreaterThan": 90 }
          }
        },
        "filters": {
          "blobTypes": [ "blockBlob" ]
        }
      }
    }
  ]
}
```

---

## 📝 Checklist Triển Khai

### Pre-Deployment
- [ ] Tạo Azure account và subscription
- [ ] Chuẩn bị on-premise server
- [ ] Thiết lập VPN connection
- [ ] Review security requirements
- [ ] Backup local data

### Deployment
- [ ] Create Resource Group
- [ ] Deploy Backend Services
- [ ] Deploy Frontend Applications
- [ ] Setup Database
- [ ] Configure Blob Storage
- [ ] Setup Key Vault
- [ ] Configure networking

### Post-Deployment
- [ ] Test all endpoints
- [ ] Verify backup automation
- [ ] Configure monitoring alerts
- [ ] Setup CI/CD pipeline
- [ ] Document access credentials
- [ ] Train team members

### On-Premise Setup
- [ ] Install backup server
- [ ] Configure VPN client
- [ ] Setup backup scripts
- [ ] Test restore procedure
- [ ] Schedule cron jobs
- [ ] Monitor disk space

---

## 🆘 Troubleshooting

### Common Issues

1. **VPN Connection Failed**
```bash
# Check VPN status
az network vpn-connection show \
  --name azure-to-onpremise \
  --resource-group lms-production-rg

# Check logs
az network vpn-connection show-connectionsharedkey \
  --name azure-to-onpremise \
  --resource-group lms-production-rg
```

2. **Database Connection Issues**
```bash
# Test connection
psql "host=lms-postgres-server.postgres.database.azure.com port=5432 dbname=lms_production user=lmsadmin sslmode=require"

# Check firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group lms-production-rg \
  --name lms-postgres-server
```

3. **Backup Script Failures**
```bash
# Check logs
tail -f /var/log/lms-backup.log

# Test backup manually
sudo /opt/lms-backup/backup_database.sh

# Verify backup file
ls -lh /backup/postgresql/
```

---

## 📞 Support và Resources

### Documentation
- [Azure Documentation](https://docs.microsoft.com/azure)
- [PostgreSQL on Azure](https://docs.microsoft.com/azure/postgresql)
- [Azure VPN Gateway](https://docs.microsoft.com/azure/vpn-gateway)

### Support Channels
- Azure Support: support.microsoft.com
- Community Forum: techcommunity.microsoft.com

---

## 📄 License
This deployment guide is part of the LMS Microservices project.

---

**Last Updated**: October 15, 2025
**Version**: 1.0
**Author**: LMS Development Team
