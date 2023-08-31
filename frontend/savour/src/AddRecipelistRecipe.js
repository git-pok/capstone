import { useState, useEffect, useContext } from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import {
//           faStar,
//           faFloppyDisk,
//         } from '@fortawesome/free-solid-svg-icons';
import Message from './Message.js';
import SavourApi from './models/SavourApi.js';
// import useLocalStorage from './hooks/useLocalStorage.js';
import useToggleState from './hooks/useToggleState.js';
import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
// import RecipeContainer from './RecipeContainer.js';
// import image from './img/ambient-kitchen.jpg';
import './AddRecipelistRecipe.css';

/**
 * AddRecipelistRecipe
 * Recipe Details Component
 * Props: none
*/
const AddRecipelistRecipe = ({ setState }) => {
  const { id } = useParams();
  const { usrData, setUsrData } = useContext(UserContext);

  const headers = { _token: `Bearer ${usrData.token}`};

  const recipeOpts = { method: "get", url: `/recipes`, data: {}, params: {}, headers };
  const [ recipeData ] = useAxios(recipeOpts);
  const recpListUrl = `/users/${usrData.userId}/recipelists`;
  const recpLstOpts = {method: "get", url: recpListUrl, data: {}, params: {}, headers};
  const [ recipelists, setRecipelists ] = useAxios(recpLstOpts);

  const OccOpts = {method: "get", url: `/occasions`, data: {}, params: {}, headers};
  const [ occasionData ] = useAxios(OccOpts);
  const [ isAddRecpBtn, setIsAddRecpBtn ] = useToggleState(false);
  const [ formErrMsg, setFormErrMsg ] = useState(null);
  const [ succMsg, setSuccMsg ] = useState(null);
  const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  const [ invalidForm, setInvalidForm ] = useToggleState(false);

  const initialState = {
    recipeId: "", recipelistId: ""
  };

  const [ formData, setFormData ] = useState(initialState);
  const [ formReqMade, setFormReqMade ] = useToggleState(false);
  const [ reqMadeSucc, setReqMadeSucc ] = useToggleState(false);

  const addRecipe = async () => {
    const listId = formData.recipelistId;
    if (listId === "") {
      setFormErrMsg(() => "Select a list to add recipe to!");
      setInvalidForm();
      setFormReqMade();
      setTimeout(setFormReqMade, 3000);
      setTimeout(setInvalidForm, 3000);
      setTimeout(() => setFormErrMsg(null), 3000);
    } else {
      setIsSubmitted();
    }
  }

  useEffect(() => {
    const addRecipelistRecipe = async () => {
      try {
        const url = `/users/${usrData.userId}/recipelists/${formData.recipelistId}`;
        const data = { recipe_id: +formData.recipeId };
        const req = await SavourApi.request("post", url, data, {}, headers);
        setSuccMsg(() => "Added Recipe!");
        setFormReqMade();
        setReqMadeSucc();
        setState(() => ({ msg: "Added to list!" }));
        setTimeout(setFormReqMade, 3000);
        setTimeout(setReqMadeSucc, 3000);
        setTimeout(setIsSubmitted, 3000);
        setTimeout(() => setSuccMsg(null), 3000);
        setTimeout(() => setFormData(initialState), 3000);
      } catch(err) {
        const errorCode = err.response.data.error.message.code;
        const error = err.response.data.error.message;
        const isErrObj = typeof err === "object";
        const isErrorObj = typeof error === "object";
        const errMsg = isErrObj ? "Error!" : err;
        const errorMsg = isErrorObj ? "Error!" : error;
        const duplicateErr = errorCode === "23505" ? "Already added recipe!" : null;

        setFormErrMsg(() => duplicateErr || errMsg || errorMsg);
        setInvalidForm();
        setFormReqMade();
        setTimeout(setInvalidForm, 3000);
        setTimeout(setFormReqMade, 3000);
        setTimeout(setIsSubmitted, 3000);
        setTimeout(() => setFormData(initialState), 3000);
      }
    }

    if (isSubmitted) addRecipelistRecipe();
  }, [isSubmitted]);

  const handleChange = (evt) => {
    const { name, value } = evt.target;

    setFormData(data => ({
      ...data,
      [name]: value
    }))
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault();
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="AddRecipelistRecipe-form">
      <div className="AddRecipelistRecipe-form-field">
        <label htmlFor="reclistRecAdd">Recipelists</label>
          <select
            id="reclistRecAdd"
            name="recipelistId"
            onChange={handleChange}
            value={formData.recipelistId}>
            <option key="recipelistId" value="">Select a Recipelist</option>
              { recipelists &&
                recipelists.map(recipelist => (
                  <option key={`${recipelist.id}`} value={`${recipelist.id}`}>{recipelist.list_name}</option>
                ))
              }
          </select>
      </div>
      <div className="AddRecipelistRecipe-form-field">
        <label htmlFor="reclistRecAdd">Recipes</label>
        <select
          id="recipeId"
          name="recipeId"
          onChange={handleChange}
          value={formData.recipeId}>
        <option key="recipeId" value="">Select a Recipe</option>
          { recipeData && recipeData.length &&
            recipeData.map(recipe => (
              <option key={`${recipe.id}`} value={`${recipe.id}`}>{recipe.name}</option>
            ))
          }
        </select>
      </div>
      <div className="AddRecipelistRecipe-form-submit">
        <div className="AddRecipelistRecipe-msg-div">
        { formReqMade &&
          <Message msgObj={
            {
              class: reqMadeSucc ? "success" : "fail",
              msg: reqMadeSucc ? succMsg : formErrMsg
            }
          } />
        }
        </div>
        <button
          onClick={
            () => addRecipe()
          }>ADD TO LIST</button>
      </div>
    </form>
    </>
  );
}

export default AddRecipelistRecipe;