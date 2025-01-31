import React from "react";

function TravelPage() {
  return (
    <>
      <div id="travel-page-container">
        <div id="venue-container" className="flex-col">
          <h2 className="title">Venue</h2>
          <div id="venue-info" className="info-container">
            <p className="primary-text">Heartwood Hall</p>
            <a
              href="https://maps.app.goo.gl/YdQgCvsSVR2bzDCv6"
              className="secondary-text"
              target="_blank"
              rel="noreferrer"
            >
              2665 Raleigh Lagrange Dr, Rossville, TN 38066
            </a>
          </div>
        </div>

        <div id="travel-grid-container">
          <div id="transportation-container" className="flex-col">
            <h2 className="title">Transportation</h2>
            <div className="info-container">
              <p className="primary-text">Memphis International Airport</p>
              <p className="secondary-text">(Recommended)</p>
            </div>
            <div className="info-container">
              <p className="primary-text">Nashille International Airport</p>
              <p className="secondary-text">(Note: 3 hour drive to Memphis.)</p>
            </div>
            <div className="info-container">
              <p className="primary-text">Memphis Airport Rental Cars</p>
              <div className="btn-container">
                <a
                  href="https://flymemphis.com/ground-transportation/"
                  target="_blank"
                  className="btn-link"
                  rel="noreferrer"
                >
                  Rental Cars
                </a>
              </div>
            </div>
          </div>

          <div id="travel-divider">{/* divider */}</div>

          <div id="lodging-container" className="flex-col">
            <h2 className="title">Lodging</h2>
            <div className="info-container">
              <p className="primary-text">Courtyard Memphis Collierville</p>
              <div className="info-container">
                <a
                  href="https://maps.app.goo.gl/QBmsoeupeWr9yDH87"
                  target="_blank"
                  className="secondary-text"
                  rel="noreferrer"
                >
                  4640 Merchants Park Cir, Collierville, TN 38017
                </a>
                <p className="secondary-text">(901) 850-9390</p>
              </div>
              <p style={{ margin: "0px", textAlign: "center" }}>
                To receive the “Kail-Mckinstry Wedding Block” rate, use the button below.
              </p>
              <p style={{ margin: "0px", textAlign: "center" }}>If the block is out of stock, please let us know!</p>
              <div className="btn-container">
                <a
                  href="https://www.marriott.com/event-reservations/reservation-link.mi?id=1736975742584&key=GRP&guestreslink2=true&app=resvlink"
                  target="_blank"
                  className="btn-link"
                  rel="noreferrer"
                >
                  Block Rate
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TravelPage;
