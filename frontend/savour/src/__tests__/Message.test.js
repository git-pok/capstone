import { render } from '@testing-library/react';
import Message from '../Message.js';

test('renders App without crashing', () => {
  render(<Message msgObj={
    {
      class: "success",
      msg: "Hello!"
    }
  } />);
});
