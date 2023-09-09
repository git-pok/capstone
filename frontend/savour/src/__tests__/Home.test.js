import Home from '../Home.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders Home without crashing", () => {
  render(
  <MemoryRouter>
    <Home />
  </MemoryRouter>);
});
