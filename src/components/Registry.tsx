import React from "react";

function Registry() {
  return (
    <>
      <div id="registry-page-container" className="flex-col">
        <div id="registry-info-container" className="flex-col">
          <h3>We are using WithJoy as our registry provider.</h3>
          <p className="registry-text font-sm-med">Click the button below to visit our registry portal.</p>
        </div>
        <div id="registry-btn-container" className="btn-container contain-text-center">
          <a
            href="https://withjoy.com/bailey-and-ryan-nov-15"
            target="_blank"
            id="registry-btn"
            className="btn-link"
            rel="noreferrer"
          >
            Bailey & Ryan's WithJoy Registry
          </a>
        </div>
        <p className="registry-text font-sm-med" style={{ padding: "1rem 5%", textAlign: "center" }}>
          <strong>Please note: </strong>To ensure items are not duplicated, when you have purchased an item/donated on
          WithJoy, please make sure to finish the prompt and mark the item as "purchased".
        </p>

        <p className="registry-text font-sm contain-text-center">
          We deeply appreciate any gifts purchased or cash funds donated to. Your generosity means the world to us —
          thank you for being part of our celebration!
        </p>
      </div>
    </>
  );
}

export default Registry;
