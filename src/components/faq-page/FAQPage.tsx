import React from "react";
import FAQMobile from "./FAQMobile.tsx";
import FAQDesktop from "./FAQDesktop.tsx";
import faqData from "../../utility/faqData.js";

function FAQPage() {
  return (
    <>
      {faqData.map((faq, index) => (
        <FAQDesktop faq={faq} />
      ))}
    </>
  );
}

export default FAQPage;
