import useToggleState from './hooks/useToggleState.js';
import './ShowHideBtnAndText.css';

/**
 * ShowHideBtnAndText
 * Props: paragraphArr
 * Renders: div with button and paragraphs
 *    that shows/hides on click.
*/
const ShowHideBtnAndText = ({paragraphArr}) => {
  const [ isClicked, setIsClicked ] = useToggleState(false);
  const click = () => {
    setIsClicked();
  }
  return (
    <>
    <button className="ShowHideBtnAndText-button" onClick={click}>SEE MORE</button>
      {
        paragraphArr && paragraphArr.map((val, idx) => (
          isClicked && <p key={idx} className="ShowHideBtnAndText-p">{val.text}</p>
        ))
      }
    </>
  );
}

export default ShowHideBtnAndText;