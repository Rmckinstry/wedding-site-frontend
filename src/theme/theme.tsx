import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#646440",
    },
    secondary: {
      main: "#646440",
    },
  },
  components: {
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "var(--default-text)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "var(--default-text)",
          fontSize: "1.5rem",
          marginRight: "1rem",
          marginLeft: "1rem",
          fontFamily: "Cormorant Garamond",
          "&.Mui-selected": {
            color: "var(--default-text)",
          },
          "&:hover": {
            color: "var(--default-text)",
            fontWeight: "600",
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          color: "var(--default-text)",
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
          color: "var(--default-text)",
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
            color: "var(--default-text)",
          },
          "&.Mui-completed": {
            color: "var(--default-text)",
          },
          "&.Mui-disabled": {
            color: "gray",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: "Cormorant Garamond",
          fontWeight: "600",
          "&.Mui-focused": {
            color: "var(--default-text)",
          },
          "&.Mui-completed": {
            color: "var(--default-text)",
          },
          "&.Mui-disabled": {
            color: "gray",
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--default-text)",
          },
        },
        notchedOutline: {
          borderColor: "var(--default-text)",
        },
      },
    },

    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: "var(--default-text)",
        },
      },
    },

    MuiToggleButton: {
      // Target the ToggleButton component
      styleOverrides: {
        root: {
          // Default state (not selected)
          backgroundColor: "var(--base-background)",
          color: "var(--default-text)",
          borderColor: "var(--default-text)",

          // Selected state
          "&.Mui-selected": {
            backgroundColor: "var(--default-text)",
            color: "var(--base-background)",
            borderColor: "var(--default-text)",
            "&:hover": {
              backgroundColor: "var(--default-text)",
              color: "var(--base-background)",
            },
          },

          "&:hover": {
            backgroundColor: "#EEE",
          },

          "& + &.MuiToggleButton-root": {
            borderColor: "var(--default-text)",
            marginLeft: "-1px",
          },
          "&.Mui-selected + &.MuiToggleButton-root": {
            borderColor: "var(--default-text)",
          },
        },
      },
    },

    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: "var(--default-text)",
          "&.Mui-active": {
            color: "var(--default-text)",
          },
        },
      },
    },

    MuiFormLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: "var(--default-text)",
          fontSize: "1.25rem",
          fontFamily: "Cormorant Garamond",
          [theme.breakpoints.down("md")]: {
            fontSize: "1.75rem",
          },
        }),
      },
    },

    MuiStepIcon: {
      styleOverrides: {
        root: {
          "&.Mui-active": {
            color: "var(--default-text)",
          },
          "&.Mui-completed": {
            color: "var(--default-text)",
          },
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: "16px",
        },
      },
    },

    MuiMobileStepper: {
      styleOverrides: {
        root: {
          position: "unset",
        },
        progress: {
          width: "100%",
        },
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        // This targets the paper component used for the dropdown
        paper: ({ theme }) => ({
          "& .MuiAutocomplete-listbox": {
            [theme.breakpoints.down("md")]: {
              // Apply for md and sm breakpoints
              fontSize: "1.75rem",
            },
          },
          "& .MuiAutocomplete-option": {
            [theme.breakpoints.down("md")]: {
              // Apply for md and sm breakpoints
              fontSize: "1.75rem",
            },
          },
        }),
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
