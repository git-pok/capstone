import Profile from '../Profile.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserContext from '../context/UserContext.js';


const usrData = {
  userUsername: "fvin",
  userId: 12
};


test("renders Profile without crashing", () => {
  render(
      <UserContext.Provider value={{usrData}}>
        <Profile />
      </UserContext.Provider>
  )
});

test("renders snapshot without crashing", () => {
  const { asFragment } = render(
      <UserContext.Provider value={{usrData}}>
        <Profile />
      </UserContext.Provider>
  );

  expect(asFragment()).toMatchSnapshot();
});