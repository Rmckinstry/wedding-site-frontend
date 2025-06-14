import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import RSVPLookup from "./RSVPLookup.tsx";
import RSVPPortal from "./RSVPPortal.tsx";
import { Guest } from "../../utility/types.ts";

function RSVPPage() {
  // tracks the selected guestId that is accessing the portal
  // tracks name for easy display purposes
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleGroupSelect = (data: { name: string; id: number }) => {
    setSelectedGroupId(data.id);
    setSelectedGroupName(data.name);
  };

  const { isPending, isError, data, error } = useQuery<Guest[]>({
    queryKey: ["allGuests"],
    queryFn: async () => {
      const response = await fetch("https://wedding-site-backend-76nm.onrender.com/guests");
      return await response.json();
    },
  });

  if (isPending) {
    return <p>Loading RSVP Portal...</p>;
  }

  if (isError) {
    return <p>Error: {error.message}</p>;
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
