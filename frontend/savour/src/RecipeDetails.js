import { useState, useEffect, useContext } from 'react';
import { Redirect, useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
          faThumbsUp, faThumbsDown, faStar,
          faFloppyDisk, faList, faSquarePlus
        } from '@fortawesome/free-solid-svg-icons'
import Message from './Message.js';
import SavourApi from './models/SavourApi.js';
import useLocalStorage from './hooks/useLocalStorage.js';
import useToggleState from './hooks/useToggleState.js';
import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
import RecipeContainer from './RecipeContainer.js';
import image from './img/ambient-kitchen.jpg';
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
  // Request recipe data.
  const options = {method: "get", url: `/recipes/${id}`, data: {}, params: {}, headers};
  const [ recipeData ] = useAxios(options);
  // NEW LOGIC
  // Boolean to see if clicked button is fav or sav.
  const [ isFav, setIsFav ] = useState(false);
  const [ recipeDtlsId, setRecipeDtlsId ] = useState(null);
  const [ occId, setOccId ] = useState(null);
  // Request shoplists data.
  const shopLstOpts = {method: "get", url: `/users/${usrData.userId}/shoppinglists`, data: {}, params: {}, headers};
  const [ shoplists, setShoplists ] = useAxios(shopLstOpts);
  // Request recipelists data.
  const recpLstOpts = {method: "get", url: `/users/${usrData.userId}/recipelists`, data: {}, params: {}, headers};
  const [ recipelists, setRecipelists ] = useAxios(recpLstOpts);
  console.log("recipelists", recipelists);
  // Request recipelists occasions data.
  const OccOpts = {method: "get", url: `/occasions`, data: {}, params: {}, headers};
  const [ occasionData ] = useAxios(OccOpts);
  console.log("occasionData", occasionData);
  const [ isShopOrRecLst, setIsShopOrRecLst ] = useToggleState(false);
  const [ isShopList, setIsShopList ] = useToggleState(false);
  const [ lstName, setLstName ] = useState(null);
  // END NEW LOGIC
  const isReveiws = recipeData ? recipeData[0].reviews.length > 0 : null;
  const [ likDisFavSucc, setLikDisFavSucc ] = useToggleState(false);
  const [ lkdDslkdOrFavd, setLkdDslkdOrFavd ] = useToggleState(false);
  const [ formErrMsg, setFormErrMsg ] = useState(null);
  const [ succMsg, setSuccMsg ] = useState(null);
  const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  const [ invalidForm, setInvalidForm ] = useToggleState(false);
  // FORM LOGIC
  const initialState = {
    listName: "", recipelistName: "",
    occasionId: ""
  };

  const [ formData, setFormData ] = useState(initialState);
  const [ formReqMade, setFormReqMade ] = useToggleState(false);
  const [ reqMadeSucc, setReqMadeSucc ] = useToggleState(false);
  // END FORM LOGIC
  const savOrFavRecipe = async (recipeId, fav = true) => {
    setIsFav(fav);
    setRecipeDtlsId(recipeId);
    // Set isSubmitted to true.
    setIsSubmitted();
  }

  const addShopOrRecipe = async (recipeId, lstName, shop = true) => {
    const isOccId = formData.occasionId !== "";
    if ((lstName === "") || (!shop && lstName !== "" && !isOccId)) {
      if (shop) setIsShopList();
      // console.log("EMPTY CLICK LIST NAME", lstName);
      const msg = !shop && !isOccId ? "Select an occasion!" : "Type a list name!";
      // console.log("MSG", msg);
      setFormErrMsg(() => msg);
      setInvalidForm();
      setFormReqMade();
      setTimeout(setFormReqMade, 3000);
      setTimeout(setInvalidForm, 3000);
      setTimeout(() => setFormErrMsg(null), 3000);
      if (shop) setTimeout(setIsShopList, 3000);
    } else {
      // console.log("CLICK LIST NAME", lstName);
      setRecipeDtlsId(recipeId);
      // console.log("FROM DATA", formData);
      const sbmtdListName = shop ? formData.listName : formData.recipelistName;
      setLstName(() => sbmtdListName);
      // Set isShopOrRecLst to true.
      setIsShopOrRecLst();
      if (shop) setIsShopList();
      if (!shop) setOccId(() => +formData.occasionId);
    }
  }

  useEffect(() => {
    const likDislikOrFav = async () => {
      try {
        // NEW LOGIC
        const favReq = await SavourApi.request("get", `/users/${usrData.userId}/favorite-recipes`, {}, {}, headers);
        const favReqIds = favReq.data.map(recipe => recipe.id);
        const savReq = await SavourApi.request("get", `/users/${usrData.userId}/saved-recipes`, {}, {}, headers);
        const savReqIds = savReq.data.map(recipe => recipe.id);
        // Create post url and set state with it.
        const favUrl = favReqIds.includes(recipeDtlsId)
            ? `/users/${usrData.userId}/favorite-recipes/${recipeDtlsId}`
            : `/users/${usrData.userId}/favorite-recipes`;
        const savUrl = savReqIds.includes(recipeDtlsId)
            ? `/users/${usrData.userId}/saved-recipes/${recipeDtlsId}`
            : `/users/${usrData.userId}/saved-recipes`;
        const url = isFav ? favUrl : savUrl;
        const favDataObj = favReqIds.includes(recipeDtlsId) ? {} : { recipe_id: recipeDtlsId };
        const savDataObj = savReqIds.includes(recipeDtlsId) ? {} : { recipe_id: recipeDtlsId };
        const dataObj = isFav ? favDataObj : savDataObj;
        // END OF NEW LOGIC
        const favMethod =  favReqIds.includes(recipeDtlsId) ? "delete" : "post";
        const savMethod =  savReqIds.includes(recipeDtlsId) ? "delete" : "post";
        const method = isFav ? favMethod : savMethod;
        const req = await SavourApi.request(method, url, dataObj, {}, headers);
        const favMsg = isFav && url === `/users/${usrData.userId}/favorite-recipes/${recipeDtlsId}`
            ? "Removed recipe from favorites!" : "Added recipe to favorites!";
        const savMsg = !isFav && url === `/users/${usrData.userId}/saved-recipes/${recipeDtlsId}`
            ? "Removed recipe from saved recipes!" : "Added recipe to saved recipes!";
        const msg = isFav ? favMsg : savMsg;
        setSuccMsg(() => msg);
        // Set isSubmitted to false.
        setIsSubmitted();
        // Set liked or disliked state to true.
        setLkdDslkdOrFavd();
        // Set liked or disliked success state to true.
        setLikDisFavSucc();
        // Set liked or disliked state to false.
        setTimeout(setLkdDslkdOrFavd, 3000);
        // Set liked or disliked success state to false.
        setTimeout(setLikDisFavSucc, 3000);
        setRecipeDtlsId(null);
        setTimeout(() => setSuccMsg(null), 3000);
      } catch(err) {
        // Set liked or disliked state to true.
        setLkdDslkdOrFavd();
        const error = err.response.data.error.message.constraint ? "Already added recipe!" : null;
        setFormErrMsg(() => error || "Error");
        setInvalidForm();
        setTimeout(setInvalidForm, 3000);
        // Set isSubmitted to false.
        setTimeout(setIsSubmitted, 3000);
        // Set liked or disliked state to false.
        setTimeout(setLkdDslkdOrFavd, 3000);
        setRecipeDtlsId(null);
        setTimeout(() => setFormErrMsg(null), 3000);
      }
    }

    const shopOrRecipeList = async () => {
      try {
        const endPt = isShopList ? "shoppinglists" : "recipelists";
        const url = `/users/${usrData.userId}/${endPt}`;
        if (isShopList) {
          const data = { recipe_id: recipeDtlsId, list_name: lstName };
          const req = await SavourApi.request("post", url, data, {}, headers);
          // console.log("SHOP RAN, req", req);
        }
        else {
          // console.log("OCC ID", occId);
          const data = { occasion_id: occId, list_name: lstName };
          const req = await SavourApi.request("post", url, data, {}, headers);
          // console.log("RECIPELISTS RAN, req", req);
        }
        setSuccMsg(() => "ADDED RECIPE");
        setFormReqMade();
        setReqMadeSucc();
        setTimeout(setFormReqMade, 3000);
        setTimeout(setReqMadeSucc, 3000);
        // Set isShopOrRecLst to false.
        setTimeout(setIsShopOrRecLst, 3000);
        setTimeout(() => setRecipeDtlsId(null), 3000);
        setTimeout(() => setLstName(null), 3000);
        setTimeout(() => setSuccMsg(null), 3000);
        if (isShopList) setTimeout(setIsShopList, 3000);
        setTimeout(() => setOccId(null), 3000);
        setTimeout(() => setFormData(initialState), 3000);
      } catch(err) {
        // Set liked or disliked state to true.
        const error = err.response.data.error.message.constraint ? "Already added recipe!" : null;
        setFormErrMsg(() => error || "Error");
        setInvalidForm();
        setFormReqMade();
        setTimeout(setInvalidForm, 3000);
        setTimeout(setFormReqMade, 3000);
        // Set isShopOrRecLst to false.
        setTimeout(setIsShopOrRecLst, 3000);
        setTimeout(() => setRecipeDtlsId(null), 3000);
        setTimeout(() => setLstName(null), 3000);
        if (isShopList) setTimeout(setIsShopList, 3000);
        setTimeout(() => setOccId(null), 3000);
        setTimeout(() => setFormData(initialState), 3000);
      }
    }
    if (isSubmitted) likDislikOrFav();
    if (isShopOrRecLst) shopOrRecipeList();
  }, [isSubmitted, isShopOrRecLst]);

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
              lkdDslkdOrFavd &&
                <Message msgObj={
                  {
                    class: likDisFavSucc ? "success" : "fail",
                    msg: likDisFavSucc ? succMsg : formErrMsg
                  }
                } />
            }
            </div>
          </div>
        </div>

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

        <h1 className="RecipeDetails-h1">Add Recipe To</h1>
          <div className="RecipeDetails-div">
            <div className="RecipeDetails-float-div-full">
              <h2 className="RecipeDetails-subtitle">Add Recipe to Shoppinglist</h2>
                { shoplists.length > 0
                ?
                  <Link exact to="/shoppinglists">
                    <h1>Go To Shopping Lists!</h1>
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
                      {/* <select
                        id="listName"
                        name="listName"
                        onChange={handleChange}
                        value={formData.listName}>
                        <option key="select-a-list" value="">Select a List</option>
                        {
                          shoplists.map(list => (
                            <option key={`${list.list_name}`} value={`${list.list_name}`}>{list.list_name}</option>
                          ))
                        }
                      </select> */}
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
                {/* <div className="RecipeDetails-icons-float">
                { shoplists.length > 0
                  ?
                    <FontAwesomeIcon
                      onClick={() => addShopOrRecipe(recipeData[0].id)}
                      className="RecipeDetails-icons"
                      icon={faSquarePlus} />
                  :
                  <Link exact to="/shoppinglists">
                    User has no shoppinglists! Go to shoppinglists
                  </Link>
                  null  
                }
                </div> */}
            </div>
            
              
            <div className="RecipeDetails-float-div-full">
                <h2 className="RecipeDetails-subtitle">Add Recipe to Recipelist</h2>
                { recipelists.length > 0
                ?
                  <Link exact to="/recipelists">
                    <h1>Go To Recipelists!</h1>
                  </Link>
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
                        {
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
                {/* <div className="RecipeDetails-icons-float">
                { shoplists.length > 0
                  ?
                    <FontAwesomeIcon
                      onClick={() => addShopOrRecipe(recipeData[0].id)}
                      className="RecipeDetails-icons"
                      icon={faSquarePlus} />
                  :
                  <Link exact to="/shoppinglists">
                    User has no shoppinglists! Go to shoppinglists
                  </Link>
                  null  
                }
                </div> */}
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