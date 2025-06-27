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
      <div className="error-container">
        <p>Error</p>
        <p>
          {errorInfo.message === "Failed to fetch"
            ? "There was an unexpected error with the server. Please try again later."
            : errorInfo.message}
        </p>
        <p>{errorInfo.status}</p>

        {tryEnabled && (
          <div className="btn-container">
            <button onClick={handleRetry}>Try Again</button>
          </div>
        )}
      </div>
    </>
  );
}

export default Error;
