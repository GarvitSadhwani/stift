import './App.css';
import {useState,useEffect} from 'react';
import Dashboard from './pages/Dashboard';
import Strategy from './pages/Strategy';
import {AiOutlineStock,AiOutlineGoogle } from 'react-icons/ai';
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom';
import Navbar from './navbar/Navbar';
import { googleLogout,useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Button } from 'antd';

function App() {
  const [ user, setUser ] = useState([]);
  const [ profile, setProfile ] = useState({});

  const login = useGoogleLogin({
      onSuccess: (codeResponse) => setUser(codeResponse),
      onError: (error) => console.log('Login Failed:', error)
  });

  useEffect(
      () => {
          if (user || localStorage.getItem('gat')) {
            let userAccessToken='';
            console.log("user: ",user);
            if(!localStorage.getItem('gat')){
              userAccessToken=user.access_token;
            }
            else{
              userAccessToken=localStorage.getItem('gat');
              console.log("local")
            }
            axios
              .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${userAccessToken}`, {
                  headers: {
                      Authorization: `Bearer ${userAccessToken}`,
                      Accept: 'application/json'
                  }
              })
                .then((res) => {
                  setProfile(res.data);
                  localStorage.setItem("gat",userAccessToken);
                  console.log("profile: ",res.data);
              })
              .catch((err) => {
                console.log(err);
                console.log("remove tok")
                setProfile(null);
                localStorage.removeItem('gat');
              });
          }
      },
      [ user ]
  );

  const logOut = () => {
      googleLogout();
      localStorage.removeItem('gat');
      setProfile(null);
  };
  
  return (
    <Router>
      <div className="App">
        {!profile && 
        <div>
          <div className='landing-title'>Stift<AiOutlineStock size={50}/></div>
          <p>Welcome to Stift! Here you can add strategies to filter NSE stocks.</p>
          <Button type='primary' ghost icon={<AiOutlineGoogle size={20}/>} onClick={login}>
            <span style={{position:'relative',bottom:'20%'}}>Sign in with Google</span>
          </Button>
          </div>
        }
        {profile && profile.hasOwnProperty('name') && <Navbar logOutFunc={logOut} profile={profile}/>}
        {profile && profile.hasOwnProperty('name') && <Routes>
            <Route path='/' exact element={<Dashboard profile={profile}/>}/>
            <Route path='/dashboard' element={<Dashboard profile={profile}/>}/>
            <Route path='/strategy' element={<Strategy profile={profile}/>}/>
          </Routes>}
      </div>
    </Router>
  );
}

export default App;
