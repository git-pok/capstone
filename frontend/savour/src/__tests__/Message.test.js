import Message from '../Message.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders Message without crashing", () => {
  render(
    <Message
      msgObj={
        {
          msg: "Test!",
          class: "success"
        }
      } />
  )
});

test("renders snapshot without crashing", () => {
  const { asFragment } = render(
      <Message
        msgObj={
          {
            msg: "Test!",
            class: "success"
          }
      } />
  );

  expect(asFragment()).toMatchSnapshot();
});
