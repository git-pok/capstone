import ShowHideBtnAndText from '../ShowHideBtnAndText.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders ShowHideBtnAndText without crashing", () => {
  render(
  <MemoryRouter>
    <ShowHideBtnAndText
      paragraphArr={
        [
          {
            text: "Test"
          }
        ]
    } />
  </MemoryRouter>);
});
