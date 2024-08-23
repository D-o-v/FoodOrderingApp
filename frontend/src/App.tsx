import { BrowserRouter as Router, Route, Routes, Navigate, NavLink } from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';
import CreateProduct from './components/CreateProduct';
import GetAllOrders from './components/GetAllOrders';
import MakeOrder from './components/MakeOrder';
import GetAll from './components/GetAll'

function App() {
  // This should be set to true when the user is authenticated
  const isAuthenticated = sessionStorage.getItem("token"); // Replace with actual authentication state

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <AuthenticatedApp />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

function AuthenticatedApp() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Delivery App</h1>
          <ul>
            <li className="mb-2">
              <NavLink 
                to="/make-order" 
                className={({ isActive }) => 
                  isActive ? "block p-2 bg-blue-500 text-white rounded" : "block p-2 hover:bg-gray-200 rounded"
                }
              >
                Make Order
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink 
                to="/create-product" 
                className={({ isActive }) => 
                  isActive ? "block p-2 bg-blue-500 text-white rounded" : "block p-2 hover:bg-gray-200 rounded"
                }
              >
                Create Product
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink 
                to="/all-orders" 
                className={({ isActive }) => 
                  isActive ? "block p-2 bg-blue-500 text-white rounded" : "block p-2 hover:bg-gray-200 rounded"
                }
              >
                All Orders
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink 
                to="/get-all" 
                className={({ isActive }) => 
                  isActive ? "block p-2 bg-blue-500 text-white rounded" : "block p-2 hover:bg-gray-200 rounded"
                }
              >
                Get All
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-4">
        <Routes>
          <Route path="/make-order" element={<MakeOrder />} />
          <Route path="/create-product" element={<CreateProduct />} />
          <Route path="/all-orders" element={<GetAllOrders />} />
          <Route path="/get-all" element={<GetAll />} />
          <Route path="*" element={<Navigate to="/make-order" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;