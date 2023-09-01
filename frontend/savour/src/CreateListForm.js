import { useContext, useState, useEffect } from 'react';
import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
import SavourApi from './models/SavourApi.js';
import useToggleState from './hooks/useToggleState.js';
import Message from './Message.js';
// import image from './img/ambient-kitchen.jpg';
import './CreateListForm.css';
/**
 * CreateListForm
 * CreateListForm Component
 * Props: recipelist, setState
 * Renders: renders form to create shop or recipe list.
*/
const CreateListForm = ({recipelist = false, recipeId, setState}) => {
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
    shoplistName: "", recipelistName: "", occasionId: ""
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
            : { recipe_id: +recipeId, list_name: formData.shoplistName }
        console.log("DATA", data);
        const listReq = await SavourApi.request("post", listUrl, data, {}, headers);
        console.log("listReq", listReq.data);
        setSuccMsg("Created list!");
        setFormReqMade();
        setIsFormReqSucc();
        setState(() => !isRecipeList ? [...listReq.data] : [{...listReq.data}]);
        setTimeout(setIsSubmitted, 3000);
        if (isRecipeList) setTimeout(setIsRecipeList, 3000);
        setTimeout(setFormReqMade, 3000);
        setTimeout(setIsFormReqSucc, 3000);
        setTimeout(() => setSuccMsg(null), 3000);
        setTimeout(() => setListUrl(null), 3000);
      } catch(err) {
        console.log("ERROR", err);
        const error = err.response.data.error.message;
        const isErrObj = typeof err.message === "object";
        const isErrorObj = typeof error === "object";
        const errMsg = isErrObj ? null : err.message;
        const errorMsg = isErrorObj ? null : error;
        setFormErrMsg(() => errorMsg || errMsg || "Error!");
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
    <div className="CreateListForm-div">
    {/* Shoppinglist form to create shoppinglist. */}
    { !recipelist
    // {/* Shoppinglist form to create shoppinglist. */}
      ?
        <form onSubmit={handleSubmit} className="CreateListForm-form">
          <div className="CreateListForm-form-field">
            <label htmlFor="shoplistName">List Name</label>
            <input
              id="shoplistName"
              type="text"
              name="shoplistName"
              placeholder="Type a list name"
              onChange={handleChange}
              value={formData.shoplistName} />
          </div>
          <div className="CreateListForm-form-submit">
            <button onClick={setReqUrl}>CREATE LIST</button>
          </div>
          <div className="CreateListForm-msg-div">
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
        // {/* Recipelist form to create recipelist. */}
        <form onSubmit={handleSubmit} className="CreateListForm-form">
          <div className="CreateListForm-form-field">
            <label htmlFor="recipelistName">List Name</label>
            <input
              id="recipelistName"
              type="text"
              name="recipelistName"
              placeholder="Type a recipelist name"
              onChange={handleChange}
              value={formData.recipelistName}></input>
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
          <div className="CreateListForm-form-submit">
            <button onClick={() => setReqUrl(false)}>CREATE LIST</button>
          </div>
          <div className="CreateListForm-msg-div">
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

export default CreateListForm;