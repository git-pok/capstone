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
  // Request all recipes.
  const [ recipesData, setRecipesData ] = useAxios("pasta", {method: "get", url: "/recipes", data: {}, params: {}, headers});
  // Request dessert recipes.
  const [ dessertData ] = useAxios("dessert", dessertOptions);
  const topFourChickArr = chickenData !== null ? [{...chickenData[0]}, {...chickenData[1]}, {...chickenData[2]}, {...chickenData[3]}] : null;
  const topFourPastaArr = pastaData !== null ? [{...pastaData[0]}, {...pastaData[1]}, {...pastaData[2]}, {...pastaData[3]}] : null;
  const topFourDessertArr = dessertData !== null ? [{...dessertData[0]}, {...dessertData[1]}, {...dessertData[2]}, {...dessertData[3]}] : null;
  // console.log("topFourChickArr", topFourChickArr);
  // console.log("topFourPastaArr", topFourPastaArr);
  console.log("dessertData", dessertData);
  // FORM LOGIC
  // const initialState = {
  //   subCategory: "", name: "", author: "",
  //   rating: "", orderBy: "", orderBy2: "",
  //   chronOrder: ""
  // };
  // const [ formErrMsg, setFormErrMsg ] = useState(null);
  // const [ formData, setFormData ] = useState(initialState);
  // const [ formCmplt, setFormCmplt ] = useToggleState(false);
  // const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  // const [ invalidForm, setInvalidForm ] = useToggleState(false);

  // useEffect(() => {
  //   const filterRecipes = async () => {

  //     try {
  //       const { 
  //         subCategory, name, author, rating, orderBy,
  //         orderBy2, chronOrder
  //       } = formData;

  //       const recipesFltrParams = { subCategory, name, author, rating, orderBy, orderBy2, chronOrder };
  //       const recipesFltrOptions = {method: "get", url: "/recipes", data: {}, params: recipesFltrParams, headers};
  //       console.log("recipesFltrOptions", recipesFltrOptions);
  //       const regResult = await SavourApi.request(recipesFltrOptions);
  //       console.log("$#$#$#$#$#$#$#$#$#$#$$#$#$# FLTR regResult", regResult);

  //       setRecipesData(data => (
  //         regResult.data
  //       ));
  //       console.log("RegisterForm SUBMITTED!");
  //       // Set isSubmitted to false.
  //       setIsSubmitted();
  //       // console.log("formData", formData);
  //       setFormData(() => initialState);
  //       setFormCmplt();

  //     } catch (err) {
  //       console.log("ERROR", err);
  //       setFormErrMsg(() => "Error");
  //       setInvalidForm();
  //       setTimeout(setInvalidForm, 3000);
  //       // Set isSubmitted to false.
  //       setTimeout(setIsSubmitted, 3000);
  //     }
  //   }

  //   if (isSubmitted) filterRecipes();

  // }, [isSubmitted])

  // const handleChange = (evt) => {
  //   const { name, value } = evt.target;

  //   setFormData(data => ({
  //     ...data,
  //     [name]: value
  //   }))
  // }

  // const handleSubmit = async (evt) => {
  //   evt.preventDefault();
  //   // Set isSubmitted to true.
  //   setIsSubmitted();
  // }

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
      {/* Form */}
      {/* <div className="Recipes-filter">
        <form onSubmit={handleSubmit} className="Recipes-form">
          <div className="Recipes-form-field">
            <label htmlFor="subCategory">Sub Category</label>
            <input
              type="text"
              id="subCategory"
              onChange={handleChange}
              value={formData.subCategory}
              name="subCategory"
              placeholder="Type a sub category"
              autoComplete="subCategory"></input>
          </div>
          <div className="Recipes-form-field">
            <label htmlFor="phone">Recipe Name</label>
            <input
                type="text"
                id="name"
                onChange={handleChange}
                value={formData.name}
                name="name"
                placeholder="Type a recipe name"></input>
          </div>
          <div className="Recipes-form-field">
            <label htmlFor="author">Author</label>
            <input
                type="text"
                id="author"
                onChange={handleChange}
                value={formData.author}
                name="author"
                placeholder="Type a recipe author"></input>
          </div>
          <div className="Recipes-form-field">
            <label htmlFor="rating">Rating</label>
            <input
                type="number"
                id="rating"
                onChange={handleChange}
                value={formData.rating}
                name="rating"
                placeholder="Type a recipe rating"></input>
          </div>
          <div className="Recipes-form-submit">
            {
              invalidForm &&
              <Message msgObj={
                {
                  class: "fail",
                  msg: formErrMsg ? formErrMsg : "Error!"
                }
              } />
            }
            <button>SUBMIT</button>
          </div>
        </form>
      </div> */}
      <div className="Recipes-div">
        <h1>Click To Go To All Recipes Page</h1>
        {/* { recipesData && <RecipeContainer showHide={true} recipeArray={recipesData} /> } */}
      </div>
    </div>
    </>
  );
}

export default Recipes;