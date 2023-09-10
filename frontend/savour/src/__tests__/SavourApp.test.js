import SavourApp from '../SavourApp.js';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

afterAll(() => {
  const { getByText } = render(
    <MemoryRouter intitialEntries={["/"]}>
      <SavourApp />
    </MemoryRouter>
  );
  const logoutBtn = getByText("LOG OUT");
  fireEvent.click(logoutBtn);
});

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
        <MemoryRouter>
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
  // const homeBtn = await findByText("SAVOUR");
  // fireEvent.click(homeBtn);
  const welcome = await findByText("Welcome to Savour – The recipe app");
  expect(welcome).toBeInTheDocument();
});

test("home page to shoppinglists page", async () => {
  const { debug, findByText, getByText } = render(
                                  <MemoryRouter intitialEntries={["/"]}>
                                    <SavourApp />
                                  </MemoryRouter>
                                );

  const welcome = getByText("Welcome to Savour – The recipe app");
  expect(welcome).toBeInTheDocument();
  const shplistsBtn = getByText("SHOPLISTS");
  fireEvent.click(shplistsBtn);
  const shplistsText = await findByText("drisqol's Shoppinglists");
  expect(shplistsText).toBeInTheDocument();
});

test("profile page to contact page", async () => {
  const { debug, findByText, getByText } = render(
                                  <MemoryRouter intitialEntries={["/"]}>
                                    <SavourApp />
                                  </MemoryRouter>
                                );

  const welcome = getByText("Welcome to Savour – The recipe app");
  expect(welcome).toBeInTheDocument();
  const profileBtn = getByText("PROFILE");
  fireEvent.click(profileBtn);
  const profileText = await findByText("drisqol Details");
  expect(profileText).toBeInTheDocument();
  const contactBtn = getByText("CONTACT");
  fireEvent.click(contactBtn);
  const contactText = await findByText("App Creator and Developer Information");
  expect(contactText).toBeInTheDocument();
});