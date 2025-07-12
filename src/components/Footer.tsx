import React from "react";
import FooterImage from "../assets/footer_1280.webp";

function Footer({ showText = false }) {
  return (
    <>
      <div className="flex-col" id="footer-container">
        {showText && (
          <div id="footer-info" className="flex-col">
            <p id="footer-text">B & R</p>
            <div id="divider-horiz"></div>
            <p id="footer-date">11.15.2025</p>
          </div>
        )}
        <img id="footer-img" src={FooterImage} alt={"Flowers"} />
      </div>
    </>
  );
}

export default Footer;
