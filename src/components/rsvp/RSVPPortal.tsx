import React, { useState } from "react";
import RSVPForm from "./RSVPForm.tsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RSVPStatusMenu from "./RSVPStatusMenu.tsx";
import { GroupData, RSVP } from "../../utility/types.ts";

function RSVPPortal({ groupId, groupName }: { groupId: number; groupName: string }) {
  const queryClient = useQueryClient();

  //GET call to check if there any RSVPs assigned to the groupID
  const groupRSVPs = useQuery<RSVP[]>({
    queryKey: ["groupRSVP"],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rsvps/group/${groupId}`);
      return await response.json();
    },
  });

  const groupData = useQuery<GroupData>({
    queryKey: ["groupData"],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/guests/group/${groupId}`);
      return await response.json();
    },
  });

  function refreshData() {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey.every((key: any) => ["groupRSVP", "groupData"].includes(key)),
    });
  }

  if (groupRSVPs.isPending || groupData.isPending) {
    return <p>Loading {groupName} Portal Information...</p>;
  }

  if (groupRSVPs.isError) {
    return <p>Error: {groupRSVPs.error.message}</p>;
  }

  if (groupData.isError) {
    return <p>Error: {groupData.error.message}</p>;
  }

  return (
    <div id="rsvp-portal-container">
      <p>{groupName} RSVP Portal</p>
      {groupRSVPs.data.length > 0 && (
        <RSVPStatusMenu groupData={groupData.data} groupRSVPs={groupRSVPs.data} refreshData={refreshData} />
      )}
      {groupRSVPs.data.length === 0 && <RSVPForm groupData={groupData.data} sendRefresh={refreshData} />}
    </div>
  );
}

export default RSVPPortal;
