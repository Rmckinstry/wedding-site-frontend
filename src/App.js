import React, { useState } from 'react';
import './App.css';
import Footer from './components/Footer.tsx';
import Header from './components/Header.tsx';
import TabBar from './components/TabBar.tsx';
import HomePage from './components/HomePage.tsx';
import TravelPage from './components/TravelPage.tsx';
import FAQPage from './components/FAQPage.tsx';

function App() {

  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    if (newValue !== tabValue) {
      setTabValue(newValue);
    }
  }

  return (
    <div className="App">
      <Header />
      <TabBar tabValue={tabValue} handleChange={handleChange} />
      <div id='page-container'>
        {tabValue === 0 && <HomePage />}
        {tabValue === 1 && <TravelPage />}
        {tabValue === 2 && <FAQPage />}
      </div>
      <Footer />
    </div>
  );
}

export default App;
