import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token'); // Obtener el token almacenado

  if (!token) {
    // Si no hay token, redirigir al login
    return <Navigate to="/" replace />;
  }

  // Si hay token, renderizar los hijos (componente Home)
  return children;
};

export default ProtectedRoute;
