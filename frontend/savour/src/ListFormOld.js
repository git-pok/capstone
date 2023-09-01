import { useContext, useState, useEffect } from 'react';
import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
import SavourApi from './models/SavourApi.js';
import useToggleState from './hooks/useToggleState.js';
import Message from './Message.js';
// import image from './img/ambient-kitchen.jpg';
import './ListForm.css';
/**
 * ListForm
 * ListForm Component
 * Props: recipelist, setState
 * Renders: renders form to create shop or recipe list.
*/
const ListForm = ({recipelist = false, setState}) => {
  const { usrData, setUsrData } = useContext(UserContext);
  const headers = { _token: `Bearer ${usrData.token}`};

  const recipeOpts = { method: "get", url: `/recipes`, data: {}, params: {}, headers };
  const [ recipeData ] = useAxios(recipeOpts);

  const OccOpts = { method: "get", url: `/occasions`, data: {}, params: {}, headers };
  const [ occasionData ] = useAxios(OccOpts);

  const [ listUrl, setListUrl ] = useState(null);
  const [ isRecipeList, setIsRecipeList ] = useToggleState(false);
  const [ isSubmitted, setIsSubmitted ] = useToggleState(false);

  const initialState = {
    shoplistName: "", recipelistName: "",
    occasionId: "", recipeId: ""
  };

  const [ formData, setFormData ] = useState(initialState);
  const [ formReqMade, setFormReqMade ] = useToggleState(false);
  const [ formErrMsg, setFormErrMsg ] = useState(null);
  const [ succMsg, setSuccMsg ] = useState(null);
  const [ isFormReqSucc, setIsFormReqSucc ] = useToggleState(false);

  const setReqUrl = (shop=true) => {
    const userId = usrData.userId;
    // Check for occasion id from recipelist form data.
    const occId = formData.occasionId;
    if (!shop && occId === "") {
      setFormErrMsg("Must select occasion!");
      setFormReqMade();
      setTimeout(setFormReqMade, 3000);
      setTimeout(() => setFormErrMsg(null), 3000);
    } else {
      if (!shop) setListUrl(`/users/${userId}/recipelists`);
      if (!shop) setIsRecipeList();
      else setListUrl(`/users/${userId}/shoppinglists`);
      setIsSubmitted();
    }
  }

  useEffect(() => {
    const createList = async () => {
      try {

        const data = isRecipeList ?
            { occasion_id: +formData.occasionId, list_name: formData.recipelistName }
            : { recipe_id: +formData.recipeId, list_name: formData.shoplistName }
        const listReq = await SavourApi.request("post", listUrl, data, {}, headers);
        setSuccMsg("Created list!");
        setFormReqMade();
        setIsFormReqSucc();
        setState(() => ({ msg: "Action sent!" }));
        setTimeout(setIsSubmitted, 3000);
        if (isRecipeList) setTimeout(setIsRecipeList, 3000);
        setTimeout(setFormReqMade, 3000);
        setTimeout(setIsFormReqSucc, 3000);
        setTimeout(() => setSuccMsg(null), 3000);
        setTimeout(() => setListUrl(null), 3000);
      } catch(err) {
        const error = err.response.data.error.message;
        const isErrObj = typeof err === "object";
        const isErrorObj = typeof error === "object";
        const errMsg = isErrObj ? "Error!" : err;
        const errorMsg = isErrorObj ? "Error!" : error;
        setFormErrMsg(() => errMsg || errorMsg);
        setFormReqMade();
        setTimeout(setIsSubmitted, 3000);
        if (isRecipeList) setTimeout(setIsRecipeList, 3000);
        setTimeout(setFormReqMade, 3000);
        setTimeout(() => setFormErrMsg(null), 3000);
        setTimeout(() => setListUrl(null), 3000);
      }
    }

    if (isSubmitted) createList();
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
  }

  return (
    <>
    <div className="ListForm-div">
    {/* <div className="RecipeDetails-float-div-full"> */}
    { !recipelist
      ?
        <form onSubmit={handleSubmit} className="ListForm-form">
        <div className="ListForm-form-field">
          <label htmlFor="shoplistName">List Name</label>
          <input
            id="shoplistName"
            type="text"
            name="shoplistName"
            placeholder="Type a list name"
            onChange={handleChange}
            value={formData.shoplistName} />
        </div>
        <div className="ListForm-form-field">
          <label htmlFor="recipeId">Recipes</label>
          <select
            id="recipeId"
            name="recipeId"
            onChange={handleChange}
            value={formData.recipeId}>
            <option key="select-a-recipe" value="">Select a Recipe</option>
            { recipeData &&
              recipeData.map(recipe => (
                <option key={`${recipe.id}`} value={`${recipe.id}`}>{recipe.name}</option>
              ))
            }
          </select>
        </div>
        <div className="ListForm-form-submit">
          <button onClick={setReqUrl}>CREATE LIST</button>
        </div>
        <div className="ListForm-msg-div">
            { formReqMade &&
              <Message msgObj={
                {
                  class: isFormReqSucc ? "success" : "fail",
                  msg: isFormReqSucc ? succMsg : formErrMsg
                }
              } />
            }
          </div>
        </form>
      :
        <form onSubmit={handleSubmit} className="ListForm-form">
        <div className="ListForm-form-field">
          <label htmlFor="recipelistName">List Name</label>
          <input
            id="recipelistName"
            type="text"
            name="recipelistName"
            placeholder="Type a recipelist name"
            onChange={handleChange}
            value={formData.recipelistName}></input>
        </div>
        <div className="ListForm-form-field">
          <label htmlFor="occasionId">Recipelist Occasions</label>
          <select
            id="occasionId"
            name="occasionId"
            onChange={handleChange}
            value={formData.occasionId}>
            <option key="select-an-occ" value="">Select an Occasion</option>
            { occasionData &&
              occasionData.map(occasion => (
                <option key={`${occasion.id}`} value={`${occasion.id}`}>{occasion.occasion}</option>
              ))
            }
          </select>
        </div>
        <div className="ListForm-form-submit">
          <button onClick={() => setReqUrl(false)}>CREATE LIST</button>
        </div>
        <div className="ListForm-msg-div">
            { formReqMade &&
              <Message msgObj={
                {
                  class: isFormReqSucc ? "success" : "fail",
                  msg: isFormReqSucc ? succMsg : formErrMsg
                }
              } />
            }
          </div>
        </form>
      }
    </div>
    </>
  );
}

export default ListForm;