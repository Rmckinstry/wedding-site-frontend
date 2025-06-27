function Loading({ loadingText }: { loadingText: string }) {
  return (
    <div id="loading-container">
      <p className="loading-text">{loadingText}</p>
    </div>
  );
}
export default Loading;
