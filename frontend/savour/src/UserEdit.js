import { useState, useEffect, useContext } from 'react';
import { Redirect, useParams, Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
          faThumbsUp, faThumbsDown, faStar,
          faFloppyDisk, faList, faUserXmark
        } from '@fortawesome/free-solid-svg-icons'
import Message from './Message.js';
import SavourApi from './models/SavourApi.js';
import useLocalStorage from './hooks/useLocalStorage.js';
import useToggleState from './hooks/useToggleState.js';
import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
import RecipeContainer from './RecipeContainer.js';
import image from './img/ambient-kitchen.jpg';
import './UserEdit.css';

/**
 * UserEdit
 * UserEdit Component
*/
const UserEdit = () => {
  // const { id } = useParams();
  const { usrData, setUsrData } = useContext(UserContext);
  const headers = { _token: `Bearer ${usrData.token}`};
  const options = {method: "get", url: `/users/${usrData.userUsername}`, data: {}, params: {}, headers};
  const [ userReqData, setUserReqData ] = useAxios(options);
  const [ userData, setUserData ] = useState(null);
  // console.log("USER DATA",userReqData && userReqData[0].user.username);

  const initialState = {
    firstName: "", lastName: "", email: "",
    phone: "", password: ""
  };
  console.log("LOGIN RAN");

  const [ formErrMsg, setFormErrMsg ] = useState(null);
  const [ formData, setFormData ] = useState(initialState);
  const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  const [ invalidForm, setInvalidForm ] = useToggleState(false);
  const history = useHistory();

  useEffect(() => {
    const editUser = async () => {
      try {
        const {
          firstName: first_name, lastName: last_name,
          email, phone, password
        } = formData;
        const formValsArr = Object.entries({ first_name, last_name, email, phone, password });
        const data = {};
        console.log("formValsArr", formValsArr);
        formValsArr.forEach(arr => {
          if (arr[1] !== "") data[arr[0]] = arr[1];
        });
        console.log("data", data);
        const usrReq = await SavourApi.request("patch", `/users/${usrData.userUsername}`, data, {}, headers);
        console.log("usrReq Result", usrReq.data);
        const userArr = [ ...usrReq.data ]
        console.log("userObj", userArr);
        setUserReqData(() => userArr);
        // history.push(`/users/${usrData.userUsername}`);
        // const token = regResult.data[0].user.token;
        // SavourApi.token = token;
        // console.log("SAVOUR TOKEN", SavourApi.token);
        // const payload = await jwt_decode(token);
        // payload.token = token;
        // console.log("payload", payload);

        // setUsrData(data => (
        // payload
        // ));
        console.log("LoginForm SUBMITTED!");
        // Set isSubmitted to false.
        setIsSubmitted();
        // console.log("formData", formData);
        setFormData(() => initialState);
        // history.push("/");
      } catch (err) {
        console.log("ERROR", err);
        // Define variable for API error.
        const error = err.response.data.error.message;
        setFormErrMsg(() => error || "Error");
        setInvalidForm();
        setTimeout(setInvalidForm, 3000);
        // Set isSubmitted to false.
        setTimeout(setIsSubmitted, 3000);
      }
    }

    if (isSubmitted) editUser();

  }, [isSubmitted])

  const handleChange = (evt) => {
    const { name, value } = evt.target;

    setFormData(data => ({
      ...data,
      [name]: value
    }))
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    // Create array of props formData has.
    const reqProps = [
      "firstName", "lastName", "email",
      "phone", "password"
    ];
    // Check if props are present.
    const isVal = reqProps.some(val => (
      formData[val] !== ""
    ));
    // If no props are present set invalidForm.
    if (!isVal) {
      setFormErrMsg(() => "Atleast one field must be complete!");
      setInvalidForm();
      setTimeout(setInvalidForm, 3000);
    }
    // Set isSubmitted to true if all props exist.
    else setIsSubmitted();
    // setIsSubmitted();
  }

  return (
    <>
    <h1 className="DetailCardRow-h1">{userReqData && `${userReqData[0].user.username} Details`}</h1>
    { userReqData &&
      <div className="DetailCardRow">
        <div className="DetailCardRow-div">
          <div className="DetailCardRow-float-div">
            <h2 className="DetailCardRow-subtitle">Username</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.username}</p>

            <h2 className="DetailCardRow-subtitle">First Name</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.first_name}</p>

            <h2 className="DetailCardRow-subtitle">Last Name</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.last_name}</p>

            <h2 className="DetailCardRow-subtitle">Email</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.email}</p>

            <h2 className="DetailCardRow-subtitle">Phone</h2>
            <p className="DetailCardRow-short-text">{userReqData[0].user.phone}</p>

            <h2 className="DetailCardRow-subtitle">Delete User</h2>
            <FontAwesomeIcon
                // onClick={() => savOrFavRecipe(recipeData[0].id)}
                className="DetailCardRow-icons"
                icon={faUserXmark} />
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
          <div className="DetailCardRow-float-div-form">
          <h2 className="DetailCardRow-subtitle">Edit User</h2>
          {/* <div className="LoginForm-bg-img" style={styles}> */}
          {/* <h1 className="DetailCardRow-form-h1">Login</h1> */}
          <form onSubmit={handleSubmit} className="DetailCardRow-form">
            {/* <h3 className="DetailCardRow-form-subtitle">Edit User</h3> */}
            <div className="DetailCardRow-form-field">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                onChange={handleChange}
                value={formData.firstName}
                name="firstName"
                placeholder="Type a first name"></input>
            </div>
            <div className="DetailCardRow-form-field">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                onChange={handleChange}
                value={formData.lastName}
                name="lastName"
                placeholder="Type a last name"></input>
            </div>
            <div className="DetailCardRow-form-field">
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                onChange={handleChange}
                value={formData.email}
                name="email"
                placeholder="Type an email"></input>
            </div>
            <div className="DetailCardRow-form-field">
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                id="phone"
                onChange={handleChange}
                value={formData.phone}
                name="phone"
                placeholder="Type a phone number"></input>
            </div>
            <div className="DetailCardRow-form-field">
              <label htmlFor="password">Password</label>
              <input
                type="text"
                id="password"
                onChange={handleChange}
                value={formData.password}
                name="password"
                placeholder="Type a password"></input>
            </div>
            <div className="DetailCardRow-form-submit">
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

export default UserEdit;