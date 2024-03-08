import error from '../components/error.png';
export default function Error(){
    return(
        <div>
            <div className='landing-title'>404. That's an error.</div>
            <div>I couldn't find what you're looking for</div>
            <img src={error} className='error-img'/>
        </div>
    );
}