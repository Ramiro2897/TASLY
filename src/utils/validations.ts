// // validar el inicio de sesion
export const validateLoginUsername = (username: string): boolean => {
  return !username.trim(); // Devuelve true si hay un error (usuario vacío)
};

export const validateLoginPassword = (password: string): boolean => {
  return !password.trim(); // Devuelve true si hay un error (contraseña vacía)
};

