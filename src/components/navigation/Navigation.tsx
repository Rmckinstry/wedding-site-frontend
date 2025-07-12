import React from "react";
import DesktopTabBar from "./DesktopTabBar.tsx";
import MobileSelectNav from "./MobileSelectNav.tsx";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material";

function Navigation({ tabValue = 0, handleChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <div id="tab-bar-container">
      {isMobile ? (
        <div id="nav-mobile-container">
          <MobileSelectNav tabValue={tabValue} handleChange={handleChange} />
        </div>
      ) : (
        <div id="nav-desktop-container">
          <DesktopTabBar tabValue={tabValue} handleChange={handleChange} />
        </div>
      )}
    </div>
  );
}

export default Navigation;
