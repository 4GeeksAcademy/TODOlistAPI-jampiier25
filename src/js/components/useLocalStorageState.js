import { useState, useEffect } from "react";

export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
//aqui usamos el localstorage para poder guardar el usuario y poder usarlo y que no me elimine las tareas o equis al recargar la pagina// 