// const BASE_URL = import.meta.env.BASE_URL ||process.env.BASE_URL;
const BASE_URL = 'https://foodorderingapp-1.onrender.com';
// const BASE_URL = 'http://localhost:5000';

// interface UserCredentials {
//   username: string;
//   password: string;
// }

interface ProductData {
  name: string;
  price: number;
}

interface OrderData {
  products: Array<{ productId: string; quantity: number }>;
  total: number;
}

const getAuthHeader = () => {
  const token = sessionStorage.getItem('token');
  return { 'Authorization': `Bearer ${token}` };
};

export const signUp = async (username: string, password: string): Promise<{ token: string }> => {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Signup failed');
  }

  return response.json();
};

export const login = async (username: string, password: string): Promise<{ token: string }> => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
};

export const createProduct = async (productData: ProductData): Promise<ProductData> => {
  const response = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    throw new Error('Failed to create product');
  }

  return response.json();
};

export const getAllProducts = async (): Promise<ProductData[]> => {
  const response = await fetch(`${BASE_URL}/api/products`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
};

export const getOrdersByDate = async (date: string): Promise<any[]> => {
  const response = await fetch(`${BASE_URL}/api/orders/date/${date}`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  return response.json();
};

export const createOrder = async (orderData: OrderData|any): Promise<OrderData> => {
  const response = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  return response.json();
};

// Helper function to handle errors
// const handleError = (error: any) => {
//   console.error('API Error:', error);
//   throw error;
// };

// Add more API functions as needed