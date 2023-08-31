import { useContext, useState, useEffect } from 'react';
import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
import SavourApi from './models/SavourApi.js';
import useToggleState from './hooks/useToggleState.js';
// import image from './img/ambient-kitchen.jpg';
import './ListForm.css';
/**
 * THIS COMPONENT IS NOT DONE YET,
 * IT IS STILL BEING BUILT.
 */
/**
 * ListForm
 * ListForm Component
 * Props: recipelist, setState
 * Renders: renders form to create shop or recipe list.
*/
const ListForm = ({recipelist = false, setState}) => {
  const { usrData, setUsrData } = useContext(UserContext);
  const headers = { _token: `Bearer ${usrData.token}`};
  // const listUrl = `/users/${usrData.userId}/${urlEndpt}`;
  const OccOpts = { method: "get", url: `/occasions`, data: {}, params: {}, headers };
  const [ occasionData ] = useAxios(OccOpts);
  // console.log("occasionData", occasionData);
  const [ listUrl, setListUrl ] = useState(null);
  const [ isRecipeList, setIsRecipeList ] = useToggleState(false);
  // const [ reqBody, setReqBody ] = useState(null);

  const [ isSubmitted, setIsSubmitted ] = useToggleState(false);
  const initialState = {
    shoplistName: "", recipelistName: "",
    occasionId: ""
  };
  const [ formData, setFormData ] = useState(initialState);
  // console.log("listData", listData);

  const setReqUrl = (shop=true) => {
    const userId = usrData.userId;
    if (!shop) setListUrl(`/users/${userId}/recipelists`);
    if (!shop) setIsRecipeList();
    else setListUrl(`/users/${userId}/shoppinglists`);
    // console.log("listUrl", listUrl);
    setIsSubmitted();
  }

  useEffect(() => {
    const createList = async () => {
      const data = isRecipeList ?
          { occasion_id: +formData.occasionId, list_name: formData.recipelistName }
          : { recipe_id: "", list_name: formData.shoplistName }
      // console.log("data", data);
      // console.log("listUrl", listUrl);
      // console.log("isRecipeList", isRecipeList);
      const listReq = await SavourApi.request("post", listUrl, data, {}, headers);
      // console.log("listReq", listReq);
      setState();
      setTimeout(setIsSubmitted, 3000);
      if (isRecipeList) setTimeout(setIsRecipeList, 3000);
      setTimeout(() => setListUrl(null), 3000);
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
    // Create array of props formData requires.
    // const reqProps = [
    //   "username", "first_name", "last_name",
    //   "email", "phone", "password"
    // ];
    // Check if props are missing.
    // const isValMsn = reqProps.some(val => (
    //   formData[val] === ""
    // ));
    // If props are missing set invalidForm.
    // if (isValMsn) {
    //   setFormErrMsg(() => "All fields must be complete!");
    //   setInvalidForm();
    //   setTimeout(setInvalidForm, 3000);
    // }
    // Set isSubmitted to true if all props exist.
    // else setIsSubmitted();
    // setIsSubmitted();
  }

  return (
    <>
    {/* <h1 className="RecipeDetails-h1">Add Recipe To A List</h1> */}
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
        <div className="ListForm-form-submit">
          <div className="ListForm-msg-div">
            {/* { formReqMade && isShopList &&
              <Message msgObj={
                {
                  class: reqMadeSucc ? "success" : "fail",
                  msg: reqMadeSucc ? succMsg : formErrMsg
                }
              } />
            } */}
          </div>
            <button onClick={setReqUrl}>ADD TO LIST</button>
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
          <div className="ListForm-msg-div">
            {/* { formReqMade && !isShopList &&
              <Message msgObj={
                {
                  class: reqMadeSucc ? "success" : "fail",
                  msg: reqMadeSucc ? succMsg : formErrMsg
                }
              } />
            } */}
          </div>
            <button onClick={() => setReqUrl(false)}>ADD TO LIST</button>
        </div>
        </form>
      }
    </div>
    </>
  );
}

export default ListForm;