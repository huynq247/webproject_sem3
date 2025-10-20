# Environment Configuration Guide

## 📁 File Structure
```
frontend-teacher/
├── .env                    # Local development (ignored by git)
├── .env.example            # Template for developers
├── .env.production         # Production configuration (ignored by git)
└── src/config/
    └── index.ts            # Config loader
```

## 🚀 Setup Instructions

### 1. Create your local .env file:
```bash
cp .env.example .env
```

### 2. Update values in .env:
```bash
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_AUTH_SERVICE_URL=http://localhost:8001
# ... etc
```

### 3. Restart development server:
```bash
npm start
```

## 📝 Available Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | API Gateway URL | `http://localhost:8000` |
| `REACT_APP_AUTH_SERVICE_URL` | Auth Service URL | `http://localhost:8001` |
| `REACT_APP_CONTENT_SERVICE_URL` | Content Service URL | `http://localhost:8002` |
| `REACT_APP_ASSIGNMENT_SERVICE_URL` | Assignment Service URL | `http://localhost:8004` |
| `REACT_APP_DEBUG` | Enable debug logs | `true` |
| `REACT_APP_ENABLE_ANALYTICS` | Enable analytics | `false` |
| `REACT_APP_ITEMS_PER_PAGE` | Pagination size | `10` |
| `REACT_APP_TIMEOUT_MS` | API timeout | `30000` |

## 🔒 Security Notes

- ✅ `.env` is in `.gitignore` - won't be committed
- ✅ `.env.example` is committed - safe template
- ✅ Never commit sensitive data to `.env.production`
- ✅ Use environment-specific secrets in CI/CD

## 🎯 Usage in Code

```typescript
import { config } from './config';

// Access config values
console.log(config.API_BASE_URL);
console.log(config.ENABLE_DEBUG_LOGS);
```

## 🌍 Deployment

### Development:
```bash
npm start  # Uses .env
```

### Production:
```bash
npm run build  # Uses .env.production
```

## 🆘 Troubleshooting

**Problem**: Config values are `undefined`

**Solutions**:
1. Ensure `.env` file exists in root directory
2. Restart development server after changing `.env`
3. Check variable names start with `REACT_APP_`
4. Verify no syntax errors in `.env` file
