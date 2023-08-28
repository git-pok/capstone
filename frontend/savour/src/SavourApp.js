import './SavourApp.css';
import { Redirect, useHistory } from 'react-router-dom';
import { useContext } from 'react';
import Navbar from './Navbar.js';
import Routes from './Routes.js';
import useLocalStorage from './hooks/useLocalStorage.js';
import UserContext from './context/UserContext.js';
import useToggleState from './hooks/useToggleState';

const SavourApp = () => {
  console.log("SavourApp RAN");
  const [ isLoggedOut, setIsLoggedOut ] = useToggleState(false);
  const [ usrData, setUsrData ] = useLocalStorage("userData", null);
  const history = useHistory();

  const logOut = () => {
    window.localStorage.clear();
    setUsrData(() => null);
    history.push("/login");
  }
  const userLink = usrData ? `${usrData.userUsername}` : "";
  const linkNames = [
    ["recipes", "/recipes"], ["my recipes", "/my-recipes"],
    ["recipelists", "/recipelists"], ["favs", "/favs"],
    ["saved", "/saved"], ["profile", `/users/${userLink}`]
  ];

  return (
    <div className="SavourApp">
      <UserContext.Provider value={{usrData, setUsrData}}>
        <Navbar
          linkNames={linkNames}
          logOut={logOut} />
        <Routes />
      </UserContext.Provider>
    </div>
  );
}

export default SavourApp;
