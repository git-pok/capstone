import { Route, Switch, Redirect } from 'react-router-dom';
import { useContext } from 'react';
import useLocalStorage from './hooks/useLocalStorage.js';
// import CoOrJobCard from './CoOrJobCard.js';
// import ContentCard from './ContentCard.js';
// import CompanyDetailsCard from './CompanyDetailsCard.js';
// import JobDetailsCard from './JobDetailsCard.js';
// import ProfileCard from './ProfileCard.js';
// import SearchBox from './SearchBox.js';
// import LogInForm from './LogInForm.js';
import RegisterForm from './RegisterForm.js';
import LoginForm from './LoginForm.js';
import Home from './Home.js';
// import UserProfileEditForm from './UserProfileEditForm.js';
// import SavourContext from './context/SavourContext.js';

const Routes = () => {

  const [ usrData, setUsrData ] = useLocalStorage("userData", null);
  const userToken = usrData ? usrData.token : null;
  console.log("userToken", userToken);
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
  );
}

export default Routes;
