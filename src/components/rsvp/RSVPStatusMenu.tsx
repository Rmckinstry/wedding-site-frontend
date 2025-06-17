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
  const [menuState, setMenuState] = useState<"main" | "plusOne" | "dependent" | "song" | "email" | "confirmation">(
    "main"
  );
  const [plusOneNames, setPlusOneNames] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    for (const rsvp of groupRSVPs) {
      const guest = groupData.guests.find((guest: Guest) => guest.guest_id === rsvp.guest_id);
      if (rsvp.attendance) {
        if (guest?.plus_one_allowed) {
          setPlusOneEnabled(true);
        }
        console.log(guest);
        if (guest?.has_dependents) {
          setDependentsEnabled(true);
        }
      }
    }
  }, [groupData, groupRSVPs]);

  const handlePlusOneNameChange = (guestId: number, name: string) => {
    setPlusOneNames((prevNames) => ({
      ...prevNames,
      [guestId]: name,
    }));
  };
  const handlePlusOneSubmit = async (plusOneName: string, guestId: number, groupId: number) => {
    const postData: additionalPost = {
      additionalGuests: [plusOneName],
      guestId: guestId,
      groupId: groupId,
      additionalType: "plus_one",
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

      const result = await response.json();
      setIsSubmitting(false);
      refreshData();
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      setIsSubmitting(false);
    }
  };

  const handleMenuClick = (key) => setMenuState(key);

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
            <GridOption optionName={"RSVP Confirmation"} menuKey={"confirmation"} handleMenuClick={handleMenuClick} />
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
                {" "}
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
                          onClick={() => {
                            handlePlusOneSubmit(plusOneNames[guest.guest_id], guest.guest_id, guest.group_id);
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
          </div>
        )}
        {menuState === "song" && (
          <div>
            <p>Song Menu</p>
          </div>
        )}
        {menuState === "email" && (
          <div>
            <p>Email Menu</p>
          </div>
        )}
        {menuState === "confirmation" && (
          <div>
            <p>RSVP Confirmation Menu</p>
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
