import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import RSVPLookup from "./RSVPLookup.tsx";
import RSVPPortal from "./RSVPPortal.tsx";
import { ErrorType, Guest } from "../../utility/types.ts";
import Error from "../utility/Error.tsx";
import Loading from "../utility/Loading.tsx";

function RSVPPage() {
  // tracks the selected guestId that is accessing the portal
  // tracks name for easy display purposes
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleGroupSelect = (data: { name: string; id: number }) => {
    setSelectedGroupId(data.id);
    setSelectedGroupName(data.name);
  };

  const guestQuery = useQuery<Guest[], ErrorType>({
    queryKey: ["allGuests"],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/guests`);

      if (!response.ok) {
        const errorData: ErrorType = await response.json();
        throw errorData;
      }
      const results = await response.json();
      return results.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        } else if (nameA > nameB) {
          return 1;
        } else {
          return 0;
        }
      });
    },
  });

  if (guestQuery.isPending) {
    return <Loading loadingText={"Loading RSVP Portal. Please wait..."} />;
  }

  if (guestQuery.isError) {
    return <Error errorInfo={guestQuery.error} tryEnabled={true} handleRetry={guestQuery.refetch} />;
  }
  return (
    <>
      <div className="rsvp-page-container">
        {selectedGroupId === null && <RSVPLookup data={guestQuery.data} handleGroupSelect={handleGroupSelect} />}
        {selectedGroupId !== null && <RSVPPortal groupName={selectedGroupName} groupId={selectedGroupId} />}
      </div>
    </>
  );
}

export default RSVPPage;
