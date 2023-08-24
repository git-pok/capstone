import './CenterText.css';

/**
 * CenterText
 * Creates paragraphs
 * Props: text, color, fontSize
*/
const CenterText = ({ text, color, fontSize }) => {
  const styles = {
    color,
    fontSize
  }
  return (
    <p style={styles}>{text}</p>
  );
}

export default CenterText;