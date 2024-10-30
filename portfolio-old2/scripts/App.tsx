import * as React from 'react';
import * as ReactDOM from 'react-dom/client'; // Use this for React 18+
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import { useMediaQuery } from '@mui/material';

// Main App Component with Routing
const App = () => {
    // Use the media query to detect the user's color scheme preference
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    // Create a theme based on the user's preference
    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? 'dark' : 'light', // Dynamically set theme mode
                },
            }),
        [prefersDarkMode]
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Helps with consistent baseline styles */}
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/button" element={<ButtonPage />} />
                </Routes>
                <div>prefersDarkMode: {prefersDarkMode.toString()}</div>
            </Router>
        </ThemeProvider>
    );
};

// Home Component
const Home = () => (
    <div>
        <h1>Welcome to My Page</h1>
        <p>
            This is the home page. Click the button below to go to the Button page.
        </p>
        <Link to="/button">
            <Button variant="contained">Go to Button Page</Button>
        </Link>
    </div>
);

// Button Component
const ButtonPage = () => (
    <div>
        <h1>Button Page</h1>
        <Button variant="contained" onClick={() => alert('Button clicked!')}>
            Hello World
        </Button>
        <Link to="/">
            <Button variant="contained">Go back to Home</Button>
        </Link>
    </div>
);

// Render the App into the DOM
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}
