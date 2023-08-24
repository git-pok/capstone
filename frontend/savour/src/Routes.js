import { Route, Switch, Redirect } from 'react-router-dom';
import { useContext } from 'react';
import useLocalStorage from './hooks/useLocalStorage.js';
import RegisterForm from './RegisterForm.js';
import LoginForm from './LoginForm.js';
import Home from './Home.js';
import UserContext from './context/UserContext.js';

const Routes = () => {
  console.log("ROUTES RAN");

  // const [ usrData, setUsrData ] = useLocalStorage("userData", null);
  const { usrData, setUsrData } = useContext(UserContext);
  const userToken = usrData ? usrData.token : null;
  console.log("userToken ROUTES", userToken);
  // const context = useContext(UserContext);
  // const findJobApps = (data, id) => {
  //   const jobApps = data.indexOf(id);
  //   return jobApps === -1;
  // }

  return (
    <Switch>
      { userToken &&
        <Route exact path="/">
          <Home />
        </Route>
      }
      { !userToken &&
        <Route exact path="/signup">
          <RegisterForm />
        </Route>
      }
      { !userToken &&
        <Route exact path="/login">
          <LoginForm />
        </Route>
      }
      { userToken &&
        <Route exact path="/recipes">
          <h1>RECIPES</h1>
        </Route>
      }
      <Redirect exact to="/" />
    </Switch>
  );
}

export default Routes;
