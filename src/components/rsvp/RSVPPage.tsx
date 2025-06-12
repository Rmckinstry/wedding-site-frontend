import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import RSVPLookup from "./RSVPLookup.tsx";
import RSVPPortal from "./RSVPPortal.tsx";

function RSVPPage() {
  // tracks the selected guest that is accessing the portal
  const [selectedGroupData, setSelectedGroupData] = useState(null);

  const handleGroupSelect = (data) => {
    setSelectedGroupData(data);
  };

  const { isPending, isError, data, error } = useQuery({
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
        {selectedGroupData === null && <RSVPLookup data={data} handleGroupSelect={handleGroupSelect} />}
        {selectedGroupData !== null && <RSVPPortal groupData={selectedGroupData} />}
      </div>
    </>
  );
}

export default RSVPPage;
