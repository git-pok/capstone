import RecipeFilter from '../RecipeFilter.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserContext from '../context/UserContext.js';


const usrData = {
  userUsername: "fvin",
  userId: 12
};

const setState = () => {
  console.log("Test!");
};


test("renders RecipeFilter without crashing", () => {
  render(
    <UserContext.Provider value={{usrData}}>
      <RecipeFilter setState={setState} />
    </UserContext.Provider>
  )
});

test("renders snapshot without crashing", () => {
  const { asFragment } = render(
    <UserContext.Provider value={{usrData}}>
      <RecipeFilter setState={setState} />
    </UserContext.Provider>
  );

  expect(asFragment()).toMatchSnapshot();
});