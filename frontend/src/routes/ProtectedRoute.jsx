import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still validating the stored token against the server
  if (loading) return <LoadingSpinner fullPage />;

  // No authenticated user → send to login, preserving the intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role guard — redirect to the user's own dashboard if they try to access
  // a route that doesn't belong to their role
  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    const redirectPath =
      user.role === 'ADMIN'      ? '/admin/dashboard'     :
      user.role === 'RECRUITER'  ? '/recruiter/dashboard' :
                                   '/candidate/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;