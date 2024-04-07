import Recipes from '../Recipes.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserContext from '../context/UserContext.js';


const usrData = {
  userUsername: "fvin",
  userId: 12
};


test("renders Recipes without crashing", () => {
  render(
      <UserContext.Provider value={{usrData}}>
        <Recipes />
      </UserContext.Provider>
  )
});

test("renders snapshot without crashing", () => {
  const { asFragment } = render(
    <UserContext.Provider value={{usrData}}>
      <Recipes />
    </UserContext.Provider>
  );

  expect(asFragment()).toMatchSnapshot();
});