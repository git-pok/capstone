import { useState, useEffect, useContext } from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
          faStar,
          faFloppyDisk,
        } from '@fortawesome/free-solid-svg-icons'
import Message from './Message.js';
import CreateListForm from './CreateListForm.js';
import ListForm from './ListForm.js';
import AddToListForm from './AddToListForm.js';
import SavourApi from './models/SavourApi.js';
// import useLocalStorage from './hooks/useLocalStorage.js';
import useToggleState from './hooks/useToggleState.js';
import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
// import RecipeContainer from './RecipeContainer.js';
// import image from './img/ambient-kitchen.jpg';
import './RecipeDetailsII.css';

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
  console.log("shoplists", shoplists);
  const usrHasShopList = shoplists && recipeData ? shoplists.some(list => list.recipe_id === recipeData[0].id) : null;
  // Recipelists options and request data.
  const recpListUrl = `/users/${usrData.userId}/recipelists`;
  const recpLstOpts = {method: "get", url: recpListUrl, data: {}, params: {}, headers};
  const [ recipelists, setRecipelists ] = useAxios(recpLstOpts);
  console.log("recipelists", recipelists);
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
  // const [ actionUpdateMsg, setActionUpdateMsg ] = useState(null);
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

    if (isSubmitted) favOrSav();
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
    {/* RECIPE DETAILS */}
    <h1 className="RecipeDetailsII-h1">{recipeData && `${recipeData[0].name} by ${recipeData[0].author}`}</h1>
    { recipeData &&
      <div className="RecipeDetailsII">
        <div className="RecipeDetailsII-div">
          <div className="RecipeDetailsII-float-img-div">
            <img src={recipeData[0].image}></img>
          </div>
          <div className="RecipeDetailsII-float-div">
            <h2 className="RecipeDetailsII-subtitle">Descritpion</h2>
            <p className="RecipeDetailsII-p">{recipeData[0].description}</p>

            <h2 className="RecipeDetailsII-subtitle">Source Link</h2>
            <a href={recipeData[0].url} className="RecipeDetailsII-short-text">Visit Site</a>

            <h2 className="RecipeDetailsII-subtitle">Rating</h2>
            <p className="RecipeDetailsII-short-text">{recipeData[0].rating}</p>

            <h2 className="RecipeDetailsII-subtitle">Level</h2>
            <p className="RecipeDetailsII-short-text">{recipeData[0].level}</p>

            <h2 className="RecipeDetailsII-subtitle">Serves</h2>
            <p className="RecipeDetailsII-short-text">{recipeData[0].serves}</p>

            <h2 className="RecipeDetailsII-subtitle">Prep Time</h2>
            <p className="RecipeDetailsII-short-text">{recipeData[0].prep_time}</p>

            <h2 className="RecipeDetailsII-subtitle">Cook Time</h2>
            <p className="RecipeDetailsII-short-text">{recipeData[0].cook_time}</p>
            <div className="RecipeDetailsII-icons-float">
              <FontAwesomeIcon
                onClick={() => savOrFavRecipe(recipeData[0].id)}
                className="RecipeDetailsII-icons"
                icon={faStar} />
              <FontAwesomeIcon
                onClick={() => savOrFavRecipe(recipeData[0].id, false)}
                className="RecipeDetailsII-icons"
                icon={faFloppyDisk} />
            </div>
            <div className="RecipeDetailsII-msg">
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
        <div className="RecipeDetailsII-div">
          <div className="RecipeDetailsII-float-ul-div">
            <h2 className="RecipeDetailsII-subtitle">Ingredients</h2>
            <ul className="RecipeDetailsII-ul">
              {recipeData[0].ingredients.map(ingrd => (
                <li key={`${ingrd.qty}-${ingrd.ingredient_id}`}>{ingrd.qty} {ingrd.unit !== "no unit" ? ingrd.unit : null} {ingrd.ingredient}</li>
              ))}
            </ul>
          </div>
          <div className="RecipeDetailsII-float-steps-div">
            <h2 className="RecipeDetailsII-subtitle">Steps</h2>
            <p className="RecipeDetailsII-p">{recipeData[0].steps}</p>
          </div>
        </div>

        {/* ADD RECIPE TO A SHOPPING OR RECIPE LIST */}
        <h1 className="RecipeDetailsII-h1">Add Recipe To A List</h1>
          <div className="RecipeDetailsII-div">
            {/* SHOP LISTS FORMS */}
            <div className="RecipeDetailsII-float-div-full">
              <h2 className="RecipeDetailsII-subtitle">Add Recipe to Shoppinglist</h2>
                { usrHasShopList !== null && usrHasShopList
                ?
                  <Link exact="true" to="/shoppinglists">
                    <p>Recipe has Shoplist already! Go To Shopping Lists!</p>
                  </Link>
                :
                  <CreateListForm recipeId={recipeId} setState={setShoplists} />
                }
            </div>

            {/* RECIPE LISTS FORMS */}
            <div className="RecipeDetailsII-float-div-full">
                { recipelists && recipelists.length > 0
                  ?
                    <h2 className="RecipeDetailsII-subtitle">Add Recipe to Recipelist</h2>
                  :
                    <h2 className="RecipeDetailsII-subtitle">Create a Recipelist</h2>
                }
                { recipelists && recipelists.length > 0
                ?
                  // <ListForm recipelist={true} />
                  <AddToListForm recipelist={true} />
                :
                  <CreateListForm recipelist={true} setState={setRecipelists} />
                }
            </div>
          </div>
            

          <h1 className="RecipeDetailsII-h1">Recipe Reviews</h1>
            { isReveiws ? recipeData[0].reviews.map((rvw, idx) => (
                <div className="RecipeDetailsII-no-float-div" key={`div-${rvw.user_id}`}>
                  <p key={`stars-${rvw.user_id}`}>{rvw.stars}</p>
                  <p key={`review-${rvw.user_id}`}>{rvw.review}</p>
                </div>
              )) :
              <div className="RecipeDetailsII-no-float-div">
                <p>No reviews!</p>
              </div>
            }
      </div>
    }
    </>
  );
}

export default RecipeDetails;