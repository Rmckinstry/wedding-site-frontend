import React from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function TabBar (){
    return(
        <>
            <div className="tab-bar-container">
                <Tabs>
                    <Tab label="Home" />
                    <Tab label="Travel" />
                    <Tab label="FAQ" />
                </Tabs>
            </div>
        </>
    )
}

export default TabBar;