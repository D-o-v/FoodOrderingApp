import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getOrdersByDate } from './api';
import { useNavigate } from 'react-router-dom';

function GetAllOrders() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const handleDateChange = async (date: Date |any) => {
    setSelectedDate(date);
    try {
      const data: any = await getOrdersByDate(date.toISOString().split('T')[0]);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if ((error as any).message.includes('Unauthorized')) {
        navigate('/login');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Get All Orders</h2>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 mb-4 md:mb-0 md:mr-4">
          <Calendar onChange={handleDateChange} value={selectedDate} />
        </div>
        <div className="w-full md:w-1/2">
          <h3 className="text-xl mb-4">Orders for {selectedDate.toDateString()}</h3>
          {orders.length > 0 ? (
            <ul>
              {orders.map((order: any) => (
                <li key={order.id} className="mb-2 p-2 bg-white rounded shadow">
                  Order ID: {order.id}, Total: ${order.total}
                </li>
              ))}
            </ul>
          ) : (
            <p>No orders for this date.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GetAllOrders;
















// import  { useState } from 'react';
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
// import { getOrdersByDate } from './api';

// function GetAllOrders() {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [orders, setOrders] = useState([]);

//   const handleDateChange = async (date:any) => {
//     setSelectedDate(date);
//     try {
//       const data:any = await getOrdersByDate(date);
//       setOrders(data);
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h2 className="text-2xl mb-4">Get All Orders</h2>
//       <div className="flex flex-col md:flex-row">
//         <div className="w-full md:w-1/2 mb-4 md:mb-0 md:mr-4">
//           <Calendar onChange={handleDateChange} value={selectedDate} />
//         </div>
//         <div className="w-full md:w-1/2">
//           <h3 className="text-xl mb-4">Orders for {selectedDate.toDateString()}</h3>
//           {orders.length > 0 ? (
//             <ul>
//               {orders.map((order:any) => (
//                 <li key={order.id} className="mb-2 p-2 bg-white rounded shadow">
//                   Order ID: {order.id}, Total: ${order.total}
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No orders for this date.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default GetAllOrders;