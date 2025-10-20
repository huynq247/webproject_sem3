# 🚀 LMS Microservices - Detailed Deployment Steps

**Project**: Learning Management System (LMS)  
**Architecture**: Hybrid Cloud (Azure + On-Premise)  
**Target Environment**: Production  
**Estimated Time**: 4-6 months (can be shortened to 2-3 months with dedicated team)

---

## 📑 Table of Contents

1. [Prerequisites & Account Setup](#step-1-prerequisites--account-setup)
2. [Azure Infrastructure Foundation](#step-2-azure-infrastructure-foundation)
3. [Database Setup](#step-3-database-setup)
4. [Storage Configuration](#step-4-storage-configuration)
5. [Backend Services Deployment](#step-5-backend-services-deployment)
6. [Frontend Applications Deployment](#step-6-frontend-applications-deployment)
7. [VPN & On-Premise Connection](#step-7-vpn--on-premise-connection)
8. [NAS Backup System Setup](#step-8-nas-backup-system-setup)
9. [Monitoring & Alerting](#step-9-monitoring--alerting)
10. [CI/CD Pipeline Setup](#step-10-cicd-pipeline-setup)
11. [Security Hardening](#step-11-security-hardening)
12. [Testing & Validation](#step-12-testing--validation)
13. [Go-Live Procedures](#step-13-go-live-procedures)

---

# STEP 1: Prerequisites & Account Setup

**Duration**: 2-3 days  
**Responsible**: Project Lead + DevOps Engineer

## 1.1. Create Azure Account

### 1.1.1. Sign up for Azure

```
1. Visit: https://azure.microsoft.com/free/
2. Click "Start free" or "Sign in"
3. Use existing Microsoft account or create new one
4. Verify email and phone number
5. Add credit card (required for verification, won't be charged during free tier)
6. Complete identity verification
```

**What you get**:
- $200 free credit (valid 30 days)
- Free tier services (12 months)
- Always-free services

### 1.1.2. Create Subscription

```powershell
# Login to Azure Portal
# Visit: https://portal.azure.com

# Navigate to: Subscriptions → Add

# Fill in:
- Subscription name: LMS-Production-Subscription
- Billing scope: Your account
- Offer type: Pay-As-You-Go (or Free Trial)

# Note your Subscription ID (you'll need this everywhere)
```

**Copy this information**:
```
Subscription Name: LMS-Production-Subscription
Subscription ID: ________-____-____-____-____________
Tenant ID: ________-____-____-____-____________
```

### 1.1.3. Setup Cost Management

```
1. Go to: Cost Management + Billing
2. Click: Budgets → Add
3. Configure:
   - Name: LMS-Monthly-Budget
   - Amount: $300 USD
   - Reset period: Monthly
   - Start date: First day of current month
   
4. Add alerts:
   - Alert 1: 50% of budget ($150) → Email
   - Alert 2: 80% of budget ($240) → Email + SMS
   - Alert 3: 100% of budget ($300) → Email + SMS
   - Alert 4: 120% of budget ($360) → Email + SMS + Slack
   
5. Add alert recipients:
   - Your email: ____________________
   - Backup email: ____________________
```

## 1.2. Install Required Tools

### 1.2.1. Install Azure CLI

```powershell
# Using winget (Windows 11/10)
winget install Microsoft.AzureCLI

# Or download from: https://aka.ms/installazurecliwindows

# Verify installation
az --version
# Should show: azure-cli 2.x.x or higher

# Login to Azure
az login

# Set default subscription
az account set --subscription "LMS-Production-Subscription"

# Verify
az account show
```

**Expected output**:
```json
{
  "id": "your-subscription-id",
  "name": "LMS-Production-Subscription",
  "state": "Enabled",
  "tenantId": "your-tenant-id"
}
```

### 1.2.2. Install Other Tools

```powershell
# Git
winget install Git.Git

# Docker Desktop
winget install Docker.DockerDesktop

# Python 3.10+
winget install Python.Python.3.10

# Node.js 18+ LTS
winget install OpenJS.NodeJS.LTS

# Visual Studio Code
winget install Microsoft.VisualStudioCode

# Terraform (for IaC)
winget install Hashicorp.Terraform

# PostgreSQL client tools
winget install PostgreSQL.PostgreSQL

# Azure Storage Explorer (optional but useful)
winget install Microsoft.AzureStorageExplorer
```

### 1.2.3. Configure Git

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 1.3. Domain Name Setup

### 1.3.1. Purchase Domain

```
1. Choose domain registrar:
   - GoDaddy: https://www.godaddy.com
   - Namecheap: https://www.namecheap.com
   - Google Domains: https://domains.google

2. Search for domain: lms.yourdomain.com
   (or use existing domain)

3. Purchase domain:
   - Cost: ~$10-30/year
   - Auto-renew: Recommended
   - Privacy protection: Recommended
```

**Your domain**: `___________________.com`

### 1.3.2. Prepare DNS Records (Don't add yet, just note)

```
You will need these DNS records later:

A Record:
- Host: @ or lms
- Points to: (Azure Application Gateway IP - will get later)

CNAME Records:
- student.lms.yourdomain.com → (Azure Static Web App URL)
- teacher.lms.yourdomain.com → (Azure Static Web App URL)
- admin.lms.yourdomain.com → (Azure Static Web App URL)
- api.lms.yourdomain.com → (Azure App Service URL)
```

## 1.4. Setup GitHub Repository

### 1.4.1. Create Repository

```
1. Go to: https://github.com/new
2. Repository name: lms-microservices
3. Description: LMS Learning Management System - Microservices Architecture
4. Visibility: Private (recommended)
5. Initialize:
   ☑ Add README
   ☑ Add .gitignore (Python)
   ☑ Choose license: MIT (or your preference)
6. Click: Create repository
```

### 1.4.2. Clone Repository

```powershell
# Clone to your local machine
cd D:\XProject
git clone https://github.com/YOUR-USERNAME/lms-microservices.git
cd lms-microservices

# Create branch structure
git checkout -b develop
git push -u origin develop

git checkout -b staging
git push -u origin staging

git checkout main
```

### 1.4.3. Create Directory Structure

```powershell
# Create project structure
mkdir backend\gateway_service
mkdir backend\user_service
mkdir backend\content_service
mkdir backend\assignment_service

mkdir frontend\student-portal
mkdir frontend\teacher-portal
mkdir frontend\admin-portal

mkdir terraform\modules\networking
mkdir terraform\modules\compute
mkdir terraform\modules\database
mkdir terraform\modules\storage
mkdir terraform\modules\security

mkdir docs
mkdir scripts\backup
mkdir scripts\deploy
mkdir .github\workflows

# Create README files
New-Item -Path "README.md" -ItemType File
New-Item -Path "backend\README.md" -ItemType File
New-Item -Path "frontend\README.md" -ItemType File
New-Item -Path "terraform\README.md" -ItemType File
```

## 1.5. Setup Azure Active Directory (Entra ID)

### 1.5.1. Access Azure AD

```
1. Go to Azure Portal: https://portal.azure.com
2. Search: "Azure Active Directory" or "Microsoft Entra ID"
3. Click: Overview
4. Note your:
   - Tenant name: ________________.onmicrosoft.com
   - Tenant ID: ________-____-____-____-____________
```

### 1.5.2. Create Admin User

```
1. Go to: Azure AD → Users → New user
2. Click: Create new user
3. Fill in:
   - User name: lms-admin@yourtenant.onmicrosoft.com
   - Name: LMS Administrator
   - Password: (Auto-generate or set)
   - First name: LMS
   - Last name: Administrator
   - Job title: System Administrator
   
4. Click: Create
5. ⚠️ IMPORTANT: Save the password securely
```

### 1.5.3. Create Service Principal (for CI/CD)

```powershell
# Create service principal for GitHub Actions
az ad sp create-for-rbac --name "lms-github-actions" --role contributor --scopes /subscriptions/{subscription-id} --sdk-auth

# ⚠️ IMPORTANT: Save this output! You'll need it for GitHub Secrets
```

**Expected output** (save this JSON):
```json
{
  "clientId": "________-____-____-____-____________",
  "clientSecret": "____________________________",
  "subscriptionId": "________-____-____-____-____________",
  "tenantId": "________-____-____-____-____________",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

---

# STEP 2: Azure Infrastructure Foundation

**Duration**: 1-2 days  
**Responsible**: DevOps Engineer

## 2.1. Create Resource Group

### 2.1.1. Via Azure Portal

```
1. Go to: Azure Portal → Resource groups
2. Click: Create
3. Fill in:
   - Subscription: LMS-Production-Subscription
   - Resource group: lms-production-rg
   - Region: Southeast Asia (Singapore)
   
4. Tags:
   - Environment: Production
   - Project: LMS
   - Owner: Your Name
   - CostCenter: (if applicable)
   
5. Click: Review + Create
6. Click: Create
```

### 2.1.2. Via Azure CLI (Alternative)

```powershell
# Create resource group
az group create `
  --name lms-production-rg `
  --location southeastasia `
  --tags Environment=Production Project=LMS Owner="Your Name"

# Verify
az group show --name lms-production-rg
```

## 2.2. Create Virtual Network (VNET)

### 2.2.1. Create VNET

```powershell
# Create Virtual Network
az network vnet create `
  --resource-group lms-production-rg `
  --name lms-vnet `
  --address-prefix 10.0.0.0/16 `
  --location southeastasia `
  --tags Environment=Production Project=LMS

# Verify
az network vnet show --resource-group lms-production-rg --name lms-vnet
```

**What this creates**:
- Virtual Network: `lms-vnet`
- Address space: `10.0.0.0/16` (65,536 IP addresses)
- Location: Southeast Asia

### 2.2.2. Create Subnets

```powershell
# Frontend Subnet (for Static Web Apps integration)
az network vnet subnet create `
  --resource-group lms-production-rg `
  --vnet-name lms-vnet `
  --name frontend-subnet `
  --address-prefixes 10.0.1.0/24

# Backend Subnet (for App Services)
az network vnet subnet create `
  --resource-group lms-production-rg `
  --vnet-name lms-vnet `
  --name backend-subnet `
  --address-prefixes 10.0.2.0/24

# Database Subnet (for PostgreSQL private endpoint)
az network vnet subnet create `
  --resource-group lms-production-rg `
  --vnet-name lms-vnet `
  --name database-subnet `
  --address-prefixes 10.0.3.0/24

# Gateway Subnet (for VPN Gateway)
az network vnet subnet create `
  --resource-group lms-production-rg `
  --vnet-name lms-vnet `
  --name GatewaySubnet `
  --address-prefixes 10.0.4.0/24

# Verify all subnets
az network vnet subnet list --resource-group lms-production-rg --vnet-name lms-vnet --output table
```

**Network Layout**:
```
10.0.0.0/16 (lms-vnet)
├── 10.0.1.0/24 (frontend-subnet) - 254 IPs
├── 10.0.2.0/24 (backend-subnet) - 254 IPs
├── 10.0.3.0/24 (database-subnet) - 254 IPs
└── 10.0.4.0/24 (GatewaySubnet) - 254 IPs
```

## 2.3. Create Network Security Groups (NSG)

### 2.3.1. Frontend NSG

```powershell
# Create NSG
az network nsg create `
  --resource-group lms-production-rg `
  --name frontend-nsg `
  --location southeastasia

# Allow HTTPS from Internet
az network nsg rule create `
  --resource-group lms-production-rg `
  --nsg-name frontend-nsg `
  --name Allow-HTTPS `
  --priority 100 `
  --source-address-prefixes Internet `
  --source-port-ranges '*' `
  --destination-address-prefixes '*' `
  --destination-port-ranges 443 `
  --access Allow `
  --protocol Tcp `
  --description "Allow HTTPS from Internet"

# Allow HTTP (for redirect to HTTPS)
az network nsg rule create `
  --resource-group lms-production-rg `
  --nsg-name frontend-nsg `
  --name Allow-HTTP `
  --priority 110 `
  --source-address-prefixes Internet `
  --source-port-ranges '*' `
  --destination-address-prefixes '*' `
  --destination-port-ranges 80 `
  --access Allow `
  --protocol Tcp `
  --description "Allow HTTP for redirect to HTTPS"

# Associate with subnet
az network vnet subnet update `
  --resource-group lms-production-rg `
  --vnet-name lms-vnet `
  --name frontend-subnet `
  --network-security-group frontend-nsg
```

### 2.3.2. Backend NSG

```powershell
# Create NSG
az network nsg create `
  --resource-group lms-production-rg `
  --name backend-nsg `
  --location southeastasia

# Allow HTTPS from Frontend subnet
az network nsg rule create `
  --resource-group lms-production-rg `
  --nsg-name backend-nsg `
  --name Allow-HTTPS-from-Frontend `
  --priority 100 `
  --source-address-prefixes 10.0.1.0/24 `
  --source-port-ranges '*' `
  --destination-address-prefixes '*' `
  --destination-port-ranges 443 `
  --access Allow `
  --protocol Tcp

# Allow backend ports (8000-8004) from Frontend
az network nsg rule create `
  --resource-group lms-production-rg `
  --nsg-name backend-nsg `
  --name Allow-Backend-Ports `
  --priority 110 `
  --source-address-prefixes 10.0.1.0/24 `
  --source-port-ranges '*' `
  --destination-address-prefixes '*' `
  --destination-port-ranges 8000-8004 `
  --access Allow `
  --protocol Tcp

# Allow Internet for outbound (App Service needs this)
# Default outbound rule allows this

# Associate with subnet
az network vnet subnet update `
  --resource-group lms-production-rg `
  --vnet-name lms-vnet `
  --name backend-subnet `
  --network-security-group backend-nsg
```

### 2.3.3. Database NSG

```powershell
# Create NSG
az network nsg create `
  --resource-group lms-production-rg `
  --name database-nsg `
  --location southeastasia

# Allow PostgreSQL (5432) from Backend subnet only
az network nsg rule create `
  --resource-group lms-production-rg `
  --nsg-name database-nsg `
  --name Allow-PostgreSQL-from-Backend `
  --priority 100 `
  --source-address-prefixes 10.0.2.0/24 `
  --source-port-ranges '*' `
  --destination-address-prefixes '*' `
  --destination-port-ranges 5432 `
  --access Allow `
  --protocol Tcp

# Deny all other inbound
az network nsg rule create `
  --resource-group lms-production-rg `
  --nsg-name database-nsg `
  --name Deny-All-Inbound `
  --priority 1000 `
  --source-address-prefixes '*' `
  --source-port-ranges '*' `
  --destination-address-prefixes '*' `
  --destination-port-ranges '*' `
  --access Deny `
  --protocol '*'

# Associate with subnet
az network vnet subnet update `
  --resource-group lms-production-rg `
  --vnet-name lms-vnet `
  --name database-subnet `
  --network-security-group database-nsg
```

## 2.4. Create Azure Key Vault

### 2.4.1. Create Key Vault

```powershell
# Create Key Vault (name must be globally unique)
az keyvault create `
  --name lms-keyvault-prod `
  --resource-group lms-production-rg `
  --location southeastasia `
  --enable-soft-delete true `
  --soft-delete-retention-days 90 `
  --enable-purge-protection true `
  --enabled-for-deployment true `
  --enabled-for-template-deployment true

# Verify
az keyvault show --name lms-keyvault-prod --resource-group lms-production-rg
```

**⚠️ If name is taken**, try:
- `lms-kv-prod-001`
- `lms-vault-prod-2025`
- `lms-secrets-prod`

### 2.4.2. Generate and Store Secrets

```powershell
# Generate strong passwords (PowerShell)
function New-StrongPassword {
    $length = 32
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    $password = -join ((1..$length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $password
}

# Generate passwords
$dbPassword = New-StrongPassword
$jwtSecret = New-StrongPassword
$secretKey = New-StrongPassword

# Store in Key Vault
az keyvault secret set --vault-name lms-keyvault-prod --name DatabasePassword --value $dbPassword
az keyvault secret set --vault-name lms-keyvault-prod --name JWTSecret --value $jwtSecret
az keyvault secret set --vault-name lms-keyvault-prod --name SecretKey-Flask --value $secretKey

# ⚠️ IMPORTANT: Save these passwords locally in a secure location!
Write-Host "Database Password: $dbPassword"
Write-Host "JWT Secret: $jwtSecret"
Write-Host "Secret Key: $secretKey"
```

**Save these values**:
```
Database Password: ________________________________
JWT Secret: ________________________________
Secret Key: ________________________________
```

### 2.4.3. Set Access Policies

```powershell
# Get your user object ID
$userId = az ad signed-in-user show --query id -o tsv

# Grant yourself full access
az keyvault set-policy `
  --name lms-keyvault-prod `
  --object-id $userId `
  --secret-permissions get list set delete backup restore recover purge

# Grant service principal access (for CI/CD)
$spId = az ad sp show --id "lms-github-actions" --query id -o tsv
az keyvault set-policy `
  --name lms-keyvault-prod `
  --object-id $spId `
  --secret-permissions get list
```

---

# STEP 3: Database Setup

**Duration**: 2-3 hours  
**Responsible**: DevOps Engineer + Backend Developer

## 3.1. Create PostgreSQL Flexible Server

### 3.1.1. Create Server

```powershell
# Create PostgreSQL Flexible Server
az postgres flexible-server create `
  --resource-group lms-production-rg `
  --name lms-postgres-server `
  --location southeastasia `
  --admin-user lmsadmin `
  --admin-password (az keyvault secret show --vault-name lms-keyvault-prod --name DatabasePassword --query value -o tsv) `
  --sku-name Standard_B2s `
  --tier Burstable `
  --version 14 `
  --storage-size 32 `
  --backup-retention 30 `
  --public-access 0.0.0.0 `
  --tags Environment=Production Project=LMS

# This will take 5-10 minutes...
```

**Configuration**:
- **Server name**: `lms-postgres-server`
- **Admin**: `lmsadmin`
- **Version**: PostgreSQL 14
- **SKU**: Standard_B2s (2 vCores, 4GB RAM)
- **Storage**: 32GB (auto-grow enabled)
- **Backup**: 30 days retention
- **Cost**: ~$45/month

### 3.1.2. Configure Firewall (Temporary for Setup)

```powershell
# Allow your current IP temporarily for setup
$myIp = (Invoke-WebRequest -Uri "https://api.ipify.org").Content

az postgres flexible-server firewall-rule create `
  --resource-group lms-production-rg `
  --name lms-postgres-server `
  --rule-name AllowMyIP `
  --start-ip-address $myIp `
  --end-ip-address $myIp

# ⚠️ We'll remove this after setup and use Private Endpoint
```

### 3.1.3. Create Database

```powershell
# Create production database
az postgres flexible-server db create `
  --resource-group lms-production-rg `
  --server-name lms-postgres-server `
  --database-name lms_production

# Verify
az postgres flexible-server db show `
  --resource-group lms-production-rg `
  --server-name lms-postgres-server `
  --database-name lms_production
```

## 3.2. Connect and Initialize Database

### 3.2.1. Get Connection String

```powershell
# Get connection details
$dbHost = "lms-postgres-server.postgres.database.azure.com"
$dbUser = "lmsadmin"
$dbPassword = az keyvault secret show --vault-name lms-keyvault-prod --name DatabasePassword --query value -o tsv
$dbName = "lms_production"

Write-Host "Host: $dbHost"
Write-Host "User: $dbUser"
Write-Host "Database: $dbName"
Write-Host "Connection string:"
Write-Host "postgresql://${dbUser}:${dbPassword}@${dbHost}:5432/${dbName}?sslmode=require"
```

### 3.2.2. Test Connection

```powershell
# Test connection using psql (if installed)
$env:PGPASSWORD = $dbPassword
psql -h $dbHost -U $dbUser -d $dbName -c "SELECT version();"

# Or using Python
python -c "import psycopg2; conn = psycopg2.connect(host='$dbHost', user='$dbUser', password='$dbPassword', database='$dbName', sslmode='require'); print('Connected!'); conn.close()"
```

**Expected**: Connection successful!

### 3.2.3. Run Database Migrations

```powershell
# Navigate to backend
cd D:\XProject\X1.1MicroService\backend

# Create a migration script (if not exists)
# File: init_database.sql
```

Create file `backend/init_database.sql`:

```sql
-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    max_score INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    file_url VARCHAR(500),
    score INTEGER,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP,
    UNIQUE(assignment_id, student_id)
);

-- Create Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'medium',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_assignments_course ON assignments(course_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_flashcards_course ON flashcards(course_id);

-- Insert seed data
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@lms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSWowRSW', 'System Admin', 'admin'),
('teacher1', 'teacher1@lms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSWowRSW', 'John Teacher', 'teacher'),
('student1', 'student1@lms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSWowRSW', 'Alice Student', 'student')
ON CONFLICT (username) DO NOTHING;

-- Default password for all: "password123"

COMMIT;
```

Run migration:

```powershell
# Apply migrations
$env:PGPASSWORD = $dbPassword
psql -h $dbHost -U $dbUser -d $dbName -f backend/init_database.sql

# Verify tables created
psql -h $dbHost -U $dbUser -d $dbName -c "\dt"
```

**Expected output**: List of tables (users, courses, assignments, submissions, flashcards)

### 3.2.4. Configure Database for Production

```powershell
# Set database parameters for performance
az postgres flexible-server parameter set `
  --resource-group lms-production-rg `
  --server-name lms-postgres-server `
  --name max_connections `
  --value 100

az postgres flexible-server parameter set `
  --resource-group lms-production-rg `
  --server-name lms-postgres-server `
  --name shared_buffers `
  --value 1024

# Enable query logging (useful for debugging)
az postgres flexible-server parameter set `
  --resource-group lms-production-rg `
  --server-name lms-postgres-server `
  --name log_statement `
  --value all
```

### 3.2.5. Store Connection String in Key Vault

```powershell
$connectionString = "postgresql://lmsadmin:${dbPassword}@lms-postgres-server.postgres.database.azure.com:5432/lms_production?sslmode=require"

az keyvault secret set `
  --vault-name lms-keyvault-prod `
  --name DatabaseConnectionString `
  --value $connectionString
```

---

# STEP 4: Storage Configuration

**Duration**: 1-2 hours  
**Responsible**: DevOps Engineer

## 4.1. Create Storage Account

### 4.1.1. Create Account

```powershell
# Create storage account (name must be globally unique, lowercase, no hyphens)
az storage account create `
  --name lmsstorageaccount001 `
  --resource-group lms-production-rg `
  --location southeastasia `
  --sku Standard_LRS `
  --kind StorageV2 `
  --access-tier Hot `
  --allow-blob-public-access true `
  --min-tls-version TLS1_2 `
  --tags Environment=Production Project=LMS

# If name is taken, try: lmsstorprod001, lmsstorage2025, etc.
```

**⚠️ Note your storage account name**: `___________________`

### 4.1.2. Get Storage Keys

```powershell
# Get connection string
$storageConnectionString = az storage account show-connection-string `
  --name lmsstorageaccount001 `
  --resource-group lms-production-rg `
  --query connectionString `
  --output tsv

# Store in Key Vault
az keyvault secret set `
  --vault-name lms-keyvault-prod `
  --name BlobStorageConnectionString `
  --value $storageConnectionString

Write-Host "Connection String: $storageConnectionString"
```

## 4.2. Create Blob Containers

### 4.2.1. Create Containers

```powershell
# Get account key
$accountKey = az storage account keys list `
  --resource-group lms-production-rg `
  --account-name lmsstorageaccount001 `
  --query "[0].value" `
  --output tsv

# Create container for media files (public access)
az storage container create `
  --name media `
  --account-name lmsstorageaccount001 `
  --account-key $accountKey `
  --public-access blob

# Create container for documents (public access)
az storage container create `
  --name documents `
  --account-name lmsstorageaccount001 `
  --account-key $accountKey `
  --public-access blob

# Create container for backups (private)
az storage container create `
  --name backups `
  --account-name lmsstorageaccount001 `
  --account-key $accountKey `
  --public-access off

# Create container for logs (private)
az storage container create `
  --name logs `
  --account-name lmsstorageaccount001 `
  --account-key $accountKey `
  --public-access off

# Verify containers
az storage container list `
  --account-name lmsstorageaccount001 `
  --account-key $accountKey `
  --output table
```

### 4.2.2. Configure CORS (for frontend file uploads)

```powershell
az storage cors add `
  --account-name lmsstorageaccount001 `
  --services b `
  --methods GET POST PUT `
  --origins "https://student.lms.yourdomain.com" "https://teacher.lms.yourdomain.com" "https://admin.lms.yourdomain.com" `
  --allowed-headers "*" `
  --exposed-headers "*" `
  --max-age 3600
```

### 4.2.3. Test Upload

```powershell
# Create a test file
"Test content" | Out-File -FilePath test.txt

# Upload test file
az storage blob upload `
  --account-name lmsstorageaccount001 `
  --account-key $accountKey `
  --container-name media `
  --name test.txt `
  --file test.txt

# Get URL
$testUrl = "https://lmsstorageaccount001.blob.core.windows.net/media/test.txt"
Write-Host "Test file URL: $testUrl"

# Test access
Invoke-WebRequest -Uri $testUrl
```

**Expected**: File content returned successfully

## 4.3. Enable Storage Features

### 4.3.1. Enable Soft Delete

```powershell
# Enable soft delete for blobs (14 days)
az storage blob service-properties delete-policy update `
  --account-name lmsstorageaccount001 `
  --enable true `
  --days-retained 14

# Enable soft delete for containers (14 days)
az storage account blob-service-properties update `
  --account-name lmsstorageaccount001 `
  --resource-group lms-production-rg `
  --enable-container-delete-retention true `
  --container-delete-retention-days 14
```

### 4.3.2. Enable Versioning

```powershell
az storage account blob-service-properties update `
  --account-name lmsstorageaccount001 `
  --resource-group lms-production-rg `
  --enable-versioning true
```

### 4.3.3. Configure Lifecycle Management (Optional)

```powershell
# Create lifecycle policy JSON
@"
{
  "rules": [
    {
      "enabled": true,
      "name": "move-to-cool-after-30-days",
      "type": "Lifecycle",
      "definition": {
        "actions": {
          "baseBlob": {
            "tierToCool": {
              "daysAfterModificationGreaterThan": 30
            }
          }
        },
        "filters": {
          "blobTypes": ["blockBlob"],
          "prefixMatch": ["logs/", "backups/"]
        }
      }
    }
  ]
}
"@ | Out-File -FilePath lifecycle-policy.json

# Apply policy
az storage account management-policy create `
  --account-name lmsstorageaccount001 `
  --resource-group lms-production-rg `
  --policy @lifecycle-policy.json
```

---

# STEP 5: Backend Services Deployment

**Duration**: 1-2 weeks  
**Responsible**: DevOps Engineer + Backend Developers

## 5.1. Prepare Docker Images

### 5.1.1. Create Dockerfile for API Gateway

Create file: `backend/gateway_service/Dockerfile`

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create file: `backend/gateway_service/requirements.txt`

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
requests==2.31.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9
azure-keyvault-secrets==4.7.0
azure-identity==1.15.0
```

### 5.1.2. Create main.py for API Gateway

Create file: `backend/gateway_service/main.py`

```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import requests
from typing import Optional

app = FastAPI(title="LMS API Gateway", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs (from environment variables)
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:8001")
CONTENT_SERVICE_URL = os.getenv("CONTENT_SERVICE_URL", "http://localhost:8002")
ASSIGNMENT_SERVICE_URL = os.getenv("ASSIGNMENT_SERVICE_URL", "http://localhost:8004")

security = HTTPBearer()

@app.get("/")
async def root():
    return {"message": "LMS API Gateway", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "api-gateway"}

@app.get("/api/users/{path:path}")
async def proxy_to_user_service(path: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Proxy requests to User Service"""
    try:
        response = requests.get(
            f"{USER_SERVICE_URL}/{path}",
            headers={"Authorization": f"Bearer {credentials.credentials}"}
        )
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/content/{path:path}")
async def proxy_to_content_service(path: str):
    """Proxy requests to Content Service"""
    try:
        response = requests.get(f"{CONTENT_SERVICE_URL}/{path}")
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assignments/{path:path}")
async def proxy_to_assignment_service(path: str):
    """Proxy requests to Assignment Service"""
    try:
        response = requests.get(f"{ASSIGNMENT_SERVICE_URL}/{path}")
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 5.1.3. Build and Test Locally

```powershell
# Navigate to gateway service
cd D:\XProject\X1.1MicroService\backend\gateway_service

# Build Docker image
docker build -t lms-api-gateway:latest .

# Test locally
docker run -d -p 8000:8000 --name lms-gateway-test lms-api-gateway:latest

# Test endpoint
Invoke-WebRequest -Uri http://localhost:8000/health

# Stop and remove
docker stop lms-gateway-test
docker rm lms-gateway-test
```

## 5.2. Create App Service Plan

### 5.2.1. Create Plan

```powershell
# Create App Service Plan for Linux
az appservice plan create `
  --name lms-app-service-plan `
  --resource-group lms-production-rg `
  --location southeastasia `
  --is-linux `
  --sku B2 `
  --tags Environment=Production Project=LMS

# Verify
az appservice plan show `
  --name lms-app-service-plan `
  --resource-group lms-production-rg
```

**Configuration**:
- **SKU**: B2 (2 cores, 3.5GB RAM)
- **OS**: Linux
- **Cost**: ~$55/month (shared across all 4 backend services)

## 5.3. Deploy API Gateway Service

### 5.3.1. Create App Service

```powershell
# Create Web App
az webapp create `
  --resource-group lms-production-rg `
  --plan lms-app-service-plan `
  --name lms-api-gateway `
  --runtime "PYTHON:3.10" `
  --tags Environment=Production Project=LMS Service=APIGateway

# Enable system-assigned managed identity
az webapp identity assign `
  --name lms-api-gateway `
  --resource-group lms-production-rg
```

**⚠️ Note**: If name is taken, try: `lms-api-gateway-2025`, `lms-gateway-prod`, etc.

### 5.3.2. Configure App Settings

```powershell
# Get Key Vault URI
$keyVaultUri = "https://lms-keyvault-prod.vault.azure.net/"

# Configure application settings
az webapp config appsettings set `
  --resource-group lms-production-rg `
  --name lms-api-gateway `
  --settings `
    ENVIRONMENT="production" `
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/DatabaseConnectionString/)" `
    JWT_SECRET="@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/JWTSecret/)" `
    USER_SERVICE_URL="https://lms-user-service.azurewebsites.net" `
    CONTENT_SERVICE_URL="https://lms-content-service.azurewebsites.net" `
    ASSIGNMENT_SERVICE_URL="https://lms-assignment-service.azurewebsites.net" `
    WEBSITES_PORT=8000 `
    SCM_DO_BUILD_DURING_DEPLOYMENT=true

# Enable Application Insights
az monitor app-insights component create `
  --app lms-application-insights `
  --location southeastasia `
  --resource-group lms-production-rg `
  --application-type web

# Get instrumentation key
$instrumentationKey = az monitor app-insights component show `
  --app lms-application-insights `
  --resource-group lms-production-rg `
  --query instrumentationKey `
  --output tsv

# Add to app settings
az webapp config appsettings set `
  --resource-group lms-production-rg `
  --name lms-api-gateway `
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=$instrumentationKey
```

### 5.3.3. Grant Key Vault Access

```powershell
# Get managed identity principal ID
$principalId = az webapp identity show `
  --name lms-api-gateway `
  --resource-group lms-production-rg `
  --query principalId `
  --output tsv

# Grant access to Key Vault
az keyvault set-policy `
  --name lms-keyvault-prod `
  --object-id $principalId `
  --secret-permissions get list
```

### 5.3.4. Deploy Code

**Option A: Deploy from Local (Quick Test)**

```powershell
cd D:\XProject\X1.1MicroService\backend\gateway_service

# Create deployment package
Compress-Archive -Path * -DestinationPath gateway.zip -Force

# Deploy
az webapp deployment source config-zip `
  --resource-group lms-production-rg `
  --name lms-api-gateway `
  --src gateway.zip

# Wait for deployment (2-5 minutes)
```

**Option B: Deploy via Docker Container**

```powershell
# Enable container logging
az webapp log config `
  --name lms-api-gateway `
  --resource-group lms-production-rg `
  --docker-container-logging filesystem

# Configure to use Docker
az webapp config container set `
  --name lms-api-gateway `
  --resource-group lms-production-rg `
  --docker-custom-image-name lms-api-gateway:latest `
  --docker-registry-server-url https://index.docker.io

# Or use Azure Container Registry (better for production)
# We'll set this up in CI/CD section
```

### 5.3.5. Test Deployment

```powershell
# Get URL
$gatewayUrl = "https://lms-api-gateway.azurewebsites.net"

# Test health endpoint
Invoke-WebRequest -Uri "$gatewayUrl/health"

# Expected: {"status":"healthy","service":"api-gateway"}

# View logs
az webapp log tail --name lms-api-gateway --resource-group lms-production-rg
```

## 5.4. Deploy Remaining Backend Services

### 5.4.1. User Service

```powershell
# Create Web App
az webapp create `
  --resource-group lms-production-rg `
  --plan lms-app-service-plan `
  --name lms-user-service `
  --runtime "PYTHON:3.10"

# Enable managed identity
az webapp identity assign `
  --name lms-user-service `
  --resource-group lms-production-rg

# Configure settings (similar to gateway)
az webapp config appsettings set `
  --resource-group lms-production-rg `
  --name lms-user-service `
  --settings `
    ENVIRONMENT="production" `
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://lms-keyvault-prod.vault.azure.net/secrets/DatabaseConnectionString/)" `
    JWT_SECRET="@Microsoft.KeyVault(SecretUri=https://lms-keyvault-prod.vault.azure.net/secrets/JWTSecret/)" `
    WEBSITES_PORT=8001 `
    APPINSIGHTS_INSTRUMENTATIONKEY=$instrumentationKey

# Grant Key Vault access
$principalId = az webapp identity show --name lms-user-service --resource-group lms-production-rg --query principalId -o tsv
az keyvault set-policy --name lms-keyvault-prod --object-id $principalId --secret-permissions get list

# Deploy code
cd D:\XProject\X1.1MicroService\backend\user_service
Compress-Archive -Path * -DestinationPath user.zip -Force
az webapp deployment source config-zip --resource-group lms-production-rg --name lms-user-service --src user.zip

# Test
Invoke-WebRequest -Uri "https://lms-user-service.azurewebsites.net/health"
```

### 5.4.2. Content Service

```powershell
# Create Web App
az webapp create `
  --resource-group lms-production-rg `
  --plan lms-app-service-plan `
  --name lms-content-service `
  --runtime "PYTHON:3.10"

# Enable managed identity
az webapp identity assign `
  --name lms-content-service `
  --resource-group lms-production-rg

# Configure settings
az webapp config appsettings set `
  --resource-group lms-production-rg `
  --name lms-content-service `
  --settings `
    ENVIRONMENT="production" `
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://lms-keyvault-prod.vault.azure.net/secrets/DatabaseConnectionString/)" `
    BLOB_CONNECTION_STRING="@Microsoft.KeyVault(SecretUri=https://lms-keyvault-prod.vault.azure.net/secrets/BlobStorageConnectionString/)" `
    WEBSITES_PORT=8002 `
    APPINSIGHTS_INSTRUMENTATIONKEY=$instrumentationKey

# Grant Key Vault access
$principalId = az webapp identity show --name lms-content-service --resource-group lms-production-rg --query principalId -o tsv
az keyvault set-policy --name lms-keyvault-prod --object-id $principalId --secret-permissions get list

# Deploy code
cd D:\XProject\X1.1MicroService\backend\content_service
Compress-Archive -Path * -DestinationPath content.zip -Force
az webapp deployment source config-zip --resource-group lms-production-rg --name lms-content-service --src content.zip

# Test
Invoke-WebRequest -Uri "https://lms-content-service.azurewebsites.net/health"
```

### 5.4.3. Assignment Service

```powershell
# Create Web App
az webapp create `
  --resource-group lms-production-rg `
  --plan lms-app-service-plan `
  --name lms-assignment-service `
  --runtime "PYTHON:3.10"

# Enable managed identity
az webapp identity assign `
  --name lms-assignment-service `
  --resource-group lms-production-rg

# Configure settings
az webapp config appsettings set `
  --resource-group lms-production-rg `
  --name lms-assignment-service `
  --settings `
    ENVIRONMENT="production" `
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://lms-keyvault-prod.vault.azure.net/secrets/DatabaseConnectionString/)" `
    BLOB_CONNECTION_STRING="@Microsoft.KeyVault(SecretUri=https://lms-keyvault-prod.vault.azure.net/secrets/BlobStorageConnectionString/)" `
    WEBSITES_PORT=8004 `
    APPINSIGHTS_INSTRUMENTATIONKEY=$instrumentationKey

# Grant Key Vault access
$principalId = az webapp identity show --name lms-assignment-service --resource-group lms-production-rg --query principalId -o tsv
az keyvault set-policy --name lms-keyvault-prod --object-id $principalId --secret-permissions get list

# Deploy code
cd D:\XProject\X1.1MicroService\backend\assignment_service
Compress-Archive -Path * -DestinationPath assignment.zip -Force
az webapp deployment source config-zip --resource-group lms-production-rg --name lms-assignment-service --src assignment.zip

# Test
Invoke-WebRequest -Uri "https://lms-assignment-service.azurewebsites.net/health"
```

## 5.5. Enable HTTPS and Custom Domain

### 5.5.1. Configure Custom Domain for API Gateway

```powershell
# Add custom domain
az webapp config hostname add `
  --webapp-name lms-api-gateway `
  --resource-group lms-production-rg `
  --hostname api.lms.yourdomain.com

# Enable HTTPS redirect
az webapp update `
  --name lms-api-gateway `
  --resource-group lms-production-rg `
  --https-only true

# Bind SSL certificate (Free managed certificate)
az webapp config ssl bind `
  --resource-group lms-production-rg `
  --name lms-api-gateway `
  --certificate-thumbprint auto `
  --ssl-type SNI
```

**📝 Before running, add DNS record**:
```
Type: CNAME
Host: api
Value: lms-api-gateway.azurewebsites.net
TTL: 3600
```

---

# STEP 6: Frontend Applications Deployment

**Duration**: 3-5 days  
**Responsible**: Frontend Developer + DevOps Engineer

## 6.1. Prepare Frontend Code

### 6.1.1. Configure Environment Variables

Create file: `frontend/student-portal/.env.production`

```env
REACT_APP_API_URL=https://api.lms.yourdomain.com
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
```

Create similar files for teacher and admin portals.

### 6.1.2. Build Production Versions

```powershell
# Student Portal
cd D:\XProject\X1.1MicroService\frontend\student-portal
npm install
npm run build

# Teacher Portal
cd D:\XProject\X1.1MicroService\frontend\teacher-portal
npm install
npm run build

# Admin Portal
cd D:\XProject\X1.1MicroService\frontend\admin-portal
npm install
npm run build
```

## 6.2. Deploy Student Portal

### 6.2.1. Create Static Web App

```powershell
# Create Static Web App
az staticwebapp create `
  --name lms-student-portal `
  --resource-group lms-production-rg `
  --location eastasia `
  --sku Free `
  --tags Environment=Production Project=LMS

# Get deployment token
$studentDeploymentToken = az staticwebapp secrets list `
  --name lms-student-portal `
  --resource-group lms-production-rg `
  --query properties.apiKey `
  --output tsv

# Save this token for deployment
Write-Host "Student Portal Deployment Token: $studentDeploymentToken"
```

### 6.2.2. Deploy via Azure CLI

```powershell
cd D:\XProject\X1.1MicroService\frontend\student-portal

# Install Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy `
  --app-location ./build `
  --deployment-token $studentDeploymentToken

# This will take 2-5 minutes
```

### 6.2.3. Configure Custom Domain

```powershell
# Add custom domain
az staticwebapp hostname set `
  --name lms-student-portal `
  --resource-group lms-production-rg `
  --hostname student.lms.yourdomain.com

# SSL is automatically enabled
```

**📝 Add DNS record**:
```
Type: CNAME
Host: student
Value: [shown in Azure Portal after adding hostname]
TTL: 3600
```

### 6.2.4. Test Deployment

```powershell
$studentUrl = az staticwebapp show `
  --name lms-student-portal `
  --resource-group lms-production-rg `
  --query defaultHostname `
  --output tsv

Write-Host "Student Portal URL: https://$studentUrl"

# Test
Invoke-WebRequest -Uri "https://$studentUrl"
```

## 6.3. Deploy Teacher Portal

```powershell
# Create Static Web App
az staticwebapp create `
  --name lms-teacher-portal `
  --resource-group lms-production-rg `
  --location eastasia `
  --sku Free

# Get deployment token
$teacherDeploymentToken = az staticwebapp secrets list `
  --name lms-teacher-portal `
  --resource-group lms-production-rg `
  --query properties.apiKey `
  --output tsv

# Deploy
cd D:\XProject\X1.1MicroService\frontend\teacher-portal
swa deploy --app-location ./build --deployment-token $teacherDeploymentToken

# Add custom domain
az staticwebapp hostname set `
  --name lms-teacher-portal `
  --resource-group lms-production-rg `
  --hostname teacher.lms.yourdomain.com

# Test
$teacherUrl = az staticwebapp show --name lms-teacher-portal --resource-group lms-production-rg --query defaultHostname -o tsv
Write-Host "Teacher Portal URL: https://$teacherUrl"
```

## 6.4. Deploy Admin Portal

```powershell
# Create Static Web App
az staticwebapp create `
  --name lms-admin-portal `
  --resource-group lms-production-rg `
  --location eastasia `
  --sku Free

# Get deployment token
$adminDeploymentToken = az staticwebapp secrets list `
  --name lms-admin-portal `
  --resource-group lms-production-rg `
  --query properties.apiKey `
  --output tsv

# Deploy
cd D:\XProject\X1.1MicroService\frontend\admin-portal
swa deploy --app-location ./build --deployment-token $adminDeploymentToken

# Add custom domain
az staticwebapp hostname set `
  --name lms-admin-portal `
  --resource-group lms-production-rg `
  --hostname admin.lms.yourdomain.com

# Test
$adminUrl = az staticwebapp show --name lms-admin-portal --resource-group lms-production-rg --query defaultHostname -o tsv
Write-Host "Admin Portal URL: https://$adminUrl"
```

## 6.5. Test End-to-End

```powershell
# Test Student Portal
Write-Host "Testing Student Portal..."
Invoke-WebRequest -Uri "https://student.lms.yourdomain.com"

# Test Teacher Portal
Write-Host "Testing Teacher Portal..."
Invoke-WebRequest -Uri "https://teacher.lms.yourdomain.com"

# Test Admin Portal
Write-Host "Testing Admin Portal..."
Invoke-WebRequest -Uri "https://admin.lms.yourdomain.com"

# Test API Gateway
Write-Host "Testing API Gateway..."
Invoke-WebRequest -Uri "https://api.lms.yourdomain.com/health"
```

---

**Continue to STEP 7 in next section...**

(Document is very long - I'll create Part 2 covering Steps 7-13)

Would you like me to:
1. ✅ Continue with Steps 7-13 in a separate file?
2. ✅ Create a Quick Reference Card with all commands?
3. ✅ Create troubleshooting guide for common issues?

Which would be most helpful? 🚀
