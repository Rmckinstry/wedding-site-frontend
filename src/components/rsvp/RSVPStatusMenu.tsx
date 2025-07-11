/* eslint-disable array-callback-return */
import { TextField, Tooltip } from "@mui/material";
import {
  AdditionalGuestBodyType,
  CustomResponseType,
  ErrorType,
  GroupData,
  Guest,
  RSVP,
  SongRequestError,
} from "../../utility/types";
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Error from "../utility/Error.tsx";
import Loading from "../utility/Loading.tsx";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import ChildFriendlyIcon from "@mui/icons-material/ChildFriendly";
import EmailIcon from "@mui/icons-material/Email";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import ChecklistIcon from "@mui/icons-material/Checklist";
import Success from "../utility/Success.tsx";
import { isValidInput, isValidName } from "../../utility/util.ts";

//#region grid option
const GridOption = ({
  optionName,
  menuKey,
  handleMenuClick,
}: {
  optionName: string;
  menuKey: string | any;
  handleMenuClick: ({ key }) => void;
}) => {
  return (
    <div className="status-menu-btn-container flex-col">
      <button
        onClick={() => {
          handleMenuClick(menuKey);
        }}
        className="status-menu-btn"
      >
        {optionName === "Add Plus One" && <GroupAddIcon sx={{ fontSize: "10rem" }} className="status-menu-icon" />}
        {optionName === "Add Child" && <ChildFriendlyIcon sx={{ fontSize: "10rem" }} className="status-menu-icon" />}
        {optionName === "Song Requests" && <LibraryMusicIcon sx={{ fontSize: "10rem" }} className="status-menu-icon" />}
        {optionName === "Add/Edit Email" && <EmailIcon sx={{ fontSize: "10rem" }} className="status-menu-icon" />}
        {optionName === "RSVP Confirmation" && (
          <ChecklistIcon sx={{ fontSize: "10rem" }} className="status-menu-icon" />
        )}
        <span className="status-menu-text font-med">{optionName}</span>
      </button>
    </div>
  );
};
//#region song form
const SongEditForm = ({
  guest,
  rsvp,
  handleDataRefresh,
}: {
  guest: Guest;
  rsvp: RSVP;
  handleDataRefresh: () => void;
}) => {
  const separator = "\u00A7";

  const submittedSongs = rsvp.spotify.split(separator).filter((song) => song !== "");
  const [emptySongs, setEmptySongs] = useState<string[]>(Array(guest.song_requests - submittedSongs.length).fill(""));

  const [songValidationErrors, setSongValidationErrors] = useState<SongRequestError[]>([]);

  const isSongMenuInvalid = songValidationErrors.some((errObject) => errObject.artist || errObject.title);

  //sets inital songs
  useEffect(() => {
    const submittedSongs = rsvp.spotify.split(separator).filter((song) => song !== "");
    setEmptySongs(Array(guest.song_requests - submittedSongs.length).fill(""));
    //initalizing validation array to protect from errors when users add songs out of order
    setSongValidationErrors(
      Array(guest.song_requests - submittedSongs.length).fill({
        // Create the error object for the current index
        title: false,
        artist: false,
        message: "",
      })
    );
  }, [guest, rsvp]);

  //#region song methods
  const handleSongRequestChange = (index: number, key: string, value: string) => {
    setEmptySongs((prev) => {
      const newSongs = [...prev];

      let currentTitle = "";
      let currentArtist = "";

      if (newSongs[index] && newSongs[index].includes(" - ")) {
        [currentTitle, currentArtist] = newSongs[index].split(" - ");
      }

      const updatedTitle = key === "title" ? value : currentTitle;
      const updatedArtist = key === "artist" ? value : currentArtist;

      newSongs[index] = updatedTitle || updatedArtist ? `${updatedTitle || ""} - ${updatedArtist || ""}` : "";

      const newErrorsForIndex = {
        // Create the error object for the current index
        title: false,
        artist: false,
        message: "",
      };

      const isTitleEmpty = updatedTitle.length === 0;
      const isArtistEmpty = updatedArtist.length === 0;

      const isTitleInvalid = !isValidInput(updatedTitle);
      const isArtistInvalid = !isValidInput(updatedArtist);

      //only check for errors is either title or artist is not empty
      // both being empty is valid as song requests are not required
      if (isTitleEmpty && isArtistEmpty) {
      } else if (!isTitleEmpty && isArtistEmpty) {
        //Title has content, Artist is empty
        newErrorsForIndex.artist = true;
        newErrorsForIndex.message = "Artist is required when a song title is entered.";
      }
      //Artist has content, Title is empty
      else if (isTitleEmpty && !isArtistEmpty) {
        newErrorsForIndex.title = true;
        newErrorsForIndex.message = "Song title is required when an artist is entered.";
      }
      //Both have content, check for valid input characters
      else {
        if (isTitleInvalid) {
          newErrorsForIndex.title = true;
          newErrorsForIndex.message = "Song title must contain letters or numbers.";
        }
        if (isArtistInvalid) {
          newErrorsForIndex.artist = true;
          newErrorsForIndex.message = newErrorsForIndex.message
            ? newErrorsForIndex.message + " Artist must contain letters or numbers."
            : "Artist must contain letters or numbers.";
        }
      }

      setSongValidationErrors((prevErrors) => {
        const updatedErrors = [...prevErrors];
        updatedErrors[index] = newErrorsForIndex;
        return updatedErrors;
      });

      return newSongs;
    });
  };

  const handleSongSubmit = async () => {
    const oldSongsString: string = submittedSongs.reduce((acc, song) => {
      if (song.trim().length < 2) {
        //checks if song isn't just white space (plus dash)
        return acc.length === 0 ? separator : acc + separator;
      } else {
        return acc.length === 0 ? song.trim() : acc + separator + song.trim();
      }
    }, "");

    const newSongsString: string = emptySongs.reduce((acc, song) => {
      if (song.trim().length < 2) {
        //checks if song isn't just white space (plus dash)
        return acc.length === 0 ? separator : acc + separator;
      } else {
        return acc.length === 0 ? song.trim() : acc + separator + song.trim();
      }
    }, "");

    const songString = oldSongsString.length === 0 ? newSongsString : oldSongsString + separator + newSongsString;

    songSubmitMutation.mutate(songString);
  };

  //#region song mutation
  const songSubmitMutation = useMutation<CustomResponseType, ErrorType, string>({
    mutationFn: async (songString) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rsvps/songs/${rsvp.rsvp_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ songs: songString }),
      });

      if (!response.ok) {
        const errorBody: ErrorType = await response.json();
        throw errorBody;
      }

      return response.json() as Promise<CustomResponseType>;
    },
    onSuccess: (data) => {
      console.log("Response from server:", data);
      // handleDataRefresh();
      // possible success snackbar trigger
    },
    onError: (error: ErrorType) => {
      console.log(error);
      console.error("Error submitting songs:", error.message);
    },
  });

  const handleSongSuccess = () => {
    handleDataRefresh();
    songSubmitMutation.reset();
  };

  //#region song template
  return (
    <div className="guest-status-container flex-col-start" style={{ width: "fit-content", gap: "1rem" }}>
      {/* already submitted song display */}
      <p className="font-sm strong-text">{guest.name} Song Requests</p>
      {submittedSongs.length !== 0 && (
        <div key={`song-container-guest-${rsvp.guest_id}`} className="flex-col-start" style={{ gap: "1rem" }}>
          {submittedSongs.map((song) => {
            return (
              <div key={`song-name-${song}`}>
                <TextField sx={{ width: "35rem" }} value={song} key={song} disabled />
              </div>
            );
          })}
        </div>
      )}

      {submittedSongs.length !== guest.song_requests && (
        <>
          {songSubmitMutation.isPending || songSubmitMutation.isError || songSubmitMutation.isSuccess ? (
            <div className="state-container">
              {songSubmitMutation.isPending && <Loading loadingText={"Submitting song requests. Please Wait..."} />}
              {songSubmitMutation.isError && (
                <Error errorInfo={songSubmitMutation.error} tryEnabled={true} handleRetry={songSubmitMutation.reset} />
              )}
              {songSubmitMutation.isSuccess && (
                <Success
                  message={
                    "Your song requests were successfully submitted. If you have remaining requests, you can add them at any point before Oct. 1st!"
                  }
                  btnMessage="Okay!"
                  handleAction={handleSongSuccess}
                />
              )}
            </div>
          ) : (
            <div className="flex-col-start">
              {emptySongs.map((song, index) => {
                const [title, artist] = song ? song.split(" - ") : ["", ""];
                const errors = songValidationErrors[index] || {
                  title: false,
                  artist: false,
                  message: "",
                };
                return (
                  <div
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}
                    key={index}
                  >
                    <TextField
                      onChange={(e) => handleSongRequestChange(index, "title", e.target.value)}
                      value={title || ""}
                      id="song-request-title"
                      label="Song Title"
                      error={errors.title}
                      helperText={errors.title ? errors.message : ""}
                      variant="standard"
                      sx={{ width: "17rem" }}
                    />
                    <TextField
                      onChange={(e) => handleSongRequestChange(index, "artist", e.target.value)}
                      value={artist || ""}
                      id="song-request-artist"
                      label="Song Artist"
                      error={errors.artist}
                      helperText={errors.artist ? errors.message : ""}
                      variant="standard"
                      sx={{ width: "17rem" }}
                    />
                  </div>
                );
              })}
              <div className="btn-container">
                <button className="btn-rsvp-sm" disabled={isSongMenuInvalid} onClick={handleSongSubmit}>
                  Submit Song Requests For {guest.name}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
//#region email component
const EmailForm = ({ guest, rsvp, handleDataRefresh }: { guest: Guest; rsvp: RSVP; handleDataRefresh: () => void }) => {
  const [emails, setEmails] = useState<{ [key: number]: string | null }>({});
  const [emailErrors, setEmailErrors] = useState<{ [key: number]: string | null }>({});

  const hasError = !!emailErrors[guest.guest_id];

  useEffect(() => {
    handleEmailChange(guest.guest_id, guest.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guest, rsvp]);

  //#region email logic
  const validateEmail = (email: string | null): string | null => {
    // If the email is explicitly null, it's considered valid (optional and not provided)
    if (email === null) {
      return null;
    }

    // If  email is an empty string or contains only whitespace after trimming, it's an error
    const trimmedEmail = email.trim();
    if (trimmedEmail === "") {
      return "Email address cannot be empty.";
    }

    //valid email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return "Please enter a valid email address.";
    }

    return null;
  };

  const handleEmailChange = (guestId: number, email: string) => {
    setEmails((prevEmails) => ({
      ...prevEmails,
      [guestId]: email,
    }));
    // Validate on change to provide immediate feedback
    setEmailErrors((prevErrors) => ({
      ...prevErrors,
      [guestId]: validateEmail(email),
    }));
  };

  const isButtonDisabled = (guestId: number) => {
    const currentEmail = emails[guestId] || "";
    return !!validateEmail(currentEmail);
  };

  const handleEmailSubmit = async (email: string | null, guestId: number) => {
    emailSubmitMutation.mutate({ email: email, guestId: guestId });
  };

  const emailSubmitMutation = useMutation<CustomResponseType, ErrorType, { email: string | null; guestId: number }>({
    mutationFn: async ({ email, guestId }) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/guests/email/${guestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) {
        const errorBody: ErrorType = await response.json();
        throw errorBody;
      }

      return response.json() as Promise<CustomResponseType>;
    },
    onSuccess: (data) => {
      console.log("Response from server:", data);
      // handleDataRefresh();
    },
    onError: (error: ErrorType) => {
      console.log(error);
      console.error("Error creating plus one rsvp:", error.message);
    },
  });
  //#endregion

  // #region email template
  return (
    <>
      {emailSubmitMutation.isPending || emailSubmitMutation.isError || emailSubmitMutation.isSuccess ? (
        <div className="state-container">
          {emailSubmitMutation.isPending && <Loading loadingText={"Saving email. Please Wait..."} />}
          {emailSubmitMutation.isError && (
            <Error errorInfo={emailSubmitMutation.error} tryEnabled={true} handleRetry={emailSubmitMutation.reset} />
          )}
          {emailSubmitMutation.isSuccess && (
            <Success
              message={"Your email was successfully updated!"}
              btnMessage={"Okay"}
              handleAction={() => {
                handleDataRefresh();
                emailSubmitMutation.reset();
              }}
            />
          )}
        </div>
      ) : (
        <div key={rsvp.rsvp_id} className="email-form-container flex-col-start" style={{ gap: "1rem" }}>
          <div className="flex-col-start">
            <p className="font-sm">{guest.name}'s Email</p>
            <TextField
              value={emails[guest.guest_id] || ""}
              onChange={(e) => handleEmailChange(guest.guest_id, e.target.value)}
              label="Email Address"
              error={hasError}
              helperText={hasError ? emailErrors[guest.guest_id] : ""}
              variant="standard"
              sx={{ width: "15rem" }}
            />
            <div className="btn-container">
              <button
                onClick={() => {
                  handleEmailSubmit(null, guest.guest_id);
                }}
                className="btn-rsvp-sm btn-alt"
              >
                Remove Email
              </button>
              <button
                onClick={() => {
                  handleEmailSubmit(emails[guest.guest_id], guest.guest_id);
                }}
                disabled={isButtonDisabled(guest.guest_id)}
                className="btn-rsvp-sm"
              >
                Submit Email
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

//#endregion
//#region rsvp menu
function RSVPStatusMenu({
  groupData,
  groupRSVPs,
  refreshData,
  handleScroll,
}: {
  groupData: GroupData;
  groupRSVPs: RSVP[];
  refreshData: () => void;
  handleScroll: () => void;
}) {
  const [plusOneEnabled, setPlusOneEnabled] = useState<boolean>(false);
  const [dependentsEnabled, setDependentsEnabled] = useState<boolean>(false);
  const [menuState, setMenuState] = useState<"main" | "plusOne" | "dependent" | "song" | "email" | "overview">("main");

  const [plusOneNames, setPlusOneNames] = useState<{ [key: number]: string }>({});

  const [currentChild, setCurrentChild] = useState<string>("");
  const [childrenNames, setChildrenNames] = useState<string[]>([]);

  const isChildrenInvalid = !isValidName(currentChild);

  const everyAttendanceNo = groupRSVPs.every((rsvp) => rsvp.attendance === false);

  // song seperator code
  const separator = "\u00A7";

  useEffect(() => {
    setPlusOneEnabled(false);
    setDependentsEnabled(false);

    for (const rsvp of groupRSVPs) {
      const guest = groupData.guests.find((guest: Guest) => guest.guest_id === rsvp.guest_id);
      if (rsvp.attendance && guest) {
        if (guest?.plus_one_allowed) {
          setPlusOneEnabled(true);
        }
        if (guest?.has_dependents) {
          setDependentsEnabled(true);
        }
        // handleEmailChange(guest.guest_id, guest.email);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupData, groupRSVPs]);

  // clears mutations when tab is changed - allows specific menus to reset
  useEffect(() => {
    additionalGuestMutation.reset();
    // emailSubmitMutation.reset();
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuState]);

  const handleMenuClick = (key) => {
    if (key === "dependent") handleChildReset();
    // if (key === "email") handleEmailReset();
    setMenuState(key);

    if (key === "main") {
      handleScroll();
    }
  };

  //#region additional guest logic
  const handlePlusOneNameChange = (guestId: number, name: string) => {
    setPlusOneNames((prevNames) => ({
      ...prevNames,
      [guestId]: name,
    }));
  };
  const handleChildAdd = () => {
    setChildrenNames([...childrenNames, currentChild]);
    setCurrentChild("");
  };

  const handleChildReset = () => {
    setChildrenNames([]);
    setCurrentChild("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (currentChild !== "" && !isDuplicate()) {
        handleChildAdd();
      }
    }
  };

  const isDuplicate = () => {
    const submittedNames = groupData.guests.filter((guest) => guest.additional_guest_type === "dependent");
    return (
      childrenNames.some((name) => name === currentChild) || submittedNames.some((guest) => guest.name === currentChild)
    );
  };

  const handleAdditionalSubmit = async (
    plusOneName: string | string[],
    guestId: number,
    groupId: number,
    additionalType: "plus_one" | "dependent"
  ) => {
    const postData: AdditionalGuestBodyType = {
      groupId: groupId,
      additional: [],
    };

    if (typeof plusOneName === "object") {
      plusOneName.forEach((name) => {
        postData.additional.push({ name: name, type: additionalType, guestId: guestId });
      });
    } else {
      postData.additional.push({ name: plusOneName, type: additionalType, guestId: guestId });
    }
    additionalGuestMutation.mutate({ postData: postData, type: additionalType });
  };

  const additionalGuestMutation = useMutation<
    CustomResponseType,
    ErrorType,
    { postData: AdditionalGuestBodyType; type: "plus_one" | "dependent" }
  >({
    mutationFn: async ({ postData, type }) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rsvps/additional`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postData }),
      });
      if (!response.ok) {
        const errorBody: ErrorType = await response.json();
        throw errorBody;
      }

      return response.json() as Promise<CustomResponseType>;
    },
    onSuccess: (data, variables) => {
      console.log("Response from server:", data);
      refreshData();
      if (variables.type === "dependent") {
        handleChildReset();
      }
    },
    onError: (error: ErrorType) => {
      console.log(error);
      console.error("Error creating plus one rsvp:", error.message);
    },
  });

  const hasChildren = () => {
    const childPresent = groupData.guests.some((guest) => guest.additional_guest_type === "dependent");
    return childPresent;
  };
  //#endregion
  //#region template
  return (
    <>
      <div id="rsvp-status-menu-container">
        {menuState !== "main" && <div id="portal-horiz-divider"></div>}
        {menuState === "main" && (
          <div id="status-menu-grid">
            {plusOneEnabled && (
              <GridOption optionName={"Add Plus One"} menuKey={"plusOne"} handleMenuClick={handleMenuClick} />
            )}
            {dependentsEnabled && (
              <GridOption optionName={"Add Child"} menuKey={"dependent"} handleMenuClick={handleMenuClick} />
            )}
            {!everyAttendanceNo && (
              <GridOption optionName={"Song Requests"} menuKey={"song"} handleMenuClick={handleMenuClick} />
            )}
            {!everyAttendanceNo && (
              <GridOption optionName={"Add/Edit Email"} menuKey={"email"} handleMenuClick={handleMenuClick} />
            )}
            <GridOption optionName={"RSVP Confirmation"} menuKey={"overview"} handleMenuClick={handleMenuClick} />
          </div>
        )}
        {menuState === "plusOne" && (
          <div id="plus-one-status-container" className="status-menu-card">
            <p className="font-sm-med contain-text-center" style={{ textDecoration: "underline" }}>
              Plus One Menu
            </p>
            {additionalGuestMutation.isPending ||
            additionalGuestMutation.isError ||
            additionalGuestMutation.isSuccess ? (
              <div className="state-container">
                {additionalGuestMutation.isPending && (
                  <Loading loadingText={"Creating Plus One RSVP. Please Wait..."} />
                )}
                {additionalGuestMutation.isError && (
                  <Error
                    errorInfo={additionalGuestMutation.error}
                    tryEnabled={true}
                    handleRetry={additionalGuestMutation.reset}
                  />
                )}
                {additionalGuestMutation.isSuccess && (
                  <Success message={"Your Plus One RSVP was successfully submitted!"} />
                )}
              </div>
            ) : (
              <div className="flex-col-start">
                {/* eslint-disable-next-line array-callback-return */}
                {groupRSVPs.map((rsvp) => {
                  const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guest_id);

                  if (guest?.plus_one_allowed && rsvp.attendance) {
                    return (
                      <div key={guest.guest_id} className="flex-col-start">
                        <p className="font-sm">{guest.name}'s Plus One</p>
                        <TextField
                          value={plusOneNames[guest.guest_id] || ""} // Controlled component
                          onChange={(e) => handlePlusOneNameChange(guest.guest_id, e.target.value)}
                          label="Add Plus One's Full Name"
                          sx={{ width: "20rem" }}
                        />
                        <button
                          disabled={!plusOneNames[guest.guest_id]}
                          onClick={() => {
                            handleAdditionalSubmit(
                              plusOneNames[guest.guest_id],
                              guest.guest_id,
                              guest.group_id,
                              "plus_one"
                            );
                          }}
                          className="btn-rsvp"
                        >
                          Submit Plus One
                        </button>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        )}
        {menuState === "dependent" && (
          <div id="dependent-status-container" className="status-menu-card">
            <p className="font-sm-med contain-text-center" style={{ textDecoration: "underline" }}>
              Child RSVP Menu
            </p>
            <p className="font-xs contain-text-center">
              Child RSVPs are meant for kids <strong style={{ textDecoration: "underline" }}>15 years</strong> and
              younger.
            </p>
            {additionalGuestMutation.isPending ||
            additionalGuestMutation.isError ||
            additionalGuestMutation.isSuccess ? (
              <div className="state-container">
                {additionalGuestMutation.isPending && (
                  <Loading loadingText={"Creating child RSVP(s). Please wait..."} />
                )}
                {additionalGuestMutation.isError && (
                  <Error
                    errorInfo={additionalGuestMutation.error}
                    tryEnabled={true}
                    handleRetry={additionalGuestMutation.reset}
                  />
                )}
                {additionalGuestMutation.isSuccess && (
                  <Success
                    message={"Your child RSVP(s) have been created!"}
                    btnMessage="Okay"
                    handleAction={additionalGuestMutation.reset}
                  />
                )}
              </div>
            ) : (
              <div className="flex-col-start">
                {hasChildren() && (
                  <div id="dependent-overview-container">
                    <p className="font-sm">Submitted Child RSVPs:</p>
                    {groupData.guests.map((guest, index) => {
                      if (guest.additional_guest_type === "dependent") {
                        return (
                          <p className="font-sm" style={{ marginLeft: "1rem", marginTop: "1rem" }} key={index}>
                            • {guest.name}
                          </p>
                        );
                      }
                    })}
                  </div>
                )}
                {childrenNames.length !== 0 && (
                  <div id="dependent-pending-container">
                    <p className="font-sm">Pending Child RSVPs</p>
                    {childrenNames.map((child, index) => {
                      return (
                        <p className="font-sm" style={{ marginLeft: "1rem", marginTop: "1rem" }} key={index}>
                          • {child}
                        </p>
                      );
                    })}
                    <p style={{ marginTop: "1rem", textDecoration: "underline", fontWeight: "700", color: "darkred" }}>
                      Press 'Submit' to finalize 'Pending' RSVPs."
                    </p>
                  </div>
                )}

                <div id="dependent-form-container" className="flex-row-gap" style={{ justifyContent: "center" }}>
                  <TextField
                    onChange={(e) => {
                      setCurrentChild(e.target.value);
                    }}
                    label="Add Child Full Name"
                    value={currentChild || ""}
                    sx={{ width: "20rem" }}
                    onKeyDown={handleKeyDown}
                  ></TextField>
                  <Tooltip title="Add Child to Pending list">
                    <button
                      className="btn-stripped"
                      onClick={handleChildAdd}
                      disabled={currentChild === "" || isDuplicate() || isChildrenInvalid}
                    >
                      Add Child
                    </button>
                  </Tooltip>
                </div>
                {isDuplicate() && (
                  <p style={{ color: "red", marginTop: "1rem" }}>Name is already pending or submitted.</p>
                )}
                {isChildrenInvalid && <p style={{ color: "red" }}>Must be first and last name.</p>}

                {childrenNames.length !== 0 && (
                  <p className="font-sm">
                    <strong style={{ textDecoration: "underline" }}>Please Note:</strong> While kids are allowed to help
                    celebrate our special day we kindly ask all infants/toddlers to{" "}
                    <span style={{ textDecoration: "underline" }}>not be</span> present at the ceremony. There are
                    several areas around the property for one of your guests to accompany them. They are of course
                    welcome afterwards for the cocktail hour and reception. For more information visit the 'FAQ' tab.
                  </p>
                )}

                <div className="btn-container">
                  <Tooltip enterDelay={500} title="Reset all 'Pending' child RSVPs">
                    <button
                      onClick={() => {
                        handleChildReset();
                      }}
                      className="btn-rsvp-sm btn-alt"
                    >
                      Reset
                    </button>
                  </Tooltip>

                  <Tooltip enterDelay={500} title="Submit Pending Child RSVPs">
                    <button
                      disabled={childrenNames.length === 0 || isChildrenInvalid}
                      onClick={() => {
                        const validParent = groupData.guests.find((guest) => guest.has_dependents === true);
                        handleAdditionalSubmit(
                          childrenNames,
                          validParent?.guest_id !== undefined ? validParent.guest_id : 0,
                          validParent?.group_id !== undefined ? validParent.group_id : groupData.guests[0].group_id,
                          "dependent"
                        );
                      }}
                      className="btn-rsvp-sm"
                    >
                      Submit RSVPs
                    </button>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
        )}
        {menuState === "song" && (
          <div id="song-status-container" className="status-menu-card">
            <p className="font-sm-med contain-text-center" style={{ textDecoration: "underline" }}>
              Song Request Menu
            </p>
            <div id="song-edit-form-container" className="flex-col-start">
              {/* eslint-disable-next-line array-callback-return */}
              {groupRSVPs.map((rsvp) => {
                const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guest_id);
                if (rsvp.attendance && guest) {
                  return <SongEditForm guest={guest} rsvp={rsvp} handleDataRefresh={refreshData} />;
                }
              })}
            </div>
          </div>
        )}
        {menuState === "email" && (
          <div id="email-status-container" className="status-menu-card">
            <p className="font-sm-med contain-text-center" style={{ textDecoration: "underline" }}>
              Email Menu
            </p>
            <p className="secondary-text font-xs contain-text-center">
              Emails will only be used for important wedding updates, confirmations, and photos! Emails aren't required
              and are completely optional.
            </p>
            <div id="email-edit-form-container" className="flex-col-start">
              {groupRSVPs.map((rsvp) => {
                const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guest_id);
                if (
                  rsvp.attendance &&
                  guest &&
                  guest.additional_guest_type !== "plus_one" &&
                  guest.additional_guest_type !== "dependent"
                ) {
                  return <EmailForm guest={guest} rsvp={rsvp} handleDataRefresh={refreshData} />;
                }
              })}
            </div>
          </div>
        )}
        {menuState === "overview" && (
          <div
            id="overview-status-container"
            className="status-menu-card"
            style={{ width: "80%", padding: "2rem 3rem" }}
          >
            <p className="font-sm-med contain-text-center" style={{ textDecoration: "underline" }}>
              Confirmation Menu
            </p>
            <div id="overview-staus-container" className="flex-col-start">
              {groupRSVPs.map((rsvp) => {
                const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guest_id);
                if (guest) {
                  return (
                    <div className="guest-status-container" style={{ width: "stretch" }} key={guest.guest_id}>
                      <div className="overview-guest-info flex-col-start" style={{ gap: "1rem" }}>
                        <div className="guest-name flex-row-start flex-row-gap">
                          <p className="font-sm strong-text" style={{ textDecoration: "underline" }}>
                            Guest:
                          </p>
                          <p className="font-sm">{guest.name}</p>
                          {guest.additional_guest_type === "plus_one" && <p className="font-sm">(Plus One)</p>}
                          {guest.additional_guest_type === "dependent" && <p className="font-sm">(Child RSVP)</p>}
                        </div>
                        <div className="guest-attending flex-row-start flex-row-gap">
                          <p className="font-sm strong-text" style={{ textDecoration: "underline" }}>
                            Attending:{" "}
                          </p>
                          {rsvp.attendance && <p className="font-sm">Yes!</p>}
                          {!rsvp.attendance && <p className="font-sm">No.</p>}
                        </div>
                        {guest.email && (
                          <div className="guest-email flex-row-start flex-row-gap">
                            <p className="font-sm strong-text" style={{ textDecoration: "underline" }}>
                              Email:
                            </p>
                            <p className="font-sm">{guest.email}</p>
                          </div>
                        )}
                      </div>
                      {rsvp.spotify && rsvp.spotify.split(separator).length > 0 && (
                        <div className="overview-guest-song">
                          <p className="font-sm strong-text" style={{ textDecoration: "underline" }}>
                            Requested Songs
                          </p>
                          {/* filtering out empty song slots */}
                          {rsvp.spotify
                            .split(separator)
                            .filter((song) => song !== "")
                            .map((song, index) => (
                              <p className="font-sm" style={{ marginLeft: "1rem", marginTop: "1rem" }} key={index}>
                                • {song}
                              </p>
                            ))}
                        </div>
                      )}
                      {!everyAttendanceNo && (
                        <p className="overview-guest-no-song font-xs">
                          No songs yet. This can be done in the 'Song Request' menu.
                        </p>
                      )}
                      {!everyAttendanceNo && rsvp.attendance && guest.plus_one_allowed && (
                        <p>
                          Plus one <strong>available</strong> for {guest.name}. This can be added in the 'Plus One'
                          menu.
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              })}
              {/* has dependents message - no children added yet */}
              {!everyAttendanceNo &&
                groupData.guests.some((guest) => guest.has_dependents) &&
                groupData.guests.every((guest) => guest.additional_guest_type !== "dependent") && (
                  <div className="font-sm">
                    <p>
                      One or more guests in this group are able to add child RSVPs. These can be added in the 'Add Child
                      Menu'.
                    </p>
                    <p style={{ marginTop: "1rem" }}>
                      <strong>Note:</strong> It is <strong>required</strong> to add these RSVPs for your children to be{" "}
                      <span style={{ textDecoration: "underline" }}>counted</span>. If you do not see their name on this
                      confirmation screen it means they <span style={{ textDecoration: "underline" }}>haven't</span>{" "}
                      been added and counted.
                    </p>
                  </div>
                )}
              {/* has dependents message - yes children added */}
              {!everyAttendanceNo && groupData.guests.some((guest) => guest.additional_guest_type === "dependent") && (
                <div>
                  <p className="font-sm">
                    <strong style={{ textDecoration: "underline" }}>Please Note:</strong> While kids are allowed to help
                    celebrate our special day we kindly ask all infants/toddlers to{" "}
                    <span style={{ textDecoration: "underline" }}>not be</span> present at the ceremony. There are
                    several areas around the property for one of your guests to accompany them. They are of course
                    welcome afterwards for the cocktail hour and reception. For more information visit the 'FAQ' tab.
                  </p>
                </div>
              )}
              {/* no email message */}
              {!everyAttendanceNo && groupData.guests.some((guest) => !guest.email && !guest.additional_guest_type) && (
                <div className="font-sm">
                  <p>
                    At least one attending guest in your group does not have an email associated with their RSVP. While
                    this is completely optional - it is recommended to keep up to date with the event and to get first
                    access to any picture put out.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {menuState !== "main" && (
          <div className="btn-container">
            <Tooltip title="Back to RSVP Menu">
              <button
                onClick={() => {
                  handleMenuClick("main");
                }}
                className="btn-rsvp-sm"
                style={{ padding: ".25rem 3rem", marginTop: "2rem" }}
              >
                Back to RSVP Portal
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </>
  );
}

export default RSVPStatusMenu;
