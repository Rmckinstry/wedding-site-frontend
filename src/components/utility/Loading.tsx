import { CircularProgress } from "@mui/material";

function Loading({ loadingText }: { loadingText: string }) {
  return (
    <div id="loading-container" className="flex-col">
      <CircularProgress size="4rem" />
      <p className="loading-text font-sm-med">{loadingText}</p>
    </div>
  );
}
export default Loading;
