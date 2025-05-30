import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

function DesktopTabBar({ tabValue = 0, handleChange }) {
  return (
    <>
      <div className="flex-row">
        <Tabs
          value={tabValue}
          onChange={handleChange}
          aria-label="Tab bar"
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
        >
          <Tab label="Home" className="custom-tab" />
          <Tab label="Travel" className="custom-tab" />
          <Tab label="FAQ" className="custom-tab" />
          <Tab label="Registry" className="custom-tab" />
        </Tabs>
      </div>
    </>
  );
}

export default DesktopTabBar;
