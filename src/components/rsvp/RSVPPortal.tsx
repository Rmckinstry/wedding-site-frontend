import React, { useState } from "react";
import RSVPForm from "./RSVPForm.tsx";
import { useQuery } from "@tanstack/react-query";
import RSVPStatusMenu from "./RSVPStatusMenu.tsx";
import { GroupData } from "../../utility/types.ts";

function RSVPPortal({ groupData }: { groupData: GroupData }) {
  const groupName = groupData.group_name;
  const groupId = Number(groupData.guests[0].group_id);

  //GET call to check if there any RSVPs assigned to the groupID
  const groupRSVPs = useQuery({
    queryKey: ["groupRSVP"],
    queryFn: async () => {
      const response = await fetch(`https://wedding-site-backend-76nm.onrender.com/rsvps/group/${groupId}`);
      return await response.json();
    },
  });

  if (groupRSVPs.isPending) {
    return <p>Loading {groupName} Portal Information...</p>;
  }

  if (groupRSVPs.isError) {
    return <p>Error: {groupRSVPs.error.message}</p>;
  }

  return (
    <div id="rsvp-portal-container">
      <p>{groupName} RSVP Portal</p>
      {groupRSVPs.data.length > 0 && <RSVPStatusMenu groupData={groupData} groupRSVPs={groupRSVPs.data} />}
      {groupRSVPs.data.length === 0 && <RSVPForm groupData={groupData} />}
    </div>
  );
}

export default RSVPPortal;
