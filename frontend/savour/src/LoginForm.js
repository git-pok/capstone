import { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import Message from './Message.js';
import SavourApi from './models/SavourApi.js';
import useLocalStorage from './hooks/useLocalStorage.js';
import useToggleState from './hooks/useToggleState.js';
import jwt_decode from 'jwt-decode';
import image from './img/cut-board.jpg';
import './LoginForm.css';

/**
 * LoginForm
 * Login Form
 * Props: none
*/
const LoginForm = () => {
  const initialState = {
      username: "", password: ""
  };

  const [ usrData, setUsrData ] = useLocalStorage("userData", null);
  const [ formErrMsg, setFormErrMsg ] = useState(null);
  const [ formData, setFormData ] = useState(initialState);
  const [ formCmplt, setFormCmplt ] = useToggleState(false);
  const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  const [ invalidForm, setInvalidForm ] = useToggleState(false);

  useEffect(() => {
    const login = async () => {

      try {
        const { username, password } = formData;
        const data = { username, password };
        const regResult = await SavourApi.request("post", "/users/login", data);
        console.log("regResult", regResult);
        const token = regResult.data[0].user.token;
        SavourApi.token = token;
        console.log("SAVOUR TOKEN", SavourApi.token);
        const payload = await jwt_decode(token);
        payload.token = token;
        console.log("payload", payload);

        setUsrData(data => (
          payload
        ));
        console.log("LoginForm SUBMITTED!");
        // Set isSubmitted to false.
        setIsSubmitted();
        // console.log("formData", formData);
        setFormData(() => initialState);
        setFormCmplt();

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

    if (isSubmitted) login();

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
    // Create array of props formData requires.
    const reqProps = [
      "username", "password"
    ];
    // Check if props are missing.
    const isValMsn = reqProps.some(val => (
      formData[val] === ""
    ));
    // If props are missing set invalidForm.
    if (isValMsn) {
      setFormErrMsg(() => "All fields must be complete!");
      setInvalidForm();
      setTimeout(setInvalidForm, 3000);
    }
    // Set isSubmitted to true if all props exist.
    else setIsSubmitted();
  }
  if (formCmplt) return <Redirect exact to="/" />;
  // image styles.
  const styles = {
    backgroundImage: `url(${image})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat"
  }
  return (
    <>
    <div className="LoginForm-bg-img" style={styles}>
    <h1 className="LoginForm-h1">Login</h1>
    <form onSubmit={handleSubmit} className="LoginForm">
      <div className="LoginForm-field">
        <label htmlFor="username">Username</label>
        <input
            type="text"
            id="username"
            onChange={handleChange}
            value={formData.username}
            name="username"
            placeholder="Type a username"
            autoComplete="username"></input>
      </div>
      <div className="LoginForm-field">
        <label htmlFor="password">Password</label>
        <input
            type="password"
            id="password"
            onChange={handleChange}
            value={formData.password}
            name="password"
            placeholder="Type a password"
            autoComplete="current-password"></input>
      </div>
      <div className="LoginForm-submit">
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
    </>
  );
}

export default LoginForm;