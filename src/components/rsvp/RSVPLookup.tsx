import React, { useState } from "react";
import { TextField, Autocomplete } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

function RSVPConfirmation({ guest, handleConfirmation }) {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["groupInfo"],
    queryFn: async () => {
      const response = await fetch(`https://wedding-site-backend-76nm.onrender.com/guests/group/${guest["group_id"]}`);
      return await response.json();
    },
  });

  if (isPending) {
    return <p>Loading Guests Information...</p>;
  }

  if (isError) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div id="rsvp-confirmation-container">
      <p>Please confirm that this is the correct group information that you are trying to RSVP for:</p>
      <p>{data["group_name"]}</p>
      <div>
        <p>Guests:</p>
        {data["guests"].map((guest) => (
          <p key={guest.id}>{guest.name}</p>
        ))}
      </div>
      <div className="btn-container">
        <button className="btn-link btn-xl" onClick={() => handleConfirmation(true, data)}>
          Yes, this is me/my group!
        </button>
        <button className="btn-link btn-xl" onClick={() => handleConfirmation(false, "")}>
          No, lets search again.
        </button>
      </div>
    </div>
  );
}

function RSVPLookup({ data, handleGroupSelect }) {
  const [inputValue, setInputValue] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConfirmation = (confirmation, groupData) => {
    if (confirmation) {
      handleGroupSelect(groupData);
    } else {
      setShowConfirmation(false);
      setSelectedGuest(null);
      setInputValue("");
    }
  };

  return (
    <div id="rsvp-lookup-container">
      {!showConfirmation ? (
        <div>
          <p>Lookup your name to access your / your groups RSVP Guest Portal.</p>
          <Autocomplete
            options={data}
            getOptionLabel={(option: any) => option.name}
            value={selectedGuest}
            onChange={(event: any, newValue: any) => {
              setSelectedGuest(newValue);
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
            <button disabled={!selectedGuest} className="btn-link" onClick={() => setShowConfirmation(true)}>
              FIND YOUR RSVP
            </button>
          </div>
        </div>
      ) : (
        <RSVPConfirmation guest={selectedGuest} handleConfirmation={handleConfirmation} />
      )}
    </div>
  );
}

export default RSVPLookup;
