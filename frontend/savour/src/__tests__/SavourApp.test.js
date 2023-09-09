import SavourApp from '../SavourApp.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders SavourApp without crashing", () => {
  render(<MemoryRouter><SavourApp /></MemoryRouter>);
});

test("renders snapshot without crashing", () => {
  const { asFragment } = render(
                            <MemoryRouter>
                              <SavourApp />
                            </MemoryRouter>
                          );

  expect(asFragment()).toMatchSnapshot();
});
