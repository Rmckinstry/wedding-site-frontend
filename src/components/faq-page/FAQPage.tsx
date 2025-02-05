import React from "react";
import FAQMobile from "./FAQMobile.tsx";
import FAQDesktop from "./FAQDesktop.tsx";
import faqData from "../../utility/faqData.js";

function FAQPage() {
  return (
    <>
      <div id="faq-data-desktop-container">
        {faqData.map((faq, index) => (
          <FAQDesktop faq={faq} />
        ))}
      </div>
      <div id="faq-data-mobile-container">
        {faqData.map((faq, index) => (
          <FAQMobile faq={faq} />
        ))}
      </div>
    </>
  );
}

export default FAQPage;
