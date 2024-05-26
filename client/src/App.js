import './App.css';
import {useState,useEffect, useCallback} from 'react';
import Dashboard from './pages/Dashboard';
import Strategy from './pages/Strategy';
import stift from './components/stift.png';
import {Route,Routes,useLocation} from 'react-router-dom';
import Navbar from './navbar/Navbar';
import Footer from './components/Footer';
import Error from './pages/Error';
import { googleLogout,useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Maintainence from './pages/Maintainence';
import {ToastContainer, toast, Flip } from 'react-toastify';
const config =require('./config/config');

function App() {
  const [ user, setUser ] = useState([]);
  const [ profile, setProfile ] = useState({});
  const [ rt, setRt] = useState('');
  const [ expiryTime, setExpiryTime]=useState(null);
  const location = useLocation();

  const login = useGoogleLogin({
    onSuccess: async ({ code }) => {
      await axios.post(config.API_PREFIX+'/googleauth', {  
        code,
      }).then((tokens)=>{
        setUser(tokens.data);
      })
      .catch((err)=>{
        toast.info(`Stift is under maintainence, please try again later`, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          theme: "light",
           transition: Flip,
          });
      });
      
    },
    onError: ()=>{
      toast.info(`Stift is under maintainence, please try again later`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        theme: "light",
        transition: Flip,
        });
    },
    flow: 'auth-code'
  });

  const reLogin=useCallback(()=>{
    if(rt!==''){
      axios.post(config.API_PREFIX+'/googleauth-refresh', {  
        refreshToken:rt
      }).then((tokens)=>{
        setUser(tokens.data);
        setRt(tokens.data.refresh_token);
        setExpiryTime(tokens.data.expiry_date/1000);
      })
      .catch((err)=>{
        logOut();
      });
    }
    else{
      logOut();
    }
  },[rt]);

  useEffect(
      () => {
          const checkTokenExpiry = () => {
            if (!localStorage.getItem('gat') || !expiryTime) return;
            const now = new Date().getTime() / 1000;
            if (expiryTime < now) {
              reLogin();
            }
          };
      
          const tokenExpiryTimer = setInterval(checkTokenExpiry, 60000); 
      
          checkTokenExpiry();
          if (user || (localStorage.getItem('gat') && localStorage.getItem('git'))) {
            let userAccessToken='';
            let userIdToken='';
            if(!localStorage.getItem('gat')){ 
              userAccessToken=user.access_token;
              userIdToken=user.id_token;
              setRt(user.refresh_token);
              setExpiryTime(user.expiry_date/1000);
            }
            else{
              userAccessToken=localStorage.getItem('gat');
              userIdToken=localStorage.getItem('git');
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
                localStorage.setItem("git",userIdToken);
              })
              .catch((err) => {
                logOut();
              });
          }
          return () => clearInterval(tokenExpiryTimer);
      },
      [ user, rt, expiryTime, reLogin ]
  );

  const logOut = () => {
      googleLogout();
      localStorage.removeItem('gat');
      localStorage.removeItem('git');
      setProfile(null);
  };
  
  return (
      <div className="App">
        {!profile && 
        <div className='landing-container'>
          <div className='landing-title'><img src={stift} alt='logo' height={'100px'}/></div>
          <div>
          <p className='landing-desc'><span style={{fontSize:'20px'}}>Welcome!</span><br/><br/>Stift offers customizable stock screening for the BSE, providing tailored results promptly. With advanced encryption, stringent security measures, and an intuitive interface, it ensures data protection while simplifying stock selection for both seasoned investors and newcomers. Ready to explore more?</p>
          <button className="gsi-material-button" onClick={login}>
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xlink="http://www.w3.org/1999/xlink" style={{display: 'block'}}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">Sign in with Google</span>
              <span style={{display: 'none'}}>Sign in with Google</span>
            </div>
          </button>
          </div>
          
          </div>
        }
        {profile && profile.hasOwnProperty('name') && <div>
          <Navbar logOutFunc={logOut} profile={profile}/>
          <Routes>
            <Route path='/' exact element={<Dashboard profile={profile} logOutFunc={logOut}/>}/>
            <Route path='/dashboard' element={<Dashboard profile={profile} logOutFunc={logOut}/>}/>
            <Route path='/strategy' element={<Strategy profile={profile} logOutFunc={logOut}/>}/>
            <Route path='/maintainence' element={<Maintainence/>}/>
            <Route path='/*' element={<Error/>}/>
          </Routes>
        </div>}
        <ToastContainer
                transition= {Flip}
                position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        {(location.pathname!=='/strategy' || window.screenWidth>=768) && <Footer/>}
      </div>
  );
}

export default App;
