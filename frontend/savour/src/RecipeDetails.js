import { useState, useEffect, useContext } from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
          faStar,
          faFloppyDisk,
        } from '@fortawesome/free-solid-svg-icons'
import Message from './Message.js';
import SavourApi from './models/SavourApi.js';
// import useLocalStorage from './hooks/useLocalStorage.js';
import useToggleState from './hooks/useToggleState.js';
import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
// import RecipeContainer from './RecipeContainer.js';
// import image from './img/ambient-kitchen.jpg';
import './RecipeDetails.css';

/**
 * RecipeDetails
 * Recipe Details Component
 * Props: none
*/
const RecipeDetails = () => {
  const { id } = useParams();
  const { usrData, setUsrData } = useContext(UserContext);
  // Create request header.
  const headers = { _token: `Bearer ${usrData.token}`};
  // Recipe options and request data.
  const options = {method: "get", url: `/recipes/${id}`, data: {}, params: {}, headers};
  const [ recipeData ] = useAxios(options);
  const recipeId = recipeData ? recipeData[0].id : null;
  // Boolean to see if clicked button is fav or sav.
  const [ isFavButton, setIsFavButton ] = useState(false);
  const [ recipeDtlsId, setRecipeDtlsId ] = useState(null);
  const [ occId, setOccId ] = useState(null);
  // Shoplists options and request data.
  const shopListUrl = `/users/${usrData.userId}/shoppinglists`;
  const shopLstOpts = {method: "get", url: shopListUrl, data: {}, params: {}, headers};
  const [ shoplists, setShoplists ] = useAxios(shopLstOpts);
  const usrHasShopList = shoplists && recipeData ? shoplists.some(list => list.recipe_id === recipeData[0].id) : null;
  // Recipelists options and request data.
  const recpListUrl = `/users/${usrData.userId}/recipelists`;
  const recpLstOpts = {method: "get", url: recpListUrl, data: {}, params: {}, headers};
  const [ recipelists, setRecipelists ] = useAxios(recpLstOpts);
  // Recipelists occasions options and request data.
  const OccOpts = {method: "get", url: `/occasions`, data: {}, params: {}, headers};
  const [ occasionData ] = useAxios(OccOpts);
  const [ isCreateListButton, setIsCreateListButton ] = useToggleState(false);
  const [ isShopList, setIsShopList ] = useToggleState(false);
  const [ lstName, setLstName ] = useState(null);
  const [ isAddRecpBtn, setIsAddRecpBtn ] = useToggleState(false);

  const isReveiws = recipeData ? recipeData[0].reviews.length > 0 : null;
  const [ favSavSucc, setFavSavSucc ] = useToggleState(false);
  const [ favdOrSavd, setFavdOrSavd ] = useToggleState(false);
  const [ formErrMsg, setFormErrMsg ] = useState(null);
  const [ succMsg, setSuccMsg ] = useState(null);
  const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  const [ invalidForm, setInvalidForm ] = useToggleState(false);
  /**
   * FORM LOGIC
  */
  const initialState = {
    listName: "", recipelistName: "",
    occasionId: "", recipelistId: ""
  };

  const [ formData, setFormData ] = useState(initialState);
  const [ formReqMade, setFormReqMade ] = useToggleState(false);
  const [ reqMadeSucc, setReqMadeSucc ] = useToggleState(false);
  /**
   * END OF FORM LOGIC
  */
  const savOrFavRecipe = async (recipeId, fav = true) => {
    setIsFavButton(fav);
    setRecipeDtlsId(recipeId);
    // Set isSubmitted to true.
    setIsSubmitted();
  }

  const addShopOrRecipe = async (recipeId, lstName, shop = true) => {
    const isOccId = formData.occasionId !== "";
    if ((lstName === "") || (!shop && lstName !== "" && !isOccId)) {
      if (shop) setIsShopList();
      const msg = !shop && !isOccId ? "Select an occasion!" : "Type a list name!";
      setFormErrMsg(() => msg);
      setInvalidForm();
      setFormReqMade();
      setTimeout(setFormReqMade, 3000);
      setTimeout(setInvalidForm, 3000);
      setTimeout(() => setFormErrMsg(null), 3000);
      if (shop) setTimeout(setIsShopList, 3000);
    } else {
      setRecipeDtlsId(recipeId);
      const sbmtdListName = shop ? formData.listName : formData.recipelistName;
      setLstName(() => sbmtdListName);
      // Set isCreateListButton to true.
      setIsCreateListButton();
      if (shop) setIsShopList();
      if (!shop) setOccId(() => +formData.occasionId);
    }
  }

  const addRecipe = async (recipeId) => {
    const listId = formData.recipelistId;
    if (listId === "") {
      setFormErrMsg(() => "Select a list to add recipe to!");
      setInvalidForm();
      setFormReqMade();
      setTimeout(setFormReqMade, 3000);
      setTimeout(setInvalidForm, 3000);
      setTimeout(() => setFormErrMsg(null), 3000);
    } else {
      setRecipeDtlsId(recipeId);
      setIsAddRecpBtn();
    }
  }

  useEffect(() => {
    const favOrSav = async () => {
      try {
        const endPt = isFavButton ? "favorite-recipes" : "saved-recipes";
        const favSavUrl = `/users/${usrData.userId}/${endPt}`;
        const favSavReq = await SavourApi.request("get", favSavUrl, {}, {}, headers);
        const favSavReqIds = favSavReq.data.map(recipe => recipe.id);
        const favSavReqHasRecId = favSavReqIds.includes(recipeDtlsId);
        const favSavReReqUrl = favSavReqHasRecId ? `${favSavUrl}/${recipeDtlsId}` : favSavUrl;
        const dataObj = favSavReqHasRecId ? {} : { recipe_id: recipeDtlsId };
        const favSavReqMethod =  favSavReqHasRecId ? "delete" : "post";
        const req = await SavourApi.request(favSavReqMethod, favSavReReqUrl, dataObj, {}, headers);
        const favMsg = isFavButton && favSavReqMethod === "delete"
            ? "Removed recipe from favorites!" : "Added recipe to favorites!";
        const savMsg = !isFavButton && favSavReqMethod === "delete"
            ? "Removed recipe from saved recipes!" : "Added recipe to saved recipes!";
        const msg = isFavButton ? favMsg : savMsg;
        setSuccMsg(() => msg);
        // Set isSubmitted to false.
        setIsSubmitted();
        // Set liked or disliked state to true.
        setFavdOrSavd();
        // Set liked or disliked success state to true.
        setFavSavSucc();
        // Set liked or disliked state to false.
        setTimeout(setFavdOrSavd, 3000);
        // Set liked or disliked success state to false.
        setTimeout(setFavSavSucc, 3000);
        setRecipeDtlsId(null);
        setTimeout(() => setIsFavButton(false), 3000);
        setTimeout(() => setSuccMsg(null), 3000);
      } catch(err) {
        // Set liked or disliked state to true.
        setFavdOrSavd();
        const error = err.response.data.error.message;
        setFormErrMsg(() => error || "Error");
        setInvalidForm();
        setTimeout(setInvalidForm, 3000);
        // Set isSubmitted to false.
        setTimeout(setIsSubmitted, 3000);
        // Set liked or disliked state to false.
        setTimeout(setFavdOrSavd, 3000);
        setRecipeDtlsId(null);
        setTimeout(() => setFormErrMsg(null), 3000);
      }
    }

    const shopOrRecipeList = async () => {
      try {
        const endPt = isShopList ? "shoppinglists" : "recipelists";
        const url = `/users/${usrData.userId}/${endPt}`;

        const data = { list_name: lstName };
        if (isShopList) data.recipe_id = recipeDtlsId;
        else data.occasion_id = occId;
        const req = await SavourApi.request("post", url, data, {}, headers);

        setSuccMsg(() => "Added recipe!");
        setFormReqMade();
        setReqMadeSucc();
        setTimeout(setFormReqMade, 3000);
        setTimeout(setReqMadeSucc, 3000);
        // Set isCreateListButton to false.
        setTimeout(setIsCreateListButton, 3000);
        setTimeout(() => setRecipeDtlsId(null), 3000);
        setTimeout(() => setLstName(null), 3000);
        setTimeout(() => setSuccMsg(null), 3000);
        if (isShopList) setTimeout(setIsShopList, 3000);
        setTimeout(() => setOccId(null), 3000);
        setTimeout(() => setFormData(initialState), 3000);
        // Update list data so form components update.
        const lstReqState = isShopList ? setShoplists : setRecipelists;
        const lstReqUrl = isShopList ? shopListUrl : recpListUrl;
        const lstReq = await SavourApi.request("get", lstReqUrl, {}, {}, headers);
        setTimeout(() => lstReqState(() => lstReq.data), 3000);
      } catch(err) {
        const error = err.response.data.error.message;
        setFormErrMsg(() => error || "Error");
        setInvalidForm();
        setFormReqMade();
        setTimeout(setInvalidForm, 3000);
        setTimeout(setFormReqMade, 3000);
        // Set isCreateListButton to false.
        setTimeout(setIsCreateListButton, 3000);
        setTimeout(() => setRecipeDtlsId(null), 3000);
        setTimeout(() => setLstName(null), 3000);
        if (isShopList) setTimeout(setIsShopList, 3000);
        setTimeout(() => setOccId(null), 3000);
        setTimeout(() => setFormData(initialState), 3000);
      }
    }

    const addRecipelistRecipe = async () => {
      try {
        const url = `/users/${usrData.userId}/recipelists/${formData.recipelistId}`;
        const data = { recipe_id: recipeDtlsId };
        const req = await SavourApi.request("post", url, data, {}, headers);
        setSuccMsg(() => "Added Recipe!");
        setFormReqMade();
        setReqMadeSucc();
        setTimeout(setFormReqMade, 3000);
        setTimeout(setReqMadeSucc, 3000);
        setTimeout(() => setRecipeDtlsId(null), 3000);
        setTimeout(() => setSuccMsg(null), 3000);
        setTimeout(setIsAddRecpBtn, 3000);
        setTimeout(() => setFormData(initialState), 3000);
        const lstReq = await SavourApi.request("get", recpListUrl, {}, {}, headers);
        setRecipelists(() => lstReq.data);
      } catch(err) {
        const errorCode = err.response.data.error.message.code;
        const error = errorCode === "23505" ? "Already added recipe!" : "Error";
        setFormErrMsg(() => error);
        setInvalidForm();
        setFormReqMade();
        setTimeout(setInvalidForm, 3000);
        setTimeout(setFormReqMade, 3000);
        setTimeout(() => setRecipeDtlsId(null), 3000);
        setTimeout(setIsAddRecpBtn, 3000);
        setTimeout(() => setFormData(initialState), 3000);
      }
    }

    if (isSubmitted) favOrSav();
    if (isCreateListButton) shopOrRecipeList();
    if (isAddRecpBtn) addRecipelistRecipe();
  }, [isSubmitted, isCreateListButton, isAddRecpBtn]);

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
    {/* RECIPE DETAILS */}
    <h1 className="RecipeDetails-h1">{recipeData && `${recipeData[0].name} by ${recipeData[0].author}`}</h1>
    { recipeData &&
      <div className="RecipeDetails">
        <div className="RecipeDetails-div">
          <div className="RecipeDetails-float-img-div">
            <img src={recipeData[0].image}></img>
          </div>
          <div className="RecipeDetails-float-div">
            <h2 className="RecipeDetails-subtitle">Descritpion</h2>
            <p className="RecipeDetails-p">{recipeData[0].description}</p>

            <h2 className="RecipeDetails-subtitle">Source Link</h2>
            <a href={recipeData[0].url} className="RecipeDetails-short-text">Visit Site</a>

            <h2 className="RecipeDetails-subtitle">Rating</h2>
            <p className="RecipeDetails-short-text">{recipeData[0].rating}</p>

            <h2 className="RecipeDetails-subtitle">Level</h2>
            <p className="RecipeDetails-short-text">{recipeData[0].level}</p>

            <h2 className="RecipeDetails-subtitle">Serves</h2>
            <p className="RecipeDetails-short-text">{recipeData[0].serves}</p>

            <h2 className="RecipeDetails-subtitle">Prep Time</h2>
            <p className="RecipeDetails-short-text">{recipeData[0].prep_time}</p>

            <h2 className="RecipeDetails-subtitle">Cook Time</h2>
            <p className="RecipeDetails-short-text">{recipeData[0].cook_time}</p>
            <div className="RecipeDetails-icons-float">
              <FontAwesomeIcon
                onClick={() => savOrFavRecipe(recipeData[0].id)}
                className="RecipeDetails-icons"
                icon={faStar} />
              <FontAwesomeIcon
                onClick={() => savOrFavRecipe(recipeData[0].id, false)}
                className="RecipeDetails-icons"
                icon={faFloppyDisk} />
            </div>
            <div className="RecipeDetails-msg">
            {
              favdOrSavd &&
                <Message msgObj={
                  {
                    class: favSavSucc ? "success" : "fail",
                    msg: favSavSucc ? succMsg : formErrMsg
                  }
                } />
            }
            </div>
          </div>
        </div>
        {/* RECIPE INGREDIENTS AND STEPS */}
        <div className="RecipeDetails-div">
          <div className="RecipeDetails-float-ul-div">
            <h2 className="RecipeDetails-subtitle">Ingredients</h2>
            <ul className="RecipeDetails-ul">
              {recipeData[0].ingredients.map(ingrd => (
                <li key={`${ingrd.qty}-${ingrd.ingredient_id}`}>{ingrd.qty} {ingrd.unit !== "no unit" ? ingrd.unit : null} {ingrd.ingredient}</li>
              ))}
            </ul>
          </div>
          <div className="RecipeDetails-float-steps-div">
            <h2 className="RecipeDetails-subtitle">Steps</h2>
            <p className="RecipeDetails-p">{recipeData[0].steps}</p>
          </div>
        </div>

        {/* ADD RECIPE TO A SHOPPING OR RECIPE LIST */}
        <h1 className="RecipeDetails-h1">Add Recipe To A List</h1>
          <div className="RecipeDetails-div">
            {/* SHOP LISTS FORMS */}
            <div className="RecipeDetails-float-div-full">
              <h2 className="RecipeDetails-subtitle">Add Recipe to Shoppinglist</h2>
                { usrHasShopList !== null && usrHasShopList
                ?
                  <Link exact="true" to="/shoppinglists">
                    <p>Recipe has Shoplist already! Go To Shopping Lists!</p>
                  </Link>
                :
                  <form onSubmit={handleSubmit} className="RecipeDetails-form">
                    <div className="RecipeDetails-form-field">
                      <label htmlFor="listName">List Name</label>
                      <input
                        id="listName"
                        type="text"
                        name="listName"
                        placeholder="Type a list name"
                        onChange={handleChange}
                        value={formData.listName} />
                    </div>
                    <div className="RecipeDetails-form-submit">
                      <div className="RecipeDetails-msg-div">
                        { formReqMade && isShopList &&
                          <Message msgObj={
                            {
                              class: reqMadeSucc ? "success" : "fail",
                              msg: reqMadeSucc ? succMsg : formErrMsg
                            }
                          } />
                        }
                      </div>
                      <button onClick={() => addShopOrRecipe(recipeData[0].id, formData.listName)}>ADD TO LIST</button>
                    </div>
                  </form>
                }
            </div>

            {/* RECIPE LISTS FORMS */}
            <div className="RecipeDetails-float-div-full">
                { recipelists && recipelists.length > 0
                  ?
                    <h2 className="RecipeDetails-subtitle">Add Recipe to Recipelist</h2>
                  :
                    <h2 className="RecipeDetails-subtitle">Create a Recipelist</h2>
                }
                { recipelists && recipelists.length > 0
                  ?
                    <form onSubmit={handleSubmit} className="RecipeDetails-form">
                    <div className="RecipeDetails-form-field">
                      <label htmlFor="recipelistRecipe">Recipelist Name</label>
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
                    <div className="RecipeDetails-form-submit">
                      <div className="RecipeDetails-msg-div">
                        { formReqMade && !isShopList &&
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
                            () => addRecipe(recipeData[0].id)
                          }>ADD TO LIST</button>
                    </div>
                  </form>
                :
                    <form onSubmit={handleSubmit} className="RecipeDetails-form">
                    <div className="RecipeDetails-form-field">
                      <label htmlFor="recipelistName">List Name</label>
                      <input
                        id="recipelistName"
                        type="text"
                        name="recipelistName"
                        placeholder="Type a recipelist name"
                        onChange={handleChange}
                        value={formData.recipelistName}></input>
                      <label htmlFor="occasionId">Recipelist Occasions</label>
                      <select
                        id="occasionId"
                        name="occasionId"
                        onChange={handleChange}
                        value={formData.occasionId}>
                        <option key="select-an-occ" value="">Select an Occasion</option>
                        { occasionData &&
                          occasionData.map(occasion => (
                            <option key={`${occasion.id}`} value={`${occasion.id}`}>{occasion.occasion}</option>
                          ))
                        }
                      </select>
                    </div>
                    <div className="RecipeDetails-form-submit">
                      <div className="RecipeDetails-msg-div">
                        { formReqMade && !isShopList &&
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
                            () => addShopOrRecipe(recipeData[0].id, formData.recipelistName, false)
                          }>ADD TO LIST</button>
                    </div>
                  </form>
                }
            </div>
          </div>
            

          <h1 className="RecipeDetails-h1">Recipe Reviews</h1>
            { isReveiws ? recipeData[0].reviews.map((rvw, idx) => (
                <div className="RecipeDetails-no-float-div" key={`div-${rvw.user_id}`}>
                  <p key={`stars-${rvw.user_id}`}>{rvw.stars}</p>
                  <p key={`review-${rvw.user_id}`}>{rvw.review}</p>
                </div>
              )) :
              <div className="RecipeDetails-no-float-div">
                <p>No reviews!</p>
              </div>
            }
      </div>
    }
    </>
  );
}

export default RecipeDetails;