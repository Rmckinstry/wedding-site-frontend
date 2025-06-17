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
import { GroupData } from "../../utility/types";

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

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

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

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    resetRSVPs();
    setActiveStep(0);
    setError(null);
    setIsLoading(false);
    setIsSubmitted(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const submitData: SubmitData[] = rsvps.map((rsvp: RSVPPost) => {
      // Convert attendance to boolean
      const attendance = typeof rsvp.attendance === "string" ? rsvp.attendance !== "" : rsvp.attendance;

      const songString: string = rsvp.spotify.reduce((acc, song) => {
        return acc.length === 0 ? song : acc + "," + song;
      }, "");

      return {
        attendance,
        guestId: rsvp.guestId,
        spotify: songString,
      };
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rsvps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rsvpList: submitData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Response from server:", result);
      setIsLoading(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      setIsLoading(false);
      setError(error);
    }
  };

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
        return { ...rsvp, spotify: newSpotify };
      })
    );
  };

  //for debugging
  useEffect(() => {
    console.log("RSVP useEffect debugger");
    console.log(rsvps);
  }, [rsvps]);

  const isFormValid = rsvps.every((rsvp) => rsvp.attendance !== "");

  return (
    <>
      <div id="rsvp-form-container">
        <div>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {isLoading || error || isSubmitted ? (
            <div>
              {isLoading && (
                <div>
                  <p>Submitting RSVPs. Please wait...</p>
                </div>
              )}
              {error && (
                <div>
                  <p>We ran into an error while submitting your RSVP. Please try again later.</p>
                </div>
              )}
              {isSubmitted && (
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
                    <button disabled={!isFormValid} className="btn-link" onClick={handleNext}>
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
                          <p>{rsvp.attendance}</p>
                          <FormControl key={`rsvp-guest-${rsvp.guestId}`}>
                            <FormLabel>{guest?.name}</FormLabel>
                            {rsvp.spotify.map((request, index) => {
                              const [title, artist] = request ? request.split(" - ") : ["", ""];
                              return (
                                <div className="song-request-container">
                                  <TextField
                                    onChange={(e) =>
                                      handleSongRequestChange(rsvp.guestId, index, "title", e.target.value)
                                    }
                                    value={title || ""}
                                    id="song-request-title"
                                    label="Song Title"
                                  />
                                  <TextField
                                    onChange={(e) =>
                                      handleSongRequestChange(rsvp.guestId, index, "artist", e.target.value)
                                    }
                                    value={artist || ""}
                                    id="song-request-author"
                                    label="Song Author"
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
                    <button className="btn-link" onClick={handleNext}>
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
                    return (
                      <div>
                        <p>Name: {guest?.name}</p>
                        <p>Attending: {rsvp.attendance ? "Yes" : "No"}</p>
                        {rsvp.attendance && (
                          <div>
                            <p>Requested Songs</p>
                            {rsvp.spotify
                              .filter((song) => song !== "")
                              .map((song) => (
                                <p>{song}</p>
                              ))}
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
                    <button className="btn-link" onClick={handleBack}>
                      Back
                    </button>
                    <button className="btn-link" onClick={handleReset}>
                      Reset
                    </button>
                    <button className="btn-link" onClick={handleSubmit}>
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
