# 🚀 LMS Microservices - Detailed Deployment Steps (Part 3)

**Continuation from Part 2**  
**Steps 10-13**: CI/CD Pipeline, Security, Testing, Go-Live

---

# STEP 10: CI/CD Pipeline Setup

**Duration**: 2-3 days  
**Responsible**: DevOps Engineer

## 10.1. Azure Container Registry (ACR) Setup

### 10.1.1. Create Azure Container Registry

```powershell
# Create ACR (name must be globally unique, lowercase, no hyphens)
az acr create `
  --resource-group lms-production-rg `
  --name lmscontainerregistry `
  --sku Basic `
  --location southeastasia `
  --admin-enabled true `
  --tags Environment=Production Project=LMS

# If name taken, try: lmsacr2025, lmsregistry001, etc.
```

**📝 Your ACR name**: `___________________`

### 10.1.2. Get ACR Credentials

```powershell
# Get login server
$acrLoginServer = az acr show `
  --name lmscontainerregistry `
  --resource-group lms-production-rg `
  --query loginServer `
  --output tsv

# Get admin credentials
$acrUsername = az acr credential show `
  --name lmscontainerregistry `
  --query username `
  --output tsv

$acrPassword = az acr credential show `
  --name lmscontainerregistry `
  --query passwords[0].value `
  --output tsv

Write-Host "ACR Login Server: $acrLoginServer"
Write-Host "ACR Username: $acrUsername"
Write-Host "ACR Password: $acrPassword"

# Store in Key Vault
az keyvault secret set --vault-name lms-keyvault-prod --name ACRUsername --value $acrUsername
az keyvault secret set --vault-name lms-keyvault-prod --name ACRPassword --value $acrPassword
```

### 10.1.3. Test ACR Login

```powershell
# Login to ACR
az acr login --name lmscontainerregistry

# Or using Docker
docker login $acrLoginServer -u $acrUsername -p $acrPassword
```

## 10.2. Push Docker Images to ACR

### 10.2.1. Build and Push API Gateway

```powershell
cd D:\XProject\X1.1MicroService\backend\gateway_service

# Build image
docker build -t lmscontainerregistry.azurecr.io/lms-api-gateway:latest .
docker build -t lmscontainerregistry.azurecr.io/lms-api-gateway:v1.0.0 .

# Push to ACR
docker push lmscontainerregistry.azurecr.io/lms-api-gateway:latest
docker push lmscontainerregistry.azurecr.io/lms-api-gateway:v1.0.0
```

### 10.2.2. Build and Push Other Services

```powershell
# User Service
cd D:\XProject\X1.1MicroService\backend\user_service
docker build -t lmscontainerregistry.azurecr.io/lms-user-service:latest .
docker build -t lmscontainerregistry.azurecr.io/lms-user-service:v1.0.0 .
docker push lmscontainerregistry.azurecr.io/lms-user-service:latest
docker push lmscontainerregistry.azurecr.io/lms-user-service:v1.0.0

# Content Service
cd D:\XProject\X1.1MicroService\backend\content_service
docker build -t lmscontainerregistry.azurecr.io/lms-content-service:latest .
docker build -t lmscontainerregistry.azurecr.io/lms-content-service:v1.0.0 .
docker push lmscontainerregistry.azurecr.io/lms-content-service:latest
docker push lmscontainerregistry.azurecr.io/lms-content-service:v1.0.0

# Assignment Service
cd D:\XProject\X1.1MicroService\backend\assignment_service
docker build -t lmscontainerregistry.azurecr.io/lms-assignment-service:latest .
docker build -t lmscontainerregistry.azurecr.io/lms-assignment-service:v1.0.0 .
docker push lmscontainerregistry.azurecr.io/lms-assignment-service:latest
docker push lmscontainerregistry.azurecr.io/lms-assignment-service:v1.0.0
```

### 10.2.3. Verify Images in ACR

```powershell
# List all repositories
az acr repository list --name lmscontainerregistry --output table

# List tags for a specific repository
az acr repository show-tags --name lmscontainerregistry --repository lms-api-gateway --output table
```

## 10.3. Configure App Services to Use ACR

### 10.3.1. Update API Gateway to Use ACR Image

```powershell
# Configure App Service to pull from ACR
az webapp config container set `
  --name lms-api-gateway `
  --resource-group lms-production-rg `
  --docker-custom-image-name lmscontainerregistry.azurecr.io/lms-api-gateway:latest `
  --docker-registry-server-url https://lmscontainerregistry.azurecr.io `
  --docker-registry-server-user $acrUsername `
  --docker-registry-server-password $acrPassword

# Enable continuous deployment (webhook)
az webapp deployment container config `
  --name lms-api-gateway `
  --resource-group lms-production-rg `
  --enable-cd true

# Get webhook URL
$webhookUrl = az webapp deployment container show-cd-url `
  --name lms-api-gateway `
  --resource-group lms-production-rg `
  --query webhookUrl `
  --output tsv

Write-Host "Webhook URL: $webhookUrl"

# Create webhook in ACR
az acr webhook create `
  --registry lmscontainerregistry `
  --name lmsapigatewaywebhook `
  --actions push `
  --uri $webhookUrl `
  --scope lms-api-gateway:*
```

### 10.3.2. Update Other Services

```powershell
# User Service
az webapp config container set `
  --name lms-user-service `
  --resource-group lms-production-rg `
  --docker-custom-image-name lmscontainerregistry.azurecr.io/lms-user-service:latest `
  --docker-registry-server-url https://lmscontainerregistry.azurecr.io `
  --docker-registry-server-user $acrUsername `
  --docker-registry-server-password $acrPassword

# Content Service
az webapp config container set `
  --name lms-content-service `
  --resource-group lms-production-rg `
  --docker-custom-image-name lmscontainerregistry.azurecr.io/lms-content-service:latest `
  --docker-registry-server-url https://lmscontainerregistry.azurecr.io `
  --docker-registry-server-user $acrUsername `
  --docker-registry-server-password $acrPassword

# Assignment Service
az webapp config container set `
  --name lms-assignment-service `
  --resource-group lms-production-rg `
  --docker-custom-image-name lmscontainerregistry.azurecr.io/lms-assignment-service:latest `
  --docker-registry-server-url https://lmscontainerregistry.azurecr.io `
  --docker-registry-server-user $acrUsername `
  --docker-registry-server-password $acrPassword
```

## 10.4. Setup GitHub Actions

### 10.4.1. Configure GitHub Secrets

```
1. Go to your GitHub repository: https://github.com/YOUR-USERNAME/lms-microservices
2. Go to: Settings → Secrets and variables → Actions
3. Click: New repository secret

Add these secrets:

AZURE_CREDENTIALS
Value: (Service principal JSON from Step 1.5.3)

ACR_LOGIN_SERVER
Value: lmscontainerregistry.azurecr.io

ACR_USERNAME
Value: (from 10.1.2)

ACR_PASSWORD
Value: (from 10.1.2)

STUDENT_PORTAL_DEPLOYMENT_TOKEN
Value: (from Step 6.2.1)

TEACHER_PORTAL_DEPLOYMENT_TOKEN
Value: (from Step 6.3)

ADMIN_PORTAL_DEPLOYMENT_TOKEN
Value: (from Step 6.4)
```

### 10.4.2. Create GitHub Actions Workflow for Backend

Create file: `.github/workflows/backend-deploy.yml`

```yaml
name: Backend Services CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'
  pull_request:
    branches: [ main ]
    paths:
      - 'backend/**'
  workflow_dispatch:

env:
  ACR_LOGIN_SERVER: ${{ secrets.ACR_LOGIN_SERVER }}
  ACR_USERNAME: ${{ secrets.ACR_USERNAME }}
  ACR_PASSWORD: ${{ secrets.ACR_PASSWORD }}

jobs:
  # Test backend services
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [gateway_service, user_service, content_service, assignment_service]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python 3.10
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: |
        cd backend/${{ matrix.service }}
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install pytest pytest-cov
    
    - name: Run tests
      run: |
        cd backend/${{ matrix.service }}
        pytest tests/ --cov=. --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./backend/${{ matrix.service }}/coverage.xml
        flags: ${{ matrix.service }}

  # Build and push Docker images
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    strategy:
      matrix:
        service: 
          - name: gateway_service
            image: lms-api-gateway
            app: lms-api-gateway
          - name: user_service
            image: lms-user-service
            app: lms-user-service
          - name: content_service
            image: lms-content-service
            app: lms-content-service
          - name: assignment_service
            image: lms-assignment-service
            app: lms-assignment-service
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Login to ACR
      uses: docker/login-action@v2
      with:
        registry: ${{ env.ACR_LOGIN_SERVER }}
        username: ${{ env.ACR_USERNAME }}
        password: ${{ env.ACR_PASSWORD }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: ./backend/${{ matrix.service.name }}
        push: true
        tags: |
          ${{ env.ACR_LOGIN_SERVER }}/${{ matrix.service.image }}:latest
          ${{ env.ACR_LOGIN_SERVER }}/${{ matrix.service.image }}:${{ github.sha }}
          ${{ env.ACR_LOGIN_SERVER }}/${{ matrix.service.image }}:v${{ github.run_number }}

  # Deploy to Azure App Services
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    strategy:
      matrix:
        service:
          - image: lms-api-gateway
            app: lms-api-gateway
          - image: lms-user-service
            app: lms-user-service
          - image: lms-content-service
            app: lms-content-service
          - image: lms-assignment-service
            app: lms-assignment-service
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Deploy to Azure App Service
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ matrix.service.app }}
        images: ${{ env.ACR_LOGIN_SERVER }}/${{ matrix.service.image }}:${{ github.sha }}
    
    - name: Health Check
      run: |
        sleep 30
        curl -f https://${{ matrix.service.app }}.azurewebsites.net/health || exit 1
    
    - name: Azure Logout
      run: az logout

  # Smoke tests after deployment
  smoke-test:
    needs: deploy
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Test API Gateway
      run: |
        response=$(curl -s -o /dev/null -w "%{http_code}" https://lms-api-gateway.azurewebsites.net/health)
        if [ $response -ne 200 ]; then
          echo "API Gateway health check failed"
          exit 1
        fi
    
    - name: Test User Service
      run: |
        response=$(curl -s -o /dev/null -w "%{http_code}" https://lms-user-service.azurewebsites.net/health)
        if [ $response -ne 200 ]; then
          echo "User Service health check failed"
          exit 1
        fi
    
    - name: Test Content Service
      run: |
        response=$(curl -s -o /dev/null -w "%{http_code}" https://lms-content-service.azurewebsites.net/health)
        if [ $response -ne 200 ]; then
          echo "Content Service health check failed"
          exit 1
        fi
    
    - name: Test Assignment Service
      run: |
        response=$(curl -s -o /dev/null -w "%{http_code}" https://lms-assignment-service.azurewebsites.net/health)
        if [ $response -ne 200 ]; then
          echo "Assignment Service health check failed"
          exit 1
        fi
    
    - name: Notify Success
      if: success()
      run: |
        echo "✅ All services deployed successfully!"
        # Add Slack/Teams notification here if needed
    
    - name: Notify Failure
      if: failure()
      run: |
        echo "❌ Deployment failed!"
        # Add Slack/Teams notification here if needed
```

### 10.4.3. Create GitHub Actions Workflow for Frontend

Create file: `.github/workflows/frontend-deploy.yml`

```yaml
name: Frontend Applications CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [ main ]
    paths:
      - 'frontend/**'
  workflow_dispatch:

jobs:
  # Build and test frontend
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [student-portal, teacher-portal, admin-portal]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/${{ matrix.app }}/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend/${{ matrix.app }}
        npm ci
    
    - name: Run linter
      run: |
        cd frontend/${{ matrix.app }}
        npm run lint
    
    - name: Run tests
      run: |
        cd frontend/${{ matrix.app }}
        npm test -- --coverage --watchAll=false
    
    - name: Build
      run: |
        cd frontend/${{ matrix.app }}
        npm run build
      env:
        REACT_APP_API_URL: https://api.lms.yourdomain.com
        REACT_APP_ENV: production

  # Deploy Student Portal
  deploy-student:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd frontend/student-portal
        npm ci
    
    - name: Build
      run: |
        cd frontend/student-portal
        npm run build
      env:
        REACT_APP_API_URL: https://api.lms.yourdomain.com
        REACT_APP_ENV: production
    
    - name: Deploy to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.STUDENT_PORTAL_DEPLOYMENT_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "frontend/student-portal"
        output_location: "build"

  # Deploy Teacher Portal
  deploy-teacher:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd frontend/teacher-portal
        npm ci
    
    - name: Build
      run: |
        cd frontend/teacher-portal
        npm run build
      env:
        REACT_APP_API_URL: https://api.lms.yourdomain.com
        REACT_APP_ENV: production
    
    - name: Deploy to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.TEACHER_PORTAL_DEPLOYMENT_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "frontend/teacher-portal"
        output_location: "build"

  # Deploy Admin Portal
  deploy-admin:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd frontend/admin-portal
        npm ci
    
    - name: Build
      run: |
        cd frontend/admin-portal
        npm run build
      env:
        REACT_APP_API_URL: https://api.lms.yourdomain.com
        REACT_APP_ENV: production
    
    - name: Deploy to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.ADMIN_PORTAL_DEPLOYMENT_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "frontend/admin-portal"
        output_location: "build"
```

### 10.4.4. Commit and Push Workflows

```powershell
cd D:\XProject\X1.1MicroService

git add .github/workflows/backend-deploy.yml
git add .github/workflows/frontend-deploy.yml
git commit -m "Add CI/CD workflows"
git push origin main

# Monitor workflow execution
# Go to: https://github.com/YOUR-USERNAME/lms-microservices/actions
```

### 10.4.5. Test CI/CD Pipeline

```powershell
# Make a small change to trigger pipeline
cd D:\XProject\X1.1MicroService\backend\gateway_service

# Edit main.py - change version number
# From: "version": "1.0.0"
# To:   "version": "1.0.1"

git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin main

# Watch GitHub Actions run
# Go to: https://github.com/YOUR-USERNAME/lms-microservices/actions
```

## 10.5. Rollback Procedures

### 10.5.1. Create Rollback Script

Create file: `scripts/deploy/rollback.ps1`

```powershell
# Rollback script for Azure deployment
param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceName,
    
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [string]$ResourceGroup = "lms-production-rg",
    [string]$ACRName = "lmscontainerregistry"
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 Rolling back $ServiceName to version $Version..."

# Map service names to image names
$serviceMap = @{
    "api-gateway" = "lms-api-gateway"
    "user" = "lms-user-service"
    "content" = "lms-content-service"
    "assignment" = "lms-assignment-service"
}

$imageName = $serviceMap[$ServiceName]
$appName = "lms-$ServiceName-service"

if ($ServiceName -eq "api-gateway") {
    $appName = "lms-api-gateway"
}

Write-Host "Service: $appName"
Write-Host "Image: $imageName:$Version"

# Get ACR login server
$acrServer = az acr show --name $ACRName --query loginServer -o tsv

# Update App Service to use specific version
Write-Host "Updating App Service container image..."
az webapp config container set `
    --name $appName `
    --resource-group $ResourceGroup `
    --docker-custom-image-name "$acrServer/${imageName}:${Version}"

# Restart app service
Write-Host "Restarting App Service..."
az webapp restart --name $appName --resource-group $ResourceGroup

# Wait for service to be ready
Write-Host "Waiting for service to be ready..."
Start-Sleep -Seconds 30

# Health check
$healthUrl = "https://${appName}.azurewebsites.net/health"
Write-Host "Checking health: $healthUrl"

try {
    $response = Invoke-WebRequest -Uri $healthUrl -Method Get
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Rollback successful! Service is healthy."
        exit 0
    }
} catch {
    Write-Host "❌ Health check failed after rollback!"
    Write-Host "Error: $_"
    exit 1
}
```

### 10.5.2. Test Rollback

```powershell
# List available versions
az acr repository show-tags `
  --name lmscontainerregistry `
  --repository lms-api-gateway `
  --output table

# Rollback to previous version
.\scripts\deploy\rollback.ps1 -ServiceName "api-gateway" -Version "v1.0.0"
```

---

# STEP 11: Security Hardening

**Duration**: 2-3 days  
**Responsible**: Security Engineer + DevOps Engineer

## 11.1. Azure Policy Implementation

### 11.1.1. Assign Built-in Policies

```powershell
# Get subscription ID
$subscriptionId = az account show --query id -o tsv

# Require tags on resources
az policy assignment create `
  --name "require-tags" `
  --display-name "Require tags on resources" `
  --policy "/providers/Microsoft.Authorization/policyDefinitions/96670d01-0a4d-4649-9c89-2d3abc0a5025" `
  --scope "/subscriptions/$subscriptionId/resourceGroups/lms-production-rg" `
  --params '{
    "tagName": {"value": "Environment"}
  }'

# Require SSL for storage accounts
az policy assignment create `
  --name "require-storage-ssl" `
  --display-name "Secure transfer to storage accounts should be enabled" `
  --policy "/providers/Microsoft.Authorization/policyDefinitions/404c3081-a854-4457-ae30-26a93ef643f9" `
  --scope "/subscriptions/$subscriptionId/resourceGroups/lms-production-rg"

# Allowed locations (restrict to Southeast Asia)
az policy assignment create `
  --name "allowed-locations" `
  --display-name "Allowed locations" `
  --policy "/providers/Microsoft.Authorization/policyDefinitions/e56962a6-4747-49cd-b67b-bf8b01975c4c" `
  --scope "/subscriptions/$subscriptionId/resourceGroups/lms-production-rg" `
  --params '{
    "listOfAllowedLocations": {"value": ["southeastasia", "eastasia"]}
  }'

# Require SQL Server to use customer-managed key
az policy assignment create `
  --name "sql-cmk" `
  --display-name "SQL servers should use customer-managed keys to encrypt data at rest" `
  --policy "/providers/Microsoft.Authorization/policyDefinitions/0a370ff3-6cab-4e85-8995-295fd854c5b8" `
  --scope "/subscriptions/$subscriptionId/resourceGroups/lms-production-rg"
```

### 11.1.2. Create Custom Policy for Naming Convention

Create file: `azure-policies/naming-convention-policy.json`

```json
{
  "mode": "All",
  "policyRule": {
    "if": {
      "allOf": [
        {
          "field": "type",
          "equals": "Microsoft.Web/sites"
        },
        {
          "not": {
            "field": "name",
            "like": "lms-*"
          }
        }
      ]
    },
    "then": {
      "effect": "deny"
    }
  },
  "parameters": {}
}
```

Apply custom policy:

```powershell
# Create policy definition
az policy definition create `
  --name "lms-naming-convention" `
  --display-name "LMS Naming Convention" `
  --description "Enforce naming convention for LMS resources" `
  --rules azure-policies/naming-convention-policy.json `
  --mode All

# Assign policy
az policy assignment create `
  --name "lms-naming" `
  --display-name "LMS Naming Convention" `
  --policy "lms-naming-convention" `
  --scope "/subscriptions/$subscriptionId/resourceGroups/lms-production-rg"
```

## 11.2. Network Security Review

### 11.2.1. Review NSG Rules

```powershell
# List all NSG rules
$nsgs = @("frontend-nsg", "backend-nsg", "database-nsg")

foreach ($nsg in $nsgs) {
    Write-Host "=== $nsg Rules ==="
    az network nsg rule list `
      --resource-group lms-production-rg `
      --nsg-name $nsg `
      --output table
    Write-Host ""
}
```

### 11.2.2. Enable NSG Flow Logs

```powershell
# Create storage account for NSG flow logs (if not exists)
az storage account create `
  --name lmsnsgflowlogs `
  --resource-group lms-production-rg `
  --location southeastasia `
  --sku Standard_LRS

# Get storage account ID
$storageId = az storage account show `
  --name lmsnsgflowlogs `
  --resource-group lms-production-rg `
  --query id `
  --output tsv

# Enable flow logs for each NSG
foreach ($nsg in $nsgs) {
    $nsgId = az network nsg show `
      --name $nsg `
      --resource-group lms-production-rg `
      --query id `
      --output tsv
    
    az network watcher flow-log create `
      --name "${nsg}-flow-log" `
      --nsg $nsgId `
      --storage-account $storageId `
      --location southeastasia `
      --enabled true `
      --retention 30 `
      --format JSON `
      --log-version 2
}
```

### 11.2.3. Configure Private Endpoints for Database

```powershell
# Create private endpoint for PostgreSQL
az network private-endpoint create `
  --resource-group lms-production-rg `
  --name lms-postgres-private-endpoint `
  --location southeastasia `
  --vnet-name lms-vnet `
  --subnet database-subnet `
  --private-connection-resource-id "/subscriptions/$subscriptionId/resourceGroups/lms-production-rg/providers/Microsoft.DBforPostgreSQL/flexibleServers/lms-postgres-server" `
  --group-id postgresqlServer `
  --connection-name lms-postgres-connection

# Create private DNS zone
az network private-dns zone create `
  --resource-group lms-production-rg `
  --name "privatelink.postgres.database.azure.com"

# Link DNS zone to VNET
az network private-dns link vnet create `
  --resource-group lms-production-rg `
  --zone-name "privatelink.postgres.database.azure.com" `
  --name "lms-postgres-dns-link" `
  --virtual-network lms-vnet `
  --registration-enabled false

# Update PostgreSQL firewall to deny public access
az postgres flexible-server update `
  --resource-group lms-production-rg `
  --name lms-postgres-server `
  --public-access None
```

## 11.3. SSL/TLS Configuration

### 11.3.1. Force HTTPS on All App Services

```powershell
$appServices = @(
    "lms-api-gateway",
    "lms-user-service",
    "lms-content-service",
    "lms-assignment-service"
)

foreach ($app in $appServices) {
    Write-Host "Enabling HTTPS-only for $app..."
    
    # Force HTTPS
    az webapp update `
      --name $app `
      --resource-group lms-production-rg `
      --https-only true
    
    # Set minimum TLS version
    az webapp config set `
      --name $app `
      --resource-group lms-production-rg `
      --min-tls-version 1.2
    
    # Enable HTTP/2
    az webapp config set `
      --name $app `
      --resource-group lms-production-rg `
      --http20-enabled true
}
```

### 11.3.2. Configure SSL for Custom Domains

```powershell
# For App Service, use Free Managed Certificate
az webapp config ssl create `
  --resource-group lms-production-rg `
  --name lms-api-gateway `
  --hostname api.lms.yourdomain.com

# Bind certificate
az webapp config ssl bind `
  --resource-group lms-production-rg `
  --name lms-api-gateway `
  --certificate-thumbprint auto `
  --ssl-type SNI
```

### 11.3.3. Test SSL Configuration

```powershell
# Test SSL using OpenSSL (if installed)
# openssl s_client -connect api.lms.yourdomain.com:443 -tls1_2

# Or use online tools:
# https://www.ssllabs.com/ssltest/
# Target: A+ rating
```

## 11.4. Secrets Management Audit

### 11.4.1. Review Key Vault Access Policies

```powershell
# List all access policies
az keyvault show `
  --name lms-keyvault-prod `
  --resource-group lms-production-rg `
  --query properties.accessPolicies `
  --output table

# Review who has access
Write-Host "=== Key Vault Access Audit ==="
az keyvault show `
  --name lms-keyvault-prod `
  --query "properties.accessPolicies[].{ObjectId:objectId, Permissions:permissions}" `
  --output table
```

### 11.4.2. Rotate Secrets

```powershell
# Rotate database password
function New-StrongPassword {
    $length = 32
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    -join ((1..$length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

$newDbPassword = New-StrongPassword

# Update in Key Vault
az keyvault secret set `
  --vault-name lms-keyvault-prod `
  --name DatabasePassword `
  --value $newDbPassword

# Update PostgreSQL password
az postgres flexible-server update `
  --resource-group lms-production-rg `
  --name lms-postgres-server `
  --admin-password $newDbPassword

# Restart App Services to pick up new password
foreach ($app in $appServices) {
    az webapp restart --name $app --resource-group lms-production-rg
}

Write-Host "✅ Database password rotated successfully"
Write-Host "⚠️  New password: $newDbPassword"
Write-Host "⚠️  Store this securely!"
```

### 11.4.3. Enable Key Vault Audit Logging

```powershell
# Enable diagnostic settings for Key Vault
az monitor diagnostic-settings create `
  --resource "/subscriptions/$subscriptionId/resourceGroups/lms-production-rg/providers/Microsoft.KeyVault/vaults/lms-keyvault-prod" `
  --name "keyvault-audit-logs" `
  --workspace $workspaceResourceId `
  --logs '[
    {
      "category": "AuditEvent",
      "enabled": true
    }
  ]' `
  --metrics '[
    {
      "category": "AllMetrics",
      "enabled": true
    }
  ]'
```

## 11.5. Enable Azure Defender

### 11.5.1. Enable Defender for Cloud

```powershell
# Enable Defender for App Service
az security pricing create `
  --name AppServices `
  --tier Standard

# Enable Defender for SQL
az security pricing create `
  --name SqlServers `
  --tier Standard

# Enable Defender for Storage
az security pricing create `
  --name StorageAccounts `
  --tier Standard

# Enable Defender for Container Registries
az security pricing create `
  --name ContainerRegistry `
  --tier Standard

# Enable Defender for Key Vault
az security pricing create `
  --name KeyVaults `
  --tier Standard
```

### 11.5.2. Review Security Recommendations

```powershell
# Get security recommendations
az security assessment list --output table

# Get high severity recommendations
az security assessment list `
  --query "[?properties.status.severity=='High'].{Name:name, Description:properties.displayName, Status:properties.status.code}" `
  --output table
```

## 11.6. Enable MFA for Admin Accounts

### 11.6.1. Configure Conditional Access (Azure AD Premium required)

```
1. Go to: Azure Portal → Azure AD → Security → Conditional Access
2. Click: New policy
3. Policy name: "Require MFA for Admins"
4. Assignments:
   - Users: Select admin users/groups
   - Cloud apps: All cloud apps
   - Conditions: Any location
5. Access controls:
   - Grant: Require multi-factor authentication
6. Enable policy: On
7. Create
```

### 11.6.2. Enforce MFA for Service Principal (if applicable)

```powershell
# For human users, enable MFA in Azure AD
# For service principals, use certificate-based authentication

# Create certificate for service principal
$cert = New-SelfSignedCertificate `
  -Subject "CN=LMS-Service-Principal" `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -KeyExportPolicy Exportable `
  -KeySpec Signature `
  -KeyLength 2048 `
  -KeyAlgorithm RSA `
  -HashAlgorithm SHA256

# Export certificate
$password = ConvertTo-SecureString -String "YourCertPassword" -Force -AsPlainText
Export-PfxCertificate `
  -Cert $cert `
  -FilePath "lms-sp-cert.pfx" `
  -Password $password
```

## 11.7. Implement Resource Locks

### 11.7.1. Apply ReadOnly Lock to Production Resources

```powershell
# Lock resource group (prevents deletion)
az lock create `
  --name lms-production-lock `
  --resource-group lms-production-rg `
  --lock-type CanNotDelete `
  --notes "Prevent accidental deletion of production resources"

# Lock critical resources with ReadOnly (prevents deletion and modification)
# PostgreSQL
az lock create `
  --name postgres-lock `
  --resource-group lms-production-rg `
  --resource-type Microsoft.DBforPostgreSQL/flexibleServers `
  --resource lms-postgres-server `
  --lock-type CanNotDelete

# Storage Account
az lock create `
  --name storage-lock `
  --resource-group lms-production-rg `
  --resource-type Microsoft.Storage/storageAccounts `
  --resource lmsstorageaccount001 `
  --lock-type CanNotDelete

# Key Vault
az lock create `
  --name keyvault-lock `
  --resource-group lms-production-rg `
  --resource-type Microsoft.KeyVault/vaults `
  --resource lms-keyvault-prod `
  --lock-type CanNotDelete
```

### 11.7.2. Verify Locks

```powershell
# List all locks
az lock list --resource-group lms-production-rg --output table
```

## 11.8. Security Audit Checklist

### 11.8.1. Run Security Audit

Create file: `scripts/security/security-audit.ps1`

```powershell
# Security Audit Script
$ErrorActionPreference = "Continue"

Write-Host "=== LMS Security Audit ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Cyan
Write-Host ""

$issues = @()

# Check 1: HTTPS enforcement
Write-Host "1. Checking HTTPS enforcement..." -ForegroundColor Yellow
$appServices = @("lms-api-gateway", "lms-user-service", "lms-content-service", "lms-assignment-service")
foreach ($app in $appServices) {
    $httpsOnly = az webapp show --name $app --resource-group lms-production-rg --query httpsOnly -o tsv
    if ($httpsOnly -eq "false") {
        $issues += "❌ $app: HTTPS not enforced"
    } else {
        Write-Host "  ✅ $app: HTTPS enforced" -ForegroundColor Green
    }
}

# Check 2: TLS version
Write-Host "2. Checking TLS version..." -ForegroundColor Yellow
foreach ($app in $appServices) {
    $minTls = az webapp config show --name $app --resource-group lms-production-rg --query minTlsVersion -o tsv
    if ($minTls -lt "1.2") {
        $issues += "❌ $app: TLS version is $minTls (should be 1.2+)"
    } else {
        Write-Host "  ✅ $app: TLS $minTls" -ForegroundColor Green
    }
}

# Check 3: Storage account secure transfer
Write-Host "3. Checking storage secure transfer..." -ForegroundColor Yellow
$secureTransfer = az storage account show --name lmsstorageaccount001 --query enableHttpsTrafficOnly -o tsv
if ($secureTransfer -eq "false") {
    $issues += "❌ Storage: Secure transfer not enforced"
} else {
    Write-Host "  ✅ Storage: Secure transfer enforced" -ForegroundColor Green
}

# Check 4: Database public access
Write-Host "4. Checking database public access..." -ForegroundColor Yellow
$publicAccess = az postgres flexible-server show --name lms-postgres-server --resource-group lms-production-rg --query network.publicNetworkAccess -o tsv
if ($publicAccess -ne "Disabled") {
    $issues += "⚠️  Database: Public access enabled (consider using private endpoint)"
} else {
    Write-Host "  ✅ Database: Public access disabled" -ForegroundColor Green
}

# Check 5: NSG rules
Write-Host "5. Checking NSG rules..." -ForegroundColor Yellow
$nsgs = @("frontend-nsg", "backend-nsg", "database-nsg")
foreach ($nsg in $nsgs) {
    $rules = az network nsg rule list --nsg-name $nsg --resource-group lms-production-rg --query "[?sourceAddressPrefix=='*' && access=='Allow']" -o json | ConvertFrom-Json
    if ($rules.Count -gt 0) {
        $issues += "⚠️  $nsg: Has rules allowing traffic from any source"
    } else {
        Write-Host "  ✅ $nsg: No overly permissive rules" -ForegroundColor Green
    }
}

# Check 6: Resource locks
Write-Host "6. Checking resource locks..." -ForegroundColor Yellow
$locks = az lock list --resource-group lms-production-rg -o json | ConvertFrom-Json
if ($locks.Count -eq 0) {
    $issues += "⚠️  No resource locks found"
} else {
    Write-Host "  ✅ Found $($locks.Count) resource locks" -ForegroundColor Green
}

# Check 7: Key Vault soft delete
Write-Host "7. Checking Key Vault soft delete..." -ForegroundColor Yellow
$softDelete = az keyvault show --name lms-keyvault-prod --query properties.enableSoftDelete -o tsv
if ($softDelete -eq "false") {
    $issues += "❌ Key Vault: Soft delete not enabled"
} else {
    Write-Host "  ✅ Key Vault: Soft delete enabled" -ForegroundColor Green
}

# Check 8: Defender for Cloud
Write-Host "8. Checking Defender for Cloud..." -ForegroundColor Yellow
$defenderStatus = az security pricing list -o json | ConvertFrom-Json
$enabledDefenders = $defenderStatus | Where-Object { $_.pricingTier -eq "Standard" }
Write-Host "  ✅ Defender enabled for: $($enabledDefenders.name -join ', ')" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "=== Audit Summary ===" -ForegroundColor Cyan
if ($issues.Count -eq 0) {
    Write-Host "✅ No security issues found!" -ForegroundColor Green
} else {
    Write-Host "Found $($issues.Count) security issues:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  $issue" -ForegroundColor Red
    }
}
Write-Host ""
```

Run audit:

```powershell
.\scripts\security\security-audit.ps1
```

---

**Continue to Steps 12-13...**

Bạn muốn tôi tiếp tục với:
- STEP 12: Testing & Validation
- STEP 13: Go-Live Procedures

Trong cùng file này hay tạo Part 4 riêng? 🚀
