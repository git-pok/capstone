import PageNotFound from '../PageNotFound.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders PageNotFound without crashing", () => {
  render(
      <PageNotFound />
  )
});

test("renders snapshot without crashing", () => {
  const { asFragment } = render(
      <PageNotFound />
  );

  expect(asFragment()).toMatchSnapshot();
});
