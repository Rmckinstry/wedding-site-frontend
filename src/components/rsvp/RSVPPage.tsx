import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { TextField, Autocomplete } from "@mui/material";
function RSVP() {
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const queryClient = useQueryClient();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["allGuests"],
    queryFn: async () => {
      const response = await fetch("https://wedding-site-backend-76nm.onrender.com/guests");
      return await response.json();
    },
  });

  if (isPending) {
    return <p>Loading Data...</p>;
  }

  if (isError) {
    return <p>Error: {error.message}</p>;
  }
  return (
    <>
      <div className="rsvp-page-container">
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
          <button disabled={!selectedGuest} className="btn-link" onClick={() => console.log(selectedGuest)}>
            FIND YOUR RSVP
          </button>
        </div>
      </div>
    </>
  );
}

export default RSVP;
