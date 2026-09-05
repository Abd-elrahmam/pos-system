import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);

  function reload() {
    api.get("/settings").then((res) => setSettings(res.data));
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, reload }}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
