import { GroupData, Guest, RSVP } from "../../utility/types";
import React, { useEffect, useState } from "react";

const GridOption = ({ optionName }: { optionName: string }) => {
  console.log("hit");
  return (
    <div>
      <p>{optionName}</p>
    </div>
  );
};

function RSVPStatusMenu({ groupData, groupRSVPs }: { groupData: GroupData; groupRSVPs: RSVP[] }) {
  const [plusOneEnabled, setPlusOneEnabled] = useState<boolean>(false);
  const [dependentsEnabled, setDependentsEnabled] = useState<boolean>(false);

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

  return (
    <>
      <div id="rsvp-status-menu-container">
        <div id="status-menu-grid">
          {plusOneEnabled && <GridOption optionName={"Add Plus One"} />}
          {dependentsEnabled && <GridOption optionName={"Add Children/Dependents"} />}
          <GridOption optionName={"Add Song Requests"} />
          <GridOption optionName={"Add/Edit Email"} />
          <GridOption optionName={"RSVP Confirmation"} />
        </div>
      </div>
    </>
  );
}

export default RSVPStatusMenu;
