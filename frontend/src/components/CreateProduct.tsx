import { useState, useEffect } from 'react';
import { createProduct, getAllProducts } from './api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function CreateProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data:any = await getAllProducts();
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
    <div className="container mx-auto p-4 max-w-3xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Create Product</h2>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 flex items-center justify-center"
          disabled={creating}
        >
          {creating ? (
            <span className="loading loading-spinner loading-md"></span>
          ) : (
            'Create Product'
          )}
        </button>
      </form>

      <h3 className="text-2xl font-semibold mb-4">Existing Products</h3>
      {loading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <ul className="space-y-2">
          {products?.map((product: any) => (
            <li
              key={product.id}
              className="p-3 bg-gray-100 rounded-lg shadow-sm flex justify-between items-center"
            >
              <span className="font-medium">{product.name}</span>
              <span className="text-green-600 font-semibold">₦{product.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CreateProduct;