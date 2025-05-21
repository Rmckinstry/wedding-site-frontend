import React from "react";

function Registry() {
  return (
    <>
      <div id="registry-page-container" className="flex-col">
        <div id="registry-info-container" className="flex-col">
          <h3>We are using WithJoy as our registry provider.</h3>
          <p className="registry-text">Click the button below to visit our registry portal.</p>
        </div>
        <div id="registry-btn-container" className="btn-container contain-text-center">
          <a
            href="https://withjoy.com/bailey-and-ryan-nov-25/registry"
            target="_blank"
            id="registry-btn"
            className="btn-link"
            rel="noreferrer"
          >
            Bailey & Ryans WithJoy Registy
          </a>
        </div>
        <p className="registry-text">
          We deeply appreciate any gifts purchased or cash funds donated to. Your generosity means the world to us —
          thank you for being part of our celebration!
        </p>
      </div>
    </>
  );
}

export default Registry;
