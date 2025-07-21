import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ErrorType, Group, Guest, RSVP } from "../../utility/types";
import Loading from "../utility/Loading.tsx";
import Error from "../utility/Error.tsx";
import { useNavigate } from "react-router-dom";
import AdminGroupEditor from "./AdminGroupEditor.tsx";
import AdminRSVPViewer from "./AdminRSVPViewer.tsx";

function AdminDashboard() {
  const navigate = useNavigate();

  const [acceptedRsvpsCount, setAcceptedRsvpsCount] = useState<number>(0);
  const [declinedRsvpsCount, setDeclinedRsvpsCount] = useState<number>(0);
  const [plusOneCount, setPlusOneCount] = useState<number>(0);
  const [dependentCount, setDependentCount] = useState<number>(0);

  const [adminState, setAdminState] = useState<string>("menu");

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

  const allGroupsQuery = useQuery<Group[], ErrorType>({
    queryKey: ["allGroupsAdmin"],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/groups`);

      if (!response.ok) {
        const errorData: ErrorType = await response.json();
        throw errorData;
      }

      return await response.json();
    },
  });

  // quick view data update effect
  useEffect(() => {
    if (allGuestsQuery.data) {
      const plusOneCount = allGuestsQuery.data.filter((guest) => guest.additional_guest_type === "plus_one").length;
      const dependentCount = allGuestsQuery.data.filter((guest) => guest.additional_guest_type === "dependent").length;

      setPlusOneCount(plusOneCount);
      setDependentCount(dependentCount);
    }

    if (allRsvpsQuery.data) {
      const acceptedCount = allRsvpsQuery.data.filter((rsvp) => rsvp.attendance === true).length;
      const declinedCount = allRsvpsQuery.data.filter((rsvp) => rsvp.attendance === false).length;

      setAcceptedRsvpsCount(acceptedCount);
      setDeclinedRsvpsCount(declinedCount);
    }
  }, [allGuestsQuery.data, allRsvpsQuery.data]);

  // TODO probably needs to be split out
  const refreshData = () => {
    allGuestsQuery.refetch();
    allRsvpsQuery.refetch();
    allGroupsQuery.refetch();
  };

  //#region quickview loading
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
    <div id="admin-container" className="flex-col flex-col-lg">
      <h3 className="contain-text-center">Admin Dashboard</h3>
      <div id="admin-quickview-container" className="flex-row">
        <div className="quickview-item">
          <p className="font-sm-med strong-text underline">Total Guests</p>
          <p className="font-sm">{allGuestsQuery.data?.length}</p>
        </div>
        <div className="quickview-item">
          <p className="font-sm-med strong-text underline">Accepted</p>
          <p className="font-sm">{acceptedRsvpsCount}</p>
        </div>
        <div className="quickview-item">
          <p className="font-sm-med strong-text underline">Declined</p>
          <p className="font-sm">{declinedRsvpsCount}</p>
        </div>
        <div className="quickview-item">
          <p className="font-sm-med strong-text underline">Not Responded</p>
          <p className="font-sm">
            {allGuestsQuery.data ? allGuestsQuery.data.length - (acceptedRsvpsCount + declinedRsvpsCount) : 0}
          </p>
        </div>
        <div className="quickview-item">
          <p className="font-sm strong-text">Plus One : {plusOneCount}</p>
          <p className="font-sm strong-text">Children : {dependentCount}</p>
        </div>
      </div>
      <div id="admin-content-container" style={{ width: "100%" }}>
        {adminState === "group" && (
          <AdminGroupEditor
            groupData={allGroupsQuery.data!}
            guestData={allGuestsQuery.data!}
            handleDataRefresh={refreshData}
            handleMenuClick={() => {
              setAdminState("menu");
            }}
          />
        )}
        {adminState === "rsvp-viewer" && (
          <AdminRSVPViewer
            guestData={allGuestsQuery.data!}
            rsvpData={allRsvpsQuery.data!}
            handleMenuClick={() => {
              setAdminState("menu");
            }}
          />
        )}
        {adminState === "menu" && (
          <div id="admin-action-selector-container" className="flex-col flex-col-lg">
            <p className="font-sm-med underline">Select Admin Menu</p>
            <div className="flex-row-gap">
              <button
                className="btn-rsvp"
                onClick={() => {
                  setAdminState("rsvp-viewer");
                }}
              >
                RSVP Viewer
              </button>
              <button
                className="btn-rsvp"
                onClick={() => {
                  setAdminState("group");
                }}
              >
                Group Editor
              </button>
              {/* unimplemented */}
              {/* <button>Guest Editor</button> */}
              {/* <button>RSVP Editor</button> */}
            </div>
          </div>
        )}
      </div>
      <div className="btn-container">
        <button
          className="btn-rsvp btn-alt"
          onClick={() => {
            navigate("/");
          }}
        >
          Back to main site
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;
