import { GroupData, Guest, RSVP } from "../../utility/types";
import React, { useEffect, useState } from "react";

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

function RSVPStatusMenu({ groupData, groupRSVPs }: { groupData: GroupData; groupRSVPs: RSVP[] }) {
  const [plusOneEnabled, setPlusOneEnabled] = useState<boolean>(false);
  const [dependentsEnabled, setDependentsEnabled] = useState<boolean>(false);
  const [menuState, setMenuState] = useState<"main" | "plusOne" | "dependent" | "song" | "email" | "confirmation">(
    "main"
  );

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

  useEffect(() => {
    console.log(menuState);
  }, [menuState]);

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
