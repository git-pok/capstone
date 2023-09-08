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
import './ContactPage.css';

/**
 * ContactPage
 * Props: none.
 * Renders: user profile page.
*/
const ContactPage = () => {
  const { usrData, setUsrData, logOut } = useContext(UserContext);
  const headers = { _token: `Bearer ${usrData.token}`};
  const options = {method: "get", url: `/users/${usrData.userUsername}`, data: {}, params: {}, headers};
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
        const usrReq = await SavourApi.request("patch", `/users/${usrData.userUsername}`, data, {}, headers);
        const userArr = [ ...usrReq.data ];
        setUserReqData(() => userArr);
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

    if (isSubmitted) editUser();

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
      <h1 className="ContactPage-h1">{userReqData && `${userReqData[0].user.username} Details`}</h1>
      <div className="ContactPage">
        <div className="ContactPage-div">
          <div className="ContactPage-float-div">
            <h2 className="ContactPage-subtitle">Developer Information</h2>
            <p className="ContactPage-short-text">Name: Vincent</p>
            <p className="ContactPage-short-text">Nickname: Fvin</p>
            <p className="ContactPage-short-text">Location: Tampa FL.</p>
            <p className="ContactPage-short-text">Email: vincent.impreveduto.work@gmail.com</p>
          </div>
          <div className="ContactPage-float-div-form">
            <h2 className="ContactPage-subtitle">Send a Message</h2>
            <form onSubmit={handleSubmit} className="ContactPage-form">
            <div className="ContactPage-form-field">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                onChange={handleChange}
                value={formData.firstName}
                name="firstName"
                placeholder="Type a first name"></input>
            </div>
            <div className="ContactPage-form-field">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                onChange={handleChange}
                value={formData.lastName}
                name="lastName"
                placeholder="Type a last name"></input>
            </div>
            <div className="ContactPage-form-field">
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                onChange={handleChange}
                value={formData.email}
                name="email"
                placeholder="Type an email"></input>
            </div>
            <div className="ContactPage-form-field">
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                id="phone"
                onChange={handleChange}
                value={formData.phone}
                name="phone"
                placeholder="Type a phone number"></input>
            </div>
            <div className="ContactPage-form-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                onChange={handleChange}
                value={formData.password}
                name="password"
                placeholder="Type a password"></input>
            </div>
            <div className="ContactPage-msg-div">
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
            <div className="ContactPage-form-submit">
              <button>SUBMIT</button>
            </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactPage;