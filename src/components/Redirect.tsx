import { Navigate } from 'react-router-dom';

interface RedirectIfAuthenticatedProps {
  children: JSX.Element;
}

const RedirectIfAuthenticated = ({ children }: RedirectIfAuthenticatedProps) => {
  const token = localStorage.getItem('token'); // Obtener el token almacenado

  if (token) {
    return <Navigate to="/Home" replace />;
  }

  return children;
};

export default RedirectIfAuthenticated;

