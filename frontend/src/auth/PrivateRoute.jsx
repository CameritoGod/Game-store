import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export default function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>; 
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
