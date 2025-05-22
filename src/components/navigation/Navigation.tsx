import DesktopTabBar from "./DesktopTabBar.tsx";
import MobileSelectNav from "./MobileSelectNav.tsx";

function Navigation({ tabValue = 0, handleChange }) {
  return (
    <>
      <div id="tab-bar-container">
        <div id="nav-desktop-container">
          <DesktopTabBar tabValue={tabValue} handleChange={handleChange} />
        </div>
        <div id="nav-mobile-container">
          <MobileSelectNav tabValue={tabValue} handleChange={handleChange} />
        </div>
      </div>
    </>
  );
}

export default Navigation;
