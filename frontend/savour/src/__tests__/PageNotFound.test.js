import PageNotFound from '../PageNotFound.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders PageNotFound without crashing", () => {
  render(
  <MemoryRouter>
    <PageNotFound />
  </MemoryRouter>);
});
