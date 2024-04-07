import ShowHideBtnAndText from '../ShowHideBtnAndText.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders ShowHideBtnAndText without crashing", () => {
  render(
    <ShowHideBtnAndText
      paragraphArr={
        [
          {
            text: "Test"
          }
        ]
    } />
  )
});

test("renders snapshot without crashing", () => {
  const { asFragment } = render(
    <ShowHideBtnAndText
      paragraphArr={
        [
          {
            text: "Test"
          }
        ]
    } />
  )

  expect(asFragment()).toMatchSnapshot();
});