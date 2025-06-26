import React, { useState, useEffect, useCallback } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
  FormLabel,
  TextField,
} from "@mui/material";
import { ErrorType, GroupData, SongRequestError } from "../../utility/types";
import { useMutation } from "@tanstack/react-query";
import Error from "../utility/Error.tsx";

type RSVPPost = {
  guestId: number;
  attendance: boolean | "";
  spotify: string[];
};

type SubmitData = {
  guestId: number;
  attendance: boolean | "";
  spotify: string;
};

const steps = ["Guests", "Song Requests", "Confirmation"];

function RSVPForm({ groupData, sendRefresh }: { groupData: GroupData; sendRefresh: () => void }) {
  const [activeStep, setActiveStep] = useState(0);
  const [rsvps, setRsvps] = useState<RSVPPost[]>([]);
  const [songValidationErrors, setSongValidationErrors] = useState<{ [guestId: string]: SongRequestError[] }>({});

  const isRSVPStepValid = rsvps.every((rsvp) => rsvp.attendance !== "");

  const allGuestsAttendingFalse = rsvps.every((rsvp) => rsvp.attendance === false);

  // Determine if the "Song Requests" step should be disabled
  const isSongRequestTabDisabled = allGuestsAttendingFalse;

  const isSongTabInvalid = Object.values(songValidationErrors)
    .map((errorObject) => errorObject.some((combo) => combo.title || combo.artist))
    .some((value) => value);

  const separator = "\u00A7";

  // Memoize resetRSVPs
  const resetRSVPs = useCallback(() => {
    if (groupData && groupData.guests) {
      const newRsvps: RSVPPost[] = groupData.guests.map((guest) => ({
        guestId: guest.guest_id,
        attendance: "",
        spotify: Array(guest.song_requests).fill(""),
      }));
      setRsvps(newRsvps);
    }
  }, [groupData, setRsvps]);

  // initial rsvps setter
  useEffect(() => {
    resetRSVPs();
  }, [groupData, resetRSVPs]);

  // stepper controls
  const handleNext = () => {
    //default behavior
    let newActiveStep = activeStep + 1;

    // If the next step would be "Song Requests" AND it's disabled, skip it
    if (steps[newActiveStep] === "Song Requests" && isSongRequestTabDisabled) {
      newActiveStep = newActiveStep + 1; // Skip "Song Requests", go to "Confirmation"
    }

    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    //default behavior
    let newActiveStep = activeStep - 1;

    // If we're going back from "Confirmation" and "Song Requests" was skipped
    if (
      steps[activeStep] === "Confirmation" &&
      isSongRequestTabDisabled &&
      steps[newActiveStep] === "Song Requests" // This means we would normally go to Song Requests
    ) {
      newActiveStep = newActiveStep - 1; // Skip back past "Song Requests", go to "Guests"
    }

    setActiveStep(newActiveStep);
  };

  // resets errything for the form

  const handleReset = () => {
    resetRSVPs();
    setActiveStep(0);
  };

  const handleSubmit = async () => {
    const submitData: SubmitData[] = rsvps.map((rsvp: RSVPPost) => {
      // Convert attendance to boolean
      const attendance = typeof rsvp.attendance === "string" ? rsvp.attendance !== "" : rsvp.attendance;

      const songString: string = rsvp.spotify.reduce((acc, song) => {
        return acc.length === 0 ? song : acc + separator + song;
      }, "");

      return {
        attendance,
        guestId: rsvp.guestId,
        spotify: songString,
      };
    });

    submitRsvpsMutation.mutate({ rsvpList: submitData });
  };

  const submitRsvpsMutation = useMutation<ResponseType, ErrorType, { rsvpList: SubmitData[] }>({
    mutationFn: async (data) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rsvps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorBody: ErrorType = await response.json();
        throw errorBody;
      }

      return response.json() as Promise<ResponseType>;
    },
    onSuccess: (data) => {
      console.log("Response from server:", data);
    },
    onError: (error: ErrorType) => {
      console.log(error);
      console.error("Error submitting RSVP:", error.message);
    },
  });

  const handleAttendanceChange = (guestId: number, value: boolean) => {
    setRsvps((prev) =>
      prev.map((rsvp) =>
        rsvp.guestId === guestId
          ? {
              ...rsvp,
              attendance: value,
              spotify: !value ? Array(rsvp.spotify.length).fill("") : rsvp.spotify,
            }
          : rsvp
      )
    );
    if (!value) {
      setSongValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[guestId]; // Remove the entry for this guest
        return newErrors;
      });
    }
  };

  const handleSongRequestChange = (guestId, index, key: string, value: string) => {
    setRsvps((prev) =>
      prev.map((rsvp) => {
        if (rsvp.guestId !== guestId) return rsvp;
        const newSpotify = [...rsvp.spotify];
        // Split current song request, handling empty or malformed cases
        let currentTitle = "";
        let currentArtist = "";
        if (newSpotify[index] && newSpotify[index].includes(" - ")) {
          [currentTitle, currentArtist] = newSpotify[index].split(" - ");
        }
        // Update the relevant field
        const updatedTitle = key === "title" ? value : currentTitle;
        const updatedArtist = key === "artist" ? value : currentArtist;
        // Only concatenate if at least one field is non-empty
        newSpotify[index] = updatedTitle || updatedArtist ? `${updatedTitle || ""} - ${updatedArtist || ""}` : "";

        //creates array of exisiting guest errors or new if none exists
        const newErrorsForGuest = [...(songValidationErrors[guestId] || [])];
        let titleError = false;
        let artistError = false;
        let errorMessage = "";

        //setting errors and flags
        if (updatedTitle && !updatedArtist) {
          titleError = false;
          artistError = true;
          errorMessage = "Artist is required when a song title is entered.";
        } else if (!updatedTitle && updatedArtist) {
          titleError = true;
          artistError = false;
          errorMessage = "Song title is required when an artist is entered.";
        }

        // index refers to the specific song/artist combo in the array of songs - matches up with error
        newErrorsForGuest[index] = {
          title: titleError,
          artist: artistError,
          message: errorMessage,
        };

        setSongValidationErrors((prevErrors) => ({
          ...prevErrors,
          [guestId]: newErrorsForGuest,
        }));
        return { ...rsvp, spotify: newSpotify };
      })
    );
  };

  //for debugging
  useEffect(() => {
    console.log("RSVP useEffect debugger");
    console.log(rsvps);
  }, [rsvps]);

  return (
    <>
      <div id="rsvp-form-container">
        <div>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean; disabled?: boolean } = {};
              if (label === "Song Requests" && isSongRequestTabDisabled) {
                stepProps.disabled = true;
              }
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {submitRsvpsMutation.isPending || submitRsvpsMutation.isError || submitRsvpsMutation.isSuccess ? (
            <div>
              {submitRsvpsMutation.isPending && (
                <div>
                  <p>Submitting RSVPs. Please wait...</p>
                </div>
              )}
              {submitRsvpsMutation.isError && (
                <div>
                  <Error
                    errorInfo={submitRsvpsMutation.error}
                    tryEnabled={true}
                    handleRetry={submitRsvpsMutation.reset}
                  />
                </div>
              )}
              {submitRsvpsMutation.isSuccess && (
                <div>
                  <p>Your RSVPs were succesfully submitted. Thank you!</p>
                  <p>
                    Better message here (about visiting the portal to edit certain things and show message about
                    registry)
                  </p>
                  {/* temporary */}
                  <button onClick={sendRefresh}>RSVP Home</button>
                </div>
              )}
            </div>
          ) : (
            <div>
              {activeStep === 0 && (
                // Guest RSVP Question
                <div id="rsvp-card-container">
                  {rsvps.map((rsvp) => {
                    const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guestId);
                    return (
                      <div key={`rsvp-guest-${rsvp.guestId}`}>
                        <FormControl key={`rsvp-guest-${rsvp.guestId}`}>
                          <FormLabel>{guest?.name}</FormLabel>
                          <RadioGroup
                            name={`rsvp-${rsvp.guestId}-group`}
                            value={rsvp.attendance}
                            onChange={(e) =>
                              handleAttendanceChange(rsvp.guestId, e.target.value === "true" ? true : false)
                            }
                          >
                            <FormControlLabel value={true} control={<Radio />} label="Attending" />
                            <FormControlLabel value={false} control={<Radio />} label="Not Attending" />
                          </RadioGroup>
                        </FormControl>
                        {rsvp.attendance && guest?.plus_one_allowed && (
                          <p>
                            {guest.name} has a plus one for this invitation. Plus ones can be added{" "}
                            <strong style={{ textDecoration: "underline" }}>after the RSVP is submitted</strong> by
                            entering your name again in the RSVP portal.
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {rsvps.some(
                    (rsvp) =>
                      rsvp.attendance === true &&
                      groupData.guests.find((guest) => guest.guest_id === rsvp.guestId)?.has_dependents
                  ) && (
                    <p>
                      Note: One or more guests can bring children or dependents. Children/dependents{" "}
                      <strong style={{ textDecoration: "underline" }}>have to be added</strong> after submitting the
                      RSVP.
                    </p>
                  )}
                  <div className="btn-container">
                    <button disabled={!isRSVPStepValid} className="btn-link" onClick={handleNext}>
                      Next
                    </button>
                  </div>
                </div>
              )}
              {activeStep === 1 && (
                // song request card
                <div id="song-request-card-container">
                  {rsvps
                    .filter((rsvp) => rsvp.attendance === true)
                    .map((rsvp) => {
                      const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guestId);
                      return (
                        <div key={`song-container-${rsvp.guestId}-guest`}>
                          <FormControl key={`rsvp-guest-${rsvp.guestId}`}>
                            <FormLabel>{guest?.name}</FormLabel>
                            {rsvp.spotify.map((request, index) => {
                              const [title, artist] = request ? request.split(" - ") : ["", ""];
                              const errors = songValidationErrors[rsvp.guestId]?.[index] || {
                                title: false,
                                artist: false,
                                message: "",
                              };
                              return (
                                <div className="song-request-container">
                                  <TextField
                                    onChange={(e) =>
                                      handleSongRequestChange(rsvp.guestId, index, "title", e.target.value)
                                    }
                                    value={title || ""}
                                    id="song-request-title"
                                    label="Song Title"
                                    error={errors.title}
                                    helperText={errors.title ? errors.message : ""}
                                  />
                                  <TextField
                                    onChange={(e) =>
                                      handleSongRequestChange(rsvp.guestId, index, "artist", e.target.value)
                                    }
                                    value={artist || ""}
                                    id="song-request-author"
                                    label="Song Author"
                                    error={errors.artist}
                                    helperText={errors.artist ? errors.message : ""}
                                  />
                                </div>
                              );
                            })}
                          </FormControl>
                        </div>
                      );
                    })}
                  <div className="btn-container">
                    <button className="btn-link" onClick={handleBack}>
                      Back
                    </button>
                    <button disabled={isSongTabInvalid} className="btn-link" onClick={handleNext}>
                      Next
                    </button>
                  </div>
                </div>
              )}
              {activeStep === 2 && (
                //Confirmation card
                <div id="confirmation-card-container">
                  <p>Please confirm that all information shown below is correct, if not please go back and edit it.</p>

                  <div>
                    <p>Group Name: {groupData.group_name}</p>
                  </div>
                  {rsvps.map((rsvp) => {
                    const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guestId);
                    const hasSongs = rsvp.spotify.some((index) => index !== "");
                    return (
                      <div>
                        <p>Name: {guest?.name}</p>
                        <p>Attending: {rsvp.attendance ? "Yes" : "No"}</p>
                        {rsvp.attendance && hasSongs && (
                          <div>
                            <p>Requested Songs</p>
                            {rsvp.spotify
                              .filter((song) => song !== "")
                              .map((song) => (
                                <p>{song}</p>
                              ))}
                          </div>
                        )}
                        {rsvp.attendance && !hasSongs && (
                          <div>
                            <p>No songs requested yet! (This can be done after you submit the rsvp as well!)</p>
                          </div>
                        )}
                        {rsvp.attendance && guest?.plus_one_allowed && (
                          <p>
                            <strong>NOTE:</strong> {guest.name} has a plus one available. Plus ones can be added{" "}
                            <strong style={{ textDecoration: "underline" }}>after the RSVP is submitted</strong> by
                            entering your name again in the RSVP portal.
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {rsvps.some(
                    (rsvp) =>
                      rsvp.attendance === true &&
                      groupData.guests.find((guest) => guest.guest_id === rsvp.guestId)?.has_dependents
                  ) && (
                    <p>
                      Note: One or more guests can bring children or dependents. Children/dependents{" "}
                      <strong style={{ textDecoration: "underline" }}>have to be added</strong> after submitting the
                      RSVP.
                    </p>
                  )}
                  <div className="btn-container">
                    <button className="btn-link" onClick={handleBack} disabled={submitRsvpsMutation.isPending}>
                      Back
                    </button>
                    <button className="btn-link" onClick={handleReset} disabled={submitRsvpsMutation.isPending}>
                      Reset
                    </button>
                    <button className="btn-link" onClick={handleSubmit} disabled={submitRsvpsMutation.isPending}>
                      Submit RSVP
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default RSVPForm;
