import React, { useState } from "react";
import RSVPForm from "./RSVPForm.tsx";

function RSVPPortal({ groupData }) {
  //check if rsvp has been submitted already logic HERE
  //no : show form || yes: show menu that allows to edit / add certain elements
  const groupName = groupData["group_name"];
  return (
    <div id="rsvp-form-container">
      <p>{groupName} RSVP Portal</p>
      <RSVPForm groupData={groupData} />
    </div>
  );
}

export default RSVPPortal;
