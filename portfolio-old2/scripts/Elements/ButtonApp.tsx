import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Button from '@mui/material/Button';

const App = () => {
    return (
        <Button variant="contained" onClick={() => alert('Button clicked!')}>
            Hello World
        </Button>
    );
};

// Render the App directly to the desired DOM element
const rootElement = document.getElementById('button-root');
if (rootElement) {
    ReactDOM.render(<App />, rootElement);
}
