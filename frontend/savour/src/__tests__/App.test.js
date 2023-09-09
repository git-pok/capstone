import App from '../App.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders App without crashing", () => {
  render(<MemoryRouter><App /></MemoryRouter>);
});

test("renders snapshot without crashing", () => {
  const { asFragment } = render(<MemoryRouter><App /></MemoryRouter>);
  expect(asFragment()).toMatchSnapshot();
});

test("logged out home page text has SAVOUR", () => {
  const { getByText } = render(
                                  <MemoryRouter
                                    intitialEntries={["/"]}>
                                    <App />
                                  </MemoryRouter>
                                );

  expect(getByText("SAVOUR")).toBeInTheDocument();
});