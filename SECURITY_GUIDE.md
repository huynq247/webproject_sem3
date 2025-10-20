# 🔒 LMS Microservices - Complete Security Guide

**Document**: Security Implementation Guide  
**Version**: 1.0  
**Date**: October 17, 2025  
**Platform**: Azure Cloud + On-Premise

---

## 📋 Table of Contents

1. [Security Overview](#1-security-overview)
2. [Network Security](#2-network-security)
3. [Identity & Access Management](#3-identity--access-management)
4. [Application Security](#4-application-security)
5. [Data Security](#5-data-security)
6. [API Security](#6-api-security)
7. [Frontend Security](#7-frontend-security)
8. [Secrets Management](#8-secrets-management)
9. [Monitoring & Threat Detection](#9-monitoring--threat-detection)
10. [Compliance & Audit](#10-compliance--audit)
11. [Incident Response](#11-incident-response)
12. [Security Checklist](#12-security-checklist)

---

# 1. Security Overview

## 1.1. Security Layers

```
┌──────────────────────────────────────────────────────────────┐
│                     SECURITY DEFENSE IN DEPTH                 │
├──────────────────────────────────────────────────────────────┤
│  Layer 1: NETWORK SECURITY                                   │
│  ├─ Azure Firewall / NSG                                     │
│  ├─ WAF (Web Application Firewall)                           │
│  ├─ DDoS Protection                                           │
│  └─ VPN / Private Endpoints                                  │
├──────────────────────────────────────────────────────────────┤
│  Layer 2: IDENTITY & ACCESS                                  │
│  ├─ Azure AD / Entra ID                                      │
│  ├─ MFA (Multi-Factor Authentication)                        │
│  ├─ RBAC (Role-Based Access Control)                         │
│  └─ Conditional Access Policies                              │
├──────────────────────────────────────────────────────────────┤
│  Layer 3: APPLICATION SECURITY                               │
│  ├─ Authentication (JWT, OAuth2)                             │
│  ├─ Authorization (Role-based)                               │
│  ├─ Input Validation                                         │
│  ├─ SQL Injection Prevention                                 │
│  ├─ XSS Protection                                            │
│  └─ CSRF Protection                                           │
├──────────────────────────────────────────────────────────────┤
│  Layer 4: API SECURITY                                       │
│  ├─ Rate Limiting                                             │
│  ├─ API Keys / Token                                          │
│  ├─ CORS Configuration                                        │
│  └─ Request Validation                                        │
├──────────────────────────────────────────────────────────────┤
│  Layer 5: DATA SECURITY                                      │
│  ├─ Encryption at Rest (TDE)                                 │
│  ├─ Encryption in Transit (TLS 1.3)                          │
│  ├─ Database Firewall                                         │
│  ├─ Backup Encryption                                         │
│  └─ PII/PCI Data Protection                                  │
├──────────────────────────────────────────────────────────────┤
│  Layer 6: SECRETS MANAGEMENT                                 │
│  ├─ Azure Key Vault                                           │
│  ├─ Managed Identities                                       │
│  ├─ No hardcoded secrets                                     │
│  └─ Secret rotation                                           │
├──────────────────────────────────────────────────────────────┤
│  Layer 7: MONITORING & DETECTION                             │
│  ├─ Azure Defender / Security Center                         │
│  ├─ Application Insights                                     │
│  ├─ Log Analytics                                             │
│  ├─ Security Alerts                                           │
│  └─ Threat Intelligence                                       │
└──────────────────────────────────────────────────────────────┘
```

## 1.2. Security Principles

✅ **Defense in Depth**: Multiple layers of security  
✅ **Least Privilege**: Minimum permissions required  
✅ **Zero Trust**: Never trust, always verify  
✅ **Security by Design**: Built-in from the start  
✅ **Continuous Monitoring**: 24/7 threat detection

---

# 2. Network Security

## 2.1. Network Architecture

```
                        INTERNET
                           │
                           ▼
    ┌──────────────────────────────────────────┐
    │     Azure DDoS Protection Standard       │
    └──────────────────────────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────┐
    │  Azure Firewall + WAF (Web App Firewall) │
    │  - Block malicious IPs                   │
    │  - OWASP Top 10 protection               │
    │  - Rate limiting                         │
    └──────────────────────────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────┐
    │    Application Gateway (Layer 7)         │
    │    - SSL Termination                     │
    │    - URL-based routing                   │
    └──────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
    ┌────────┐        ┌────────┐        ┌────────┐
    │Frontend│        │Backend │        │Database│
    │Subnet  │        │Subnet  │        │Subnet  │
    │        │        │        │        │        │
    │NSG:    │        │NSG:    │        │NSG:    │
    │80,443  │        │8000-04 │        │5432    │
    └────────┘        └────────┘        └────────┘
                                             │
                                             ▼
                                    ┌────────────────┐
                                    │ Private Link   │
                                    │ No public IP   │
                                    └────────────────┘
```

## 2.2. Network Security Group (NSG) Rules

### 2.2.1. Frontend NSG (Restrictive)

```powershell
# Create Frontend NSG with strict rules
az network nsg create \
  --resource-group lms-production-rg \
  --name frontend-nsg-secure \
  --location southeastasia

# INBOUND RULES

# Rule 100: Allow HTTPS from specific countries only
az network nsg rule create \
  --resource-group lms-production-rg \
  --nsg-name frontend-nsg-secure \
  --name Allow-HTTPS-GeoIP \
  --priority 100 \
  --source-address-prefixes Internet \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 443 \
  --access Allow \
  --protocol Tcp \
  --description "Allow HTTPS from allowed countries"

# Rule 110: Allow HTTP for redirect only
az network nsg rule create \
  --resource-group lms-production-rg \
  --nsg-name frontend-nsg-secure \
  --name Allow-HTTP-Redirect \
  --priority 110 \
  --source-address-prefixes Internet \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 80 \
  --access Allow \
  --protocol Tcp \
  --description "Allow HTTP for HTTPS redirect"

# Rule 120: Deny all known malicious IPs
az network nsg rule create \
  --resource-group lms-production-rg \
  --nsg-name frontend-nsg-secure \
  --name Deny-Malicious-IPs \
  --priority 120 \
  --source-address-prefixes "1.2.3.4" "5.6.7.8" \
  --destination-address-prefixes '*' \
  --destination-port-ranges '*' \
  --access Deny \
  --protocol '*' \
  --description "Block known malicious IPs"

# Rule 4096: Deny all other inbound
az network nsg rule create \
  --resource-group lms-production-rg \
  --nsg-name frontend-nsg-secure \
  --name Deny-All-Inbound \
  --priority 4096 \
  --source-address-prefixes '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges '*' \
  --access Deny \
  --protocol '*' \
  --description "Default deny all"
```

### 2.2.2. Backend NSG (Zero Trust)

```powershell
# Create Backend NSG
az network nsg create \
  --resource-group lms-production-rg \
  --name backend-nsg-secure \
  --location southeastasia

# Allow ONLY from Frontend subnet (10.0.1.0/24)
az network nsg rule create \
  --resource-group lms-production-rg \
  --nsg-name backend-nsg-secure \
  --name Allow-From-Frontend-Only \
  --priority 100 \
  --source-address-prefixes 10.0.1.0/24 \
  --destination-address-prefixes '*' \
  --destination-port-ranges 8000-8004 \
  --access Allow \
  --protocol Tcp

# Deny everything else
az network nsg rule create \
  --resource-group lms-production-rg \
  --nsg-name backend-nsg-secure \
  --name Deny-All-Other \
  --priority 4096 \
  --source-address-prefixes '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges '*' \
  --access Deny \
  --protocol '*'
```

### 2.2.3. Database NSG (Maximum Security)

```powershell
# Create Database NSG
az network nsg create \
  --resource-group lms-production-rg \
  --name database-nsg-secure \
  --location southeastasia

# Allow ONLY from Backend subnet
az network nsg rule create \
  --resource-group lms-production-rg \
  --nsg-name database-nsg-secure \
  --name Allow-PostgreSQL-Backend-Only \
  --priority 100 \
  --source-address-prefixes 10.0.2.0/24 \
  --destination-address-prefixes '*' \
  --destination-port-ranges 5432 \
  --access Allow \
  --protocol Tcp

# Allow from VPN Gateway subnet (for admin access)
az network nsg rule create \
  --resource-group lms-production-rg \
  --nsg-name database-nsg-secure \
  --name Allow-PostgreSQL-VPN \
  --priority 110 \
  --source-address-prefixes 10.0.4.0/24 \
  --destination-address-prefixes '*' \
  --destination-port-ranges 5432 \
  --access Allow \
  --protocol Tcp

# Deny all other
az network nsg rule create \
  --resource-group lms-production-rg \
  --nsg-name database-nsg-secure \
  --name Deny-All \
  --priority 4096 \
  --source-address-prefixes '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges '*' \
  --access Deny \
  --protocol '*'
```

## 2.3. Azure Firewall (Optional but Recommended)

```powershell
# Create Azure Firewall (Premium tier for advanced security)
az network firewall create \
  --name lms-firewall \
  --resource-group lms-production-rg \
  --location southeastasia \
  --sku AZFW_VNet \
  --tier Premium

# Create firewall policy
az network firewall policy create \
  --name lms-firewall-policy \
  --resource-group lms-production-rg \
  --sku Premium \
  --threat-intel-mode Alert

# Application rules (allow outbound HTTPS only)
az network firewall policy rule-collection-group create \
  --name DefaultApplicationRuleCollectionGroup \
  --policy-name lms-firewall-policy \
  --resource-group lms-production-rg \
  --priority 300

az network firewall policy rule-collection-group collection add-filter-collection \
  --collection-name Allow-Outbound-HTTPS \
  --rcg-name DefaultApplicationRuleCollectionGroup \
  --policy-name lms-firewall-policy \
  --resource-group lms-production-rg \
  --action Allow \
  --rule-type ApplicationRule \
  --priority 100 \
  --rule-name Allow-HTTPS \
  --target-fqdns "*.azure.com" "*.microsoft.com" "*.github.com" \
  --source-addresses 10.0.0.0/16 \
  --protocols Https=443
```

## 2.4. DDoS Protection

```powershell
# Enable DDoS Protection Standard
az network ddos-protection create \
  --resource-group lms-production-rg \
  --name lms-ddos-protection \
  --location southeastasia

# Associate with VNET
az network vnet update \
  --resource-group lms-production-rg \
  --name lms-vnet \
  --ddos-protection true \
  --ddos-protection-plan /subscriptions/YOUR-SUBSCRIPTION-ID/resourceGroups/lms-production-rg/providers/Microsoft.Network/ddosProtectionPlans/lms-ddos-protection
```

**Cost**: ~$3,000/month (expensive but critical for production)

---

# 3. Identity & Access Management

## 3.1. Azure AD (Entra ID) Integration

### 3.1.1. Register Application in Azure AD

```powershell
# Register LMS app in Azure AD
az ad app create \
  --display-name "LMS Microservices" \
  --sign-in-audience AzureADMyOrg \
  --web-redirect-uris "https://student.lms.yourdomain.com/auth/callback" \
                       "https://teacher.lms.yourdomain.com/auth/callback" \
                       "https://admin.lms.yourdomain.com/auth/callback"

# Get Application ID
$appId = az ad app list --display-name "LMS Microservices" --query "[0].appId" -o tsv

# Create service principal
az ad sp create --id $appId

# Create client secret
az ad app credential reset --id $appId --display-name "LMS-Secret"
```

### 3.1.2. Configure App Roles

Create file: `azure-ad-app-roles.json`

```json
{
  "appRoles": [
    {
      "allowedMemberTypes": ["User"],
      "description": "Students can view courses and submit assignments",
      "displayName": "Student",
      "id": "8e3e9d1a-3b4c-4d5e-8f9a-1b2c3d4e5f6a",
      "isEnabled": true,
      "value": "Student"
    },
    {
      "allowedMemberTypes": ["User"],
      "description": "Teachers can create courses and grade assignments",
      "displayName": "Teacher",
      "id": "7d2c8b0a-2a3b-3c4d-7e8f-0a1b2c3d4e5f",
      "isEnabled": true,
      "value": "Teacher"
    },
    {
      "allowedMemberTypes": ["User"],
      "description": "Admins have full system access",
      "displayName": "Admin",
      "id": "6c1b7a09-1a2b-2c3d-6e7f-9a0b1c2d3e4f",
      "isEnabled": true,
      "value": "Admin"
    }
  ]
}
```

Apply roles:

```powershell
az ad app update --id $appId --app-roles @azure-ad-app-roles.json
```

## 3.2. Multi-Factor Authentication (MFA)

### 3.2.1. Enable MFA for Admin Users

```
1. Go to: Azure Portal → Azure AD → Security → MFA
2. Click: Additional cloud-based MFA settings
3. Configure:
   ☑ Text message to phone
   ☑ Mobile app notification
   ☑ Mobile app verification code
4. Save

5. Create Conditional Access Policy:
   - Name: "Require MFA for Admins"
   - Users: Include → Directory roles → Global Administrator, Application Administrator
   - Cloud apps: All cloud apps
   - Conditions: Any location
   - Grant: Require multi-factor authentication
   - Enable policy: On
```

### 3.2.2. Conditional Access Policy (Code)

```powershell
# Requires Azure AD Premium P1/P2

# Create Conditional Access Policy via Azure CLI (Graph API)
# Note: This requires additional permissions

# Policy: Require MFA for all admin portals
$policyJson = @"
{
  "displayName": "LMS - Require MFA for Admin Portal",
  "state": "enabled",
  "conditions": {
    "applications": {
      "includeApplications": ["$appId"]
    },
    "users": {
      "includeRoles": ["Admin"]
    }
  },
  "grantControls": {
    "operator": "OR",
    "builtInControls": ["mfa"]
  }
}
"@

# Apply via Microsoft Graph API or Azure Portal
```

## 3.3. Role-Based Access Control (RBAC)

### 3.3.1. Azure RBAC for Infrastructure

```powershell
# Create custom role for LMS Operator
az role definition create --role-definition @- <<EOF
{
  "Name": "LMS Operator",
  "Description": "Can manage LMS App Services and databases",
  "Actions": [
    "Microsoft.Web/sites/read",
    "Microsoft.Web/sites/restart/action",
    "Microsoft.Web/sites/config/read",
    "Microsoft.DBforPostgreSQL/flexibleServers/read",
    "Microsoft.Storage/storageAccounts/read",
    "Microsoft.Insights/*/read"
  ],
  "NotActions": [
    "Microsoft.Web/sites/delete",
    "Microsoft.DBforPostgreSQL/flexibleServers/delete"
  ],
  "AssignableScopes": [
    "/subscriptions/YOUR-SUBSCRIPTION-ID/resourceGroups/lms-production-rg"
  ]
}
EOF

# Assign role to user
az role assignment create \
  --role "LMS Operator" \
  --assignee user@yourdomain.com \
  --scope /subscriptions/YOUR-SUBSCRIPTION-ID/resourceGroups/lms-production-rg
```

### 3.3.2. Application RBAC (In Code)

**Backend: `backend/common/rbac.py`**

```python
from functools import wraps
from flask import request, jsonify
import jwt

# Role hierarchy
ROLES = {
    "Admin": 3,
    "Teacher": 2,
    "Student": 1
}

def require_role(min_role):
    """Decorator to check if user has required role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = request.headers.get('Authorization', '').replace('Bearer ', '')
            
            if not token:
                return jsonify({"error": "No token provided"}), 401
            
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                user_role = payload.get('role')
                
                if ROLES.get(user_role, 0) < ROLES.get(min_role, 99):
                    return jsonify({"error": "Insufficient permissions"}), 403
                
                return f(*args, **kwargs)
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token"}), 401
        
        return decorated_function
    return decorator

# Usage examples:
@app.route('/api/users', methods=['GET'])
@require_role('Admin')  # Only admins
def list_users():
    pass

@app.route('/api/courses/<course_id>/grades', methods=['POST'])
@require_role('Teacher')  # Teachers and Admins
def submit_grade(course_id):
    pass

@app.route('/api/courses', methods=['GET'])
@require_role('Student')  # All authenticated users
def list_courses():
    pass
```

---

# 4. Application Security

## 4.1. Authentication (JWT)

### 4.1.1. Secure JWT Implementation

**Backend: `backend/user_service/auth.py`**

```python
import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
import secrets

# Secure configuration
JWT_SECRET = os.getenv('JWT_SECRET')  # From Azure Key Vault
JWT_ALGORITHM = 'HS256'
JWT_EXP_DELTA_SECONDS = 3600  # 1 hour
REFRESH_TOKEN_EXP_DAYS = 30

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt(rounds=12)  # 12 rounds = secure
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_access_token(user_id: int, email: str, role: str) -> str:
    """Generate JWT access token"""
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.utcnow() + timedelta(seconds=JWT_EXP_DELTA_SECONDS),
        'iat': datetime.utcnow(),
        'jti': secrets.token_urlsafe(16)  # JWT ID for revocation
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def generate_refresh_token(user_id: int) -> str:
    """Generate refresh token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXP_DAYS),
        'type': 'refresh'
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Check if token is revoked (store revoked tokens in Redis)
        if is_token_revoked(payload.get('jti')):
            raise jwt.InvalidTokenError("Token has been revoked")
        
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Invalid token: {str(e)}")

def token_required(f):
    """Decorator to protect routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            payload = verify_token(token)
            request.user = payload  # Attach user to request
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({'error': str(e)}), 401
    
    return decorated

# Token revocation (store in Redis)
import redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)

def revoke_token(jti: str, exp: int):
    """Revoke token by adding to blacklist"""
    ttl = exp - int(datetime.utcnow().timestamp())
    if ttl > 0:
        redis_client.setex(f"revoked:{jti}", ttl, "1")

def is_token_revoked(jti: str) -> bool:
    """Check if token is revoked"""
    return redis_client.exists(f"revoked:{jti}") > 0
```

### 4.1.2. Login Endpoint with Rate Limiting

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")  # Max 5 login attempts per minute
def login():
    data = request.get_json()
    
    # Input validation
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    email = data['email'].lower().strip()
    password = data['password']
    
    # Get user from database
    user = User.query.filter_by(email=email).first()
    
    if not user or not verify_password(password, user.password_hash):
        # Log failed attempt
        log_failed_login(email, get_remote_address())
        
        # Generic error message (don't reveal if email exists)
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Check if account is locked
    if user.is_locked:
        return jsonify({'error': 'Account is locked. Contact administrator'}), 403
    
    # Generate tokens
    access_token = generate_access_token(user.id, user.email, user.role)
    refresh_token = generate_refresh_token(user.id)
    
    # Log successful login
    log_successful_login(user.id, get_remote_address())
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expires_in': JWT_EXP_DELTA_SECONDS,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role
        }
    }), 200

def log_failed_login(email: str, ip: str):
    """Log failed login attempts and lock account after 5 attempts"""
    key = f"failed_login:{email}"
    attempts = redis_client.incr(key)
    redis_client.expire(key, 900)  # 15 minutes
    
    if attempts >= 5:
        user = User.query.filter_by(email=email).first()
        if user:
            user.is_locked = True
            db.session.commit()
            send_security_alert(user.email, "Account locked due to multiple failed login attempts")
```

## 4.2. SQL Injection Prevention

### 4.2.1. Use Parameterized Queries (SQLAlchemy ORM)

```python
from sqlalchemy import text

# ❌ VULNERABLE - Never do this!
def get_user_vulnerable(email):
    query = f"SELECT * FROM users WHERE email = '{email}'"  # SQL Injection!
    return db.session.execute(query)

# ✅ SECURE - Use ORM
def get_user_secure(email):
    return User.query.filter_by(email=email).first()

# ✅ SECURE - Use parameterized queries
def get_user_secure_raw(email):
    query = text("SELECT * FROM users WHERE email = :email")
    return db.session.execute(query, {"email": email})

# ✅ SECURE - Input validation + ORM
import re

def is_valid_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def get_user_extra_secure(email):
    if not is_valid_email(email):
        raise ValueError("Invalid email format")
    
    return User.query.filter_by(email=email).first()
```

## 4.3. XSS (Cross-Site Scripting) Prevention

### 4.3.1. Backend Input Sanitization

```python
import bleach
from markupsafe import escape

# Allowed HTML tags for rich text (course descriptions)
ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a']
ALLOWED_ATTRIBUTES = {'a': ['href', 'title']}

def sanitize_html(content: str) -> str:
    """Sanitize HTML content to prevent XSS"""
    return bleach.clean(
        content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )

def sanitize_text(text: str) -> str:
    """Escape all HTML entities in plain text"""
    return escape(text)

# Usage:
@app.route('/api/courses', methods=['POST'])
@token_required
def create_course():
    data = request.get_json()
    
    course = Course(
        title=sanitize_text(data['title']),  # Plain text
        description=sanitize_html(data['description']),  # Rich text
        instructor_id=request.user['user_id']
    )
    
    db.session.add(course)
    db.session.commit()
    
    return jsonify(course.to_dict()), 201
```

### 4.3.2. Frontend XSS Prevention (React)

```javascript
// ✅ React automatically escapes by default
function CourseTitle({ title }) {
  return <h1>{title}</h1>;  // Automatically escaped
}

// ✅ For HTML content, use DOMPurify
import DOMPurify from 'dompurify';

function CourseDescription({ description }) {
  const sanitizedHTML = DOMPurify.sanitize(description);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
  );
}

// ❌ NEVER do this without sanitization!
function UnsafeComponent({ content }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;  // XSS vulnerability!
}
```

## 4.4. CSRF (Cross-Site Request Forgery) Protection

### 4.4.1. CSRF Token Implementation

```python
from flask_wtf.csrf import CSRFProtect, generate_csrf

csrf = CSRFProtect(app)

# Exempt API endpoints (use JWT instead)
csrf.exempt('/api/*')

# For traditional forms:
@app.route('/csrf-token')
def get_csrf_token():
    token = generate_csrf()
    return jsonify({'csrf_token': token})

# Frontend sends token in header:
# X-CSRFToken: <token>
```

### 4.4.2. SameSite Cookie Configuration

```python
# Configure session cookies
app.config.update(
    SESSION_COOKIE_SECURE=True,  # HTTPS only
    SESSION_COOKIE_HTTPONLY=True,  # No JavaScript access
    SESSION_COOKIE_SAMESITE='Lax',  # CSRF protection
    PERMANENT_SESSION_LIFETIME=timedelta(hours=24)
)
```

## 4.5. Input Validation

### 4.5.1. Comprehensive Validation

```python
from pydantic import BaseModel, EmailStr, validator, constr
from typing import Optional
import re

class UserRegistration(BaseModel):
    email: EmailStr
    password: constr(min_length=8, max_length=128)
    name: constr(min_length=2, max_length=100)
    role: str
    
    @validator('password')
    def password_strength(cls, v):
        """Enforce strong password policy"""
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain special character')
        return v
    
    @validator('role')
    def valid_role(cls, v):
        allowed_roles = ['Student', 'Teacher', 'Admin']
        if v not in allowed_roles:
            raise ValueError(f'Role must be one of {allowed_roles}')
        return v
    
    @validator('name')
    def sanitize_name(cls, v):
        # Remove any HTML tags
        return bleach.clean(v, tags=[], strip=True)

# Usage:
@app.route('/api/users/register', methods=['POST'])
def register_user():
    try:
        data = UserRegistration(**request.get_json())
        
        # Create user
        user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            name=data.name,
            role=data.role
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'message': 'User created successfully'}), 201
    
    except ValidationError as e:
        return jsonify({'errors': e.errors()}), 400
```

---

# 5. Data Security

## 5.1. Database Encryption

### 5.1.1. Enable Transparent Data Encryption (TDE)

```powershell
# TDE is enabled by default on Azure PostgreSQL Flexible Server
# Verify:
az postgres flexible-server show \
  --name lms-postgres-server \
  --resource-group lms-production-rg \
  --query "storage.storageSizeGb"

# Data is automatically encrypted at rest with AES-256
```

### 5.1.2. Application-Level Encryption (PII Data)

```python
from cryptography.fernet import Fernet
import base64
import os

class FieldEncryption:
    def __init__(self):
        # Get encryption key from Azure Key Vault
        key = os.getenv('ENCRYPTION_KEY')  # 32-byte key
        self.fernet = Fernet(base64.urlsafe_b64encode(key.encode()[:32]))
    
    def encrypt(self, plaintext: str) -> str:
        """Encrypt sensitive data"""
        if not plaintext:
            return None
        return self.fernet.encrypt(plaintext.encode()).decode()
    
    def decrypt(self, ciphertext: str) -> str:
        """Decrypt sensitive data"""
        if not ciphertext:
            return None
        return self.fernet.decrypt(ciphertext.encode()).decode()

# Usage in models:
from sqlalchemy.types import TypeDecorator, String

class EncryptedString(TypeDecorator):
    impl = String
    encryption = FieldEncryption()
    
    def process_bind_param(self, value, dialect):
        """Encrypt on write"""
        return self.encryption.encrypt(value) if value else None
    
    def process_result_value(self, value, dialect):
        """Decrypt on read"""
        return self.encryption.decrypt(value) if value else None

# Model with encrypted fields:
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(EncryptedString(255))  # Encrypted
    ssn = db.Column(EncryptedString(255))    # Encrypted (if applicable)
    password_hash = db.Column(db.String(255), nullable=False)
```

## 5.2. Database Access Control

### 5.2.1. Principle of Least Privilege

```sql
-- Create read-only user for reporting
CREATE USER lms_readonly WITH PASSWORD 'STRONG_PASSWORD_HERE';
GRANT CONNECT ON DATABASE lms_production TO lms_readonly;
GRANT USAGE ON SCHEMA public TO lms_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO lms_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO lms_readonly;

-- Create app user with limited permissions
CREATE USER lms_app WITH PASSWORD 'STRONG_PASSWORD_HERE';
GRANT CONNECT ON DATABASE lms_production TO lms_app;
GRANT USAGE, CREATE ON SCHEMA public TO lms_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lms_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lms_app;

-- Deny DROP/TRUNCATE for app user
REVOKE DROP ON SCHEMA public FROM lms_app;

-- Create admin user (for migrations only)
CREATE USER lms_admin WITH PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE lms_production TO lms_admin;
```

### 5.2.2. Row-Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_isolation_policy ON users
    FOR SELECT
    USING (id = current_setting('app.current_user_id')::integer);

-- Policy: Students can only see their own assignments
CREATE POLICY student_assignment_policy ON student_assignments
    FOR ALL
    USING (
        student_id = current_setting('app.current_user_id')::integer
        OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('app.current_user_id')::integer 
            AND role IN ('Teacher', 'Admin')
        )
    );

-- Set user ID in connection
-- In Python app:
def set_current_user_id(user_id):
    db.session.execute(f"SET app.current_user_id = {user_id}")
```

## 5.3. Backup Encryption

```powershell
# Backups are automatically encrypted in Azure
# For NAS backups, encrypt before transfer:

# Create backup script with encryption: backup-encrypted.sh
cat > /volume1/scripts/backup-encrypted.sh << 'EOF'
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/volume1/azure-backups/database"
ENCRYPTION_KEY_FILE="/volume1/keys/backup.key"

# Create encrypted backup
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h lms-postgres-server.postgres.database.azure.com \
  -U lmsadmin \
  -d lms_production \
  | gzip \
  | openssl enc -aes-256-cbc -salt -pbkdf2 -pass file:$ENCRYPTION_KEY_FILE \
  > "$BACKUP_DIR/lms_backup_$DATE.sql.gz.enc"

# Verify encryption
if [ $? -eq 0 ]; then
    echo "Encrypted backup created: lms_backup_$DATE.sql.gz.enc"
else
    echo "Backup failed!"
    exit 1
fi

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.enc" -mtime +30 -delete
EOF

chmod +x /volume1/scripts/backup-encrypted.sh

# Decrypt backup (when needed):
# openssl enc -aes-256-cbc -d -pbkdf2 -pass file:/volume1/keys/backup.key \
#   -in backup.sql.gz.enc | gunzip > backup.sql
```

---

# 6. API Security

## 6.1. Rate Limiting

### 6.1.1. Global Rate Limiting

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    storage_uri="redis://localhost:6379",
    default_limits=["1000 per day", "100 per hour"]
)

# Per-endpoint limits:
@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    pass

@app.route('/api/courses', methods=['GET'])
@limiter.limit("100 per minute")
def list_courses():
    pass

@app.route('/api/assignments/submit', methods=['POST'])
@limiter.limit("10 per hour")  # Prevent spam submissions
def submit_assignment():
    pass
```

### 6.1.2. Azure API Management (Advanced)

```powershell
# Create API Management instance
az apim create \
  --name lms-apim \
  --resource-group lms-production-rg \
  --location southeastasia \
  --publisher-name "LMS Team" \
  --publisher-email "admin@lms.yourdomain.com" \
  --sku-name Developer

# Add rate limit policy
# In Azure Portal → API Management → APIs → Add policy:
```

```xml
<policies>
    <inbound>
        <rate-limit-by-key calls="100" renewal-period="60" 
                           counter-key="@(context.Request.IpAddress)" />
        <quota-by-key calls="10000" renewal-period="86400" 
                      counter-key="@(context.Subscription.Id)" />
        <cors>
            <allowed-origins>
                <origin>https://student.lms.yourdomain.com</origin>
                <origin>https://teacher.lms.yourdomain.com</origin>
                <origin>https://admin.lms.yourdomain.com</origin>
            </allowed-origins>
            <allowed-methods>
                <method>GET</method>
                <method>POST</method>
                <method>PUT</method>
                <method>DELETE</method>
            </allowed-methods>
            <allowed-headers>
                <header>Content-Type</header>
                <header>Authorization</header>
            </allowed-headers>
        </cors>
    </inbound>
</policies>
```

## 6.2. API Authentication

### 6.2.1. API Key for Service-to-Service Communication

```python
import secrets
import hashlib

def generate_api_key() -> tuple[str, str]:
    """Generate API key and its hash"""
    api_key = secrets.token_urlsafe(32)
    api_key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    return api_key, api_key_hash

# Store hash in database, give key to client
# Client sends: X-API-Key: <api_key>

def verify_api_key(api_key: str) -> bool:
    """Verify API key"""
    api_key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    stored_key = APIKey.query.filter_by(key_hash=api_key_hash, is_active=True).first()
    
    if stored_key:
        # Log usage
        stored_key.last_used = datetime.utcnow()
        stored_key.usage_count += 1
        db.session.commit()
        return True
    
    return False

# Decorator for API key authentication
def api_key_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key or not verify_api_key(api_key):
            return jsonify({'error': 'Invalid API key'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

# Usage:
@app.route('/api/internal/sync', methods=['POST'])
@api_key_required  # Service-to-service only
def sync_data():
    pass
```

## 6.3. CORS Configuration

### 6.3.1. Secure CORS Setup

```python
from flask_cors import CORS

# ❌ INSECURE - Never do this in production!
CORS(app)  # Allows all origins

# ✅ SECURE - Whitelist specific origins
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://student.lms.yourdomain.com",
            "https://teacher.lms.yourdomain.com",
            "https://admin.lms.yourdomain.com"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["X-Total-Count"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# For development only:
if app.config['ENV'] == 'development':
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
```

---

# 7. Frontend Security

## 7.1. Content Security Policy (CSP)

### 7.1.1. Configure CSP Headers

**Backend: Add CSP headers to all responses**

```python
from flask import Flask, make_response

@app.after_request
def set_security_headers(response):
    """Add security headers to all responses"""
    
    # Content Security Policy
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https://lms-api-gateway.azurewebsites.net https://*.applicationinsights.azure.com; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self';"
    )
    response.headers['Content-Security-Policy'] = csp
    
    # X-Frame-Options (prevent clickjacking)
    response.headers['X-Frame-Options'] = 'DENY'
    
    # X-Content-Type-Options (prevent MIME sniffing)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    # X-XSS-Protection
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Strict-Transport-Security (HSTS)
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
    
    # Referrer-Policy
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # Permissions-Policy (formerly Feature-Policy)
    response.headers['Permissions-Policy'] = (
        'geolocation=(), '
        'microphone=(), '
        'camera=(), '
        'payment=(), '
        'usb=(), '
        'magnetometer=(), '
        'gyroscope=(), '
        'accelerometer=()'
    )
    
    return response
```

### 7.1.2. Configure CSP in Azure Static Web Apps

Create file: `frontend/student-portal/public/staticwebapp.config.json`

```json
{
  "globalHeaders": {
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://lms-api-gateway.azurewebsites.net",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
  },
  "routes": [
    {
      "route": "/api/*",
      "rewrite": "https://lms-api-gateway.azurewebsites.net/api/*"
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
  }
}
```

## 7.2. Secure State Management

### 7.2.1. Secure Token Storage (React)

**❌ INSECURE - Never store in localStorage**

```javascript
// DON'T DO THIS!
localStorage.setItem('access_token', token);  // Vulnerable to XSS
```

**✅ SECURE - Use httpOnly cookies or sessionStorage with caution**

```javascript
// frontend/src/services/authService.js
class AuthService {
  constructor() {
    this.tokenKey = '__lms_token__';
    this.refreshTokenKey = '__lms_refresh__';
  }

  // Store in memory (best for sensitive data)
  #accessToken = null;
  
  setTokens(accessToken, refreshToken) {
    // Access token in memory only (lost on refresh - that's OK, use refresh token)
    this.#accessToken = accessToken;
    
    // Refresh token in httpOnly cookie (set by backend)
    // OR in sessionStorage as fallback (cleared on tab close)
    sessionStorage.setItem(this.refreshTokenKey, refreshToken);
  }
  
  getAccessToken() {
    return this.#accessToken;
  }
  
  getRefreshToken() {
    return sessionStorage.getItem(this.refreshTokenKey);
  }
  
  clearTokens() {
    this.#accessToken = null;
    sessionStorage.removeItem(this.refreshTokenKey);
  }
  
  isAuthenticated() {
    return this.#accessToken !== null;
  }
  
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      this.setTokens(data.access_token, data.refresh_token);
      
      return data.access_token;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }
}

export default new AuthService();
```

### 7.2.2. Axios Interceptor with Auto Token Refresh

```javascript
// frontend/src/services/apiClient.js
import axios from 'axios';
import authService from './authService';

const apiClient = axios.create({
  baseURL: 'https://lms-api-gateway.azurewebsites.net',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add token
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const newToken = await authService.refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

## 7.3. Secure Component Practices

### 7.3.1. Protected Routes

```javascript
// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();
  
  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // User doesn't have required role
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}

// Usage:
// <ProtectedRoute allowedRoles={['Admin']}>
//   <AdminDashboard />
// </ProtectedRoute>

export default ProtectedRoute;
```

### 7.3.2. Secure File Upload Component

```javascript
// frontend/src/components/SecureFileUpload.jsx
import React, { useState } from 'react';
import apiClient from '../services/apiClient';

function SecureFileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Allowed file types
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];
  
  // Max file size: 10MB
  const MAX_SIZE = 10 * 1024 * 1024;
  
  const validateFile = (file) => {
    if (!file) {
      return 'Please select a file';
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG';
    }
    
    if (file.size > MAX_SIZE) {
      return 'File too large. Maximum size: 10MB';
    }
    
    // Check file extension (defense in depth)
    const ext = file.name.split('.').pop().toLowerCase();
    const allowedExts = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
    if (!allowedExts.includes(ext)) {
      return 'Invalid file extension';
    }
    
    return null;
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const validationError = validateFile(selectedFile);
    
    if (validationError) {
      setError(validationError);
      setFile(null);
    } else {
      setError('');
      setFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError('');
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload with progress tracking
      const response = await apiClient.post('/api/assignments/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });
      
      onUploadSuccess(response.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        disabled={uploading}
      />
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {file && (
        <div>
          <p>Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
    </div>
  );
}

export default SecureFileUpload;
```

### 7.3.3. Prevent Sensitive Data Exposure in DevTools

```javascript
// frontend/src/utils/logger.js
class SecureLogger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }
  
  log(...args) {
    if (!this.isProduction) {
      console.log(...args);
    }
  }
  
  error(...args) {
    // Always log errors, but sanitize in production
    if (this.isProduction) {
      // Don't expose sensitive data
      console.error('An error occurred. Check application logs.');
    } else {
      console.error(...args);
    }
  }
  
  // Never log sensitive data
  sanitize(data) {
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'ssn'];
    
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    const sanitized = { ...data };
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '***REDACTED***';
      }
    });
    
    return sanitized;
  }
}

export default new SecureLogger();
```

## 7.4. Dependency Security

### 7.4.1. Regular Dependency Audits

```bash
# Run security audit
cd frontend/student-portal
npm audit

# Fix vulnerabilities
npm audit fix

# For breaking changes
npm audit fix --force

# Install npm-check-updates
npm install -g npm-check-updates

# Check outdated packages
ncu

# Update packages
ncu -u
npm install
```

### 7.4.2. Use Snyk for Continuous Monitoring

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor project (sends to Snyk dashboard)
snyk monitor

# Fix vulnerabilities
snyk fix
```

### 7.4.3. Add Security Check to CI/CD

```yaml
# .github/workflows/frontend-deploy.yml
name: Frontend Security Check

on: [push, pull_request]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    
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
    
    - name: Run npm audit
      run: |
        cd frontend/student-portal
        npm audit --audit-level=high
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high
```

---

# 8. Secrets Management

## 8.1. Azure Key Vault Integration

### 8.1.1. Create and Configure Key Vault

```powershell
# Create Key Vault
az keyvault create \
  --name lms-keyvault-prod \
  --resource-group lms-production-rg \
  --location southeastasia \
  --enable-soft-delete true \
  --soft-delete-retention-days 90 \
  --enable-purge-protection true \
  --enabled-for-deployment false \
  --enabled-for-disk-encryption false \
  --enabled-for-template-deployment false

# Enable advanced access policies
az keyvault update \
  --name lms-keyvault-prod \
  --resource-group lms-production-rg \
  --enabled-for-deployment false

# Set network rules (deny public access)
az keyvault network-rule add \
  --name lms-keyvault-prod \
  --resource-group lms-production-rg \
  --vnet-name lms-vnet \
  --subnet backend-subnet

# Update default action to Deny
az keyvault update \
  --name lms-keyvault-prod \
  --resource-group lms-production-rg \
  --default-action Deny
```

### 8.1.2. Store Secrets in Key Vault

```powershell
# Database password
az keyvault secret set \
  --vault-name lms-keyvault-prod \
  --name DatabasePassword \
  --value "YOUR_STRONG_PASSWORD_HERE" \
  --expires (Get-Date).AddYears(1).ToString("yyyy-MM-ddTHH:mm:ssZ")

# JWT secret
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
az keyvault secret set \
  --vault-name lms-keyvault-prod \
  --name JWTSecret \
  --value $jwtSecret

# Database connection string
$dbConnStr = "postgresql://lmsadmin@lms-postgres-server:PASSWORD@lms-postgres-server.postgres.database.azure.com:5432/lms_production?sslmode=require"
az keyvault secret set \
  --vault-name lms-keyvault-prod \
  --name DatabaseConnectionString \
  --value $dbConnStr

# Storage account key
$storageKey = az storage account keys list \
  --account-name lmsstorageaccount001 \
  --resource-group lms-production-rg \
  --query "[0].value" -o tsv

az keyvault secret set \
  --vault-name lms-keyvault-prod \
  --name StorageAccountKey \
  --value $storageKey

# Encryption key for PII data
$encryptionKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
az keyvault secret set \
  --vault-name lms-keyvault-prod \
  --name EncryptionKey \
  --value $encryptionKey

# Azure AD client secret
az keyvault secret set \
  --vault-name lms-keyvault-prod \
  --name AzureADClientSecret \
  --value "YOUR_AZURE_AD_CLIENT_SECRET"
```

### 8.1.3. Grant Access to App Services (Managed Identity)

```powershell
# Enable system-assigned managed identity for each App Service
$appServices = @(
    "lms-api-gateway",
    "lms-user-service",
    "lms-content-service",
    "lms-assignment-service"
)

foreach ($app in $appServices) {
    Write-Host "Enabling managed identity for $app..."
    
    # Enable managed identity
    az webapp identity assign \
      --name $app \
      --resource-group lms-production-rg
    
    # Get the principal ID
    $principalId = az webapp identity show \
      --name $app \
      --resource-group lms-production-rg \
      --query principalId -o tsv
    
    # Grant Key Vault access
    az keyvault set-policy \
      --name lms-keyvault-prod \
      --object-id $principalId \
      --secret-permissions get list
    
    Write-Host "✅ $app can now access Key Vault"
}
```

### 8.1.4. Use Secrets in App Service Configuration

```powershell
# Reference Key Vault secrets in App Service settings
az webapp config appsettings set \
  --name lms-api-gateway \
  --resource-group lms-production-rg \
  --settings \
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://lms-keyvault-prod.vault.azure.net/secrets/DatabaseConnectionString/)" \
    JWT_SECRET="@Microsoft.KeyVault(SecretUri=https://lms-keyvault-prod.vault.azure.net/secrets/JWTSecret/)" \
    ENCRYPTION_KEY="@Microsoft.KeyVault(SecretUri=https://lms-keyvault-prod.vault.azure.net/secrets/EncryptionKey/)" \
    STORAGE_ACCOUNT_KEY="@Microsoft.KeyVault(SecretUri=https://lms-keyvault-prod.vault.azure.net/secrets/StorageAccountKey/)"
```

## 8.2. Python Code to Access Key Vault

### 8.2.1. Install Azure SDK

```bash
pip install azure-identity azure-keyvault-secrets
```

### 8.2.2. Access Secrets from Code

```python
# backend/common/secrets_manager.py
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
import os
from functools import lru_cache

class SecretsManager:
    def __init__(self):
        # In Azure App Service, DefaultAzureCredential automatically uses Managed Identity
        self.credential = DefaultAzureCredential()
        self.vault_url = os.getenv('KEY_VAULT_URL', 'https://lms-keyvault-prod.vault.azure.net')
        self.client = SecretClient(vault_url=self.vault_url, credential=self.credential)
    
    @lru_cache(maxsize=128)
    def get_secret(self, secret_name: str) -> str:
        """Get secret from Key Vault (cached)"""
        try:
            secret = self.client.get_secret(secret_name)
            return secret.value
        except Exception as e:
            print(f"Error retrieving secret {secret_name}: {e}")
            raise
    
    def list_secrets(self):
        """List all secret names (not values)"""
        return [secret.name for secret in self.client.list_properties_of_secrets()]
    
    def set_secret(self, secret_name: str, secret_value: str):
        """Set a secret (admin only)"""
        self.client.set_secret(secret_name, secret_value)

# Singleton instance
secrets_manager = SecretsManager()

# Usage in application:
# from common.secrets_manager import secrets_manager
# 
# db_password = secrets_manager.get_secret('DatabasePassword')
# jwt_secret = secrets_manager.get_secret('JWTSecret')
```

### 8.2.3. Update Application Configuration

```python
# backend/gateway_service/config.py
import os
from common.secrets_manager import secrets_manager

class Config:
    # Environment
    ENV = os.getenv('ENVIRONMENT', 'development')
    DEBUG = ENV == 'development'
    
    # For local development, use env vars
    # For Azure, use Key Vault
    if ENV == 'production':
        DATABASE_URL = secrets_manager.get_secret('DatabaseConnectionString')
        JWT_SECRET = secrets_manager.get_secret('JWTSecret')
        ENCRYPTION_KEY = secrets_manager.get_secret('EncryptionKey')
        AZURE_STORAGE_KEY = secrets_manager.get_secret('StorageAccountKey')
    else:
        DATABASE_URL = os.getenv('DATABASE_URL')
        JWT_SECRET = os.getenv('JWT_SECRET', 'dev-secret-key')
        ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', 'dev-encryption-key')
        AZURE_STORAGE_KEY = os.getenv('AZURE_STORAGE_KEY')
    
    # Application settings
    SECRET_KEY = JWT_SECRET
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
```

## 8.3. Secret Rotation

### 8.3.1. Automated Secret Rotation Script

Create file: `scripts/security/rotate-secrets.ps1`

```powershell
# Rotate secrets in Azure Key Vault
param(
    [Parameter(Mandatory=$true)]
    [string]$VaultName = "lms-keyvault-prod",
    
    [Parameter(Mandatory=$true)]
    [ValidateSet('DatabasePassword', 'JWTSecret', 'EncryptionKey', 'All')]
    [string]$SecretToRotate
)

function New-StrongPassword {
    param([int]$Length = 32)
    
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

function Rotate-DatabasePassword {
    Write-Host "🔄 Rotating Database Password..." -ForegroundColor Yellow
    
    # Generate new password
    $newPassword = New-StrongPassword -Length 32
    
    # Update in Key Vault
    az keyvault secret set `
        --vault-name $VaultName `
        --name DatabasePassword `
        --value $newPassword
    
    # Update PostgreSQL password
    az postgres flexible-server update `
        --resource-group lms-production-rg `
        --name lms-postgres-server `
        --admin-password $newPassword
    
    # Restart App Services to pick up new password
    $appServices = @("lms-api-gateway", "lms-user-service", "lms-content-service", "lms-assignment-service")
    foreach ($app in $appServices) {
        Write-Host "Restarting $app..."
        az webapp restart --name $app --resource-group lms-production-rg
    }
    
    Write-Host "✅ Database password rotated successfully" -ForegroundColor Green
}

function Rotate-JWTSecret {
    Write-Host "🔄 Rotating JWT Secret..." -ForegroundColor Yellow
    Write-Host "⚠️  WARNING: This will invalidate all existing tokens!" -ForegroundColor Red
    
    $confirmation = Read-Host "Continue? (yes/no)"
    if ($confirmation -ne "yes") {
        Write-Host "Cancelled." -ForegroundColor Yellow
        return
    }
    
    # Generate new JWT secret
    $newSecret = New-StrongPassword -Length 64
    
    # Update in Key Vault
    az keyvault secret set `
        --vault-name $VaultName `
        --name JWTSecret `
        --value $newSecret
    
    # Restart services
    $appServices = @("lms-api-gateway", "lms-user-service")
    foreach ($app in $appServices) {
        az webapp restart --name $app --resource-group lms-production-rg
    }
    
    Write-Host "✅ JWT secret rotated successfully" -ForegroundColor Green
    Write-Host "⚠️  All users must re-authenticate" -ForegroundColor Yellow
}

function Rotate-EncryptionKey {
    Write-Host "🔄 Rotating Encryption Key..." -ForegroundColor Yellow
    Write-Host "⚠️  WARNING: Requires re-encryption of all encrypted data!" -ForegroundColor Red
    
    # This is complex - requires:
    # 1. Decrypt all encrypted fields with old key
    # 2. Update key in Key Vault
    # 3. Re-encrypt all fields with new key
    
    Write-Host "❌ Encryption key rotation requires maintenance window and data migration" -ForegroundColor Red
    Write-Host "Please contact DevOps team for scheduled rotation" -ForegroundColor Yellow
}

# Main execution
switch ($SecretToRotate) {
    'DatabasePassword' { Rotate-DatabasePassword }
    'JWTSecret' { Rotate-JWTSecret }
    'EncryptionKey' { Rotate-EncryptionKey }
    'All' {
        Rotate-DatabasePassword
        Start-Sleep -Seconds 5
        Rotate-JWTSecret
    }
}

Write-Host ""
Write-Host "=== Rotation Summary ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Cyan
Write-Host "Rotated: $SecretToRotate" -ForegroundColor Cyan
```

### 8.3.2. Schedule Secret Rotation

```powershell
# Create Azure Automation Account
az automation account create \
  --name lms-automation \
  --resource-group lms-production-rg \
  --location southeastasia

# Schedule rotation every 90 days
# (Configure in Azure Portal → Automation Account → Runbooks)
```

---

# 9. Monitoring & Threat Detection

## 9.1. Enable Microsoft Defender for Cloud

### 9.1.1. Enable Defender Plans

```powershell
# Enable Defender for all resource types
az security pricing create --name VirtualMachines --tier Standard
az security pricing create --name AppServices --tier Standard
az security pricing create --name SqlServers --tier Standard
az security pricing create --name StorageAccounts --tier Standard
az security pricing create --name ContainerRegistry --tier Standard
az security pricing create --name KeyVaults --tier Standard
az security pricing create --name Dns --tier Standard
az security pricing create --name Arm --tier Standard

# Cost: ~$15-30/month per resource type
```

### 9.1.2. Configure Security Alerts

```powershell
# Create action group for security alerts
az monitor action-group create \
  --name SecurityAlerts \
  --resource-group lms-production-rg \
  --short-name SecAlert \
  --email-receiver admin-email admin@lms.yourdomain.com \
  --sms-receiver admin-sms +84123456789

# Configure alert rules for security events
az monitor metrics alert create \
  --name "High Severity Security Alert" \
  --resource-group lms-production-rg \
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID/resourceGroups/lms-production-rg \
  --condition "count > 0" \
  --description "Alert on high severity security events" \
  --evaluation-frequency 5m \
  --window-size 15m \
  --action SecurityAlerts
```

## 9.2. Application Security Logging

### 9.2.1. Comprehensive Security Event Logging

```python
# backend/common/security_logger.py
import logging
import json
from datetime import datetime
from flask import request, g
from functools import wraps

# Configure logger
security_logger = logging.getLogger('security')
security_logger.setLevel(logging.INFO)

# Add Azure Application Insights handler
from opencensus.ext.azure.log_exporter import AzureLogHandler
connection_string = os.getenv('APPLICATIONINSIGHTS_CONNECTION_STRING')
security_logger.addHandler(AzureLogHandler(connection_string=connection_string))

class SecurityEventType:
    LOGIN_SUCCESS = 'LOGIN_SUCCESS'
    LOGIN_FAILURE = 'LOGIN_FAILURE'
    LOGOUT = 'LOGOUT'
    UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS'
    PERMISSION_DENIED = 'PERMISSION_DENIED'
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
    PASSWORD_CHANGE = 'PASSWORD_CHANGE'
    ACCOUNT_LOCKED = 'ACCOUNT_LOCKED'
    DATA_ACCESS = 'DATA_ACCESS'
    DATA_MODIFICATION = 'DATA_MODIFICATION'
    API_KEY_USED = 'API_KEY_USED'
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'

def log_security_event(event_type: str, user_id: int = None, details: dict = None):
    """Log security event to Application Insights"""
    
    event = {
        'timestamp': datetime.utcnow().isoformat(),
        'event_type': event_type,
        'user_id': user_id or getattr(g, 'user_id', None),
        'ip_address': request.remote_addr if request else None,
        'user_agent': request.headers.get('User-Agent') if request else None,
        'endpoint': request.endpoint if request else None,
        'method': request.method if request else None,
        'details': details or {}
    }
    
    security_logger.info(
        f"SECURITY_EVENT: {event_type}",
        extra={
            'custom_dimensions': event
        }
    )

def audit_trail(action: str):
    """Decorator to log data access/modification"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = getattr(g, 'user_id', None)
            
            # Log before action
            log_security_event(
                SecurityEventType.DATA_ACCESS if request.method == 'GET' else SecurityEventType.DATA_MODIFICATION,
                user_id=user_id,
                details={
                    'action': action,
                    'resource': request.path,
                    'params': request.args.to_dict() if request.method == 'GET' else None
                }
            )
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

# Usage:
@app.route('/api/users/<int:user_id>', methods=['GET'])
@token_required
@audit_trail('view_user_profile')
def get_user(user_id):
    pass

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@token_required
@audit_trail('update_user_profile')
def update_user(user_id):
    pass
```

### 9.2.2. Failed Login Tracking

```python
# backend/user_service/security.py
import redis
from datetime import datetime, timedelta

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def track_failed_login(email: str, ip: str):
    """Track failed login attempts"""
    
    # Key for email-based tracking
    email_key = f"failed_login:email:{email}"
    email_count = redis_client.incr(email_key)
    redis_client.expire(email_key, 900)  # 15 minutes
    
    # Key for IP-based tracking
    ip_key = f"failed_login:ip:{ip}"
    ip_count = redis_client.incr(ip_key)
    redis_client.expire(ip_key, 900)
    
    # Log security event
    log_security_event(
        SecurityEventType.LOGIN_FAILURE,
        details={
            'email': email,
            'ip': ip,
            'email_attempts': email_count,
            'ip_attempts': ip_count
        }
    )
    
    # Lock account after 5 failed attempts
    if email_count >= 5:
        user = User.query.filter_by(email=email).first()
        if user:
            user.is_locked = True
            user.locked_until = datetime.utcnow() + timedelta(hours=1)
            db.session.commit()
            
            log_security_event(
                SecurityEventType.ACCOUNT_LOCKED,
                user_id=user.id,
                details={'reason': 'Multiple failed login attempts'}
            )
            
            # Send email notification
            send_security_alert(user.email, "Account locked due to multiple failed login attempts")
    
    # Suspicious activity if too many attempts from same IP
    if ip_count >= 20:
        log_security_event(
            SecurityEventType.SUSPICIOUS_ACTIVITY,
            details={
                'ip': ip,
                'reason': 'Excessive failed login attempts from single IP',
                'attempts': ip_count
            }
        )
        
        # Block IP at firewall level (if Azure Firewall is configured)
        # block_ip_address(ip)

def is_ip_blocked(ip: str) -> bool:
    """Check if IP is blocked"""
    return redis_client.exists(f"blocked_ip:{ip}") > 0

def block_ip_address(ip: str, duration_seconds: int = 3600):
    """Temporarily block IP address"""
    redis_client.setex(f"blocked_ip:{ip}", duration_seconds, "1")
    
    log_security_event(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        details={
            'ip': ip,
            'action': 'IP_BLOCKED',
            'duration': duration_seconds
        }
    )
```

## 9.3. Real-time Threat Detection

### 9.3.1. Configure Azure Sentinel (SIEM)

```powershell
# Create Log Analytics Workspace (if not exists)
az monitor log-analytics workspace create \
  --resource-group lms-production-rg \
  --workspace-name lms-log-analytics \
  --location southeastasia

# Get workspace ID
$workspaceId = az monitor log-analytics workspace show \
  --resource-group lms-production-rg \
  --workspace-name lms-log-analytics \
  --query customerId -o tsv

# Enable Azure Sentinel
# (Must be done via Azure Portal)
# Go to: Azure Portal → Azure Sentinel → Add → Select workspace
```

### 9.3.2. Create Alert Rules for Common Attacks

```kusto
// KQL Query: Detect SQL Injection attempts
SecurityEvent
| where TimeGenerated > ago(1h)
| where EventID == 4625  // Failed login
| where AccountType == "User"
| extend SQLInjectionKeywords = pack_array(
    "' OR '1'='1", "'; DROP TABLE", "UNION SELECT", 
    "EXEC(", "xp_cmdshell", "--", "/*", "*/"
)
| where Activity contains_any (SQLInjectionKeywords)
| summarize AttemptCount = count() by Account, IpAddress
| where AttemptCount > 5
| project TimeGenerated, Account, IpAddress, AttemptCount

// KQL Query: Detect brute force attacks
SigninLogs
| where TimeGenerated > ago(1h)
| where ResultType != "0"  // Failed sign-ins
| summarize FailedAttempts = count() by UserPrincipalName, IPAddress, bin(TimeGenerated, 5m)
| where FailedAttempts > 10
| project TimeGenerated, UserPrincipalName, IPAddress, FailedAttempts

// KQL Query: Detect unusual data access patterns
AuditLogs
| where TimeGenerated > ago(1h)
| where OperationName == "DataAccess"
| summarize AccessCount = count() by UserPrincipalName, Resource, bin(TimeGenerated, 5m)
| where AccessCount > 100  // More than 100 accesses in 5 minutes
| project TimeGenerated, UserPrincipalName, Resource, AccessCount
```

### 9.3.3. Anomaly Detection with Application Insights

```python
# backend/common/anomaly_detection.py
from opencensus.ext.azure import metrics_exporter
from opencensus.stats import aggregation as aggregation_module
from opencensus.stats import measure as measure_module
from opencensus.stats import stats as stats_module
from opencensus.stats import view as view_module
from opencensus.tags import tag_map as tag_map_module

# Create custom metrics
stats = stats_module.stats
view_manager = stats.view_manager
stats_recorder = stats.stats_recorder

# Measure for tracking suspicious activities
suspicious_activity_measure = measure_module.MeasureInt(
    "suspicious_activities",
    "Number of suspicious activities detected",
    "activities"
)

# Create view
suspicious_activity_view = view_module.View(
    "suspicious_activities_view",
    "Suspicious activities over time",
    [],
    suspicious_activity_measure,
    aggregation_module.CountAggregation()
)

# Register view
view_manager.register_view(suspicious_activity_view)

# Export to Application Insights
connection_string = os.getenv('APPLICATIONINSIGHTS_CONNECTION_STRING')
exporter = metrics_exporter.new_metrics_exporter(connection_string=connection_string)
view_manager.register_exporter(exporter)

def record_suspicious_activity():
    """Record suspicious activity metric"""
    mmap = stats_recorder.new_measurement_map()
    mmap.measure_int_put(suspicious_activity_measure, 1)
    mmap.record()
```

---

**Continue to final sections (10-12)?**

Tôi sẽ tiếp tục với:
- **Section 10**: Compliance & Audit
- **Section 11**: Incident Response
- **Section 12**: Complete Security Checklist

Bạn muốn tôi tiếp tục không? 🔒
