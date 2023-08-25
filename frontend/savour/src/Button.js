import { Link } from 'react-router-dom';
import './Button.css';

/**
 * Button
 * Creates button
 * Props: buttonText, link
*/
const Button = ({ buttonText, link }) => {
  return (
    <div className="Button">
      <Link exact="true" to={link}>
        <button className="Button-button">{buttonText}</button>
      </Link>
    </div>
  );
}

export default Button;