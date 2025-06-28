import React from "react";
import HomeImage from "../assets/italy_ring.jpg";

function HomePage() {
  return (
    <>
      <div id="home-page-container" className="flex-col">
        <img src={HomeImage} alt={"Proposal in Italy"} id="home-page-image" />
        <div id="home-page-info-container" className="flex-row">
          <div className="flex-col font-lg home-footer">
            <p>November</p>
            <p>15, 2025</p>
          </div>
          <div id="divider-vert">{/* divider */}</div>
          <div className="flex-col font-lg home-footer">
            <p>Rossville,</p>
            <p>TN</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
