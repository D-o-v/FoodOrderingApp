import { BrowserRouter as Router, Route, Routes, Navigate, NavLink } from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';
import CreateProduct from './components/CreateProduct';
import MakeOrder from './components/MakeOrder';
import { useEffect, useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/signup" element={<SignUp setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-md flex flex-col">
          <div className="p-4 flex-grow">
            <h1 className="text-2xl font-bold mb-4">Delivery App</h1>
            <ul>
              <li className="mb-2">
                <NavLink 
                  to="/order" 
                  className={({ isActive }) => 
                    isActive ? "block p-2 bg-blue-500 text-white rounded" : "block p-2 hover:bg-gray-200 rounded"
                  }
                >
                  Order
                </NavLink>
              </li>
              <li className="mb-2">
                <NavLink 
                  to="/product" 
                  className={({ isActive }) => 
                    isActive ? "block p-2 bg-blue-500 text-white rounded" : "block p-2 hover:bg-gray-200 rounded"
                  }
                >
                  Products
                </NavLink>
              </li>
              <li className="mb-2">
              <button 
              onClick={()=>handleLogout()}
              className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/order" element={<MakeOrder />} />
            <Route path="/product" element={<CreateProduct />} />
            <Route path="*" element={<Navigate to="/order" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;