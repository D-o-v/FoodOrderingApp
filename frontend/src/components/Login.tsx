import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './api';
import { toast } from 'react-toastify';
import { encrypt } from './encrypt';

function Login({ setIsAuthenticated, setStoredUsername, setUserType }: any) {
  const [username, setUsername] = useState('');
  const [usernameEncrypted, setUsernameEncrypted] = useState({});
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { token, userType } = await login(username?.toLowerCase(), password);
      setUserType(userType);
      setStoredUsername(username?.toLowerCase());
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userType', userType);
      sessionStorage.setItem('username', usernameEncrypted as any)
      setIsAuthenticated(true);
      navigate('/order');
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUsernameEncrypted(encrypt(username?.toLowerCase()));
  }, [username]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 to-orange-600 p-6 flex items-center justify-center">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/20 rounded-2xl shadow-xl border border-white/30 p-8 transform transition-all">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white drop-shadow-md">Welcome Back</h2>
          <p className="text-white/80 mt-2">Log in to your account</p>
        </div>
  
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white font-medium mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/70 border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300"
            />
          </div>
  
          <div>
            <label className="block text-white font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/70 border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300"
            />
          </div>
  
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
          
          <div className="text-center mt-6">
            <a href="/signup" className="text-white hover:text-orange-100 transition-colors duration-300">
              Don't have an account? Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;