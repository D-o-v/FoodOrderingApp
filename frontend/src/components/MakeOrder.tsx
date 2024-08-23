import { useState, useEffect } from 'react';
import { getAllProducts, createOrder, getOrdersByDate } from './api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface OrderProduct {
  product: Product;
  quantity: number;
}

interface Order {
  _id: string;
  user: {
    username: string;
  };
  products: OrderProduct[];
  total: number;
  date: string;
}

function MakeOrder() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [selectedDate]);

  const fetchProducts = async () => {
    try {
      const data: any[] = await getAllProducts();
      setProducts(data);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      if (error.message.includes('Unauthorized')) {
        navigate('/login');
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const data: Order[] = await getOrdersByDate(selectedDate);
      setOrders(data);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const handleQuantityChange = (productId: string, change: number) => {
    setSelectedProducts((prev) => {
      const newQuantity = (prev[productId] || 0) + change;
      if (newQuantity <= 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQuantity };
    });
  };

  useEffect(() => {
    const newTotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]) => {
      const product = products.find((p) => p._id === productId);
      return sum + (product ? product.price * quantity : 0);
    }, 0);
    setTotal(newTotal);
  }, [selectedProducts, products]);

  const handleCheckout = async () => {
    try {
      const productsArray = Object.entries(selectedProducts).map(([productId, quantity]) => ({
        product: productId,
        quantity,
      }));

      await createOrder({ products: productsArray, total });
      toast.success('Order created successfully');
      setSelectedProducts({});
      fetchOrders(); // Refresh orders after creating a new one
    } catch (error: any) {
      toast.error('Failed to create order');
      if (error.message.includes('Unauthorized')) {
        navigate('/login');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Make Order</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl mb-4">Available Products</h3>
          <ul>
            {products?.map((product) => (
              <li key={product?._id} className="mb-2 flex items-center justify-between">
                <span>
                  {product?.name} - ${product?.price}
                </span>
                <div>
                  <button
                    onClick={() => handleQuantityChange(product._id, -1)}
                    className="px-2 py-1 bg-red-500 text-white rounded mr-2"
                  >
                    -
                  </button>
                  <span>{selectedProducts[product?._id] || 0}</span>
                  <button
                    onClick={() => handleQuantityChange(product?._id, 1)}
                    className="px-2 py-1 bg-green-500 text-white rounded ml-2"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl mb-4">Selected Products</h3>
          <ul>
            {Object.entries(selectedProducts).map(([productId, quantity]) => {
              const product = products.find((p) => p._id === productId);
              return product ? (
                <li key={productId} className="mb-2">
                  {product?.name} - Quantity: {quantity} - Subtotal: ${product?.price * quantity}
                </li>
              ) : null;
            })}
          </ul>
          <p className="text-xl mt-4">Total: ${total.toFixed(2)}</p>
          <button
            onClick={handleCheckout}
            className="w-full p-2 bg-blue-500 text-white rounded mt-4"
          >
            Checkout
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl mb-4">Orders by Date</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mb-4 p-2 border rounded"
        />
        <ul>
          {orders?.map((order) => (
            <li key={order._id} className="mb-4 p-4 border rounded">
              <p className="font-bold">Username: {order?.user?.username}</p>
              <ul className="ml-4">
                {order?.products.map((product, index) => (
                  <li key={index}>
                    {product?.product?.name} - x {product?.quantity} - Price: ${product?.product?.price}
                  </li>
                ))}
              </ul>
              <p className="mt-2">Total: ${order?.total.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MakeOrder;


















// import { useState, useEffect } from 'react';
// import { getAllProducts, createOrder } from './api';
// import { useNavigate } from 'react-router-dom';

// function MakeOrder() {
//   const [products, setProducts] = useState([]);
//   const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
//   const [total, setTotal] = useState(0);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const data:any = await getAllProducts();
//       setProducts(data);
//     } catch (error: any) {
//       console.error('Error fetching products:', error);
//       if (error.message.includes('Unauthorized')) {
//         navigate('/login');
//       }
//     }
//   };

//   const handleQuantityChange = (productId: string, change: number) => {
//     setSelectedProducts((prev) => {
//       const newQuantity = (prev[productId] || 0) + change;
//       if (newQuantity <= 0) {
//         const { [productId]: removed, ...rest } = prev;
//         return rest;
//       }
//       return { ...prev, [productId]: newQuantity };
//     });
//   };

//   useEffect(() => {
//     const newTotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]) => {
//       const product:any = products.find((p: any) => p.id === productId);
//       return sum + (product ? product.price * quantity : 0);
//     }, 0);
//     setTotal(newTotal);
//   }, [selectedProducts, products]);

//   // const handleCheckout = async () => {
//   //   try {
//   //     await createOrder({ products: selectedProducts, total });
//   //     alert('Order created successfully');
//   //     setSelectedProducts({});
//   //   } catch (error: any) {
//   //     alert('Failed to create order');
//   //     if (error.message.includes('Unauthorized')) {
//   //       navigate('/login');
//   //     }
//   //   }
//   // };
//   const handleCheckout = async () => {
//     try {
//       const productsArray = Object.entries(selectedProducts).map(([productId, quantity]) => ({
//         productId,
//         quantity,
//       }));
  
//       await createOrder({ products: productsArray, total });
//       alert('Order created successfully');
//       setSelectedProducts({});
//     } catch (error: any) {
//       alert('Failed to create order');
//       if (error.message.includes('Unauthorized')) {
//         navigate('/login');
//       }
//     }
//   };
  

//   return (
//     <div className="container mx-auto p-4">
//       <h2 className="text-2xl mb-4">Make Order</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <h3 className="text-xl mb-4">Available Products</h3>
//           <ul>
//             {products?.map((product: any) => (
//               <li key={product?.id} className="mb-2 flex items-center justify-between">
//                 <span>{product?.name} - ${product.price}</span>
//                 <div>
//                   <button onClick={() => handleQuantityChange(product?.id, -1)} className="px-2 py-1 bg-red-500 text-white rounded mr-2">-</button>
//                   <span>{selectedProducts[product?.id] || 0}</span>
//                   <button onClick={() => handleQuantityChange(product?.id, 1)} className="px-2 py-1 bg-green-500 text-white rounded ml-2">+</button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//         <div>
//           <h3 className="text-xl mb-4">Selected Products</h3>
//           <ul>
//             {Object.entries(selectedProducts).map(([productId, quantity]) => {
//               const product:any = products.find((p: any) => p?.id === productId);
//               return product ? (
//                 <li key={productId} className="mb-2">
//                   {product?.name} - Quantity: {quantity} - Subtotal: ${product?.price * quantity}
//                 </li>
//               ) : null;
//             })}
//           </ul>
//           <p className="text-xl mt-4">Total: ${total.toFixed(2)}</p>
//           <button onClick={handleCheckout} className="w-full p-2 bg-blue-500 text-white rounded mt-4">
//             Checkout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MakeOrder;

















// import { useState, useEffect } from 'react';
// import { getAllProducts, createOrder } from './api';
// import { useNavigate } from 'react-router-dom';

// function MakeOrder() {
//   const [products, setProducts] = useState([]);
//   const [selectedProducts, setSelectedProducts] = useState<any>({});
//   const [total, setTotal] = useState(0);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const data: any = await getAllProducts();
//       setProducts(data);
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       if ((error as any).message.includes('Unauthorized')) {
//         navigate('/login');
//       }
//     }
//   };

//   const handleQuantityChange = (productId: string, change: number) => {
//     setSelectedProducts((prev: any) => {
//       const newQuantity = (prev[productId] || 0) + change;
//       if (newQuantity <= 0) {
//         const { [productId]: removed, ...rest } = prev;
//         return rest;
//       }
//       return { ...prev, [productId]: newQuantity };
//     });
//   };

//   useEffect(() => {
//     const newTotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]: [string, any]) => {
//       const product: any = products.find((p: any) => p?.id === productId);
//       return sum + (product ? product.price * quantity : 0);
//     }, 0);
//     setTotal(newTotal);
//   }, [selectedProducts, products]);

//   const handleCheckout = async () => {
//     try {
//       await createOrder({ products: selectedProducts, total });
//       alert('Order created successfully');
//       setSelectedProducts({});
//     } catch (error) {
//       alert('Failed to create order');
//       if ((error as any).message.includes('Unauthorized')) {
//         navigate('/login');
//       }
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h2 className="text-2xl mb-4">Make Order</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <h3 className="text-xl mb-4">Available Products</h3>
//           <ul>
//             {products?.map((product: any) => (
//               <li key={product?.id} className="mb-2 flex items-center justify-between">
//                 <span>{product?.name} - ${product.price}</span>
//                 <div>
//                   <button onClick={() => handleQuantityChange(product?.id, -1)} className="px-2 py-1 bg-red-500 text-white rounded mr-2">-</button>
//                   <span>{selectedProducts[product?.id] || 0}</span>
//                   <button onClick={() => handleQuantityChange(product?.id, 1)} className="px-2 py-1 bg-green-500 text-white rounded ml-2">+</button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//         <div>
//           <h3 className="text-xl mb-4">Selected Products</h3>
//           <ul>
//             {Object.entries(selectedProducts).map(([productId, quantity]: [string, any]) => {
//               const product: any = products.find((p: any) => p?.id === productId);
//               return product ? (
//                 <li key={productId} className="mb-2">
//                   {product?.name} - Quantity: {quantity} - Subtotal: ${product?.price * quantity}
//                 </li>
//               ) : null;
//             })}
//           </ul>
//           <p className="text-xl mt-4">Total: ${total.toFixed(2)}</p>
//           <button onClick={handleCheckout} className="w-full p-2 bg-blue-500 text-white rounded mt-4">
//             Checkout
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MakeOrder;

















// // import { useState, useEffect } from 'react';
// // import { getAllProducts, createOrder } from './api';

// // function MakeOrder() {
// //   const [products, setProducts] = useState([]);
// //   const [selectedProducts, setSelectedProducts] = useState<any>({});
// //   const [total, setTotal] = useState(0);

// //   useEffect(() => {
// //     fetchProducts();
// //   }, []);

// //   const fetchProducts = async () => {
// //     try {
// //       const data:any = await getAllProducts();
// //       setProducts(data);
// //     } catch (error) {
// //       console.error('Error fetching products:', error);
// //     }
// //   };

// //   const handleQuantityChange = (productId:any, change:any) => {
// //     setSelectedProducts((prev:any) => {
// //       const newQuantity = (prev[productId] || 0) + change;
// //       if (newQuantity <= 0) {
// //         const { [productId]: removed, ...rest } = prev;
// //         return rest;
// //       }
// //       return { ...prev, [productId]: newQuantity };
// //     });
// //   };

// //   useEffect(() => {
// //     const newTotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]:any) => {
// //       const product:any = products.find((p:any) => p?.id === productId);
// //       return sum + (product ? product.price * quantity : 0);
// //     }, 0);
// //     setTotal(newTotal);
// //   }, [selectedProducts, products]);

// //   const handleCheckout = async () => {
// //     try {
// //       await createOrder({ products: selectedProducts, total });
// //       alert('Order created successfully');
// //       setSelectedProducts({});
// //     } catch (error) {
// //       alert('Failed to create order');
// //     }
// //   };

// //   return (
// //     <div className="container mx-auto p-4">
// //       <h2 className="text-2xl mb-4">Make Order</h2>
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //         <div>
// //           <h3 className="text-xl mb-4">Available Products</h3>
// //           <ul>
// //             {products?.map((product:any) => (
// //               <li key={product?.id} className="mb-2 flex items-center justify-between">
// //                 <span>{product?.name} - ${product.price}</span>
// //                 <div>
// //                   <button onClick={() => handleQuantityChange(product?.id, -1)} className="px-2 py-1 bg-red-500 text-white rounded mr-2">-</button>
// //                   <span>{selectedProducts[product?.id] || 0}</span>
// //                   <button onClick={() => handleQuantityChange(product?.id, 1)} className="px-2 py-1 bg-green-500 text-white rounded ml-2">+</button>
// //                 </div>
// //               </li>
// //             ))}
// //           </ul>
// //         </div>
// //         <div>
// //           <h3 className="text-xl mb-4">Selected Products</h3>
// //           <ul>
// //             {Object.entries(selectedProducts).map(([productId, quantity]:any) => {
// //               const product:any = products.find((p:any) => p?.id === productId);
// //               return product ? (
// //                 <li key={productId} className="mb-2">
// //                   {product?.name} - Quantity: {quantity} - Subtotal: ${product?.price * quantity}
// //                 </li>
// //               ) : null;
// //             })}
// //           </ul>
// //           <p className="text-xl mt-4">Total: ${total.toFixed(2)}</p>
// //           <button onClick={handleCheckout} className="w-full p-2 bg-blue-500 text-white rounded mt-4">
// //             Checkout
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default MakeOrder;