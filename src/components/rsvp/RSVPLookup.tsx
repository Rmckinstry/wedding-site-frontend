import React, { useState } from "react";
import { TextField, Autocomplete } from "@mui/material";
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

    const refetchAllAnneMarieQueries = () => {
      anneMarieQueries.forEach((queryResult) => {
        queryResult.refetch();
      });
    };
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
          tryEnabled={true}
          handleRetry={refetchAllAnneMarieQueries}
        />
      );
    }
    //#region anne marie template
    return (
      <>
        <div id="anne-marie-container" className="flex-col" style={{ gap: "2.5rem" }}>
          {anneGroups && anneGroups.length > 0 && (
            <p className="secondary-text font-sm-med">
              The name you selected shows up more than once. Please select which group you are trying to access:
            </p>
          )}
          <div className="flex-row" style={{ alignItems: "start", gap: "5rem" }}>
            {anneGroups &&
              anneGroups.map((group) => (
                <div className="flex-col" key={group?.group_name}>
                  <p className="font-sm-med strong-text">Group: {group?.group_name}</p>
                  <div>
                    <p className="font-sm-med contain-text-center" style={{ textDecoration: "underline" }}>
                      Guests:
                    </p>
                    {group?.guests.map((guest) => {
                      if (guest.additional_guest_type === "dependent") {
                        return (
                          <p className="font-sm-med" key={guest.guest_id}>
                            {guest.name} - Child/Dependent RSVP
                          </p>
                        );
                      }
                      if (guest.additional_guest_type === "plus_one") {
                        return (
                          <p className="font-sm-med" key={guest.guest_id}>
                            {guest.name} - Plus One RSVP
                          </p>
                        );
                      }
                      return (
                        <p className="font-sm-med" key={guest.guest_id} style={{ margin: ".5rem" }}>
                          {guest.name}
                        </p>
                      );
                    })}
                  </div>
                  <div className="btn-container">
                    <button
                      className="btn-rsvp-sm"
                      onClick={() => handleConfirmation(true, group["group_name"], group["guests"][0].group_id)}
                    >
                      Select group.
                    </button>
                  </div>
                </div>
              ))}
          </div>
          <div>
            <button
              className="btn-rsvp"
              onClick={() => {
                handleConfirmation(false, "", 0);
              }}
            >
              Search names again.
            </button>
          </div>
        </div>
      </>
    );
  };

  //#region rsvp confirm queries
  const { isPending, isFetching, isError, data, error, refetch } = useQuery<GroupData, ErrorType>({
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
    return <Error errorInfo={error} tryEnabled={true} handleRetry={refetch} />;
  }

  //#region rsvp confirmaion tmeplate
  return (
    <div id="rsvp-confirmation-container">
      {guest.name === "Anne Marie McKinstry" ? (
        <div id="duplicate">
          <AnneMarieConfirmation anneMarieData={anneMarieData} />
        </div>
      ) : (
        <div className="flex-col" style={{ gap: "2rem" }} id="no-duplicate">
          <p className="secondary-text font-sm-med">
            Please confirm that this is the correct group information that you are trying to RSVP for:
          </p>
          <p className="font-sm-med strong-text">Group Name: {data["group_name"]}</p>
          <div className="flex-row" style={{ alignItems: "start", gap: "3rem" }}>
            <div id="rsvp-confirm-guest-container" className="flex-col">
              <p className="font-sm-med" style={{ textDecoration: "underline" }}>
                Guests:
              </p>
              {data["guests"].map((guest) => {
                if (!guest.additional_guest_type) {
                  return (
                    <p className="font-sm-med" key={guest.guest_id}>
                      {guest.name}
                    </p>
                  );
                }
                return null;
              })}
            </div>

            {/* Check if there are any additional guests before rendering the div */}
            {data["guests"].some((guest) => guest.additional_guest_type) && (
              <div id="rsvp-confirm-addit-container" className="flex-col">
                <p className="font-sm-med" style={{ textDecoration: "underline" }}>
                  Additional Guests:
                </p>
                {data["guests"].map((guest) => {
                  if (guest.additional_guest_type === "dependent") {
                    return (
                      <p className="font-sm-med" key={guest.guest_id}>
                        {guest.name} - Child RSVP
                      </p>
                    );
                  }
                  if (guest.additional_guest_type === "plus_one") {
                    return (
                      <p className="font-sm-med" key={guest.guest_id}>
                        {guest.name} - Plus One RSVP
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          <div className="btn-container">
            <button
              className="btn-rsvp"
              onClick={() => handleConfirmation(true, data["group_name"], guest["group_id"])}
            >
              Yes, this is my group!
            </button>
            <button
              className="btn-rsvp"
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
  const [openPopper, setOpenPopper] = useState(false);

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
        <div className="flex-col flex-col-lg">
          <p className="font-med">Lookup your name to access your / your groups RSVP Guest Portal.</p>
          <Autocomplete
            open={openPopper}
            onOpen={() => {
              // Open only if there's input value
              if (inputValue.length > 0) {
                setOpenPopper(true);
              }
            }}
            onClose={() => setOpenPopper(false)}
            options={reducedData}
            getOptionLabel={(option) =>
              option.name === "Anne Marie McKinstry" ? "Anne Marie McKinstry *" : option.name
            }
            value={selectedGuest}
            onChange={(event: any, newValue: any) => {
              setSelectedGuest(newValue);
              setOpenPopper(false);
              if (newValue === null) {
                setInputValue("");
              }
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
              if (newInputValue.length > 0) {
                setOpenPopper(true);
              } else {
                setOpenPopper(false);
              }
            }}
            disablePortal
            sx={{ width: "30%" }}
            renderInput={(params) => <TextField {...params} label="Enter Guest Name" />}
            forcePopupIcon={false}
          />
          <div className="btn-container">
            <button disabled={!selectedGuest} className="btn-rsvp" onClick={() => setShowConfirmation(true)}>
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
