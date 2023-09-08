import { render } from '@testing-library/react';
import RegisterForm from '../RegisterForm.js';

test('renders RegisterForm without crashing', () => {
  render(<RegisterForm />);
});
