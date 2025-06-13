import React, { useState } from "react";
import RSVPForm from "./RSVPForm.tsx";
import { useQuery } from "@tanstack/react-query";

function RSVPPortal({ groupData }) {
  const groupName = groupData["group_name"];
  const groupId = Number(groupData["guests"][0]["group_id"]);

  console.log(groupData);

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
    <div id="rsvp-form-container">
      <p>{groupName} RSVP Portal</p>
      {groupRSVPs.data.length > 0 && <p>portal</p>}
      {groupRSVPs.data.length === 0 && <RSVPForm groupData={groupData} />}
    </div>
  );
}

export default RSVPPortal;
