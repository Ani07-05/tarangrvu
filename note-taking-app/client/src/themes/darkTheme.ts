// note-taking-app/client/src/themes/darkTheme.ts
import { createTheme } from "@mui/material/styles"

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0070f3",
    },
    background: {
      default: "#000",
      paper: "#111",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 12,
        },
      },
    },
  },
})

export default darkTheme

