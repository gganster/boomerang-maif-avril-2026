import { createContext, useState, useReducer } from "react";

const logContext = createContext<{
  logs: string[];
  addLog: (log: string) => void;
}>({
  logs: [],
  addLog: () => {},
});

function reducer (state: string[], action: {type: "ADD_LOG"; payload: string}) {
  switch (action.type) {
    case "ADD_LOG":
      return [...state, action.payload];
    default:
      return state;
  }
}

const LogProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, []);

  const addLog = (log: string) => {
    dispatch({ type: "ADD_LOG", payload: log });
  }

  return (
    <logContext.Provider value={{logs, addLog}}>
      {children}
    </logContext.Provider>
  )
}

export { logContext, LogProvider };