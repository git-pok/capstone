import { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import Message from './Message.js';
import SavourApi from './models/SavourApi.js';
import useLocalStorage from './hooks/useLocalStorage.js';
import useToggleState from './hooks/useToggleState.js';
import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
import RecipeContext from './context/RecipeContext.js';
import RecipeContainer from './RecipeContainer.js';
import RecipeFilter from './RecipeFilter.js';
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
  const chickenParams = { subCategory: "chicken", rating: 5 };
  const pastaParams = { subCategory: "pasta", rating: 5, orderBy: "name" };
  const dessertParams = { subCategory: "dessert", rating: 5, orderBy: "name" };
  const headers = { _token: `Bearer ${usrData.token}`};
  // Chicken req obj.
  const chickenOptions = {method: "get", url: "/recipes", data: {}, params: chickenParams, headers};
  // Pasta req obj.
  const pastaOptions = {method: "get", url: "/recipes", data: {}, params: pastaParams, headers};
  // Dessert req obj.
  const dessertOptions = {method: "get", url: "/recipes", data: {}, params: dessertParams, headers};
  // Request chicken recipes.
  const [ chickenData ] = useAxios("chicken", chickenOptions);
  // Request pasta recipes.
  const [ pastaData ] = useAxios("pasta", pastaOptions);
  // Request dessert recipes.
  const [ dessertData ] = useAxios("dessert", dessertOptions);
  // Request all recipes.
  const [ recipesData, setRecipesData ] = useAxios("all recipes", {method: "get", url: "/recipes", data: {}, params: {}, headers});
  // const [ recipesData, setRecipesData ] = useState(null);
  const topFourChickArr = chickenData !== null ? [{...chickenData[0]}, {...chickenData[1]}, {...chickenData[2]}, {...chickenData[3]}] : null;
  const topFourPastaArr = pastaData !== null ? [{...pastaData[0]}, {...pastaData[1]}, {...pastaData[2]}, {...pastaData[3]}] : null;
  const topFourDessertArr = dessertData !== null ? [{...dessertData[0]}, {...dessertData[1]}, {...dessertData[2]}, {...dessertData[3]}] : null;
  // console.log("topFourChickArr", topFourChickArr);
  // console.log("topFourPastaArr", topFourPastaArr);
  // console.log("dessertData", dessertData);
  // useEffect(() => {
  //   const getAllRecipes = async () => {
  //     const req = await SavourApi.request("get", "/recipes", {}, {}, headers);
  //     setRecipesData(() => req.data);
  //   }
  //   getAllRecipes();
  // }, []);

  return (
    <>
    <h1 className="Recipes-h1">Top Chicken Recipes</h1>
    <div className="Recipes">
      <div className="Recipes-div">
        { topFourChickArr && <RecipeContainer showHide={true} recipeArray={topFourChickArr} /> }
      </div>
      <h1 className="Recipes-h1">Top Pasta Recipes</h1>
      <div className="Recipes-div">
        { topFourPastaArr && <RecipeContainer showHide={true} recipeArray={topFourPastaArr} /> }
      </div>
      <h1 className="Recipes-h1">Top Dessert Recipes</h1>
      <div className="Recipes-div">
        { topFourDessertArr && <RecipeContainer showHide={true} recipeArray={topFourDessertArr} /> }
      </div>
      <h1 className="Recipes-h1">ALL Recipes</h1>
      {/* <h1>Click To Go To All Recipes Page</h1> */}
      <div className="Recipes-div">
        <RecipeFilter setState={setRecipesData} />
        { recipesData && <RecipeContainer showHide={true} recipeArray={recipesData} /> }
      </div>
    </div>
    </>
  );
}

export default Recipes;