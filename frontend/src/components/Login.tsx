import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from './api';
import { toast } from 'react-toastify';
import { encrypt } from './encrypt';

function Login({ setIsAuthenticated ,setStoredUsername,setUserType}:any) {
  const [username, setUsername] = useState('');
  const [usernameEncrypted, setUsernameEncrypted] = useState<any>({});
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { token,userType } = await login(username, password);
      setUserType(userType);
      setStoredUsername(username);
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userType', userType);
      sessionStorage.setItem('username', usernameEncrypted)
      setIsAuthenticated(true);
      navigate('/order');
    } catch (error:any) {
      toast.error(error.message||"Login failed");
    }finally{
      setLoading(false);
    }
  };
  useEffect(() => {
    setUsernameEncrypted(encrypt(username));
  }, [username]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md">
          <h2 className="text-2xl mb-4">Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
           {loading?<span className="loading loading-spinner loading-md"></span>:" Login"}
          </button>
          <p className="mt-4">
            Don't have an account? <Link to="/signup" className="text-blue-500">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;