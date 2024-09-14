import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, getOrdersByDate } from './api';
import { toast } from 'react-toastify';

interface Order {
  _id: string;
  user: {
    username: string;
  };
  products: Array<{
    product: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  total: number;
  date: string;
  status: string;
}

function AdminOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchOrdersByDate();
  }, [selectedDate]);

  const fetchOrdersByDate = async () => {
    try {
      setLoading(true);
      const fetchedOrders = await getOrdersByDate(selectedDate);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      fetchOrdersByDate(); // Refresh the orders list
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>
      <div className="mb-4">
        <label htmlFor="date-picker" className="mr-2">Select Date:</label>
        <input
          id="date-picker"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input input-bordered"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user.username}</td>
                <td>₦{order.total.toFixed(2)}</td>
                <td>{new Date(order.date).toLocaleString()}</td>
                <td>{order.status}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option value="pending payment">Pending Payment</option>
                    <option value="payment confirmed">Payment Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrderManagement;


















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