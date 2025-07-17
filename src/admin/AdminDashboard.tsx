import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ErrorType, GroupData, Guest, RSVP } from "../utility/types";
import Loading from "../components/utility/Loading.tsx";
import Error from "../components/utility/Error.tsx";

function AdminDashboard() {
  const [acceptedRsvpsCount, setAcceptedRsvpsCount] = useState<number>(0);
  const [declinedRsvpsCount, setDeclinedRsvpsCount] = useState<number>(0);
  const [plusOneCount, setPlusOneCount] = useState<number>(0);
  const [dependentCount, setDependentCount] = useState<number>(0);

  const allGuestsQuery = useQuery<Guest[], ErrorType>({
    queryKey: ["allGuestsAdmin"],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/guests`);

      if (!response.ok) {
        const errorData: ErrorType = await response.json();
        throw errorData;
      }

      return await response.json();
    },
  });

  const allRsvpsQuery = useQuery<RSVP[], ErrorType>({
    queryKey: ["allRsvpsAdmin"],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rsvps`);

      if (!response.ok) {
        const errorData: ErrorType = await response.json();
        throw errorData;
      }

      return await response.json();
    },
  });

  useEffect(() => {
    if (allGuestsQuery.data) {
    }

    if (allRsvpsQuery.data) {
      const acceptedCount = allRsvpsQuery.data.filter((rsvp) => rsvp.attendance === true).length;
      const declinedCount = allRsvpsQuery.data.filter((rsvp) => rsvp.attendance === false).length;

      setAcceptedRsvpsCount(acceptedCount);
      setDeclinedRsvpsCount(declinedCount);
    }
  }, [allGuestsQuery.data, allRsvpsQuery.data]);

  if (allGuestsQuery.isLoading || allRsvpsQuery.isLoading) {
    return <Loading loadingText={"Loading Quickview Data..."} />;
  }
  if (allGuestsQuery.isError) {
    return <Error errorInfo={allGuestsQuery.error} />;
  }

  if (allRsvpsQuery.isError) {
    return <Error errorInfo={allRsvpsQuery.error} />;
  }
  return (
    <div>
      <h3>Admin Dashboard</h3>
      <div id="admin-stat-quickview-container">
        <div className="quickview-item">
          <p>Total Guests</p>
          <p>{allGuestsQuery.data?.length}</p>
        </div>
        <div className="quickview-item">
          <p>Accepted</p>
          <p>{acceptedRsvpsCount}</p>
        </div>
        <div className="quickview-item">
          <p>Declined</p>
          <p>{declinedRsvpsCount}</p>
        </div>
        <div className="quickview-item">
          <p>Not Responded</p>
          <p>{allGuestsQuery.data ? allGuestsQuery.data.length - (acceptedRsvpsCount + declinedRsvpsCount) : 0}</p>
        </div>
        <div className="quickview-item">
          <p>Plus One : {plusOneCount}</p>
          <p>Children : {dependentCount}</p>
        </div>
      </div>
      <button
        onClick={() => {
          allGuestsQuery.refetch();
        }}
      >
        Refresh
      </button>
    </div>
  );
}

export default AdminDashboard;
