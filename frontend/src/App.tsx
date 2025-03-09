import { BrowserRouter as Router, Route, Routes, Navigate, NavLink } from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';
import CreateProduct from './components/CreateProduct';
import MakeOrder from './components/MakeOrder';
import AdminOrderManagement from './components/AdminOrderManagement';
import FeeManagement from './components/FeeManagement';
import UserManagement from './components/UserManagement';
import { useEffect, useState } from 'react';
import { decrypt } from './components/decrypt';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const storedUsername = sessionStorage.getItem("username") || '';
    const storedUserType = sessionStorage.getItem("userType") || '';
    const decryptedUsername = decrypt(storedUsername);
    setIsAuthenticated(!!token);
    setUsername(decryptedUsername);
    setUserType(storedUserType);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userType");
    setIsAuthenticated(false);
    setUsername('');
    setUserType('');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isAuthenticated || !username) {
    return (
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setStoredUsername={setUsername} setUserType={setUserType} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="bg-gradient-to-br from-orange-400 to-amber-600 min-h-screen">
        {/* Mobile menu button */}
        <button
          className="fixed top-6 left-6 z-50 md:hidden bg-white/20 backdrop-blur-lg p-3 rounded-full shadow-lg border border-white/30 text-white transition-all duration-300 hover:bg-white/30"
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
        >
          {isSidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Sidebar - Fixed on all screens */}
        <div
          className={`fixed top-0 left-0 h-full w-64 md:w-72 z-40 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="h-full backdrop-blur-xl bg-white/20 border-r border-white/30 shadow-2xl p-6 flex flex-col overflow-y-auto">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-md">FoodDelivery</h1>
            </div>
            
            <div className="mb-8 py-3 px-4 bg-white/30 rounded-xl backdrop-blur-sm border border-white/30">
              <div className="text-white/70 text-sm">Welcome,</div>
              <div className="text-white font-bold text-lg truncate">{username}</div>
              <div className="text-white/80 text-xs mt-1 uppercase tracking-wider">{userType} account</div>
            </div>
            
            <nav className="flex-1">
              <ul className="space-y-3">
                <li>
                  <NavLink
                    to="/order"
                    className={({ isActive }) =>
                      isActive 
                        ? "flex items-center p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-md transition-all duration-300 transform border border-white/20"
                        : "flex items-center p-3 hover:bg-white/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm"
                    }
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Order Food
                  </NavLink>
                </li>
                {userType === 'admin' && (
                  <>
                    <li>
                      <NavLink
                        to="/products"
                        className={({ isActive }) =>
                          isActive 
                            ? "flex items-center p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-md transition-all duration-300 transform border border-white/20"
                            : "flex items-center p-3 hover:bg-white/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm"
                        }
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Products Management
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                          isActive 
                            ? "flex items-center p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-md transition-all duration-300 transform border border-white/20"
                            : "flex items-center p-3 hover:bg-white/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm"
                        }
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Order Management
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/fee-management"
                        className={({ isActive }) =>
                          isActive 
                            ? "flex items-center p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-md transition-all duration-300 transform border border-white/20"
                            : "flex items-center p-3 hover:bg-white/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm"
                        }
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Fee Management
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/user-management"
                        className={({ isActive }) =>
                          isActive 
                            ? "flex items-center p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-md transition-all duration-300 transform border border-white/20"
                            : "flex items-center p-3 hover:bg-white/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm"
                        }
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        User Management
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>
            </nav>
            
            <button
              onClick={handleLogout}
              className="mt-6 w-full py-3 px-4 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm border border-white/30 shadow-md flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
            
            <div className="mt-8 text-xs text-white/50 text-center">
              FoodDelivery App © 2025
            </div>
          </div>
        </div>

        {/* Main content - Scrollable with margin to accommodate fixed sidebar */}
        <div className="md:ml-72 min-h-screen">
          <div className="p-4 md:p-8 min-h-screen overflow-y-auto">
            <Routes>
              <Route path="/order" element={<MakeOrder username={username} />} />
              {userType === 'admin' && (
                <>
                  <Route path="/products" element={<CreateProduct />} />
                  <Route path="/admin" element={<AdminOrderManagement />} />
                  <Route path="/fee-management" element={<FeeManagement />} />
                  <Route path="/user-management" element={<UserManagement />} />
                </>
              )}
              <Route path="*" element={<Navigate to="/order" />} />
            </Routes>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
      </div>
    </Router>
  );
}

export default App;