import { render } from '@testing-library/react';
import SavourApp from '../SavourApp.js';

test('renders SavourApp without crashing', () => {
  render(<SavourApp />);
});
