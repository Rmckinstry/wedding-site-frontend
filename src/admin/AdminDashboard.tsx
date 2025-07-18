import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { CustomResponseType, ErrorType, Group, Guest, RSVP } from "../utility/types";
import Loading from "../components/utility/Loading.tsx";
import Error from "../components/utility/Error.tsx";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export type NewGuest = {
  name: string;
  email: null;
  plusOneAllowed: boolean;
  hasDependents: boolean;
  groupId: number;
  songRequests: number;
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [acceptedRsvpsCount, setAcceptedRsvpsCount] = useState<number>(0);
  const [declinedRsvpsCount, setDeclinedRsvpsCount] = useState<number>(0);
  const [plusOneCount, setPlusOneCount] = useState<number>(0);
  const [dependentCount, setDependentCount] = useState<number>(0);

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const initialNewGuestState: NewGuest = {
    name: "",
    email: null,
    plusOneAllowed: false,
    hasDependents: false,
    groupId: selectedGroup?.id || 0,
    songRequests: 2,
  };
  const [newGuestData, setNewGuestData] = useState<NewGuest>(initialNewGuestState);

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

  useEffect(() => {
    setNewGuestData(initialNewGuestState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  // TODO probably needs to be split out
  const refreshData = () => {
    allGuestsQuery.refetch();
    allRsvpsQuery.refetch();
    allGroupsQuery.refetch();
  };

  const handleGroupChange = (event) => {
    // Find the selected group object from the fetched data
    const selectedGroupByName = allGroupsQuery.data?.find((group) => group.group_name === event.target.value);
    setSelectedGroup(selectedGroupByName!);
  };

  // Generic handler for all form fields
  const handleNewGuestInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;

    // For checkbox inputs, 'checked' property is on HTMLInputElement
    if (type === "checkbox") {
      const target = event.target as HTMLInputElement;
      setNewGuestData((prevData) => ({
        ...prevData,
        [name]: target.checked,
      }));
    } else {
      setNewGuestData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Handler for number inputs specifically (e.g., song_requests)
  const handleNumberInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewGuestData((prevData) => ({
      ...prevData,
      [name]: Number(value), // Ensure it's stored as a number
    }));
  };

  const handleGuestAdd = () => {
    submitRsvpsMutation.mutate();
  };

  const submitRsvpsMutation = useMutation<CustomResponseType, ErrorType>({
    mutationFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/guests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGuestData),
      });

      if (!response.ok) {
        const errorBody: ErrorType = await response.json();
        throw errorBody;
      }

      return response.json() as Promise<CustomResponseType>;
    },
    onSuccess: (data) => {
      refreshData();
      setNewGuestData(initialNewGuestState);
      console.log("Response from server:", data);
    },
    onError: (error: ErrorType) => {
      console.log(error);
      console.error("Error adding Guest:", error.message);
    },
  });

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
    <div style={{ padding: "0rem 10rem" }}>
      <h3 className="contain-text-center">Admin Dashboard</h3>
      <div
        id="admin-stat-quickview-container"
        className="flex-row"
        style={{ justifyContent: "space-between", padding: "2rem" }}
      >
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
      <div style={{ width: "100%", height: "2px", color: "var(--default-text-transparent)" }}></div>
      <div className="">
        {/* temporary - this will be moved to a menu system */}
        <div id="admin-groups-select-container" className="flex-col" style={{ padding: "1rem" }}>
          <FormControl sx={{ minWidth: "20rem" }}>
            {/* Add a minWidth for better display */}
            <InputLabel id="group-select-label">Groups</InputLabel>
            {/* TODO - replace with autocomplete */}
            <Select
              labelId="group-select-label"
              id="group-select"
              value={selectedGroup?.group_name || ""}
              label="Groups"
              onChange={handleGroupChange}
            >
              {/* Map over the fetched groups to create MenuItem components */}
              {allGroupsQuery.data?.map((group) => (
                <MenuItem key={group.id} value={group.group_name}>
                  {group.group_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        {selectedGroup !== null ? (
          <div id="admin-group editor" className="flex-row" style={{ gap: "20%", alignItems: "baseline" }}>
            {/* for now just add guest - more will be added later (edit guest, delete guest */}
            <div id="admin-group-editor-guest-list">
              <p className="font-med strong underline">Guests:</p>
              {allGuestsQuery.data
                ?.filter((guest) => {
                  return guest.group_id === selectedGroup.id;
                })
                .map((guest) => {
                  return (
                    <p className="font-sm-med" key={guest.guest_id}>
                      - {guest.name}
                    </p>
                  );
                })}
            </div>
            <div
              id="admin-group-editor-guest-add"
              style={{
                marginTop: "20px",
                padding: "1rem",
                outlineStyle: "solid",
                outlineColor: "var(--default-text-transparent)",
                borderRadius: "1rem",
              }}
              className="flex-col-start"
            >
              <p className="font-med strong underline">Add New Guest to {selectedGroup.group_name}</p>
              <FormGroup>
                <TextField
                  label="Guest Name"
                  variant="outlined"
                  name="name" // Important for generic handler
                  value={newGuestData.name}
                  onChange={handleNewGuestInputChange}
                  size="small"
                  fullWidth
                  margin="dense"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newGuestData.hasDependents}
                      onChange={handleNewGuestInputChange}
                      name="hasDependents" // Important for generic handler
                    />
                  }
                  label="Has Dependents"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newGuestData.plusOneAllowed}
                      onChange={handleNewGuestInputChange}
                      name="plusOneAllowed" // Important for generic handler
                    />
                  }
                  label="Plus One Allowed"
                />
                <TextField
                  label="Song Requests"
                  variant="outlined"
                  name="songRequests" // Important for generic handler
                  value={newGuestData.songRequests}
                  onChange={handleNumberInputChange} // Use specific handler for numbers
                  type="number" // Only allow number input
                  size="small"
                  fullWidth
                  margin="dense"
                />
              </FormGroup>
              <Button
                disabled={submitRsvpsMutation.isPending || newGuestData.name === ""}
                variant="contained"
                onClick={handleGuestAdd}
                sx={{ marginTop: 2 }}
              >
                Add Guest
              </Button>
            </div>
          </div>
        ) : (
          <p className="contain-text-center strong font-sm">Select Group Name to edit group</p>
        )}
      </div>
      <div className="btn-container" style={{ marginTop: "2rem" }}>
        <button
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
