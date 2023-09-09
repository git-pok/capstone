import Buttton from '../Button.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders Buttton without crashing", () => {
  render(
  <MemoryRouter>
    <Buttton
      buttonText="HOME"
      link="/home" />
  </MemoryRouter>);
});
