# ✅ LMS Microservices - Deployment Checklist

**Project**: Learning Management System (LMS)  
**Architecture**: Hybrid Cloud (Azure + On-Premise)  
**Document Reference**: ARCHITECTURE_DESIGN_DOCUMENT.md  
**Version**: 1.0  
**Date**: October 16, 2025

---

## 📋 Checklist Overview

```
Total Tasks: 150+
Estimated Time: 4-6 months
Team Size: 2-4 people
Budget: $2,000-3,000 (initial setup)
```

---

## 🎯 Phase 0: Pre-Deployment Preparation (Week 1-2)

### Azure Account & Subscription Setup

- [ ] **Tạo Azure account**
  - [ ] Đăng ký Azure account (hoặc dùng existing)
  - [ ] Xác thực email và phone number
  - [ ] Setup billing information
  - [ ] Kích hoạt Azure credits (nếu có)
  - [ ] Note: Account ID: `_______________`

- [ ] **Tạo Azure Subscription**
  - [ ] Tạo subscription mới hoặc dùng existing
  - [ ] Đặt tên: `LMS-Production-Subscription`
  - [ ] Set spending limit và budget alerts
  - [ ] Note: Subscription ID: `_______________`

- [ ] **Setup Cost Management**
  - [ ] Tạo budget: $500/month (initial), $300/month (optimized)
  - [ ] Setup alerts at: 50%, 80%, 100%, 120%
  - [ ] Add email notifications: `_______________@_____`
  - [ ] Enable Cost Analysis dashboard

### Team & Access Management

- [ ] **Define team roles**
  - [ ] Project Lead: `_______________`
  - [ ] DevOps Engineer: `_______________`
  - [ ] Backend Developer: `_______________`
  - [ ] Frontend Developer: `_______________`
  - [ ] Security Engineer: `_______________`

- [ ] **Setup Microsoft Entra ID (Azure AD)**
  - [ ] Create Azure AD tenant
  - [ ] Tenant name: `lms-organization`
  - [ ] Primary domain: `lms-org.onmicrosoft.com`
  - [ ] Note: Tenant ID: `_______________`

- [ ] **Create user accounts**
  - [ ] Admin account: `admin@lms-org.onmicrosoft.com`
  - [ ] DevOps accounts (1-2): `devops1@___`, `devops2@___`
  - [ ] Developer accounts (2-3): `dev1@___`, `dev2@___`
  - [ ] Enable MFA for all accounts

- [ ] **Setup RBAC roles**
  - [ ] Owner: Project Lead
  - [ ] Contributor: DevOps, Developers
  - [ ] Reader: Monitoring team
  - [ ] Custom roles (if needed): `_______________`

### Domain & DNS Preparation

- [ ] **Purchase domain name**
  - [ ] Domain: `lms.yourdomain.com` or `_______________`
  - [ ] Registrar: GoDaddy / Namecheap / Google Domains
  - [ ] Renew for: 1 year / 3 years / 5 years
  - [ ] Cost: ~$15-30/year

- [ ] **Plan DNS structure**
  - [ ] Main site: `lms.yourdomain.com`
  - [ ] Student portal: `student.lms.yourdomain.com`
  - [ ] Teacher portal: `teacher.lms.yourdomain.com`
  - [ ] Admin portal: `admin.lms.yourdomain.com`
  - [ ] API Gateway: `api.lms.yourdomain.com`

### Development Tools Setup

- [ ] **Install required tools on local machine**
  - [ ] Azure CLI: `winget install Microsoft.AzureCLI`
  - [ ] Terraform: `winget install Hashicorp.Terraform`
  - [ ] Git: `winget install Git.Git`
  - [ ] Docker Desktop: `winget install Docker.DockerDesktop`
  - [ ] VS Code: `winget install Microsoft.VisualStudioCode`
  - [ ] Python 3.10+: `winget install Python.Python.3.10`
  - [ ] Node.js 18+: `winget install OpenJS.NodeJS`
  - [ ] PostgreSQL client: `winget install PostgreSQL.pgAdmin`

- [ ] **Azure CLI login**
  ```powershell
  az login
  az account set --subscription "LMS-Production-Subscription"
  az account show
  ```

- [ ] **Setup GitHub repository**
  - [ ] Create repo: `lms-microservices`
  - [ ] Initialize with README
  - [ ] Add .gitignore (Python, Node, Terraform)
  - [ ] Clone to local: `git clone https://github.com/___/lms-microservices.git`
  - [ ] Branch strategy: `main`, `develop`, `feature/*`

### On-Premise Equipment Preparation

- [ ] **Purchase NAS equipment**
  - [ ] NAS model: Synology DS423+ (recommended)
  - [ ] Hard drives: 4x 8TB WD Red Plus (~$180 each = $720)
  - [ ] UPS: APC Back-UPS 1500VA (~$180)
  - [ ] Network cable: Cat6 Ethernet cable
  - [ ] Total cost: ~$1,500-1,600
  - [ ] Vendor: `_______________`
  - [ ] Order number: `_______________`

- [ ] **Prepare network infrastructure**
  - [ ] Static IP for NAS: `192.168.1.___`
  - [ ] Router with VPN support (check existing)
  - [ ] Public IP address (static recommended): `_______________`
  - [ ] ISP provider: `_______________`
  - [ ] Bandwidth: Upload ____ Mbps / Download ____ Mbps

---

## 🏗️ Phase 1: Foundation Infrastructure (Week 3-6)

### Resource Group & Networking

- [ ] **Create Resource Group**
  ```powershell
  az group create --name lms-production-rg --location southeastasia
  ```
  - [ ] Resource Group name: `lms-production-rg`
  - [ ] Location: `southeastasia` (Singapore)
  - [ ] Tags: `Environment=Production`, `Project=LMS`

- [ ] **Create Virtual Network (VNET)**
  ```powershell
  az network vnet create \
    --resource-group lms-production-rg \
    --name lms-vnet \
    --address-prefix 10.0.0.0/16 \
    --location southeastasia
  ```
  - [ ] VNET name: `lms-vnet`
  - [ ] Address space: `10.0.0.0/16`

- [ ] **Create subnets**
  ```powershell
  # Frontend subnet
  az network vnet subnet create \
    --resource-group lms-production-rg \
    --vnet-name lms-vnet \
    --name frontend-subnet \
    --address-prefixes 10.0.1.0/24
  
  # Backend subnet
  az network vnet subnet create \
    --resource-group lms-production-rg \
    --vnet-name lms-vnet \
    --name backend-subnet \
    --address-prefixes 10.0.2.0/24
  
  # Database subnet
  az network vnet subnet create \
    --resource-group lms-production-rg \
    --vnet-name lms-vnet \
    --name database-subnet \
    --address-prefixes 10.0.3.0/24
  
  # Gateway subnet
  az network vnet subnet create \
    --resource-group lms-production-rg \
    --vnet-name lms-vnet \
    --name GatewaySubnet \
    --address-prefixes 10.0.4.0/24
  ```
  - [ ] Frontend subnet: `10.0.1.0/24`
  - [ ] Backend subnet: `10.0.2.0/24`
  - [ ] Database subnet: `10.0.3.0/24`
  - [ ] Gateway subnet: `10.0.4.0/24`

- [ ] **Create Network Security Groups (NSG)**
  - [ ] Frontend NSG: `frontend-nsg`
    - [ ] Allow HTTPS (443) from Internet
    - [ ] Allow HTTP (80) from Internet (redirect to HTTPS)
    - [ ] Deny all other inbound
  - [ ] Backend NSG: `backend-nsg`
    - [ ] Allow HTTPS (443) from Frontend subnet
    - [ ] Allow 8000-8004 from Frontend subnet
    - [ ] Deny all other inbound
  - [ ] Database NSG: `database-nsg`
    - [ ] Allow PostgreSQL (5432) from Backend subnet
    - [ ] Deny all other inbound

### Azure Key Vault

- [ ] **Create Key Vault**
  ```powershell
  az keyvault create \
    --name lms-keyvault-prod \
    --resource-group lms-production-rg \
    --location southeastasia \
    --enable-soft-delete true \
    --enable-purge-protection true
  ```
  - [ ] Key Vault name: `lms-keyvault-prod`
  - [ ] Enable soft delete: Yes (90 days)
  - [ ] Enable purge protection: Yes

- [ ] **Add secrets to Key Vault**
  - [ ] `DatabasePassword`: Strong password (20+ chars)
  - [ ] `JWTSecret`: Random string (32+ chars)
  - [ ] `BlobStorageConnectionString`: (will add later)
  - [ ] `EmailAPIKey`: (if using SendGrid/Mailgun)
  - [ ] `SecretKey-Flask`: For Flask session

- [ ] **Setup access policies**
  - [ ] Grant "Get Secret" to App Services (Managed Identity)
  - [ ] Grant "All" to DevOps team
  - [ ] Grant "Get Secret" to developers (read-only)

### Azure Database for PostgreSQL

- [ ] **Create PostgreSQL Flexible Server**
  ```powershell
  az postgres flexible-server create \
    --resource-group lms-production-rg \
    --name lms-postgres-server \
    --location southeastasia \
    --admin-user lmsadmin \
    --admin-password <stored-in-keyvault> \
    --sku-name Standard_B2s \
    --tier Burstable \
    --version 14 \
    --storage-size 32 \
    --public-access None \
    --vnet lms-vnet \
    --subnet database-subnet
  ```
  - [ ] Server name: `lms-postgres-server`
  - [ ] Admin username: `lmsadmin`
  - [ ] Admin password: (from Key Vault)
  - [ ] SKU: `Standard_B2s` (2 vCores, 4GB RAM)
  - [ ] Storage: 32GB (auto-grow enabled)
  - [ ] PostgreSQL version: 14

- [ ] **Configure PostgreSQL settings**
  - [ ] Enable SSL: Required
  - [ ] Connection security: Private endpoint only
  - [ ] Backup retention: 30 days
  - [ ] Geo-redundant backup: Disabled (save cost)
  - [ ] High availability: Disabled initially (enable later if needed)

- [ ] **Create database**
  ```powershell
  az postgres flexible-server db create \
    --resource-group lms-production-rg \
    --server-name lms-postgres-server \
    --database-name lms_production
  ```
  - [ ] Database name: `lms_production`
  - [ ] Charset: `UTF8`
  - [ ] Collation: `en_US.utf8`

- [ ] **Test connection from local**
  ```powershell
  psql "host=lms-postgres-server.postgres.database.azure.com port=5432 dbname=lms_production user=lmsadmin password=*** sslmode=require"
  ```
  - [ ] Connection successful: Yes / No

- [ ] **Run database migrations**
  - [ ] Create tables: `users`, `courses`, `assignments`, `submissions`, `flashcards`
  - [ ] Create indexes
  - [ ] Insert seed data (test accounts)

### Azure Blob Storage

- [ ] **Create Storage Account**
  ```powershell
  az storage account create \
    --name lmsstorageaccount \
    --resource-group lms-production-rg \
    --location southeastasia \
    --sku Standard_LRS \
    --kind StorageV2 \
    --access-tier Hot \
    --allow-blob-public-access true
  ```
  - [ ] Storage account name: `lmsstorageaccount` (must be unique globally)
  - [ ] Replication: `Standard_LRS` (Locally Redundant)
  - [ ] Performance: Standard
  - [ ] Access tier: Hot

- [ ] **Create blob containers**
  ```powershell
  az storage container create --name media --account-name lmsstorageaccount --public-access blob
  az storage container create --name documents --account-name lmsstorageaccount --public-access blob
  az storage container create --name backups --account-name lmsstorageaccount --public-access off
  az storage container create --name logs --account-name lmsstorageaccount --public-access off
  ```
  - [ ] Container `media`: Public access (images, videos)
  - [ ] Container `documents`: Public access (PDFs, docs)
  - [ ] Container `backups`: Private (DB backups)
  - [ ] Container `logs`: Private (application logs)

- [ ] **Configure CORS for blob storage** (if frontend accesses directly)
  - [ ] Allowed origins: `https://student.lms.yourdomain.com`, etc.
  - [ ] Allowed methods: GET, POST, PUT
  - [ ] Max age: 3600 seconds

- [ ] **Get connection string and add to Key Vault**
  ```powershell
  az storage account show-connection-string --name lmsstorageaccount --resource-group lms-production-rg
  ```
  - [ ] Add to Key Vault as `BlobStorageConnectionString`

---

## 🚀 Phase 2: Backend Services Deployment (Week 7-10)

### App Service Plan

- [ ] **Create App Service Plan**
  ```powershell
  az appservice plan create \
    --name lms-app-service-plan \
    --resource-group lms-production-rg \
    --location southeastasia \
    --is-linux \
    --sku B2
  ```
  - [ ] Plan name: `lms-app-service-plan`
  - [ ] OS: Linux
  - [ ] SKU: `B2` (2 cores, 3.5GB RAM, ~$55/month)
  - [ ] Number of workers: 1 (can scale later)

### Backend Service 1: API Gateway (Port 8000)

- [ ] **Create App Service**
  ```powershell
  az webapp create \
    --name lms-api-gateway \
    --resource-group lms-production-rg \
    --plan lms-app-service-plan \
    --runtime "PYTHON:3.10"
  ```
  - [ ] App name: `lms-api-gateway`
  - [ ] URL: `https://lms-api-gateway.azurewebsites.net`
  - [ ] Custom domain: `api.lms.yourdomain.com`

- [ ] **Enable Managed Identity**
  ```powershell
  az webapp identity assign --name lms-api-gateway --resource-group lms-production-rg
  ```
  - [ ] Grant access to Key Vault

- [ ] **Configure application settings**
  ```powershell
  az webapp config appsettings set \
    --name lms-api-gateway \
    --resource-group lms-production-rg \
    --settings \
      DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://lms-keyvault-prod.vault.azure.net/secrets/DatabasePassword/)" \
      JWT_SECRET="@Microsoft.KeyVault(SecretUri=...)" \
      ENVIRONMENT="production"
  ```
  - [ ] Database connection string
  - [ ] JWT secret
  - [ ] Environment variables
  - [ ] Enable Application Insights

- [ ] **Deploy via Docker**
  - [ ] Build Docker image locally
    ```powershell
    cd backend/gateway_service
    docker build -t lms-api-gateway:latest .
    ```
  - [ ] Push to Azure Container Registry (or Docker Hub)
  - [ ] Configure App Service to pull from registry

- [ ] **Configure health check**
  - [ ] Health check path: `/health`
  - [ ] Expected response: HTTP 200

- [ ] **Test deployment**
  - [ ] Visit: `https://lms-api-gateway.azurewebsites.net/health`
  - [ ] Expected: `{"status": "healthy"}`

### Backend Service 2: User Service (Port 8001)

- [ ] **Create App Service**
  ```powershell
  az webapp create \
    --name lms-user-service \
    --resource-group lms-production-rg \
    --plan lms-app-service-plan \
    --runtime "PYTHON:3.10"
  ```
  - [ ] App name: `lms-user-service`
  - [ ] URL: `https://lms-user-service.azurewebsites.net`

- [ ] **Enable Managed Identity**
  - [ ] Grant access to Key Vault

- [ ] **Configure application settings**
  - [ ] Database connection
  - [ ] Environment variables
  - [ ] Application Insights

- [ ] **Deploy via Docker**
  ```powershell
  cd backend/user_service
  docker build -t lms-user-service:latest .
  # Push and deploy
  ```

- [ ] **Test deployment**
  - [ ] Visit: `https://lms-user-service.azurewebsites.net/health`

### Backend Service 3: Content Service (Port 8002)

- [ ] **Create App Service**
  ```powershell
  az webapp create \
    --name lms-content-service \
    --resource-group lms-production-rg \
    --plan lms-app-service-plan \
    --runtime "PYTHON:3.10"
  ```
  - [ ] App name: `lms-content-service`
  - [ ] URL: `https://lms-content-service.azurewebsites.net`

- [ ] **Enable Managed Identity**
  - [ ] Grant access to Key Vault
  - [ ] Grant access to Blob Storage

- [ ] **Configure application settings**
  - [ ] Database connection
  - [ ] Blob storage connection
  - [ ] Environment variables

- [ ] **Deploy via Docker**
  ```powershell
  cd backend/content_service
  docker build -t lms-content-service:latest .
  # Push and deploy
  ```

- [ ] **Test file upload**
  - [ ] Test uploading a file to Blob Storage
  - [ ] Verify file is accessible

### Backend Service 4: Assignment Service (Port 8004)

- [ ] **Create App Service**
  ```powershell
  az webapp create \
    --name lms-assignment-service \
    --resource-group lms-production-rg \
    --plan lms-app-service-plan \
    --runtime "PYTHON:3.10"
  ```
  - [ ] App name: `lms-assignment-service`
  - [ ] URL: `https://lms-assignment-service.azurewebsites.net`

- [ ] **Enable Managed Identity**
  - [ ] Grant access to Key Vault

- [ ] **Configure application settings**
  - [ ] Database connection
  - [ ] Environment variables

- [ ] **Deploy via Docker**
  ```powershell
  cd backend/assignment_service
  docker build -t lms-assignment-service:latest .
  # Push and deploy
  ```

- [ ] **Test deployment**
  - [ ] Create test assignment
  - [ ] Submit test assignment

### Backend Integration Testing

- [ ] **Test inter-service communication**
  - [ ] API Gateway → User Service
  - [ ] API Gateway → Content Service
  - [ ] API Gateway → Assignment Service

- [ ] **Test database operations**
  - [ ] Create, Read, Update, Delete for all entities
  - [ ] Test transactions
  - [ ] Test concurrent requests

- [ ] **Performance testing**
  - [ ] Load test with 50 concurrent users
  - [ ] Check response times (<500ms)
  - [ ] Check error rates (<1%)

---

## 🎨 Phase 3: Frontend Deployment (Week 11-12)

### Student Portal (Port 3003)

- [ ] **Build production version**
  ```powershell
  cd frontend/student-portal
  npm install
  npm run build
  ```
  - [ ] Build successful: Yes / No
  - [ ] Build output: `build/` or `dist/`

- [ ] **Create Static Web App**
  ```powershell
  az staticwebapp create \
    --name lms-student-portal \
    --resource-group lms-production-rg \
    --location southeastasia \
    --source https://github.com/your-org/lms-microservices \
    --branch main \
    --app-location "/frontend/student-portal" \
    --output-location "build"
  ```
  - [ ] App name: `lms-student-portal`
  - [ ] Default URL: `https://lms-student-portal.azurestaticapps.net`

- [ ] **Configure custom domain**
  - [ ] Add CNAME: `student.lms.yourdomain.com` → Static Web App URL
  - [ ] Verify domain ownership
  - [ ] Enable HTTPS (automatic)

- [ ] **Configure environment variables**
  - [ ] `REACT_APP_API_URL=https://api.lms.yourdomain.com`
  - [ ] Rebuild and redeploy

- [ ] **Test deployment**
  - [ ] Visit: `https://student.lms.yourdomain.com`
  - [ ] Test login functionality
  - [ ] Test viewing assignments
  - [ ] Test flashcards

### Teacher Portal (Port 3002)

- [ ] **Build production version**
  ```powershell
  cd frontend/teacher-portal
  npm install
  npm run build
  ```

- [ ] **Create Static Web App**
  ```powershell
  az staticwebapp create \
    --name lms-teacher-portal \
    --resource-group lms-production-rg \
    --location southeastasia
  ```
  - [ ] App name: `lms-teacher-portal`
  - [ ] Custom domain: `teacher.lms.yourdomain.com`

- [ ] **Configure and test**
  - [ ] Set API URL
  - [ ] Test login
  - [ ] Test creating assignments
  - [ ] Test grading submissions

### Admin Portal (Port 3001)

- [ ] **Build production version**
  ```powershell
  cd frontend/admin-portal
  npm install
  npm run build
  ```

- [ ] **Create Static Web App**
  ```powershell
  az staticwebapp create \
    --name lms-admin-portal \
    --resource-group lms-production-rg \
    --location southeastasia
  ```
  - [ ] App name: `lms-admin-portal`
  - [ ] Custom domain: `admin.lms.yourdomain.com`

- [ ] **Configure and test**
  - [ ] Set API URL
  - [ ] Test admin login
  - [ ] Test user management
  - [ ] Test system configuration

### Frontend Integration Testing

- [ ] **Cross-browser testing**
  - [ ] Chrome: Working / Issues: ___
  - [ ] Firefox: Working / Issues: ___
  - [ ] Safari: Working / Issues: ___
  - [ ] Edge: Working / Issues: ___

- [ ] **Mobile responsiveness**
  - [ ] iPhone (Safari): Working / Issues: ___
  - [ ] Android (Chrome): Working / Issues: ___
  - [ ] Tablet: Working / Issues: ___

- [ ] **End-to-end user flows**
  - [ ] Student: Login → View course → Complete assignment
  - [ ] Teacher: Login → Create assignment → Grade submission
  - [ ] Admin: Login → Add user → Assign role

---

## 🔐 Phase 4: Security Hardening (Week 13-14)

### Azure VPN Gateway (On-Premise Connection)

- [ ] **Create VPN Gateway**
  ```powershell
  az network public-ip create \
    --name lms-vpn-gateway-ip \
    --resource-group lms-production-rg \
    --allocation-method Dynamic
  
  az network vnet-gateway create \
    --name lms-vpn-gateway \
    --resource-group lms-production-rg \
    --vnet lms-vnet \
    --gateway-type Vpn \
    --vpn-type RouteBased \
    --sku Basic \
    --public-ip-address lms-vpn-gateway-ip
  ```
  - [ ] Gateway name: `lms-vpn-gateway`
  - [ ] SKU: Basic (~$27/month)
  - [ ] Creation time: ~45 minutes
  - [ ] Public IP: `_______________`

- [ ] **Configure Local Network Gateway** (on-premise)
  ```powershell
  az network local-gateway create \
    --name lms-onpremise-gateway \
    --resource-group lms-production-rg \
    --gateway-ip-address <your-public-ip> \
    --local-address-prefixes 192.168.1.0/24
  ```
  - [ ] On-premise public IP: `_______________`
  - [ ] On-premise network: `192.168.1.0/24`

- [ ] **Create VPN connection**
  ```powershell
  az network vpn-connection create \
    --name azure-to-onpremise \
    --resource-group lms-production-rg \
    --vnet-gateway1 lms-vpn-gateway \
    --local-gateway2 lms-onpremise-gateway \
    --shared-key <strong-preshared-key>
  ```
  - [ ] Connection name: `azure-to-onpremise`
  - [ ] Shared key: (secure, 20+ chars)

- [ ] **Test VPN connection**
  - [ ] Connection status: Connected / Disconnected
  - [ ] Ping from Azure VM to NAS: Success / Fail
  - [ ] Ping from NAS to Azure VM: Success / Fail

### SSL/TLS Certificates

- [ ] **Request SSL certificates**
  - [ ] Method: Azure App Service Managed Certificate (Free)
  - [ ] Or: Let's Encrypt
  - [ ] Or: Purchase from CA

- [ ] **Bind certificates to custom domains**
  - [ ] `api.lms.yourdomain.com`: Bound / Pending
  - [ ] `student.lms.yourdomain.com`: Auto HTTPS (Static Web App)
  - [ ] `teacher.lms.yourdomain.com`: Auto HTTPS
  - [ ] `admin.lms.yourdomain.com`: Auto HTTPS

- [ ] **Force HTTPS redirect**
  - [ ] API Gateway: Enabled
  - [ ] All backend services: Enabled
  - [ ] All frontend apps: Enabled

### Azure Application Gateway (Optional - Full Security)

- [ ] **Create Application Gateway** (OPTIONAL - adds $125/month)
  ```powershell
  # Skip for MVP to save cost
  # Implement when budget allows
  ```
  - [ ] SKU: Standard_v2 (with WAF)
  - [ ] Features: Load balancing, WAF, SSL termination
  - [ ] Status: ⏸️ Postponed / ✅ Deployed

### Azure Firewall (Optional - Enhanced Security)

- [ ] **Create Azure Firewall** (OPTIONAL - adds $50/month)
  ```powershell
  # Skip for MVP to save cost
  # Use NSG for basic filtering
  ```
  - [ ] SKU: Basic
  - [ ] Status: ⏸️ Postponed / ✅ Deployed

### Security Best Practices

- [ ] **Enable Azure Defender for Cloud**
  - [ ] Enable for: App Services, Databases, Storage
  - [ ] Review security recommendations
  - [ ] Fix high-priority issues

- [ ] **Configure Network Security Groups**
  - [ ] Review all NSG rules
  - [ ] Apply least privilege principle
  - [ ] Document all allowed ports

- [ ] **Enable MFA for all users**
  - [ ] Admin accounts: Required
  - [ ] Developer accounts: Required
  - [ ] End users: Optional (can enable later)

- [ ] **Setup Azure Policy**
  - [ ] Enforce tags on all resources
  - [ ] Require SSL for storage accounts
  - [ ] Prevent public IP creation (except specific cases)
  - [ ] Allowed locations: Southeast Asia only

- [ ] **Enable diagnostic logging**
  - [ ] App Services → Log Analytics
  - [ ] PostgreSQL → Log Analytics
  - [ ] Storage Account → Log Analytics
  - [ ] NSG flow logs → Storage Account

---

## 💾 Phase 5: Backup & Disaster Recovery (Week 15-16)

### On-Premise NAS Setup

- [ ] **Unbox and setup NAS**
  - [ ] Connect power and UPS
  - [ ] Connect to network via Ethernet
  - [ ] Power on and wait for boot

- [ ] **Initial NAS configuration**
  - [ ] Access web interface: `http://192.168.1.___:5000`
  - [ ] Install DSM (DiskStation Manager)
  - [ ] Create admin account: `nasadmin`
  - [ ] Set strong password (20+ chars)
  - [ ] Enable 2FA for admin

- [ ] **Install hard drives**
  - [ ] Install 4x 8TB WD Red Plus drives
  - [ ] Check all drives detected
  - [ ] Run SMART tests on all drives

- [ ] **Create Storage Pool**
  - [ ] Type: Synology Hybrid RAID (SHR) or RAID 5
  - [ ] Drives: All 4x 8TB
  - [ ] Usable capacity: ~24TB
  - [ ] Creation time: 6-12 hours

- [ ] **Create Volume**
  - [ ] File system: Btrfs (recommended) or ext4
  - [ ] Enable compression: Yes
  - [ ] Enable data checksum: Yes

- [ ] **Network configuration**
  - [ ] Set static IP: `192.168.1.___`
  - [ ] Subnet mask: `255.255.255.0`
  - [ ] Gateway: `192.168.1.1`
  - [ ] DNS: `8.8.8.8`, `8.8.4.4`

- [ ] **Enable services**
  - [ ] SSH: Enable (port 22)
  - [ ] NFS: Enable
  - [ ] SMB/CIFS: Enable (if needed)
  - [ ] FTP: Disable (use SFTP instead)

- [ ] **Create shared folders**
  - [ ] `azure-backups` (for Azure backups)
  - [ ] `database-backups` (PostgreSQL dumps)
  - [ ] `file-backups` (Blob Storage files)
  - [ ] `logs` (application logs)

- [ ] **Setup VPN client on NAS**
  - [ ] Download VPN config from Azure
  - [ ] Install VPN client on Synology
  - [ ] Import configuration
  - [ ] Test connection to Azure

### Azure Backup Configuration

- [ ] **Create Recovery Services Vault**
  ```powershell
  az backup vault create \
    --resource-group lms-production-rg \
    --name lms-backup-vault \
    --location southeastasia
  ```
  - [ ] Vault name: `lms-backup-vault`

- [ ] **Enable backup for PostgreSQL**
  ```powershell
  az postgres flexible-server backup create \
    --resource-group lms-production-rg \
    --name lms-postgres-server
  ```
  - [ ] Backup frequency: Daily at 2 AM
  - [ ] Retention: 30 days
  - [ ] Geo-replication: Disabled (cost saving)

- [ ] **Enable backup for Blob Storage**
  - [ ] Enable soft delete: 14 days
  - [ ] Enable versioning: Yes
  - [ ] Enable point-in-time restore: 7 days

### Backup Automation Scripts

- [ ] **Create backup script for database**
  ```bash
  #!/bin/bash
  # File: /volume1/scripts/backup-database.sh
  
  DATE=$(date +%Y%m%d_%H%M%S)
  BACKUP_DIR="/volume1/azure-backups/database-backups"
  
  # PostgreSQL dump via VPN
  PGPASSWORD="***" pg_dump \
    -h lms-postgres-server.postgres.database.azure.com \
    -U lmsadmin \
    -d lms_production \
    -F c \
    -f "$BACKUP_DIR/lms_production_$DATE.dump"
  
  # Compress
  gzip "$BACKUP_DIR/lms_production_$DATE.dump"
  
  # Delete backups older than 30 days
  find "$BACKUP_DIR" -name "*.dump.gz" -mtime +30 -delete
  ```
  - [ ] Script created: Yes
  - [ ] Permissions: `chmod +x backup-database.sh`
  - [ ] Test run: Success / Fail

- [ ] **Create backup script for files**
  ```bash
  #!/bin/bash
  # File: /volume1/scripts/backup-files.sh
  
  DATE=$(date +%Y%m%d)
  BACKUP_DIR="/volume1/azure-backups/file-backups"
  
  # Sync from Azure Blob Storage
  azcopy sync \
    "https://lmsstorageaccount.blob.core.windows.net/media" \
    "$BACKUP_DIR/media/" \
    --recursive
  
  azcopy sync \
    "https://lmsstorageaccount.blob.core.windows.net/documents" \
    "$BACKUP_DIR/documents/" \
    --recursive
  ```
  - [ ] Install azcopy on NAS
  - [ ] Script created: Yes
  - [ ] Test run: Success / Fail

- [ ] **Setup cron jobs on NAS**
  ```bash
  # Edit crontab
  crontab -e
  
  # Database backup: Daily at 2 AM
  0 2 * * * /volume1/scripts/backup-database.sh >> /volume1/logs/backup-db.log 2>&1
  
  # File backup: Weekly on Sunday at 3 AM
  0 3 * * 0 /volume1/scripts/backup-files.sh >> /volume1/logs/backup-files.log 2>&1
  ```
  - [ ] Cron jobs added: Yes
  - [ ] Verify cron schedule: `crontab -l`

- [ ] **Test backup process**
  - [ ] Run database backup manually
  - [ ] Verify backup file created
  - [ ] Check backup file size (should be >0)
  - [ ] Test restore from backup

### Disaster Recovery Planning

- [ ] **Document recovery procedures**
  - [ ] Create runbook: `DISASTER_RECOVERY_RUNBOOK.md`
  - [ ] Include step-by-step recovery steps
  - [ ] Include contact information
  - [ ] Include estimated RTO/RPO

- [ ] **Setup Azure Site Recovery** (Optional)
  - [ ] Configure replication to secondary region
  - [ ] Test failover to DR region
  - [ ] Status: ⏸️ Postponed / ✅ Deployed

- [ ] **Test restore procedures**
  - [ ] Restore database from Azure Backup
  - [ ] Restore database from NAS backup
  - [ ] Restore files from Blob Storage
  - [ ] Restore files from NAS backup
  - [ ] Document restore time: ___ minutes

---

## 📊 Phase 6: Monitoring & Optimization (Week 17-18)

### Azure Monitor Setup

- [ ] **Create Log Analytics Workspace**
  ```powershell
  az monitor log-analytics workspace create \
    --resource-group lms-production-rg \
    --workspace-name lms-log-analytics \
    --location southeastasia
  ```
  - [ ] Workspace name: `lms-log-analytics`
  - [ ] Retention: 90 days (default)

- [ ] **Connect resources to Log Analytics**
  - [ ] App Services (all 4 backend services)
  - [ ] PostgreSQL Flexible Server
  - [ ] Storage Account
  - [ ] NSG Flow Logs
  - [ ] VPN Gateway

- [ ] **Enable Application Insights**
  ```powershell
  az monitor app-insights component create \
    --app lms-application-insights \
    --location southeastasia \
    --resource-group lms-production-rg \
    --application-type web
  ```
  - [ ] Component name: `lms-application-insights`
  - [ ] Connect to all App Services

### Alerts Configuration

- [ ] **Create alert rules**
  - [ ] **High CPU usage**
    - Metric: CPU percentage > 80%
    - Duration: 5 minutes
    - Action: Email to devops@___
  
  - [ ] **High memory usage**
    - Metric: Memory percentage > 85%
    - Duration: 5 minutes
    - Action: Email + SMS
  
  - [ ] **Slow response time**
    - Metric: Average response time > 2 seconds
    - Duration: 5 minutes
    - Action: Email to devops@___
  
  - [ ] **High error rate**
    - Metric: HTTP 5xx errors > 10 in 5 minutes
    - Duration: 5 minutes
    - Action: Email + SMS + PagerDuty
  
  - [ ] **Database connections**
    - Metric: Active connections > 80% of max
    - Duration: 5 minutes
    - Action: Email + trigger autoscale
  
  - [ ] **Disk space**
    - Metric: Disk usage > 90%
    - Duration: 5 minutes
    - Action: Email to devops@___
  
  - [ ] **Backup failure**
    - Metric: Backup job failed
    - Duration: Immediate
    - Action: Email + SMS

- [ ] **Test alert rules**
  - [ ] Trigger test alert
  - [ ] Verify email received
  - [ ] Verify SMS received (if configured)

### Dashboards

- [ ] **Create System Health Dashboard**
  - [ ] Add widgets: CPU, Memory, Response time
  - [ ] Add widgets: Active users, Request count
  - [ ] Add widgets: Database connections, Storage usage
  - [ ] Pin to Azure Portal home

- [ ] **Create Performance Dashboard**
  - [ ] Add widgets: Response time by endpoint
  - [ ] Add widgets: Slow queries
  - [ ] Add widgets: Dependency latency
  - [ ] Share with team

- [ ] **Create Cost Dashboard**
  - [ ] Add widgets: Daily cost trend
  - [ ] Add widgets: Cost by resource
  - [ ] Add widgets: Budget vs actual
  - [ ] Schedule weekly email report

### Performance Optimization

- [ ] **Analyze Application Insights data**
  - [ ] Identify slowest endpoints
  - [ ] Identify slow database queries
  - [ ] Identify dependencies with high latency

- [ ] **Database optimization**
  - [ ] Review query execution plans
  - [ ] Add missing indexes
  - [ ] Optimize N+1 queries
  - [ ] Enable connection pooling

- [ ] **Implement caching** (Optional)
  - [ ] Add Azure Cache for Redis
  - [ ] Cache frequently accessed data
  - [ ] Set appropriate TTL values
  - [ ] Status: ⏸️ Postponed / ✅ Deployed

- [ ] **Enable CDN for static assets** (Optional)
  - [ ] Create Azure CDN profile
  - [ ] Add endpoints for Static Web Apps
  - [ ] Configure caching rules
  - [ ] Status: ⏸️ Postponed / ✅ Deployed

---

## 🔄 Phase 7: CI/CD Pipeline (Week 19-20)

### GitHub Actions Setup

- [ ] **Create GitHub Actions workflow**
  ```yaml
  # File: .github/workflows/azure-deploy.yml
  name: Deploy to Azure
  
  on:
    push:
      branches: [ main ]
    pull_request:
      branches: [ main ]
  
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Run tests
          run: |
            cd backend
            pip install -r requirements.txt
            pytest
    
    build-and-deploy:
      needs: test
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Build Docker images
          run: |
            docker build -t lms-api-gateway backend/gateway_service
            docker build -t lms-user-service backend/user_service
        - name: Push to ACR
          run: |
            # Push to Azure Container Registry
        - name: Deploy to App Services
          run: |
            # Deploy using Azure CLI
  ```
  - [ ] Workflow file created: Yes
  - [ ] Secrets configured in GitHub
  - [ ] Test workflow: Success / Fail

- [ ] **Configure GitHub Secrets**
  - [ ] `AZURE_CREDENTIALS`: Service principal JSON
  - [ ] `ACR_USERNAME`: Container registry username
  - [ ] `ACR_PASSWORD`: Container registry password
  - [ ] `DATABASE_PASSWORD`: From Key Vault

- [ ] **Test CI/CD pipeline**
  - [ ] Make a commit to `main` branch
  - [ ] Verify workflow triggered
  - [ ] Verify tests passed
  - [ ] Verify deployment successful
  - [ ] Verify application working after deployment

### Infrastructure as Code (Terraform)

- [ ] **Create Terraform configuration**
  ```hcl
  # File: terraform/main.tf
  terraform {
    required_providers {
      azurerm = {
        source  = "hashicorp/azurerm"
        version = "~> 3.0"
      }
    }
    backend "azurerm" {
      resource_group_name  = "lms-terraform-rg"
      storage_account_name = "lmsterraformstate"
      container_name       = "tfstate"
      key                  = "production.terraform.tfstate"
    }
  }
  
  provider "azurerm" {
    features {}
  }
  
  # Resource Group
  resource "azurerm_resource_group" "lms" {
    name     = "lms-production-rg"
    location = "southeastasia"
  }
  
  # ... more resources ...
  ```
  - [ ] Directory structure created
  - [ ] All resources defined
  - [ ] Variables extracted to `variables.tf`
  - [ ] Outputs defined in `outputs.tf`

- [ ] **Initialize Terraform**
  ```powershell
  cd terraform
  terraform init
  terraform plan
  ```
  - [ ] Backend configured: Yes
  - [ ] Plan successful: Yes
  - [ ] No errors: Yes

- [ ] **Apply Terraform** (Optional - use for future changes)
  ```powershell
  terraform apply
  ```
  - [ ] Status: ⏸️ Manual deployment / ✅ IaC managed

---

## ✅ Phase 8: Final Validation & Go-Live (Week 21-22)

### Pre-Production Checklist

- [ ] **Functionality testing**
  - [ ] All user flows tested: Student, Teacher, Admin
  - [ ] All CRUD operations working
  - [ ] File upload/download working
  - [ ] Authentication and authorization working
  - [ ] Email notifications working (if applicable)

- [ ] **Performance testing**
  - [ ] Load test with 100 concurrent users
  - [ ] Response time < 300ms for 95th percentile
  - [ ] Error rate < 1%
  - [ ] Database query time < 100ms average

- [ ] **Security testing**
  - [ ] OWASP Top 10 vulnerabilities checked
  - [ ] SQL injection tests: Passed
  - [ ] XSS tests: Passed
  - [ ] CSRF protection: Enabled
  - [ ] Security headers configured
  - [ ] SSL/TLS properly configured

- [ ] **Backup validation**
  - [ ] Automated backups running daily
  - [ ] Backup verification successful
  - [ ] Restore test completed successfully
  - [ ] RTO < 4 hours confirmed
  - [ ] RPO < 24 hours confirmed

- [ ] **Monitoring validation**
  - [ ] All metrics being collected
  - [ ] All alerts configured and tested
  - [ ] Dashboards accessible to team
  - [ ] On-call rotation setup

- [ ] **Documentation review**
  - [ ] Architecture diagram up-to-date
  - [ ] Deployment procedures documented
  - [ ] Disaster recovery runbook complete
  - [ ] User manuals prepared
  - [ ] API documentation complete

### User Acceptance Testing (UAT)

- [ ] **Invite test users**
  - [ ] 5-10 students
  - [ ] 2-3 teachers
  - [ ] 1-2 admins

- [ ] **Collect feedback**
  - [ ] Usability issues: ___
  - [ ] Bug reports: ___
  - [ ] Feature requests: ___

- [ ] **Fix critical issues**
  - [ ] All P0 bugs fixed
  - [ ] All P1 bugs fixed or documented

### Go-Live Preparation

- [ ] **Communication plan**
  - [ ] Announce go-live date to users
  - [ ] Prepare user onboarding materials
  - [ ] Setup support email/channel

- [ ] **Create initial users**
  - [ ] Import user list
  - [ ] Send welcome emails
  - [ ] Provide login credentials

- [ ] **Final smoke test**
  - [ ] All systems operational
  - [ ] All integrations working
  - [ ] Monitoring active
  - [ ] Backups verified

### Go-Live

- [ ] **Deploy to production** ✅
  - Date: _______________
  - Time: _______________
  - Status: Success / Issues

- [ ] **Monitor closely for 48 hours**
  - [ ] Day 1: No critical issues
  - [ ] Day 2: System stable

- [ ] **Post-launch review**
  - [ ] Conduct team retrospective
  - [ ] Document lessons learned
  - [ ] Plan for improvements

---

## 📝 Post-Deployment Tasks

### Ongoing Maintenance

- [ ] **Weekly tasks**
  - [ ] Review monitoring dashboards
  - [ ] Check backup logs
  - [ ] Review error logs
  - [ ] Check cost reports

- [ ] **Monthly tasks**
  - [ ] Review security recommendations (Azure Advisor)
  - [ ] Update dependencies and patches
  - [ ] Test disaster recovery procedures
  - [ ] Review and optimize costs
  - [ ] Generate monthly report

- [ ] **Quarterly tasks**
  - [ ] Conduct security audit
  - [ ] Review and update documentation
  - [ ] Capacity planning review
  - [ ] Evaluate new Azure features

### Scaling Preparation

- [ ] **Setup autoscaling rules** (when needed)
  - [ ] App Service: Scale out when CPU > 70%
  - [ ] Database: Scale up when connections > 80%
  - [ ] Test autoscaling triggers

- [ ] **Optimize for cost**
  - [ ] Review reserved instances (1-year or 3-year)
  - [ ] Consider Azure Hybrid Benefit (if applicable)
  - [ ] Review storage access tiers
  - [ ] Delete unused resources

---

## 🎯 Success Metrics

### Technical Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Uptime** | 99.9% | ___% | ⏸️ / ✅ / ❌ |
| **Response Time (p95)** | <300ms | ___ms | ⏸️ / ✅ / ❌ |
| **Error Rate** | <1% | ___% | ⏸️ / ✅ / ❌ |
| **Backup Success** | 100% | ___% | ⏸️ / ✅ / ❌ |
| **Security Score** | >80 | ___ | ⏸️ / ✅ / ❌ |

### Business Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Active Users** | 100 | ___ | ⏸️ / ✅ / ❌ |
| **Monthly Cost** | <$300 | $____ | ⏸️ / ✅ / ❌ |
| **Time to Deploy** | <30 min | ___ min | ⏸️ / ✅ / ❌ |
| **User Satisfaction** | >80% | ___% | ⏸️ / ✅ / ❌ |

---

## 📞 Support & Escalation

### Contacts

| Role | Name | Email | Phone | Availability |
|------|------|-------|-------|--------------|
| **Project Lead** | ___ | ___@___ | +84___ | 24/7 |
| **DevOps On-Call** | ___ | ___@___ | +84___ | 24/7 |
| **Database Admin** | ___ | ___@___ | +84___ | Mon-Fri 9-5 |
| **Security Lead** | ___ | ___@___ | +84___ | Mon-Fri 9-5 |

### Escalation Path

```
Level 1: DevOps Engineer (response: 15 min)
    ↓ (if not resolved in 1 hour)
Level 2: Senior DevOps / Project Lead (response: 30 min)
    ↓ (if not resolved in 2 hours)
Level 3: External Consultant / Azure Support (response: 1 hour)
```

---

## 🏆 Completion Checklist

### Phase Completion

- [ ] ✅ Phase 0: Pre-Deployment Preparation (Week 1-2)
- [ ] ✅ Phase 1: Foundation Infrastructure (Week 3-6)
- [ ] ✅ Phase 2: Backend Services Deployment (Week 7-10)
- [ ] ✅ Phase 3: Frontend Deployment (Week 11-12)
- [ ] ✅ Phase 4: Security Hardening (Week 13-14)
- [ ] ✅ Phase 5: Backup & Disaster Recovery (Week 15-16)
- [ ] ✅ Phase 6: Monitoring & Optimization (Week 17-18)
- [ ] ✅ Phase 7: CI/CD Pipeline (Week 19-20)
- [ ] ✅ Phase 8: Final Validation & Go-Live (Week 21-22)

### Final Sign-Off

- [ ] All critical tasks completed
- [ ] All systems operational
- [ ] Documentation complete
- [ ] Team trained
- [ ] Users notified
- [ ] Support channels active

**Project Status**: 🔄 In Progress / ✅ Complete / ❌ Blocked

**Completion Date**: _______________

**Sign-off by Project Lead**: _______________

---

**END OF CHECKLIST**

💡 **Tips**:
- Print this checklist and check off items as you complete them
- Update the document regularly
- Share progress with stakeholders weekly
- Don't skip steps - each is important for a successful deployment
- When in doubt, test in a staging environment first

Good luck with your deployment! 🚀
