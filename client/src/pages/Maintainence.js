import maintainence from '../components/maintainence.avif';
export default function Maintainence(){
    return(
        <div>
            <div className='landing-title'>We are under maintainence.</div>
            <div>Please come back later</div>
            <img src={maintainence} className='error-img'/>
        </div>
    );
}