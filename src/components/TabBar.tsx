import React, { useState } from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import HomePage from "./HomePage.tsx";
import TravelPage from "./TravelPage.tsx";
import FAQPage from "./FAQPage.tsx";

function TabBar (){
    const [tabValue, setTabValue] = useState(0);

    const handleChange = (event, newValue) =>{
        setTabValue(newValue);
    }

    return(
        <>
            <div className="tab-bar-container">
                <Tabs value={tabValue} onChange={handleChange} aria-label="Tab bar">
                    <Tab label="Home" />
                    <Tab label="Travel" />
                    <Tab label="FAQ" />
                </Tabs>
            </div>

            {tabValue === 0 && <HomePage />}
            {tabValue === 1 && <TravelPage />}
            {tabValue === 2 && <FAQPage />}
        </>
    )
}

export default TabBar;