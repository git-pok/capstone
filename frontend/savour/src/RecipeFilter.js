import { useState, useEffect, useContext } from 'react';
// import { Redirect } from 'react-router-dom';
import Message from './Message.js';
import SavourApi from './models/SavourApi.js';
// import useLocalStorage from './hooks/useLocalStorage.js';
import useToggleState from './hooks/useToggleState.js';
// import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import './RecipeFilter.css';

/**
 * RecipeFilter
 * Recipe Filter Component
 * Props: none
*/
const RecipeFilter = ({ setState }) => {
  const { usrData, setUsrData } = useContext(UserContext);
  
  const headers = { _token: `Bearer ${usrData.token}`};
  const initialState = {
    subCategory: "", name: "", author: "",
    rating: "", orderBy: "", orderBy2: "",
    chronOrder: ""
  };
  
  const [ formData, setFormData ] = useState(initialState);
  const [ formErrMsg, setFormErrMsg ] = useState(null);
  const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  const [ invalidForm, setInvalidForm ] = useToggleState(false);
  const [ isFilter, setIsFilter ] = useToggleState(false);

  const toggleFilter = (() => {
    setIsFilter();
  });

  useEffect(() => {
    const filterRecipes = async () => {

      try {
        const { 
          subCategory = "", name = "", author = "",
          rating = "", orderBy = "", orderBy2 = "",
          chronOrder = ""
        } = formData;
        const formDataArr = Object.entries(formData);
        console.log("FORM VALUES", subCategory, name, author, rating, orderBy, orderBy2, chronOrder);
        console.log("formDataArr", formDataArr);
        // const {
        //   subCategory
        // } = formData;
        const recipesFltrParams = {};
        formDataArr.forEach(prop => {
          if (prop[1] !== "") recipesFltrParams[prop[0]] = prop[1]; 
        })
        console.log("recipesFltrParams", recipesFltrParams);
        // const recipesFltrParams = {
        //   subCategory, name, author, rating, orderBy,
        //   orderBy2, chronOrder
        // };
        const req = await SavourApi.request("get", "/recipes", {}, recipesFltrParams, headers);
        console.log("$#$#$#$#$#$#$#$#$#$#$$#$#$# FLTR Req Result", req);

        setState(() => (
          req.data
        ));
        console.log("RegisterForm SUBMITTED!");
        // Set isSubmitted to false.
        setIsSubmitted();
        // console.log("formData", formData);
        // setFormData(() => initialState);

      } catch (err) {
        console.log("ERROR", err);
        const error = err.response.data.error.message;
        setFormErrMsg(() => error || "Error");
        setInvalidForm();
        setTimeout(setInvalidForm, 3000);
        // Set isSubmitted to false.
        setTimeout(setIsSubmitted, 3000);
      }
    }

    if (isSubmitted) filterRecipes();

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
    // Set isSubmitted to true.
    setIsSubmitted();
  }

  return (
    <>
      <FontAwesomeIcon
      icon={faMagnifyingGlass}
      className="RecipeFilter-filter-ico"
      onClick={toggleFilter} />
    <div className="RecipeFilter-filter">
    { isFilter &&
      <form onSubmit={handleSubmit} className="RecipeFilter-form">
        <div className="RecipeFilter-form-field">
          <label htmlFor="subCategory">Sub Category</label>
          <input
            type="text"
            id="subCategory"
            onChange={handleChange}
            value={formData.subCategory}
            name="subCategory"
            placeholder="Type a sub category"></input>
        </div>
        <div className="RecipeFilter-form-field">
          <label htmlFor="name">Recipe Name</label>
          <input
              type="text"
              id="name"
              onChange={handleChange}
              value={formData.name}
              name="name"
              placeholder="Type a recipe name"></input>
        </div>
        <div className="RecipeFilter-form-field">
          <label htmlFor="author">Author</label>
          <input
              type="text"
              id="author"
              onChange={handleChange}
              value={formData.author}
              name="author"
              placeholder="Type a recipe author"></input>
        </div>
        <div className="RecipeFilter-form-field">
          <label htmlFor="rating">Rating</label>
          <input
              type="number"
              id="rating"
              onChange={handleChange}
              value={formData.rating}
              name="rating"
              placeholder="Type a recipe rating"></input>
        </div>
        <div className="RecipeFilter-form-field">
          <label htmlFor="orderBy">Order By</label>
          <input
              type="text"
              id="orderBy"
              onChange={handleChange}
              value={formData.orderBy}
              name="orderBy"
              placeholder="Type a order by"></input>
        </div>
        <div className="RecipeFilter-form-field">
          <label htmlFor="rating">Order By 2</label>
          <input
              type="text"
              id="orderBy2"
              onChange={handleChange}
              value={formData.orderBy2}
              name="orderBy2"
              placeholder="Type an order by"></input>
        </div>
        <div className="RecipeFilter-form-field">
          <label htmlFor="chronOrder">Chronological Order</label>
          <input
              type="text"
              id="chronOrder"
              onChange={handleChange}
              value={formData.chronOrder}
              name="chronOrder"
              placeholder="Type a chron order"></input>
        </div>
        <div className="RecipeFilter-form-submit">
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
    }
    </div>
    </>
  );
}

export default RecipeFilter;