import App from '../App.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders App without crashing", () => {
  render(<MemoryRouter><App /></MemoryRouter>);
});
