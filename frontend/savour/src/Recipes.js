import { useState, useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import Message from './Message.js';
import SavourApi from './models/SavourApi.js';
import useLocalStorage from './hooks/useLocalStorage.js';
import useToggleState from './hooks/useToggleState.js';
import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
import image from './img/ambient-kitchen.jpg';
import './Recipes.css';

/**
 * Recipes
 * Recipes Component
 * Props: none
*/
const Recipes = () => {

  // const [ recipeData, setRecipeData ] = useAxios(null);
  const { usrData, setUsrData } = useContext(UserContext);
  // const [ formErrMsg, setFormErrMsg ] = useState(null);
  // const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  // const [ invalidForm, setInvalidForm ] = useToggleState(false);

  // useEffect(() => {
  //   const getRecipes = async () => {

  //     try {
  //       console.log("usrData", usrData);
  //       const headers = { _token: `Bearer ${usrData.token}`}
        // const regResult = await SavourApi.request("post", "/users/register", {}, {}, headers);
        // const options = {method: "get", url: "/recipes", data: {}, params: {}, headers}
        // const regResult = setRecipeData("/recipes", options);
        // console.log("regResult", regResult);
        

        // setUsrData(data => (
        //   payload
        // ));
        // console.log("RegisterForm SUBMITTED!");
        // Set isSubmitted to false.
        // setIsSubmitted();
        // console.log("formData", formData);
        // setFormData(() => initialState);
        // setFormCmplt();

      // } catch (err) {
      //   console.log("ERROR", err);
        // setFormErrMsg(() => "Error");
        // setInvalidForm();
        // setTimeout(setInvalidForm, 3000);
        // // Set isSubmitted to false.
        // setTimeout(setIsSubmitted, 3000);
    //   }
    // }

  //   getRecipes();

  // }, [])


  // if (formCmplt) return <Redirect exact to="/" />;
  // image styles.
  const styles = {
    backgroundImage: `url(${image})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat"
  }
  return (
    <>
    <h1>RECIPES</h1>
    </>
  );
}

export default Recipes;