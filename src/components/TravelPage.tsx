import React from "react";

function TravelPage(){
    return(
        <>
            <div id="travel-page-container">
                <div id="travel-page-venue-container">
                    <h2 id="venue-header">Venue</h2>
                    <div id="travel-page-venue-info">
                        <p>Heartwood Hall</p>
                        <p>2665 Raleigh Lagrange Dr, Rossville, TN 38066</p>
                    </div>
                </div>
                <div id="travel-page-travel-container">
                    <div id="transportation-container">
                        <h2 id="transportation-header">Transportation</h2>
                        <div className="transportation-item-container">
                            <p>Memphis International Airport</p>
                            <p>(Recommended)</p>
                        </div>
                        <div className="transportation-item-container">
                            <p>Nashille International Airport</p>
                        </div>
                        <div className="transportation-item-container">
                            <p>Memphis Airport Rental Cars</p>
                            <button>Rental Cars</button>
                        </div>
                    </div>
                    <div>
                        {/* divider */}
                    </div>
                    <div id="lodging-container">
                        <h2 id="lodging-header">Lodging</h2>
                        <div className="lodging-item-container">
                            <p>Courtyard Memphis Collierville</p>
                            <div className="lodging-address-container">
                                <p>4640 Merchants Park Cir, Collierville, TN 38017</p>
                                <p>(901) 850-9390</p>
                                <p>Check-In: Friday, November 14, 2025 | Check-Out: Sunday, November 16, 2025</p>
                            </div>
                            <p>To receive the “Kail-Mckinstry Wedding Block” rate, use the button below.</p>
                            <button>Block Rate</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TravelPage;