import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
function RSVP() {
  const queryClient = useQueryClient();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["allGuests"],
    queryFn: async () => {
      const response = await fetch("https://wedding-site-backend-76nm.onrender.com/guests");
      return await response.json();
    },
  });

  if (isPending) {
    return <p>Loading Data...</p>;
  }

  if (isError) {
    return <p>Error: {error.message}</p>;
  }
  return (
    <>
      <p>rsvp page</p>
      <div>
        {data.map((guest) => (
          <p key={guest.id}>{guest.name}</p>
        ))}
      </div>
    </>
  );
}

export default RSVP;
