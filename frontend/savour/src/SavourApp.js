import './SavourApp.css';
import Routes from './Routes.js';

const SavourApp = () => {
  return (
    <div className="SavourApp">
      {/* <h1>SAVOUR APP</h1>
      <JoblyNavbar
        linkNames={["companies", "jobs", "profile"]}
        logOut={logOut} /> */}
      <Routes />
    </div>
  );
}

export default SavourApp;
