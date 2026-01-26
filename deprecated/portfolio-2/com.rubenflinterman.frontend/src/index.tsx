import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {StyledEngineProvider} from "@mui/material/styles";
import {CssBaseline, ThemeProvider} from '@mui/material';
import ThemeColours from "./theme/AppTheme";

// Main component to toggle between light and dark mode
const Index: React.FC = () => {
    const [mode, setMode] = useState<'light' | 'dark'>(() => {
        const storedTheme = sessionStorage.getItem('theme'); // Change to sessionStorage if desired
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme as 'light' | 'dark';
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light';
    });

    return (
        <React.StrictMode>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={ThemeColours(mode)}>
                    <CssBaseline/>
                    <App mode={mode} setMode={setMode}/>
                </ThemeProvider>
            </StyledEngineProvider>
        </React.StrictMode>
    );
};

// Render the Index component into the root div in the HTML file
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<Index/>);

if (process.env.NODE_ENV === 'development') {
    reportWebVitals(console.log);
}

export default Index;
