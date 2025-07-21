import React from "react";
import { Guest, RSVP } from "../../utility/types";
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
      <p>RSVP Viewer</p>
      <div id="rsvp-viewer-container">
        <div id="rsvp-viewer-accepted">
          <p>Accepted</p>
          {rsvpData
            .filter((rsvp) => rsvp.attendance === true)
            .map((rsvp) => {
              let guest = guestData.find((guest) => guest.guest_id === rsvp.guest_id);
              if (guest) {
                return (
                  <div className="rsvp-viewer-guest">
                    <p>Name: {guest.name}</p>
                    {rsvp.spotify !== "" && (
                      <div>
                        <p>Spotify</p>
                        {rsvp.spotify.split(separator).map((song) => (
                          <p>- {song}</p>
                        ))}
                      </div>
                    )}
                    <p>Created At: {rsvp.created_at}</p>
                    <p>Updated At: {rsvp.updated_at ? rsvp.updated_at : "N/A"}</p>
                  </div>
                );
              }
              return null;
            })}
        </div>
        <div id="rsvp-viewer-declined">
          <p>Declined</p>
          {rsvpData
            .filter((rsvp) => rsvp.attendance === false)
            .map((rsvp) => {
              let guest = guestData.find((guest) => guest.guest_id === rsvp.guest_id);
              if (guest) {
                return (
                  <div className="rsvp-viewer-guest">
                    <p>Name: {guest.name}</p>
                    <p>Created At: {rsvp.created_at}</p>
                    <p>Updated At: {rsvp.updated_at ? rsvp.updated_at : "N/A"}</p>
                  </div>
                );
              }
              return null;
            })}
        </div>
      </div>

      <div className="btn-container">
        <button onClick={handleMenuClick}>Admin Menu</button>{" "}
      </div>
    </div>
  );
}

export default AdminRSVPViewer;
