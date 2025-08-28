import React from "react";

function Registry() {
  return (
    <>
      <div id="registry-page-container" className="flex-col">
        <div id="registry-info-container" className="flex-col"></div>
        <div id="registry-btn-container" className="btn-container contain-text-center">
          <a
            href="https://withjoy.com/bailey-and-ryan-nov-15"
            target="_blank"
            id="registry-btn"
            className="btn-link"
            rel="noreferrer"
          >
            Enter Bailey & Ryan's WithJoy Registry
          </a>
        </div>
        <p className="registry-text font-sm-med" style={{ padding: "1rem 5%", textAlign: "center" }}>
          <strong className="underline">Note:</strong> WithJoy defaults to using our shipping address when purchasing
          gifts from the registry. You{" "}
          <strong className="underline">are able to change the address in your cart</strong> to get it shipped to your
          place if you prefer. Thanks!
        </p>
        <p className="registry-text font-sm-med" style={{ padding: "1rem 5%", textAlign: "center" }}>
          <strong className="underline">Note:</strong> To ensure items are not duplicated, when you have purchased an
          item/donated on WithJoy, please make sure to finish the prompt and mark the item as "purchased".
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
