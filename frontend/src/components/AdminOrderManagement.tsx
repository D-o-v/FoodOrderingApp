












import { useState, useEffect } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { updateOrderStatus, getOrdersByDate,getDeliveryPrice } from './api';
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



function AdminOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const[ deliveryFee,setDeliveryFee] = useState(0);

  useEffect(() => {
    fetchOrdersByDate();
    fetchDeliveryFee()
  }, [selectedDate]);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, orders]);

  const fetchDeliveryFee = async () => {
    try {
      const response= await getDeliveryPrice();
      setDeliveryFee( response?.data?.deliveryPrice);
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
      order.user.username.toLowerCase().includes(lowercasedQuery) ||
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
      selector: (row) => row.user.username,
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
      order.user.username,
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
              <td>${order.user.username}</td>
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
    // doc.text(`Vendor Report for ${selectedDate}`, 14, 22);
    
    ordersToDownload.forEach((order, index) => {
      if (index > 0) {
        doc.addPage();
      }
      
      doc.setFontSize(14);
      // doc.text(`Order ID: ${order._id}`, 14, 40);
      doc.text(`User: ${order.user.username}`, 14, 50);
      // doc.text(`Date: ${new Date(order.date).toLocaleString()}`, 14, 60);
      // doc.text(`Status: ${order.status}`, 14, 70);

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
      // doc.text(`Total (excluding delivery fee): ₦${(order.total - deliveryFee).toFixed(2)}`, 14, totalY);
    });

    doc.save(`vendor-report-${selectedDate}.pdf`);
  };

  const generateVendorReportContent = (ordersToRender: Order[]) => {
    return ordersToRender.map(order => `
      <div style="margin-bottom: 40px; page-break-after: always;">
        <p><strong>User:</strong> ${order.user.username}</p>
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
    <div className="container mx-auto p-2 sm:p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Order Management</h1>
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input input-bordered w-full sm:w-auto mb-2 sm:mb-0"
            />
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered pl-10 w-full"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          <div className="flex flex-wrap justify-start sm:justify-end space-x-2 w-full sm:w-auto">
            <button onClick={downloadAsHTML} className="btn btn-outline btn-primary btn-sm">
              <DownloadIcon size={16} className="mr-1" />
              HTML
            </button>
            <button onClick={downloadAsPDF} className="btn btn-outline btn-secondary btn-sm">
              <DownloadIcon size={16} className="mr-1" />
              PDF
            </button>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-outline btn-accent btn-sm m-1">
                <FileTextIcon size={16} className="mr-1" />
                Vendor Report
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
                <li><a onClick={downloadVendorReportAsHTML}>Download HTML</a></li>
                <li><a onClick={downloadVendorReportAsPDF}>Download PDF</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={searchQuery ? filteredOrders : orders}
            pagination
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            paginationPerPage={25}
            defaultSortFieldId={1}
            onRowClicked={handleRowClick}
            progressPending={loading}
            progressComponent={<span className="loading loading-spinner loading-lg"></span>}
            customStyles={{
              headRow: {
                style: {
                  backgroundColor: '#f3f4f6',
                  fontWeight: 'bold',
                },
              },
              rows: {
                style: {
                  '&:nth-of-type(odd)': {
                    backgroundColor: '#f9fafb',
                  },
                  '&:hover': {
                    cursor: 'pointer',
                    backgroundColor: '#e5e7eb',
                  },
                },
              },
              cells: {
                style: {
                  paddingLeft: '8px',
                  paddingRight: '8px',
                },
              },
            }}
            responsive
          />
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Order Details</h2>
              <button onClick={closeModal} className="btn btn-ghost btn-circle">
                <XIcon size={24} />
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <p><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p><strong>User:</strong> {selectedOrder.user.username}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Products</h3>
                <div className="overflow-x-auto">
                  <table className="table w-full text-sm sm:text-base">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.products.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product.name}</td>
                          <td>{item.quantity}</td>
                          <td>₦{item.product.price.toFixed(2)}</td>
                          <td>₦{(item.product.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p><strong>Delivery Fee:</strong> ₦{deliveryFee.toFixed(2)}</p>
              <p className="text-lg sm:text-xl font-bold">Total: ₦{selectedOrder.total.toFixed(2)}</p>
              <p className="text-base sm:text-lg font-semibold">Vendor Total: ₦{(selectedOrder.total - deliveryFee).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrderManagement;
