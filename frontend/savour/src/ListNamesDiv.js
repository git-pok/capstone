import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAxios from './hooks/useAxios.js';
import UserContext from './context/UserContext.js';
import SavourApi from './models/SavourApi.js';
// import image from './img/ambient-kitchen.jpg';
import './ListNamesDiv.css';

/**
 * ListNamesDiv
 * ListNamesDiv Component
 * Props: urlEndpt, listTypeForH1, recipelist
 * Renders: lists like shopping or recipe lists
*/
const ListNamesDiv = ({urlEndpt, listTypeForH1 = "Shoppinglists's", recipelist = false}) => {
  const { usrData, setUsrData } = useContext(UserContext);
  const headers = { _token: `Bearer ${usrData.token}`};
  const listUrl = `/users/${usrData.userId}/${urlEndpt}`;
  const [ listData, setListData ] = useState(null);

  useEffect(() => {
    const getLists = async () => {
      const listReq = await SavourApi.request("get", listUrl, {}, {}, headers);
      setListData(() => listReq.data);
    }

    getLists();
  }, [listUrl])

  return (
    <>
    <h1 className="ListNamesDiv-h1">{`${usrData && usrData.userUsername}'s ${listTypeForH1}`}</h1>
    <div className="ListNamesDiv">
      <div className="ListNamesDiv-div">
        { listData &&
          listData.map(list => (
            <div key={list.id} className="ListNamesDiv-list-div">
              <Link exact="true" to={`/${urlEndpt}/${list.id}`}>
                <p>{list.list_name} {recipelist ? `for ${list.occasion}` : null}</p>
              </Link>
            </div>
          ))
        }
      </div>
    </div>
    </>
  );
}

export default ListNamesDiv;