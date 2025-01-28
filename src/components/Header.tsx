import React from "react";
import HeaderImage  from "../assets/header_1024.webp"


function Header (){
    return(
        <>
            <div className="header-container">
                <img id="header-img" src={HeaderImage} alt={"Green Vines"} />
                <h1 id="header-name">BAILEY & RYAN</h1>
                <p id="header-event-info">November 15, 2025 • Rossville, TN</p>
            </div>
        </>
    )
}

export default Header;