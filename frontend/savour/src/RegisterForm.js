import { useState, useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import Message from './Message.js';
import SavourApi from './models/SavourApi.js';
// import SavourContext from './context/SavourContext.js';
import useLocalStorage from './hooks/useLocalStorage.js';
import useToggleState from './hooks/useToggleState.js';
import jwt_decode from 'jwt-decode';
import './RegisterForm.css';

const RegisterForm = () => {
    const initialState = {
        username: "", first_name: "", last_name: "",
        email: "", phone: "", password: ""
    };
  const [ usrData, setUsrData ] = useLocalStorage("userData", null);
  const [ formErrMsg, setFormErrMsg ] = useState(null);
  const [ formData, setFormData ] = useState(initialState);
  const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  const [ invalidForm, setInvalidForm ] = useToggleState(false);
//   const { userData, setUserData } = useContext(JoblyContext);

  useEffect(() => {
    const signup = async () => {

      try {
        const { 
          username, email, first_name,
          last_name, phone, password
        } = formData;
        const data = { 
            username, first_name, last_name, email,
            phone, password
        };
        const regResult = await SavourApi.request("post", "/users/register", data);
        console.log("regResult", regResult);
        const token = regResult.data[0].token;
        SavourApi.token = token;
        console.log("SAVOUR TOKEN", SavourApi.token);
        const payload = await jwt_decode(token);
        payload.token = token;

        setUsrData(data => (
          payload
        ));
        console.log("RegisterForm SUBMITTED!");
        // Set isSubmitted to false.
        setIsSubmitted();
        setFormData(() => initialState);
        // <Redirect exact to="/" />

      } catch (err) {
        // <Redirect exact to="/signup" />
        console.log("ERROR", err);
        setFormErrMsg(() => "Error");
        setInvalidForm();
        setTimeout(setInvalidForm, 3000);
        // Set isSubmitted to false.
        setTimeout(setIsSubmitted, 3000);
      }
    }

    if (isSubmitted) signup();

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
    // Create array of props formData needs.
    const reqProps = [
      "username", "first_name", "last_name",
      "email", "phone", "password"
    ];
    // Check if props are missing.
    const isValMsn = reqProps.some(val => (
      formData[val] === ""
    ));
    if (isValMsn) {
      setFormErrMsg(() => "All fields must be complete!");
      setInvalidForm();
      setTimeout(setInvalidForm, 3000);
    }
    // Set isSubmitted to true.
    else setIsSubmitted();
  }

  if (isSubmitted) return <Redirect exact to="/" />;

  return (
    <>
    <h1 className="RegisterForm-h1">Sign Up</h1>
    <form onSubmit={handleSubmit} className="RegisterForm">
        <label htmlFor="username">Username</label>
        <input
            type="text"
            id="username"
            onChange={handleChange}
            value={formData.username}
            name="username"
            placeholder="Type a username"
            autoComplete="username"></input>
        <label htmlFor="firstName">First Name</label>
        <input
            type="text"
            id="firstName"
            onChange={handleChange}
            value={formData.first_name}
            name="first_name"
            placeholder="Type a first name"></input>
        <label htmlFor="lastName">Last Name</label>
        <input
            type="text"
            id="lastName"
            onChange={handleChange}
            value={formData.last_name}
            name="last_name"
            placeholder="Type a last name"></input>
        <label htmlFor="email">Email</label>
        <input
            type="email"
            id="email"
            onChange={handleChange}
            value={formData.email}
            name="email"
            placeholder="Type an email"></input>
        <label htmlFor="phone">Phone</label>
        <input
            type="text"
            id="phone"
            onChange={handleChange}
            value={formData.phone}
            name="phone"
            placeholder="Type a phone"></input>
        <label htmlFor="password">Password</label>
        <input
            type="password"
            id="password"
            onChange={handleChange}
            value={formData.password}
            name="password"
            placeholder="Type a password"
            autoComplete="current-password"></input>
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
    </form>
    </>
  );
}

export default RegisterForm;