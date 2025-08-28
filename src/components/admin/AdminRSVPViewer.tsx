import React from "react";
import { Guest, RSVP } from "../../utility/types";
import { convertUtcToCst } from "../../utility/util.ts";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AccordionDetails from "@mui/material/AccordionDetails";

function AdminRSVPViewer({
  guestData,
  rsvpData,
  handleMenuClick,
}: {
  guestData: Guest[];
  rsvpData: RSVP[];
  handleMenuClick: () => void;
}) {
  const separator = "\u00A7";
  return (
    <div id="admin-rsvp-viewer">
      <p className="font-sm-med underline contain-text-center">RSVP Viewer</p>
      <div id="rsvp-viewer-container" className="flex-row">
        <div id="rsvp-viewer-accepted" className="viewer-item">
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDownwardIcon />} aria-controls="panel1-content" id="panel1-header">
              <p className="font-sm-med strong-text underline contain-text-center">Accepted</p>
            </AccordionSummary>
            <AccordionDetails>
              <div className="flex-col-start" style={{ marginTop: "1rem" }}>
                {rsvpData
                  .filter((rsvp) => rsvp.attendance === true)
                  .map((rsvp, index) => {
                    let guest = guestData.find((guest) => guest.guest_id === rsvp.guest_id);
                    if (guest) {
                      return (
                        <div className="rsvp-viewer-guest flex-col-start" style={{ gap: "1rem" }} key={index}>
                          <div className="flex-row-start" style={{ gap: "1rem" }}>
                            <p className="font-sm strong-text">Name:</p>
                            <p className="font-sm underline">{guest.name}</p>
                          </div>
                          {guest.additional_guest_type !== null && (
                            <div>
                              <div className="flex-row-start" style={{ gap: "1rem" }}>
                                <p className="font-sm strong-text">Guest Type:</p>
                                <p className="font-sm">{guest.additional_guest_type}</p>
                              </div>
                              <div className="flex-row-start" style={{ gap: "1rem" }}>
                                <p className="font-sm strong-text">Added By:</p>
                                <p className="font-sm">
                                  {guestData.find((main) => main.guest_id === guest.added_by_guest_id)?.name}
                                </p>
                              </div>
                            </div>
                          )}
                          {rsvp.spotify !== "" && (
                            <div>
                              <p className="font-sm strong-text">Spotify</p>
                              {rsvp.spotify.split(separator).map((song) => (
                                <p className="font-sm ">- {song}</p>
                              ))}
                            </div>
                          )}
                          <div className="flex-row-start" style={{ gap: "1rem" }}>
                            <p className="font-sm strong-text">Created At:</p>
                            <p className="font-sm">{convertUtcToCst(rsvp.created_at) + "CST"}</p>
                          </div>
                          <div className="flex-row-start" style={{ gap: "1rem" }}>
                            <p className="font-sm strong-text">Updated At:</p>
                            <p className="font-sm">
                              {rsvp.updated_at ? convertUtcToCst(rsvp.updated_at) + "CST" : "N/A"}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
        <div id="rsvp-viewer-declined" className="viewer-item">
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDownwardIcon />} aria-controls="panel1-content" id="panel1-header">
              <p className="font-sm-med strong-text underline contain-text-center">Declined</p>
            </AccordionSummary>
            <AccordionDetails>
              <div className="flex-col-start" style={{ marginTop: "1rem" }}>
                {rsvpData
                  .filter((rsvp) => rsvp.attendance === false)
                  .map((rsvp, index) => {
                    let guest = guestData.find((guest) => guest.guest_id === rsvp.guest_id);
                    if (guest) {
                      return (
                        <div
                          className="rsvp-viewer-guest flex-col-start"
                          style={{ gap: "1rem" }}
                          key={`${index}-declined`}
                        >
                          <div className="flex-row-start" style={{ gap: "1rem" }}>
                            <p className="font-sm strong-text">Name:</p>
                            <p className="font-sm underline">{guest.name}</p>
                          </div>
                          <div className="flex-row-start" style={{ gap: "1rem" }}>
                            <p className="font-sm strong-text">Created At:</p>
                            <p className="font-sm">{convertUtcToCst(rsvp.created_at) + "CST"}</p>
                          </div>
                          <div className="flex-row-start" style={{ gap: "1rem" }}>
                            <p className="font-sm strong-text">Updated At:</p>
                            <p className="font-sm">
                              {rsvp.updated_at ? convertUtcToCst(rsvp.updated_at) + "CST" : "N/A"}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>

      <div className="btn-container">
        <button className="btn-rsvp" onClick={handleMenuClick} style={{ marginTop: "1rem" }}>
          Admin Menu
        </button>{" "}
      </div>
    </div>
  );
}

export default AdminRSVPViewer;
