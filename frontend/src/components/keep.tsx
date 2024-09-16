// import { useState, useEffect, useRef } from 'react';
// import 'jspdf-autotable';
// import { getAllProducts, createOrder, getOrdersByUserAndDate, editOrder, deleteOrder, cancelOrder, replicateOrder } from './api';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
// import { PencilIcon, TrashIcon, RotateCcwIcon } from 'lucide-react';

// interface Product {
//   _id: string;
//   name: string;
//   price: number;
// }

// interface OrderProduct {
//   product: Product;
//   quantity: number;
// }

// interface Order {
//   _id: string;
//   user: {
//     username: string;
//   };
//   products: OrderProduct[];
//   total: number;
//   date: string;
//   status: string;
// }

// function MakeOrder({ username }: { username: string }) {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
//   const [total, setTotal] = useState(0);
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [loadingProducts, setLoadingProducts] = useState(false);
//   const [loadingOrders, setLoadingOrders] = useState(false);
//   const [creatingOrder, setCreatingOrder] = useState(false);
//   const navigate = useNavigate();
//   const ordersRef = useRef<HTMLDivElement>(null);
//   const [editingOrder, setEditingOrder] = useState<string | null>(null);
//   const [editedProducts, setEditedProducts] = useState<Record<string, number>>({});
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => async () => {});
//   const [confirmMessage, setConfirmMessage] = useState('');
//   const deliveryFee = 300;

//   const fetchProducts = async () => {
//     try {
//       setLoadingProducts(true);
//       const data: any = await getAllProducts();
//       setProducts(data);
//     } catch (error: any) {
//       console.error('Error fetching products:', error);
//       toast.error('Failed to fetch products');
//       if (error.message.includes('Unauthorized')) {
//         navigate('/login');
//       }
//     } finally {
//       setLoadingProducts(false);
//     }
//   };

//   const fetchOrders = async () => {
//     try {
//       setLoadingOrders(true);
//       const data: Order[] = await getOrdersByUserAndDate(username, selectedDate);
//       setOrders(data);
//     } catch (error: any) {
//       console.error('Error fetching orders:', error);
//       toast.error('Failed to fetch orders');
//     } finally {
//       setLoadingOrders(false);
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

//   const handleCheckout = async () => {
//     try {
//       setCreatingOrder(true);
//       const productsArray = Object.entries(selectedProducts).map(([productId, quantity]) => ({
//         product: productId,
//         quantity,
//       }));

//       await createOrder({ username, products: productsArray, total: total + deliveryFee, date: selectedDate });
//       toast.success('Order created successfully');
//       setSelectedProducts({});
//       fetchOrders();
//     } catch (error: any) {
//       toast.error('Failed to create order');
//       if (error.message.includes('Unauthorized')) {
//         navigate('/login');
//       }
//     } finally {
//       setCreatingOrder(false);
//     }
//   };

//   const generateOrdersContent = () => {
//     return orders.map((order) => 
//       `<div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
//         <p style="font-weight: bold;">Username: ${order.user.username}</p>
//         <p>Status: ${order.status}</p>
//         <ul style="list-style-type: none; padding-left: 0;">
//           ${order.products.map((product) => 
//             `<li style="display: flex; justify-content: space-between;">
//               <span>${product.product.name} x ${product.quantity}</span>
//               <span>N${(product.product.price * product.quantity).toFixed(2)}</span>
//             </li>`
//           ).join('')}
//         </ul>
//         <p>Delivery Fee: ₦${deliveryFee.toFixed(2)}</p>
//         <p style="font-weight: bold; text-align: right;">Total: ₦${order.total.toFixed(2)}</p>
//       </div>`
//     ).join('');
//   };

//   const downloadAsHTML = () => {
//     const content = generateOrdersContent();
//     const blob = new Blob([
//       `<html>
//         <head>
//           <title>Orders for ${username} on ${selectedDate}</title>
//           <style>
//             body { font-family: Arial, sans-serif; }
//           </style>
//         </head>
//         <body>
//           <h1>Orders for ${username} on ${selectedDate}</h1>
//           ${content}
//         </body>
//       </html>`
//     ], { type: 'text/html' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `orders-${username}-${selectedDate}.html`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   const downloadAsPDF = () => {
//     const doc = new jsPDF();
    
//     doc.setFontSize(18);
//     doc.text(`Orders for ${username} on ${selectedDate}`, 14, 22);
    
//     const tableData = orders.flatMap(order => [
//       [{ content: `${order.user.username?.toUpperCase()} - ${order.status}`, colSpan: 3, styles: { fontStyle: 'bold' } }],
//       ...order.products.map(product => [
//         product.product.name,
//         product.quantity.toString(),
//         `N${(product.product.price * product.quantity).toFixed(2)}`
//       ]),
//       [{ content: `Delivery Fee: N${deliveryFee.toFixed(2)}`, colSpan: 3, styles: { fontStyle: 'bold' } }],
//       [{ content: `Total: N${order.total.toFixed(2)}`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } }],
//       [{ content: '', colSpan: 3 }]
//     ]);

//     (doc as any).autoTable({
//       startY: 30,
//       head: [['Product', 'Quantity', 'Price']],
//       body: tableData,
//       theme: 'grid',
//       styles: { fontSize: 10, cellPadding: 5 },
//       columnStyles: {
//         0: { cellWidth: 80 },
//         1: { cellWidth: 40, halign: 'center' },
//         2: { cellWidth: 50, halign: 'right' }
//       },
//       didDrawPage: function (data: any) {
//         doc.setFontSize(10);
//         const pageSize = doc.internal.pageSize;
//         const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
//         doc.text(`Generated on ${new Date().toLocaleString()}`, data.settings.margin.left, pageHeight - 10);
//       }
//     });

//     doc.save(`orders-${username}-${selectedDate}.pdf`);
//   };


//   const handleDelete = async (orderId: string) => {
//     setConfirmMessage('Are you sure you want to delete this order?');
//     setConfirmAction(() => async () => {
//       try {
//         await deleteOrder(orderId);
//         toast.success('Order deleted successfully');
//         fetchOrders();
//       } catch (error) {
//         toast.error('Failed to delete order');
//       }
//     });
//     setShowConfirmModal(true);
//   };

//   const handleCancel = async (orderId: string) => {
//     setConfirmMessage('Are you sure you want to cancel this order?');
//     setConfirmAction(() => async () => {
//       try {
//         await cancelOrder(orderId);
//         toast.success('Order cancelled successfully');
//         fetchOrders();
//       } catch (error) {
//         toast.error('Failed to cancel order');
//       }
//     });
//     setShowConfirmModal(true);
//   };

//   const handleReplicate = async (orderId: string) => {
//     setConfirmMessage('Are you sure you want to replicate this order?');
//     setConfirmAction(() => async () => {
//       try {
//         await replicateOrder(orderId, selectedDate);
//         toast.success('Order replicated successfully');
//         fetchOrders();
//       } catch (error) {
//         toast.error('Failed to replicate order');
//       }
//     });
//     setShowConfirmModal(true);
//   };




//   const handleConfirmAction = async () => {
//     try {
//       await confirmAction();
//       setShowConfirmModal(false);
//       fetchOrders();
//     } catch (error) {
//       toast.error('Failed to complete action');
//     }
//   };

//   const handleEdit = (orderId: string) => {
//     const order = orders.find(o => o._id === orderId);
//     if (order) {
//       setEditingOrder(orderId);
//       setEditedProducts(order.products.reduce((acc, p) => ({
//         ...acc,
//         [p.product._id]: p.quantity
//       }), {}));
//     }
//   };

//   const handleSaveEdit = async () => {
//     if (!editingOrder) return;
//     try {
//       const updatedProducts = Object.entries(editedProducts)
//         .filter(([_, quantity]) => quantity > 0)
//         .map(([productId, quantity]) => ({
//           product: productId,
//           quantity
//         }));
//       await editOrder(editingOrder, { products: updatedProducts });
//       toast.success('Order updated successfully');
//       setEditingOrder(null);
//       fetchOrders();
//     } catch (error) {
//       toast.error('Failed to update order');
//     }
//   };

//   const handleEditQuantityChange = (productId: string, change: number) => {
//     setEditedProducts(prev => {
//       const newQuantity = (prev[productId] || 0) + change;
//       if (newQuantity <= 0) {
//         const { [productId]: removed, ...rest } = prev;
//         return rest;
//       }
//       return { ...prev, [productId]: newQuantity };
//     });
//   };

//   const handleAddProductToEdit = (productId: string) => {
//     setEditedProducts(prev => ({
//       ...prev,
//       [productId]: (prev[productId] || 0) + 1
//     }));
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     fetchOrders();
//   }, [selectedDate, username]);

//   useEffect(() => {
//     const newTotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]) => {
//       const product = products.find((p) => p._id === productId);
//       return sum + (product ? product.price * quantity : 0);
//     }, 0);
//     setTotal(newTotal);
//   }, [selectedProducts, products]);

//   const calculateEditedTotal = (orderId: string) => {
//     const order = orders.find(o => o._id === orderId);
//     if (!order) return 0;
    
//     return Object.entries(editedProducts).reduce((sum, [productId, quantity]) => {
//       const product = order.products.find(p => p.product._id === productId)?.product;
//       return sum + (product ? product.price * quantity : 0);
//     }, 0) + deliveryFee;
//   };

//   // return (
//   //   <div className="container mx-auto p-4 max-w-6xl">
//   //     <h2 className="text-3xl font-bold mb-6 text-center">Make Order</h2>
//   //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//   //       <div className="bg-white p-6 rounded-lg shadow-md">
//   //         <h3 className="text-2xl font-semibold mb-4">Available Products</h3>
//   //         {loadingProducts ? (
//   //           <div className="flex justify-center">
//   //             <span className="loading loading-spinner loading-lg"></span>
//   //           </div>
//   //         ) : (
//   //           <ul className="space-y-4">
//   //             {products?.map((product) => (
//   //               <li key={product?._id} className="flex items-center justify-between">
//   //                 <span className="font-medium">
//   //                   {product?.name} - ₦{product?.price.toFixed(2)}
//   //                 </span>
//   //                 <div className="flex items-center space-x-2">
//   //                   <button
//   //                     onClick={() => handleQuantityChange(product._id, -1)}
//   //                     className="btn btn-sm btn-error"
//   //                   >
//   //                     -
//   //                   </button>
//   //                   <span className="w-8 text-center">{selectedProducts[product?._id] || 0}</span>
//   //                   <button
//   //                     onClick={() => handleQuantityChange(product?._id, 1)}
//   //                     className="btn btn-sm btn-success"
//   //                   >
//   //                     +
//   //                   </button>
//   //                 </div>
//   //               </li>
//   //             ))}
//   //           </ul>
//   //         )}
//   //       </div>
//   //       <div className="bg-white p-6 rounded-lg shadow-md">
//   //         <h3 className="text-2xl font-semibold mb-4">Selected Products</h3>
//   //         <ul className="space-y-2 mb-4">
//   //           {Object.entries(selectedProducts).map(([productId, quantity]) => {
//   //             const product = products.find((p) => p._id === productId);
//   //             return product ? (
//   //               <li key={productId} className="flex justify-between">
//   //                 <span>{product?.name} x {quantity}</span>
//   //                 <span>₦{(product?.price * quantity).toFixed(2)}</span>
//   //               </li>
//   //             ) : null;
//   //           })}
//   //         </ul>
//   //         <p className="text-xl font-bold mt-4">Subtotal: ₦{total.toFixed(2)}</p>
//   //         <p className="text-xl font-bold mt-2">Delivery Fee: ₦{deliveryFee.toFixed(2)}</p>
//   //         <p className="text-xl font-bold mt-2">Total: ₦{(total + deliveryFee).toFixed(2)}</p>
//   //         <button
//   //           onClick={handleCheckout}
//   //           className="btn btn-primary w-full mt-4"
//   //           disabled={creatingOrder || total === 0}
//   //         >
//   //           {creatingOrder ? <span className="loading loading-spinner loading-sm"></span> : 'Checkout'}
//   //         </button>
//   //       </div>
//   //     </div>

//   //     <div className="mt-12">
//   //       <h3 className="text-2xl font-semibold mb-4">Orders by Date</h3>
//   //       <div className="flex flex-wrap items-center space-x-2 space-y-2 mb-4">
//   //       <input
//   //           type="date"
//   //           value={selectedDate}
//   //           onChange={(e) => setSelectedDate(e.target.value)}
//   //           className="input input-bordered w-full max-w-xs"
//   //         />
//   //         <button
//   //           onClick={downloadAsHTML}
//   //           className="btn btn-secondary"
//   //           disabled={loadingOrders || orders.length === 0}
//   //         >
//   //           Download HTML
//   //         </button>
//   //         <button
//   //           onClick={downloadAsPDF}
//   //           className="btn btn-accent"
//   //           disabled={loadingOrders || orders.length === 0}
//   //         >
//   //           Download PDF
//   //         </button>
//   //       </div>

//   //       {loadingOrders ? (
//   //         <div className="flex justify-center">
//   //           <span className="loading loading-spinner loading-lg"></span>
//   //         </div>
//   //       ) : (
//   //         <div ref={ordersRef} className="space-y-4">
//   //           {orders.map((order) => (
//   //             <div key={order._id} className="bg-white p-4 rounded-lg shadow-md">
//   //               <p className="font-bold">Username: {order.user.username}</p>
//   //               <p>Status: {order.status}</p>
//   //               <ul className="ml-4 mt-2 space-y-1">
//   //                 {editingOrder === order._id ? (
//   //                   Object.entries(editedProducts).map(([productId, quantity]) => {
//   //                     const product = products.find(p => p._id === productId);
//   //                     return product ? (
//   //                       <li key={productId} className="flex justify-between items-center">
//   //                         <span>{product.name}</span>
//   //                         <div className="flex items-center space-x-2">
//   //                           <button
//   //                             onClick={() => setEditedProducts(prev => ({
//   //                               ...prev,
//   //                               [productId]: Math.max(0, (prev[productId] || 0) - 1)
//   //                             }))}
//   //                             className="btn btn-xs btn-circle btn-error"
//   //                           >
//   //                             -
//   //                           </button>
//   //                           <input
//   //                             type="number"
//   //                             value={quantity}
//   //                             onChange={(e) => setEditedProducts(prev => ({
//   //                               ...prev,
//   //                               [productId]: Math.max(0, parseInt(e.target.value) || 0)
//   //                             }))}
//   //                             className="w-16 input input-bordered input-sm"
//   //                             min="0"
//   //                           />
//   //                           <button
//   //                             onClick={() => setEditedProducts(prev => ({
//   //                               ...prev,
//   //                               [productId]: (prev[productId] || 0) + 1
//   //                             }))}
//   //                             className="btn btn-xs btn-circle btn-success"
//   //                           >
//   //                             +
//   //                           </button>
//   //                           <span>₦{(product.price * quantity).toFixed(2)}</span>
//   //                         </div>
//   //                       </li>
//   //                     ) : null;
//   //                   })
//   //                 ) : (
//   //                   order.products.map((product, index) => (
//   //                     <li key={index} className="flex justify-between">
//   //                       <span>{product.product.name} x {product.quantity}</span>
//   //                       <span>₦{(product.product.price * product.quantity).toFixed(2)}</span>
//   //                     </li>
//   //                   ))
//   //                 )}
//   //               </ul>
//   //               <p className="mt-2">Delivery Fee: ₦{deliveryFee.toFixed(2)}</p>
//   //               <p className="mt-2 font-bold text-right">
//   //                 Total: ₦{editingOrder === order._id ? calculateEditedTotal(order._id).toFixed(2) : order.total.toFixed(2)}
//   //               </p>
//   //               <div className="mt-2 flex justify-end space-x-2">
//   //                 {editingOrder === order._id ? (
//   //                   <>
//   //                     <button onClick={handleSaveEdit} className="btn btn-sm btn-primary">Save</button>
//   //                     <button onClick={() => setEditingOrder(null)} className="btn btn-sm btn-ghost">Cancel</button>
//   //                   </>
//   //                 ) : (
//   //                   <>
//   //                     <button 
//   //                       onClick={() => handleEdit(order._id)} 
//   //                       className="btn btn-sm btn-circle btn-ghost bg-blue-100" 
//   //                       disabled={order.status === 'processing' || order.status === 'completed'}
//   //                     >
//   //                       <PencilIcon size={16} />
//   //                     </button>
//   //                     <button 
//   //                       onClick={() => handleDelete(order._id)} 
//   //                       className="btn btn-sm btn-circle btn-ghost bg-red-100" 
//   //                       disabled={order.status === 'processing' || order.status === 'completed'}
//   //                     >
//   //                       <TrashIcon size={16} />
//   //                     </button>
//   //                     <button 
//   //                       onClick={() => handleCancel(order._id)} 
//   //                       className="btn btn-sm btn-ghost bg-yellow-100" 
//   //                       disabled={order.status === 'processing' || order.status === 'completed'}
//   //                     >
//   //                       Cancel
//   //                     </button>
//   //                     <button 
//   //                       onClick={() => handleReplicate(order._id)} 
//   //                       className="btn btn-sm btn-circle btn-ghost bg-green-100"
//   //                     >
//   //                       <RotateCcwIcon size={16} />
//   //                     </button>
//   //                   </>
//   //                 )}
//   //               </div>
//   //             </div>
//   //           ))}
//   //         </div>
//   //       )}
//   //     </div>

//   //     {showConfirmModal && (
//   //       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//   //         <div className="bg-white p-4 rounded-lg">
//   //           <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
//   //           <p>{confirmMessage}</p>
//   //           <div className="mt-4 flex justify-end space-x-2">
//   //             <button onClick={() => setShowConfirmModal(false)} className="btn btn-sm btn-ghost">Cancel</button>
//   //             <button onClick={handleConfirmAction} className="btn btn-sm btn-primary">Confirm</button>
//   //           </div>
//   //         </div>
//   //       </div>
//   //     )}
//   //   </div>
//   // );

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6">Make Order</h1>
  
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <div>
//           <h2 className="text-2xl font-bold mb-4">Available Products</h2>
//           {loadingProducts ? (
//             <div className="animate-pulse">Loading products...</div>
//           ) : (
//             <div className="space-y-4">
//               {products?.map((product) => (
//                 <div key={product._id} className="flex justify-between items-center border p-4 rounded-lg">
//                   <div>
//                     <span className="font-semibold">{product?.name}</span> - ₦{product?.price.toFixed(2)}
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <button 
//                       onClick={() => handleQuantityChange(product._id, -1)}
//                       className="btn btn-sm btn-error"
//                     >
//                       -
//                     </button>
//                     <span className="w-8 text-center">{selectedProducts[product?._id] || 0}</span>
//                     <button 
//                       onClick={() => handleQuantityChange(product?._id, 1)}
//                       className="btn btn-sm btn-success"
//                     >
//                       +
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
  
//         <div>
//           <h2 className="text-2xl font-bold mb-4">Selected Products</h2>
//           <div className="space-y-4">
//             {Object.entries(selectedProducts).map(([productId, quantity]) => {
//               const product = products.find((p) => p._id === productId);
//               return product ? (
//                 <div key={productId} className="flex justify-between items-center border p-4 rounded-lg">
//                   <span>{product?.name} x {quantity}</span>
//                   <span>₦{(product?.price * quantity).toFixed(2)}</span>
//                 </div>
//               ) : null;
//             })}
//           </div>
//           <div className="mt-4 space-y-2">
//             <div className="flex justify-between">
//               <span>Subtotal:</span>
//               <span>₦{total.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Delivery Fee:</span>
//               <span>₦{deliveryFee.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between font-bold">
//               <span>Total:</span>
//               <span>₦{(total + deliveryFee).toFixed(2)}</span>
//             </div>
//           </div>
//           <button 
//             onClick={handleCheckout}
//             className="btn btn-primary w-full mt-4"
//             disabled={creatingOrder || Object.keys(selectedProducts).length === 0}
//           >
//             {creatingOrder ? <span className="loading loading-spinner"></span> : 'Checkout'}
//           </button>
//         </div>
//       </div>
  
//       <div className="mt-8">
//         <h2 className="text-2xl font-bold mb-4">Orders by Date</h2>
//         <div className="flex items-center space-x-4 mb-4">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="input input-bordered w-full max-w-xs"
//           />
//           <button onClick={downloadAsHTML} className="btn btn-secondary">
//             Download HTML
//           </button>
//           <button onClick={downloadAsPDF} className="btn btn-secondary">
//             Download PDF
//           </button>
//         </div>
  
//         {loadingOrders ? (
//           <div className="animate-pulse">Loading orders...</div>
//         ) : (
//           <div className="space-y-6">
//             {orders.map((order) => (
//               <div key={order._id} className="border p-4 rounded-lg">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-xl font-semibold">Username: {order.user.username}</h3>
//                   <span className="badge badge-lg">{order.status}</span>
//                 </div>
  
//                 <div className="space-y-2 mb-4">
//                   {editingOrder === order._id ? (
//                     <>
//                       {Object.entries(editedProducts).map(([productId, quantity]) => {
//                         const product = products.find(p => p._id === productId);
//                         return product ? (
//                           <div key={productId} className="flex items-center justify-between">
//                             <span>{product.name}</span>
//                             <div className="flex items-center space-x-2">
//                               <button 
//                                 onClick={() => handleEditQuantityChange(productId, -1)}
//                                 className="btn btn-xs btn-circle btn-error"
//                               >
//                                 -
//                               </button>
//                               <input
//                                 type="number"
//                                 value={quantity}
//                                 onChange={(e) => handleEditQuantityChange(productId, parseInt(e.target.value) - quantity)}
//                                 className="w-16 input input-bordered input-sm"
//                                 min="0"
//                               />
//                               <button 
//                                 onClick={() => handleEditQuantityChange(productId, 1)}
//                                 className="btn btn-xs btn-circle btn-success"
//                               >
//                                 +
//                               </button>
//                               <span>₦{(product.price * quantity).toFixed(2)}</span>
//                             </div>
//                           </div>
//                         ) : null;
//                       })}
//                       <div className="mt-4">
//                         <select
//                           onChange={(e) => handleAddProductToEdit(e.target.value)}
//                           className="select select-bordered w-full max-w-xs"
//                         >
//                           <option value="">Add a product</option>
//                           {products.map((product) => (
//                             <option key={product._id} value={product._id}>
//                               {product.name} - ₦{product.price.toFixed(2)}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     </>
//                   ) : (
//                     order.products.map((product, index) => (
//                       <div key={index} className="flex justify-between">
//                         <span>{product.product.name} x {product.quantity}</span>
//                         <span>₦{(product.product.price * product.quantity).toFixed(2)}</span>
//                       </div>
//                     ))
//                   )}
//                 </div>
  
//                 <div className="flex justify-between items-center font-semibold">
//                   <span>Delivery Fee:</span>
//                   <span>₦{deliveryFee.toFixed(2)}</span>
//                 </div>
  
//                 <div className="flex justify-between items-center font-bold mt-2">
//                   <span>Total:</span>
//                   <span>₦{editingOrder === order._id ? calculateEditedTotal(order._id).toFixed(2) : order.total.toFixed(2)}</span>
//                 </div>
  
//                 <div className="mt-4 flex justify-end space-x-2">
//                   {editingOrder === order._id ? (
//                     <>
//                       <button onClick={handleSaveEdit} className="btn btn-sm btn-primary">Save</button>
//                       <button onClick={() => setEditingOrder(null)} className="btn btn-sm btn-ghost">Cancel</button>
//                     </>
//                   ) : (
//                     <>
//                       <button 
//                         onClick={() => handleEdit(order._id)} 
//                         className="btn btn-sm btn-circle btn-ghost bg-blue-100" 
//                         disabled={order.status === 'processing' || order.status === 'completed'}
//                       >
//                         <PencilIcon size={16} />
//                       </button>
//                       <button 
//                         onClick={() => handleDelete(order._id)} 
//                         className="btn btn-sm btn-circle btn-ghost bg-red-100" 
//                         disabled={order.status === 'processing' || order.status === 'completed'}
//                       >
//                         <TrashIcon size={16} />
//                       </button>
//                       <button 
//                         onClick={() => handleCancel(order._id)} 
//                         className="btn btn-sm btn-ghost bg-yellow-100" 
//                         disabled={order.status === 'processing' || order.status === 'completed'}
//                       >
//                         Cancel
//                       </button>
//                       <button 
//                         onClick={() => handleReplicate(order._id)} 
//                         className="btn btn-sm btn-circle btn-ghost bg-green-100"
//                       >
//                         <RotateCcwIcon size={16} />
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
  
//       {showConfirmModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-4 rounded-lg">
//             <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
//             <p>{confirmMessage}</p>
//             <div className="mt-4 flex justify-end space-x-2">
//               <button onClick={() => setShowConfirmModal(false)} className="btn btn-sm btn-ghost">Cancel</button>
//               <button onClick={handleConfirmAction} className="btn btn-sm btn-primary">Confirm</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default MakeOrder;








































// // import { useState, useEffect, useRef } from 'react';
// // import 'jspdf-autotable';
// // import { getAllProducts, createOrder, getOrdersByUserAndDate, editOrder, deleteOrder, cancelOrder, replicateOrder } from './api';
// // import { useNavigate } from 'react-router-dom';
// // import { toast } from 'react-toastify';
// // import { jsPDF } from 'jspdf';
// // import 'jspdf-autotable';
// // import { PencilIcon, TrashIcon, RotateCcwIcon } from 'lucide-react';

// // interface Product {
// //   _id: string;
// //   name: string;
// //   price: number;
// // }

// // interface OrderProduct {
// //   product: Product;
// //   quantity: number;
// // }

// // interface Order {
// //   _id: string;
// //   user: {
// //     username: string;
// //   };
// //   products: OrderProduct[];
// //   total: number;
// //   date: string;
// //   status: string;
// // }

// // function MakeOrder({ username }: { username: string }) {
// //   const [products, setProducts] = useState<Product[]>([]);
// //   const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
// //   const [total, setTotal] = useState(0);
// //   const [orders, setOrders] = useState<Order[]>([]);
// //   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
// //   const [loadingProducts, setLoadingProducts] = useState(false);
// //   const [loadingOrders, setLoadingOrders] = useState(false);
// //   const [creatingOrder, setCreatingOrder] = useState(false);
// //   const navigate = useNavigate();
// //   const ordersRef = useRef<HTMLDivElement>(null);
// //   // const [deliveryFee, setDeliveryFee] = useState(0);
// //   // const [deliveryFeePerOrder, setDeliveryFeePerOrder] = useState(0);
// //   const [editingOrder, setEditingOrder] = useState<string | null>(null);
// //   const [editedProducts, setEditedProducts] = useState<Record<string, number>>({});

// //   const fetchProducts = async () => {
// //     try {
// //       setLoadingProducts(true);
// //       const data: any = await getAllProducts();
// //       setProducts(data);
// //     } catch (error: any) {
// //       console.error('Error fetching products:', error);
// //       toast.error('Failed to fetch products');
// //       if (error.message.includes('Unauthorized')) {
// //         navigate('/login');
// //       }
// //     } finally {
// //       setLoadingProducts(false);
// //     }
// //   };

// //   const fetchOrders = async () => {
// //     try {
// //       setLoadingOrders(true);
// //       const data: Order[] = await getOrdersByUserAndDate(username, selectedDate);
// //       setOrders(data);
// //     } catch (error: any) {
// //       console.error('Error fetching orders:', error);
// //       toast.error('Failed to fetch orders');
// //     } finally {
// //       setLoadingOrders(false);
// //     }
// //   };

// //   const handleQuantityChange = (productId: string, change: number) => {
// //     setSelectedProducts((prev) => {
// //       const newQuantity = (prev[productId] || 0) + change;
// //       if (newQuantity <= 0) {
// //         const { [productId]: removed, ...rest } = prev;
// //         return rest;
// //       }
// //       return { ...prev, [productId]: newQuantity };
// //     });
// //   };

// //   const handleCheckout = async () => {
// //     try {
// //       setCreatingOrder(true);
// //       const productsArray = Object.entries(selectedProducts).map(([productId, quantity]) => ({
// //         product: productId,
// //         quantity,
// //       }));

// //       await createOrder({ username, products: productsArray, total, date: selectedDate });
// //       toast.success('Order created successfully');
// //       setSelectedProducts({});
// //       fetchOrders();
// //     } catch (error: any) {
// //       toast.error('Failed to create order');
// //       if (error.message.includes('Unauthorized')) {
// //         navigate('/login');
// //       }
// //     } finally {
// //       setCreatingOrder(false);
// //     }
// //   };

// //   const generateOrdersContent = () => {
// //     return orders.map((order) => 
// //       `<div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
// //         <p style="font-weight: bold;">Username: ${order.user.username}</p>
// //         <p>Status: ${order.status}</p>
// //         <ul style="list-style-type: none; padding-left: 0;">
// //           ${order.products.map((product) => 
// //             `<li style="display: flex; justify-content: space-between;">
// //               <span>${product.product.name} x ${product.quantity}</span>
// //               <span>N${(product.product.price * product.quantity).toFixed(2)}</span>
// //             </li>`
// //           ).join('')}
// //         </ul>
// //         <p style="font-weight: bold; text-align: right;">Total: ₦${order.total.toFixed(2)}</p>
// //       </div>`
// //     ).join('');
// //   };

// //   const downloadAsHTML = () => {
// //     const content = generateOrdersContent();
// //     const blob = new Blob([
// //       `<html>
// //         <head>
// //           <title>Orders for ${username} on ${selectedDate}</title>
// //           <style>
// //             body { font-family: Arial, sans-serif; }
// //           </style>
// //         </head>
// //         <body>
// //           <h1>Orders for ${username} on ${selectedDate}</h1>
// //           ${content}
// //         </body>
// //       </html>`
// //     ], { type: 'text/html' });
// //     const url = URL.createObjectURL(blob);
// //     const link = document.createElement('a');
// //     link.href = url;
// //     link.download = `orders-${username}-${selectedDate}.html`;
// //     document.body.appendChild(link);
// //     link.click();
// //     document.body.removeChild(link);
// //     URL.revokeObjectURL(url);
// //   };

// //   const downloadAsPDF = () => {
// //     const doc = new jsPDF();
    
// //     // Add title
// //     doc.setFontSize(18);
// //     doc.text(`Orders for ${username} on ${selectedDate}`, 14, 22);
    
// //     // Prepare data for the table
// //     const tableData = orders.flatMap(order => [
// //       [{ content: `${order.user.username?.toUpperCase()} - ${order.status}`, colSpan: 3, styles: { fontStyle: 'bold' } }],
// //       ...order.products.map(product => [
// //         product.product.name,
// //         product.quantity.toString(),
// //         `N${(product.product.price * product.quantity).toFixed(2)}`
// //       ]),
// //       [{ content: `Total: N${order.total.toFixed(2)}`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } }],
// //       [{ content: '', colSpan: 3 }] // Empty row for spacing between orders
// //     ]);

// //     // Generate the table
// //     (doc as any).autoTable({
// //       startY: 30,
// //       head: [['Product', 'Quantity', 'Price']],
// //       body: tableData,
// //       theme: 'grid',
// //       styles: { fontSize: 10, cellPadding: 5 },
// //       columnStyles: {
// //         0: { cellWidth: 80 },
// //         1: { cellWidth: 40, halign: 'center' },
// //         2: { cellWidth: 50, halign: 'right' }
// //       },
// //       didDrawPage: function (data: any) {
// //         // Footer
// //         doc.setFontSize(10);
// //         const pageSize = doc.internal.pageSize;
// //         const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
// //         doc.text(`Generated on ${new Date().toLocaleString()}`, data.settings.margin.left, pageHeight - 10);
// //       }
// //     });

// //     // Save the PDF
// //     doc.save(`orders-${username}-${selectedDate}.pdf`);
// //   };

// //   const handleEdit = (orderId: string) => {
// //     const order = orders.find(o => o._id === orderId);
// //     if (order) {
// //       setEditingOrder(orderId);
// //       setEditedProducts(order.products.reduce((acc, p) => ({
// //         ...acc,
// //         [p.product._id]: p.quantity
// //       }), {}));
// //     }
// //   };

// //   const handleSaveEdit = async () => {
// //     if (!editingOrder) return;
// //     try {
// //       const updatedProducts = Object.entries(editedProducts).map(([productId, quantity]) => ({
// //         product: productId,
// //         quantity
// //       }));
// //       await editOrder(editingOrder, { products: updatedProducts });
// //       toast.success('Order updated successfully');
// //       setEditingOrder(null);
// //       fetchOrders();
// //     } catch (error) {
// //       toast.error('Failed to update order');
// //     }
// //   };

// //   const handleDelete = async (orderId: string) => {
// //     try {
// //       await deleteOrder(orderId);
// //       toast.success('Order deleted successfully');
// //       fetchOrders();
// //     } catch (error) {
// //       toast.error('Failed to delete order');
// //     }
// //   };

// //   const handleCancel = async (orderId: string) => {
// //     try {
// //       await cancelOrder(orderId);
// //       toast.success('Order cancelled successfully');
// //       fetchOrders();
// //     } catch (error) {
// //       toast.error('Failed to cancel order');
// //     }
// //   };

// //   const handleReplicate = async (orderId: string) => {
// //     try {
// //       await replicateOrder(orderId, selectedDate);
// //       toast.success('Order replicated successfully');
// //       fetchOrders();
// //     } catch (error) {
// //       toast.error('Failed to replicate order');
// //     }
// //   };

// //   useEffect(() => {
// //     fetchProducts();
// //   }, []);

// //   useEffect(() => {
// //     fetchOrders();
// //   }, [selectedDate, username]);

// //   useEffect(() => {
// //     const newTotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]) => {
// //       const product = products.find((p) => p._id === productId);
// //       return sum + (product ? product.price * quantity : 0);
// //     }, 0);
// //     setTotal(newTotal);
// //   }, [selectedProducts, products]);

// //   return (
// //     <div className="container mx-auto p-4 max-w-6xl">
// //       <h2 className="text-3xl font-bold mb-6 text-center">Make Order</h2>
// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
// //         <div className="bg-white p-6 rounded-lg shadow-md">
// //           <h3 className="text-2xl font-semibold mb-4">Available Products</h3>
// //           {loadingProducts ? (
// //             <div className="flex justify-center">
// //               <span className="loading loading-spinner loading-lg"></span>
// //             </div>
// //           ) : (
// //             <ul className="space-y-4">
// //               {products?.map((product) => (
// //                 <li key={product?._id} className="flex items-center justify-between">
// //                   <span className="font-medium">
// //                     {product?.name} - ₦{product?.price.toFixed(2)}
// //                   </span>
// //                   <div className="flex items-center space-x-2">
// //                     <button
// //                       onClick={() => handleQuantityChange(product._id, -1)}
// //                       className="btn btn-sm btn-error"
// //                     >
// //                       -
// //                     </button>
// //                     <span className="w-8 text-center">{selectedProducts[product?._id] || 0}</span>
// //                     <button
// //                       onClick={() => handleQuantityChange(product?._id, 1)}
// //                       className="btn btn-sm btn-success"
// //                     >
// //                       +
// //                     </button>
// //                   </div>
// //                 </li>
// //               ))}
// //             </ul>
// //           )}
// //         </div>
// //         <div className="bg-white p-6 rounded-lg shadow-md">
// //           <h3 className="text-2xl font-semibold mb-4">Selected Products</h3>
// //           <ul className="space-y-2 mb-4">
// //             {Object.entries(selectedProducts).map(([productId, quantity]) => {
// //               const product = products.find((p) => p._id === productId);
// //               return product ? (
// //                 <li key={productId} className="flex justify-between">
// //                   <span>{product?.name} x {quantity}</span>
// //                   <span>₦{(product?.price * quantity).toFixed(2)}</span>
// //                 </li>
// //               ) : null;
// //             })}
// //           </ul>
// //           <p className="text-xl font-bold mt-4">Total: ₦{total.toFixed(2)}</p>
// //           <button
// //             onClick={handleCheckout}
// //             className="btn btn-primary w-full mt-4"
// //             disabled={creatingOrder || total === 0}
// //           >
// //             {creatingOrder ? <span className="loading loading-spinner loading-sm"></span> : 'Checkout'}
// //           </button>
// //         </div>
// //       </div>

// //       <div className="mt-12">
// //         <h3 className="text-2xl font-semibold mb-4">Orders by Date</h3>
// //         <div className="flex flex-wrap items-center space-x-2 space-y-2 mb-4">
// //           <input
// //             type="date"
// //             value={selectedDate}
// //             onChange={(e) => setSelectedDate(e.target.value)}
// //             className="input input-bordered w-full max-w-xs"
// //           />
// //           <button
// //             onClick={downloadAsHTML}
// //             className="btn btn-secondary"
// //             disabled={loadingOrders || orders.length === 0}
// //           >
// //             Download HTML
// //           </button>
// //           <button
// //             onClick={downloadAsPDF}
// //             className="btn btn-accent"
// //             disabled={loadingOrders || orders.length === 0}
// //           >
// //             Download PDF
// //           </button>
// //         </div>

// //         {loadingOrders ? (
// //           <div className="flex justify-center">
// //             <span className="loading loading-spinner loading-lg"></span>
// //           </div>
// //         ) : (
// //           <div ref={ordersRef} className="space-y-4">
// //             {orders.map((order) => (
// //               <div key={order._id} className="bg-white p-4 rounded-lg shadow-md">
// //                 <p className="font-bold">Username: {order.user.username}</p>
// //                 <p>Status: {order.status}</p>
// //                 <ul className="ml-4 mt-2 space-y-1">
// //                   {order.products.map((product, index) => (
// //                     <li key={index} className="flex justify-between">
// //                       <span>{product.product.name} x {
// //                         editingOrder === order._id 
// //                           ? <input 
// //                               type="number" 
// //                               value={editedProducts[product.product._id] || product.quantity} 
// //                               onChange={(e) => setEditedProducts({
// //                                 ...editedProducts,
// //                                 [product.product._id]: parseInt(e.target.value)
// //                               })}
// //                               className="w-16 border rounded px-1"
// //                             />
// //                           : product.quantity
// //                       }</span>
// //                       <span>₦{(product.product.price * product.quantity).toFixed(2)}</span>
// //                     </li>
// //                   ))}
// //                 </ul>
// //                 <p className="mt-2 font-bold text-right">Total: ₦{order.total.toFixed(2)}</p>
// //                 <div className="mt-2 flex justify-end space-x-2">
// //                   {editingOrder === order._id ? (
// //                     <button onClick={handleSaveEdit} className="btn btn-sm btn-primary">Save</button>
// //                   ) : (
// //                     <>
// //                       <button onClick={() => handleEdit(order._id)} className="btn btn-sm btn-ghost" disabled={order.status === 'processing' || order.status === 'completed'}>
// //                         <PencilIcon size={16} />
// //                       </button>
// //                       <button onClick={() => handleDelete(order._id)} className="btn btn-sm btn-ghost" disabled={order.status === 'processing' || order.status === 'completed'}>
// //                         <TrashIcon size={16} />
// //                       </button>
// //                       <button onClick={() => handleCancel(order._id)} className="btn btn-sm btn-ghost" disabled={order.status === 'processing' || order.status === 'completed'}>
// //                         Cancel
// //                       </button>
// //                       <button onClick={() => handleReplicate(order._id)} className="btn btn-sm btn-ghost">
// //                         <RotateCcwIcon size={16} />
// //                       </button>
// //                     </>
// //                   )}
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // export default MakeOrder;
















// // import { useState, useEffect, useRef } from 'react';
// // import { getAllProducts, createOrder, getOrdersByUser } from './api';
// // import { useNavigate } from 'react-router-dom';
// // import { toast } from 'react-toastify';

// // interface Product {
// //   _id: string;
// //   name: string;
// //   price: number;
// // }

// // interface OrderProduct {
// //   product: Product;
// //   quantity: number;
// // }

// // interface Order {
// //   _id: string;
// //   user: {
// //     username: string;
// //   };
// //   products: OrderProduct[];
// //   total: number;
// //   date: string;
// //   status: string;
// // }

// // function MakeOrder({ username }: { username: string }) {
// //   console.log('username',username)
// //   const [products, setProducts] = useState<Product[]>([]);
// //   const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
// //   const [total, setTotal] = useState(0);
// //   const [orders, setOrders] = useState<Order[]>([]);
// //   const [loadingProducts, setLoadingProducts] = useState(false);
// //   const [loadingOrders, setLoadingOrders] = useState(false);
// //   const [creatingOrder, setCreatingOrder] = useState(false);
// //   const navigate = useNavigate();
// //   const ordersRef = useRef<HTMLDivElement>(null);
// //   const deliveryFee = 200;

// //   useEffect(() => {
// //     fetchProducts();
// //     fetchOrders();
// //   }, [username]);

// //   const fetchProducts = async () => {
// //     try {
// //       setLoadingProducts(true);
// //       const data: any = await getAllProducts();
// //       setProducts(data);
// //     } catch (error: any) {
// //       console.error('Error fetching products:', error);
// //       toast.error('Failed to fetch products');
// //       if (error.message.includes('Unauthorized')) {
// //         navigate('/login');
// //       }
// //     } finally {
// //       setLoadingProducts(false);
// //     }
// //   };

// //   const fetchOrders = async () => {
// //     try {
// //       setLoadingOrders(true);
// //       const data: Order[] = await getOrdersByUser(username,);
// //       setOrders(data);
// //     } catch (error: any) {
// //       console.error('Error fetching orders:', error);
// //       toast.error('Failed to fetch orders');
// //     } finally {
// //       setLoadingOrders(false);
// //     }
// //   };

// //   const handleQuantityChange = (productId: string, change: number) => {
// //     setSelectedProducts((prev) => {
// //       const newQuantity = (prev[productId] || 0) + change;
// //       if (newQuantity <= 0) {
// //         const { [productId]: removed, ...rest } = prev;
// //         return rest;
// //       }
// //       return { ...prev, [productId]: newQuantity };
// //     });
// //   };

// //   useEffect(() => {
// //     const newTotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]) => {
// //       const product = products.find((p) => p._id === productId);
// //       return sum + (product ? product.price * quantity : 0);
// //     }, 0);
// //     setTotal(newTotal);
// //   }, [selectedProducts, products]);

// //   const handleCheckout = async () => {
// //     try {
// //       setCreatingOrder(true);
// //       const productsArray = Object.entries(selectedProducts).map(([productId, quantity]) => ({
// //         product: productId,
// //         quantity,
// //       }));

// //       await createOrder({ products: productsArray, total: total + deliveryFee });
// //       toast.success('Order created successfully');
// //       setSelectedProducts({});
// //       fetchOrders();
// //     } catch (error: any) {
// //       toast.error('Failed to create order');
// //       if (error.message.includes('Unauthorized')) {
// //         navigate('/login');
// //       }
// //     } finally {
// //       setCreatingOrder(false);
// //     }
// //   };

// //   return (
// //     <div className="container mx-auto p-4 max-w-6xl">
// //       <h2 className="text-3xl font-bold mb-6 text-center">Make Order</h2>
// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
// //         <div className="bg-white p-6 rounded-lg shadow-md">
// //           <h3 className="text-2xl font-semibold mb-4">Available Products</h3>
// //           {loadingProducts ? (
// //             <div className="flex justify-center">
// //               <span className="loading loading-spinner loading-lg"></span>
// //             </div>
// //           ) : (
// //             <ul className="space-y-4">
// //               {products?.map((product) => (
// //                 <li key={product?._id} className="flex items-center justify-between">
// //                   <span className="font-medium">
// //                     {product?.name} - ₦{product?.price.toFixed(2)}
// //                   </span>
// //                   <div className="flex items-center space-x-2">
// //                     <button
// //                       onClick={() => handleQuantityChange(product._id, -1)}
// //                       className="btn btn-sm btn-error"
// //                     >
// //                       -
// //                     </button>
// //                     <span className="w-8 text-center">{selectedProducts[product?._id] || 0}</span>
// //                     <button
// //                       onClick={() => handleQuantityChange(product?._id, 1)}
// //                       className="btn btn-sm btn-success"
// //                     >
// //                       +
// //                     </button>
// //                   </div>
// //                 </li>
// //               ))}
// //             </ul>
// //           )}
// //         </div>
// //         <div className="bg-white p-6 rounded-lg shadow-md">
// //           <h3 className="text-2xl font-semibold mb-4">Selected Products</h3>
// //           <ul className="space-y-2 mb-4">
// //             {Object.entries(selectedProducts).map(([productId, quantity]) => {
// //               const product = products.find((p) => p._id === productId);
// //               return product ? (
// //                 <li key={productId} className="flex justify-between">
// //                   <span>{product?.name} x {quantity}</span>
// //                   <span>₦{(product?.price * quantity).toFixed(2)}</span>
// //                 </li>
// //               ) : null;
// //             })}
// //           </ul>
// //           <p className="text-xl font-bold mt-4">Subtotal: ₦{total.toFixed(2)}</p>
// //           <p className="text-xl font-bold mt-2">Delivery Fee: ₦{deliveryFee.toFixed(2)}</p>
// //           <p className="text-xl font-bold mt-2">Total: ₦{(total + deliveryFee).toFixed(2)}</p>
// //           <button
// //             onClick={handleCheckout}
// //             className="btn btn-primary w-full mt-4"
// //             disabled={creatingOrder || total === 0}
// //           >
// //             {creatingOrder ? <span className="loading loading-spinner loading-sm"></span> : 'Checkout'}
// //           </button>
// //         </div>
// //       </div>

// //       <div className="mt-12">
// //         <h3 className="text-2xl font-semibold mb-4">Your Orders</h3>
// //         {loadingOrders ? (
// //           <div className="flex justify-center">
// //             <span className="loading loading-spinner loading-lg"></span>
// //           </div>
// //         ) : (
// //           <div ref={ordersRef} className="space-y-4">
// //             {orders.map((order) => (
// //               <div key={order._id} className="bg-white p-4 rounded-lg shadow-md">
// //                 <p className="font-bold">Order ID: {order._id}</p>
// //                 <p>Status: {order.status}</p>
// //                 <ul className="ml-4 mt-2 space-y-1">
// //                   {order.products.map((product, index) => (
// //                     <li key={index} className="flex justify-between">
// //                       <span>{product.product.name} x {product.quantity}</span>
// //                       <span>₦{(product.product.price * product.quantity).toFixed(2)}</span>
// //                     </li>
// //                   ))}
// //                 </ul>
// //                 <p className="mt-2 font-bold text-right">Total: ₦{order.total.toFixed(2)}</p>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // export default MakeOrder;
















// // // import { useState, useEffect, useRef } from 'react';
// // // import { getAllProducts, createOrder, getOrdersByDate } from './api';
// // // import { useNavigate } from 'react-router-dom';
// // // import { toast } from 'react-toastify';
// // // import { jsPDF } from 'jspdf';
// // // import 'jspdf-autotable';

// // // interface Product {
// // //   _id: string;
// // //   name: string;
// // //   price: number;
// // // }

// // // interface OrderProduct {
// // //   product: Product;
// // //   quantity: number;
// // // }

// // // interface Order {
// // //   _id: string;
// // //   user: {
// // //     username: string;
// // //   };
// // //   products: OrderProduct[];
// // //   total: number;
// // //   date: string;
// // //   status: string;
// // // }

// // // function MakeOrder() {
// // //   const [products, setProducts] = useState<Product[]>([]);
// // //   const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
// // //   const [total, setTotal] = useState(0);
// // //   const [orders, setOrders] = useState<Order[]>([]);
// // //   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
// // //   const [loadingProducts, setLoadingProducts] = useState(false);
// // //   const [loadingOrders, setLoadingOrders] = useState(false);
// // //   const [creatingOrder, setCreatingOrder] = useState(false);
// // //   const navigate = useNavigate();
// // //   const ordersRef = useRef<HTMLDivElement>(null);
// // //   const deliveryFee = 200;

// // //   useEffect(() => {
// // //     fetchProducts();
// // //   }, []);

// // //   useEffect(() => {
// // //     fetchOrders();
// // //   }, [selectedDate]);

// // //   const fetchProducts = async () => {
// // //     try {
// // //       setLoadingProducts(true);
// // //       const data: any = await getAllProducts();
// // //       setProducts(data);
// // //     } catch (error: any) {
// // //       console.error('Error fetching products:', error);
// // //       toast.error('Failed to fetch products');
// // //       if (error.message.includes('Unauthorized')) {
// // //         navigate('/login');
// // //       }
// // //     } finally {
// // //       setLoadingProducts(false);
// // //     }
// // //   };

// // //   const fetchOrders = async () => {
// // //     try {
// // //       setLoadingOrders(true);
// // //       const data: Order[] = await getOrdersByDate(selectedDate);
// // //       setOrders(data);
// // //     } catch (error: any) {
// // //       console.error('Error fetching orders:', error);
// // //       toast.error('Failed to fetch orders');
// // //     } finally {
// // //       setLoadingOrders(false);
// // //     }
// // //   };
// // //   const handleQuantityChange = (productId: string, change: number) => {
// // //     setSelectedProducts((prev) => {
// // //       const newQuantity = (prev[productId] || 0) + change;
// // //       if (newQuantity <= 0) {
// // //         const { [productId]: removed, ...rest } = prev;
// // //         return rest;
// // //       }
// // //       return { ...prev, [productId]: newQuantity };
// // //     });
// // //   };

// // //   useEffect(() => {
// // //     const newTotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]) => {
// // //       const product = products.find((p) => p._id === productId);
// // //       return sum + (product ? product.price * quantity : 0);
// // //     }, 0);
// // //     setTotal(newTotal);
// // //   }, [selectedProducts, products]);

// // //   const handleCheckout = async () => {
// // //     try {
// // //       setCreatingOrder(true);
// // //       const productsArray = Object.entries(selectedProducts).map(([productId, quantity]) => ({
// // //         product: productId,
// // //         quantity,
// // //       }));

// // //       await createOrder({ products: productsArray, total: total + deliveryFee });
// // //       toast.success('Order created successfully');
// // //       setSelectedProducts({});
// // //       fetchOrders();
// // //     } catch (error: any) {
// // //       toast.error('Failed to create order');
// // //       if (error.message.includes('Unauthorized')) {
// // //         navigate('/login');
// // //       }
// // //     } finally {
// // //       setCreatingOrder(false);
// // //     }
// // //   };

// // //   const generateOrdersContent = () => {
// // //     return orders.map((order) => `
// // //       <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
// // //         <p style="font-weight: bold;">Username: ${order.user.username}</p>
// // //         <p>Status: ${order.status}</p>
// // //         <ul style="list-style-type: none; padding-left: 0;">
// // //           ${order.products.map((product) => `
// // //             <li style="display: flex; justify-content: space-between;">
// // //               <span>${product.product.name} x ${product.quantity}</span>
// // //               <span>N${(product.product.price * product.quantity).toFixed(2)}</span>
// // //             </li>
// // //           `).join('')}
// // //         </ul>
// // //         <p style="font-weight: bold; text-align: right;">Subtotal: ₦${order.total.toFixed(2)}</p>
// // //         <p style="font-weight: bold; text-align: right;">Delivery Fee: ₦${deliveryFee.toFixed(2)}</p>
// // //         <p style="font-weight: bold; text-align: right;">Total: ₦${(order.total + deliveryFee).toFixed(2)}</p>
// // //       </div>
// // //     `).join('');
// // //   };

// // //   const downloadAsHTML = () => {
// // //     const content = generateOrdersContent();
// // //     const blob = new Blob([`
// // //       <html>
// // //         <head>
// // //           <title>Orders for ${selectedDate}</title>
// // //           <style>
// // //             body { font-family: Arial, sans-serif; }
// // //           </style>
// // //         </head>
// // //         <body>
// // //           <h1>Orders for ${selectedDate}</h1>
// // //           ${content}
// // //         </body>
// // //       </html>
// // //     `], { type: 'text/html' });
// // //     const url = URL.createObjectURL(blob);
// // //     const link = document.createElement('a');
// // //     link.href = url;
// // //     link.download = `orders-${selectedDate}.html`;
// // //     document.body.appendChild(link);
// // //     link.click();
// // //     document.body.removeChild(link);
// // //     URL.revokeObjectURL(url);
// // //   };


// // //   const downloadAsPDF = () => {
// // //     const doc = new jsPDF();
    
// // //     // Add title
// // //     doc.setFontSize(18);
// // //     doc.text(`Orders for ${selectedDate}`, 14, 22);
    
// // //     // Prepare data for the table
// // //     const tableData = orders.flatMap(order => [
// // //       [{ content: `${order.user.username?.toUpperCase()}`, colSpan: 3, styles: { fontStyle: 'bold' } }],
// // //       ...order.products.map(product => [
// // //         product.product.name,
// // //         product.quantity.toString(),
// // //         `N${(product.product.price * product.quantity).toFixed(2)}`
// // //       ]),
// // //       [{ content: `Total: N${order.total.toFixed(2)}`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } }],
// // //       [{ content: '', colSpan: 3 }] // Empty row for spacing between orders
// // //     ]);

// // //     // Generate the table
// // //     (doc as any).autoTable({
// // //       startY: 30,
// // //       head: [['Product', 'Quantity', 'Price']],
// // //       body: tableData,
// // //       theme: 'grid',
// // //       styles: { fontSize: 10, cellPadding: 5 },
// // //       columnStyles: {
// // //         0: { cellWidth: 80 },
// // //         1: { cellWidth: 40, halign: 'center' },
// // //         2: { cellWidth: 50, halign: 'right' }
// // //       },
// // //       didDrawPage: function (data: any) {
// // //         // Footer
// // //         doc.setFontSize(10);
// // //         const pageSize = doc.internal.pageSize;
// // //         const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
// // //         doc.text(`Generated on ${new Date().toLocaleString()}`, data.settings.margin.left, pageHeight - 10);
// // //       }
// // //     });

// // //     // Save the PDF
// // //     doc.save(`orders-${selectedDate}.pdf`);
// // //   };
// // //   return (
// // //     <div className="container mx-auto p-4 max-w-6xl">
// // //       <h2 className="text-3xl font-bold mb-6 text-center">Make Order</h2>
// // //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       
// // //         <div className="bg-white p-6 rounded-lg shadow-md">
// // //           <h3 className="text-2xl font-semibold mb-4">Available Products</h3>
// // //           {loadingProducts ? (
// // //             <div className="flex justify-center">
// // //               <span className="loading loading-spinner loading-lg"></span>
// // //             </div>
// // //           ) : (
// // //             <ul className="space-y-4">
// // //               {products?.map((product) => (
// // //                 <li key={product?._id} className="flex items-center justify-between">
// // //                   <span className="font-medium">
// // //                     {product?.name} - ₦{product?.price.toFixed(2)}
// // //                   </span>
// // //                   <div className="flex items-center space-x-2">
// // //                     <button
// // //                       onClick={() => handleQuantityChange(product._id, -1)}
// // //                       className="btn btn-sm btn-error"
// // //                     >
// // //                       -
// // //                     </button>
// // //                     <span className="w-8 text-center">{selectedProducts[product?._id] || 0}</span>
// // //                     <button
// // //                       onClick={() => handleQuantityChange(product?._id, 1)}
// // //                       className="btn btn-sm btn-success"
// // //                     >
// // //                       +
// // //                     </button>
// // //                   </div>
// // //                 </li>
// // //               ))}
// // //             </ul>
// // //           )}
// // //         </div>
// // //         <div className="bg-white p-6 rounded-lg shadow-md">
// // //           <h3 className="text-2xl font-semibold mb-4">Selected Products</h3>
// // //           <ul className="space-y-2 mb-4">
// // //             {Object.entries(selectedProducts).map(([productId, quantity]) => {
// // //               const product = products.find((p) => p._id === productId);
// // //               return product ? (
// // //                 <li key={productId} className="flex justify-between">
// // //                   <span>{product?.name} x {quantity}</span>
// // //                   <span>₦{(product?.price * quantity).toFixed(2)}</span>
// // //                 </li>
// // //               ) : null;
// // //             })}
// // //           </ul>
// // //           <p className="text-xl font-bold mt-4">Subtotal: ₦{total.toFixed(2)}</p>
// // //           <p className="text-xl font-bold mt-2">Delivery Fee: ₦{deliveryFee.toFixed(2)}</p>
// // //           <p className="text-xl font-bold mt-2">Total: ₦{(total + deliveryFee).toFixed(2)}</p>
// // //           <button
// // //             onClick={handleCheckout}
// // //             className="btn btn-primary w-full mt-4"
// // //             disabled={creatingOrder || total === 0}
// // //           >
// // //             {creatingOrder ? <span className="loading loading-spinner loading-sm"></span> : 'Checkout'}
// // //           </button>
// // //         </div>
// // //       </div>

// // //       <div className="mt-12">
// // //         <h3 className="text-2xl font-semibold mb-4">Orders by Date</h3>
// // //         <div className="flex flex-wrap items-center space-x-2 space-y-2 mb-4">
// // //           <input
// // //             type="date"
// // //             value={selectedDate}
// // //             onChange={(e) => setSelectedDate(e.target.value)}
// // //             className="input input-bordered w-full max-w-xs"
// // //           />
// // //           <button
// // //             onClick={downloadAsHTML}
// // //             className="btn btn-secondary"
// // //             disabled={loadingOrders || orders.length === 0}
// // //           >
// // //             Download HTML
// // //           </button>
// // //           <button
// // //             onClick={downloadAsPDF}
// // //             className="btn btn-accent"
// // //             disabled={loadingOrders || orders.length === 0}
// // //           >
// // //             Download PDF
// // //           </button>
// // //         </div>
// // //         {loadingOrders ? (
// // //           <div className="flex justify-center">
// // //             <span className="loading loading-spinner loading-lg"></span>
// // //           </div>
// // //         ) : (
// // //           <div ref={ordersRef} className="space-y-4">
// // //             {orders.map((order) => (
// // //               <div key={order._id} className="bg-white p-4 rounded-lg shadow-md">
// // //                 <p className="font-bold">Username: {order.user.username}</p>
// // //                 <ul className="ml-4 mt-2 space-y-1">
// // //                   {order.products.map((product, index) => (
// // //                     <li key={index} className="flex justify-between">
// // //                       <span>{product.product.name} x {product.quantity}</span>
// // //                       <span>₦{(product.product.price * product.quantity).toFixed(2)}</span>
// // //                     </li>
// // //                   ))}
// // //                 </ul>
// // //                 <p className="mt-2 font-bold text-right">Total: ₦{order.total.toFixed(2)}</p>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // export default MakeOrder;










// // // import { useState, useEffect, useRef } from 'react';
// // // import { getAllProducts, createOrder, getOrdersByDate } from './api';
// // // import { useNavigate } from 'react-router-dom';
// // // import { toast } from 'react-toastify';
// // // import { jsPDF } from 'jspdf';
// // // import 'jspdf-autotable';

// // // interface Product {
// // //   _id: string;
// // //   name: string;
// // //   price: number;
// // // }

// // // interface OrderProduct {
// // //   product: Product;
// // //   quantity: number;
// // // }

// // // interface Order {
// // //   _id: string;
// // //   user: {
// // //     username: string;
// // //   };
// // //   products: OrderProduct[];
// // //   total: number;
// // //   date: string;
// // // }

// // // function MakeOrder() {
// // //   const [products, setProducts] = useState<Product[]>([]);
// // //   const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
// // //   const [total, setTotal] = useState(0);
// // //   const [orders, setOrders] = useState<Order[]>([]);
// // //   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
// // //   const [loadingProducts, setLoadingProducts] = useState(false);
// // //   const [loadingOrders, setLoadingOrders] = useState(false);
// // //   const [creatingOrder, setCreatingOrder] = useState(false);
// // //   const navigate = useNavigate();
// // //   const ordersRef = useRef<HTMLDivElement>(null);
// // //   const [deliveryFee, setDeliveryFee] = useState(0);
// // //   const [deliveryFeePerOrder, setDeliveryFeePerOrder] = useState(0);

// // //   useEffect(() => {
// // //     fetchProducts();
// // //   }, []);

// // //   useEffect(() => {
// // //     fetchOrders();
// // //   }, [selectedDate]);

// // //   const fetchProducts = async () => {
// // //     try {
// // //       setLoadingProducts(true);
// // //       const data: any = await getAllProducts();
// // //       setProducts(data);
// // //     } catch (error: any) {
// // //       console.error('Error fetching products:', error);
// // //       toast.error('Failed to fetch products');
// // //       if (error.message.includes('Unauthorized')) {
// // //         navigate('/login');
// // //       }
// // //     } finally {
// // //       setLoadingProducts(false);
// // //     }
// // //   };

// // //   const fetchOrders = async () => {
// // //     try {
// // //       setLoadingOrders(true);
// // //       const data: Order[] = await getOrdersByDate(selectedDate);
// // //       setOrders(data);
// // //     } catch (error: any) {
// // //       console.error('Error fetching orders:', error);
// // //       toast.error('Failed to fetch orders');
// // //     } finally {
// // //       setLoadingOrders(false);
// // //     }
// // //   };

// // //   const handleQuantityChange = (productId: string, change: number) => {
// // //     setSelectedProducts((prev) => {
// // //       const newQuantity = (prev[productId] || 0) + change;
// // //       if (newQuantity <= 0) {
// // //         const { [productId]: removed, ...rest } = prev;
// // //         return rest;
// // //       }
// // //       return { ...prev, [productId]: newQuantity };
// // //     });
// // //   };

// // //   useEffect(() => {
// // //     const newTotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]) => {
// // //       const product = products.find((p) => p._id === productId);
// // //       return sum + (product ? product.price * quantity : 0);
// // //     }, 0);
// // //     setTotal(newTotal);
// // //   }, [selectedProducts, products]);

// // //   const handleCheckout = async () => {
// // //     try {
// // //       setCreatingOrder(true);
// // //       const productsArray = Object.entries(selectedProducts).map(([productId, quantity]) => ({
// // //         product: productId,
// // //         quantity,
// // //       }));

// // //       await createOrder({ products: productsArray, total });
// // //       toast.success('Order created successfully');
// // //       setSelectedProducts({});
// // //       fetchOrders();
// // //     } catch (error: any) {
// // //       toast.error('Failed to create order');
// // //       if (error.message.includes('Unauthorized')) {
// // //         navigate('/login');
// // //       }
// // //     } finally {
// // //       setCreatingOrder(false);
// // //     }
// // //   };

// // //   const generateOrdersContent = () => {
// // //     return orders.map((order) => `
// // //       <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
// // //         <p style="font-weight: bold;">Username: ${order.user.username}</p>
// // //         <ul style="list-style-type: none; padding-left: 0;">
// // //           ${order.products.map((product) => `
// // //             <li style="display: flex; justify-content: space-between;">
// // //               <span>${product.product.name} x ${product.quantity}</span>
// // //               <span>N${(product.product.price * product.quantity).toFixed(2)}</span>
// // //             </li>
// // //           `).join('')}
// // //         </ul>
// // //         <p style="font-weight: bold; text-align: right;">Total: ₦${order.total.toFixed(2)}</p>
// // //       </div>
// // //     `).join('');
// // //   };

// // //   const downloadAsHTML = () => {
// // //     const content = generateOrdersContent();
// // //     const blob = new Blob([`
// // //       <html>
// // //         <head>
// // //           <title>Orders for ${selectedDate}</title>
// // //           <style>
// // //             body { font-family: Arial, sans-serif; }
// // //           </style>
// // //         </head>
// // //         <body>
// // //           <h1>Orders for ${selectedDate}</h1>
// // //           ${content}
// // //         </body>
// // //       </html>
// // //     `], { type: 'text/html' });
// // //     const url = URL.createObjectURL(blob);
// // //     const link = document.createElement('a');
// // //     link.href = url;
// // //     link.download = `orders-${selectedDate}.html`;
// // //     document.body.appendChild(link);
// // //     link.click();
// // //     document.body.removeChild(link);
// // //     URL.revokeObjectURL(url);
// // //   };


// // //   const downloadAsPDF = () => {
// // //     const doc = new jsPDF();
    
// // //     // Add title
// // //     doc.setFontSize(18);
// // //     doc.text(`Orders for ${selectedDate}`, 14, 22);
    
// // //     // Prepare data for the table
// // //     const tableData = orders.flatMap(order => [
// // //       [{ content: `${order.user.username?.toUpperCase()}`, colSpan: 3, styles: { fontStyle: 'bold' } }],
// // //       ...order.products.map(product => [
// // //         product.product.name,
// // //         product.quantity.toString(),
// // //         `N${(product.product.price * product.quantity).toFixed(2)}`
// // //       ]),
// // //       [{ content: `Total: N${order.total.toFixed(2)}`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } }],
// // //       [{ content: '', colSpan: 3 }] // Empty row for spacing between orders
// // //     ]);

// // //     // Generate the table
// // //     (doc as any).autoTable({
// // //       startY: 30,
// // //       head: [['Product', 'Quantity', 'Price']],
// // //       body: tableData,
// // //       theme: 'grid',
// // //       styles: { fontSize: 10, cellPadding: 5 },
// // //       columnStyles: {
// // //         0: { cellWidth: 80 },
// // //         1: { cellWidth: 40, halign: 'center' },
// // //         2: { cellWidth: 50, halign: 'right' }
// // //       },
// // //       didDrawPage: function (data: any) {
// // //         // Footer
// // //         doc.setFontSize(10);
// // //         const pageSize = doc.internal.pageSize;
// // //         const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
// // //         doc.text(`Generated on ${new Date().toLocaleString()}`, data.settings.margin.left, pageHeight - 10);
// // //       }
// // //     });

// // //     // Save the PDF
// // //     doc.save(`orders-${selectedDate}.pdf`);
// // //   };

// // //   return (
// // //     <div className="container mx-auto p-4 max-w-6xl">
// // //       <h2 className="text-3xl font-bold mb-6 text-center">Make Order</h2>
// // //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
// // //         <div className="bg-white p-6 rounded-lg shadow-md">
// // //           <h3 className="text-2xl font-semibold mb-4">Available Products</h3>
// // //           {loadingProducts ? (
// // //             <div className="flex justify-center">
// // //               <span className="loading loading-spinner loading-lg"></span>
// // //             </div>
// // //           ) : (
// // //             <ul className="space-y-4">
// // //               {products?.map((product) => (
// // //                 <li key={product?._id} className="flex items-center justify-between">
// // //                   <span className="font-medium">
// // //                     {product?.name} - ₦{product?.price.toFixed(2)}
// // //                   </span>
// // //                   <div className="flex items-center space-x-2">
// // //                     <button
// // //                       onClick={() => handleQuantityChange(product._id, -1)}
// // //                       className="btn btn-sm btn-error"
// // //                     >
// // //                       -
// // //                     </button>
// // //                     <span className="w-8 text-center">{selectedProducts[product?._id] || 0}</span>
// // //                     <button
// // //                       onClick={() => handleQuantityChange(product?._id, 1)}
// // //                       className="btn btn-sm btn-success"
// // //                     >
// // //                       +
// // //                     </button>
// // //                   </div>
// // //                 </li>
// // //               ))}
// // //             </ul>
// // //           )}
// // //         </div>
// // //         <div className="bg-white p-6 rounded-lg shadow-md">
// // //           <h3 className="text-2xl font-semibold mb-4">Selected Products</h3>
// // //           <ul className="space-y-2 mb-4">
// // //             {Object.entries(selectedProducts).map(([productId, quantity]) => {
// // //               const product = products.find((p) => p._id === productId);
// // //               return product ? (
// // //                 <li key={productId} className="flex justify-between">
// // //                   <span>{product?.name} x {quantity}</span>
// // //                   <span>₦{(product?.price * quantity).toFixed(2)}</span>
// // //                 </li>
// // //               ) : null;
// // //             })}
// // //           </ul>
// // //           <p className="text-xl font-bold mt-4">Total: ₦{total.toFixed(2)}</p>
// // //           <button
// // //             onClick={handleCheckout}
// // //             className="btn btn-primary w-full mt-4"
// // //             disabled={creatingOrder || total === 0}
// // //           >
// // //             {creatingOrder ? <span className="loading loading-spinner loading-sm"></span> : 'Checkout'}
// // //           </button>
// // //         </div>
// // //       </div>

// // //       <div className="mt-12">
// // //         <h3 className="text-2xl font-semibold mb-4">Orders by Date</h3>
// // //         <div className="flex flex-wrap items-center space-x-2 space-y-2 mb-4">
// // //           <input
// // //             type="date"
// // //             value={selectedDate}
// // //             onChange={(e) => setSelectedDate(e.target.value)}
// // //             className="input input-bordered w-full max-w-xs"
// // //           />
// // //           <button
// // //             onClick={downloadAsHTML}
// // //             className="btn btn-secondary"
// // //             disabled={loadingOrders || orders.length === 0}
// // //           >
// // //             Download HTML
// // //           </button>
// // //           <button
// // //             onClick={downloadAsPDF}
// // //             className="btn btn-accent"
// // //             disabled={loadingOrders || orders.length === 0}
// // //           >
// // //             Download PDF
// // //           </button>
// // //         </div>
// // //         {loadingOrders ? (
// // //           <div className="flex justify-center">
// // //             <span className="loading loading-spinner loading-lg"></span>
// // //           </div>
// // //         ) : (
// // //           <div ref={ordersRef} className="space-y-4">
// // //             {orders.map((order) => (
// // //               <div key={order._id} className="bg-white p-4 rounded-lg shadow-md">
// // //                 <p className="font-bold">Username: {order.user.username}</p>
// // //                 <ul className="ml-4 mt-2 space-y-1">
// // //                   {order.products.map((product, index) => (
// // //                     <li key={index} className="flex justify-between">
// // //                       <span>{product.product.name} x {product.quantity}</span>
// // //                       <span>₦{(product.product.price * product.quantity).toFixed(2)}</span>
// // //                     </li>
// // //                   ))}
// // //                 </ul>
// // //                 <p className="mt-2 font-bold text-right">Total: ₦{order.total.toFixed(2)}</p>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // export default MakeOrder;





















































// import React, { useState, useEffect } from 'react';
// import DataTable, { TableColumn } from 'react-data-table-component';
// import { updateOrderStatus, getOrdersByDate } from './api';
// import { toast } from 'react-toastify';
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
// import { DownloadIcon, SearchIcon, XIcon } from 'lucide-react';

// interface Product {
//   name: string;
//   price: number;
// }

// interface OrderProduct {
//   product: Product;
//   quantity: number;
// }

// interface Order {
//   _id: string;
//   user: {
//     username: string;
//   };
//   products: OrderProduct[];
//   total: number;
//   date: string;
//   status: string;
// }

// function AdminOrderManagement() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     fetchOrdersByDate();
//   }, [selectedDate]);

//   useEffect(() => {
//     filterOrders();
//   }, [searchQuery, orders]);

//   const fetchOrdersByDate = async () => {
//     try {
//       setLoading(true);
//       const fetchedOrders = await getOrdersByDate(selectedDate);
//       setOrders(fetchedOrders);
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//       toast.error('Failed to fetch orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusChange = async (orderId: string, newStatus: string) => {
//     try {
//       await updateOrderStatus(orderId, newStatus);
//       toast.success('Order status updated successfully');
//       fetchOrdersByDate();
//     } catch (error) {
//       console.error('Error updating order status:', error);
//       toast.error('Failed to update order status');
//     }
//   };

//   const filterOrders = () => {
//     const lowercasedQuery = searchQuery.toLowerCase();
//     const filtered = orders.filter((order) =>
//       order._id.toLowerCase().includes(lowercasedQuery) ||
//       order.user.username.toLowerCase().includes(lowercasedQuery) ||
//       order.status.toLowerCase().includes(lowercasedQuery)
//     );
//     setFilteredOrders(filtered);
//   };

//   const columns: TableColumn<Order>[] = [
//     {
//       name: 'Order ID',
//       selector: (row) => row._id,
//       sortable: true,
//     },
//     {
//       name: 'User',
//       selector: (row) => row.user.username,
//       sortable: true,
//     },
//     {
//       name: 'Total',
//       selector: (row) => row.total,
//       sortable: true,
//       format: (row) => `₦${row.total.toFixed(2)}`,
//     },
//     {
//       name: 'Date',
//       selector: (row) => row.date,
//       sortable: true,
//       format: (row) => new Date(row.date).toLocaleString(),
//     },
//     {
//       name: 'Status',
//       selector: (row) => row.status,
//       sortable: true,
//     },
//     {
//       name: 'Actions',
//       cell: (row) => (
//         <select
//           value={row.status}
//           onChange={(e) => handleStatusChange(row._id, e.target.value)}
//           className="select select-bordered w-full max-w-xs"
//         >
//           <option value="pending payment">Pending Payment</option>
//           <option value="payment confirmed">Payment Confirmed</option>
//           <option value="processing">Processing</option>
//           <option value="completed">Completed</option>
//         </select>
//       ),
//     },
//   ];

//   const handleRowClick = (row: Order) => {
//     setSelectedOrder(row);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedOrder(null);
//   };

//   const downloadAsHTML = () => {
//     const ordersToDownload = searchQuery ? filteredOrders : orders;
//     const content = generateOrdersContent(ordersToDownload);
//     const blob = new Blob([
//       `<html>
//         <head>
//           <title>Orders for ${selectedDate}</title>
//           <style>
//             body { font-family: Arial, sans-serif; }
//             table { border-collapse: collapse; width: 100%; }
//             th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//             th { background-color: #f2f2f2; }
//           </style>
//         </head>
//         <body>
//           <h1>Orders for ${selectedDate}</h1>
//           ${content}
//         </body>
//       </html>`
//     ], { type: 'text/html' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `orders-${selectedDate}.html`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   const downloadAsPDF = () => {
//     const ordersToDownload = searchQuery ? filteredOrders : orders;
//     const doc = new jsPDF();
    
//     doc.setFontSize(18);
//     doc.text(`Orders for ${selectedDate}`, 14, 22);
    
//     const tableData = ordersToDownload.map(order => [
//       order._id,
//       order.user.username,
//       `₦${order.total.toFixed(2)}`,
//       new Date(order.date).toLocaleString(),
//       order.status
//     ]);

//     (doc as any).autoTable({
//       startY: 30,
//       head: [['Order ID', 'User', 'Total', 'Date', 'Status']],
//       body: tableData,
//       theme: 'grid',
//       styles: { fontSize: 8, cellPadding: 2 },
//       columnStyles: {
//         0: { cellWidth: 40 },
//         1: { cellWidth: 30 },
//         2: { cellWidth: 25 },
//         3: { cellWidth: 40 },
//         4: { cellWidth: 30 }
//       },
//     });

//     doc.save(`orders-${selectedDate}.pdf`);
//   };

//   const generateOrdersContent = (ordersToRender: Order[]) => {
//     return `
//       <table>
//         <thead>
//           <tr>
//             <th>Order ID</th>
//             <th>User</th>
//             <th>Total</th>
//             <th>Date</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${ordersToRender.map(order => `
//             <tr>
//               <td>${order._id}</td>
//               <td>${order.user.username}</td>
//               <td>₦${order.total.toFixed(2)}</td>
//               <td>${new Date(order.date).toLocaleString()}</td>
//               <td>${order.status}</td>
//             </tr>
//           `).join('')}
//         </tbody>
//       </table>
//     `;
//   };

//   return (
//     <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">Order Management</h1>
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="flex flex-wrap items-center justify-between mb-4">
//           <div className="flex items-center space-x-4 mb-4 sm:mb-0">
//             <label htmlFor="date-picker" className="font-medium text-gray-700">Select Date:</label>
//             <input
//               id="date-picker"
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               className="input input-bordered"
//             />
//           </div>
//           <div className="flex items-center space-x-4">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search orders..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="input input-bordered pl-10 w-full max-w-xs"
//               />
//               <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//             </div>
//             <button onClick={downloadAsHTML} className="btn btn-outline btn-primary">
//               <DownloadIcon size={20} className="mr-2" />
//               HTML
//             </button>
//             <button onClick={downloadAsPDF} className="btn btn-outline btn-secondary">
//               <DownloadIcon size={20} className="mr-2" />
//               PDF
//             </button>
//           </div>
//         </div>
//         <DataTable
//           columns={columns}
//           data={searchQuery ? filteredOrders : orders}
//           pagination
//           paginationRowsPerPageOptions={[10, 25, 50, 100]}
//           paginationPerPage={25}
//           defaultSortFieldId={1}
//           onRowClicked={handleRowClick}
//           progressPending={loading}
//           progressComponent={<span className="loading loading-spinner loading-lg"></span>}
//           customStyles={{
//             headRow: {
//               style: {
//                 backgroundColor: '#f3f4f6',
//                 fontWeight: 'bold',
//               },
//             },
//             rows: {
//               style: {
//                 '&:nth-of-type(odd)': {
//                   backgroundColor: '#f9fafb',
//                 },
//                 '&:hover': {
//                   cursor: 'pointer',
//                   backgroundColor: '#e5e7eb',
//                 },
//               },
//             },
//           }}
//         />
//       </div>

//       {/* Order Details Modal */}
//       {isModalOpen && selectedOrder && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold">Order Details</h2>
//               <button onClick={closeModal} className="btn btn-ghost btn-circle">
//                 <XIcon size={24} />
//               </button>
//             </div>
//             <div className="space-y-4">
//               <p><strong>Order ID:</strong> {selectedOrder._id}</p>
//               <p><strong>User:</strong> {selectedOrder.user.username}</p>
//               <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
//               <p><strong>Status:</strong> {selectedOrder.status}</p>
//               <div>
//                 <h3 className="text-xl font-semibold mb-2">Products</h3>
//                 <table className="table w-full">
//                   <thead>
//                     <tr>
//                       <th>Product</th>
//                       <th>Quantity</th>
//                       <th>Price</th>
//                       <th>Subtotal</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {selectedOrder.products.map((item, index) => (
//                       <tr key={index}>
//                         <td>{item.product.name}</td>
//                         <td>{item.quantity}</td>
//                         <td>₦{item.product.price.toFixed(2)}</td>
//                         <td>₦{(item.product.price * item.quantity).toFixed(2)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//               <p className="text-xl font-bold">Total: ₦{selectedOrder.total.toFixed(2)}</p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AdminOrderManagement;

























// import { useState, useEffect } from 'react';
// import { updateOrderStatus, getOrdersByDate } from './api';
// import { toast } from 'react-toastify';

// interface Order {
//   _id: string;
//   user: {
//     username: string;
//   };
//   products: Array<{
//     product: {
//       name: string;
//       price: number;
//     };
//     quantity: number;
//   }>;
//   total: number;
//   date: string;
//   status: string;
// }

// function AdminOrderManagement() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

//   useEffect(() => {
//     fetchOrdersByDate();
//   }, [selectedDate]);

//   const fetchOrdersByDate = async () => {
//     try {
//       setLoading(true);
//       const fetchedOrders = await getOrdersByDate(selectedDate);
//       setOrders(fetchedOrders);
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//       toast.error('Failed to fetch orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusChange = async (orderId: string, newStatus: string) => {
//     try {
//       await updateOrderStatus(orderId, newStatus);
//       toast.success('Order status updated successfully');
//       fetchOrdersByDate(); // Refresh the orders list
//     } catch (error) {
//       console.error('Error updating order status:', error);
//       toast.error('Failed to update order status');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <span className="loading loading-spinner loading-lg"></span>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6">Order Management</h1>
//       <div className="mb-4">
//         <label htmlFor="date-picker" className="mr-2">Select Date:</label>
//         <input
//           id="date-picker"
//           type="date"
//           value={selectedDate}
//           onChange={(e) => setSelectedDate(e.target.value)}
//           className="input input-bordered"
//         />
//       </div>
//       <div className="overflow-x-auto">
//         <table className="table w-full">
//           <thead>
//             <tr>
//               <th>Order ID</th>
//               <th>User</th>
//               <th>Total</th>
//               <th>Date</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((order) => (
//               <tr key={order._id}>
//                 <td>{order._id}</td>
//                 <td>{order.user.username}</td>
//                 <td>₦{order.total.toFixed(2)}</td>
//                 <td>{new Date(order.date).toLocaleString()}</td>
//                 <td>{order.status}</td>
//                 <td>
//                   <select
//                     value={order.status}
//                     onChange={(e) => handleStatusChange(order._id, e.target.value)}
//                     className="select select-bordered w-full max-w-xs"
//                   >
//                     <option value="pending payment">Pending Payment</option>
//                     <option value="payment confirmed">Payment Confirmed</option>
//                     <option value="processing">Processing</option>
//                     <option value="completed">Completed</option>
//                   </select>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default AdminOrderManagement;


















// import  { useState, useEffect } from 'react';
// import { getAllOrders, updateOrderStatus } from './api';
// import { toast } from 'react-toastify';

// interface Order {
//   _id: string;
//   user: {
//     username: string;
//   };
//   products: Array<{
//     product: {
//       name: string;
//       price: number;
//     };
//     quantity: number;
//   }>;
//   total: number;
//   date: string;
//   status: string;
// }

// function AdminOrderManagement() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const fetchedOrders = await getAllOrders();
//       setOrders(fetchedOrders);
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//       toast.error('Failed to fetch orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusChange = async (orderId: string, newStatus: string) => {
//     try {
//       await updateOrderStatus(orderId, newStatus);
//       toast.success('Order status updated successfully');
//       fetchOrders(); // Refresh the orders list
//     } catch (error) {
//       console.error('Error updating order status:', error);
//       toast.error('Failed to update order status');
//     }
//   };

//   if (loading) {
//     return <div className="flex justify-center items-center h-screen">
//       <span className="loading loading-spinner loading-lg"></span>
//     </div>;
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6">Order Management</h1>
//       <div className="overflow-x-auto">
//         <table className="table w-full">
//           <thead>
//             <tr>
//               <th>Order ID</th>
//               <th>User</th>
//               <th>Total</th>
//               <th>Date</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((order) => (
//               <tr key={order._id}>
//                 <td>{order._id}</td>
//                 <td>{order.user.username}</td>
//                 <td>₦{order.total.toFixed(2)}</td>
//                 <td>{new Date(order.date).toLocaleString()}</td>
//                 <td>{order.status}</td>
//                 <td>
//                   <select
//                     value={order.status}
//                     onChange={(e) => handleStatusChange(order._id, e.target.value)}
//                     className="select select-bordered w-full max-w-xs"
//                   >
//                     <option value="pending payment">Pending Payment</option>
//                     <option value="payment confirmed">Payment Confirmed</option>
//                     <option value="processing">Processing</option>
//                     <option value="completed">Completed</option>
//                   </select>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default AdminOrderManagement;



// const generateVendorReportContent = (ordersToRender: Order[]) => {
//   return ordersToRender.map(order => `
//     <div style="margin-bottom: 40px; page-break-after: always;">
//       <h2>Order ID: ${order._id}</h2>
//       <p><strong>User:</strong> ${order.user.username}</p>
//       <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
//       // <p><strong>Status:</strong> ${order.status}</p>
//       <table>
//         <thead>
//           <tr>
//             <th>Product</th>
//             <th>Quantity</th>
//             <th>Price</th>
//             <th>Subtotal</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${order.products.map(item => `
//             <tr>
//               <td>${item.product.name}</td>
//               <td>${item.quantity}</td>
//               <td>₦${item.product.price.toFixed(2)}</td>
//               <td>₦${(item.product.price * item.quantity).toFixed(2)}</td>
//             </tr>
//           `).join('')}
//         </tbody>
//       </table>
//       <p><strong>Total (excluding delivery fee):</strong> ₦${(order.total - DELIVERY_FEE).toFixed(2)}</p>
//     </div>
//   `).join('');
// };