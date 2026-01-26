import {createTheme, Theme} from "@mui/material";
import '@fontsource/montserrat';

const ThemeColours = (mode: 'light' | 'dark'): Theme => {
    const theme = createTheme({
        typography: {
            fontFamily: `'Montserrat', sans-serif`,
        },
        palette: {
            mode,
            primary: {
                main: '#1976d2',
            },
            secondary: {
                main: '#ffffff',
            },
            background: {
                default: mode === 'light' ? '#fafafa' : '#131515',
                paper: mode === 'light' ? '#ffffff' : '#0A0B0B',
            },
            error: {
                main: "#d32f2f", // Material Design red for error
            },
            warning: {
                main: "#f57c00", // Material Design orange for warning
            },
            info: {
                main: "#1976d2", // Material Design blue for info
            },
            success: {
                main: "#388e3c", // Material Design green for success
            },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        '&::-webkit-scrollbar': {
                            width: '12px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: mode === 'light' ? 'rgba(136, 136, 136, 0.6)' : 'rgba(68, 68, 68, 0.6)',
                            borderRadius: '6px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: mode === 'light' ? 'rgba(85, 85, 85, 0.8)' : 'rgba(34, 34, 34, 0.8)',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: mode === 'light' ? 'rgba(241, 241, 241, 0.4)' : 'rgba(51, 51, 51, 0.6)',
                            borderRadius: '6px',
                        },
                    },
                },
            },
        },
    });

    if (theme.components?.MuiCssBaseline?.styleOverrides) {
        (theme.components.MuiCssBaseline.styleOverrides as any)['glass'] = {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.divider}`,

            [theme.breakpoints.down('sm')]: {
                backdropFilter: 'blur(5px)', // Reduce blur effect
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
            },
        }
    }

    // console.log(theme.breakpoints.values);
    return theme;
}

export default ThemeColours;