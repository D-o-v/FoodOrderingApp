// import { useState, useEffect } from 'react';
// import { getDeliveryPrice, setDeliveryPrice } from './api';
// import { toast } from 'react-toastify';

// function FeeManagement() {
//   const [deliveryFee, setDeliveryFee] = useState(0);
//   const [currentDeliveryFee, setCurrrentDeliveryFee] = useState(0);

//   const fetchDeliveryFee = async () => {
//     try {
//       const response= await getDeliveryPrice();
//       setCurrrentDeliveryFee( response?.data?.deliveryPrice);
//     } catch (error) {
//       toast.error('Failed to fetch delivery fee');
//     }
//   };

//   const handleSubmit = async (e:any) => {
//     e.preventDefault();
//     try {
//       await setDeliveryPrice(deliveryFee);
//       toast.success('Delivery fee updated successfully');
      
//     } catch (error) {
//       toast.error('Failed to update delivery fee');
//     }finally{
//         fetchDeliveryFee();
//     }
//   };

//   useEffect(() => {
//     fetchDeliveryFee();
//   }, []);

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Fee Management</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700">
//             Current Delivery Fee (₦) {currentDeliveryFee}
//           </label>
//           <input
//             type="number"
//             id="deliveryFee"
//             value={deliveryFee}
//             onChange={(e) => setDeliveryFee(Number(e.target.value))}
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//           />
//         </div>
//         <button
//           type="submit"
//           className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//         >
//           Update Fee
//         </button>
//       </form>
//     </div>
//   );
// }

// export default FeeManagement;

















import { useState, useEffect } from 'react';
import { getDeliveryPrice, setDeliveryPrice } from './api';
import { toast } from 'react-toastify';

function FeeManagement() {
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [currentDeliveryFee, setCurrentDeliveryFee] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDeliveryFee = async () => {
    try {
      setIsLoading(true);
      const response = await getDeliveryPrice();
      setCurrentDeliveryFee(response?.data?.deliveryPrice);
      setDeliveryFee(response?.data?.deliveryPrice);
    } catch (error) {
      toast.error('Failed to fetch delivery fee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await setDeliveryPrice(deliveryFee);
      toast.success('Delivery fee updated successfully');
    } catch (error) {
      toast.error('Failed to update delivery fee');
    } finally {
      setIsLoading(false);
      fetchDeliveryFee();
    }
  };

  useEffect(() => {
    fetchDeliveryFee();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 to-orange-600 p-6">
      <div className="max-w-xl mx-auto">
        <div className="backdrop-blur-xl bg-white/20 rounded-2xl shadow-xl border border-white/30 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">Fee Management</h2>
            <p className="text-white/80 mt-2">Set the delivery fee for all orders</p>
          </div>
  
          <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold text-white mb-2">Current Delivery Fee</h3>
              <p className="text-3xl font-bold text-white">₦{currentDeliveryFee.toFixed(2)}</p>
            </div>
          </div>
  
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2" htmlFor="deliveryFee">
                New Delivery Fee (₦)
              </label>
              <input
                id="deliveryFee"
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                min="0"
                step="0.01"
              />
            </div>
  
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                "Update Fee"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FeeManagement;