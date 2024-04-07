import ContactPage from '../ContactPage.js';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

test("renders ContactPage without crashing", () => {
  render(
    <ContactPage />
  )
});

test("renders snapshot without crashing", () => {
  const { asFragment } = render(
    <ContactPage />
  );

  expect(asFragment()).toMatchSnapshot();
});
