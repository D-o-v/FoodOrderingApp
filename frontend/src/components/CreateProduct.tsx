// import { useState, useEffect } from 'react';
// import { createProduct, getAllProducts } from './api';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';

// function CreateProduct() {
//   const [name, setName] = useState('');
//   const [price, setPrice] = useState('');
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const data:any = await getAllProducts();
//       setProducts(data);
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       if ((error as any).message.includes('Unauthorized')) {
//         navigate('/login');
//       }
//       toast.error('Failed to fetch products');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setCreating(true);
//       await createProduct({ name, price: parseFloat(price) });
//       toast.success('Product created successfully');
//       setName('');
//       setPrice('');
//       fetchProducts();
//     } catch (error) {
//       toast.error('Failed to create product');
//       if ((error as any).message.includes('Unauthorized')) {
//         navigate('/login');
//       }
//     } finally {
//       setCreating(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-4 max-w-3xl">
//       <h2 className="text-3xl font-bold mb-6 text-center">Create Product</h2>
//       <form onSubmit={handleSubmit} className="mb-8 space-y-4">
//         <input
//           type="text"
//           placeholder="Product Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <input
//           type="number"
//           placeholder="Price"
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <button
//           type="submit"
//           className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 flex items-center justify-center"
//           disabled={creating}
//         >
//           {creating ? (
//             <span className="loading loading-spinner loading-md"></span>
//           ) : (
//             'Create Product'
//           )}
//         </button>
//       </form>

//       <h3 className="text-2xl font-semibold mb-4">Existing Products</h3>
//       {loading ? (
//         <div className="flex justify-center">
//           <span className="loading loading-spinner loading-lg"></span>
//         </div>
//       ) : (
//         <ul className="space-y-2">
//           {products?.map((product: any) => (
//             <li
//               key={product.id}
//               className="p-3 bg-gray-100 rounded-lg shadow-sm flex justify-between items-center"
//             >
//               <span className="font-medium">{product.name}</span>
//               <span className="text-green-600 font-semibold">₦{product.price.toFixed(2)}</span>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

// export default CreateProduct;

















import { useState, useEffect } from 'react';
import { createProduct, getAllProducts, updateProduct, deleteProduct } from './api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '../contexts/ThemeContext';

function CreateProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data: any = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      if ((error as any).message.includes('Unauthorized')) {
        navigate('/login');
      }
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await createProduct({ name, price: parseFloat(price) });
      toast.success('Product created successfully');
      setName('');
      setPrice('');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to create product');
      if ((error as any).message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.toString());
  };

  const handleUpdate = async () => {
    try {
      await updateProduct(editingProduct._id, { 
        name: editName, 
        price: parseFloat(editPrice) 
      });
      toast.success('Product updated successfully');
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 to-white'
    }`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Create Product Form */}
          <div className={`rounded-2xl shadow-xl border p-6 transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gray-800/90 border-gray-700 backdrop-blur-lg'
              : 'bg-white/90 border-gray-200 backdrop-blur-lg'
          }`}>
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDarkMode
                    ? 'bg-blue-600'
                    : 'bg-blue-500'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Create Product</h2>
              </div>
              <p className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Add new items to your menu</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`} htmlFor="name">
                  Product Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                  }`}
                  required
                />
              </div>
              
              <div>
                <label className={`block font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`} htmlFor="price">
                  Price (₦)
                </label>
                <input
                  id="price"
                  type="number"
                  placeholder="Enter product price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`w-full p-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                  }`}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={creating || !name || !price}
                className={`w-full py-3 px-4 font-medium rounded-lg shadow-lg transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                }`}
              >
                {creating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Product'
                )}
              </button>
            </form>
          </div>

          {/* Product List */}
          <div className={`rounded-2xl shadow-xl border p-6 transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gray-800/90 border-gray-700 backdrop-blur-lg'
              : 'bg-white/90 border-gray-200 backdrop-blur-lg'
          }`}>
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDarkMode
                    ? 'bg-green-600'
                    : 'bg-green-500'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Existing Products</h2>
              </div>
              <p className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Manage your menu items</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${
                  isDarkMode ? 'border-blue-500' : 'border-blue-600'
                }`}></div>
              </div>
            ) : (
              <div className="space-y-4">
                {products?.length === 0 ? (
                  <p className={`text-center py-8 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>No products available yet</p>
                ) : (
                  products?.map((product: any) => (
                    <div 
                      key={product._id} 
                      className={`rounded-xl p-4 border transition-all duration-300 hover:shadow-lg ${
                        isDarkMode
                          ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/70'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {editingProduct?._id === product._id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className={`w-full p-2 border rounded-lg ${
                              isDarkMode
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className={`w-full p-2 border rounded-lg ${
                              isDarkMode
                                ? 'bg-gray-600 border-gray-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            step="0.01"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdate}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingProduct(null)}
                              className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className={`text-lg font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-800'
                            }`}>{product.name}</h3>
                            <p className={`font-medium text-xl mt-1 ${
                              isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`}>₦{product.price.toFixed(2)}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateProduct;