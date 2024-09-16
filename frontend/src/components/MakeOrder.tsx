import { useState, useEffect, useRef } from 'react';
import 'jspdf-autotable';
import { getAllProducts, createOrder, getOrdersByUserAndDate, editOrder, deleteOrder, cancelOrder, replicateOrder,getDeliveryPrice } from './api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PencilIcon, TrashIcon, RotateCcwIcon } from 'lucide-react';

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
  status: string;
}

function MakeOrder({ username }: { username: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const navigate = useNavigate();
  const ordersRef = useRef<HTMLDivElement>(null);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editedProducts, setEditedProducts] = useState<Record<string, number>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => async () => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  const[ deliveryFee,setDeliveryFee] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data: any = await getAllProducts();
      setProducts(data);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      if (error.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data: Order[] = await getOrdersByUserAndDate(username, selectedDate);
      setOrders(data);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoadingOrders(false);
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

  const handleCheckout = async () => {
    try {
      setCreatingOrder(true);
      const productsArray = Object.entries(selectedProducts).map(([productId, quantity]) => ({
        product: productId,
        quantity,
      }));

      await createOrder({ username, products: productsArray, total: total + deliveryFee, date: selectedDate });
      toast.success('Order created successfully');
      setSelectedProducts({});
      fetchOrders();
    } catch (error: any) {
      toast.error('Failed to create order');
      if (error.message.includes('Unauthorized')) {
        navigate('/login');
      }
    } finally {
      setCreatingOrder(false);
    }
  };

  const generateOrdersContent = () => {
    return orders.map((order) => 
      `<div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
        <p style="font-weight: bold;">Username: ${order.user.username}</p>
        <p>Status: ${order.status}</p>
        <ul style="list-style-type: none; padding-left: 0;">
          ${order.products.map((product) => 
            `<li style="display: flex; justify-content: space-between;">
              <span>${product.product.name} x ${product.quantity}</span>
              <span>N${(product.product.price * product.quantity).toFixed(2)}</span>
            </li>`
          ).join('')}
        </ul>
        <p>Delivery Fee: ₦${deliveryFee.toFixed(2)}</p>
        <p style="font-weight: bold; text-align: right;">Total: ₦${order.total.toFixed(2)}</p>
      </div>`
    ).join('');
  };

  const downloadAsHTML = () => {
    const content = generateOrdersContent();
    const blob = new Blob([
      `<html>
        <head>
          <title>Orders for ${username} on ${selectedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          <h1>Orders for ${username} on ${selectedDate}</h1>
          ${content}
        </body>
      </html>`
    ], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${username}-${selectedDate}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Orders for ${username} on ${selectedDate}`, 14, 22);
    
    const tableData = orders.flatMap(order => [
      [{ content: `${order.user.username?.toUpperCase()} - ${order.status}`, colSpan: 3, styles: { fontStyle: 'bold' } }],
      ...order.products.map(product => [
        product.product.name,
        product.quantity.toString(),
        `N${(product.product.price * product.quantity).toFixed(2)}`
      ]),
      [{ content: `Delivery Fee: N${deliveryFee.toFixed(2)}`, colSpan: 3, styles: { fontStyle: 'bold' } }],
      [{ content: `Total: N${order.total.toFixed(2)}`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } }],
      [{ content: '', colSpan: 3 }]
    ]);

    (doc as any).autoTable({
      startY: 30,
      head: [['Product', 'Quantity', 'Price']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 50, halign: 'right' }
      },
      didDrawPage: function (data: any) {
        doc.setFontSize(10);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(`Generated on ${new Date().toLocaleString()}`, data.settings.margin.left, pageHeight - 10);
      }
    });

    doc.save(`orders-${username}-${selectedDate}.pdf`);
  };


  const handleDelete = async (orderId: string) => {
    setConfirmMessage('Are you sure you want to delete this order?');
    setConfirmAction(() => async () => {
      try {
        await deleteOrder(orderId);
        toast.success('Order deleted successfully');
        fetchOrders();
      } catch (error:any) {
        console.error(error.error||'Failed to delete order');
      }
    });
    setShowConfirmModal(true);
  };

  const handleCancel = async (orderId: string) => {
    setConfirmMessage('Are you sure you want to cancel this order?');
    setConfirmAction(() => async () => {
      try {
        await cancelOrder(orderId);
        toast.success('Order cancelled successfully');
        fetchOrders();
      } catch (error:any) {
        console.error(error.error||'Failed to cancel order');
      }
    });
    setShowConfirmModal(true);
  };

  const handleReplicate = async (orderId: string) => {
    setConfirmMessage('Are you sure you want to replicate this order?');
    setConfirmAction(() => async () => {
      try {
        await replicateOrder(orderId, selectedDate);
        toast.success('Order replicated successfully');
        fetchOrders();
      } catch (error) {
        toast.error('Failed to replicate order');
      }
    });
    setShowConfirmModal(true);
  };




  const handleConfirmAction = async () => {
    try {
      await confirmAction();
      setShowConfirmModal(false);
      fetchOrders();
    } catch (error:any) {
      console.error(error.error||'Failed to complete action');
    }
  };

  const handleEdit = (orderId: string) => {
    const order = orders.find(o => o._id === orderId);
    if (order) {
      setEditingOrder(orderId);
      setEditedProducts(order.products.reduce((acc, p) => ({
        ...acc,
        [p.product._id]: p.quantity
      }), {}));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    try {
      const updatedProducts = Object.entries(editedProducts)
        .filter(([_, quantity]) => quantity > 0)
        .map(([productId, quantity]) => ({
          product: productId,
          quantity
        }));
      const res = await editOrder(editingOrder, { products: updatedProducts,total: calculateEditedTotal(editingOrder) });
      console.log('res',res);
      toast.success('Order updated successfully');
      setEditingOrder(null);
      fetchOrders();
    } catch (error:any) {
      console.error(error.error);
      // toast.error('Failed to update order');
    }
  };

  const handleEditQuantityChange = (productId: string, change: number) => {
    setEditedProducts(prev => {
      const newQuantity = (prev[productId] || 0) + change;
      if (newQuantity <= 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleAddProductToEdit = (productId: string) => {
    setEditedProducts(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };
  
  const calculateEditedTotal = (orderId: string) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return 0;
    
    return Object.entries(editedProducts).reduce((sum, [productId, quantity]) => {
      const product = order.products.find(p => p.product._id === productId)?.product;
      return sum + (product ? product.price * quantity : 0);
    }, 0) + deliveryFee;
  };

  const capitalizeFirstLetter = (username:string) => {
    return username.charAt(0).toUpperCase() + username.slice(1);
  };
  
  const getStatusClass = (status:string) => {
    switch (status) {
      case 'pending payment':
        return 'bg-yellow-100'; 
      case 'payment confirmed':
        return 'bg-green-100';
      case 'processing':
        return 'bg-blue-100';
      case 'in-transit':
        return 'bg-orange-100';
      case 'completed':
        return 'bg-gray-100';
      case 'cancelled':
        return 'bg-red-100';
      default:
        return 'bg-white';
    }
  };

  const fetchDeliveryFee = async () => {
    try {
      const response= await getDeliveryPrice();
      setDeliveryFee( response?.data?.deliveryPrice);
    } catch (error) {
      toast.error('Failed to fetch delivery fee');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDeliveryFee();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [selectedDate, username]);

  useEffect(() => {
    const newTotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]) => {
      const product = products.find((p) => p._id === productId);
      return sum + (product ? product.price * quantity : 0);
    }, 0);
    setTotal(newTotal);
  }, [selectedProducts, products]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Make Order</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4">Available Products</h3>
          {loadingProducts ? (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <ul className="space-y-4">
              {products?.map((product) => (
                <li key={product?._id} className="flex items-center justify-between">
                  <span className="font-medium">
                    {product?.name} - ₦{product?.price.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(product._id, -1)}
                      className="btn btn-sm btn-error"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{selectedProducts[product?._id] || 0}</span>
                    <button
                      onClick={() => handleQuantityChange(product?._id, 1)}
                      className="btn btn-sm btn-success"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4">Selected Products</h3>
          <ul className="space-y-2 mb-4">
            {Object.entries(selectedProducts).map(([productId, quantity]) => {
              const product = products.find((p) => p._id === productId);
              return product ? (
                <li key={productId} className="flex justify-between">
                  <span>{product?.name} x {quantity}</span>
                  <span>₦{(product?.price * quantity).toFixed(2)}</span>
                </li>
              ) : null;
            })}
          </ul>
          <p className="text-xl font-bold mt-4">Subtotal: ₦{total.toFixed(2)}</p>
          <p className="text-xl font-bold mt-2">Delivery Fee: ₦{deliveryFee.toFixed(2)}</p>
          <p className="text-xl font-bold mt-2">Total: ₦{(total + deliveryFee).toFixed(2)}</p>
          <button
            onClick={handleCheckout}
            className="btn btn-primary w-full mt-4"
            disabled={creatingOrder || total === 0}
          >
            {creatingOrder ? <span className="loading loading-spinner loading-sm"></span> : 'Checkout'}
          </button>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-semibold mb-4">Orders by Date</h3>
        <div className="flex flex-wrap items-center space-x-2 space-y-2 mb-4">
        <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
          <button
            onClick={downloadAsHTML}
            className="btn btn-secondary  hidden"
            disabled={loadingOrders || orders.length === 0}
          >
            Download HTML
          </button>
          <button
            onClick={downloadAsPDF}
            className="btn btn-accent hidden"
            disabled={loadingOrders || orders.length === 0}
          >
            Download PDF
          </button>
        </div>

        {loadingOrders ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div ref={ordersRef} className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-4 rounded-lg shadow-md">
                <div className={`flex justify-between items-center mb-4 bg-light`}>
                  <span className={`badge badge-lg font-medium ${getStatusClass(order.status)}`}>{capitalizeFirstLetter(order.status)}</span>
                </div>
                <div className="mt-2">
                  {editingOrder === order._id ? (
                    <>
                      {Object.entries(editedProducts).map(([productId, quantity]) => {
                        const product = products.find(p => p._id === productId);
                        return product ? (
                          <div key={productId} className="flex items-center justify-between mb-2">
                            <span>{product.name}</span>
                            <div>
                              <button onClick={() => handleEditQuantityChange(productId, -1)} className="btn btn-xs btn-circle btn-error">-</button>
                              <input
                                type="number"
                                value={quantity}
                                onChange={(e) => handleEditQuantityChange(productId, parseInt(e.target.value) - quantity)}
                                className="w-16 input input-bordered input-sm mx-2"
                                min="0"
                              />
                              <button onClick={() => handleEditQuantityChange(productId, 1)} className="btn btn-xs btn-circle btn-success">+</button>
                            </div>
                          </div>
                        ) : null;
                      })}
                      <div className="mt-4">
                        <select
                          onChange={(e) => handleAddProductToEdit(e.target.value)}
                          className="select select-bordered w-full max-w-xs"
                        >
                          <option value="">Add a product</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.name} - ₦{product.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    order.products.map((product, index) => (
                      <div key={index} className="flex justify-between mb-2">
                        <span>{product.product.name} x {product.quantity}</span>
                        <span>₦{(product.product.price * product.quantity).toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>


                <p className="mt-2">Delivery Fee: ₦{deliveryFee.toFixed(2)}</p>
                <p className="mt-2 font-bold text-right">
                  Total: ₦{editingOrder === order._id ? calculateEditedTotal(order._id).toFixed(2) : order.total.toFixed(2)}
                </p>
                <div className="mt-4 flex justify-end space-x-2">
                  {editingOrder === order._id ? (
                    <>
                      <button onClick={handleSaveEdit} className="btn btn-sm btn-primary">Save</button>
                      <button onClick={() => setEditingOrder(null)} className="btn btn-sm btn-ghost">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(order._id)} 
                        className="btn btn-sm btn-circle btn-ghost bg-blue-100" 
                        disabled={ order.status === 'processing'|| order.status === 'in-transit' || order.status === 'completed'|| order.status ===  'cancelled'}
                      >
                        <PencilIcon size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(order._id)} 
                        className="btn btn-sm btn-circle btn-ghost bg-red-100" 
                        disabled={order.status === 'processing'|| order.status === 'in-transit' || order.status === 'completed'|| order.status ===  'cancelled'}
                      >
                        <TrashIcon size={16} />
                      </button>
                      <button 
                        onClick={() => handleCancel(order._id)} 
                        className="btn btn-sm btn-ghost bg-yellow-100" 
                        disabled={order.status === 'processing'|| order.status === 'in-transit' || order.status === 'completed'|| order.status ===  'cancelled'}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleReplicate(order._id)} 
                        className="btn btn-sm btn-circle btn-ghost bg-green-100"
                      >
                        <RotateCcwIcon size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
            <p>{confirmMessage}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setShowConfirmModal(false)} className="btn btn-sm btn-ghost">Cancel</button>
              <button onClick={handleConfirmAction} className="btn btn-sm btn-primary">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

export default MakeOrder;








































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
//   // const [deliveryFee, setDeliveryFee] = useState(0);
//   // const [deliveryFeePerOrder, setDeliveryFeePerOrder] = useState(0);
//   const [editingOrder, setEditingOrder] = useState<string | null>(null);
//   const [editedProducts, setEditedProducts] = useState<Record<string, number>>({});

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

//       await createOrder({ username, products: productsArray, total, date: selectedDate });
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
    
//     // Add title
//     doc.setFontSize(18);
//     doc.text(`Orders for ${username} on ${selectedDate}`, 14, 22);
    
//     // Prepare data for the table
//     const tableData = orders.flatMap(order => [
//       [{ content: `${order.user.username?.toUpperCase()} - ${order.status}`, colSpan: 3, styles: { fontStyle: 'bold' } }],
//       ...order.products.map(product => [
//         product.product.name,
//         product.quantity.toString(),
//         `N${(product.product.price * product.quantity).toFixed(2)}`
//       ]),
//       [{ content: `Total: N${order.total.toFixed(2)}`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } }],
//       [{ content: '', colSpan: 3 }] // Empty row for spacing between orders
//     ]);

//     // Generate the table
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
//         // Footer
//         doc.setFontSize(10);
//         const pageSize = doc.internal.pageSize;
//         const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
//         doc.text(`Generated on ${new Date().toLocaleString()}`, data.settings.margin.left, pageHeight - 10);
//       }
//     });

//     // Save the PDF
//     doc.save(`orders-${username}-${selectedDate}.pdf`);
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
//       const updatedProducts = Object.entries(editedProducts).map(([productId, quantity]) => ({
//         product: productId,
//         quantity
//       }));
//       await editOrder(editingOrder, { products: updatedProducts });
//       toast.success('Order updated successfully');
//       setEditingOrder(null);
//       fetchOrders();
//     } catch (error) {
//       toast.error('Failed to update order');
//     }
//   };

//   const handleDelete = async (orderId: string) => {
//     try {
//       await deleteOrder(orderId);
//       toast.success('Order deleted successfully');
//       fetchOrders();
//     } catch (error) {
//       toast.error('Failed to delete order');
//     }
//   };

//   const handleCancel = async (orderId: string) => {
//     try {
//       await cancelOrder(orderId);
//       toast.success('Order cancelled successfully');
//       fetchOrders();
//     } catch (error) {
//       toast.error('Failed to cancel order');
//     }
//   };

//   const handleReplicate = async (orderId: string) => {
//     try {
//       await replicateOrder(orderId, selectedDate);
//       toast.success('Order replicated successfully');
//       fetchOrders();
//     } catch (error) {
//       toast.error('Failed to replicate order');
//     }
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

//   return (
//     <div className="container mx-auto p-4 max-w-6xl">
//       <h2 className="text-3xl font-bold mb-6 text-center">Make Order</h2>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h3 className="text-2xl font-semibold mb-4">Available Products</h3>
//           {loadingProducts ? (
//             <div className="flex justify-center">
//               <span className="loading loading-spinner loading-lg"></span>
//             </div>
//           ) : (
//             <ul className="space-y-4">
//               {products?.map((product) => (
//                 <li key={product?._id} className="flex items-center justify-between">
//                   <span className="font-medium">
//                     {product?.name} - ₦{product?.price.toFixed(2)}
//                   </span>
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
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h3 className="text-2xl font-semibold mb-4">Selected Products</h3>
//           <ul className="space-y-2 mb-4">
//             {Object.entries(selectedProducts).map(([productId, quantity]) => {
//               const product = products.find((p) => p._id === productId);
//               return product ? (
//                 <li key={productId} className="flex justify-between">
//                   <span>{product?.name} x {quantity}</span>
//                   <span>₦{(product?.price * quantity).toFixed(2)}</span>
//                 </li>
//               ) : null;
//             })}
//           </ul>
//           <p className="text-xl font-bold mt-4">Total: ₦{total.toFixed(2)}</p>
//           <button
//             onClick={handleCheckout}
//             className="btn btn-primary w-full mt-4"
//             disabled={creatingOrder || total === 0}
//           >
//             {creatingOrder ? <span className="loading loading-spinner loading-sm"></span> : 'Checkout'}
//           </button>
//         </div>
//       </div>

//       <div className="mt-12">
//         <h3 className="text-2xl font-semibold mb-4">Orders by Date</h3>
//         <div className="flex flex-wrap items-center space-x-2 space-y-2 mb-4">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="input input-bordered w-full max-w-xs"
//           />
//           <button
//             onClick={downloadAsHTML}
//             className="btn btn-secondary"
//             disabled={loadingOrders || orders.length === 0}
//           >
//             Download HTML
//           </button>
//           <button
//             onClick={downloadAsPDF}
//             className="btn btn-accent"
//             disabled={loadingOrders || orders.length === 0}
//           >
//             Download PDF
//           </button>
//         </div>

//         {loadingOrders ? (
//           <div className="flex justify-center">
//             <span className="loading loading-spinner loading-lg"></span>
//           </div>
//         ) : (
//           <div ref={ordersRef} className="space-y-4">
//             {orders.map((order) => (
//               <div key={order._id} className="bg-white p-4 rounded-lg shadow-md">
//                 <p className="font-bold">Username: {order.user.username}</p>
//                 <p>Status: {order.status}</p>
//                 <ul className="ml-4 mt-2 space-y-1">
//                   {order.products.map((product, index) => (
//                     <li key={index} className="flex justify-between">
//                       <span>{product.product.name} x {
//                         editingOrder === order._id 
//                           ? <input 
//                               type="number" 
//                               value={editedProducts[product.product._id] || product.quantity} 
//                               onChange={(e) => setEditedProducts({
//                                 ...editedProducts,
//                                 [product.product._id]: parseInt(e.target.value)
//                               })}
//                               className="w-16 border rounded px-1"
//                             />
//                           : product.quantity
//                       }</span>
//                       <span>₦{(product.product.price * product.quantity).toFixed(2)}</span>
//                     </li>
//                   ))}
//                 </ul>
//                 <p className="mt-2 font-bold text-right">Total: ₦{order.total.toFixed(2)}</p>
//                 <div className="mt-2 flex justify-end space-x-2">
//                   {editingOrder === order._id ? (
//                     <button onClick={handleSaveEdit} className="btn btn-sm btn-primary">Save</button>
//                   ) : (
//                     <>
//                       <button onClick={() => handleEdit(order._id)} className="btn btn-sm btn-ghost" disabled={order.status === 'processing' || order.status === 'completed'}>
//                         <PencilIcon size={16} />
//                       </button>
//                       <button onClick={() => handleDelete(order._id)} className="btn btn-sm btn-ghost" disabled={order.status === 'processing' || order.status === 'completed'}>
//                         <TrashIcon size={16} />
//                       </button>
//                       <button onClick={() => handleCancel(order._id)} className="btn btn-sm btn-ghost" disabled={order.status === 'processing' || order.status === 'completed'}>
//                         Cancel
//                       </button>
//                       <button onClick={() => handleReplicate(order._id)} className="btn btn-sm btn-ghost">
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
//     </div>
//   );
// }

// export default MakeOrder;
















// import { useState, useEffect, useRef } from 'react';
// import { getAllProducts, createOrder, getOrdersByUser } from './api';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';

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
//   console.log('username',username)
//   const [products, setProducts] = useState<Product[]>([]);
//   const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({});
//   const [total, setTotal] = useState(0);
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loadingProducts, setLoadingProducts] = useState(false);
//   const [loadingOrders, setLoadingOrders] = useState(false);
//   const [creatingOrder, setCreatingOrder] = useState(false);
//   const navigate = useNavigate();
//   const ordersRef = useRef<HTMLDivElement>(null);
//   const deliveryFee = 200;

//   useEffect(() => {
//     fetchProducts();
//     fetchOrders();
//   }, [username]);

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
//       const data: Order[] = await getOrdersByUser(username,);
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

//   useEffect(() => {
//     const newTotal = Object.entries(selectedProducts).reduce((sum, [productId, quantity]) => {
//       const product = products.find((p) => p._id === productId);
//       return sum + (product ? product.price * quantity : 0);
//     }, 0);
//     setTotal(newTotal);
//   }, [selectedProducts, products]);

//   const handleCheckout = async () => {
//     try {
//       setCreatingOrder(true);
//       const productsArray = Object.entries(selectedProducts).map(([productId, quantity]) => ({
//         product: productId,
//         quantity,
//       }));

//       await createOrder({ products: productsArray, total: total + deliveryFee });
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

//   return (
//     <div className="container mx-auto p-4 max-w-6xl">
//       <h2 className="text-3xl font-bold mb-6 text-center">Make Order</h2>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h3 className="text-2xl font-semibold mb-4">Available Products</h3>
//           {loadingProducts ? (
//             <div className="flex justify-center">
//               <span className="loading loading-spinner loading-lg"></span>
//             </div>
//           ) : (
//             <ul className="space-y-4">
//               {products?.map((product) => (
//                 <li key={product?._id} className="flex items-center justify-between">
//                   <span className="font-medium">
//                     {product?.name} - ₦{product?.price.toFixed(2)}
//                   </span>
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
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h3 className="text-2xl font-semibold mb-4">Selected Products</h3>
//           <ul className="space-y-2 mb-4">
//             {Object.entries(selectedProducts).map(([productId, quantity]) => {
//               const product = products.find((p) => p._id === productId);
//               return product ? (
//                 <li key={productId} className="flex justify-between">
//                   <span>{product?.name} x {quantity}</span>
//                   <span>₦{(product?.price * quantity).toFixed(2)}</span>
//                 </li>
//               ) : null;
//             })}
//           </ul>
//           <p className="text-xl font-bold mt-4">Subtotal: ₦{total.toFixed(2)}</p>
//           <p className="text-xl font-bold mt-2">Delivery Fee: ₦{deliveryFee.toFixed(2)}</p>
//           <p className="text-xl font-bold mt-2">Total: ₦{(total + deliveryFee).toFixed(2)}</p>
//           <button
//             onClick={handleCheckout}
//             className="btn btn-primary w-full mt-4"
//             disabled={creatingOrder || total === 0}
//           >
//             {creatingOrder ? <span className="loading loading-spinner loading-sm"></span> : 'Checkout'}
//           </button>
//         </div>
//       </div>

//       <div className="mt-12">
//         <h3 className="text-2xl font-semibold mb-4">Your Orders</h3>
//         {loadingOrders ? (
//           <div className="flex justify-center">
//             <span className="loading loading-spinner loading-lg"></span>
//           </div>
//         ) : (
//           <div ref={ordersRef} className="space-y-4">
//             {orders.map((order) => (
//               <div key={order._id} className="bg-white p-4 rounded-lg shadow-md">
//                 <p className="font-bold">Order ID: {order._id}</p>
//                 <p>Status: {order.status}</p>
//                 <ul className="ml-4 mt-2 space-y-1">
//                   {order.products.map((product, index) => (
//                     <li key={index} className="flex justify-between">
//                       <span>{product.product.name} x {product.quantity}</span>
//                       <span>₦{(product.product.price * product.quantity).toFixed(2)}</span>
//                     </li>
//                   ))}
//                 </ul>
//                 <p className="mt-2 font-bold text-right">Total: ₦{order.total.toFixed(2)}</p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default MakeOrder;
















// // import { useState, useEffect, useRef } from 'react';
// // import { getAllProducts, createOrder, getOrdersByDate } from './api';
// // import { useNavigate } from 'react-router-dom';
// // import { toast } from 'react-toastify';
// // import { jsPDF } from 'jspdf';
// // import 'jspdf-autotable';

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

// // function MakeOrder() {
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
// //   const deliveryFee = 200;

// //   useEffect(() => {
// //     fetchProducts();
// //   }, []);

// //   useEffect(() => {
// //     fetchOrders();
// //   }, [selectedDate]);

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
// //       const data: Order[] = await getOrdersByDate(selectedDate);
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

// //   const generateOrdersContent = () => {
// //     return orders.map((order) => `
// //       <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
// //         <p style="font-weight: bold;">Username: ${order.user.username}</p>
// //         <p>Status: ${order.status}</p>
// //         <ul style="list-style-type: none; padding-left: 0;">
// //           ${order.products.map((product) => `
// //             <li style="display: flex; justify-content: space-between;">
// //               <span>${product.product.name} x ${product.quantity}</span>
// //               <span>N${(product.product.price * product.quantity).toFixed(2)}</span>
// //             </li>
// //           `).join('')}
// //         </ul>
// //         <p style="font-weight: bold; text-align: right;">Subtotal: ₦${order.total.toFixed(2)}</p>
// //         <p style="font-weight: bold; text-align: right;">Delivery Fee: ₦${deliveryFee.toFixed(2)}</p>
// //         <p style="font-weight: bold; text-align: right;">Total: ₦${(order.total + deliveryFee).toFixed(2)}</p>
// //       </div>
// //     `).join('');
// //   };

// //   const downloadAsHTML = () => {
// //     const content = generateOrdersContent();
// //     const blob = new Blob([`
// //       <html>
// //         <head>
// //           <title>Orders for ${selectedDate}</title>
// //           <style>
// //             body { font-family: Arial, sans-serif; }
// //           </style>
// //         </head>
// //         <body>
// //           <h1>Orders for ${selectedDate}</h1>
// //           ${content}
// //         </body>
// //       </html>
// //     `], { type: 'text/html' });
// //     const url = URL.createObjectURL(blob);
// //     const link = document.createElement('a');
// //     link.href = url;
// //     link.download = `orders-${selectedDate}.html`;
// //     document.body.appendChild(link);
// //     link.click();
// //     document.body.removeChild(link);
// //     URL.revokeObjectURL(url);
// //   };


// //   const downloadAsPDF = () => {
// //     const doc = new jsPDF();
    
// //     // Add title
// //     doc.setFontSize(18);
// //     doc.text(`Orders for ${selectedDate}`, 14, 22);
    
// //     // Prepare data for the table
// //     const tableData = orders.flatMap(order => [
// //       [{ content: `${order.user.username?.toUpperCase()}`, colSpan: 3, styles: { fontStyle: 'bold' } }],
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
// //     doc.save(`orders-${selectedDate}.pdf`);
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










// // import { useState, useEffect, useRef } from 'react';
// // import { getAllProducts, createOrder, getOrdersByDate } from './api';
// // import { useNavigate } from 'react-router-dom';
// // import { toast } from 'react-toastify';
// // import { jsPDF } from 'jspdf';
// // import 'jspdf-autotable';

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
// // }

// // function MakeOrder() {
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
// //   const [deliveryFee, setDeliveryFee] = useState(0);
// //   const [deliveryFeePerOrder, setDeliveryFeePerOrder] = useState(0);

// //   useEffect(() => {
// //     fetchProducts();
// //   }, []);

// //   useEffect(() => {
// //     fetchOrders();
// //   }, [selectedDate]);

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
// //       const data: Order[] = await getOrdersByDate(selectedDate);
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

// //       await createOrder({ products: productsArray, total });
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
// //     return orders.map((order) => `
// //       <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
// //         <p style="font-weight: bold;">Username: ${order.user.username}</p>
// //         <ul style="list-style-type: none; padding-left: 0;">
// //           ${order.products.map((product) => `
// //             <li style="display: flex; justify-content: space-between;">
// //               <span>${product.product.name} x ${product.quantity}</span>
// //               <span>N${(product.product.price * product.quantity).toFixed(2)}</span>
// //             </li>
// //           `).join('')}
// //         </ul>
// //         <p style="font-weight: bold; text-align: right;">Total: ₦${order.total.toFixed(2)}</p>
// //       </div>
// //     `).join('');
// //   };

// //   const downloadAsHTML = () => {
// //     const content = generateOrdersContent();
// //     const blob = new Blob([`
// //       <html>
// //         <head>
// //           <title>Orders for ${selectedDate}</title>
// //           <style>
// //             body { font-family: Arial, sans-serif; }
// //           </style>
// //         </head>
// //         <body>
// //           <h1>Orders for ${selectedDate}</h1>
// //           ${content}
// //         </body>
// //       </html>
// //     `], { type: 'text/html' });
// //     const url = URL.createObjectURL(blob);
// //     const link = document.createElement('a');
// //     link.href = url;
// //     link.download = `orders-${selectedDate}.html`;
// //     document.body.appendChild(link);
// //     link.click();
// //     document.body.removeChild(link);
// //     URL.revokeObjectURL(url);
// //   };


// //   const downloadAsPDF = () => {
// //     const doc = new jsPDF();
    
// //     // Add title
// //     doc.setFontSize(18);
// //     doc.text(`Orders for ${selectedDate}`, 14, 22);
    
// //     // Prepare data for the table
// //     const tableData = orders.flatMap(order => [
// //       [{ content: `${order.user.username?.toUpperCase()}`, colSpan: 3, styles: { fontStyle: 'bold' } }],
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
// //     doc.save(`orders-${selectedDate}.pdf`);
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
