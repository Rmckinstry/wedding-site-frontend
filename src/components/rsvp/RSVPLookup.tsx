import React, { useState } from "react";
import { TextField, Autocomplete } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Guest } from "../../utility/types";

function RSVPConfirmation({ guest, handleConfirmation }) {
  const { isPending, isFetching, isError, data, error } = useQuery({
    queryKey: ["groupData"],
    queryFn: async () => {
      const response = await fetch(`${process.env.API_URL}/guests/group/${guest["group_id"]}`);
      return await response.json();
    },
  });

  if (isPending || isFetching) {
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
        <button
          className="btn-link btn-xl"
          onClick={() => handleConfirmation(true, data["group_name"], guest["group_id"])}
        >
          Yes, this is me/my group!
        </button>
        <button
          className="btn-link btn-xl"
          onClick={() => {
            // queryClient.resetQueries({ queryKey: ["groupData"] });
            handleConfirmation(false, "", 0);
          }}
        >
          No, lets search again.
        </button>
      </div>
    </div>
  );
}

function RSVPLookup({ data, handleGroupSelect }: { data: Guest[]; handleGroupSelect: ({ id, name }) => void }) {
  const [inputValue, setInputValue] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConfirmation = (confirmation: boolean, groupName: string, groupId: number) => {
    if (confirmation) {
      handleGroupSelect({ id: groupId, name: groupName });
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
            // might move sorting to backend - because might combine it with duplication handling
            options={data.sort((a, b) => {
              const nameA = a.name.toUpperCase();
              const nameB = b.name.toUpperCase();
              if (nameA < nameB) {
                return -1;
              } else if (nameA > nameB) {
                return 1;
              } else {
                return 0;
              }
            })}
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
