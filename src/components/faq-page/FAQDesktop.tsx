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
          <Typography className="faq-title-desktop" component="span">
            {faq.question}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{faq.answer}</Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default FAQDesktop;
