import axios from 'axios';
import { toast } from 'react-toastify';
// const BASE_URL = 'https://foodorderingapp-1.onrender.com/api';
const BASE_URL = 'http://localhost:5000/api';




interface ProductData {
  name: string;
  price: number;
}

interface OrderData {
  products: Array<{ productId: string; quantity: number }>;
  total: number;
}


// Create an Axios instance with the base URL and default headers (including Authorization)
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Authorization header for requests (except login and signup)
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token && config.url !== '/auth/login' && config.url !== '/auth/signup') {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Auth Endpoints
export const signUp = async (username: string, password: string): Promise<{ token: string,userType:string }> => {
  try {
    const response = await api.post('/auth/signup', { username, password });
    return response.data;
  } catch (error: any) {
   // toast.error(error.response?.data?.error||error.response?.data?.message || 'Signup failed');
    throw new Error(error.response?.data?.error||error.response?.data?.message || 'Signup failed');
  }
};

export const login = async (username: string, password: string): Promise<{ token: string,userType:string }> => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error: any) {
    //// toast.error(error.response?.data?.error||error.response?.data?.message || 'Login failed');
    throw new Error(error.response?.data?.error||error.response?.data?.message || 'Login failed');
  }
};

// Product Endpoints
export const createProduct = async (productData: ProductData): Promise<ProductData> => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error: any) {
   // toast.error(error.response?.data?.error||error.response?.data?.message || 'Failed to create product');
    throw new Error(error.response?.data?.error||error.response?.data?.message || 'Failed to create product');
  }
};

export const getAllProducts = async (): Promise<ProductData[]> => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error: any) {
   // toast.error(error.response?.data?.error||error.response?.data?.message || 'Failed to fetch products');
    throw new Error(error.response?.data?.error||error.response?.data?.message || 'Failed to fetch products');
  }
};

// Order Endpoints
export const createOrder = async (orderData: OrderData|any): Promise<OrderData> => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error: any) {
   // toast.error(error.response?.data?.error||error.response?.data?.message || 'Failed to create order');
    throw new Error(error.response?.data?.error||error.response?.data?.message || 'Failed to create order');
  }
};

export const getOrdersByDate = async (date: string): Promise<any[]> => {
  try {
    const response = await api.get(`/orders/date/${date}`);
    return response.data;
  } catch (error: any) {
   // toast.error(error.response?.data?.error||error.response?.data?.message || 'Failed to fetch orders');
    throw new Error(error.response?.data?.error||error.response?.data?.message || 'Failed to fetch orders');
  }
};

export const getAllOrders = async (): Promise<any[]> => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error: any) {
   // toast.error(error.response?.data?.error||error.response?.data?.message || 'Failed to fetch all orders');
    throw new Error(error.response?.data?.error||error.response?.data?.message || 'Failed to fetch all orders');
  }
};

export const getOrdersByUserAndDate = async (username: string, selectedDate: any): Promise<any[]> => {
  try {
    const response = await api.get(`/orders/user/${username}/${selectedDate}`);
    return response.data;
  } catch (error: any) {
   // toast.error(error.response?.data?.error||error.response?.data?.message || 'Failed to fetch orders');
    throw new Error(error.response?.data?.error||error.response?.data?.message || 'Failed to fetch orders');
  }
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<any> => {
  try {
    const response = await api.patch(`/orders/${orderId}`, { status });
    return response.data;
  } catch (error: any) {
   toast.error(error.response?.data?.error||error.response?.data?.message || 'Failed to update order status');
    throw new Error(error.response?.data?.error||error.response?.data?.message || 'Failed to update order status');
  }
};

export const editOrder = async (orderId: string, updatedData: any): Promise<any> => {
  try {
    const response = await api.patch(`/orders/${orderId}`, updatedData);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error  || 'Failed to edit order');
    throw new Error(error.response?.data?.error||error.response?.data?.message || 'Failed to edit order');
  }
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    await api.delete(`/orders/${orderId}`);
  } catch (error: any) {
   toast.error(error.response?.data?.error||error.response?.data?.message || 'Failed to delete order');
    throw new Error(error.response?.data?.error||error.response?.data?.message || 'Failed to delete order');
  }
};

export const cancelOrder = async (orderId: string): Promise<any> => {
  try {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (error: any) {
   toast.error(error.response?.data?.error||error.response?.data?.message || 'Failed to cancel order');
    throw new Error(error.response?.data?.error);
  }
};

export const replicateOrder = async (orderId: string, newDate: string): Promise<any> => {
  try {
    const response = await api.post(`/orders/${orderId}/replicate`, { newDate });
    return response.data;
  } catch (error: any) {
   // toast.error(error.response?.data?.error||error.response?.data?.message || 'Failed to replicate order');
    throw new Error(error.response?.data?.error||error.response?.data?.message || 'Failed to replicate order');
  }
};

export const getDeliveryPrice = async (): Promise<any> => {
  try {
    const response = await api.get('/admin/delivery-price');
    return response;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to fetch delivery price');
    throw new Error(error.response?.data?.error || 'Failed to fetch delivery price');
  }
};

export const setDeliveryPrice = async (price: number): Promise<void> => {
  try {
    await api.post('/admin/delivery-price', { price });
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to set delivery price');
    throw new Error(error.response?.data?.error || 'Failed to set delivery price');
  }
};

export const getAllUsers = async (): Promise<any[]> => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to fetch users');
    throw new Error(error.response?.data?.error || 'Failed to fetch users');
  }
};

export const setUserType = async (username: string, type: string): Promise<void> => {
  try {
    await api.post('/admin/set-user-type', { username, type });
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to set user type');
    throw new Error(error.response?.data?.error || 'Failed to set user type');
  }
};





































// // const BASE_URL = 'https://foodorderingapp-1.onrender.com';
// const BASE_URL = 'http://localhost:5000';

// interface ProductData {
//   name: string;
//   price: number;
// }

// interface OrderData {
//   products: Array<{ productId: string; quantity: number }>;
//   total: number;
// }

// const getAuthHeader = () => {
//   const token = sessionStorage.getItem('token');
//   return { 'Authorization': `Bearer ${token}` };
// };

// export const signUp = async (username: string, password: string): Promise<{ token: string }> => {
//   const response = await fetch(`${BASE_URL}/api/auth/signup`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ username, password }),
//   });

//   if (!response.ok) {
//     throw new Error('Signup failed');
//   }

//   return response.json();
// };

// export const login = async (username: string, password: string): Promise<{ token: string }> => {
//   const response = await fetch(`${BASE_URL}/api/auth/login`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ username, password }),
//   });

//   if (!response.ok) {
//     throw new Error('Login failed');
//   }

//   return response.json();
// };

// export const createProduct = async (productData: ProductData): Promise<ProductData> => {
//   const response = await fetch(`${BASE_URL}/api/products`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       ...getAuthHeader(),
//     },
//     body: JSON.stringify(productData),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to create product');
//   }

//   return response.json();
// };

// export const getAllProducts = async (): Promise<ProductData[]> => {
//   const response = await fetch(`${BASE_URL}/api/products`, {
//     headers: getAuthHeader(),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to fetch products');
//   }

//   return response.json();
// };

// export const getOrdersByDate = async (date: string): Promise<any[]> => {
//   const response = await fetch(`${BASE_URL}/api/orders/date/${date}`, {
//     headers: getAuthHeader(),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to fetch orders');
//   }

//   return response.json();
// };

// export const createOrder = async (orderData: OrderData | any): Promise<OrderData> => {
//   const response = await fetch(`${BASE_URL}/api/orders`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       ...getAuthHeader(),
//     },
//     body: JSON.stringify(orderData),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to create order');
//   }

//   return response.json();
// };

// // New functions for order management

// export const getAllOrders = async (): Promise<any[]> => {
//   const response = await fetch(`${BASE_URL}/api/orders`, {
//     headers: getAuthHeader(),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to fetch all orders');
//   }

//   return response.json();
// };

// export const getOrdersByUserAndDate = async (username: string,selectedDate:any) => {
//   console.log("username",username)
//   const response = await fetch(`${BASE_URL}/api/orders/user/${username}/${selectedDate}`, {
//     headers: getAuthHeader(),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to fetch all orders');
//   }

//   return response.json();
// };
// // export const getOrdersByUser = async (username: string) => {
// //   console.log("username",username)
// //   const response = await fetch(`${BASE_URL}/api/orders/user/${username}`, {
// //     headers: getAuthHeader(),
// //   });

// //   if (!response.ok) {
// //     throw new Error('Failed to fetch all orders');
// //   }

// //   return response.json();
// // };

// export const updateOrderStatus = async (orderId: string, status: string): Promise<any> => {
//   const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
//     method: 'PATCH',
//     headers: {
//       'Content-Type': 'application/json',
//       ...getAuthHeader(),
//     },
//     body: JSON.stringify({ status }),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to update order status');
//   }

//   return response.json();
// };

// export const editOrder = async (orderId: string, updatedData: any): Promise<any> => {
//   const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
//     method: 'PATCH',
//     headers: {
//       'Content-Type': 'application/json',
//       ...getAuthHeader(),
//     },
//     body: JSON.stringify(updatedData),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to edit order');
//   }

//   return response.json();
// };

// export const deleteOrder = async (orderId: string): Promise<void> => {
//   const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
//     method: 'DELETE',
//     headers: getAuthHeader(),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to delete order');
//   }
// };

// export const cancelOrder = async (orderId: string): Promise<any> => {
//   const response = await fetch(`${BASE_URL}/api/orders/${orderId}/cancel`, {
//     method: 'PATCH',
//     headers: getAuthHeader(),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to cancel order');
//   }

//   return response.json();
// };

// export const replicateOrder = async (orderId: string, newDate: string): Promise<any> => {
//   const response = await fetch(`${BASE_URL}/api/orders/${orderId}/replicate`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       ...getAuthHeader(),
//     },
//     body: JSON.stringify({ newDate }),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to replicate order');
//   }

//   return response.json();
// };



// // Helper function to handle errors
// const handleError = (error: any) => {
//   console.error('API Error:', error);
//   throw error;
// };

// You can use the handleError function in your API calls if needed
// For example:
// .catch(handleError);

// Add more API functions as needed




















// // const BASE_URL = import.meta.env.BASE_URL ||process.env.BASE_URL;
// const BASE_URL = 'https://foodorderingapp-1.onrender.com';
// // const BASE_URL = 'http://localhost:5000';

// // interface UserCredentials {
// //   username: string;
// //   password: string;
// // }

// interface ProductData {
//   name: string;
//   price: number;
// }

// interface OrderData {
//   products: Array<{ productId: string; quantity: number }>;
//   total: number;
// }

// const getAuthHeader = () => {
//   const token = sessionStorage.getItem('token');
//   return { 'Authorization': `Bearer ${token}` };
// };

// export const signUp = async (username: string, password: string): Promise<{ token: string }> => {
//   const response = await fetch(`${BASE_URL}/api/auth/signup`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ username, password }),
//   });

//   if (!response.ok) {
//     throw new Error('Signup failed');
//   }

//   return response.json();
// };

// export const login = async (username: string, password: string): Promise<{ token: string }> => {
//   const response = await fetch(`${BASE_URL}/api/auth/login`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ username, password }),
//   });

//   if (!response.ok) {
//     throw new Error('Login failed');
//   }

//   return response.json();
// };

// export const createProduct = async (productData: ProductData): Promise<ProductData> => {
//   const response = await fetch(`${BASE_URL}/api/products`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       ...getAuthHeader(),
//     },
//     body: JSON.stringify(productData),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to create product');
//   }

//   return response.json();
// };

// export const getAllProducts = async (): Promise<ProductData[]> => {
//   const response = await fetch(`${BASE_URL}/api/products`, {
//     headers: getAuthHeader(),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to fetch products');
//   }

//   return response.json();
// };

// export const getOrdersByDate = async (date: string): Promise<any[]> => {
//   const response = await fetch(`${BASE_URL}/api/orders/date/${date}`, {
//     headers: getAuthHeader(),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to fetch orders');
//   }

//   return response.json();
// };

// export const createOrder = async (orderData: OrderData|any): Promise<OrderData> => {
//   const response = await fetch(`${BASE_URL}/api/orders`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       ...getAuthHeader(),
//     },
//     body: JSON.stringify(orderData),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to create order');
//   }

//   return response.json();
// };

// // Helper function to handle errors
// // const handleError = (error: any) => {
// //   console.error('API Error:', error);
// //   throw error;
// // };

// // Add more API functions as needed