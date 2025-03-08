import {render, screen} from '@testing-library/react';
import Home from "./views/Home";

test('renders learn react link', () => {
    render(<Home/>);
    const linkElement = screen.getByText(/ProjectsIncluded/i);
    expect(linkElement).toBeInTheDocument();
});