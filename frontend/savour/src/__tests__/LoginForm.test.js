import LoginForm from '../LoginForm.js';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserContext from '../context/UserContext.js';


const usrData = {
  userUsername: "fvin",
  userId: 12
};


test("renders LoginForm without crashing", () => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={{usrData}}>
        <LoginForm />
      </UserContext.Provider>
    </MemoryRouter>
  );
});

test("renders snapshot without crashing", () => {
  const { asFragment } = render(
                            <MemoryRouter>
                              <UserContext.Provider value={{usrData}}>
                                <LoginForm />
                              </UserContext.Provider>
                            </MemoryRouter>
                          );

  expect(asFragment()).toMatchSnapshot();
});

test("login form has inputs", () => {
  const { queryByLabelText } = render(
                                  <MemoryRouter intitialEntries={["/login"]}>
                                    <UserContext.Provider value={{usrData}}>
                                      <LoginForm />
                                    </UserContext.Provider>
                                  </MemoryRouter>
                                );

  const signInUsrname = queryByLabelText("Username");
  const signInPassword = queryByLabelText("Password");
  expect(signInUsrname).toBeInTheDocument();
  expect(signInPassword).toBeInTheDocument();
});

test("login form submission", () => {
  const { getByText, queryByText, queryByLabelText } = render(
                                  <MemoryRouter intitialEntries={["/login"]}>
                                    <UserContext.Provider value={{usrData}}>
                                      <LoginForm />
                                    </UserContext.Provider>
                                  </MemoryRouter>
                                );

  const signInUsrname = queryByLabelText("Username");
  const signInPassword = queryByLabelText("Password");
  const submit = getByText("SUBMIT");
  fireEvent.change(signInUsrname, {target: { value: 'drisqol' }});
  fireEvent.change(signInPassword, {target: { value: 'password' }});
  // fireEvent.click(submit);
  // expect(getByText("WELCOME")).toBeInTheDocument();
});