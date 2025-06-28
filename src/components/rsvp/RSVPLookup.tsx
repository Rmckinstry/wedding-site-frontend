import React, { useState } from "react";
import { TextField, Autocomplete, Button } from "@mui/material";
import { useQuery, useQueries } from "@tanstack/react-query";
import { ErrorType, GroupData, Guest } from "../../utility/types";
import Error from "../utility/Error.tsx";
import Loading from "../utility/Loading.tsx";

function RSVPConfirmation({
  guest,
  handleConfirmation,
  anneMarieData,
}: {
  guest: Guest;
  handleConfirmation: (confirmation: boolean, groupName: string, groupId: number) => void;
  anneMarieData: Guest[];
}) {
  //#region anne marie componet
  const AnneMarieConfirmation = ({ anneMarieData }: { anneMarieData: Guest[] }) => {
    const anneMarieQueries = useQueries({
      queries: anneMarieData.map((g) => ({
        queryKey: ["anneMarieGroup", g.group_id],
        queryFn: async () => {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/guests/group/${g.group_id}`);

          if (!response.ok) {
            const errorData: ErrorType = await response.json();
            throw errorData;
          }
          return (await response.json()) as GroupData;
        },
      })),
    });

    const isPending = anneMarieQueries.some((query) => query.isPending);
    const isError = anneMarieQueries.some((query) => query.isError);
    const error = anneMarieQueries.find((query) => query.isError)?.error;
    const anneGroups: GroupData[] = anneMarieQueries
      .filter((query) => query.isSuccess && query.data !== undefined)
      .map((query) => query.data as GroupData);

    if (isPending || isFetching) {
      return <Loading loadingText={`Loading ${guest["name"]}'s group information. Please wait...`} />;
    }

    if (isError) {
      return (
        <Error
          errorInfo={{
            status: 500,
            message: "There was an unexpected error while pulling guest data. Please try again later.",
            error: error?.message,
          }}
        />
      );
    }
    //#region anne marie template
    return (
      <>
        <div id="anne-marie-container">
          {anneGroups && anneGroups.length > 0 && (
            <p>The name you selected shows up more than once. Please select which group you are trying to access:</p>
          )}
          <div>
            {anneGroups &&
              anneGroups.map((group) => (
                <div key={group?.group_name}>
                  <p>Group Name: {group?.group_name}</p>
                  <div>
                    <p>Guests:</p>
                    {group?.guests.map((guest) => {
                      if (guest.additional_guest_type === "dependent") {
                        return <p key={guest.guest_id}>{guest.name} - Child/Dependent RSVP</p>;
                      }
                      if (guest.additional_guest_type === "plus_one") {
                        return <p key={guest.guest_id}>{guest.name} - Plus One RSVP</p>;
                      }
                      return <p key={guest.guest_id}>{guest.name}</p>;
                    })}
                  </div>
                  <div className="btn-container">
                    <button
                      className="btn-link btn-xl"
                      onClick={() => handleConfirmation(true, group["group_name"], group["guests"][0].group_id)}
                    >
                      Yes, this is me/my group!
                    </button>
                  </div>
                </div>
              ))}
          </div>
          <div className="btn-container">
            <button
              className="btn-link btn-xl"
              onClick={() => {
                handleConfirmation(false, "", 0);
              }}
            >
              No, lets search names again.
            </button>
          </div>
        </div>
      </>
    );
  };

  //#region rsvp confirm queries
  const { isPending, isFetching, isError, data, error } = useQuery<GroupData, ErrorType>({
    queryKey: ["groupData"],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/guests/group/${guest["group_id"]}`);

      if (!response.ok) {
        const errorData: ErrorType = await response.json();
        throw errorData;
      }

      return await response.json();
    },
  });

  if (isPending || isFetching) {
    return <Loading loadingText={`Loading ${guest["name"]}'s group information. Please wait...`} />;
  }

  if (isError) {
    return <Error errorInfo={error} />;
  }

  //#region rsvp confirmaion tmeplate
  return (
    <div id="rsvp-confirmation-container">
      {guest.name === "Anne Marie McKinstry" ? (
        <div id="anne-marie">
          <AnneMarieConfirmation anneMarieData={anneMarieData} />
        </div>
      ) : (
        <div id="no-anne-marie">
          <p>Please confirm that this is the correct group information that you are trying to RSVP for:</p>
          <p>{data["group_name"]}</p>
          <div>
            <p>Guests:</p>
            {data["guests"].map((guest) => {
              if (guest.additional_guest_type === "dependent")
                return <p key={guest.guest_id}>{guest.name} - Child/Dependent RSVP</p>;
              if (guest.additional_guest_type === "plus_one")
                return <p key={guest.guest_id}>{guest.name} - Plus One RSVP</p>;
              return <p key={guest.guest_id}>{guest.name}</p>;
            })}
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
                handleConfirmation(false, "", 0);
              }}
            >
              No, lets search again.
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

//#region rsvp lookup
function RSVPLookup({ data, handleGroupSelect }: { data: Guest[]; handleGroupSelect: ({ id, name }) => void }) {
  const [inputValue, setInputValue] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  let anneMarieData: Guest[] = [];

  let reducedData: Guest[] = [];

  let hasKeptOnePending = false;

  data.forEach((guest) => {
    if (guest.name === "Anne Marie McKinstry") {
      anneMarieData.push(guest);
      if (!hasKeptOnePending) {
        reducedData.push(guest);
        hasKeptOnePending = true;
      }
    } else {
      reducedData.push(guest);
    }
  });

  const handleConfirmation = (confirmation: boolean, groupName: string, groupId: number) => {
    if (confirmation) {
      handleGroupSelect({ id: groupId, name: groupName });
    } else {
      setShowConfirmation(false);
      setSelectedGuest(null);
      setInputValue("");
    }
  };
  //#region rsvp lookup template
  return (
    <div id="rsvp-lookup-container">
      {!showConfirmation ? (
        <div>
          <p>Lookup your name to access your / your groups RSVP Guest Portal.</p>
          <Autocomplete
            // might move sorting to backend - because might combine it with duplication handling
            options={reducedData.sort((a, b) => {
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
            getOptionLabel={(option: any) =>
              option.name === "Anne Marie McKinstry" ? "Anne Marie McKinstry *" : option.name
            }
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
        selectedGuest && (
          <RSVPConfirmation
            guest={selectedGuest}
            handleConfirmation={handleConfirmation}
            anneMarieData={anneMarieData}
          />
        )
      )}
    </div>
  );
}

export default RSVPLookup;
