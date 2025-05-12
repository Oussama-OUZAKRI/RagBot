import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ authenticated, userRole, children, allowedRoles = ['user', 'admin'] }) => {
  if (!authenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}