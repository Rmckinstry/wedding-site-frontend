import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

function FAQMobile({ faq }) {
  return (
    <>
      <Card className="faq-mobile-container">
        <CardContent>
          <div className="faq-content-mobile">
            <p className="faq-title-mobile">{faq.question}</p>
            <p className="faq-answer-mobile">{faq.answer}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default FAQMobile;
