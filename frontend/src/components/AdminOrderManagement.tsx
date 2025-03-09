import { useState, useEffect, useMemo } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { updateOrderStatus, getOrdersByDate, getDeliveryPrice } from './api';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { DownloadIcon, SearchIcon, XIcon, FileTextIcon } from 'lucide-react';

interface Product {
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

const statusColors: { [key: string]: string } = {
  'pending payment': 'bg-yellow-200',
  'payment confirmed': 'bg-blue-200',
  'processing': 'bg-purple-200',
  'in-transit': 'bg-orange-200',
  'cancelled': 'bg-red-200',
  'completed': 'bg-green-200',
};

function AdminOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    fetchOrdersByDate();
    fetchDeliveryFee();
  }, [selectedDate]);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, orders]);

  const fetchDeliveryFee = async () => {
    try {
      const response = await getDeliveryPrice();
      setDeliveryFee(response?.data?.deliveryPrice);
    } catch (error) {
      toast.error('Failed to fetch delivery fee');
    }
  };

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
      fetchOrdersByDate();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const filterOrders = () => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = orders.filter((order) =>
      order._id.toLowerCase().includes(lowercasedQuery) ||
      order.user?.username.toLowerCase().includes(lowercasedQuery) ||
      order.status.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredOrders(filtered);
  };

  const columns: TableColumn<Order>[] = [
    {
      name: 'Order ID',
      selector: (row) => row._id,
      sortable: true,
    },
    {
      name: 'User',
      selector: (row) => row.user?.username,
      sortable: true,
    },
    {
      name: 'Total',
      selector: (row) => row.total,
      sortable: true,
      format: (row) => `₦${row.total.toFixed(2)}`,
    },
    {
      name: 'Date',
      selector: (row) => row.date,
      sortable: true,
      format: (row) => new Date(row.date).toLocaleString(),
    },
    {
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <div className={`p-2 rounded ${statusColors[row.status.toLowerCase()] || 'bg-gray-200'}`}>
          {row.status}
        </div>
      ),
    },
    {
      name: 'Actions',
      cell: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className="select select-bordered w-full max-w-xs my-2"
        >
          <option value="pending payment">Pending Payment</option>
          <option value="payment confirmed">Payment Confirmed</option>
          <option value="processing">Processing</option>
          <option value="in-transit">In Transit</option>
          <option value="cancelled">Cancel</option>
          <option value="completed">Completed</option>
        </select>
      ),
    },
  ];

  const handleRowClick = (row: Order) => {
    setSelectedOrder(row);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const totalDeliveryFee = useMemo(() => {
    const ordersToCalculate = searchQuery ? filteredOrders : orders;
    return ordersToCalculate.length * deliveryFee;
  }, [searchQuery, filteredOrders, orders, deliveryFee]);

  const totalVendorFee = useMemo(() => {
    const ordersToCalculate = searchQuery ? filteredOrders : orders;
    return ordersToCalculate.reduce((sum, order) => sum + order.total - deliveryFee, 0);
  }, [searchQuery, filteredOrders, orders, deliveryFee]);

  const totalOrdersTotal = useMemo(() => {
    const ordersToCalculate = searchQuery ? filteredOrders : orders;
    return ordersToCalculate.reduce((sum, order) => sum + order.total, 0);
  }, [searchQuery, filteredOrders, orders]);

  const downloadAsHTML = () => {
    const ordersToDownload = searchQuery ? filteredOrders : orders;
    const content = generateOrdersContent(ordersToDownload);
    const blob = new Blob([
      `<html>
        <head>
          <title>Orders for ${selectedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Orders for ${selectedDate}</h1>
          ${content}
          <h2>Totals</h2>
          <p>Total Delivery Fee: ₦${totalDeliveryFee.toFixed(2)}</p>
          <p>Total Vendor Fee: ₦${totalVendorFee.toFixed(2)}</p>
          <p>Total Orders Total: ₦${totalOrdersTotal.toFixed(2)}</p>
        </body>
      </html>`
    ], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${selectedDate}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = () => {
    const ordersToDownload = searchQuery ? filteredOrders : orders;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Orders for ${selectedDate}`, 14, 22);
    
    const tableData = ordersToDownload.map(order => [
      order._id,
      order.user?.username,
      `₦${order.total.toFixed(2)}`,
      new Date(order.date).toLocaleString(),
      order.status
    ]);

    (doc as any).autoTable({
      startY: 30,
      head: [['Order ID', 'User', 'Total', 'Date', 'Status']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 }
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 30;
    doc.setFontSize(12);
    doc.text(`Total Delivery Fee: ₦${totalDeliveryFee.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Total Vendor Fee: ₦${totalVendorFee.toFixed(2)}`, 14, finalY + 20);
    doc.text(`Total Orders Total: ₦${totalOrdersTotal.toFixed(2)}`, 14, finalY + 30);

    doc.save(`orders-${selectedDate}.pdf`);
  };

  const generateOrdersContent = (ordersToRender: Order[]) => {
    return `
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Total</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${ordersToRender.map(order => `
            <tr>
              <td>${order._id}</td>
              <td>${order.user?.username}</td>
              <td>₦${order.total.toFixed(2)}</td>
              <td>${new Date(order.date).toLocaleString()}</td>
              <td>${order.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  const downloadVendorReportAsHTML = () => {
    const ordersToDownload = searchQuery ? filteredOrders : orders;
    const content = generateVendorReportContent(ordersToDownload);
    const blob = new Blob([
      `<html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Order for ${selectedDate}</h1>
          ${content}
          <h2>Total Vendor Fee: ₦${totalVendorFee.toFixed(2)}</h2>
        </body>
      </html>`
    ], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vendor-report-${selectedDate}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadVendorReportAsPDF = () => {
    const ordersToDownload = searchQuery ? filteredOrders : orders;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Vendor Report for ${selectedDate}`, 14, 22);
    
    ordersToDownload.forEach((order, index) => {
      if (index > 0) {
        doc.addPage();
      }
      
      doc.setFontSize(14);
      doc.text(`User: ${order.user?.username}`, 14, 50);

      const tableData = order.products.map(item => [
        item.product.name,
        item.quantity.toString(),
        `N${item.product.price.toFixed(2)}`,
        `N${(item.product.price * item.quantity).toFixed(2)}`
      ]);

      (doc as any).autoTable({
        startY: 80,
        head: [['Product', 'Quantity', 'Price', 'Subtotal']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2 },
      });

      const totalY = (doc as any).lastAutoTable.finalY + 10;
      doc.text(`Total : N${(order.total - deliveryFee).toFixed(2)}`, 14, totalY);
    });

    doc.addPage();
    doc.setFontSize(16);
    doc.text(`Total Vendor Fee: ₦${totalVendorFee.toFixed(2)}`, 14, 22);

    doc.save(`vendor-report-${selectedDate}.pdf`);
  };

  const generateVendorReportContent = (ordersToRender: Order[]) => {
    return ordersToRender.map(order => `
      <div style="margin-bottom: 40px; page-break-after: always;">
        <p><strong>User:</strong> ${order.user?.username}</p>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.products.map(item => `
              <tr>
                <td>${item.product.name}</td>
                <td>${item.quantity}</td>
                <td>₦${item.product.price.toFixed(2)}</td>
                <td>₦${(item.product.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <h5><strong>Total:</strong> ₦${(order.total - deliveryFee).toFixed(2)}</h5>
      </div>
    `).join('');
  };

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-amber-600 p-4 md:p-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold mb-8 text-center text-white drop-shadow-lg">Order Management</h2>
          
          <div className="backdrop-blur-xl bg-white/20 p-6 md:p-8 rounded-2xl shadow-xl border border-white/30 transition-all duration-300 hover:shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <input
                  id="date-picker"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 bg-white/30 border border-white/30 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 backdrop-blur-sm w-full sm:w-auto"
                />
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 pl-10 bg-white/30 border border-white/30 rounded-xl text-gray-700 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 backdrop-blur-sm w-full"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={20} />
                </div>
              </div>
              <div className="flex flex-wrap justify-start sm:justify-end space-x-2 w-full sm:w-auto">
                <button 
                  onClick={downloadAsHTML} 
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-gray-700 font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center"
                >
                  <DownloadIcon size={16} className="mr-2" />
                  HTML
                </button>
                <button 
                  onClick={downloadAsPDF} 
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-gray-700 font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center"
                >
                  <DownloadIcon size={16} className="mr-2" />
                  PDF
                </button>
                <div className="relative group">
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-gray-700 font-medium rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center"
                  >
                    <FileTextIcon size={16} className="mr-2" />
                    Vendor Report
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg py-2 z-10 hidden group-hover:block">
                    <a 
                      onClick={downloadVendorReportAsHTML} 
                      className="block px-4 py-2 text-gray-700 hover:bg-amber-100 cursor-pointer"
                    >
                      Download HTML
                    </a>
                    <a 
                      onClick={downloadVendorReportAsPDF} 
                      className="block px-4 py-2 text-gray-700 hover:bg-amber-100 cursor-pointer"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Totals Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-white/30 p-6 rounded-xl backdrop-blur-sm border border-white/20 shadow-md">
              <div className="text-center">
                <div className="text-gray-700 font-medium">Total Delivery Fee</div>
                <div className="text-2xl font-bold text-gray-800">₦{totalDeliveryFee.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-700 font-medium">Total Vendor Fee</div>
                <div className="text-2xl font-bold text-gray-800">₦{totalVendorFee.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-700 font-medium">Total Orders Total</div>
                <div className="text-2xl font-bold text-gray-800">₦{totalOrdersTotal.toFixed(2)}</div>
              </div>
            </div>
  
            <div className="overflow-x-auto rounded-xl bg-white/50 backdrop-blur-sm shadow-md">
              <DataTable
                columns={columns}
                data={searchQuery ? filteredOrders : orders}
                pagination
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                paginationPerPage={25}
                defaultSortFieldId={1}
                onRowClicked={handleRowClick}
                progressPending={loading}
                progressComponent={
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                  </div>
                }
                customStyles={{
                  headRow: {
                    style: {
                      backgroundColor: 'rgba(245, 158, 11, 0.3)',
                      fontWeight: 'bold',
                      color: '#4B5563',
                    },
                  },
                  rows: {
                    style: {
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      '&:nth-of-type(odd)': {
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      },
                      '&:hover': {
                        cursor: 'pointer',
                        backgroundColor: 'rgba(251, 191, 36, 0.3)',
                        transition: 'all 0.2s ease-in-out',
                      },
                    },
                  },
                  cells: {
                    style: {
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      color: '#4B5563',
                    },
                  },
                  pagination: {
                    style: {
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      color: '#4B5563',
                    },
                    pageButtonsStyle: {
                      borderRadius: '50%',
                      height: '40px',
                      width: '40px',
                      padding: '8px',
                      margin: '0px 4px',
                      cursor: 'pointer',
                      transition: '0.2s ease-in-out',
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      '&:hover:not(:disabled)': {
                        backgroundColor: 'rgba(245, 158, 11, 0.5)',
                      },
                    },
                  },
                }}
                responsive
              />
            </div>
          </div>
  
          {/* Order Details Modal */}
          {isModalOpen && selectedOrder && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                  <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center bg-red-500/70 hover:bg-red-600/70 text-white rounded-full transition-colors shadow-md">
                    <XIcon size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/30 p-4 rounded-lg">
                    <p className="text-gray-700"><strong>Order ID:</strong> {selectedOrder._id}</p>
                    <p className="text-gray-700"><strong>User:</strong> {selectedOrder.user?.username}</p>
                    <p className="text-gray-700"><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
                    <p className="text-gray-700">
                      <strong>Status:</strong> 
                      <span className={`ml-2 px-3 py-1 rounded-full ${statusColors[selectedOrder.status.toLowerCase()] || 'bg-gray-200'}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                  </div>
                  
                  <div className="bg-white/30 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Products</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-amber-100/50">
                            <th className="px-4 py-2 text-left text-gray-700">Product</th>
                            <th className="px-4 py-2 text-center text-gray-700">Quantity</th>
                            <th className="px-4 py-2 text-right text-gray-700">Price</th>
                            <th className="px-4 py-2 text-right text-gray-700">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.products.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'}>
                              <td className="px-4 py-3 text-gray-700">{item.product.name}</td>
                              <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-gray-700">₦{item.product.price.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-medium text-gray-700">₦{(item.product.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="bg-white/30 p-4 rounded-lg space-y-2">
                    <p className="text-gray-700 flex justify-between">
                      <strong>Delivery Fee:</strong> 
                      <span>₦{deliveryFee.toFixed(2)}</span>
                    </p>
                    <div className="h-px bg-amber-200/50 my-2"></div>
                    <p className="text-gray-800 text-xl font-bold flex justify-between">
                      <span>Total:</span>
                      <span>₦{selectedOrder.total.toFixed(2)}</span>
                    </p>
                    <p className="text-gray-700 text-lg font-semibold flex justify-between">
                      <span>Vendor Total:</span>
                      <span>₦{(selectedOrder.total - deliveryFee).toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

export default AdminOrderManagement;