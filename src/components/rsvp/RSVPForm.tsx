import React, { useState, useEffect, useCallback } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormLabel,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import { ErrorType, GroupData, RSVPResponseType, SongRequestError } from "../../utility/types";
import { useMutation } from "@tanstack/react-query";
import Error from "../utility/Error.tsx";
import Loading from "../utility/Loading.tsx";
import EventIcon from "@mui/icons-material/Event";
import { useNavigation } from "../../context/NavigationContext.tsx";
import { isValidInput } from "../../utility/util.ts";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

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
  const [songInputsCount, setSongInputsCount] = useState<{ [guestId: string]: number }>({});
  const [directToRegistry, setDirectToRegistry] = useState<boolean>(false);

  // tracking if every guest has responded to rsvp form step 1
  const isRSVPStepValid = rsvps.every((rsvp) => rsvp.attendance !== "");

  const allGuestsAttendingFalse = rsvps.every((rsvp) => rsvp.attendance === false);

  //used for navigation context
  const { navigateTo } = useNavigation();

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
        spotify: [],
      }));
      setRsvps(newRsvps);

      // Initialize song inputs count when groupData changes
      const initialCounts = groupData.guests.reduce(
        (acc, guest) => ({
          ...acc,
          [guest.guest_id]: 0,
        }),
        {}
      );
      setSongInputsCount(initialCounts);
    }
  }, [groupData, setRsvps]);

  // initial rsvps setter
  useEffect(() => {
    resetRSVPs();
  }, [groupData, resetRSVPs]);

  const handleRegistryButtonClick = () => {
    navigateTo(3);
    //registry
  };

  //#region  stepper controls
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

  //#region  submit
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

  const submitRsvpsMutation = useMutation<RSVPResponseType, ErrorType, { rsvpList: SubmitData[] }>({
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

      return response.json() as Promise<RSVPResponseType>;
    },
    onSuccess: (data) => {
      const hasChildOrDep = data["data"]?.some((rsvp) => {
        const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guest_id);
        return rsvp.attendance && (guest?.has_dependents || guest?.plus_one_allowed);
      });

      setDirectToRegistry(!hasChildOrDep);
      console.log("Response from server:", data);
    },
    onError: (error: ErrorType) => {
      console.log(error);
      console.error("Error submitting RSVP:", error.message);
    },
  });

  //#region handle change
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

  const handleSongRequestChange = (guestId: number, index: number, key: string, value: string) => {
    setRsvps((prev) =>
      prev.map((rsvp) => {
        if (rsvp.guestId !== guestId) return rsvp;

        const newSpotify = [...rsvp.spotify];
        let currentTitle = "";
        let currentArtist = "";

        if (newSpotify[index] && newSpotify[index].includes(" - ")) {
          [currentTitle, currentArtist] = newSpotify[index].split(" - ");
        }

        const updatedTitle = key === "title" ? value : currentTitle;
        const updatedArtist = key === "artist" ? value : currentArtist;

        newSpotify[index] = updatedTitle || updatedArtist ? `${updatedTitle || ""} - ${updatedArtist || ""}` : "";

        const newErrorsForGuest = [...(songValidationErrors[guestId] || [])];
        let titleError = false;
        let artistError = false;
        let errorMessage = "";

        const isTitleEmpty = updatedTitle.length === 0;
        const isArtistEmpty = updatedArtist.length === 0;

        const isTitleInvalid = !isValidInput(updatedTitle);
        const isArtistInvalid = !isValidInput(updatedArtist);

        //only check for errors is either title or artist is not empty
        // both being empty is valid as song requests are not required
        if (isTitleEmpty && isArtistEmpty) {
        } else if (!isTitleEmpty && isArtistEmpty) {
          //Title has content, Artist is empty
          artistError = true;
          errorMessage = "Artist is required when a song name is entered.";
        }
        //Artist has content, Title is empty
        else if (isTitleEmpty && !isArtistEmpty) {
          titleError = true;
          errorMessage = "Song name is required when an artist is entered.";
        }
        //Both have content, check for valid input characters
        else {
          if (isTitleInvalid) {
            titleError = true;
            errorMessage = "Song name must contain letters or numbers.";
          }
          if (isArtistInvalid) {
            artistError = true;
            errorMessage = errorMessage
              ? errorMessage + " Artist must contain letters or numbers."
              : "Artist must contain letters or numbers.";
          }
        }

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

  const handleAddSong = (guestId: number, maxRequests: number) => {
    // Check if there are errors for this guest
    const hasErrors = songValidationErrors[guestId]?.some((error) => error.title || error.artist);

    // Get current number of inputs
    const currentInputs = songInputsCount[guestId] || 0;

    // Check if guest has requests remaining
    if (!hasErrors && currentInputs < maxRequests) {
      setSongInputsCount((prev) => ({
        ...prev,
        [guestId]: currentInputs + 1,
      }));

      // Add empty song slot to rsvp
      setRsvps((prev) =>
        prev.map((rsvp) => {
          if (rsvp.guestId !== guestId) return rsvp;
          return { ...rsvp, spotify: [...rsvp.spotify, ""] };
        })
      );

      // Initialize error state for the new song input
      setSongValidationErrors((prevErrors) => ({
        ...prevErrors,
        [guestId]: [
          ...(prevErrors[guestId] || []),
          {
            title: false,
            artist: false,
            message: "",
          },
        ],
      }));
    }
  };

  const handleDeleteSong = (guestId: number, index: number) => {
    //remove song from rsvps spotify property
    setRsvps((prev) =>
      prev.map((rsvp) => {
        if (rsvp.guestId !== guestId) return rsvp;
        // removing song based off of index
        const updatedSpotify = rsvp.spotify.filter((_, idx) => idx !== index);
        return { ...rsvp, spotify: updatedSpotify };
      })
    );

    //reset error index
    setSongValidationErrors((prevErrors) => {
      const currentErrors = prevErrors[guestId] || [];

      const updatedErrors = currentErrors.map((error, idx) => {
        if (idx === index) {
          return {
            title: false,
            artist: false,
            message: "",
          };
        }
        return error;
      });

      return {
        ...prevErrors, // Keep all other guest errors as they are
        [guestId]: updatedErrors, // Update the errors for this specific guestId
      };
    });

    //add 1 to input count
    const currentInputs = songInputsCount[guestId] || 0;

    setSongInputsCount((prev) => ({
      ...prev,
      [guestId]: currentInputs + -1,
    }));
  };

  //for debugging
  useEffect(() => {
    console.log("RSVP useEffect debugger");
    console.log(rsvps);
  }, [rsvps]);

  //#region template
  return (
    <>
      <div id="rsvp-form-container">
        <div>
          {/* stepper */}
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
          {/* state template */}
          {submitRsvpsMutation.isPending || submitRsvpsMutation.isError || submitRsvpsMutation.isSuccess ? (
            <div>
              {submitRsvpsMutation.isPending && (
                <div>
                  <Loading loadingText={"Submitting your RSVP(s). Please wait..."} />
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
                <div className="flex-col" style={{ gap: "2rem", marginTop: "2rem" }}>
                  <p className="font-med contain-text-center">Your RSVP(s) were successfully submitted. Thank you!</p>
                  {directToRegistry ? (
                    <div className="flex-col outline" style={{ gap: "2rem" }}>
                      <div className="flex-col">
                        <p className="font-sm-med contain-text-center">
                          If you are looking for gift ideas, our registry is available through the button below or you
                          can use the menu above.
                        </p>
                        <button className="btn-rsvp" onClick={handleRegistryButtonClick}>
                          Registry
                        </button>
                      </div>
                      <div className="flex-col">
                        <p className="font-sm contain-text-center">
                          Want to make a song request, update your email, or view your confirmation? Head over to our
                          RSVP portal.
                        </p>
                        <button className="btn-rsvp-sm" onClick={sendRefresh}>
                          RSVP Portal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-col outline" style={{ gap: "2rem" }}>
                      <div className="flex-col">
                        <p className="font-sm-med contain-text-center">
                          Ready to add a plus-one or child to your RSVP? You can do that, make a song request, update
                          your email, or view your confirmation by heading over to our RSVP portal.
                        </p>
                        <button className="btn-rsvp" onClick={sendRefresh}>
                          RSVP Portal
                        </button>
                      </div>
                      <div className="flex-col">
                        <p className="font-sm contain-text-center">
                          If you are looking for gift ideas, our registry is available through the button below or you
                          can use the menu above.
                        </p>
                        <button className="btn-rsvp-sm" onClick={handleRegistryButtonClick}>
                          Registry
                        </button>
                      </div>
                    </div>
                  )}
                  {/* temporary */}
                </div>
              )}
            </div>
          ) : (
            <div id="rsvp-card-container">
              {/* RSVP Card */}
              {activeStep === 0 && (
                <div id="rsvp-form-card-container" className="rsvp-card">
                  <p className="font-sm-med">Wedding Day</p>
                  <div id="event-icon-container" className="flex-row-gap">
                    <EventIcon />
                    <p className="font-sm">Saturday, November 15, 2025</p>
                  </div>
                  {rsvps.map((rsvp) => {
                    const guest = groupData.guests.find((g) => g.guest_id === rsvp.guestId);
                    const attendanceToggleValue =
                      rsvp.attendance === true ? "accept" : rsvp.attendance === false ? "decline" : null;

                    const handleToggleChange = (event, newToggleValue) => {
                      if (newToggleValue !== null) {
                        handleAttendanceChange(rsvp.guestId, newToggleValue === "accept" ? true : false);
                      }
                    };

                    return (
                      <div key={`rsvp-guest-${rsvp.guestId}`}>
                        <FormControl component="fieldset" fullWidth>
                          <div className="rsvp-form-action-container">
                            <FormLabel component="legend">{guest?.name}</FormLabel>
                            <ToggleButtonGroup
                              sx={{
                                display: "flex",
                                gap: "2rem",
                              }}
                              value={attendanceToggleValue}
                              exclusive
                              onChange={handleToggleChange}
                              aria-label={`RSVP for ${guest?.name}`}
                              color="primary"
                            >
                              <ToggleButton
                                sx={{ width: "10rem", height: "2.5rem" }}
                                value="accept"
                                aria-label="Accept Invitation"
                              >
                                {rsvp.attendance === true ? "Accepted" : "Accept"}
                              </ToggleButton>
                              <ToggleButton
                                sx={{ width: "10rem", height: "2.5rem" }}
                                value="decline"
                                aria-label="Decline Invitation"
                              >
                                {rsvp.attendance === false ? "Declined" : "Decline"}
                              </ToggleButton>
                            </ToggleButtonGroup>
                          </div>
                        </FormControl>

                        {rsvp.attendance && guest?.plus_one_allowed && (
                          <p style={{ marginTop: "1rem" }}>
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
                    <div>
                      <p>
                        Note: One or more guests can bring children or dependents. Children/dependents{" "}
                        <strong style={{ textDecoration: "underline" }}>have to be added</strong> after submitting the
                        RSVP.
                      </p>
                    </div>
                  )}

                  <button id="rsvp-form-continue-btn" disabled={!isRSVPStepValid} onClick={handleNext}>
                    Continue
                  </button>
                </div>
              )}
              {activeStep === 1 && (
                // song request card
                <div id="song-request-card-container" className="rsvp-card">
                  <div id="song-request-header" className="flex-col">
                    <p className="font-sm-med strong-text" style={{ marginBottom: "1rem" }}>
                      Add Song Requests
                    </p>
                    <p className="font-sm contain-text-center secondary-text">
                      <span style={{ textDecoration: "underline" }}>Undecided? </span>You can always add songs later
                      after submitting your RSVP via the RSVP Portal!
                    </p>
                  </div>

                  {rsvps
                    .filter((rsvp) => rsvp.attendance === true)
                    .map((rsvp) => {
                      const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guestId);
                      const requestsLeft = (guest?.song_requests || 0) - (songInputsCount[rsvp.guestId] || 0);

                      return (
                        <FormControl key={`rsvp-guest-${rsvp.guestId}`}>
                          <div className="guest-song-container">
                            <FormLabel>
                              {guest?.name} - {requestsLeft} song requests left
                            </FormLabel>

                            <div className="flex-col-start">
                              {rsvp.spotify.map((request, index) => {
                                const [title, artist] = request ? request.split(" - ") : ["", ""];
                                const errors = songValidationErrors[rsvp.guestId]?.[index] || {
                                  title: false,
                                  artist: false,
                                  message: "",
                                };
                                return (
                                  <div key={index} className="song-form-inputs flex-row-gap" style={{ gap: "2rem" }}>
                                    <TextField
                                      onChange={(e) =>
                                        handleSongRequestChange(rsvp.guestId, index, "title", e.target.value)
                                      }
                                      value={title || ""}
                                      id={`song-request-title-${index}`}
                                      label="Song Title"
                                      error={errors.title}
                                      helperText={errors.title ? errors.message : ""}
                                      variant="standard"
                                      sx={{ width: "17rem" }}
                                    />
                                    <TextField
                                      onChange={(e) =>
                                        handleSongRequestChange(rsvp.guestId, index, "artist", e.target.value)
                                      }
                                      value={artist || ""}
                                      id={`song-request-artist-${index}`}
                                      label="Song Artist"
                                      error={errors.artist}
                                      helperText={errors.artist ? errors.message : ""}
                                      variant="standard"
                                      sx={{ width: "17rem" }}
                                    />
                                    <Tooltip title="Remove Song">
                                      <button
                                        className="btn-stripped icon"
                                        aria-label="delete song"
                                        onClick={() => {
                                          handleDeleteSong(rsvp.guestId, index);
                                        }}
                                      >
                                        <DeleteForeverIcon />
                                      </button>
                                    </Tooltip>
                                  </div>
                                );
                              })}
                            </div>

                            <div style={{ marginTop: "1rem" }}>
                              <button
                                onClick={() => handleAddSong(rsvp.guestId, guest?.song_requests || 0)}
                                disabled={
                                  requestsLeft <= 0 ||
                                  songValidationErrors[rsvp.guestId]?.some((error) => error.title || error.artist)
                                }
                                className="btn-rsvp-sm"
                                style={{ fontSize: "1rem", padding: ".25rem 1.25rem" }}
                              >
                                Add Song
                              </button>
                            </div>
                          </div>
                        </FormControl>
                      );
                    })}

                  <div className="btn-container" style={{ gap: "2rem" }}>
                    <button className="btn-rsvp-sm" style={{ padding: ".5rem 10%", flexGrow: 1 }} onClick={handleBack}>
                      Back
                    </button>
                    <button
                      disabled={isSongTabInvalid}
                      className="btn-rsvp-sm"
                      style={{ padding: ".5rem 10%", flexGrow: 1 }}
                      onClick={handleNext}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              {activeStep === 2 && (
                //Confirmation card
                <div id="confirmation-card-container" className="rsvp-card" style={{ width: "80%" }}>
                  <div className="flex-col">
                    <p className="font-sm-med">RSVP Confirmation</p>
                    <p className="font-sm strong-text contain-text-center" style={{ textDecoration: "underline" }}>
                      Please confirm that all information shown below is correct and submit.
                    </p>
                  </div>

                  <div className="flex-row-gap" style={{ justifyContent: "center" }}>
                    <p className="font-sm strong-text confirmation-header">Group Name: </p>
                    <p className="font-sm">{groupData.group_name}</p>
                  </div>
                  {rsvps.map((rsvp, index) => {
                    const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guestId);
                    const hasSongs = rsvp.spotify.some((index) => index !== "");
                    return (
                      <div key={index} className="user-confirm-rsvp-container">
                        <div className="flex-row-gap">
                          <p className="strong-text font-sm confirmation-header">Guest: </p>
                          <p className="font-sm">{guest?.name}</p>
                        </div>
                        <div className="flex-row-gap">
                          <p className="strong-text font-sm confirmation-header">Attending: </p>
                          <p className="font-sm">{rsvp.attendance ? "Yes!" : "No"}</p>
                        </div>
                        {rsvp.attendance && hasSongs && (
                          <div>
                            <p className="strong-text font-sm confirmation-header">Requested Songs:</p>
                            {rsvp.spotify
                              .filter((song) => song !== "")
                              .map((song, index) => (
                                <p
                                  className="font-sm"
                                  style={{ marginLeft: "1rem", marginTop: "1rem" }}
                                  key={index + song}
                                >
                                  • {song}
                                </p>
                              ))}
                          </div>
                        )}
                        {rsvp.attendance && !hasSongs && (
                          <p className="font-sm secondary-text">
                            No songs requested yet! This can be done after you submit your RSVP via the RSVP Portal.
                          </p>
                        )}
                        {rsvp.attendance && guest?.plus_one_allowed && (
                          <p className="font-sm secondary-text">
                            Plus one <strong>available</strong> for {guest.name}! You can add the extra RSVP{" "}
                            <span className="confirmation-header">after</span> submitting this one via the RSVP Portal.
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      <p className="font-sm secondary-text">
                        One or more guests in this group are able to add child/dependent RSVPS. These can be added
                        <span className="confirmation-header"> after</span> your RSVP is submitted via the RSVP Portal.
                      </p>
                      <p className="font-sm secondary-text">
                        <strong>Note: </strong>It is required to add these RSVPs prior to the deadline for your
                        children/dpendents to be counted.
                      </p>
                    </div>
                  )}
                  <div className="btn-container" style={{ gap: "2rem" }}>
                    <button
                      className="btn-rsvp-sm btn-alt"
                      style={{ flexGrow: 1, width: "10%" }}
                      onClick={handleReset}
                      disabled={submitRsvpsMutation.isPending}
                    >
                      Reset
                    </button>
                    <button
                      className="btn-rsvp-sm"
                      style={{ flexGrow: 1, width: "10%" }}
                      onClick={handleBack}
                      disabled={submitRsvpsMutation.isPending}
                    >
                      Back
                    </button>

                    <button
                      className="btn-rsvp-sm"
                      style={{ flexGrow: 1, width: "10%" }}
                      onClick={handleSubmit}
                      disabled={submitRsvpsMutation.isPending}
                    >
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
