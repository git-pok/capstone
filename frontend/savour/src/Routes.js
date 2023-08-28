import { Route, Switch, Redirect, useParams } from 'react-router-dom';
import { useContext } from 'react';
import useLocalStorage from './hooks/useLocalStorage.js';
import RegisterForm from './RegisterForm.js';
import LoginForm from './LoginForm.js';
import Home from './Home.js';
import Recipes from './Recipes.js';
import RecipeDetails from './RecipeDetails.js';
import DetailCardRow from './DetailCardRow.js';
import PageNotFound from './PageNotFound.js';
import Profile from './Profile.js';
import UserContext from './context/UserContext.js';

const Routes = () => {
  console.log("ROUTES RAN");

  // const [ usrData, setUsrData ] = useLocalStorage("userData", null);
  const { usrData, setUsrData } = useContext(UserContext);
  console.log("ROUTES usrData CONTEXT", usrData ? usrData : "NONE");
  const userToken = usrData ? usrData.token : null;
  console.log("userToken ROUTES", userToken);
  // const context = useContext(UserContext);
  // const findJobApps = (data, id) => {
  //   const jobApps = data.indexOf(id);
  //   return jobApps === -1;
  // }
  // let params = useParams();
  // console.log("params", params);

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
          <Recipes />
        </Route>
      }
      { userToken &&
        <Route exact path="/recipes/:id">
          <RecipeDetails />
        </Route>
      }
      { userToken &&
        <Route exact path="/users/:id">
          {/* <DetailCardRow /> */}
          <Profile />
        </Route>
      }
      { userToken &&
        <Route exact path="/page-not-found">
          <PageNotFound />
        </Route>
      }
      <Redirect exact to="/page-not-found" />
    </Switch>
  );
}

export default Routes;
