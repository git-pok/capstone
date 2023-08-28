import { NavLink } from 'react-router-dom';
import useLocalStorage from './hooks/useLocalStorage.js';
import { useContext } from 'react';
import UserContext from './context/UserContext.js';
import './Navbar.css';
/**
 * Navbar
 * Creates Navbar
 * Props: linkNames, logOut
*/
const Navbar = ({ linkNames, logOut }) => {
  // const [ usrDataLs, setUsrDataLs ] = useLocalStorage("userData", null);
  const { usrData, setUsrData } = useContext(UserContext);
  const userToken = usrData ? usrData.token : null;
  console.log("LINK NAV usrData", usrData);
  const usrName = usrData ? usrData.userUsername.toUpperCase(): null;
  return (
    <nav className="Navbar">
      <div className="Navbar-left-links">
        <NavLink exact to="/">
          SAVOUR
        </NavLink>
      { userToken &&
        <span>
          WELCOME {usrName}!
        </span> 
      }
      </div>
      <div className="Navbar-right-links">
        { userToken &&
          linkNames.map(val => (
            <NavLink exact to={`${val[1]}`} key={val[0]}>
              {val[0].toUpperCase()}
            </NavLink>
          ))
        }
        { userToken
          ?
            <NavLink exact to="/login" onClick={logOut}>
              LOG OUT
            </NavLink>
          :
            <NavLink exact to="/login">
              LOG IN
            </NavLink>
        }
        { !userToken &&
          <NavLink exact to="/signup">
            SIGN UP
          </NavLink>
        }
      </div>
    </nav>
  );
}

export default Navbar;
