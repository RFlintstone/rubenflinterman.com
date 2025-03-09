import {render, screen} from '@testing-library/react';
import Home from "./views/Home";

test('renders learn react link', () => {
    render(<Home/>);
    const linkElement = screen.getByText(/Software engineer by day, creative by night./i);
    expect(linkElement).toBeInTheDocument();
});
