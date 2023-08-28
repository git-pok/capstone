import { useState, useEffect, useContext } from 'react';
import { Redirect, useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
          faThumbsUp, faThumbsDown, faStar,
          faFloppyDisk, faList
        } from '@fortawesome/free-solid-svg-icons'
import Message from './Message.js';
import SavourApi from './models/SavourApi.js';
import useLocalStorage from './hooks/useLocalStorage.js';
import useToggleState from './hooks/useToggleState.js';
import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
import RecipeContainer from './RecipeContainer.js';
import image from './img/ambient-kitchen.jpg';
import './DetailCardRow.css';

/**
 * DetailCardRow
 * DetailCardRow Component
 * Props: leftDivContent, rightDivContent
*/
const DetailCardRow = (leftDivContent, rightDivContent) => {
  // const { id } = useParams();
  const { usrData, setUsrData } = useContext(UserContext);
  const headers = { _token: `Bearer ${usrData.token}`};
  const options = {method: "get", url: `/users/${usrData.userUsername}`, data: {}, params: {}, headers};
  const [ userReqData ] = useAxios(options);
  console.log("USER DATA",userReqData && userReqData[0].user.username);
  // NEW LOGIC
  // const [ isFav, setIsFav ] = useState(false);
  // const [ recipeDtlsId, setRecipeDtlsId ] = useState([]);
  // END NEW LOGIC
  // const isReveiws = recipeData ? recipeData[0].reviews.length > 0 : null;
  // const [ likDisFavSucc, setLikDisFavSucc ] = useToggleState(false);
  // const [ lkdDslkdOrFavd, setLkdDslkdOrFavd ] = useToggleState(false);
  // const [ formErrMsg, setFormErrMsg ] = useState(null);
  // const [ succMsg, setSuccMsg ] = useState(null);
  // const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  // const [ invalidForm, setInvalidForm ] = useToggleState(false);

  // const savOrFavRecipe = async (recipeId, fav = true) => {
  //   setIsFav(fav);
  //   setRecipeDtlsId(recipeId);
  //   // Set isSubmitted to true.
  //   setIsSubmitted();
  // }
  
  // useEffect(() => {
  //   const likDislikOrFav = async () => {
  //     try {
  //       // NEW LOGIC
  //       const favReq = await SavourApi.request("get", `/users/${usrData.userId}/favorite-recipes`, {}, {}, headers);
  //       const favReqIds = favReq.data.map(recipe => recipe.id);
  //       const savReq = await SavourApi.request("get", `/users/${usrData.userId}/saved-recipes`, {}, {}, headers);
  //       const savReqIds = savReq.data.map(recipe => recipe.id);
  //       // Create post url and set state with it.
  //       const favUrl = favReqIds.includes(recipeDtlsId)
  //           ? `/users/${usrData.userId}/favorite-recipes/${recipeDtlsId}`
  //           : `/users/${usrData.userId}/favorite-recipes`;
  //       const savUrl = savReqIds.includes(recipeDtlsId)
  //           ? `/users/${usrData.userId}/saved-recipes/${recipeDtlsId}`
  //           : `/users/${usrData.userId}/saved-recipes`;
  //       const url = isFav ? favUrl : savUrl;
  //       const favDataObj = favReqIds.includes(recipeDtlsId) ? {} : { recipe_id: recipeDtlsId };
  //       const savDataObj = savReqIds.includes(recipeDtlsId) ? {} : { recipe_id: recipeDtlsId };
  //       const dataObj = isFav ? favDataObj : savDataObj;
  //       // END OF NEW LOGIC
  //       const favMethod =  favReqIds.includes(recipeDtlsId) ? "delete" : "post";
  //       const savMethod =  savReqIds.includes(recipeDtlsId) ? "delete" : "post";
  //       const method = isFav ? favMethod : savMethod;
  //       const req = await SavourApi.request(method, url, dataObj, {}, headers);
  //       const favMsg = isFav && url === `/users/${usrData.userId}/favorite-recipes/${recipeDtlsId}`
  //           ? "Removed recipe from favorites!" : "Added recipe to favorites!";
  //       const savMsg = !isFav && url === `/users/${usrData.userId}/saved-recipes/${recipeDtlsId}`
  //           ? "Removed recipe from saved recipes!" : "Added recipe to saved recipes!";
  //       const msg = isFav ? favMsg : savMsg;
  //       setSuccMsg(() => msg);
  //       // Set isSubmitted to false.
  //       setIsSubmitted();
  //       // Set liked or disliked state to true.
  //       setLkdDslkdOrFavd();
  //       // Set liked or disliked success state to true.
  //       setLikDisFavSucc();
  //       // Set liked or disliked state to false.
  //       setTimeout(setLkdDslkdOrFavd, 3000);
  //       // Set liked or disliked success state to false.
  //       setTimeout(setLikDisFavSucc, 3000);
  //       setRecipeDtlsId(null);
  //     } catch(err) {
  //       // Set liked or disliked state to true.
  //       setLkdDslkdOrFavd();
  //       const error = err.response.data.error.message.constraint ? "Already added recipe!" : null;
  //       setFormErrMsg(() => error || "Error");
  //       setInvalidForm();
  //       setTimeout(setInvalidForm, 3000);
  //       // Set isSubmitted to false.
  //       setTimeout(setIsSubmitted, 3000);
  //       // Set liked or disliked state to false.
  //       setTimeout(setLkdDslkdOrFavd, 3000);
  //       setRecipeDtlsId(null);
  //     }
  //   }
  //   if (isSubmitted) likDislikOrFav();
  // }, [isSubmitted]);

  return (
    <>
    <h1 className="DetailCardRow-h1">{userReqData && `${userReqData[0].user.username} Details`}</h1>
    { userReqData &&
      <div className="DetailCardRow">
        <div className="DetailCardRow-div">
          <div className="DetailCardRow-float-div">
            <h2 className="DetailCardRow-subtitle">Username</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.username}</p>

            {/* <h2 className="DetailCardRow-subtitle">First Name</h2>
            <a className="RecipeDetails-short-text">Visit Site</a> */}

            <h2 className="DetailCardRow-subtitle">First Name</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.first_name}</p>

            <h2 className="DetailCardRow-subtitle">Last Name</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.last_name}</p>

            <h2 className="DetailCardRow-subtitle">Email</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.email}</p>

            <h2 className="DetailCardRow-subtitle">Phone</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.phone}</p>

            {/* <h2 className="DetailCardRow-subtitle">Cook Time</h2>
            <p className="DetailCardRow-short-text">{}</p> */}
            <div className="DetailCardRow-icons-float">
              <FontAwesomeIcon
                // onClick={() => savOrFavRecipe(recipeData[0].id)}
                className="DetailCardRow-icons"
                icon={faStar} />
              <FontAwesomeIcon
                // onClick={() => savOrFavRecipe(recipeData[0].id, false)}
                className="DetailCardRow-icons"
                icon={faFloppyDisk} />
            </div>
            <div className="DetailCardRow-msg">
            {/* {
              lkdDslkdOrFavd &&
                <Message msgObj={
                  {
                    class: likDisFavSucc ? "success" : "fail",
                    msg: likDisFavSucc ? succMsg : formErrMsg
                  }
                } />
            } */}
            </div>
          </div>
          <div className="DetailCardRow-float-div">
            <h2 className="DetailCardRow-subtitle">Username</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.username}</p>

            {/* <h2 className="DetailCardRow-subtitle">First Name</h2>
            <a className="RecipeDetails-short-text">Visit Site</a> */}

            <h2 className="DetailCardRow-subtitle">First Name</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.first_name}</p>

            <h2 className="DetailCardRow-subtitle">Last Name</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.last_name}</p>

            <h2 className="DetailCardRow-subtitle">Email</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.email}</p>

            <h2 className="DetailCardRow-subtitle">Phone</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.phone}</p>
          </div>
        </div>

        {/* <div className="DetailCardRow-div">
          <div className="DetailCardRow-float-ul-div">
            <h2 className="DetailCardRow-subtitle">Ingredients</h2>
            <ul className="DetailCardRow-ul">
              {recipeData[0].ingredients.map(ingrd => (
                <li key={`${ingrd.qty}-${ingrd.ingredient_id}`}>{ingrd.qty} {ingrd.unit !== "no unit" ? ingrd.unit : null} {ingrd.ingredient}</li>
              ))}
            </ul>
          </div>
          <div className="DetailCardRow-float-steps-div">
            <h2 className="DetailCardRow-subtitle">Steps</h2>
            <p className="DetailCardRow-p">{recipeData[0].steps}</p>
          </div>
        </div>

        <h1 className="DetailCardRow-h1">Reviews</h1>
          { isReveiws ? recipeData[0].reviews.map((rvw, idx) => (
            <div className="DetailCardRow-no-float-div" key={`div-${rvw.user_id}`}>
            <p key={`stars-${rvw.user_id}`}>{rvw.stars}</p>
            <p key={`review-${rvw.user_id}`}>{rvw.review}</p>
            </div>
          )) :
            <div className="DetailCardRow-no-float-div">
              <p>No reviews!</p>
            </div>
          } */}
      </div>
    }
    </>
  );
}

export default DetailCardRow;