# 🔧 Admin Frontend

## Overview
Admin-specific frontend for managing the entire LMS system.

## Features
- 🏠 **Dashboard**: System overview and statistics
- 👥 **User Management**: Manage all users (students, teachers, admins)
- 📚 **Course Management**: Create and manage courses
- 📖 **Lesson Management**: Create and manage lessons
- 🃏 **Flashcard Deck Management**: Manage all flashcard decks

## Access Control
- **Role Required**: `ADMIN`
- **Port**: `3001`
- **URL**: http://localhost:3001

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
cd frontend-admin
npm install
```

### Development
```bash
npm start
```

### Build for Production
```bash
npm run build
```

## Tech Stack
- **React 18** with TypeScript
- **Material-UI 5** with Glass Morphism theme
- **React Query** for state management
- **React Router** for navigation

## Environment Variables
```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
```

## Features by Role

### Admin Only
- ✅ Dashboard with system stats
- ✅ User management (CRUD operations)  
- ✅ Course management
- ✅ Lesson management
- ✅ Flashcard deck management

### Not Available
- ❌ Assignments (Admin doesn't create assignments)
- ❌ Analytics (Use main backend analytics)
- ❌ Student-specific features

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
