import React, { useState, useEffect, useCallback } from "react";
import {
  FormControl,
  FormLabel,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  MobileStepper,
} from "@mui/material";
import { AdditionalGuest, ErrorType, GroupData, RSVPResponseType, SongRequestError } from "../../utility/types";
import { useMutation } from "@tanstack/react-query";
import Error from "../utility/Error.tsx";
import Loading from "../utility/Loading.tsx";
import EventIcon from "@mui/icons-material/Event";
import { useNavigation } from "../../context/NavigationContext.tsx";
import { isValidInput, isValidName } from "../../utility/util.ts";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

type RSVPFormObject = {
  guestId: number;
  attendance: boolean | "";
  spotify: string[];
  additionalGuests: AdditionalGuest[];
};

type RSVPPostObject = {
  guestId: number;
  attendance: boolean | "";
  spotify: string;
};

type RSVPPostBody = {
  groupId: number;
  rsvps: RSVPPostObject[];
  additional?: AdditionalGuest[];
};

function RSVPForm({ groupData, sendRefresh }: { groupData: GroupData; sendRefresh: () => void }) {
  //used for stepper
  const [activeStep, setActiveStep] = useState(0);

  const [rsvps, setRsvps] = useState<RSVPFormObject[]>([]);
  const [childrenRsvps, setChildrenRsvps] = useState<AdditionalGuest[]>([]);

  const [songValidationErrors, setSongValidationErrors] = useState<{ [guestId: string]: SongRequestError[] }>({});
  const [songInputsCount, setSongInputsCount] = useState<{ [guestId: string]: number }>({});
  const [directToRegistry, setDirectToRegistry] = useState<boolean>(false);
  const [anyAdditionalSubbmited, setAnyAdditionalSubbmited] = useState<boolean>(false);

  // tracking if every guest has responded to rsvp form step 1
  const isRSVPStepValid = rsvps.every((rsvp) => rsvp.attendance !== "");

  const allGuestsAttendingFalse = rsvps.every((rsvp) => rsvp.attendance === false);

  //used for navigation context
  const { navigateTo } = useNavigation();
  //steps for stepper component
  const steps = ["RSVPs", "Plus One", "Children", "Song Requests", "Confirmation"];

  //Tab checks
  const isSongRequestTabDisabled = allGuestsAttendingFalse;

  const isPlusOneTabEnabled = groupData.guests.some((guest) => {
    const rsvp = rsvps.find((rsvp) => rsvp.guestId === guest.guest_id);
    return guest.plus_one_allowed && rsvp?.attendance;
  });
  const isChildrenTabEnabled = groupData.guests.some((guest) => {
    const rsvp = rsvps.find((rsvp) => rsvp.guestId === guest.guest_id);
    return guest.has_dependents && rsvp?.attendance;
  });

  //validity checks
  const isSongTabInvalid = Object.values(songValidationErrors)
    .map((errorObject) => errorObject.some((combo) => combo.title || combo.artist))
    .some((value) => value);

  const isPlusOneInvalid = rsvps.some(
    (rsvp) => rsvp.additionalGuests.length > 0 && !isValidName(rsvp.additionalGuests[0].name)
  );

  const isChildrenInvalid = childrenRsvps.some((rsvp) => !isValidName(rsvp.name));

  const separator = "\u00A7";

  const designatedDependentGuest = groupData.guests.find(
    (guest) => guest.has_dependents && rsvps.some((rsvp) => rsvp.guestId === guest.guest_id && rsvp.attendance === true)
  );

  const isAddNewChildDisabled = () => {
    if (childrenRsvps.length === 0) return false;

    return childrenRsvps.some((rsvp) => rsvp.name === "");
  };

  // Memoize resetRSVPs
  const resetRSVPs = useCallback(() => {
    if (groupData && groupData.guests) {
      const newRsvps: RSVPFormObject[] = groupData.guests.map((guest) => ({
        guestId: guest.guest_id,
        attendance: "",
        spotify: [],
        additionalGuests: [],
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

    // plus one tab skip check
    if (newActiveStep === 1 && !isPlusOneTabEnabled) {
      newActiveStep = newActiveStep + 1;
    }

    // children tab skip check
    if (newActiveStep === 2 && !isChildrenTabEnabled) {
      newActiveStep = newActiveStep + 1;
    }

    // If the next step would be "Song Requests" AND it's disabled, skip it
    if (newActiveStep === 3 && isSongRequestTabDisabled) {
      newActiveStep = newActiveStep + 1;
    }

    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    // default behavior: move one step back
    let newActiveStep = activeStep - 1;

    // If we are currently on 'Song Requests' (index 3) or beyond,
    // and 'Song Requests' was disabled, then when moving back, skip it again.
    if (activeStep >= 3 && isSongRequestTabDisabled && newActiveStep === 3) {
      newActiveStep--;
    }

    // If we are currently on 'Children' (index 2) or beyond,
    // and 'Children' was disabled, then when moving back, skip it again.
    if (activeStep >= 2 && !isChildrenTabEnabled && newActiveStep === 2) {
      newActiveStep--;
    }

    // If we are currently on 'Plus One' (index 1) or beyond,
    // and 'Plus One' was disabled, then when moving back, skip it again.
    if (activeStep >= 1 && !isPlusOneTabEnabled && newActiveStep === 1) {
      newActiveStep--;
    }

    setActiveStep(newActiveStep);
  };

  // resets everything for the form
  const handleReset = () => {
    resetRSVPs();
    setActiveStep(0);
    setChildrenRsvps([]);
  };
  //#endregion stepper controls

  //#region  submit
  const handleSubmit = async () => {
    setAnyAdditionalSubbmited(false);

    // filtering out any children rsvps that have empty names (happens when add name is clicked and no name is entered or its deleted)
    const filteredChildren = childrenRsvps.length > 0 ? childrenRsvps.filter((rsvp) => rsvp.name.trim() !== "") : [];

    const submitBody: RSVPPostBody = {
      groupId: groupData.guests[0].group_id,
      rsvps: [],
      additional: [],
    };

    // eslint-disable-next-line array-callback-return
    rsvps.map((rsvp: RSVPFormObject) => {
      const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guestId);

      // Convert attendance to boolean
      const attendance = typeof rsvp.attendance === "string" ? rsvp.attendance !== "" : rsvp.attendance;

      //reduce song array into one long song string
      const songString: string = rsvp.spotify.reduce((acc, song) => {
        return acc.length === 0 ? song : acc + separator + song;
      }, "");

      submitBody.rsvps.push({
        attendance: attendance,
        guestId: guest!.guest_id,
        spotify: songString,
      });

      if (rsvp.guestId === designatedDependentGuest?.guest_id && filteredChildren.length > 0) {
        filteredChildren.forEach((child) => submitBody.additional?.push(child));
        setAnyAdditionalSubbmited(true);
      }

      if (rsvp.additionalGuests.length !== 0) {
        submitBody.additional?.push(rsvp.additionalGuests[0]);
        setAnyAdditionalSubbmited(true);
      }
    });

    submitRsvpsMutation.mutate({ rsvpList: submitBody });
  };

  const submitRsvpsMutation = useMutation<RSVPResponseType, ErrorType, { rsvpList: RSVPPostBody }>({
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
      if (anyAdditionalSubbmited || rsvps.every((rsvp) => rsvp.attendance !== true)) {
        //if children or plus ones already submitted direct to registry
        //if everyone said no in the group direct to registry
        setDirectToRegistry(true);
      } else {
        const createdRSVPs = data.data?.createdRSVPs;

        const hasChildOrDep = createdRSVPs?.some((rsvp) => {
          const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guest_id);
          return rsvp.attendance && (guest?.has_dependents || guest?.plus_one_allowed);
        });

        setDirectToRegistry(!hasChildOrDep);
      }

      console.log("Response from server:", data);
    },
    onError: (error: ErrorType) => {
      console.log(error);
      console.error("Error submitting RSVP:", error.message);
    },
  });
  //#endregion submit

  //#region handle change
  const handleAttendanceChange = (guestId: number, attendance: boolean) => {
    setRsvps((prev) =>
      prev.map((rsvp) =>
        rsvp.guestId === guestId
          ? {
              ...rsvp,
              attendance: attendance,
              spotify: !attendance ? Array(rsvp.spotify.length).fill("") : rsvp.spotify,
              additionalGuests: [],
            }
          : rsvp
      )
    );
    if (!attendance) {
      setSongValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[guestId]; // Remove the entry for this guest
        return newErrors;
      });
    }

    if (childrenRsvps.length !== 0 && guestId === childrenRsvps[0].guestId) {
      setChildrenRsvps([]);
    }
  };

  const handlePlusOneNameChange = (guestId: number, value: string) => {
    setRsvps((prev) =>
      prev.map((rsvp) => {
        if (rsvp.guestId === guestId) {
          const existingPlusOneIndex = rsvp.additionalGuests.findIndex((guest) => guest.type === "plus_one");
          let updatedAdditionalGuests: AdditionalGuest[];

          //plus one value for guest exists - replace name with new value
          if (existingPlusOneIndex !== -1) {
            if (value.trim().length === 0) {
              updatedAdditionalGuests = rsvp.additionalGuests.filter((_, index) => index !== existingPlusOneIndex);
            } else {
              updatedAdditionalGuests = rsvp.additionalGuests.map((additionalGuest, index) =>
                index === existingPlusOneIndex ? { ...additionalGuest, name: value } : additionalGuest
              );
            }
          } else {
            // need to create new plus one in additional guests
            const newPlusOne: AdditionalGuest = { name: value, type: "plus_one", guestId: guestId };

            updatedAdditionalGuests = [...rsvp.additionalGuests, newPlusOne];
          }
          return { ...rsvp, additionalGuests: updatedAdditionalGuests };
        } else {
          return rsvp;
        }
      })
    );
  };

  const handleChildNameChange = (value: string, index: number) => {
    setChildrenRsvps((prev) =>
      prev.map((child, i) => {
        if (i === index) {
          return { ...child, name: value };
        }
        return child;
      })
    );
  };

  const handleAddNewChild = (guestId: number) => {
    const newChildRsvp: AdditionalGuest = {
      name: "",
      type: "dependent",
      guestId: guestId,
    };
    setChildrenRsvps((prev) => {
      return [...prev, newChildRsvp];
    });
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
                        If you are looking for gift ideas, our registry is available through the button below or you can
                        use the menu above.
                      </p>
                      <button className="btn-rsvp" onClick={handleRegistryButtonClick}>
                        Registry
                      </button>
                    </div>
                    {/* only show portal msg if there is at least one person attending */}
                    {rsvps.some((rsvp) => rsvp.attendance === true) && (
                      <div className="flex-col">
                        <p className="font-sm contain-text-center">
                          Want to make a song request, update your email, or view your confirmation? Head over to our
                          RSVP portal.
                        </p>
                        <button className="btn-rsvp-sm" onClick={sendRefresh}>
                          RSVP Portal
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-col outline" style={{ gap: "2rem" }}>
                    <div className="flex-col">
                      <p className="font-sm-med contain-text-center">
                        Ready to add a plus-one or child to your RSVP? You can do that, make a song request, update your
                        email, or view your confirmation by heading over to our RSVP portal.
                      </p>
                      <button className="btn-rsvp" onClick={sendRefresh}>
                        RSVP Portal
                      </button>
                    </div>
                    <div className="flex-col">
                      <p className="font-sm contain-text-center">
                        If you are looking for gift ideas, our registry is available through the button below or you can
                        use the menu above.
                      </p>
                      <button className="btn-rsvp-sm" onClick={handleRegistryButtonClick}>
                        Registry
                      </button>
                    </div>
                  </div>
                )}
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
                    </div>
                  );
                })}
                <button id="rsvp-form-continue-btn" disabled={!isRSVPStepValid} onClick={handleNext}>
                  Continue
                </button>
              </div>
            )}
            {/* Plus One Card */}
            {activeStep === 1 && (
              <div id="plus-one-card-container" className="rsvp-card">
                <div id="plus-one-request-header" className="flex-col">
                  <p className="font-sm-med strong-text" style={{ marginBottom: "1rem" }}>
                    Add Plus One
                  </p>
                  <p className="font-sm contain-text-center secondary-text">
                    <strong>
                      <span style={{ textDecoration: "underline" }}>Undecided? </span>
                    </strong>
                    You can always add your plus one later after submitting your RSVP via the{" "}
                    <strong>RSVP Portal</strong>!
                  </p>
                </div>

                {rsvps
                  .filter((rsvp) => rsvp.attendance === true)
                  .map((rsvp, index) => {
                    const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guestId);

                    const plusOneGuest = rsvp.additionalGuests.find((ag) => ag.type === "plus_one");

                    // Get the name of the plus_one, or an empty string if not found
                    const plusOneName = plusOneGuest ? plusOneGuest.name : "";

                    if (guest?.plus_one_allowed) {
                      return (
                        <div key={index} className="flex-col-start" style={{ gap: "1rem", marginBottom: "1rem" }}>
                          <p className="font-sm">{guest.name} Plus One</p>
                          <div>
                            <TextField
                              value={plusOneName}
                              onChange={(e) => handlePlusOneNameChange(guest.guest_id, e.target.value)}
                              label="Add Plus One's Full Name"
                              sx={{ width: "20rem" }}
                            />
                          </div>
                        </div>
                      );
                    } else {
                      return null;
                    }
                  })}
                {isPlusOneInvalid && (
                  <p className="contain-text-center" style={{ color: "red" }}>
                    All Plus One's must be a first & last name.
                  </p>
                )}
                <div className="btn-container" style={{ gap: "2rem" }}>
                  <button className="btn-rsvp-sm" style={{ padding: ".5rem 10%", flexGrow: 1 }} onClick={handleBack}>
                    Back
                  </button>
                  <button
                    disabled={isPlusOneInvalid}
                    className="btn-rsvp-sm"
                    style={{ padding: ".5rem 10%", flexGrow: 1 }}
                    onClick={handleNext}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            {/* Children RSVP Card */}
            {activeStep === 2 && designatedDependentGuest && (
              <div id="children-card-container" className="rsvp-card">
                <div id="children-request-header" className="flex-col">
                  <p className="font-sm-med strong-text" style={{ marginBottom: "1rem" }}>
                    Add Child RSVPs
                  </p>
                  <p className="font-sm contain-text-center secondary-text">
                    <strong>
                      <span style={{ textDecoration: "underline" }}>Undecided?</span>
                    </strong>{" "}
                    You can always add your child RSVPs later after submitting your RSVP via the{" "}
                    <strong>RSVP Portal</strong>!
                  </p>
                </div>
                {childrenRsvps.map((child, index) => {
                  return (
                    <div key={index}>
                      <TextField
                        value={child.name}
                        onChange={(e) => handleChildNameChange(e.target.value, index)}
                        label="Add First & Last Name"
                        sx={{ width: "20rem" }}
                      />
                    </div>
                  );
                })}
                <div>
                  <button
                    disabled={isAddNewChildDisabled()}
                    onClick={() => {
                      handleAddNewChild(designatedDependentGuest.guest_id);
                    }}
                    className="btn-rsvp-sm"
                    style={{ fontSize: "1rem", padding: ".25rem 1.25rem" }}
                  >
                    Add Child
                  </button>
                </div>
                {isChildrenInvalid && (
                  <p className="contain-text-center" style={{ color: "red", textDecoration: "underline" }}>
                    All children names must be first & last.
                  </p>
                )}
                <div className="btn-container" style={{ gap: "2rem" }}>
                  <button className="btn-rsvp-sm" style={{ padding: ".5rem 10%", flexGrow: 1 }} onClick={handleBack}>
                    Back
                  </button>
                  <button
                    disabled={isChildrenInvalid}
                    className="btn-rsvp-sm"
                    style={{ padding: ".5rem 10%", flexGrow: 1 }}
                    onClick={handleNext}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            {/* Song Request Card */}
            {activeStep === 3 && (
              <div id="song-request-card-container" className="rsvp-card">
                <div id="song-request-header" className="flex-col">
                  <p className="font-sm-med strong-text" style={{ marginBottom: "1rem" }}>
                    Add Song Requests
                  </p>
                  <p className="font-sm contain-text-center secondary-text">
                    <span style={{ textDecoration: "underline" }}>Undecided? </span>You can always add songs later after
                    submitting your RSVP via the RSVP Portal!
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

                          {requestsLeft !== 0 && (
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
                          )}
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
            {/* Confirmation Card */}
            {activeStep === 4 && (
              <div id="confirmation-card-container" className="rsvp-card">
                <div className="flex-col">
                  <p className="font-sm-med strong-text">RSVP Confirmation</p>
                  <p className="font-sm strong-text contain-text-center" style={{ textDecoration: "underline" }}>
                    Please confirm that all information shown below is correct and submit.
                  </p>
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
                      {rsvp.attendance && guest?.plus_one_allowed && rsvp.additionalGuests.length > 0 && (
                        <div className="flex-row-gap">
                          <p className="strong-text font-sm confirmation-header">Plus One: </p>
                          <p className="font-sm">{rsvp.additionalGuests[0].name}</p>
                        </div>
                      )}
                      {rsvp.attendance && guest?.plus_one_allowed && rsvp.additionalGuests.length === 0 && (
                        <p className="font-sm secondary-text">
                          Plus one <strong>available</strong> for {guest.name}! You can add the extra RSVP{" "}
                          <span className="confirmation-header">after</span> submitting this one via the RSVP Portal.
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* --- children confirmation template --- */}
                {childrenRsvps.length > 0 && childrenRsvps[0].name !== "" ? (
                  <div id="rsvp-confirm-curr-kids-container" className="flex-col-start">
                    {childrenRsvps.map((children, index) => {
                      return (
                        <div key={index} className="user-confirm-rsvp-container" style={{ width: "stretch" }}>
                          <div className="flex-row-gap">
                            <p className="strong-text font-sm confirmation-header">Child: </p>
                            <p className="font-sm">{children.name}</p>
                          </div>
                          <div className="flex-row-gap">
                            <p className="strong-text font-sm confirmation-header">Attending: </p>
                            <p className="font-sm">Yes</p>
                          </div>
                        </div>
                      );
                    })}
                    <p className="font-sm">
                      <strong style={{ textDecoration: "underline" }}>Please Note:</strong> While kids are allowed to
                      help celebrate our special day we kindly ask all infants/toddlers to{" "}
                      <span style={{ textDecoration: "underline" }}>not be</span> present at the ceremony. There are
                      several areas around the property for one of your guests to accompany them. They are of course
                      welcome afterwards for the cocktail hour and reception. For more information visit the 'FAQ' tab.
                    </p>
                  </div>
                ) : (
                  <div id="rsvp-confirm-no-curr-kids-container">
                    {rsvps.some(
                      (rsvp) =>
                        rsvp.attendance === true &&
                        groupData.guests.find((guest) => guest.guest_id === rsvp.guestId)?.has_dependents
                    ) && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <p className="font-sm secondary-text">
                          One or more guests in this group are able to add child RSVPs. These can be added
                          <span className="confirmation-header"> after</span> your RSVP is submitted via the RSVP
                          Portal.
                        </p>
                        <p className="font-sm secondary-text">
                          <strong>Note: </strong>It is <strong>required</strong> to add these RSVPs prior to the
                          deadline for your children/dpendents to be{" "}
                          <span style={{ textDecoration: "underline" }}>counted</span>
                        </p>
                      </div>
                    )}
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
            <div id="rsvp-stepper-container">
              {/* stepper */}
              <MobileStepper
                steps={steps.length}
                activeStep={activeStep}
                variant="progress"
                nextButton={null}
                backButton={null}
                sx={{ width: "40rem" }}
              ></MobileStepper>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default RSVPForm;
