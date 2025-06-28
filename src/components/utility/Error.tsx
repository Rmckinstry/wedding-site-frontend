import React from "react";
import { ErrorType } from "../../utility/types";

interface ErrorProps {
  errorInfo: ErrorType;
  tryEnabled?: boolean;
  handleRetry?: () => void;
}

function Error({ errorInfo, tryEnabled = false, handleRetry }: ErrorProps) {
  return (
    <>
      <div className="error-container flex-col">
        <p className="font-med strong-text" style={{ textDecoration: "underline" }}>
          Error
        </p>
        <p className="font-sm-med">
          {errorInfo.message === "Failed to fetch"
            ? "There was an unexpected error with the server. Please try again later."
            : errorInfo.message}
        </p>
        <p className="font-sm-med">EC:{errorInfo.status}</p>

        {tryEnabled && (
          <div className="btn-container">
            <button className="btn-rsvp-sm" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Error;
