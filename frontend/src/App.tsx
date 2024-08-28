import { BrowserRouter as Router, Route, Routes, Navigate, NavLink } from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';
import CreateProduct from './components/CreateProduct';
import MakeOrder from './components/MakeOrder';
import { useEffect, useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
      <div className="flex flex-col min-h-screen bg-gray-100 lg:flex-row">
        {/* Mobile menu button */}
        <button
          className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-blue-500 text-white rounded"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>

        {/* Sidebar */}
        <nav className={`w-64 bg-white shadow-md flex-shrink-0 fixed inset-y-0 left-0 z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition duration-200 ease-in-out overflow-y-auto`}>
          <div className="p-4 h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-4">Delivery App</h1>
            <ul className="flex-grow">
              <li className="mb-2">
                <NavLink 
                  to="/order" 
                  className={({ isActive }) => 
                    isActive ? "block p-2 bg-blue-500 text-white rounded" : "block p-2 hover:bg-gray-200 rounded"
                  }
                  onClick={() => setIsSidebarOpen(false)}
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
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Products
                </NavLink>
              </li>
            </ul>
            <button 
              onClick={handleLogout}
              className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors mt-auto"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-grow p-4 w-full lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/order" element={<MakeOrder />} />
              <Route path="/product" element={<CreateProduct />} />
              <Route path="*" element={<Navigate to="/order" replace />} />
            </Routes>
          </div>
        </main>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
      </div>
    </Router>
  );
}

export default App;














// import { BrowserRouter as Router, Route, Routes, Navigate, NavLink } from 'react-router-dom';
// import SignUp from './components/SignUp';
// import Login from './components/Login';
// import CreateProduct from './components/CreateProduct';
// import MakeOrder from './components/MakeOrder';
// import { useEffect, useState } from 'react';

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   useEffect(() => {
//     const token = sessionStorage.getItem("token");
//     setIsAuthenticated(!!token);
//   }, []);

//   const handleLogout = () => {
//     sessionStorage.removeItem("token");
//     setIsAuthenticated(false);
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   if (!isAuthenticated) {
//     return (
//       <Router>
//         <Routes>
//           <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
//           <Route path="/signup" element={<SignUp setIsAuthenticated={setIsAuthenticated} />} />
//           <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>
//       </Router>
//     );
//   }

//   return (
//     <Router>
//       <div className="flex flex-col min-h-screen bg-gray-100 lg:flex-row">
//         {/* Mobile menu button */}
//         <button
//           className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-blue-500 text-white rounded"
//           onClick={toggleSidebar}
//         >
//           {isSidebarOpen ? '✕' : '☰'}
//         </button>

//         {/* Sidebar */}
//         <nav className={`w-64 bg-white shadow-md flex-shrink-0 fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-10`}>
//           <div className="p-4 h-full flex flex-col">
//             <h1 className="text-2xl font-bold mb-4">Delivery App</h1>
//             <ul className="flex-grow">
//               <li className="mb-2">
//                 <NavLink 
//                   to="/order" 
//                   className={({ isActive }) => 
//                     isActive ? "block p-2 bg-blue-500 text-white rounded" : "block p-2 hover:bg-gray-200 rounded"
//                   }
//                   onClick={() => setIsSidebarOpen(false)}
//                 >
//                   Order
//                 </NavLink>
//               </li>
//               <li className="mb-2">
//                 <NavLink 
//                   to="/product" 
//                   className={({ isActive }) => 
//                     isActive ? "block p-2 bg-blue-500 text-white rounded" : "block p-2 hover:bg-gray-200 rounded"
//                   }
//                   onClick={() => setIsSidebarOpen(false)}
//                 >
//                   Products
//                 </NavLink>
//               </li>
//             </ul>
//             <button 
//               onClick={handleLogout}
//               className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors mt-auto"
//             >
//               Logout
//             </button>
//           </div>
//         </nav>

//         {/* Main content */}
//         <main className="flex-grow p-4 w-full lg:ml-64">
//           <div className="max-w-7xl mx-auto">
//             <Routes>
//               <Route path="/order" element={<MakeOrder />} />
//               <Route path="/product" element={<CreateProduct />} />
//               <Route path="*" element={<Navigate to="/order" replace />} />
//             </Routes>
//           </div>
//         </main>
//       </div>
//     </Router>
//   );
// }

// export default App;
