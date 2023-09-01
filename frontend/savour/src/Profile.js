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
import './Profile.css';

/**
 * Profile
 * User Profile Component
*/
const Profile = () => {
  // const { id } = useParams();
  // const [ usrData, setUsrData ] = useLocalStorage("userData", null);
  const { usrData, setUsrData, logOut } = useContext(UserContext);
  console.log("USER EDIT USER TOKEN", usrData.token);
  const headers = { _token: `Bearer ${usrData.token}`};
  console.log("USER EDIT USER DATA", usrData);
  const options = {method: "get", url: `/users/${usrData.userUsername}`, data: {}, params: {}, headers};
  console.log("USER EDIT options", options);
  const [ userReqData, setUserReqData ] = useAxios(options);
  const [ userData, setUserData ] = useState(null);
  const [ formErrMsg, setFormErrMsg ] = useState(null);
  const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  const [ invalidForm, setInvalidForm ] = useToggleState(false);
  const [ formReqMade, setFormReqMade ] = useToggleState(false);
  const [ dltReqMade, setDltReqMade ] = useToggleState(false);
  const [ reqMadeSucc, setReqMadeSucc ] = useToggleState(false);
  const [ succMsg, setSuccMsg ] = useState(null);
  const [ isDelete, setIsDelete ] = useToggleState(false);
  const history = useHistory();

  const initialState = {
    firstName: "", lastName: "", email: "",
    phone: "", password: ""
  };

  const [ formData, setFormData ] = useState(initialState);
  console.log("LOGIN RAN");

  const deleteTrue = () => {
    setIsDelete();
  }

  useEffect(() => {
    const editUser = async () => {
      try {
        const {
          firstName: first_name, lastName: last_name,
          email, phone, password
        } = formData;
        // Make array of object props.
        const formValsArr = Object.entries({ first_name, last_name, email, phone, password });
        const data = {};
        // define props in data for values.
        formValsArr.forEach(arr => {
          if (arr[1] !== "") data[arr[0]] = arr[1];
        });
        // console.log("data", data);
        const usrReq = await SavourApi.request("patch", `/users/${usrData.userUsername}`, data, {}, headers);
        // console.log("usrReq Result", usrReq.data);
        const userArr = [ ...usrReq.data ];
        setUserReqData(() => userArr);
        console.log("EditForm SUBMITTED!");
        setSuccMsg(() => "User edited!");
        setFormReqMade();
        setReqMadeSucc();
        setTimeout(setFormReqMade, 3000);
        setTimeout(setReqMadeSucc, 3000);
        setTimeout(() => setSuccMsg(null), 3000);
        // Set isSubmitted to false.
        setIsSubmitted();
        setFormData(() => initialState);
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

    const deleteUser = async () => {
      try {
        const deleteUsrReq = await SavourApi.request("delete", `/users/${usrData.userUsername}`, {}, {}, headers);
        console.log("DELETE SUBMITTED!");
        setSuccMsg(() => "User deleted! Logging out!");
        setDltReqMade();
        setReqMadeSucc();
        setTimeout(setDltReqMade, 3000);
        setTimeout(setReqMadeSucc, 3000);
        setTimeout(() => setSuccMsg(null), 3000);
        setTimeout(logOut, 5000);
        // Set isDelete to false.
        setIsDelete();

      } catch (err) {
        console.log("ERROR", err);
        // Define variable for API error.
        const error = err.response.data.error.message;
        setFormErrMsg(() => error || "Error");
        setInvalidForm();
        setTimeout(setInvalidForm, 3000);
        // Set isSubmitted to false.
        setTimeout(setIsSubmitted, 3000);
        // Set isDelete to false.
        setIsDelete();
      }
    }

    if (isSubmitted) editUser();
    else if (isDelete) deleteUser();

  }, [isSubmitted, isDelete])

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
    // console.log("isVal", isVal);
    // If no props are present set invalidForm.
    if (!isVal) {
      setFormErrMsg(() => "Fill atleast 1 field!");
      setInvalidForm();
      setTimeout(setInvalidForm, 3000);
      setTimeout(() => setFormErrMsg(null), 3000);
      setFormReqMade();
      setTimeout(setFormReqMade, 3000);
    }
    // Set isSubmitted to true if all props exist.
    else setIsSubmitted();
  }

  return (
    <>
    <h1 className="Profile-h1">{userReqData && `${userReqData[0].user.username} Details`}</h1>
    { userReqData &&
      <div className="Profile">
        <div className="Profile-div">
          <div className="Profile-float-div">
            <h2 className="Profile-subtitle">Username</h2>
            <p className="Profile-short-text">{userReqData[0].user.username}</p>

            <h2 className="Profile-subtitle">First Name</h2>
            <p className="Profile-short-text">{userReqData[0].user.first_name}</p>

            <h2 className="Profile-subtitle">Last Name</h2>
            <p className="Profile-short-text">{userReqData[0].user.last_name}</p>

            <h2 className="Profile-subtitle">Email</h2>
            <p className="Profile-short-text">{userReqData[0].user.email}</p>

            <h2 className="Profile-subtitle">Phone</h2>
            <p className="Profile-short-text">{userReqData[0].user.phone}</p>

            <h2 className="Profile-subtitle">Delete User</h2>
            <FontAwesomeIcon
                // onClick={() => savOrFavRecipe(recipeData[0].id)}
                className="Profile-icons"
                onClick={deleteTrue}
                icon={faUserXmark} />
            <div className="Profile-msg">
            </div>
            <div className="Profile-msg-div">
            {
              dltReqMade &&
                <Message msgObj={
                  {
                    class: reqMadeSucc ? "success" : "fail",
                    msg: reqMadeSucc ? succMsg : formErrMsg
                  }
                } />
            }
            </div>
          </div>
          <div className="Profile-float-div-form">
          <h2 className="Profile-subtitle">Edit User</h2>
          <form onSubmit={handleSubmit} className="Profile-form">
            <div className="Profile-form-field">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                onChange={handleChange}
                value={formData.firstName}
                name="firstName"
                placeholder="Type a first name"></input>
            </div>
            <div className="Profile-form-field">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                onChange={handleChange}
                value={formData.lastName}
                name="lastName"
                placeholder="Type a last name"></input>
            </div>
            <div className="Profile-form-field">
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                onChange={handleChange}
                value={formData.email}
                name="email"
                placeholder="Type an email"></input>
            </div>
            <div className="Profile-form-field">
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                id="phone"
                onChange={handleChange}
                value={formData.phone}
                name="phone"
                placeholder="Type a phone number"></input>
            </div>
            <div className="Profile-form-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                onChange={handleChange}
                value={formData.password}
                name="password"
                placeholder="Type a password"></input>
            </div>
            <div className="Profile-msg-div">
            {
              formReqMade &&
                <Message msgObj={
                  {
                    class: reqMadeSucc ? "success" : "fail",
                    msg: reqMadeSucc ? succMsg : formErrMsg
                  }
                } />
            }
            </div>
            <div className="Profile-form-submit">
              <button>SUBMIT</button>
            </div>
            </form>
          </div>
        </div>
      </div>
    }
    </>
  );
}

export default Profile;