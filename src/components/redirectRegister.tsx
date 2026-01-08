import { Navigate } from 'react-router-dom';

interface RedirectIfAuthenticatedProps {
  children: JSX.Element;
}

const RedirectRegister = ({ children }: RedirectIfAuthenticatedProps) => {
  const token = localStorage.getItem('token'); // Obtener el token almacenado

  if (token) {
    // Si hay un token, redirige al Home
    return <Navigate to="/Home" replace />;
  }

  return children; // Si no hay token, muestra la página de registro
};

export default RedirectRegister;
