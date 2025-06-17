import { TextField } from "@mui/material";
import { GroupData, Guest, RSVP } from "../../utility/types";
import React, { useEffect, useState } from "react";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

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
    setIsLoading(true);

    const oldSongsString: string = submittedSongs.reduce((acc, song) => {
      return acc.length === 0 ? song : acc + "," + song;
    }, "");
    const newSongsString: string = emptySongs.reduce((acc, song) => {
      return acc.length === 0 ? song : acc + "," + song;
    }, "");

    const songString = newSongsString.length > 0 ? oldSongsString + "," + newSongsString : oldSongsString;

    try {
      const response = await fetch(`https://wedding-site-backend-76nm.onrender.com/rsvps/songs/${rsvp.rsvp_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ songs: songString }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Response from server:", result);
      setIsLoading(false);
      handleDataRefresh();
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      setIsLoading(false);
      setError(error);
    }
  };

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
          {isLoading && (
            <div>
              <p>Submitting song requests. Please Wait...</p>
            </div>
          )}
          {error && (
            <div>
              <p>There was an error submitting your song requests. Please try again.</p>
              <div className="btn-container">
                <button
                  onClick={() => {
                    setError(false);
                  }}
                >
                  Okay - Retry
                </button>
              </div>
            </div>
          )}

          {/* very temporary - error and submitted will probably be modals and popups */}
          {!isLoading && !error && (
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const handlePlusOneNameChange = (guestId: number, name: string) => {
    setPlusOneNames((prevNames) => ({
      ...prevNames,
      [guestId]: name,
    }));
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
    try {
      setIsSubmitting(true);
      const response = await fetch("https://wedding-site-backend-76nm.onrender.com/rsvps/additional", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await response.json();
      setIsSubmitting(false);
      refreshData();
      if (additionalType === "dependent") {
        handleChildReset();
      }
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      setIsSubmitting(false);
    }
  };

  const handleChildAdd = () => {
    setChildrenNames([...childrenNames, currentChild]);
    setCurrentChild("");
  };

  const handleChildReset = () => {
    setChildrenNames([]);
    setCurrentChild("");
  };

  const handleMenuClick = (key) => {
    if (menuState === "dependent") handleChildReset();
    setMenuState(key);
  };

  const handleEmailChange = (guestId: number, email: string) => {
    console.log(guestId, email);
    setEmails((prevEmails) => ({
      ...prevEmails,
      [guestId]: email,
    }));
  };

  const handleEmailSubmit = async (email: string, guestId: number) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`https://wedding-site-backend-76nm.onrender.com/guests/email/${guestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await response.json();
      setIsSubmitting(false);
      refreshData();
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      setIsSubmitting(false);
    }
  };

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
            {isSubmitting ? (
              <div>
                <p>Submitting Plus One... Please Wait.</p>
              </div>
            ) : (
              <div>
                {/* eslint-disable-next-line array-callback-return */}
                {groupRSVPs.map((rsvp) => {
                  const guest = groupData.guests.find((guest) => guest.guest_id === rsvp.guest_id);

                  if (guest?.plus_one_allowed && rsvp.attendance && !isSubmitting) {
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
            {isSubmitting ? (
              <div>
                <p>Submitting Children RSVPs... Please Wait.</p>
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
            {isSubmitting ? (
              <div>
                <p>Submitting Email... Please Wait.</p>
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
                    !isSubmitting &&
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
