import React ,{useState} from 'react';
import { auth,db} from '../components/firebase';
import logo2 from '../assets/images/HomePageIcons/logo2.png'
import googleIcon from '../assets/images/LoginPageIcons/google_img.png'
import {Link} from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth';
import {Navigate, useNavigate} from 'react-router-dom'
import { doc,getDoc} from 'firebase/firestore';


const Login = () => {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const navigate= useNavigate();

  const handleSubmit = async (e)=>{
    e.preventDefault();
    try {
      const userCredentials = await signInWithEmailAndPassword(auth,email,password);
      const user = userCredentials.user;

      //check in parents collection
      const parentDocRef=doc(db,'Parents',user.uid);
      const parentDoc=await getDoc(parentDocRef);

      if(parentDoc.exists()){
        navigate('/parent-dashboard')
      }
      else{
        //check in students collection
        const studentDocRef=doc(db,'Students',user.uid);
        const studentDoc=await getDoc(studentDocRef);

        if(studentDoc.exists()){
          navigate('/home');
        }else {
          console.log("No such user document in both collections!");
        }
      }
      console.log("user logged in successfully")
      //Replace this with Navigate
      Navigate("/Home")

      //Add login alert
      
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg pl-8 pr-8 pb-8 w-full max-w-md">
        
        <div className="flex justify-center">
            <img src={logo2} alt="" className="w-[160px]"/>
        </div>
        <h2 className="text-2xl font-bold text-center mb-8">
          Log in to your Account
        </h2>
        
        {/* Google Login Button */}
        <button className="flex items-center justify-center w-full bg-gray-100 text-semibold
        py-2 px-4 shadow-custom-dark rounded-lg mb-8">
          <img src={googleIcon} alt="" className="w-8 mr-2" />
          Continue with Google
        </button>
        
        <form onSubmit={handleSubmit}>
          {/* User Email Input */}
          <label className="block text-gray-700 text-sm font-bold mb-2">User Email</label>
          <input 
            className="w-full bg-blue-100 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 mb-4" 
            type="email" 
            placeholder="Enter Your Email" 
            value={email}
            onChange={(e)=> setEmail(e.target.value)}
          />
        
          {/* Password Input */}
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input 
            className="w-full bg-blue-100 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 mb-1" 
            type="password" 
            placeholder="Enter Your Password" 
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
        
          {/* Error Message */}
          <p className="text-red-500 text-sm italic text-right hidden">
            *Incorrect Username or Password
          </p>
        
          {/* Log In Button */}
          <button type='submit' className="w-full bg-blue-700 text-white mt-6 py-2 px-4 rounded-lg mb-4 
          hover:bg-blue-800">
            Log in
          </button>
          </form>

          {/*Add Another form for below buttons */}


          {/* Links */}
          <div className="flex justify-between text-sm text-blue-500">
            <p> <Link to='/register' className="hover:underline">Create a new account</Link> </p>
            <a href="#" className="hover:underline">Forgot Password</a>
          </div>
        
      </div>
    </div>
  );
}

export default Login;
