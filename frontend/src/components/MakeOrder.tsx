import { useState, useEffect, useRef } from 'react';
import 'jspdf-autotable';
import { getAllProducts, createOrder, getOrdersByUserAndDate, editOrder, deleteOrder, cancelOrder, replicateOrder,getDeliveryPrice } from './api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PencilIcon, TrashIcon, RotateCcwIcon } from 'lucide-react';
import palmpayLogo from '../../public/palmpay.png'

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
  const accountNumber=8168847049

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

  const renderPaymentInfo = (order: Order) => {
    if (order.status === 'pending payment') {
      return (
        <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
          <p className="font-bold mb-2">Payment Information:</p>
          <p>Account Number: <span className='font-bold'>{accountNumber}</span></p>
          <p className='flex'>Bank Name: <img className='mx-2' src={ palmpayLogo} alt="PalmPay Logo"  width="80px" height="80px"/></p>
          <p className="mt-2 text-sm text-red-600 font-semibold">
            Please note that only orders with confirmed payments will be processed.
          </p>
          <div className='text-xl font-bold'> Kindly contact the Admin to confirm your Payment</div>
          {/* <button 
            // onClick={() => handleContactAdmin(order._id)}
            className="btn btn-sm btn-primary mt-2"
          >
            Contact Admin to Confirm Payment
          </button> */}
        </div>
      );
    }
    return null;
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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-amber-600 p-4 md:p-6 ">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold mb-8 text-center text-white drop-shadow-lg">Make Order</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products Selection Panel */}
          <div className="backdrop-blur-xl bg-white/20 p-6 md:p-8 rounded-2xl shadow-xl border border-white/30 transition-all duration-300 hover:shadow-2xl">
            <h3 className="text-2xl font-semibold mb-6 text-gray-700">Available Products</h3>
            {loadingProducts ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : (
              <ul className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                {products?.map((product) => (
                  <li key={product?._id} className="flex items-center justify-between bg-white/30 p-4 rounded-xl backdrop-blur-sm hover:bg-white/40 transition-all duration-300 transform hover:scale-[1.02]">
                    <span className="font-medium text-gray-700 text-lg">
                      {product?.name} <span className="ml-2 font-bold">₦{product?.price.toFixed(2)}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(product._id, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-red-500/70 hover:bg-red-600 text-gray-700 rounded-full transition-colors shadow-md"
                      >
                        -
                      </button>
                      <span className="w-10 text-center bg-white/40 rounded-lg px-2 py-1 font-bold text-gray-700">
                        {selectedProducts[product?._id] || 0}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(product?._id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-green-500/70 hover:bg-green-600 text-gray-700 rounded-full transition-colors shadow-md"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
  
          {/* Order Summary Panel */}
          <div className="backdrop-blur-xl bg-white/20 p-6 md:p-8 rounded-2xl shadow-xl border border-white/30 transition-all duration-300 hover:shadow-2xl">
            <h3 className="text-2xl font-semibold mb-6 text-gray-700">Order Summary</h3>
            {Object.keys(selectedProducts).length === 0 ? (
              <div className="text-gray-700/70 text-center py-10">
                <p className="text-lg">Your cart is empty</p>
                <p className="text-sm mt-2">Select products from the list on the left</p>
              </div>
            ) : (
              <ul className="space-y-3 mb-6 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                {Object.entries(selectedProducts).map(([productId, quantity]) => {
                  const product = products.find((p) => p._id === productId);
                  return product ? (
                    <li key={productId} className="flex justify-between bg-white/30 p-3 rounded-xl transform transition-all duration-200 hover:bg-white/40">
                      <span className="text-gray-700">{product?.name} <span className="font-bold">x {quantity}</span></span>
                      <span className="font-bold text-gray-700">₦{(product?.price * quantity).toFixed(2)}</span>
                    </li>
                  ) : null;
                })}
              </ul>
            )}
            
            <div className="space-y-3 mt-6 bg-white/30 p-4 rounded-xl backdrop-blur-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-bold text-gray-700">₦{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Delivery Fee</span>
                <span className="font-bold text-gray-700">₦{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/30 my-2"></div>
              <div className="flex justify-between">
                <span className="text-gray-700 text-lg font-bold">Total</span>
                <span className="font-bold text-gray-700 text-lg">₦{(total + deliveryFee).toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-gray-700 font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={creatingOrder || total === 0}
            >
              {creatingOrder ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : 'Checkout'}
            </button>
          </div>
        </div>
  
        {/* Orders History Section */}
        <div className="mt-12 backdrop-blur-xl bg-white/20 p-6 md:p-8 rounded-2xl shadow-xl border border-white/30 transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-700 drop-shadow-md">Order History</h3>
            
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-white/30 border border-white/30 rounded-xl text-gray-700 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-amber-500 backdrop-blur-sm"
              />
              <button
                onClick={downloadAsPDF}
                className="hidden px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-gray-700 font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50"
                disabled={loadingOrders || orders.length === 0}
              >
                Download PDF
              </button>
            </div>
          </div>
  
          {loadingOrders ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-gray-700/70 text-center py-10">
              <p className="text-lg">No orders found for this date</p>
            </div>
          ) : (
            <div ref={ordersRef} className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-white/20 transition-all duration-300 hover:shadow-2xl hover:bg-white/40">
                  <div className={`p-5 flex justify-between items-center border-b border-white/20`}>
                    <span className={`px-4 py-2 rounded-full font-medium ${getStatusClass(order.status)} text-gray-800`}>
                      {capitalizeFirstLetter(order.status)}
                    </span>
                    <div className="flex space-x-2">
                      {editingOrder !== order._id && (
                        <>
                          <button 
                            onClick={() => handleEdit(order._id)} 
                            className="p-2 rounded-full bg-blue-500/70 hover:bg-blue-600/70 text-gray-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none" 
                            disabled={order.status === 'processing' || order.status === 'in-transit' || order.status === 'completed' || order.status === 'cancelled'}
                          >
                            <PencilIcon size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(order._id)} 
                            className="p-2 rounded-full bg-red-500/70 hover:bg-red-600/70 text-gray-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none" 
                            disabled={order.status === 'processing' || order.status === 'in-transit' || order.status === 'completed' || order.status === 'cancelled'}
                          >
                            <TrashIcon size={16} />
                          </button>
                          <button 
                            onClick={() => handleCancel(order._id)} 
                            className="p-2 rounded-full bg-yellow-500/70 hover:bg-yellow-600/70 text-gray-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none" 
                            disabled={order.status === 'processing' || order.status === 'in-transit' || order.status === 'completed' || order.status === 'cancelled'}
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleReplicate(order._id)} 
                            className="p-2 rounded-full bg-green-500/70 hover:bg-green-600/70 text-gray-700 transition-colors shadow-md"
                          >
                            <RotateCcwIcon size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    {editingOrder === order._id ? (
                      <div className="space-y-4">
                        {Object.entries(editedProducts).map(([productId, quantity]) => {
                          const product = products.find(p => p._id === productId);
                          return product ? (
                            <div key={productId} className="flex items-center justify-between">
                              <span className="text-gray-700">{product.name}</span>
                              <div className="flex items-center">
                                <button 
                                  onClick={() => handleEditQuantityChange(productId, -1)} 
                                  className="w-8 h-8 flex items-center justify-center bg-red-500/70 hover:bg-red-600/70 text-gray-700 rounded-full shadow-md"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={quantity}
                                  onChange={(e) => handleEditQuantityChange(productId, parseInt(e.target.value) - quantity)}
                                  className="w-16 bg-white/30 text-gray-700 text-center mx-2 p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                  min="0"
                                />
                                <button 
                                  onClick={() => handleEditQuantityChange(productId, 1)} 
                                  className="w-8 h-8 flex items-center justify-center bg-green-500/70 hover:bg-green-600/70 text-gray-700 rounded-full shadow-md"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ) : null;
                        })}
                        
                        <div className="mt-4">
                          <select
                            onChange={(e) => handleAddProductToEdit(e.target.value)}
                            className="w-full p-2 bg-white/30 border border-white/30 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 backdrop-blur-sm"
                          >
                            <option value="">Add a product</option>
                            {products.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.name} - ₦{product.price.toFixed(2)}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-4">
                          <button 
                            onClick={handleSaveEdit} 
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-gray-700 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md"
                          >
                            Save Changes
                          </button>
                          <button 
                            onClick={() => setEditingOrder(null)} 
                            className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-gray-700 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="grid grid-cols-1 gap-2">
                          {order.products.map((product, index) => (
                            <div key={index} className="flex justify-between p-2 bg-white/20 rounded-lg transition-all duration-200 hover:bg-white/30">
                              <span className="text-gray-700">{product.product.name} <span className="font-bold">x {product.quantity}</span></span>
                              <span className="font-bold text-gray-700">₦{(product.product.price * product.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Delivery Fee</span>
                            <span className="text-gray-700">₦{deliveryFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span className="text-gray-700">Total</span>
                            <span className="text-gray-700">₦{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        {renderPaymentInfo(order) && (
                          <div className="mt-4 p-4 bg-yellow-100/90 backdrop-blur-sm rounded-lg text-yellow-800 shadow-md">
                            <p className="font-bold mb-2">Payment Information:</p>
                            <p>Account Number: <span className='font-bold'>{accountNumber}</span></p>
                            <p className='flex items-center'>Bank Name: <img className='mx-2' src={palmpayLogo} alt="PalmPay Logo" width="60px" height="60px"/></p>
                            <p className="mt-2 text-sm text-red-600 font-semibold">
                              Please note that only orders with confirmed payments will be processed.
                            </p>
                            <div className='text-lg font-bold mt-2'>Kindly contact the Admin to confirm your Payment</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
  
        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Action</h3>
              <p className="text-gray-700">{confirmMessage}</p>
              <div className="mt-6 flex justify-end space-x-4">
                <button 
                  onClick={() => setShowConfirmModal(false)} 
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmAction} 
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-gray-700 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}

export default MakeOrder;
