import React from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function TabBar ({tabValue = 0, handleChange}){
    return(
        <>
            <div id="tab-bar-container">
                <Tabs 
                    value={tabValue} 
                    onChange={handleChange} 
                    aria-label="Tab bar"
                >
                    <Tab label="Home" className="custom-tab" />
                    <Tab label="Travel" className="custom-tab"/>
                    <Tab label="FAQ" className="custom-tab"/>
                </Tabs>
            </div>
        </>
    )
}

export default TabBar;