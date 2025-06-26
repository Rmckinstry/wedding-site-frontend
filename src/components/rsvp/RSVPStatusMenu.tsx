import { TextField } from "@mui/material";
import { ErrorType, GroupData, Guest, RSVP } from "../../utility/types";
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Error from "../utility/Error.tsx";

type additionalPost = {
  additionalGuests: string[];
  guestId: number;
  groupId: number;
  additionalType: "plus_one" | "dependent";
};
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
    <div>
      <button
        onClick={() => {
          handleMenuClick(menuKey);
        }}
      >
        {optionName}
      </button>
    </div>
  );
};
//#region song form component
const SongEditForm = ({
  guest,
  rsvp,
  handleDataRefresh,
}: {
  guest: Guest;
  rsvp: RSVP;
  handleDataRefresh: () => void;
}) => {
  const submittedSongs = rsvp.spotify.split(",").filter((song) => song !== "");
  const [emptySongs, setEmptySongs] = useState<string[]>(Array(guest.song_requests - submittedSongs.length).fill(""));

  useEffect(() => {
    const submittedSongs = rsvp.spotify.split(",").filter((song) => song !== "");
    setEmptySongs(Array(guest.song_requests - submittedSongs.length).fill(""));
  }, [guest, rsvp]);

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
      return newSongs;
    });
  };

  const handleSongSubmit = async () => {
    const oldSongsString: string = submittedSongs.reduce((acc, song) => {
      return acc.length === 0 ? song : acc + "," + song;
    }, "");

    const newSongsString: string = emptySongs.reduce((acc, song) => {
      return acc.length === 0 ? song : acc + "," + song;
    }, "");

    const songString = oldSongsString.length === 0 ? newSongsString : oldSongsString + "," + newSongsString;

    songSubmitMutation.mutate(songString);
  };

  const songSubmitMutation = useMutation<ResponseType, ErrorType, string>({
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

      return response.json() as Promise<ResponseType>;
    },
    onSuccess: (data) => {
      console.log("Response from server:", data);
      handleDataRefresh();
    },
    onError: (error: ErrorType) => {
      console.log(error);
      console.error("Error submitting songs:", error.message);
    },
  });

  return (
    <div>
      <p>{guest.name}</p>
      {submittedSongs.length !== 0 && (
        <div key={`song-container-guest-${rsvp.guest_id}`}>
          <p>Submitted Song Requests:</p>
          {submittedSongs.map((song) => {
            return (
              <div key={`song-name-${song}`}>
                <TextField value={song} key={song} disabled />
              </div>
            );
          })}
        </div>
      )}

      {submittedSongs.length !== guest.song_requests && (
        <div>
          {songSubmitMutation.isPending && (
            <div>
              <p>Submitting song requests. Please Wait...</p>
            </div>
          )}
          {songSubmitMutation.isError && (
            <div>
              <Error errorInfo={songSubmitMutation.error} tryEnabled={true} handleRetry={songSubmitMutation.reset} />
            </div>
          )}

          {/* very temporary - error and submitted will probably be modals and popups */}
          {!songSubmitMutation.isPending && !songSubmitMutation.isError && (
            <div>
              <p>Add New Song Requests:</p>
              {emptySongs.map((song, index) => {
                const [title, artist] = song ? song.split(" - ") : ["", ""];

                return (
                  <div key={index}>
                    <TextField
                      onChange={(e) => handleSongRequestChange(index, "title", e.target.value)}
                      value={title || ""}
                      id="song-request-title"
                      label="Song Title"
                    />
                    <TextField
                      onChange={(e) => handleSongRequestChange(index, "artist", e.target.value)}
                      value={artist || ""}
                      id="song-request-author"
                      label="Song Author"
                    />
                  </div>
                );
              })}
              <div className="btn-container">
                <button onClick={handleSongSubmit}>Submit Song Requests for {guest.name}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

//#endregion
//#region main rsvp status menu componet
function RSVPStatusMenu({
  groupData,
  groupRSVPs,
  refreshData,
}: {
  groupData: GroupData;
  groupRSVPs: RSVP[];
  refreshData: () => void;
}) {
  const [plusOneEnabled, setPlusOneEnabled] = useState<boolean>(false);
  const [dependentsEnabled, setDependentsEnabled] = useState<boolean>(false);
  const [menuState, setMenuState] = useState<"main" | "plusOne" | "dependent" | "song" | "email" | "overview">("main");

  const [plusOneNames, setPlusOneNames] = useState<{ [key: number]: string }>({});
  const [emails, setEmails] = useState<{ [key: number]: string }>({});
  const [currentChild, setCurrentChild] = useState<string>("");
  const [childrenNames, setChildrenNames] = useState<string[]>([]);

  useEffect(() => {
    for (const rsvp of groupRSVPs) {
      const guest = groupData.guests.find((guest: Guest) => guest.guest_id === rsvp.guest_id);
      if (rsvp.attendance && guest) {
        if (guest?.plus_one_allowed) {
          setPlusOneEnabled(true);
        }
        if (guest?.has_dependents) {
          setDependentsEnabled(true);
        }
        handleEmailChange(guest.guest_id, guest.email);
      }
    }
  }, [groupData, groupRSVPs]);

  // clears mutations when tab is changed - allows specific menus to reset
  useEffect(() => {
    additionalGuestMutation.reset();
    emailSubmitMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuState]);

  const handleMenuClick = (key) => {
    if (key === "dependent") handleChildReset();
    setMenuState(key);
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

  const handleAdditionalSubmit = async (
    plusOneName: string | string[],
    guestId: number,
    groupId: number,
    additionalType: "plus_one" | "dependent"
  ) => {
    const postData: additionalPost = {
      additionalGuests: typeof plusOneName === "string" ? [plusOneName] : plusOneName,
      guestId: guestId,
      groupId: groupId,
      additionalType: additionalType,
    };
    additionalGuestMutation.mutate({ postData: postData, type: additionalType });
  };

  const additionalGuestMutation = useMutation<
    ResponseType,
    ErrorType,
    { postData: additionalPost; type: "plus_one" | "dependent" }
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

      return response.json() as Promise<ResponseType>;
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

  //#endregion
  //#region email logic
  const handleEmailChange = (guestId: number, email: string) => {
    setEmails((prevEmails) => ({
      ...prevEmails,
      [guestId]: email,
    }));
  };

  const handleEmailSubmit = async (email: string, guestId: number) => {
    emailSubmitMutation.mutate({ email: email, guestId: guestId });
  };

  const emailSubmitMutation = useMutation<ResponseType, ErrorType, { email: string; guestId: number }>({
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

      return response.json() as Promise<ResponseType>;
    },
    onSuccess: (data) => {
      console.log("Response from server:", data);
      refreshData();
    },
    onError: (error: ErrorType) => {
      console.log(error);
      console.error("Error creating plus one rsvp:", error.message);
    },
  });
  //#endregion

  return (
    <>
      <div id="rsvp-status-menu-container">
        {menuState === "main" && (
          <div id="status-menu-grid">
            {plusOneEnabled && (
              <GridOption optionName={"Add Plus One"} menuKey={"plusOne"} handleMenuClick={handleMenuClick} />
            )}
            {dependentsEnabled && (
              <GridOption optionName={"Add Children"} menuKey={"dependent"} handleMenuClick={handleMenuClick} />
            )}
            <GridOption optionName={"Add Song Requests"} menuKey={"song"} handleMenuClick={handleMenuClick} />
            <GridOption optionName={"Add/Edit Email"} menuKey={"email"} handleMenuClick={handleMenuClick} />
            <GridOption
              optionName={"RSVP Confirmation & Overview"}
              menuKey={"overview"}
              handleMenuClick={handleMenuClick}
            />
          </div>
        )}
        {menuState === "plusOne" && (
          <div>
            <p>Plus One Menu</p>
            {/* TODO make is loading better than this maybe a modal or rearrange so les popping in */}
            {additionalGuestMutation.isPending ||
            additionalGuestMutation.isError ||
            additionalGuestMutation.isSuccess ? (
              <div>
                {additionalGuestMutation.isPending && (
                  <div>
                    <p>Creating Plus One RSVP. Please Wait...</p>
                  </div>
                )}
                {additionalGuestMutation.isError && (
                  <div>
                    <Error
                      errorInfo={additionalGuestMutation.error}
                      tryEnabled={true}
                      handleRetry={additionalGuestMutation.reset}
                    />
                  </div>
                )}
                {additionalGuestMutation.isSuccess && (
                  <div>
                    <p>Your Plus One RSVP was created!</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* eslint-disable-next-line array-callback-return */}
                {groupRSVPs.map((rsvp) => {
                  const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guest_id);

                  if (guest?.plus_one_allowed && rsvp.attendance && !additionalGuestMutation.isPending) {
                    return (
                      <div key={guest.guest_id}>
                        <p>Add {guest.name}'s Plus One</p>
                        <TextField
                          value={plusOneNames[guest.guest_id] || ""} // Controlled component
                          onChange={(e) => handlePlusOneNameChange(guest.guest_id, e.target.value)}
                          label="Plus One Name"
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
                        >
                          Submit
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
          <div>
            <p>Add Children Menu</p>
            {/* TODO make is loading better than this maybe a modal or rearrange so les popping in */}
            {additionalGuestMutation.isPending ||
            additionalGuestMutation.isError ||
            additionalGuestMutation.isSuccess ? (
              <div>
                {additionalGuestMutation.isPending && (
                  <div>
                    <p>Creating child RSVP(s). Please wait...</p>
                  </div>
                )}
                {additionalGuestMutation.isError && (
                  <div>
                    <Error
                      errorInfo={additionalGuestMutation.error}
                      tryEnabled={true}
                      handleRetry={additionalGuestMutation.reset}
                    />
                  </div>
                )}
                {additionalGuestMutation.isSuccess && (
                  <div>
                    <p>Your child RSVP(s) was created!</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div>
                  <TextField
                    onChange={(e) => {
                      setCurrentChild(e.target.value);
                    }}
                    label="First & last name"
                    value={currentChild || ""}
                  ></TextField>
                  <button onClick={handleChildAdd} disabled={currentChild === ""}>
                    Add Child
                  </button>
                  {childrenNames.length !== 0 && (
                    <div>
                      <p>{groupData.group_name} Child RSVPs:</p>
                      {childrenNames.map((child) => {
                        return <p>{child}</p>;
                      })}
                      <p>"Please press 'Submit' when done to finalize the children's attendance for the wedding."</p>
                    </div>
                  )}
                </div>

                <div className="btn-container">
                  <button
                    disabled={childrenNames.length === 0}
                    onClick={() => {
                      const validParent = groupData.guests.find((guest) => guest.has_dependents === true);
                      handleAdditionalSubmit(
                        childrenNames,
                        validParent?.guest_id !== undefined ? validParent.guest_id : 0,
                        validParent?.group_id !== undefined ? validParent.group_id : groupData.guests[0].group_id,
                        "dependent"
                      );
                    }}
                  >
                    Submit Children RSVP's
                  </button>
                  <button
                    onClick={() => {
                      handleChildReset();
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {menuState === "song" && (
          <div>
            <p>Song Request Menu</p>
            <div>
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
          <div>
            <p>Email Menu</p>
            {/* TODO make is loading better than this maybe a modal or rearrange so les popping in */}
            {emailSubmitMutation.isPending || emailSubmitMutation.isError || emailSubmitMutation.isSuccess ? (
              <div>
                {emailSubmitMutation.isPending && (
                  <div>
                    <p>Saving email. Please Wait...</p>
                  </div>
                )}
                {emailSubmitMutation.isError && (
                  <div>
                    <Error
                      errorInfo={emailSubmitMutation.error}
                      tryEnabled={true}
                      handleRetry={emailSubmitMutation.reset}
                    />
                  </div>
                )}
                {emailSubmitMutation.isSuccess && (
                  <div>
                    <p>Your email was saved!</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p>
                  Emails will only be used for important wedding updates, confirmations, and photos! Emails aren't
                  required and are completely optional
                </p>
                {/* eslint-disable-next-line array-callback-return */}
                {groupRSVPs.map((rsvp) => {
                  const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guest_id);

                  if (
                    rsvp.attendance &&
                    !emailSubmitMutation.isPending &&
                    guest &&
                    guest.additional_guest_type !== "plus_one" &&
                    guest.additional_guest_type !== "dependent"
                  ) {
                    return (
                      <div key={rsvp.rsvp_id}>
                        {guest?.email === "" && guest?.email !== null ? (
                          <p>Add {guest.name}'s Email</p>
                        ) : (
                          <p>Edit {guest.name}'s Email</p>
                        )}
                        <TextField
                          value={emails[guest.guest_id] || ""} // Controlled component
                          onChange={(e) => handleEmailChange(guest.guest_id, e.target.value)}
                          label="Email Address"
                        />
                        <button
                          // disabled={!emails[guest.guest_id]}
                          onClick={() => {
                            handleEmailSubmit(emails[guest.guest_id], guest.guest_id);
                          }}
                        >
                          Submit
                        </button>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        )}
        {menuState === "overview" && (
          <div>
            <p>RSVP Confirmation Menu</p>
            <div>
              {groupRSVPs.map((rsvp) => {
                const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guest_id);
                if (guest) {
                  return (
                    <div id="rsvp-overview-container" key={guest.guest_id}>
                      <div>
                        <p>Guest: {guest.name}</p>
                        {guest.additional_guest_type === "plus_one" && <p> - Plus One</p>}
                        {guest.additional_guest_type === "dependent" && <p> - Child/Dependent</p>}
                        <div>
                          {rsvp.attendance && <p>Attending!</p>}
                          {!rsvp.attendance && <p>Not Attending.</p>}
                        </div>
                      </div>
                      {guest.email && <p>Email: {guest.email}</p>}
                      {rsvp.spotify && rsvp.spotify.split(",").length > 0 && (
                        <div>
                          <p>Song Requests:</p>
                          {rsvp.spotify.split(",").map((song, index) => (
                            <p key={index}>{song}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
              {groupData.guests.some((guest) => guest.has_dependents) && (
                <div>
                  <p>
                    Children & dependent RSVP's can be added from the{" "}
                    <strong
                      onClick={() => {
                        handleMenuClick("dependent");
                      }}
                      style={{ textDecoration: "underline" }}
                    >
                      "Add Children"
                    </strong>{" "}
                    menu.
                  </p>
                </div>
              )}
              {groupData.guests.some((guest) => guest.plus_one_allowed) && (
                <div>
                  <p>
                    At least one attending guest in your group is able to add/bring a plus one. This can be accessed
                    from the{" "}
                    <strong
                      onClick={() => {
                        handleMenuClick("plusOne");
                      }}
                      style={{ textDecoration: "underline" }}
                    >
                      "Add Plus One"
                    </strong>{" "}
                    menu.
                  </p>
                </div>
              )}
              {groupData.guests.some((guest) => !guest.email && !guest.additional_guest_type) && (
                <div>
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
            <button
              onClick={() => {
                handleMenuClick("main");
              }}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default RSVPStatusMenu;
