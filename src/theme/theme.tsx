import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: 'var(--default-text)', // Indicator color
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'var(--default-text)', // Default text color
          '&.Mui-selected': {
            color: 'var(--default-text)', // Selected text color
          },
          '&:hover': {
            color: 'var(--default-text)', // Hover text color
          },
        },
      },
    },
  },
});

export default theme;