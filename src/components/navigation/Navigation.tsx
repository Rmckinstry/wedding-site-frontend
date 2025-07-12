import React from "react";
import DesktopTabBar from "./DesktopTabBar.tsx";
import MobileSelectNav from "./MobileSelectNav.tsx";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material";
import { useNavigation } from "../../context/NavigationContext.tsx";

function Navigation() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { tabValue, handleTabChange } = useNavigation();
  return (
    <div id="tab-bar-container">
      {isMobile ? (
        <div id="nav-mobile-container">
          <MobileSelectNav tabValue={tabValue} handleChange={handleTabChange} />
        </div>
      ) : (
        <div id="nav-desktop-container">
          <DesktopTabBar tabValue={tabValue} handleChange={handleTabChange} />
        </div>
      )}
    </div>
  );
}

export default Navigation;
