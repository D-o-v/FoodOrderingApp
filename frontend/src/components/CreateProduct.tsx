import { useState, useEffect } from 'react';
import { createProduct, getAllProducts } from './api';
import { useNavigate } from 'react-router-dom';
import { toast} from 'react-toastify';

function CreateProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data: any = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      if ((error as any).message.includes('Unauthorized')) {
        navigate('/login');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Create Product</h2>
      <form onSubmit={handleSubmit} className="mb-8">
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">
          Create Product
        </button>
      </form>

      <h3 className="text-xl mb-4">Existing Products</h3>
      <ul>
        {products?.map((product: any) => (
          <li key={product.id} className="mb-2">
            {product.name} - ₦{product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CreateProduct;















// import { useState, useEffect } from 'react';
// import { createProduct, getAllProducts } from './api';

// function CreateProduct() {
//   const [name, setName] = useState('');
//   const [price, setPrice] = useState('');
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const data:any= await getAllProducts();
//       setProducts(data);
//     } catch (error) {
//       console.error('Error fetching products:', error);
//     }
//   };

//   const handleSubmit = async (e:any) => {
//     e.preventDefault();
//     try {
//       await createProduct({ name, price: parseFloat(price) });
//       alert('Product created successfully');
//       setName('');
//       setPrice('');
//       fetchProducts();
//     } catch (error) {
//       alert('Failed to create product');
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h2 className="text-2xl mb-4">Create Product</h2>
//       <form onSubmit={handleSubmit} className="mb-8">
//         <input
//           type="text"
//           placeholder="Product Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="w-full p-2 mb-4 border rounded"
//         />
//         <input
//           type="number"
//           placeholder="Price"
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           className="w-full p-2 mb-4 border rounded"
//         />
//         <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">
//           Create Product
//         </button>
//       </form>

//       <h3 className="text-xl mb-4">Existing Products</h3>
//       <ul>
//         {products?.map((product:any) => (
//           <li key={product.id} className="mb-2">
//             {product.name} - ${product.price}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default CreateProduct;