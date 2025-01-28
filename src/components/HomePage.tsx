import React from "react";
import HomeImage from "../assets/italy ring.jpg"

function HomePage(){
    return(
        <>
            <div id="home-page-container">
                <img src={HomeImage} alt={"Proposal in Italy"} id="home-page-image" />
                <div id="home-page-info-container">
                    <p className="home-page-info">November 15, 2025</p>
                    <p className="home-page-info">Rossville, TN</p>
                </div>
            </div>
        </>
    )
}

export default HomePage;