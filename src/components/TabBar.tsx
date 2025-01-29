import React, { useState } from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function TabBar ({tabValue, handleChange}){
    return(
        <>
            <div className="tab-bar-container">
                <Tabs value={tabValue} onChange={handleChange} aria-label="Tab bar">
                    <Tab label="Home" />
                    <Tab label="Travel" />
                    <Tab label="FAQ" />
                </Tabs>
            </div>
        </>
    )
}

export default TabBar;