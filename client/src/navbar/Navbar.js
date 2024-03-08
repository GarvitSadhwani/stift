import {Button} from 'antd';
import {AiOutlineStock} from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

function Navbar(props){
    const {logOutFunc,profile}=props;
    const navigate=useNavigate();
    return(
        <div className="navbar-container">
            <div className='navbar-title' onClick={()=>{navigate('/')}} style={{cursor:'pointer'}}>Stift<AiOutlineStock size={25}/></div>
            <div style={{margin:'auto',height:'40px',marginRight:'10px',display:'flex'}} >
            <div className="navbar-user">Hi, {profile.given_name}!</div>
            <Button style={{margin:'auto',height:'40px'}} onClick={logOutFunc}>
                <div style={{display:'flex',alignContent:'center'}}>
                <img src={profile.picture} style={{height:'30px',borderRadius:'50%',paddingBottom:'5px'}} alt='profile'/>
                <div style={{marginLeft:'10px',marginTop:'3px'}}>Logout</div>
                </div>
            </Button>
            </div>
            
        </div>
    );
}

export default Navbar;