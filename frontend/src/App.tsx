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
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState('');
  const { isDarkMode, toggleTheme } = useTheme();

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
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-gray-50 to-white'
      }`}>
        {/* Mobile menu button */}
        <button
          className={`fixed top-6 left-6 z-50 md:hidden backdrop-blur-lg p-3 rounded-full shadow-lg border transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700/80'
              : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white/90'
          }`}
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
          <div className={`h-full backdrop-blur-xl border-r shadow-2xl p-6 flex flex-col overflow-y-auto transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gray-900/90 border-gray-700'
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h1 className={`text-2xl font-bold drop-shadow-md ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>FoodDelivery</h1>
              </div>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className={`mb-8 py-3 px-4 rounded-xl backdrop-blur-sm border transition-colors duration-300 ${
              isDarkMode
                ? 'bg-gray-800/50 border-gray-600'
                : 'bg-gray-100/80 border-gray-200'
            }`}>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Welcome,</div>
              <div className={`font-bold text-lg truncate ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{username}</div>
              <div className={`text-xs mt-1 uppercase tracking-wider ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>{userType} account</div>
            </div>
            
            <nav className="flex-1">
              <ul className="space-y-3">
                <li>
                  <NavLink
                    to="/order"
                    className={({ isActive }) =>
                      isActive 
                        ? `flex items-center p-3 rounded-xl shadow-md transition-all duration-300 transform ${
                            isDarkMode
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                          }`
                        : `flex items-center p-3 rounded-xl transition-all duration-300 ${
                            isDarkMode
                              ? 'hover:bg-gray-700 text-gray-200'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`
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
                            ? `flex items-center p-3 rounded-xl shadow-md transition-all duration-300 transform ${
                                isDarkMode
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                              }`
                            : `flex items-center p-3 rounded-xl transition-all duration-300 ${
                                isDarkMode
                                  ? 'hover:bg-gray-700 text-gray-200'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`
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
                            ? `flex items-center p-3 rounded-xl shadow-md transition-all duration-300 transform ${
                                isDarkMode
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                              }`
                            : `flex items-center p-3 rounded-xl transition-all duration-300 ${
                                isDarkMode
                                  ? 'hover:bg-gray-700 text-gray-200'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`
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
                            ? `flex items-center p-3 rounded-xl shadow-md transition-all duration-300 transform ${
                                isDarkMode
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                              }`
                            : `flex items-center p-3 rounded-xl transition-all duration-300 ${
                                isDarkMode
                                  ? 'hover:bg-gray-700 text-gray-200'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`
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
                            ? `flex items-center p-3 rounded-xl shadow-md transition-all duration-300 transform ${
                                isDarkMode
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                              }`
                            : `flex items-center p-3 rounded-xl transition-all duration-300 ${
                                isDarkMode
                                  ? 'hover:bg-gray-700 text-gray-200'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`
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
              className={`mt-6 w-full py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md flex items-center justify-center ${
                isDarkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500'
                  : 'bg-red-500 hover:bg-red-600 text-white border border-red-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
            
            <div className={`mt-8 text-xs text-center ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
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

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;