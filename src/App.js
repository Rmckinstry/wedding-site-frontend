import React from 'react';
import './App.css';
import Footer from './components/Footer.tsx';
import Header from './components/Header.tsx';
import HomePage from './components/HomePage.tsx';
import TravelPage from './components/TravelPage.tsx';
import FAQPage from './components/faq-page/FAQPage.tsx';
import Registry from './components/Registry.tsx';
import theme from './theme/theme.tsx';
import { ThemeProvider } from '@mui/material';
import Navigation from './components/navigation/Navigation.tsx';
import RSVPPage from './components/rsvp/RSVPPage.tsx';
import { NavigationProvider, useNavigation } from './context/NavigationContext.tsx';

function AppContent() {

  const { tabValue } = useNavigation()


  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Header />
        <div id="nav-container"> {/* Add the container div */}
          <Navigation />
        </div>
        <div id='page-container'>
          {tabValue === 0 && <HomePage />}
          {tabValue === 1 && <TravelPage />}
          {tabValue === 2 && <RSVPPage />}
          {tabValue === 3 && <Registry />}
          {tabValue === 4 && <FAQPage />}

        </div>
        <Footer showText={tabValue > 0} />
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  )
}

export default App;
