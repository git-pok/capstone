import useToggleState from './hooks/useToggleState.js';
import './ShowHideBtnAndText.css';

/**
 * ShowHideBtnAndText
 * Creates div with button and paragraphs.
 * Props: paragraphArr
*/
const ShowHideBtnAndText = ({paragraphArr}) => {
  const [ isClicked, setIsClicked ] = useToggleState(false);
  const click = () => {
    setIsClicked();
  }
  return (
    <>
    <button onClick={click}>SEE MORE</button>
      {
        paragraphArr && paragraphArr.map((val, idx) => (
          isClicked && <p key={idx} className="ShowHideBtnAndText-p">{val.text}</p>
        ))
      }
    </>
  );
}

export default ShowHideBtnAndText;