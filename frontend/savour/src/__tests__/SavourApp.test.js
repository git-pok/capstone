import SavourApp from '../SavourApp.js';
import { render, fireEvent } from '@testing-library/react';
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

test("login form submission", async () => {
  const { findByText, getByText, getByTestId, queryByLabelText } = render(
        <MemoryRouter intitialEntries={["/login"]}>
          <SavourApp />
        </MemoryRouter>
  );

  const loginBtn = getByText("LOG IN");
  fireEvent.click(loginBtn);
  const submitBtn = getByTestId("sbmtBtn");
  const signInUsrname = queryByLabelText("Username");
  const signInPassword = queryByLabelText("Password");
  fireEvent.change(signInUsrname, { target: { value: "drisqol" } });
  fireEvent.change(signInPassword, { target: { value: "password" } });
  fireEvent.click(submitBtn);
  const homeBtn = await findByText("SAVOUR");
  fireEvent.click(homeBtn);
  const welcome = await findByText("Welcome to Savour – The recipe app");
  expect(welcome).toBeInTheDocument();
});