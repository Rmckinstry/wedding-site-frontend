import React, { useState } from "react";
import { TextField, Autocomplete } from "@mui/material";

function RSVPLookup({ data, handleGuestSelect }) {
  const [inputValue, setInputValue] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);

  return (
    <div id="rsvp-lookup-container">
      <p>Lookup your name to access your / your groups RSVP Guest Portal.</p>
      <Autocomplete
        options={data}
        getOptionLabel={(option: any) => option.name}
        value={selectedGuest}
        onChange={(event: any, newValue: any) => {
          setSelectedGuest(newValue);
          handleGuestSelect(newValue);
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        disablePortal
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Enter Guest Name" />}
      />
      <div className="btn-container">
        <button disabled={!selectedGuest} className="btn-link" onClick={() => console.log(selectedGuest)}>
          FIND YOUR RSVP
        </button>
      </div>
    </div>
  );
}

export default RSVPLookup;
