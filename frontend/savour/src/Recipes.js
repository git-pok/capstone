import { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import Message from './Message.js';
import SavourApi from './models/SavourApi.js';
import useLocalStorage from './hooks/useLocalStorage.js';
import useToggleState from './hooks/useToggleState.js';
import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
import RecipeContainer from './RecipeContainer.js';
// import ShowHideText from './ShowHideText.js';
import image from './img/ambient-kitchen.jpg';
import './Recipes.css';

/**
 * Recipes
 * Recipes Component
 * Props: none
*/
const Recipes = () => {
  const { usrData, setUsrData } = useContext(UserContext);
  const params = { subCategory: "chicken", rating: 5 };
  const headers = { _token: `Bearer ${usrData.token}`};
  const options = {method: "get", url: "/recipes", data: {}, params, headers}
  const [ recipeData ] = useAxios("recipes", options);
  // const [ recipeData, setRecipeData] = useState(null);
  // console.log("recipeData", recipeData !== null ? recipeData[0] : recipeData);
  const topFourArr = recipeData !== null ? [recipeData[0], recipeData[1], recipeData[2], recipeData[3]] : null;
  console.log("topFourArr", topFourArr);
  // const topFive = recipeData !== null ? topFourArr.map((recipe, idx) => {
  //   return recipe;
  // }) : null
  // console.log("topFive", topFive);

  // const [ formErrMsg, setFormErrMsg ] = useState(null);
  // const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  // const [ invalidForm, setInvalidForm ] = useToggleState(false);

  // image styles.
  // const styles = {
  //   backgroundImage: `url(${image})`,
  //   backgroundSize: "cover",
  //   backgroundRepeat: "no-repeat"
  // }
  return (
    <>
    <h1 className="Recipes-h1">Top Chicken Recipes</h1>
    <div className="Recipes">
      <RecipeContainer showHide={true} recipeArray={topFourArr} />
    </div>
    </>
  );
}

export default Recipes;