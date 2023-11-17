import './App.css';
import {useState} from 'react';
import Dashboard from './pages/Dashboard'

function App() {
  const [loggedIn,setLoggedIn]=useState(true);
  return (
    <div className="App">
      {!loggedIn && 
      <div>
        Welcome to Stift
        <button  onClick={()=>{setLoggedIn(true);}}>Log in!</button>
        </div>
      }
      {loggedIn && <Dashboard/>}
    </div>
  );
}

export default App;
