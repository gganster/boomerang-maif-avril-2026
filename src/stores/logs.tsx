import { createContext, useState } from "react";

const logContext = createContext<{
  logs: string[];
  addLog: (log: string) => void;
}>({
  logs: [],
  addLog: () => {},
});

const LogProvider = ({ children }: { children: React.ReactNode }) => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    setLogs((prev) => [...prev, log]);
  }

  return (
    <logContext.Provider value={{logs, addLog}}>
      {children}
    </logContext.Provider>
  )
}

export { logContext, LogProvider };