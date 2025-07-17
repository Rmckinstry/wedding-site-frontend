import React, { createContext, useState, useContext, ReactNode } from "react";

interface NavigationContextType {
  tabValue: number;
  handleTabChange: (event: React.SyntheticEvent | Event, newTabValue?: number) => void;
  navigateTo: (pageIndex: number) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent | Event, newValue?: number) => {
    let newPageIndex: number;
    if (newValue === undefined) {
      // Assuming mobile select returns event.target.value as a string
      newPageIndex = Number((event.target as HTMLSelectElement).value);
    } else {
      newPageIndex = newValue;
    }
    if (newPageIndex !== tabValue) {
      setTabValue(newPageIndex);
    }
  };

  const navigateTo = (pageIndex: number) => {
    if (pageIndex !== tabValue) {
      setTabValue(pageIndex);
      // handleScrollAction(); // If you want to scroll when navigating programmatically
    }
  };

  return (
    <NavigationContext.Provider value={{ tabValue, handleTabChange, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Custom hook to consume the navigation context
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
