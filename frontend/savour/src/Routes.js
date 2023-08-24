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
    // <UserContext.Provider value={{usrData, setUsrData}}>
    <Switch>
      {/* <Route exact path="/">
        <Home />
      </Route> */}
      {/* <Route exact path="/login">
        <LoginForm />
      </Route> */}
      { userToken &&
        <Route exact path="/">
          <Home />
        </Route>
      }
      {/* <Route exact path="/logout">
        <Redirect exact to="/" />
      </Route> */}
    {/* { !userToken &&
      <Route exact path="/signup">
        <SignupForm />
      </Route>
    } */}
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
      {
        <Route exact path="/logout">
        </Route>
      }
    {/* { userToken &&
      <Route exact path="/companies">
        <SearchBox />
        <CoOrJobCard
          data={companies}
          title="Companies" />
      </Route>
    } */}
    {/* { userToken &&
      <Route exact path="/jobs">
        <CoOrJobCard
          data={jobs}
          title="Jobs"
          jobs={true} />
      </Route>
    }
    { userToken &&
      <Route exact path="/profile">
        <ProfileCard />
      </Route>
    }
    { userToken &&
      <Route exact path="/companies/:handle">
        <CompanyDetailsCard findJobApps={findJobApps} />
      </Route>
    }
    { userToken &&
      <Route exact path="/jobs/:id">
        <JobDetailsCard findJobApps={findJobApps} />
      </Route>
    }
    { userToken &&
      <Route exact path="/users/:username">

      </Route>
    }
    { userToken &&
      <Route exact path="/users/:username/edit">
        <UserProfileEditForm />
      </Route>
    } */}
      <Redirect exact to="/" />
    </Switch>
    // </UserContext.Provider>
  );
}

export default Routes;
