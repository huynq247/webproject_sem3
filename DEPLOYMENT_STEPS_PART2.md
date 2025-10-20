# 🚀 LMS Microservices - Detailed Deployment Steps (Part 2)

**Continuation from Part 1**  
**Steps 7-13**: VPN, NAS, Monitoring, CI/CD, Security, Testing, Go-Live

---

# STEP 7: VPN & On-Premise Connection

**Duration**: 1-2 days  
**Responsible**: DevOps Engineer + Network Administrator

## 7.1. Create VPN Gateway in Azure

### 7.1.1. Create Public IP for VPN Gateway

```powershell
# Create public IP address for VPN Gateway
az network public-ip create `
  --resource-group lms-production-rg `
  --name lms-vpn-gateway-ip `
  --location southeastasia `
  --allocation-method Dynamic `
  --sku Basic `
  --tags Environment=Production Project=LMS

# Verify
az network public-ip show `
  --resource-group lms-production-rg `
  --name lms-vpn-gateway-ip
```

### 7.1.2. Create VPN Gateway

```powershell
# Create VPN Gateway (this takes 30-45 minutes!)
az network vnet-gateway create `
  --resource-group lms-production-rg `
  --name lms-vpn-gateway `
  --location southeastasia `
  --vnet lms-vnet `
  --gateway-type Vpn `
  --vpn-type RouteBased `
  --sku Basic `
  --public-ip-address lms-vpn-gateway-ip `
  --no-wait

# Check creation status
az network vnet-gateway show `
  --resource-group lms-production-rg `
  --name lms-vpn-gateway `
  --query provisioningState
```

**⏰ This takes 30-45 minutes. Go grab coffee! ☕**

### 7.1.3. Get VPN Gateway Public IP

```powershell
# Wait for gateway to be ready
az network vnet-gateway wait `
  --resource-group lms-production-rg `
  --name lms-vpn-gateway `
  --created

# Get the public IP
$vpnGatewayIP = az network public-ip show `
  --resource-group lms-production-rg `
  --name lms-vpn-gateway-ip `
  --query ipAddress `
  --output tsv

Write-Host "VPN Gateway Public IP: $vpnGatewayIP"
```

**📝 Save this IP**: Azure VPN Gateway IP = `_______________`

## 7.2. Prepare On-Premise Network

### 7.2.1. Get Your Public IP Address

```powershell
# Get your current public IP
$myPublicIP = (Invoke-WebRequest -Uri "https://api.ipify.org").Content
Write-Host "Your Public IP: $myPublicIP"
```

**📝 Save this IP**: On-Premise Public IP = `_______________`

### 7.2.2. Note Your Local Network

```
Your on-premise network details:

Router IP: 192.168.1.1
Local Network: 192.168.1.0/24
NAS IP (will be): 192.168.1.100
VPN Router Model: ____________________
```

### 7.2.3. Check Router VPN Capability

```
1. Login to your router admin panel: http://192.168.1.1
2. Look for VPN features:
   - IPSec VPN Support? Yes / No
   - IKEv2 Support? Yes / No
   - Site-to-Site VPN? Yes / No

If NO: You may need to:
- Upgrade router firmware
- Purchase VPN-capable router (e.g., Ubiquiti EdgeRouter, pfSense box)
- Use software VPN client on a PC/server
```

## 7.3. Create Local Network Gateway in Azure

### 7.3.1. Create Local Gateway

```powershell
# Create Local Network Gateway (represents your on-premise network)
az network local-gateway create `
  --resource-group lms-production-rg `
  --name lms-onpremise-gateway `
  --gateway-ip-address $myPublicIP `
  --local-address-prefixes 192.168.1.0/24 `
  --tags Environment=Production Project=LMS

# Verify
az network local-gateway show `
  --resource-group lms-production-rg `
  --name lms-onpremise-gateway
```

## 7.4. Create VPN Connection

### 7.4.1. Generate Pre-Shared Key

```powershell
# Generate a strong pre-shared key
function New-PreSharedKey {
    $length = 64
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()"
    $key = -join ((1..$length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $key
}

$preSharedKey = New-PreSharedKey
Write-Host "Pre-Shared Key: $preSharedKey"

# Store in Key Vault
az keyvault secret set `
  --vault-name lms-keyvault-prod `
  --name VPNPreSharedKey `
  --value $preSharedKey
```

**⚠️ CRITICAL: Save this key securely!**
```
Pre-Shared Key: _______________________________________________
```

### 7.4.2. Create VPN Connection

```powershell
# Create Site-to-Site VPN connection
az network vpn-connection create `
  --resource-group lms-production-rg `
  --name azure-to-onpremise `
  --vnet-gateway1 lms-vpn-gateway `
  --local-gateway2 lms-onpremise-gateway `
  --shared-key $preSharedKey `
  --location southeastasia `
  --tags Environment=Production Project=LMS

# Verify
az network vpn-connection show `
  --resource-group lms-production-rg `
  --name azure-to-onpremise
```

## 7.5. Configure On-Premise Router

### 7.5.1. Router Configuration Template

```
=== IPSec VPN Configuration ===

Connection Type: Site-to-Site VPN
Protocol: IKEv2 (or IKEv1 if IKEv2 not supported)
Mode: Tunnel Mode

Remote Gateway:
- IP Address: [Azure VPN Gateway IP from 7.1.3]
- Type: Static IP

Local Gateway:
- IP Address: [Your Public IP from 7.2.1]
- Type: Dynamic or Static

Pre-Shared Key:
- Key: [Key from 7.4.1]

Phase 1 (IKE):
- Encryption: AES-256
- Integrity: SHA-256
- DH Group: 2
- Lifetime: 28800 seconds (8 hours)

Phase 2 (IPSec):
- Encryption: AES-256
- Integrity: SHA-256
- PFS Group: None
- Lifetime: 27000 seconds

Local Network:
- 192.168.1.0/24

Remote Network:
- 10.0.0.0/16 (Azure VNET)

Specific Subnets to Route:
- 10.0.2.0/24 (Backend subnet - for App Services)
- 10.0.3.0/24 (Database subnet)
```

### 7.5.2. Router-Specific Guides

**For Ubiquiti EdgeRouter**:

```bash
# SSH to router
ssh admin@192.168.1.1

# Configure VPN
configure

set vpn ipsec ike-group AZURE-IKE proposal 1 encryption aes256
set vpn ipsec ike-group AZURE-IKE proposal 1 hash sha256
set vpn ipsec ike-group AZURE-IKE proposal 1 dh-group 2
set vpn ipsec ike-group AZURE-IKE lifetime 28800

set vpn ipsec esp-group AZURE-ESP proposal 1 encryption aes256
set vpn ipsec esp-group AZURE-ESP proposal 1 hash sha256
set vpn ipsec esp-group AZURE-ESP lifetime 27000

set vpn ipsec site-to-site peer [AZURE-VPN-GATEWAY-IP] authentication mode pre-shared-secret
set vpn ipsec site-to-site peer [AZURE-VPN-GATEWAY-IP] authentication pre-shared-secret [YOUR-PSK]
set vpn ipsec site-to-site peer [AZURE-VPN-GATEWAY-IP] ike-group AZURE-IKE
set vpn ipsec site-to-site peer [AZURE-VPN-GATEWAY-IP] local-address [YOUR-LOCAL-IP]
set vpn ipsec site-to-site peer [AZURE-VPN-GATEWAY-IP] tunnel 1 local prefix 192.168.1.0/24
set vpn ipsec site-to-site peer [AZURE-VPN-GATEWAY-IP] tunnel 1 remote prefix 10.0.0.0/16
set vpn ipsec site-to-site peer [AZURE-VPN-GATEWAY-IP] tunnel 1 esp-group AZURE-ESP

commit
save
exit
```

**For pfSense**:

```
1. Go to: VPN → IPsec → Tunnels
2. Click: Add P1
3. Configure Phase 1:
   - Key Exchange Version: IKEv2
   - Remote Gateway: [Azure VPN Gateway IP]
   - Authentication Method: Mutual PSK
   - Pre-Shared Key: [Your PSK]
   - Encryption: AES 256
   - Hash: SHA256
   - DH Group: 2
   - Lifetime: 28800

4. Click: Add P2
5. Configure Phase 2:
   - Local Network: LAN subnet (192.168.1.0/24)
   - Remote Network: 10.0.0.0/16
   - Protocol: ESP
   - Encryption: AES 256
   - Hash: SHA256
   - PFS Group: off
   - Lifetime: 27000

6. Click: Apply Changes
7. Go to: Status → IPsec → Connect
```

## 7.6. Test VPN Connection

### 7.6.1. Check Connection Status in Azure

```powershell
# Check VPN connection status
az network vpn-connection show `
  --resource-group lms-production-rg `
  --name azure-to-onpremise `
  --query connectionStatus

# Expected: "Connected"

# Get detailed status
az network vpn-connection show `
  --resource-group lms-production-rg `
  --name azure-to-onpremise `
  --output table
```

### 7.6.2. Test Connectivity from Azure to On-Premise

```powershell
# Create a test VM in Azure (for testing only)
az vm create `
  --resource-group lms-production-rg `
  --name test-vm `
  --location southeastasia `
  --vnet-name lms-vnet `
  --subnet backend-subnet `
  --image UbuntuLTS `
  --admin-username azureuser `
  --generate-ssh-keys `
  --size Standard_B1s

# SSH to VM and ping on-premise network
# ssh azureuser@[VM-IP]
# ping 192.168.1.1
```

### 7.6.3. Test from On-Premise to Azure

```powershell
# From your local machine, ping Azure resources
ping 10.0.2.4

# Or use Test-NetConnection
Test-NetConnection -ComputerName 10.0.2.4 -Port 5432
```

### 7.6.4. Troubleshooting VPN Issues

```powershell
# View VPN logs
az network vnet-gateway list-learned-routes `
  --resource-group lms-production-rg `
  --name lms-vpn-gateway

# Check BGP status (if using BGP)
az network vnet-gateway list-bgp-peer-status `
  --resource-group lms-production-rg `
  --name lms-vpn-gateway

# Reset VPN connection
az network vpn-connection reset `
  --resource-group lms-production-rg `
  --name azure-to-onpremise
```

**Common Issues**:

| Issue | Solution |
|-------|----------|
| Connection stuck at "Connecting" | Check pre-shared key matches on both sides |
| "Not Connected" status | Verify firewall allows UDP 500 and 4500 |
| Can't ping Azure resources | Check NSG rules allow traffic from on-premise |
| Intermittent disconnections | Increase Phase 1/2 lifetimes |
| Router doesn't support IKEv2 | Use IKEv1 or upgrade router |

---

# STEP 8: NAS Backup System Setup

**Duration**: 1-2 days  
**Responsible**: DevOps Engineer + System Administrator

## 8.1. Physical NAS Setup

### 8.1.1. Unbox and Install Hardware

```
1. Unbox Synology DS423+ (or your NAS model)
2. Install 4x 8TB WD Red Plus hard drives
3. Connect to UPS (APC Back-UPS 1500VA)
4. Connect to network via Ethernet cable
5. Power on NAS and UPS
6. Wait 2-3 minutes for boot
```

### 8.1.2. Find NAS IP Address

**Method 1: Synology Assistant (Windows)**

```
1. Download: https://www.synology.com/support/download/DS423+
2. Install and run "Synology Assistant"
3. It will scan network and find your NAS
4. Note the IP address shown
```

**Method 2: Router Admin Panel**

```
1. Login to router: http://192.168.1.1
2. Go to DHCP Client List / Connected Devices
3. Look for device named "DiskStation" or MAC starting with 00:11:32
4. Note the IP address
```

**Method 3: Network Scan**

```powershell
# Scan local network (requires nmap)
nmap -sn 192.168.1.0/24

# Or use PowerShell
1..254 | ForEach-Object { 
    Test-Connection -ComputerName "192.168.1.$_" -Count 1 -Quiet 
} | Where-Object { $_ }
```

**📝 Your NAS IP (DHCP)**: `192.168.1.___`

### 8.1.3. Initial DSM Installation

```
1. Open browser: http://192.168.1.[NAS-IP]:5000
2. Click: "Set up"
3. DSM will be downloaded and installed (10-15 minutes)
4. After reboot, access again: http://192.168.1.[NAS-IP]:5000
```

## 8.2. NAS Initial Configuration

### 8.2.1. Create Admin Account

```
1. Admin Username: nasadmin
2. Password: [Generate strong password 20+ chars]
3. Email: your-email@example.com
4. Enable 2-factor authentication: YES
```

**📝 Save credentials**:
```
NAS Admin Username: nasadmin
NAS Admin Password: _______________________________
```

### 8.2.2. Set Static IP Address

```
1. Go to: Control Panel → Network → Network Interface
2. Select: LAN
3. Click: Edit
4. IPv4:
   - Configuration: Manual
   - IP Address: 192.168.1.100
   - Subnet Mask: 255.255.255.0
   - Gateway: 192.168.1.1
   - DNS Server: 8.8.8.8, 8.8.4.4
5. Click: OK
6. Access NAS via new IP: http://192.168.1.100:5000
```

**📝 Your NAS Static IP**: `192.168.1.100`

### 8.2.3. Update DSM

```
1. Go to: Control Panel → Update & Restore
2. Click: Check for Updates
3. If update available, click: Download → Install
4. Wait for update (5-10 minutes)
5. NAS will reboot
```

## 8.3. Storage Pool and Volume Setup

### 8.3.1. Create Storage Pool

```
1. Go to: Storage Manager → Storage Pool
2. Click: Create
3. Choose: RAID Type

RAID Options:
┌─────────────────────────────────────────────────────────┐
│ RAID Type    │ Drives │ Usable │ Fault Tolerance        │
├─────────────────────────────────────────────────────────┤
│ RAID 0       │ 4x 8TB │ 32TB   │ None (NOT recommended) │
│ RAID 1       │ 4x 8TB │ 8TB    │ 3 drives can fail      │
│ RAID 5 ⭐    │ 4x 8TB │ 24TB   │ 1 drive can fail       │
│ RAID 6       │ 4x 8TB │ 16TB   │ 2 drives can fail      │
│ RAID 10      │ 4x 8TB │ 16TB   │ 1 in each pair         │
│ SHR-1 ⭐     │ 4x 8TB │ ~24TB  │ 1 drive can fail       │
│ SHR-2        │ 4x 8TB │ ~16TB  │ 2 drives can fail      │
└─────────────────────────────────────────────────────────┘

Recommendation: RAID 5 or SHR-1

4. Select: RAID 5 (or SHR-1 for flexibility)
5. Check all 4 drives
6. Click: Next
7. Enable Data Scrubbing: YES (monthly)
8. Click: Apply

⏰ This process takes 6-24 hours depending on drive size!
You can use the NAS during this time, but performance may be slower.
```

### 8.3.2. Create Volume

```
1. Storage Manager → Volume
2. Click: Create
3. Type: Choose volume on existing storage pool
4. Select your storage pool
5. File System: Btrfs (recommended for snapshots)
6. Size: Maximum
7. Enable Data Checksum: YES
8. Enable Compression: YES (saves space)
9. Click: Apply

This takes 10-30 minutes.
```

### 8.3.3. Verify Storage

```
1. Go to: Storage Manager → Storage Pool
2. Check status: "Normal" or "Building" (if RAID is still building)
3. Note available space: ~24TB (for 4x 8TB RAID 5)
```

## 8.4. Network and Services Configuration

### 8.4.1. Enable SSH

```
1. Go to: Control Panel → Terminal & SNMP
2. Enable SSH service
3. Port: 22 (or custom port for security)
4. Click: Apply
```

### 8.4.2. Enable NFS (for Linux/Unix clients)

```
1. Go to: Control Panel → File Services → NFS
2. Enable NFS service
3. NFSv4 support: Enable
4. Click: Apply
```

### 8.4.3. Enable SMB/CIFS (for Windows clients - optional)

```
1. Go to: Control Panel → File Services → SMB
2. Enable SMB service
3. Maximum protocol: SMB3
4. Minimum protocol: SMB2
5. Click: Apply
```

### 8.4.4. Enable Rsync (for backup scripts)

```
1. Go to: Control Panel → File Services → rsync
2. Enable rsync service
3. Port: 873 (default)
4. Click: Apply
```

## 8.5. Create Shared Folders for Backups

### 8.5.1. Create Folders

```
1. Go to: Control Panel → Shared Folder
2. Click: Create

Folder 1: azure-backups
- Name: azure-backups
- Description: Azure cloud backups
- Enable Recycle Bin: YES
- Enable data checksum: YES

Folder 2: database-backups
- Name: database-backups
- Description: PostgreSQL database dumps

Folder 3: file-backups
- Name: file-backups
- Description: Azure Blob Storage files

Folder 4: logs
- Name: logs
- Description: Application and backup logs

3. Click: OK for each
```

### 8.5.2. Set Permissions

```
1. For each shared folder, click: Edit
2. Permissions tab
3. Grant access:
   - nasadmin: Read/Write
   - (Create backup user later)
4. Click: OK
```

### 8.5.3. Create Backup User (for automated scripts)

```
1. Go to: Control Panel → User & Group → User
2. Click: Create
3. Username: backup-user
4. Password: [Generate strong password]
5. Disable: User must change password at next login
6. Permissions:
   - azure-backups: Read/Write
   - database-backups: Read/Write
   - file-backups: Read/Write
   - logs: Read/Write
7. Click: OK
```

**📝 Save credentials**:
```
Backup User: backup-user
Backup Password: _______________________________
```

## 8.6. Install Packages

### 8.6.1. Open Package Center

```
1. Go to: Package Center
2. Search and install these packages:
```

**Essential Packages**:

| Package | Purpose |
|---------|---------|
| **Hyper Backup** | Backup management |
| **Snapshot Replication** | BTRFS snapshots |
| **Cloud Sync** | Sync with cloud services |
| **Docker** (optional) | Run backup containers |
| **Text Editor** | Edit scripts on NAS |
| **VPN Server** (optional) | Alternative VPN solution |

### 8.6.2. Install Hyper Backup

```
1. Package Center → Search: "Hyper Backup"
2. Click: Install
3. After install, open Hyper Backup
4. We'll configure this later for local snapshots
```

## 8.7. Setup Automated Snapshots

### 8.7.1. Configure Snapshot Replication

```
1. Open: Snapshot Replication
2. Go to: Snapshots tab
3. Click: Settings
4. Enable snapshot schedule:

   Shared Folder: azure-backups
   - Frequency: Every 6 hours
   - Retention: Keep 48 (2 days of hourly)
   
   Shared Folder: database-backups
   - Frequency: Daily at 3 AM
   - Retention: Keep 30 (30 days)
   
   Shared Folder: file-backups
   - Frequency: Weekly on Sunday
   - Retention: Keep 12 (12 weeks)

5. Click: OK
```

### 8.7.2. Test Snapshot

```
1. Go to: Snapshot Replication → Snapshots
2. Select folder: azure-backups
3. Click: Take Snapshot → Take snapshot now
4. Wait for completion
5. Verify snapshot appears in list
```

## 8.8. Install Required Tools for Backup Scripts

### 8.8.1. SSH to NAS

```powershell
# From your Windows machine
ssh nasadmin@192.168.1.100
```

### 8.8.2. Install Required Tools

```bash
# Update package manager
sudo -i

# Install PostgreSQL client tools
opkg update
opkg install postgresql-client

# Install Azure CLI (if not available via opkg)
# We'll use AzCopy instead for file sync

# Install AzCopy
cd /volume1/scripts
wget https://aka.ms/downloadazcopy-v10-linux
tar -xvf downloadazcopy-v10-linux
cp azcopy_linux_amd64_*/azcopy /usr/local/bin/
chmod +x /usr/local/bin/azcopy

# Verify installations
psql --version
azcopy --version

# Install Python3 (if needed)
opkg install python3
opkg install python3-pip

# Install Azure Python SDK (for alternative backup methods)
pip3 install azure-storage-blob azure-identity
```

## 8.9. Create Backup Scripts

### 8.9.1. Database Backup Script

Create file: `/volume1/scripts/backup-database.sh`

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/volume1/database-backups"
DB_HOST="lms-postgres-server.postgres.database.azure.com"
DB_USER="lmsadmin"
DB_NAME="lms_production"
DB_PORT="5432"
RETENTION_DAYS=30
LOG_FILE="/volume1/logs/backup-database.log"

# Get password from Azure Key Vault or environment
# For security, store password in a secure location
# Option 1: Read from file
DB_PASSWORD=$(cat /volume1/scripts/.db_password)

# Option 2: Use Azure Key Vault (requires Azure CLI)
# DB_PASSWORD=$(az keyvault secret show --vault-name lms-keyvault-prod --name DatabasePassword --query value -o tsv)

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y-%m-%d)
BACKUP_FILE="$BACKUP_DIR/lms_production_$TIMESTAMP.dump"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Database Backup Started ==="
log "Backup file: $BACKUP_FILE"

# Perform backup
export PGPASSWORD="$DB_PASSWORD"
pg_dump -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -p "$DB_PORT" \
        -F c \
        -f "$BACKUP_FILE" \
        2>> "$LOG_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    log "Database backup completed successfully"
    
    # Compress backup
    log "Compressing backup..."
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Backup size: $FILE_SIZE"
    
    # Delete old backups
    log "Cleaning old backups (older than $RETENTION_DAYS days)..."
    find "$BACKUP_DIR" -name "lms_production_*.dump.gz" -mtime +$RETENTION_DAYS -delete
    
    # Count remaining backups
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/lms_production_*.dump.gz | wc -l)
    log "Total backups: $BACKUP_COUNT"
    
    log "=== Database Backup Completed Successfully ==="
    exit 0
else
    log "ERROR: Database backup failed!"
    log "=== Database Backup Failed ==="
    
    # Send alert (optional - configure email or webhook)
    # curl -X POST "https://hooks.slack.com/services/YOUR/WEBHOOK/URL" \
    #      -d "{\"text\":\"Database backup failed on NAS\"}"
    
    exit 1
fi
```

### 8.9.2. File Backup Script

Create file: `/volume1/scripts/backup-files.sh`

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/volume1/file-backups"
STORAGE_ACCOUNT="lmsstorageaccount001"
LOG_FILE="/volume1/logs/backup-files.log"
RETENTION_DAYS=90

# Azure Storage Connection String
# Store this securely! Don't hardcode in script for production
# Option 1: Read from file
AZURE_STORAGE_CONNECTION_STRING=$(cat /volume1/scripts/.azure_storage_connection)

# Option 2: Use environment variable
# export AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;..."

mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== File Backup Started ==="

# Sync media container
log "Syncing media container..."
azcopy sync \
    "https://${STORAGE_ACCOUNT}.blob.core.windows.net/media" \
    "$BACKUP_DIR/media/" \
    --recursive \
    --delete-destination=false \
    2>> "$LOG_FILE"

# Sync documents container
log "Syncing documents container..."
azcopy sync \
    "https://${STORAGE_ACCOUNT}.blob.core.windows.net/documents" \
    "$BACKUP_DIR/documents/" \
    --recursive \
    --delete-destination=false \
    2>> "$LOG_FILE"

# Calculate total size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Total backup size: $TOTAL_SIZE"

# Create snapshot of backup folder
log "Creating snapshot..."
# Synology snapshot command (adjust for your NAS)
synoschedtask --create snapshot \
    --folder "$BACKUP_DIR" \
    --name "file-backup-$TIMESTAMP" \
    2>> "$LOG_FILE"

log "=== File Backup Completed ==="
exit 0
```

### 8.9.3. Make Scripts Executable

```bash
# Make scripts executable
chmod +x /volume1/scripts/backup-database.sh
chmod +x /volume1/scripts/backup-files.sh

# Create password files (secure method)
# Database password
echo "YOUR_DATABASE_PASSWORD" > /volume1/scripts/.db_password
chmod 600 /volume1/scripts/.db_password

# Azure Storage connection string
echo "YOUR_CONNECTION_STRING" > /volume1/scripts/.azure_storage_connection
chmod 600 /volume1/scripts/.azure_storage_connection

# Test database backup
/volume1/scripts/backup-database.sh

# Test file backup
/volume1/scripts/backup-files.sh
```

## 8.10. Schedule Automated Backups

### 8.10.1. Using Synology Task Scheduler

```
1. Go to: Control Panel → Task Scheduler
2. Click: Create → Scheduled Task → User-defined script

Task 1: Database Backup (Daily)
- Task: Database Backup
- User: root
- Schedule: Daily at 2:00 AM
- Task Settings:
  - Run command: /volume1/scripts/backup-database.sh
  - Send run details by email: YES (configure email)

Task 2: File Backup (Weekly)
- Task: File Backup
- User: root
- Schedule: Weekly on Sunday at 3:00 AM
- Task Settings:
  - Run command: /volume1/scripts/backup-files.sh
  - Send run details by email: YES

3. Click: OK
4. Test: Select task → Run (to test immediately)
```

### 8.10.2. Using Crontab (Alternative)

```bash
# SSH to NAS
ssh nasadmin@192.168.1.100
sudo -i

# Edit crontab
crontab -e

# Add these lines:
# Database backup: Daily at 2 AM
0 2 * * * /volume1/scripts/backup-database.sh >> /volume1/logs/cron-db-backup.log 2>&1

# File backup: Weekly on Sunday at 3 AM
0 3 * * 0 /volume1/scripts/backup-files.sh >> /volume1/logs/cron-file-backup.log 2>&1

# Save and exit
# Verify crontab
crontab -l
```

## 8.11. Test Backup and Restore

### 8.11.1. Test Database Backup

```bash
# Run backup manually
/volume1/scripts/backup-database.sh

# Check log
cat /volume1/logs/backup-database.log

# Verify backup file exists
ls -lh /volume1/database-backups/

# Test restore
gunzip -c /volume1/database-backups/lms_production_[TIMESTAMP].dump.gz > /tmp/test_restore.dump

# Restore to test database (don't overwrite production!)
# pg_restore -h localhost -U postgres -d test_db /tmp/test_restore.dump
```

### 8.11.2. Test File Backup

```bash
# Run backup manually
/volume1/scripts/backup-files.sh

# Check log
cat /volume1/logs/backup-files.log

# Verify files synced
ls -lh /volume1/file-backups/media/
ls -lh /volume1/file-backups/documents/

# Check total size
du -sh /volume1/file-backups/
```

## 8.12. Monitor Backup Status

### 8.12.1. Create Monitoring Script

Create file: `/volume1/scripts/check-backup-status.sh`

```bash
#!/bin/bash

# Check last database backup
DB_BACKUP_DIR="/volume1/database-backups"
LAST_DB_BACKUP=$(ls -t "$DB_BACKUP_DIR"/lms_production_*.dump.gz | head -1)
DB_BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LAST_DB_BACKUP")) / 3600 ))

echo "=== Backup Status Report ==="
echo "Date: $(date)"
echo ""
echo "Database Backup:"
echo "  Last backup: $(basename "$LAST_DB_BACKUP")"
echo "  Age: $DB_BACKUP_AGE hours"
echo "  Size: $(du -h "$LAST_DB_BACKUP" | cut -f1)"

if [ $DB_BACKUP_AGE -gt 30 ]; then
    echo "  Status: ⚠️  WARNING - Backup is older than 30 hours!"
else
    echo "  Status: ✅ OK"
fi

echo ""
echo "File Backup:"
FILE_BACKUP_DIR="/volume1/file-backups"
FILE_BACKUP_SIZE=$(du -sh "$FILE_BACKUP_DIR" | cut -f1)
echo "  Total size: $FILE_BACKUP_SIZE"

echo ""
echo "Storage Space:"
df -h /volume1 | tail -1
```

Make executable:

```bash
chmod +x /volume1/scripts/check-backup-status.sh

# Run it
/volume1/scripts/check-backup-status.sh
```

---

# STEP 9: Monitoring & Alerting

**Duration**: 2-3 days  
**Responsible**: DevOps Engineer

## 9.1. Azure Monitor Setup

### 9.1.1. Create Log Analytics Workspace

```powershell
# Create Log Analytics Workspace
az monitor log-analytics workspace create `
  --resource-group lms-production-rg `
  --workspace-name lms-log-analytics `
  --location southeastasia `
  --retention-time 90 `
  --tags Environment=Production Project=LMS

# Get workspace ID
$workspaceId = az monitor log-analytics workspace show `
  --resource-group lms-production-rg `
  --workspace-name lms-log-analytics `
  --query customerId `
  --output tsv

Write-Host "Workspace ID: $workspaceId"
```

### 9.1.2. Connect Resources to Log Analytics

```powershell
# Get workspace resource ID
$workspaceResourceId = az monitor log-analytics workspace show `
  --resource-group lms-production-rg `
  --workspace-name lms-log-analytics `
  --query id `
  --output tsv

# Connect App Services
$appServices = @(
    "lms-api-gateway",
    "lms-user-service",
    "lms-content-service",
    "lms-assignment-service"
)

foreach ($appService in $appServices) {
    Write-Host "Connecting $appService to Log Analytics..."
    
    az monitor diagnostic-settings create `
        --resource "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/lms-production-rg/providers/Microsoft.Web/sites/$appService" `
        --name "send-to-log-analytics" `
        --workspace $workspaceResourceId `
        --logs '[{"category":"AppServiceHTTPLogs","enabled":true},{"category":"AppServiceConsoleLogs","enabled":true},{"category":"AppServiceAppLogs","enabled":true}]' `
        --metrics '[{"category":"AllMetrics","enabled":true}]'
}

# Connect PostgreSQL
az monitor diagnostic-settings create `
    --resource "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/lms-production-rg/providers/Microsoft.DBforPostgreSQL/flexibleServers/lms-postgres-server" `
    --name "send-to-log-analytics" `
    --workspace $workspaceResourceId `
    --logs '[{"category":"PostgreSQLLogs","enabled":true}]' `
    --metrics '[{"category":"AllMetrics","enabled":true}]'

# Connect Storage Account
az monitor diagnostic-settings create `
    --resource "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/lms-production-rg/providers/Microsoft.Storage/storageAccounts/lmsstorageaccount001" `
    --name "send-to-log-analytics" `
    --workspace $workspaceResourceId `
    --metrics '[{"category":"Transaction","enabled":true}]'
```

## 9.2. Application Insights Configuration

### 9.2.1. Verify Application Insights

```powershell
# Application Insights should already be created in Step 5
# Verify it exists
az monitor app-insights component show `
  --app lms-application-insights `
  --resource-group lms-production-rg

# Get instrumentation key
$instrumentationKey = az monitor app-insights component show `
  --app lms-application-insights `
  --resource-group lms-production-rg `
  --query instrumentationKey `
  --output tsv

Write-Host "Instrumentation Key: $instrumentationKey"
```

### 9.2.2. Add Application Insights to Backend Code

Update your FastAPI applications to include Application Insights:

```python
# Add to requirements.txt
# opencensus-ext-azure==1.1.9
# opencensus-ext-flask==0.7.6
# opencensus-ext-logging==0.1.1

# Add to main.py
from opencensus.ext.azure.log_exporter import AzureLogHandler
from opencensus.ext.azure import metrics_exporter
import logging
import os

# Configure Application Insights
APPINSIGHTS_KEY = os.getenv("APPINSIGHTS_INSTRUMENTATIONKEY")

if APPINSIGHTS_KEY:
    # Setup logging
    logger = logging.getLogger(__name__)
    logger.addHandler(AzureLogHandler(connection_string=f"InstrumentationKey={APPINSIGHTS_KEY}"))
    logger.setLevel(logging.INFO)
    
    # Log application start
    logger.info("Application started successfully")
```

## 9.3. Create Alert Rules

### 9.3.1. High CPU Alert

```powershell
# Create action group for notifications
az monitor action-group create `
  --name lms-alert-action-group `
  --resource-group lms-production-rg `
  --short-name lms-alerts `
  --email-receiver email1 devops@yourdomain.com

# High CPU alert (>80% for 5 minutes)
az monitor metrics alert create `
  --name "High CPU Usage" `
  --resource-group lms-production-rg `
  --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/lms-production-rg/providers/Microsoft.Web/serverFarms/lms-app-service-plan" `
  --condition "avg Percentage CPU > 80" `
  --window-size 5m `
  --evaluation-frequency 1m `
  --action lms-alert-action-group `
  --description "Alert when CPU usage exceeds 80% for 5 minutes"
```

### 9.3.2. High Memory Alert

```powershell
az monitor metrics alert create `
  --name "High Memory Usage" `
  --resource-group lms-production-rg `
  --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/lms-production-rg/providers/Microsoft.Web/serverFarms/lms-app-service-plan" `
  --condition "avg Memory Percentage > 85" `
  --window-size 5m `
  --evaluation-frequency 1m `
  --action lms-alert-action-group `
  --description "Alert when memory usage exceeds 85%"
```

### 9.3.3. High Response Time Alert

```powershell
az monitor metrics alert create `
  --name "Slow Response Time" `
  --resource-group lms-production-rg `
  --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/lms-production-rg/providers/Microsoft.Web/sites/lms-api-gateway" `
  --condition "avg HttpResponseTime > 2" `
  --window-size 5m `
  --evaluation-frequency 1m `
  --action lms-alert-action-group `
  --description "Alert when average response time exceeds 2 seconds"
```

### 9.3.4. HTTP 5xx Errors Alert

```powershell
az monitor metrics alert create `
  --name "High Error Rate" `
  --resource-group lms-production-rg `
  --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/lms-production-rg/providers/Microsoft.Web/sites/lms-api-gateway" `
  --condition "total Http5xx > 10" `
  --window-size 5m `
  --evaluation-frequency 1m `
  --action lms-alert-action-group `
  --description "Alert when more than 10 HTTP 5xx errors in 5 minutes"
```

### 9.3.5. Database Connection Alert

```powershell
az monitor metrics alert create `
  --name "High Database Connections" `
  --resource-group lms-production-rg `
  --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/lms-production-rg/providers/Microsoft.DBforPostgreSQL/flexibleServers/lms-postgres-server" `
  --condition "avg active_connections > 80" `
  --window-size 5m `
  --evaluation-frequency 1m `
  --action lms-alert-action-group `
  --description "Alert when active database connections exceed 80"
```

### 9.3.6. Storage Space Alert

```powershell
az monitor metrics alert create `
  --name "Low Storage Space" `
  --resource-group lms-production-rg `
  --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/lms-production-rg/providers/Microsoft.Storage/storageAccounts/lmsstorageaccount001" `
  --condition "avg UsedCapacity > 85899345920" `
  --window-size 1h `
  --evaluation-frequency 15m `
  --action lms-alert-action-group `
  --description "Alert when storage used exceeds 80GB (80% of 100GB)"
```

## 9.4. Create Dashboards

### 9.4.1. System Health Dashboard

```powershell
# Create dashboard JSON
@"
{
  "properties": {
    "lenses": [
      {
        "order": 0,
        "parts": [
          {
            "position": {
              "x": 0,
              "y": 0,
              "colSpan": 6,
              "rowSpan": 4
            },
            "metadata": {
              "type": "Extension/HubsExtension/PartType/MonitorChartPart",
              "settings": {
                "content": {
                  "options": {
                    "chart": {
                      "metrics": [
                        {
                          "resourceMetadata": {
                            "id": "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/lms-production-rg/providers/Microsoft.Web/serverFarms/lms-app-service-plan"
                          },
                          "name": "CpuPercentage",
                          "aggregationType": "Average"
                        }
                      ],
                      "title": "CPU Usage",
                      "titleKind": 1
                    }
                  }
                }
              }
            }
          }
        ]
      }
    ]
  },
  "location": "southeastasia",
  "tags": {
    "hidden-title": "LMS System Health Dashboard"
  }
}
"@ | Out-File -FilePath dashboard.json

# Create dashboard
az portal dashboard create `
  --resource-group lms-production-rg `
  --name lms-system-health `
  --input-path dashboard.json `
  --location southeastasia
```

### 9.4.2. Access Dashboard

```
1. Go to Azure Portal: https://portal.azure.com
2. Search: "Dashboards"
3. Select: "lms-system-health"
4. Pin to favorites
```

## 9.5. Configure Availability Tests

### 9.5.1. Create Availability Test (Ping Test)

```powershell
# Create availability test for API Gateway
az monitor app-insights web-test create `
  --resource-group lms-production-rg `
  --name "API Gateway Health Check" `
  --defined-web-test-name "api-gateway-ping" `
  --location southeastasia `
  --app-insights lms-application-insights `
  --kind ping `
  --enabled true `
  --frequency 300 `
  --timeout 30 `
  --locations "Southeast Asia" "East Asia" "East US" `
  --retry-enabled true `
  --url "https://api.lms.yourdomain.com/health"
```

### 9.5.2. Create Availability Test for Frontend

```powershell
# Student Portal
az monitor app-insights web-test create `
  --resource-group lms-production-rg `
  --name "Student Portal Availability" `
  --defined-web-test-name "student-portal-ping" `
  --location southeastasia `
  --app-insights lms-application-insights `
  --kind ping `
  --enabled true `
  --frequency 300 `
  --timeout 30 `
  --locations "Southeast Asia" "East Asia" `
  --retry-enabled true `
  --url "https://student.lms.yourdomain.com"

# Repeat for Teacher and Admin portals
```

---

**Continue to Steps 10-13...**

Bạn muốn tôi tiếp tục với:
- STEP 10: CI/CD Pipeline Setup
- STEP 11: Security Hardening  
- STEP 12: Testing & Validation
- STEP 13: Go-Live Procedures

Hay bạn muốn tôi tạo một file riêng cho phần còn lại? 🚀
