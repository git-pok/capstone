import { useState, useEffect, useContext } from 'react';
import { Redirect, useParams } from 'react-router-dom';
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
  const headers = { _token: `Bearer ${usrData.token}`};
  const options = {method: "get", url: `/recipes/${id}`, data: {}, params: {}, headers}
  const [ recipeData ] = useAxios("recipe", options);
  const isReveiws = recipeData ? recipeData[0].reviews.length > 0 : null;

  // const [ formErrMsg, setFormErrMsg ] = useState(null);
  // const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  // const [ invalidForm, setInvalidForm ] = useToggleState(false);

  // image styles.
  return (
    <>
    <h1 className="RecipeDetails-h1">{recipeData && `${recipeData[0].name} by ${recipeData[0].author}`}</h1>
    <div className="RecipeDetails">
    { recipeData &&
        <>
          <div className="RecipeDetails-div">
            <div className="RecipeDetails-float-img-div">
              <img src={recipeData[0].image}></img>
            </div>
            <div className="RecipeDetails-float-div">
              <h2 className="RecipeDetails-subtitle">Descritpion</h2>
              <p className="RecipeDetails-p">{recipeData[0].description}</p>

              <h2 className="RecipeDetails-subtitle">Recipe Link</h2>
              <p className="RecipeDetails-p">{recipeData[0].url}</p>

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
            </div>
          </div>

          <div className="RecipeDetails-div">
            <div className="RecipeDetails-float-div">
              <h2 className="RecipeDetails-subtitle">Ingredients</h2>
              <ul className="RecipeDetails-ul">
                {recipeData[0].ingredients.map(ingrd => (
                  <li key={`${ingrd.qty}-${ingrd.ingredient_id}`}>{ingrd.qty} {ingrd.unit !== "no unit" ? ingrd.unit : null} {ingrd.ingredient}</li>
                ))}
              </ul>
            </div>
            <div className="RecipeDetails-float-div">
              <h2 className="RecipeDetails-subtitle">Steps</h2>
              <p className="RecipeDetails-p">{recipeData[0].steps}</p>
            </div>
          </div>

          <h1 className="RecipeDetails-h1">Reviews</h1>
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
        </>
    }
    </div>
    </>
  );
}

export default RecipeDetails;