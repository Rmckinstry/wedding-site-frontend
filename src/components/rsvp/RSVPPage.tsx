import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import RSVPLookup from "./RSVPLookup.tsx";
import RSVPPortal from "./RSVPPortal.tsx";
import { ErrorType, Guest } from "../../utility/types.ts";
import Error from "../utility/Error.tsx";

function RSVPPage() {
  // tracks the selected guestId that is accessing the portal
  // tracks name for easy display purposes
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleGroupSelect = (data: { name: string; id: number }) => {
    setSelectedGroupId(data.id);
    setSelectedGroupName(data.name);
  };

  const { isPending, isError, data, error } = useQuery<Guest[], ErrorType>({
    queryKey: ["allGuests"],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/guests`);

      if (!response.ok) {
        const errorData: ErrorType = await response.json();
        throw errorData;
      }
      return await response.json();
    },
  });

  if (isPending) {
    return <p>Loading RSVP Portal...</p>;
  }

  if (isError) {
    // return <p>Error: {error.message}</p>;
    return <Error errorInfo={error} />;
  }
  return (
    <>
      <div className="rsvp-page-container">
        {selectedGroupId === null && <RSVPLookup data={data} handleGroupSelect={handleGroupSelect} />}
        {selectedGroupId !== null && <RSVPPortal groupName={selectedGroupName} groupId={selectedGroupId} />}
      </div>
    </>
  );
}

export default RSVPPage;
