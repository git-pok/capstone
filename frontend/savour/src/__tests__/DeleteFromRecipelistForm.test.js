import DeleteFromRecipelistForm from '../DeleteFromRecipelistForm.js';
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


test("renders DeleteFromRecipelistForm without crashing", () => {
  render(
      <UserContext.Provider value={{usrData}}>
        <DeleteFromRecipelistForm
          recipelistId={12}
          setState={setState}
          list={
            { recipes:
              [
                {id: 12, name: "Test"}
              ]
            }
          } />
      </UserContext.Provider>
  )
});

test("renders snapshot without crashing", () => {
  const { asFragment } = render(
      <UserContext.Provider value={{usrData}}>
        <DeleteFromRecipelistForm
          recipelistId={12}
          setState={setState}
          list={
            { recipes:
              [
                {id: 12, name: "Test"}
              ]
            }
          } />
      </UserContext.Provider>
  );

  expect(asFragment()).toMatchSnapshot();
});