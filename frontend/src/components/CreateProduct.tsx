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
import { createProduct, getAllProducts } from './api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function CreateProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 to-orange-600 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Create Product Form */}
          <div className="backdrop-blur-lg bg-white/20 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white drop-shadow-md">Create Product</h2>
              <p className="text-white/80 mt-1">Add new items to your menu</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-white font-medium mb-2" htmlFor="name">
                  Product Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2" htmlFor="price">
                  Price (₦)
                </label>
                <input
                  id="price"
                  type="number"
                  placeholder="Enter product price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={creating || !name || !price}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
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
          <div className="backdrop-blur-lg bg-white/20 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white drop-shadow-md">Existing Products</h2>
              <p className="text-white/80 mt-1">View all available menu items</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {products?.length === 0 ? (
                  <p className="text-white/80 col-span-2 text-center py-8">No products available yet</p>
                ) : (
                  products?.map((product: any) => (
                    <div 
                      key={product._id} 
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/30 transition-all duration-300 hover:shadow-lg hover:bg-white/20"
                    >
                      <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                      <p className="text-amber-200 font-medium text-xl mt-1">₦{product.price.toFixed(2)}</p>
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