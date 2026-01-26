import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useLogout = (token: string | null) => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      if (!token) return;

      const API_URL = import.meta.env.VITE_API_URL;

      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem("token");
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return { logout };
};