import { useContext, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import UserContext from './context/UserContext.js';
import SavourApi from './models/SavourApi.js';
import RecipeContainer from './RecipeContainer.js';
import Message from './Message.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
          faSquarePlus, faSquareMinus, faRectangleXmark
        } from '@fortawesome/free-solid-svg-icons';
import useToggleState from './hooks/useToggleState.js';
// import image from './img/ambient-kitchen.jpg';
import './ListDetails.css';

/**
 * ListDetails
 * ListDetails Component
 * Props: urlEndpt, recipelist
 * Renders: detail components for shopping or recipe list.
*/
const ListDetails = ({urlEndpt, recipelist = false}) => {
  const { usrData, setUsrData } = useContext(UserContext);
  const headers = { _token: `Bearer ${usrData.token}`};
  const { id: listId } = useParams();
  const history = useHistory();
  const listUrl = `/users/${usrData.userId}/${urlEndpt}/${listId}`;

  const [ listData, setListData ] = useState(null);
  const [ isIngrAddBtn, setIsIngrAddBtn ] = useToggleState(false);
  const [ isIngrRmvBtn, setIsIngrRmvBtn ] = useToggleState(false);
  const [ isListDltBtn, setIsListDltBtn ] = useToggleState(false);
  const [ isAddActionCmplt, setIsAddActionCmplt ] = useToggleState(false);
  const [ isRmvActionCmplt, setIsRmvActionCmplt ] = useToggleState(false);
  const [ isLstDltActionCmplt, setIsLstDltActionCmplt ] = useToggleState(false);
  const [ isAddSucc, setIsAddSucc ] = useToggleState(false);
  const [ isRmvSucc, setIsRmvSucc ] = useToggleState(false);
  const [ formErrMsg, setFormErrMsg ] = useState(null);
  const [ succMsg, setSuccMsg ] = useState(null);
  const [ shoplistItems, setShoplistItems ] = useState(null); 
  // console.log("LIST DATA", listData);
  
  const addOrRmvItem = (itemsObj, add=true) => {
    if (add) setIsIngrAddBtn();
    else setIsIngrRmvBtn();
    setShoplistItems(() => ({
      ...itemsObj
    }));
  }

  const deleteList = () => {
    setIsListDltBtn();
  }

  useEffect(() => {
    const getLists = async () => {
      try {
        const listReq = await SavourApi.request("get", listUrl, {}, {}, headers);
        setListData(() => listReq.data);
      } catch(err) {
        console.log(`Error!\n${err}`);
      }
    }

    const addToList = async () => {
      try {
        const url = `${listUrl}/items`;
        const method = isIngrRmvBtn ? "delete" : "post";
        const listReq = await SavourApi.request(method, url, shoplistItems, {}, headers);
        // console.log("listReq LIST ADD", listReq.data);
        const msg = isIngrAddBtn ? "Added item to list!" : "Removed item from list!";
        setSuccMsg(() => msg);
        isIngrAddBtn ? setIsAddActionCmplt() : setIsRmvActionCmplt();
        isIngrAddBtn ? setIsAddSucc() : setIsRmvSucc();
        isIngrAddBtn ? setTimeout(setIsAddActionCmplt, 3000) : setTimeout(setIsRmvActionCmplt, 3000);
        isIngrAddBtn ? setTimeout(setIsAddSucc, 3000) : setTimeout(setIsRmvSucc, 3000);
        setTimeout(() => setSuccMsg(null), 3000);
        setTimeout(() => setShoplistItems(null), 3000);
        if (isIngrAddBtn) setTimeout(setIsIngrAddBtn, 3000);
        if (isIngrRmvBtn) setTimeout(setIsIngrRmvBtn, 3000);
      } catch (err) {
        const error = err.response.data.error.message;
        setFormErrMsg(() => error || "Error");
        isIngrAddBtn ? setIsAddActionCmplt() : setIsRmvActionCmplt();
        isIngrAddBtn ? setTimeout(setIsAddActionCmplt, 3000) : setTimeout(setIsRmvActionCmplt, 3000);
        setTimeout(() => setFormErrMsg(null), 3000);
        isIngrAddBtn ? setTimeout(setIsIngrAddBtn, 3000) : setTimeout(setIsIngrRmvBtn, 3000);
      }
    }

    const deleteList = async () => {
      try {
        const listReq = await SavourApi.request("delete", listUrl, {}, {}, headers);
        const msg = "Deleted list! Redirecting to shoppinglists!";
        setSuccMsg(() => msg);
        setIsLstDltActionCmplt();
        setIsRmvSucc();
        setTimeout(setIsLstDltActionCmplt, 3000);
        setTimeout(setIsRmvSucc, 3000);
        setTimeout(() => setSuccMsg(null), 3000);
        setTimeout(setIsListDltBtn, 3000);
        setTimeout(() => history.push("/shoppinglists"), 3000);
      } catch (err) {
        const error = err.response.data.error.message;
        setFormErrMsg(() => error || "Error");
        setTimeout(setIsLstDltActionCmplt, 3000);
        setTimeout(setIsListDltBtn, 3000);
        setTimeout(() => setFormErrMsg(null), 3000);
      }
    }

    if (listUrl) getLists();
    if (isIngrAddBtn || isIngrRmvBtn) addToList();
    if (isListDltBtn) deleteList();
  }, [listUrl, isIngrAddBtn, isIngrRmvBtn, isListDltBtn])

  return (
    <>
    { !recipelist ?
        <h1 className="ListDetails-h1">{`${listData && listData.list_name} List`}</h1>
      :
        <h1 className="ListDetails-h1">{`${listData && listData.list_name} for ${listData && listData.occasion}  Recipes`}</h1>
    }
    { listData && recipelist ?
      <div className="ListDetails">
        <div className="ListDetails-div">
          <RecipeContainer
            showHide={true}
            recipeArray={listData.recipes} />
        </div>
      </div>
      :
        null
    }
    { listData && !recipelist ?
        <div className="ListDetails-split-div">
          <div className="ListDetails-split-ul-div">
            <h2 className="ListDetails-subtitle">Recipe's Ingredients</h2>
            <ul className="ListDetails-ul">
              { listData.recipes_ingredients.map(ingrd => (
                <div key={`div-${ingrd.id}`} className="ListDetails-li-icon-div">
                  <li>{ingrd.qty}{ingrd.unit !== "no unit" ? ingrd.unit : null} {ingrd.ingredient}</li>
                  <FontAwesomeIcon
                    className="ListDetails-li-icon"
                    onClick={() => addOrRmvItem({qty: ingrd.qty, unit_id: ingrd.unit_id, ingredient_id: ingrd.ingredient_id})}
                    icon={faSquarePlus} />
                </div>
                ))
              }
            </ul>
            <div className="ListDetails-msg">
              {
                isAddActionCmplt &&
                  <Message msgObj={
                    {
                      class: isAddSucc ? "success" : "fail",
                      msg: isAddSucc ? succMsg : formErrMsg
                    }
                  } />
              }
            </div>
          </div>

          <div className="ListDetails-split-content-div">
            <h2 className="ListDetails-subtitle">List Name</h2>
            <p className="ListDetails-short-text">{listData.list_name}</p>

            <h2 className="ListDetails-subtitle">Recipe Name</h2>
            <p className="ListDetails-short-text">{listData.recipe_name}</p>

            <h2 className="ListDetails-subtitle">Recipe Author</h2>
            <p className="ListDetails-short-text">{listData.recipe_author}</p>
            <h2 className="ListDetails-subtitle">Delete Shoppinglist</h2>
            <FontAwesomeIcon
              className="ListDetails-icons"
              onClick={deleteList}
              icon={faRectangleXmark} />
            <div className="ListDetails-msg">
              {
                isLstDltActionCmplt &&
                  <Message msgObj={
                    {
                      class: isRmvSucc ? "success" : "fail",
                      msg: isRmvSucc ? succMsg : formErrMsg
                    }
                  } />
              }
            </div>
          </div> 
        </div>
      :
        null
    }
    { listData && !recipelist &&
      <h1 className="ListDetails-h1">Shoppinglist Items</h1>
    }

    { listData && !recipelist ?
      <div className="ListDetails">
        <div className="ListDetails-div">
          {
            !listData.list_items.length ?
              <h1>Add Items</h1>
            :
              <ul className="ListDetails-ul">
                { listData.list_items.map(item => (
                  <div key={`div-${item.id}`} className="ListDetails-li-icon-div">
                    <li key={`li-${item.id}`}>{item.qty || null}{item.unit !== "no unit" ? item.unit : null} {item.ingredient}</li>
                    <FontAwesomeIcon
                      className="ListDetails-li-icon"
                      onClick={() => addOrRmvItem({item_id: item.id}, false)}
                      icon={faSquareMinus} />
                  </div>
                ))}
              </ul>
          }
          <div className="ListDetails-msg">
            { isRmvActionCmplt &&
              <Message msgObj={
                {
                  class: isRmvSucc ? "success" : "fail",
                  msg: isRmvSucc ? succMsg : formErrMsg
                }
              } />
            }
          </div>
        </div>
      </div>
    :
      null
    }
    </>
  );
}

export default ListDetails;