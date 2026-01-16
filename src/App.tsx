import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import './styles/global.css';
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Task from "./components/Task";
import Information from "./components/Information";
import ProtectedRoute from "./components/ProtectedRoute";
import RedirectIfAuthenticated from "./components/Redirect";
import RedirectRegister from "./components/redirectRegister";
import Phrases from "./components/Phrases";
import Goals from "./components/Goals";
import { useEffect, useState } from "react";

// logica para los temas globales
const themes = [
  "default",
  "amethyst-haze",
  "bubblegum",
  "candyland",
  "catppuccin",
  "violet-bloom",
  "retro-arcade",
  "Tangerine",
  "Nature",
  "caffeine",
  "claude",
  "cosmic-night",
  "graphite",
  "twitter",
  "vintage-paper",
  "sunset-horizon",
  "neo-brutalism",
  "t3-chat",
  "pastel-dreams",
  "soft-pop",
] as const;

const defaultTheme: (typeof themes)[number] = "default";

function App() {
  const [theme, setTheme] = useState<(typeof themes)[number]>(defaultTheme);

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as (typeof themes)[number]) ||
      defaultTheme;
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
    console.log("hola");
  };

  return (
    <Router>
      <div>
        <Routes>
          {/* Ruta pública para iniciar sesión */}
          <Route
            path="/"
            element={
              <RedirectIfAuthenticated>
                <Login />
              </RedirectIfAuthenticated>
            }
          />

          {/* Ruta pública para el registro */}
          <Route
            path="/register"
            element={
              <RedirectRegister>
                <Register />
              </RedirectRegister>
            }
          />

          {/* Ruta protegida para el home, solo accesible si hay un token */}
          <Route
            path="/Home"
            element={
              <ProtectedRoute>
                <Home theme={theme} onToggleTheme={handleToggleTheme} />
              </ProtectedRoute>
            }
          />

          {/* Ruta protegida para el task, solo accesible si hay un token */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Task />
              </ProtectedRoute>
            }
          />

          {/* Ruta protegida para el Phrases, solo accesible si hay un token */}
          <Route
            path="/phrases"
            element={
              <ProtectedRoute>
                <Phrases />
              </ProtectedRoute>
            }
          />

          {/* Ruta protegida para el Goals, solo accesible si hay un token */}
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            }
          />

          {/* Ruta protegida para el information, solo accesible si hay un token */}
          <Route
            path="/information"
            element={
              <ProtectedRoute>
                <Information />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
