import { useState, useEffect } from 'react';
import { getDeliveryPrice, setDeliveryPrice } from './api';
import { toast } from 'react-toastify';

function FeeManagement() {
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [currentDeliveryFee, setCurrrentDeliveryFee] = useState(0);

  const fetchDeliveryFee = async () => {
    try {
      const response= await getDeliveryPrice();
      setCurrrentDeliveryFee( response?.data?.deliveryPrice);
    } catch (error) {
      toast.error('Failed to fetch delivery fee');
    }
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    try {
      await setDeliveryPrice(deliveryFee);
      toast.success('Delivery fee updated successfully');
      
    } catch (error) {
      toast.error('Failed to update delivery fee');
    }finally{
        fetchDeliveryFee();
    }
  };

  useEffect(() => {
    fetchDeliveryFee();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Fee Management</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700">
            Current Delivery Fee (₦) {currentDeliveryFee}
          </label>
          <input
            type="number"
            id="deliveryFee"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Update Fee
        </button>
      </form>
    </div>
  );
}

export default FeeManagement;