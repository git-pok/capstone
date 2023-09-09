import SavourApp from '../SavourApp.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders SavourApp without crashing", () => {
  render(<MemoryRouter><SavourApp /></MemoryRouter>);
});
