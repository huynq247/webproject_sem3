import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface RoleBasedComponentProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  allowedRoles,
  children,
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role?.toUpperCase() || '')) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Hook for role checking
export const useRolePermission = () => {
  const { user } = useAuth();

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    const userRole = user.role?.toUpperCase() || '';
    
    if (typeof roles === 'string') {
      return userRole === roles.toUpperCase();
    }
    
    return roles.map(r => r.toUpperCase()).includes(userRole);
  };

  const isAdmin = () => hasRole('ADMIN');
  const isTeacher = () => hasRole('TEACHER');
  const isStudent = () => hasRole('STUDENT');
  const isTeacherOrAdmin = () => hasRole(['TEACHER', 'ADMIN']);

  return {
    hasRole,
    isAdmin,
    isTeacher,
    isStudent,
    isTeacherOrAdmin,
    userRole: user?.role?.toUpperCase() || '',
  };
};
