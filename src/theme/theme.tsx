import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "var(--default-text)", // Indicator color
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "var(--default-text)", // Default text color
          fontSize: "1.25rem",
          marginRight: "1rem",
          marginLeft: "1rem",
          fontFamily: "Cormorant Garamond",
          "&.Mui-selected": {
            color: "var(--default-text)", // Selected text color
          },
          "&:hover": {
            color: "var(--default-text)", // Hover text color
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          color: "var(--default-text)", // Default text color
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--base-background)",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "Cormorant Garamond",
          fontWeight: "600",
        },
      },
    },
    MuiNativeSelect: {
      styleOverrides: {
        root: {
          color: "var(--default-text)", // Default text color
          fontSize: "1.25rem",
          fontFamily: "Cormorant Garamond",
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        root: {
          fontFamily: "Cormorant Garamond",
          fontWeight: "600",
        },
        label: {
          "&.Mui-active": {
            color: "var(--default-text)", // Active step label color
          },
          "&.Mui-completed": {
            color: "var(--default-text)", // Completed step label color
          },
          "&.Mui-disabled": {
            color: "gray", // Disabled step label color
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 601,
      md: 901,
      lg: 1921,
      xl: 2000,
    },
  },
});

export default theme;
