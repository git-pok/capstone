import ContactPage from '../ContactPage.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders CenterText without crashing", () => {
  render(
  <MemoryRouter>
    <ContactPage />
  </MemoryRouter>);
});
