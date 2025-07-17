import React from "react";

interface SuccessProps {
  message: string;
  btnMessage?: string;
  handleAction?: () => void;
}
function Success({ message, btnMessage = "", handleAction }: SuccessProps) {
  return (
    <div className="success-container flex-col">
      <p className="success-message font-sm">{message}</p>
      {btnMessage !== "" && (
        <div className="btn-container">
          <button className="btn-rsvp-sm" onClick={handleAction}>
            {btnMessage}
          </button>
        </div>
      )}
    </div>
  );
}

export default Success;
