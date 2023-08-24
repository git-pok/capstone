// import { useState, useEffect } from 'react';
// import SavourApi from './models/SavourApi.js';
// import { Redirect } from 'react-router-dom';
// import Message from './Message.js';
// import SavourApi from './models/SavourApi.js';
import CenterText from './CenterText.js';
import Button from './Button.js';
import useLocalStorage from './hooks/useLocalStorage.js';
// import useToggleState from './hooks/useToggleState.js';
import image from './img/cut-board.jpg';
import './Home.css';

/**
 * Home
 * 
 * Props: none
*/
const Home = () => {

  const [ usrData, setUsrData ] = useLocalStorage("userData", null);
  // const [ formErrMsg, setFormErrMsg ] = useState(null);
  // const [ formData, setFormData ] = useState(initialState);
  // const [ formCmplt, setFormCmplt ] = useToggleState(false);
  // const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  // const [ invalidForm, setInvalidForm ] = useToggleState(false);
  // image styles.
  const styles = {
    backgroundImage: `url(${image})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat"
  }
  const pgh1 = `Savour is a recipe app that is built to
    give the user access to recipes and tools to support recipes.
    With savour, a user may search/like/dislike/try/save/share a recipe,
    create a custom version of a recipe, create a recipelist with
    recipes for an occasion, create a shoppinglist, and more. Savour
    has recipes for beginners and experts also.`;

  const pgh2 = `lunch, breakfast, sweet treats,
    dinner, storecupboard, desserts, cheese,
    fish and seafood, pasta, vegan, kids' baking, meat, chicken,
    savoury pastries, keto, low calorie, salads, vegan, baking,
    bread, cakes, quick bakes, biscuits,
    high protein, free from baking, breakfast, dinner, smoothies,
    fitness & lifestyle, lunch.`
  return (
    <>
    <div style={styles} className="Home-bg-img">
    <h1 className="Home-h1">Welcome to Savour – The recipe app</h1>
    <div className="Home-p">
      <h2 className="Home-subtitle">What is Savour</h2>
      <CenterText text={pgh1} color="black" fontSize={23} />
    </div>
    <div className="Home-p">
      <h2 className="Home-subtitle">Recipe Categories</h2>
      <CenterText text={pgh2} color="black" fontSize={23} />
    </div>
    <div className="Home-button">
      <Button buttonText="RECIPES" link="/recipes" />
      <Button buttonText="CONTACT" link="/contact" />
    </div>
    </div>
    </>
  );
}



export default Home;