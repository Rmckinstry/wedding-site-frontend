import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function FAQDesktop({ faq }) {
  return (
    <>
      <Accordion className="faq-desktop-container">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <p className="faq-title-desktop font-sm">{faq.question}</p>
        </AccordionSummary>
        <AccordionDetails>
          <p className="faq-answer-desktop font-xs">{faq.answer}</p>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default FAQDesktop;
