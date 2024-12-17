// NavigationContext.js
import React, { createContext, useState } from 'react';

const NavigationContext = createContext();

const NavigationProvider = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState('MainScreen'); // Define a tela inicial

  return (
    <NavigationContext.Provider value={{ activeScreen, setActiveScreen }}>
      {children}
    </NavigationContext.Provider>
  );
};

export { NavigationContext, NavigationProvider };
