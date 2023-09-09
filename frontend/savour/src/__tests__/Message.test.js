import Message from '../Message.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders Message without crashing", () => {
  render(
  <MemoryRouter>
    <Message
      msgObj={
        {
          msg: "Test!",
          class: "success"
        }
      } />
  </MemoryRouter>);
});
