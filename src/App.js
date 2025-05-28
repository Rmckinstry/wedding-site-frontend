import React, { useState } from 'react';
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
import RSVP from './components/rsvp/RSVP.tsx';

function App() {

  const [tabValue, setTabValue] = useState(0);

  const handleScrollAction = () => {
    const pageContainer = document.getElementById('page-container');
    if (pageContainer) {
      pageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleChange = (event, newValue) => {
    if (newValue === undefined) {
      // assume mobile
      if (event.target.value !== tabValue) {
        setTabValue(Number(event.target.value));
        handleScrollAction();
      }
    } else {
      if (newValue !== tabValue) {
        setTabValue(newValue);
        handleScrollAction();
      }
    }

  };

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Header />
        <div id="nav-container"> {/* Add the container div */}
          <Navigation tabValue={tabValue} handleChange={handleChange} />
        </div>
        <div id='page-container'>
          {tabValue === 0 && <HomePage />}
          {tabValue === 1 && <TravelPage />}
          {tabValue === 2 && <RSVP />}
          {tabValue === 3 && <Registry />}
          {tabValue === 4 && <FAQPage />}

        </div>
        <Footer showText={tabValue > 0} />
      </div>
    </ThemeProvider>
  );
}

export default App;
