// hooks/useModal.ts
import { useState } from "react";

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    document.body.style.overflow = "hidden";
    setIsOpen(true);
  };

  const close = () => {
    document.body.style.overflow = "";
    setIsOpen(false);
  };

  return { isOpen, open, close };
};