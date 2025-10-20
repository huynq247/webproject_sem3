# 🏢 Hướng Dẫn Thiết Lập NAS và Storage On-Premise cho LMS Backup

## 📋 Mục Lục
1. [Tổng Quan về NAS](#tổng-quan-về-nas)
2. [So Sánh Các Giải Pháp Storage](#so-sánh-các-giải-pháp-storage)
3. [Khuyến Nghị Thiết Bị NAS](#khuyến-nghị-thiết-bị-nas)
4. [Cấu Hình NAS cho LMS Backup](#cấu-hình-nas-cho-lms-backup)
5. [RAID Configuration](#raid-configuration)
6. [Network Configuration](#network-configuration)
7. [Backup Automation với NAS](#backup-automation-với-nas)
8. [Disaster Recovery Plan](#disaster-recovery-plan)
9. [Bảo Trì và Monitoring](#bảo-trì-và-monitoring)
10. [Chi Phí và ROI](#chi-phí-và-roi)

---

## 🗄️ Tổng Quan về NAS

### NAS là gì?

**NAS (Network Attached Storage)** là thiết bị lưu trữ kết nối mạng, hoạt động như một file server chuyên dụng. NAS cung cấp khả năng lưu trữ tập trung, dễ quản lý và có thể truy cập qua mạng LAN.

### Lợi Ích của NAS cho LMS Backup

| Lợi Ích | Mô Tả |
|---------|-------|
| **Tập trung hóa** | Tất cả backup được lưu ở một nơi, dễ quản lý |
| **Scalability** | Dễ dàng mở rộng dung lượng khi cần |
| **Redundancy** | Hỗ trợ RAID để bảo vệ dữ liệu |
| **Accessibility** | Truy cập qua mạng từ nhiều thiết bị |
| **Cost-effective** | Rẻ hơn so với server chuyên dụng |
| **Low power** | Tiêu thụ điện năng thấp |
| **Easy setup** | Giao diện web, không cần chuyên môn cao |

### Kiến Trúc Backup với NAS

```
┌─────────────────────────────────────────────────────────────────┐
│                         AZURE CLOUD                             │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ PostgreSQL   │    │ Blob Storage │    │ App Services │     │
│  │  Database    │    │   (Files)    │    │   (Logs)     │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│         │                   │                    │               │
└─────────┼───────────────────┼────────────────────┼──────────────┘
          │                   │                    │
          │ VPN/Internet      │ VPN/Internet       │ VPN/Internet
          │                   │                    │
┌─────────▼───────────────────▼────────────────────▼──────────────┐
│                    ON-PREMISE NETWORK                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │            Backup Server (Ubuntu/Windows)          │         │
│  │  - VPN Client                                      │         │
│  │  - Backup Scripts                                  │         │
│  │  - PostgreSQL Client                               │         │
│  │  - Azure CLI                                       │         │
│  │  - Monitoring Tools                                │         │
│  └────────────────────┬───────────────────────────────┘         │
│                       │ NFS/SMB/iSCSI                            │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────┐         │
│  │                 NAS DEVICE                          │         │
│  │  ┌──────────────────────────────────────────────┐  │         │
│  │  │           RAID 5/6 Configuration             │  │         │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │  │         │
│  │  │  │ HDD  │ │ HDD  │ │ HDD  │ │ HDD  │       │  │         │
│  │  │  │ 8TB  │ │ 8TB  │ │ 8TB  │ │ 8TB  │       │  │         │
│  │  │  └──────┘ └──────┘ └──────┘ └──────┘       │  │         │
│  │  └──────────────────────────────────────────────┘  │         │
│  │                                                      │         │
│  │  Storage Layout:                                    │         │
│  │  /volume1/backup/                                   │         │
│  │    ├── database/          (PostgreSQL dumps)       │         │
│  │    ├── files/             (Azure Blob sync)        │         │
│  │    ├── logs/              (Application logs)       │         │
│  │    ├── snapshots/         (Point-in-time copies)   │         │
│  │    └── archive/           (Long-term storage)      │         │
│  │                                                      │         │
│  │  Features:                                          │         │
│  │  ✓ Automatic snapshots (hourly/daily/weekly)       │         │
│  │  ✓ Deduplication & Compression                     │         │
│  │  ✓ Encrypted volumes                               │         │
│  │  ✓ Cloud sync (optional offsite backup)            │         │
│  └────────────────────────────────────────────────────┘         │
│                       │                                          │
│                       │ Optional: Second NAS for replication    │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────┐         │
│  │          NAS DEVICE 2 (Offsite/DR Site)            │         │
│  │  - Real-time replication from primary NAS          │         │
│  │  - Geographic redundancy                            │         │
│  │  - Disaster recovery ready                         │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 So Sánh Các Giải Pháp Storage

### 1. NAS vs Server vs DAS

| Tiêu Chí | NAS | Dedicated Server | DAS (Direct Attached) |
|----------|-----|------------------|----------------------|
| **Chi phí** | $300-$2000 | $2000-$10000+ | $200-$1000 |
| **Dễ cài đặt** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Khả năng mở rộng** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Hiệu suất** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Tiêu thụ điện** | 30-100W | 200-500W | 0W (dùng điện PC) |
| **Độ ồn** | Thấp | Cao | Trung bình |
| **Network access** | ✅ Yes | ✅ Yes | ❌ No (chỉ local) |
| **RAID support** | ✅ Yes | ✅ Yes | Tùy thiết bị |
| **Backup tự động** | ✅ Yes | ✅ Yes | ⚠️ Cần software |
| **Quản lý từ xa** | ✅ Web UI | ✅ SSH/RDP | ❌ Limited |

**Khuyến nghị cho LMS**: **NAS** - Cân bằng tốt giữa chi phí, hiệu suất và dễ sử dụng.

### 2. So Sánh Các Loại RAID

| RAID Level | Drives Min | Capacity | Redundancy | Performance | Use Case |
|------------|-----------|----------|------------|-------------|----------|
| **RAID 0** | 2 | 100% | ❌ None | ⭐⭐⭐⭐⭐ | Không dùng cho backup |
| **RAID 1** | 2 | 50% | ✅ 1 drive | ⭐⭐⭐ | Backup quan trọng |
| **RAID 5** | 3 | 75% (4 drives) | ✅ 1 drive | ⭐⭐⭐⭐ | **Khuyến nghị cho LMS** |
| **RAID 6** | 4 | 67% (4 drives) | ✅ 2 drives | ⭐⭐⭐⭐ | Large storage, extra safety |
| **RAID 10** | 4 | 50% | ✅ 1 per mirror | ⭐⭐⭐⭐⭐ | High performance + redundancy |
| **SHR** (Synology) | 2 | Flexible | ✅ 1-2 drives | ⭐⭐⭐⭐ | Easy management |

**Khuyến nghị cho LMS Backup**: 
- **RAID 5** (4 drives): 24TB usable từ 4x 8TB drives
- **RAID 6** (5 drives): 24TB usable từ 5x 8TB drives (an toàn hơn)

---

## 🏆 Khuyến Nghị Thiết Bị NAS

### Budget: $500-$800 (Small Scale - 100-500 users)

#### 1. Synology DS423+ (2023)
- **CPU**: AMD Ryzen R1600 dual-core 2.6 GHz
- **RAM**: 2GB DDR4 (expandable to 6GB)
- **Bays**: 4 x 3.5" SATA HDD/SSD
- **Network**: 2 x 1GbE
- **Price**: ~$500
- **Storage**: 4 x 8TB = 24TB usable (RAID 5)

**Ưu điểm**:
- ✅ DSM OS rất dễ dùng
- ✅ App ecosystem phong phú
- ✅ Snapshot Replication tích hợp
- ✅ Cloud Sync hỗ trợ Azure
- ✅ Bảo hành 3 năm

**Nhược điểm**:
- ⚠️ RAM hơi thấp (nâng cấp lên 6GB)
- ⚠️ Chỉ 1GbE (không 10GbE)

#### 2. QNAP TS-464 (2023)
- **CPU**: Intel Celeron N5105 quad-core 2.0 GHz
- **RAM**: 8GB DDR4 (expandable to 16GB)
- **Bays**: 4 x 3.5" SATA HDD/SSD
- **Network**: 2 x 2.5GbE
- **Price**: ~$550
- **Storage**: 4 x 8TB = 24TB usable (RAID 5)

**Ưu điểm**:
- ✅ RAM cao hơn (8GB)
- ✅ 2.5GbE network (nhanh hơn)
- ✅ Processor mạnh hơn
- ✅ HDMI output (có thể dùng như media center)

**Nhược điểm**:
- ⚠️ QTS OS phức tạp hơn DSM
- ⚠️ App ecosystem ít hơn Synology

### Mid-Range: $1000-$1500 (Medium Scale - 500-2000 users)

#### 3. Synology DS923+ (2023)
- **CPU**: AMD Ryzen R1600 dual-core 2.6 GHz
- **RAM**: 4GB DDR4 (expandable to 32GB)
- **Bays**: 4 x 3.5" + expansion unit support
- **Network**: 2 x 1GbE + 1 x 10GbE upgrade option
- **Price**: ~$600
- **Storage**: 4 x 12TB = 36TB usable (RAID 5)
- **Expansion**: Thêm DX517 (5 bays) = total 9 bays

**Ưu điểm**:
- ✅ Có thể mở rộng lên 9 bays
- ✅ 10GbE network card option
- ✅ Hỗ trợ RAM lên 32GB
- ✅ Active Backup for Business

#### 4. QNAP TS-873A (2023)
- **CPU**: AMD Ryzen V1500B quad-core 2.2 GHz
- **RAM**: 8GB DDR4 (expandable to 64GB)
- **Bays**: 8 x 3.5" SATA HDD/SSD
- **Network**: 2 x 2.5GbE + 10GbE option
- **Price**: ~$900
- **Storage**: 8 x 8TB = 48TB usable (RAID 6)

**Ưu điểm**:
- ✅ 8 bays ngay từ đầu
- ✅ Processor mạnh
- ✅ RAM lên tới 64GB
- ✅ Virtualization support (VM)

### Enterprise: $2000-$5000 (Large Scale - 2000+ users)

#### 5. Synology DS1823xs+ (2023)
- **CPU**: AMD Ryzen V1780B octa-core 3.35 GHz
- **RAM**: 8GB ECC DDR4 (expandable to 32GB)
- **Bays**: 8 x 3.5" + expansion support
- **Network**: 4 x 1GbE + 10GbE upgrade
- **Price**: ~$2000
- **Storage**: 8 x 16TB = 96TB usable (RAID 6)
- **Expansion**: Lên tới 18 bays

**Ưu điểm**:
- ✅ ECC RAM (enterprise grade)
- ✅ Processor cực mạnh
- ✅ Hỗ trợ SSD cache
- ✅ Hot-swappable PSU
- ✅ Bảo hành 5 năm

#### 6. TrueNAS Mini X+ (ix Systems)
- **CPU**: Intel Xeon D-1541 octa-core
- **RAM**: 32GB ECC DDR4 (expandable to 128GB)
- **Bays**: 8 x 3.5" hot-swap
- **Network**: 2 x 10GbE SFP+
- **Price**: ~$3000
- **Storage**: 8 x 16TB = 96TB usable (RAID-Z2)
- **OS**: TrueNAS (FreeBSD-based, ZFS filesystem)

**Ưu điểm**:
- ✅ ZFS filesystem (tốt nhất cho data integrity)
- ✅ ECC RAM bắt buộc
- ✅ 10GbE built-in
- ✅ Enterprise-grade hardware
- ✅ Open-source software

---

## 🔧 Cấu Hình NAS cho LMS Backup

### 1. Initial Setup (Synology Example)

#### A. Hardware Setup
```
1. Cài đặt HDDs vào NAS bays
2. Kết nối NAS vào switch/router
3. Kết nối nguồn điện
4. Boot lần đầu
```

#### B. Software Installation
```
1. Truy cập http://find.synology.com
2. Download DSM (DiskStation Manager)
3. Upload và cài đặt DSM
4. Tạo admin account
5. Set timezone và language
```

#### C. Storage Pool & Volume Setup

**Qua DSM Web Interface:**

```
Storage Manager > Storage Pool > Create
├── RAID Type: SHR (Synology Hybrid RAID) hoặc RAID 5
├── Drives: Chọn tất cả drives
├── SSD Cache: Không cần (optional cho performance)
└── Confirm và Format

Storage Manager > Volume > Create
├── Name: LMSBackup
├── File System: Btrfs (khuyến nghị - hỗ trợ snapshots)
├── Size: Maximum
└── Create
```

### 2. Network Configuration

#### A. Static IP Assignment

**DSM**: Control Panel > Network > Network Interface

```
Interface: LAN 1
├── Manual Configuration
├── IP Address: 192.168.1.100
├── Subnet Mask: 255.255.255.0
├── Gateway: 192.168.1.1
└── DNS: 8.8.8.8, 8.8.4.4
```

#### B. Enable Required Services

**DSM**: Control Panel > File Services

```
✅ SMB/CIFS: Port 445 (Windows sharing)
✅ AFP: Port 548 (macOS)
✅ NFS: Port 2049 (Linux/Unix)
✅ FTP: Port 21 (File transfer)
✅ SFTP: Port 22 (Secure file transfer)
✅ rsync: Port 873 (Sync service)
```

#### C. Firewall Configuration

**DSM**: Control Panel > Security > Firewall

```
Create Rule: Allow from Backup Server
├── Source IP: 192.168.1.50 (backup server IP)
├── Ports: 22 (SSH), 873 (rsync), 2049 (NFS)
└── Action: Allow

Create Rule: Deny from Internet
├── Source IP: 0.0.0.0/0
├── Ports: All
└── Action: Deny
```

### 3. User và Permission Setup

#### A. Create Backup User

**DSM**: Control Panel > User & Group > Create

```
User: lms_backup
Password: <strong-password>
Description: LMS Azure Backup User
Groups: administrators (for full access)

Permissions:
├── /volume1/LMSBackup: Read/Write
├── /volume1/snapshots: Read/Write
└── All other: No access
```

#### B. Create Shared Folders

**DSM**: Control Panel > Shared Folder > Create

```
Folder 1: database_backup
├── Path: /volume1/LMSBackup/database
├── Description: PostgreSQL dumps from Azure
├── Enable Recycle Bin: Yes (30 days retention)
├── Enable Encryption: Yes (AES-256)
└── Permissions: lms_backup (Read/Write)

Folder 2: files_backup
├── Path: /volume1/LMSBackup/files
├── Description: Azure Blob Storage sync
├── Enable Recycle Bin: Yes
└── Permissions: lms_backup (Read/Write)

Folder 3: logs_backup
├── Path: /volume1/LMSBackup/logs
├── Description: Application logs
└── Permissions: lms_backup (Read/Write)

Folder 4: snapshots
├── Path: /volume1/LMSBackup/snapshots
├── Description: Point-in-time copies
└── Permissions: lms_backup (Read only)
```

### 4. Enable Advanced Features

#### A. Snapshot Replication

**DSM**: Package Center > Install "Snapshot Replication"

```
Configure Snapshots:
├── Shared Folder: database_backup
├── Schedule:
│   ├── Hourly: Keep 24 hours
│   ├── Daily: Keep 7 days
│   ├── Weekly: Keep 4 weeks
│   └── Monthly: Keep 6 months
└── Enable Snapshot Lock
```

#### B. Cloud Sync (Optional - Offsite Backup)

**DSM**: Package Center > Install "Cloud Sync"

```
Configure Cloud Sync to Azure:
├── Cloud Provider: Microsoft Azure
├── Connection:
│   ├── Account Name: lmsstorageaccount
│   ├── Access Key: <your-key>
│   └── Container: nas-backup
├── Local Path: /volume1/LMSBackup/archive
├── Sync Direction: Upload local changes only
├── Schedule: Daily at 2 AM
└── Encryption: Yes (AES-256)
```

#### C. Hyper Backup (Comprehensive Backup)

**DSM**: Package Center > Install "Hyper Backup"

```
Create Backup Task:
├── Destination: External USB Drive hoặc Second NAS
├── Folders to Backup:
│   ├── database_backup
│   ├── files_backup
│   └── System configuration
├── Schedule: Weekly on Sunday 3 AM
├── Retention: Keep 12 versions
├── Compression: Yes
└── Encryption: Yes (AES-256)
```

---

## 🔄 RAID Configuration

### Recommended RAID Setup cho LMS

#### Scenario 1: 4 x 8TB Drives (Budget Setup)

**RAID 5 Configuration:**

```
Total Raw Capacity: 32TB (4 x 8TB)
Usable Capacity: 24TB
Redundancy: 1 drive failure
Read Performance: Excellent (striped across 4 drives)
Write Performance: Good (parity calculation overhead)

Use Case: 
- 100-500 users
- 50GB database
- 500GB files
- 5 years retention
- Total needed: ~3TB
- Plenty of room for growth
```

**Setup via DSM:**
```
Storage Manager > Storage Pool > Create
├── RAID Type: RAID 5
├── Drives: Select all 4 drives (8TB each)
├── File System: Btrfs
└── Confirm (will take 6-12 hours to initialize)
```

#### Scenario 2: 5 x 8TB Drives (Recommended)

**RAID 6 Configuration:**

```
Total Raw Capacity: 40TB (5 x 8TB)
Usable Capacity: 24TB
Redundancy: 2 drive failures
Read Performance: Excellent
Write Performance: Moderate (dual parity)

Use Case:
- 500-2000 users
- Critical data protection
- Better safety during rebuild
```

#### Scenario 3: 4 x 8TB Drives (High Performance)

**RAID 10 Configuration:**

```
Total Raw Capacity: 32TB (4 x 8TB)
Usable Capacity: 16TB
Redundancy: 1 drive per mirror pair
Read Performance: Excellent
Write Performance: Excellent (no parity)

Use Case:
- Frequent writes
- Need fast backup speeds
- Can sacrifice capacity for performance
```

### RAID Rebuild Time

| RAID Level | Drive Size | Rebuild Time | Risk During Rebuild |
|------------|-----------|--------------|---------------------|
| RAID 1 | 8TB | 8-12 hours | Low |
| RAID 5 | 8TB | 12-24 hours | Medium (1 drive only) |
| RAID 6 | 8TB | 16-36 hours | Low (can lose 2 drives) |
| RAID 10 | 8TB | 8-16 hours | Low (mirrored) |

**Best Practice**: Use RAID 6 for drives ≥6TB để an toàn trong quá trình rebuild.

---

## 🌐 Network Configuration

### 1. Network Topology

```
Internet
   │
   ▼
[Router/Firewall]
   │ 192.168.1.1
   │
   ├─────────┬─────────┬─────────┬─────────
   │         │         │         │
   ▼         ▼         ▼         ▼
[Switch]  [WiFi AP] [VPN]   [Management]
   │
   ├─────────┬─────────┬─────────
   │         │         │
   ▼         ▼         ▼
[Backup]  [NAS]    [NAS 2]
Server    Primary  DR Site
.50       .100     .101
```

### 2. Network Settings

#### Backup Server Config

```bash
# /etc/network/interfaces (Ubuntu)
auto eth0
iface eth0 inet static
    address 192.168.1.50
    netmask 255.255.255.0
    gateway 192.168.1.1
    dns-nameservers 8.8.8.8 8.8.4.4
```

#### NAS Mount on Backup Server

**NFS Mount (Recommended for Linux):**

```bash
# Install NFS client
sudo apt install nfs-common

# Create mount point
sudo mkdir -p /mnt/nas/backup

# Add to /etc/fstab for automatic mount
echo "192.168.1.100:/volume1/LMSBackup /mnt/nas/backup nfs defaults,_netdev 0 0" | sudo tee -a /etc/fstab

# Mount
sudo mount -a

# Verify
df -h | grep nas
```

**SMB/CIFS Mount (Windows/Linux):**

```bash
# Install CIFS utils
sudo apt install cifs-utils

# Create credentials file
sudo nano /root/.smbcredentials
# Add:
username=lms_backup
password=your-password

# Secure credentials
sudo chmod 600 /root/.smbcredentials

# Mount
sudo mount -t cifs //192.168.1.100/database_backup /mnt/nas/backup \
    -o credentials=/root/.smbcredentials,uid=1000,gid=1000

# Add to /etc/fstab
echo "//192.168.1.100/database_backup /mnt/nas/backup cifs credentials=/root/.smbcredentials,uid=1000,gid=1000 0 0" | sudo tee -a /etc/fstab
```

### 3. Network Performance Optimization

#### Enable Jumbo Frames (Optional - for 1GbE+)

**On NAS (DSM):**
```
Control Panel > Network > Network Interface
├── LAN 1
├── MTU: 9000 (Jumbo Frame)
└── Apply
```

**On Backup Server:**
```bash
# Set MTU
sudo ip link set eth0 mtu 9000

# Verify
ip link show eth0

# Make persistent
echo "MTU=9000" | sudo tee -a /etc/sysconfig/network-scripts/ifcfg-eth0
```

#### Network Bonding (Link Aggregation)

**Nếu NAS có 2 network ports:**

```
DSM: Control Panel > Network > Network Interface > Create > Bond
├── Mode: IEEE 802.3ad Dynamic Link Aggregation
├── Interfaces: LAN 1 + LAN 2
├── Result: 2Gbps throughput
└── Requires: Switch support for LACP
```

---

## 🤖 Backup Automation với NAS

### 1. Enhanced Backup Script với NAS

```bash
#!/bin/bash
# /opt/lms-backup/backup_to_nas.sh

# ============================================
# LMS Azure to NAS Backup Script
# ============================================

# Configuration
SCRIPT_DIR="/opt/lms-backup"
CONFIG_FILE="$SCRIPT_DIR/config.env"
LOG_FILE="/var/log/lms-backup.log"
ERROR_LOG="/var/log/lms-backup-error.log"

# Load configuration
source $CONFIG_FILE

# NAS Configuration
NAS_HOST="${NAS_HOST:-192.168.1.100}"
NAS_MOUNT="/mnt/nas/backup"
NAS_DB_PATH="$NAS_MOUNT/database"
NAS_FILES_PATH="$NAS_MOUNT/files"
NAS_LOGS_PATH="$NAS_MOUNT/logs"

# Azure Configuration
AZURE_DB_HOST="${AZURE_DB_HOST}"
AZURE_DB_NAME="${AZURE_DB_NAME}"
AZURE_DB_USER="${AZURE_DB_USER}"
AZURE_DB_PASSWORD="${AZURE_DB_PASSWORD}"
AZURE_STORAGE_ACCOUNT="${AZURE_STORAGE_ACCOUNT}"
AZURE_STORAGE_KEY="${AZURE_STORAGE_KEY}"

# Backup Settings
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
RETENTION_MONTHS=12

# ============================================
# Functions
# ============================================

log_message() {
    local level=$1
    shift
    local message="$@"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" | tee -a $LOG_FILE
}

send_notification() {
    local status=$1
    local message=$2
    
    # Send to webhook/email/Slack
    curl -X POST "${NOTIFICATION_WEBHOOK}" \
        -H "Content-Type: application/json" \
        -d "{\"status\":\"$status\",\"message\":\"$message\",\"timestamp\":\"$(date)\"}" \
        2>/dev/null
}

check_nas_mount() {
    if ! mountpoint -q "$NAS_MOUNT"; then
        log_message "ERROR" "NAS not mounted at $NAS_MOUNT"
        mount -a
        sleep 5
        if ! mountpoint -q "$NAS_MOUNT"; then
            log_message "ERROR" "Failed to mount NAS"
            send_notification "ERROR" "NAS mount failed"
            exit 1
        fi
    fi
    log_message "INFO" "NAS mount verified"
}

check_disk_space() {
    local required_space=$1  # in GB
    local available=$(df -BG "$NAS_MOUNT" | awk 'NR==2 {print $4}' | sed 's/G//')
    
    if [ "$available" -lt "$required_space" ]; then
        log_message "ERROR" "Insufficient disk space. Required: ${required_space}GB, Available: ${available}GB"
        send_notification "ERROR" "Low disk space on NAS"
        exit 1
    fi
    log_message "INFO" "Disk space check passed: ${available}GB available"
}

backup_database() {
    log_message "INFO" "Starting database backup..."
    
    local backup_file="$NAS_DB_PATH/lms_${DATE}.dump"
    local compressed_file="${backup_file}.gz"
    
    # Create backup directory if not exists
    mkdir -p "$NAS_DB_PATH"
    
    # Dump database
    PGPASSWORD="$AZURE_DB_PASSWORD" pg_dump \
        -h "$AZURE_DB_HOST" \
        -p 5432 \
        -U "$AZURE_DB_USER" \
        -d "$AZURE_DB_NAME" \
        -F c \
        -f "$backup_file" \
        2>> "$ERROR_LOG"
    
    if [ $? -eq 0 ]; then
        # Compress backup
        gzip -9 "$backup_file"
        
        local size=$(du -h "$compressed_file" | cut -f1)
        log_message "INFO" "Database backup completed: $compressed_file ($size)"
        
        # Calculate checksum
        local checksum=$(sha256sum "$compressed_file" | cut -d' ' -f1)
        echo "$checksum  $(basename $compressed_file)" >> "$NAS_DB_PATH/checksums.txt"
        log_message "INFO" "Checksum: $checksum"
        
        return 0
    else
        log_message "ERROR" "Database backup failed"
        send_notification "ERROR" "Database backup failed"
        return 1
    fi
}

backup_files() {
    log_message "INFO" "Starting file backup from Azure Blob Storage..."
    
    mkdir -p "$NAS_FILES_PATH/$DATE"
    
    # Sync media container
    az storage blob download-batch \
        --account-name "$AZURE_STORAGE_ACCOUNT" \
        --account-key "$AZURE_STORAGE_KEY" \
        --source media \
        --destination "$NAS_FILES_PATH/$DATE/media" \
        --pattern "*" \
        2>> "$ERROR_LOG"
    
    # Sync documents container
    az storage blob download-batch \
        --account-name "$AZURE_STORAGE_ACCOUNT" \
        --account-key "$AZURE_STORAGE_KEY" \
        --source documents \
        --destination "$NAS_FILES_PATH/$DATE/documents" \
        --pattern "*" \
        2>> "$ERROR_LOG"
    
    if [ $? -eq 0 ]; then
        local size=$(du -sh "$NAS_FILES_PATH/$DATE" | cut -f1)
        log_message "INFO" "File backup completed: $size"
        
        # Create archive
        tar -czf "$NAS_FILES_PATH/files_${DATE}.tar.gz" -C "$NAS_FILES_PATH" "$DATE"
        rm -rf "$NAS_FILES_PATH/$DATE"
        
        return 0
    else
        log_message "ERROR" "File backup failed"
        send_notification "ERROR" "File backup failed"
        return 1
    fi
}

backup_logs() {
    log_message "INFO" "Starting logs backup..."
    
    mkdir -p "$NAS_LOGS_PATH/$DATE"
    
    # Download logs from App Services
    for service in api-gateway user-service content-service assignment-service; do
        az webapp log download \
            --name "lms-$service" \
            --resource-group "lms-production-rg" \
            --log-file "$NAS_LOGS_PATH/$DATE/${service}.zip" \
            2>> "$ERROR_LOG"
    done
    
    log_message "INFO" "Logs backup completed"
}

cleanup_old_backups() {
    log_message "INFO" "Cleaning up old backups..."
    
    # Delete database backups older than retention period
    find "$NAS_DB_PATH" -name "lms_*.dump.gz" -mtime +$RETENTION_DAYS -delete
    log_message "INFO" "Deleted database backups older than $RETENTION_DAYS days"
    
    # Delete file backups older than retention period
    find "$NAS_FILES_PATH" -name "files_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    log_message "INFO" "Deleted file backups older than $RETENTION_DAYS days"
    
    # Delete log backups older than 7 days
    find "$NAS_LOGS_PATH" -type d -mtime +7 -exec rm -rf {} +
    log_message "INFO" "Deleted log backups older than 7 days"
}

create_snapshot() {
    log_message "INFO" "Creating NAS snapshot..."
    
    # For Synology: Use syno command
    # ssh admin@$NAS_HOST "synosnap create 'LMSBackup' 'Auto_${DATE}' 'Automated backup snapshot'"
    
    # Or trigger via DSM API
    curl -X POST "http://$NAS_HOST:5000/webapi/entry.cgi" \
        -d "api=SYNO.Core.Share" \
        -d "method=snapshot" \
        -d "version=1" \
        -d "name=LMSBackup" \
        -d "desc=Auto_${DATE}" \
        2>/dev/null
    
    log_message "INFO" "Snapshot created"
}

generate_report() {
    local status=$1
    local db_backup_size=$(ls -lh "$NAS_DB_PATH"/lms_${DATE}.dump.gz 2>/dev/null | awk '{print $5}')
    local files_backup_size=$(ls -lh "$NAS_FILES_PATH"/files_${DATE}.tar.gz 2>/dev/null | awk '{print $5}')
    local total_space=$(df -h "$NAS_MOUNT" | awk 'NR==2 {print $2}')
    local used_space=$(df -h "$NAS_MOUNT" | awk 'NR==2 {print $3}')
    local available_space=$(df -h "$NAS_MOUNT" | awk 'NR==2 {print $4}')
    
    cat > "/tmp/backup_report_${DATE}.html" <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>LMS Backup Report - $DATE</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; }
        .status { padding: 20px; background: #f0f0f0; margin: 20px 0; }
        .success { color: green; }
        .error { color: red; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LMS Backup Report</h1>
        <p>Date: $(date)</p>
    </div>
    
    <div class="status">
        <h2>Status: <span class="$status">$status</span></h2>
    </div>
    
    <h2>Backup Details</h2>
    <table>
        <tr><th>Component</th><th>Size</th><th>Status</th></tr>
        <tr><td>Database</td><td>$db_backup_size</td><td class="success">✓</td></tr>
        <tr><td>Files</td><td>$files_backup_size</td><td class="success">✓</td></tr>
        <tr><td>Logs</td><td>N/A</td><td class="success">✓</td></tr>
    </table>
    
    <h2>Storage Status</h2>
    <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Space</td><td>$total_space</td></tr>
        <tr><td>Used Space</td><td>$used_space</td></tr>
        <tr><td>Available Space</td><td>$available_space</td></tr>
    </table>
</body>
</html>
EOF
    
    # Email report (optional)
    # mail -s "LMS Backup Report - $DATE" -a "Content-Type: text/html" admin@yourdomain.com < "/tmp/backup_report_${DATE}.html"
}

# ============================================
# Main Execution
# ============================================

main() {
    log_message "INFO" "=== LMS Backup Started ==="
    
    # Pre-flight checks
    check_nas_mount
    check_disk_space 100  # Require 100GB free
    
    # Perform backups
    local status="SUCCESS"
    
    if ! backup_database; then
        status="PARTIAL_FAILURE"
    fi
    
    if ! backup_files; then
        status="PARTIAL_FAILURE"
    fi
    
    backup_logs
    
    # Post-backup tasks
    cleanup_old_backups
    create_snapshot
    
    # Generate report
    generate_report "$status"
    
    # Send notification
    if [ "$status" == "SUCCESS" ]; then
        send_notification "SUCCESS" "All backups completed successfully"
        log_message "INFO" "=== LMS Backup Completed Successfully ==="
    else
        send_notification "WARNING" "Backup completed with errors"
        log_message "WARNING" "=== LMS Backup Completed with Errors ==="
    fi
}

# Run main function
main

exit 0
```

### 2. Configuration File

```bash
# /opt/lms-backup/config.env

# NAS Configuration
NAS_HOST=192.168.1.100
NAS_USER=lms_backup
NAS_MOUNT=/mnt/nas/backup

# Azure Database
AZURE_DB_HOST=lms-postgres-server.postgres.database.azure.com
AZURE_DB_NAME=lms_production
AZURE_DB_USER=lmsadmin
AZURE_DB_PASSWORD=YourSecurePassword123!

# Azure Storage
AZURE_STORAGE_ACCOUNT=lmsstorageaccount
AZURE_STORAGE_KEY=your-storage-key-here

# Notification
NOTIFICATION_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Retention
RETENTION_DAYS=30
RETENTION_MONTHS=12
```

### 3. Systemd Service (Optional)

```ini
# /etc/systemd/system/lms-backup.service

[Unit]
Description=LMS Azure to NAS Backup Service
After=network.target

[Service]
Type=oneshot
User=root
ExecStart=/opt/lms-backup/backup_to_nas.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and test
sudo systemctl daemon-reload
sudo systemctl enable lms-backup.service
sudo systemctl start lms-backup.service
sudo systemctl status lms-backup.service
```

### 4. Systemd Timer (Instead of Cron)

```ini
# /etc/systemd/system/lms-backup.timer

[Unit]
Description=LMS Backup Daily Timer
Requires=lms-backup.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
# Enable timer
sudo systemctl enable lms-backup.timer
sudo systemctl start lms-backup.timer
sudo systemctl list-timers
```

---

## 🔥 Disaster Recovery Plan

### Recovery Scenarios

#### Scenario 1: Azure Database Failure

```bash
# /opt/lms-backup/restore_database.sh

#!/bin/bash

echo "=== LMS Database Disaster Recovery ==="
echo ""
echo "Available backups:"
ls -lh /mnt/nas/backup/database/lms_*.dump.gz | tail -10

echo ""
read -p "Enter backup filename to restore: " BACKUP_FILE

if [ ! -f "/mnt/nas/backup/database/$BACKUP_FILE" ]; then
    echo "Backup file not found!"
    exit 1
fi

echo "Verifying checksum..."
cd /mnt/nas/backup/database
sha256sum -c checksums.txt --ignore-missing | grep "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo "WARNING: Checksum verification failed!"
    read -p "Continue anyway? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        exit 1
    fi
fi

echo "Decompressing backup..."
gunzip -c "$BACKUP_FILE" > /tmp/restore.dump

echo "Restoring to Azure..."
PGPASSWORD="$AZURE_DB_PASSWORD" pg_restore \
    -h "$AZURE_DB_HOST" \
    -U "$AZURE_DB_USER" \
    -d "$AZURE_DB_NAME" \
    --clean \
    --if-exists \
    /tmp/restore.dump

if [ $? -eq 0 ]; then
    echo "✓ Database restore completed successfully!"
    rm /tmp/restore.dump
else
    echo "✗ Database restore failed!"
    exit 1
fi
```

#### Scenario 2: Azure Blob Storage Data Loss

```bash
# Restore files to Azure Blob Storage
az storage blob upload-batch \
    --account-name lmsstorageaccount \
    --account-key "$AZURE_STORAGE_KEY" \
    --source /mnt/nas/backup/files/latest/media \
    --destination media

az storage blob upload-batch \
    --account-name lmsstorageaccount \
    --account-key "$AZURE_STORAGE_KEY" \
    --source /mnt/nas/backup/files/latest/documents \
    --destination documents
```

#### Scenario 3: Complete Azure Failure

**RTO (Recovery Time Objective): 4 hours**
**RPO (Recovery Point Objective): 24 hours**

```
Step 1: Setup temporary on-premise infrastructure
├── Install PostgreSQL on backup server
├── Restore database from NAS
├── Configure web servers
└── Point DNS to on-premise IP

Step 2: Restore data
├── Database: 30 minutes
├── Files: 2 hours
└── Configuration: 30 minutes

Step 3: Switch DNS
├── Update DNS A records
├── SSL certificate
└── Test all endpoints

Step 4: Migrate back to Azure when ready
├── Re-deploy infrastructure
├── Restore from on-premise
└── Switch DNS back
```

### Recovery Time Estimates

| Component | Backup Size | Restore Time | Notes |
|-----------|-------------|--------------|-------|
| Database | 50GB | 30-60 min | Network speed dependent |
| Files | 500GB | 2-4 hours | Parallel upload |
| Configuration | <1GB | 10-15 min | Quick |
| **Total** | ~550GB | **3-5 hours** | Full disaster recovery |

---

## 📊 Bảo Trì và Monitoring

### 1. Daily Health Checks

```bash
# /opt/lms-backup/health_check.sh

#!/bin/bash

echo "=== NAS Health Check Report ==="
echo "Date: $(date)"
echo ""

# Check NAS availability
echo "1. NAS Ping Test:"
ping -c 3 192.168.1.100

# Check mount
echo ""
echo "2. Mount Status:"
mountpoint /mnt/nas/backup && echo "✓ NAS mounted" || echo "✗ NAS not mounted"

# Check disk space
echo ""
echo "3. Disk Space:"
df -h /mnt/nas/backup

# Check recent backups
echo ""
echo "4. Recent Backups:"
echo "Database:"
ls -lht /mnt/nas/backup/database/lms_*.dump.gz | head -3
echo ""
echo "Files:"
ls -lht /mnt/nas/backup/files/files_*.tar.gz | head -3

# Check backup age
echo ""
echo "5. Backup Freshness:"
LAST_BACKUP=$(ls -t /mnt/nas/backup/database/lms_*.dump.gz | head -1)
if [ -n "$LAST_BACKUP" ]; then
    AGE=$(find "$LAST_BACKUP" -mtime +2)
    if [ -z "$AGE" ]; then
        echo "✓ Latest backup is fresh (< 48 hours)"
    else
        echo "✗ WARNING: Latest backup is old (> 48 hours)"
    fi
fi

# Check SMART status (if accessible)
echo ""
echo "6. Drive Health:"
# This requires SSH access to NAS
# ssh admin@192.168.1.100 "smartctl -H /dev/sda"
```

### 2. NAS Monitoring Dashboard

**Synology DSM**: Resource Monitor

```
CPU Usage: Monitor for sustained high usage
Memory Usage: Should be < 80%
Network: Monitor throughput
Storage: Alert at 80% full
Disk Health: Check SMART status weekly
Temperature: Should be < 45°C
```

**QNAP QTS**: System Status

```
Similar monitoring capabilities
Built-in alerting system
Email notifications
SMS alerts (requires modem)
```

### 3. Automated Alerts

**DSM Email Notifications:**

```
Control Panel > Notification > Email
├── SMTP Server: smtp.gmail.com:587
├── Account: your-email@gmail.com
├── Password: app-password
└── Test email

Enable notifications for:
✅ Storage space running low (80%)
✅ Disk failure
✅ System overheating
✅ Backup task failed
✅ Abnormal login
```

### 4. Monthly Maintenance Tasks

```bash
# /opt/lms-backup/monthly_maintenance.sh

#!/bin/bash

echo "=== Monthly NAS Maintenance ==="

# 1. Test restore procedure
echo "1. Testing database restore..."
/opt/lms-backup/test_restore.sh

# 2. Verify checksums
echo "2. Verifying backup checksums..."
cd /mnt/nas/backup/database
sha256sum -c checksums.txt

# 3. Check RAID health
echo "3. RAID health check..."
# ssh admin@192.168.1.100 "cat /proc/mdstat"

# 4. Review storage usage trends
echo "4. Storage usage trend..."
du -sh /mnt/nas/backup/* | sort -h

# 5. Update backup scripts if needed
echo "5. Checking for script updates..."
git -C /opt/lms-backup pull

# 6. Generate monthly report
echo "6. Generating monthly report..."
# ... generate report logic ...

echo ""
echo "Maintenance completed!"
```

---

## 💵 Chi Phí và ROI

### Initial Investment

#### Option 1: Budget Setup (Small Business)

| Item | Model | Price | Quantity | Total |
|------|-------|-------|----------|-------|
| NAS Device | Synology DS423+ | $500 | 1 | $500 |
| Hard Drives | WD Red Plus 8TB | $180 | 4 | $720 |
| Network Switch | TP-Link TL-SG108 | $25 | 1 | $25 |
| UPS | APC BX1500M | $180 | 1 | $180 |
| **Total** | | | | **$1,425** |

**Usable Storage**: 24TB (RAID 5)

#### Option 2: Professional Setup (Medium Business)

| Item | Model | Price | Quantity | Total |
|------|-------|-------|----------|-------|
| NAS Device | Synology DS923+ | $600 | 1 | $600 |
| Hard Drives | WD Red Pro 12TB | $280 | 4 | $1,120 |
| RAM Upgrade | 16GB DDR4 | $80 | 1 | $80 |
| SSD Cache | Samsung 870 EVO 500GB | $60 | 2 | $120 |
| 10GbE Card | Synology E10G21-F2 | $250 | 1 | $250 |
| Network Switch | Netgear XS708T (10GbE) | $600 | 1 | $600 |
| UPS | APC SMT1500 | $500 | 1 | $500 |
| **Total** | | | | **$3,270** |

**Usable Storage**: 36TB (RAID 5)
**Network**: 10GbE for fast backups

#### Option 3: Enterprise Setup (Large Organization)

| Item | Model | Price | Quantity | Total |
|------|-------|-------|----------|-------|
| Primary NAS | Synology DS1823xs+ | $2,000 | 1 | $2,000 |
| DR NAS | Synology DS1823xs+ | $2,000 | 1 | $2,000 |
| Hard Drives | Seagate Exos X18 16TB | $350 | 16 | $5,600 |
| RAM Upgrade | 32GB ECC DDR4 | $200 | 2 | $400 |
| 10GbE Cards | Synology E10G21-F2 | $250 | 2 | $500 |
| Network Switch | Netgear M4300 | $1,500 | 1 | $1,500 |
| UPS | APC SRT3000XLI | $1,500 | 2 | $3,000 |
| **Total** | | | | **$15,000** |

**Usable Storage**: 192TB (96TB per NAS, RAID 6)
**Geographic Redundancy**: 2 locations

### Operating Costs (Annual)

| Cost Item | Budget | Professional | Enterprise |
|-----------|--------|--------------|------------|
| Electricity (24/7) | $150 | $200 | $600 |
| Internet (Bandwidth) | $0 (included) | $0 | $500 |
| Replacement Drives (1/year) | $180 | $280 | $700 |
| Maintenance | $100 | $300 | $1,200 |
| **Total/Year** | **$430** | **$780** | **$3,000** |

### ROI Comparison: NAS vs Cloud-Only

#### Scenario: 10TB backup data, 5-year period

**Cloud-Only (Azure Backup)**:
```
Azure Backup Vault:
- Cool tier: $0.01/GB/month
- 10TB = 10,240GB × $0.01 = $102/month
- Network egress: $0.087/GB (if restore)
- 5-year cost: $102 × 60 = $6,120

Total 5-year: $6,120 + egress fees
```

**NAS + Cloud Hybrid** (Option 1):
```
Initial: $1,425
Annual: $430 × 5 = $2,150
Azure minimal backup: $20/month × 60 = $1,200

Total 5-year: $4,775
Savings: $1,345 (22%)

Bonus: 
- Faster restore (local)
- More control
- No egress fees
```

### Break-Even Analysis

```
Cloud-only monthly cost: $102
NAS initial investment: $1,425
NAS monthly cost: $36

Break-even: $1,425 / ($102 - $36) = 21.6 months

After 22 months, NAS becomes cheaper!
```

### Additional Value (Hard to Quantify)

- ✅ **Faster Recovery**: Local restore in minutes vs hours from cloud
- ✅ **Compliance**: Data sovereignty, on-premise control
- ✅ **Flexibility**: Use for other purposes (file sharing, media server)
- ✅ **No Vendor Lock-in**: Own your infrastructure
- ✅ **Learning**: Valuable IT experience for team

---

## ✅ Deployment Checklist

### Phase 1: Procurement (Week 1)
- [ ] Select NAS model based on budget
- [ ] Purchase hard drives (RAID-compatible)
- [ ] Order UPS for power protection
- [ ] Order network equipment (switch, cables)
- [ ] Order backup server (if needed)

### Phase 2: Setup (Week 2)
- [ ] Install drives in NAS
- [ ] Configure RAID array
- [ ] Setup network (static IP, routing)
- [ ] Create shared folders
- [ ] Configure user permissions
- [ ] Enable snapshots
- [ ] Test NAS performance

### Phase 3: Integration (Week 3)
- [ ] Setup backup server
- [ ] Configure VPN to Azure
- [ ] Mount NAS on backup server
- [ ] Install backup scripts
- [ ] Configure cron jobs / systemd timers
- [ ] Setup monitoring alerts
- [ ] Test backup procedures

### Phase 4: Testing (Week 4)
- [ ] Run full backup test
- [ ] Test restore procedures
- [ ] Verify data integrity (checksums)
- [ ] Test failover scenarios
- [ ] Performance testing
- [ ] Security audit
- [ ] Documentation review

### Phase 5: Production (Week 5+)
- [ ] Enable automated backups
- [ ] Monitor for 1 week
- [ ] Review logs daily
- [ ] Train team members
- [ ] Document procedures
- [ ] Schedule maintenance
- [ ] Establish SLAs

---

## 📚 Additional Resources

### Documentation
- [Synology DSM User Guide](https://www.synology.com/dsm)
- [QNAP QTS Documentation](https://www.qnap.com/qts)
- [TrueNAS Documentation](https://www.truenas.com/docs/)

### Communities
- [r/synology](https://reddit.com/r/synology) - Synology community
- [r/qnap](https://reddit.com/r/qnap) - QNAP community
- [r/datahoarder](https://reddit.com/r/datahoarder) - Storage enthusiasts

### Tools
- [WinSCP](https://winscp.net/) - SFTP/SCP client
- [Rclone](https://rclone.org/) - Cloud sync tool
- [Duplicati](https://www.duplicati.com/) - Backup software
- [Veeam Backup](https://www.veeam.com/) - Enterprise backup

### Security Best Practices
- Regular firmware updates
- Strong passwords + 2FA
- Disable unused services
- Firewall rules
- Encrypted volumes
- Regular security audits

---

## 🆘 Troubleshooting Guide

### Issue 1: NAS Not Accessible

```bash
# Check ping
ping 192.168.1.100

# Check ports
nmap 192.168.1.100

# Check mount
mount | grep nas

# Remount
sudo umount /mnt/nas/backup
sudo mount -a
```

### Issue 2: Slow Backup Speed

```
Possible causes:
1. Network congestion - use QoS
2. Drive degradation - check SMART
3. RAID rebuilding - wait for completion
4. CPU bottleneck - upgrade NAS
5. Compression overhead - disable if not needed
```

### Issue 3: Drive Failure

```
1. NAS will beep continuously
2. Check Stora ge Manager for failed drive
3. Order replacement drive (same model/size)
4. Hot-swap failed drive
5. RAID will auto-rebuild (24-48 hours)
6. Monitor temperature during rebuild
```

### Issue 4: Backup Script Fails

```bash
# Check logs
tail -f /var/log/lms-backup.log
tail -f /var/log/lms-backup-error.log

# Test components individually
pg_dump --version
az --version
df -h /mnt/nas/backup

# Run script in debug mode
bash -x /opt/lms-backup/backup_to_nas.sh
```

---

## 📞 Support

For questions about this NAS setup guide:
- Email: support@yourdomain.com
- Documentation: See AZURE_DEPLOYMENT_GUIDE.md
- Emergency: Contact IT team immediately

---

**Document Version**: 1.0  
**Last Updated**: October 15, 2025  
**Author**: LMS Development Team  
**Related**: AZURE_DEPLOYMENT_GUIDE.md
