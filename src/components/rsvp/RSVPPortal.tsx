import React, { useRef } from "react";
import RSVPForm from "./RSVPForm.tsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RSVPStatusMenu from "./RSVPStatusMenu.tsx";
import { ErrorType, GroupData, RSVP } from "../../utility/types.ts";
import Error from "../utility/Error.tsx";
import Loading from "../utility/Loading.tsx";

function RSVPPortal({ groupId, groupName }: { groupId: number; groupName: string }) {
  const queryClient = useQueryClient();
  const portalRef = useRef<HTMLDivElement>(null);

  //GET call to check if there any RSVPs assigned to the groupID
  const groupRSVPs = useQuery<RSVP[], ErrorType>({
    queryKey: ["groupRSVP"],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rsvps/group/${groupId}`);

      if (!response.ok) {
        const errorData: ErrorType = await response.json();
        throw errorData;
      }
      const results = await response.json();
      return results.sort((a, b) => {
        const idA = a.guest_id;
        const idB = b.guest_id;
        if (idA < idB) {
          return -1;
        } else if (idA > idB) {
          return 1;
        } else {
          return 0;
        }
      });
    },
  });

  // seperate GroupData query from lookup because this instance gets updated when info is changed
  const groupData = useQuery<GroupData, ErrorType>({
    queryKey: ["groupData"],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/guests/group/${groupId}`);

      if (!response.ok) {
        const errorData: ErrorType = await response.json();
        throw errorData;
      }
      return await response.json();
    },
  });

  function refreshData() {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey.every((key: any) => ["groupRSVP", "groupData"].includes(key)),
    });
  }

  // possible location for the flashing bug
  if (groupRSVPs.isPending || groupData.isPending) {
    return <Loading loadingText={`Loading {groupName}'s Portal Information...`} />;
  }

  // idk if i want / need this
  // might want to do something else if isFetching
  // if (groupRSVPs.isFetching || groupData.isFetching) {
  //   return <Loading loadingText={`Refreshing {groupName}'s Portal Information...`} />;
  // }

  if (groupRSVPs.isError) {
    return <Error errorInfo={groupRSVPs.error} tryEnabled={true} handleRetry={refreshData} />;
  }

  if (groupData.isError) {
    return <Error errorInfo={groupData.error} tryEnabled={true} handleRetry={refreshData} />;
  }

  const resetScroll = () => {
    portalRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  };

  // possible location for the flashing bug
  return (
    <div ref={portalRef} id="rsvp-portal-container">
      <p className="strong-text font-med contain-text-center" style={{ marginBottom: "2rem" }}>
        {groupName}'s RSVP Portal
      </p>
      {groupRSVPs.data.length > 0 && (
        <RSVPStatusMenu
          groupData={groupData.data}
          groupRSVPs={groupRSVPs.data}
          refreshData={refreshData}
          handleScroll={resetScroll}
        />
      )}
      {groupRSVPs.data.length === 0 && (
        <RSVPForm groupData={groupData.data} sendRefresh={refreshData} handleScroll={resetScroll} />
      )}
    </div>
  );
}

export default RSVPPortal;
