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
import React, { useEffect, useState } from "react";
import { CustomResponseType, ErrorType, Group, Guest } from "../../utility/types";
import { useMutation } from "@tanstack/react-query";

export type NewGuest = {
  name: string;
  email: null;
  plusOneAllowed: boolean;
  hasDependents: boolean;
  groupId: number;
  songRequests: number;
};

function AdminGroupEditor({
  groupData,
  guestData,
  handleDataRefresh,
  handleMenuClick,
}: {
  groupData: Group[];
  guestData: Guest[];
  handleDataRefresh: () => void;
  handleMenuClick: () => void;
}) {
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

  useEffect(() => {
    setNewGuestData(initialNewGuestState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);
  const handleGroupChange = (event) => {
    // Find the selected group object from the fetched data
    const selectedGroupByName = groupData.find((group) => group.group_name === event.target.value);
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
    addGuestsMutation.mutate();
  };

  const addGuestsMutation = useMutation<CustomResponseType, ErrorType>({
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
      handleDataRefresh();
      setNewGuestData(initialNewGuestState);
      console.log("Response from server:", data);
    },
    onError: (error: ErrorType) => {
      console.log(error);
      console.error("Error adding Guest:", error.message);
    },
  });
  return (
    <div id="admin-group-editor" className="flex-col flex-col-lg">
      <p className="font-sm-med strong underline">Group Editor</p>
      <div id="admin-groups-select-container" className="flex-col" style={{ padding: "1rem" }}>
        <FormControl sx={{ minWidth: "20rem" }}>
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
            {groupData.map((group) => (
              <MenuItem key={group.id} value={group.group_name}>
                {group.group_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      {selectedGroup !== null ? (
        <div id="admin-group-editor-container">
          <div id="admin-group-editor-guest-list" className=" admin-group-editor-item">
            <p className="font-med strong underline contain-text-center">Guests:</p>
            {guestData
              .filter((guest) => {
                return guest.group_id === selectedGroup.id;
              })
              .map((guest) => {
                return (
                  <p className="font-sm-med" key={guest.guest_id} style={{ marginBottom: "1rem" }}>
                    - {guest.name}
                  </p>
                );
              })}
          </div>
          <div id="admin-group-editor-guest-add" className="flex-col-start admin-group-editor-item">
            <p className="font-med strong underline contain-text-center">Add New Guest to {selectedGroup.group_name}</p>
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
              disabled={addGuestsMutation.isPending || newGuestData.name === ""}
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
      <div className="btn-container">
        <button className="btn-rsvp" onClick={handleMenuClick}>
          Admin Menu
        </button>{" "}
      </div>
    </div>
  );
}

export default AdminGroupEditor;
