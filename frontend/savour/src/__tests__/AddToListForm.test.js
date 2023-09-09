import AddToListForm from '../AddToListForm.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserContext from '../context/UserContext.js';

const usrData = {
  userUsername: "fvin",
  userId: 12
};

test("renders AddToListForm without crashing", () => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={{usrData}}>
        <AddToListForm />
      </UserContext.Provider>
    </MemoryRouter>
  );
});

test("renders snapshot without crashing", () => {
  const { asFragment } = render(
                          <MemoryRouter>
                            <UserContext.Provider value={{usrData}}>
                              <AddToListForm />
                            </UserContext.Provider>
                          </MemoryRouter>
                        );
  expect(asFragment()).toMatchSnapshot();
});