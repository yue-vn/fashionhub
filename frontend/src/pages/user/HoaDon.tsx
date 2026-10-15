import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface Product {
  maChiTietDh: number;
  laCombo: boolean;
  tenSanPham: string;
  soLuong: number;
  gia: number;
  thanhTien: number;
  hinhAnh: string;
  maCombo: number | null;
  maSanPham: string | null;
  combo: ComboDetail | null;
  mauSac?: string;
  kichThuoc?: string;
  mauSacHex?: string;
}

interface ComboDetail {
  tenCombo: string;
  giaCombo: number;
  sanPhamsTrongCombo: {
    tenSanPham: string;
    soLuong: number;
    gia: number;
    thanhTien: number;
    hinhAnh: string;
    maSanPham: string;
    mauSac?: string;
    kichThuoc?: string;
    mauSacHex?: string;
  }[];
}

interface Order {
  maDonHang: number;
  tenNguoiNhan: string;
  ngayDat: string;
  trangThaiDonHang: number;
  trangThaiThanhToan: number;
  hinhThucThanhToan: string;
  paymentStatusText?: string;
  lyDoHuy: string | null;
  tongTien: number;
  finalAmount: number;
  sanPhams: Product[];
  thongTinNguoiDung?: {
    tenNguoiNhan: string;
    diaChi: string;
    sdt: string;
    tenNguoiDat: string;
  };
  thongTinDonHang?: {
    ngayDat: string;
    trangThai: number;
    thanhToan: number;
    hinhThucThanhToan: string;
    trangThaiThanhToan: string;
    soTienGiam: number;
    phiGiaoHang: number;
    thanhTienCuoiCung: number;
    tongTien: number;
  };
}

// ✅ Interface cho QR Code response
interface QRCodeResponse {
  dataUrl?: string;
  qrCode?: string;
  success?: boolean;
  message?: string;
}

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDate = (date: string) => 
  date ? new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }) : "N/A";

const HoaDonPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ✅ State cho QR code
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) {
        setError("Không tìm thấy mã đơn hàng");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // ✅ Sử dụng API từ Orders để có đầy đủ thông tin
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const maNguoiDung = userData?.maNguoiDung;
        
        if (!maNguoiDung) {
          // Nếu không có user, thử API public bill
          const response = await axios.get(`http://localhost:8080/api/user/orders/bill/${orderId}`);
          // ✅ FIX: Type assertion với validation
          const orderData = response.data as Order;
          if (orderData && typeof orderData === 'object' && orderData.maDonHang) {
            setOrder(orderData);
          } else {
            throw new Error("Invalid order data received");
          }
        } else {
          // Nếu có user, lấy từ orders để có đầy đủ thông tin
          const response = await axios.get(`http://localhost:8080/api/user/orders/${maNguoiDung}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          
          // ✅ FIX: Type assertion với validation
          const allOrders = response.data as Order[];
          if (Array.isArray(allOrders)) {
            const targetOrder = allOrders.find((o: Order) => o.maDonHang.toString() === orderId);
            
            if (targetOrder) {
              setOrder(targetOrder);
            } else {
              // Fallback to bill API if not found in user orders
              const billResponse = await axios.get(`http://localhost:8080/api/user/orders/bill/${orderId}`);
              const billData = billResponse.data as Order;
              if (billData && typeof billData === 'object' && billData.maDonHang) {
                setOrder(billData);
              } else {
                throw new Error("Order not found in user orders or bill API");
              }
            }
          } else {
            throw new Error("Invalid response format from orders API");
          }
        }
        
      } catch (error: any) {
        console.error("Error fetching order detail:", error);
        setError("Không thể tải thông tin đơn hàng");
        
        // Try fallback API
        try {
          const response = await axios.get(`http://localhost:8080/api/user/orders/bill/${orderId}`);
          // ✅ FIX: Type assertion với validation
          const fallbackData = response.data as Order;
          if (fallbackData && typeof fallbackData === 'object' && fallbackData.maDonHang) {
            setOrder(fallbackData);
            setError(null);
          } else {
            throw new Error("Invalid fallback data");
          }
        } catch (fallbackError) {
          console.error("Fallback API also failed:", fallbackError);
          setError("Không thể tải thông tin đơn hàng từ cả hai nguồn");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  // ✅ Fetch QR code khi có order
  useEffect(() => {
    const fetchQRCode = async () => {
      if (!order?.maDonHang) return;
      
      try {
        setQrLoading(true);
        const response = await axios.get(`http://localhost:8080/api/OrderNotification/test-qr-base64/${order.maDonHang}`);
        
        // ✅ FIX: Type assertion cho QR response
        const qrData = response.data as QRCodeResponse;
        
        if (qrData && qrData.dataUrl) {
          setQrCodeDataUrl(qrData.dataUrl);
        } else if (qrData && qrData.qrCode) {
          // Fallback: tạo data URL từ base64
          setQrCodeDataUrl(`data:image/png;base64,${qrData.qrCode}`);
        } else {
          // Không có QR data, dùng fallback
          const qrLink = `http://localhost:8080/user/hoadon?orderId=${order.maDonHang}`;
          generateFallbackQR(qrLink);
        }
      } catch (error) {
        console.error("Error fetching QR code:", error);
        // Tạo QR code fallback bằng link trực tiếp
        const qrLink = `http://localhost:8080/user/hoadon?orderId=${order.maDonHang}`;
        generateFallbackQR(qrLink);
      } finally {
        setQrLoading(false);
      }
    };

    fetchQRCode();
  }, [order]);

  // ✅ Fallback QR generation sử dụng thư viện client-side
  const generateFallbackQR = (text: string) => {
    try {
      // Sử dụng QR Code API service online làm fallback
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
      setQrCodeDataUrl(qrApiUrl);
    } catch (error) {
      console.error("Fallback QR generation failed:", error);
    }
  };

  // ✅ Helper function để validate order data
  const isValidOrder = (data: any): data is Order => {
    return data && 
           typeof data === 'object' && 
           typeof data.maDonHang === 'number' &&
           Array.isArray(data.sanPhams);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order || !isValidOrder(order)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-4">{error || "Đơn hàng không tồn tại hoặc dữ liệu không hợp lệ"}</p>
          <button 
            onClick={() => navigate("/user/orders")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại lịch sử đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const getPaymentStatusDisplay = () => {
    if (order.paymentStatusText) return order.paymentStatusText;
    if (order.hinhThucThanhToan === "VNPay") return "Đã thanh toán";
    if (order.hinhThucThanhToan === "COD") {
      return order.trangThaiDonHang === 3 ? "Đã thanh toán" : "Chưa thanh toán";
    }
    return "Chưa thanh toán";
  };

  const getOrderStatusText = () => {
    const statusMap = {
      0: "Chờ xác nhận",
      1: "Đang xử lý", 
      2: "Đang giao hàng",
      3: "Đã hoàn thành",
      4: "Đã thanh toán",
      5: "Đã hủy"
    };
    return statusMap[order.trangThaiDonHang as keyof typeof statusMap] || "Không xác định";
  };

  const renderProductItem = (item: Product) => (
    <div key={item.maChiTietDh} className="border-b border-gray-100 pb-4 mb-4 last:border-b-0">
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
          <img
            src={item.hinhAnh || "/placeholder.svg"}
            alt={item.laCombo ? item.combo?.tenCombo : item.tenSanPham}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">
            {item.laCombo ? item.combo?.tenCombo : item.tenSanPham}
          </h4>
          
          {/* Product Variants for single products */}
          {!item.laCombo && (item.mauSac || item.kichThuoc) && (
            <div className="flex items-center space-x-3 mb-2">
              {item.mauSac && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Màu:</span>
                  <div className="flex items-center space-x-1">
                    {item.mauSacHex && (
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.mauSacHex }}
                      />
                    )}
                    <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">
                      {item.mauSac}
                    </span>
                  </div>
                </div>
              )}
              
              {item.kichThuoc && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Size:</span>
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {item.kichThuoc}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Combo products details */}
          {item.laCombo && item.combo?.sanPhamsTrongCombo && (
            <div className="mt-2 p-2 bg-gray-50 rounded border">
              <div className="text-xs font-medium text-gray-700 mb-2">Sản phẩm trong combo:</div>
              <div className="space-y-1">
                {item.combo.sanPhamsTrongCombo.map((comboProduct, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      {comboProduct.hinhAnh && (
                        <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={comboProduct.hinhAnh}
                            alt={comboProduct.tenSanPham}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-800">{comboProduct.tenSanPham}</div>
                        <div className="flex items-center space-x-2 text-gray-500">
                          {comboProduct.mauSac && (
                            <div className="flex items-center space-x-1">
                              <span>Màu:</span>
                              {comboProduct.mauSacHex && (
                                <div 
                                  className="w-2 h-2 rounded-full border border-gray-300"
                                  style={{ backgroundColor: comboProduct.mauSacHex }}
                                />
                              )}
                              <span className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                                {comboProduct.mauSac}
                              </span>
                            </div>
                          )}
                          {comboProduct.kichThuoc && (
                            <div className="flex items-center space-x-1">
                              <span>Size:</span>
                              <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                                {comboProduct.kichThuoc}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-600">x{comboProduct.soLuong}</div>
                      <div className="font-medium">{formatCurrency(comboProduct.gia)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">
              {item.soLuong} x {formatCurrency(item.gia)}
            </span>
            <span className="font-medium text-gray-900">
              {formatCurrency(item.thanhTien)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-pink-600 mb-2">📦 UltraStore</h1>
            <h2 className="text-xl font-semibold text-pink-600">Đơn hàng đã được xác nhận</h2>
            <p className="text-gray-600 mt-2">
              Cảm ơn <strong>{order.tenNguoiNhan || order.thongTinNguoiDung?.tenNguoiNhan}</strong> đã đặt hàng tại UltraStore!
            </p>
          </div>

          {/* Order Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <div className="text-green-600 mr-2">✅</div>
              <span className="font-medium text-green-800">
                Trạng thái: {getOrderStatusText()}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Thông tin đơn hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Mã đơn hàng:</span>
              <span className="ml-2 text-pink-600 font-bold text-lg">ORD-{order.maDonHang.toString().padStart(5, '0')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Ngày đặt:</span>
              <span className="ml-2 text-gray-900">{formatDate(order.ngayDat)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phương thức thanh toán:</span>
              <span className="ml-2 text-gray-900">{order.hinhThucThanhToan || 'COD'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Trạng thái thanh toán:</span>
              <span className={`ml-2 font-medium ${
                getPaymentStatusDisplay() === "Đã thanh toán" ? 'text-green-600' : 'text-orange-600'
              }`}>
                {getPaymentStatusDisplay()}
              </span>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🛍️ Sản phẩm đã đặt</h3>
          <div className="space-y-4">
            {order.sanPhams?.map(renderProductItem)}
          </div>
        </div>

        {/* ✅ FIX: Order Summary với dòng giảm giá luôn hiển thị */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Tổng kết đơn hàng</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tổng phụ:</span>
              <span className="font-medium">{formatCurrency(order.thongTinDonHang?.tongTien || order.tongTien)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vận chuyển:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(order.thongTinDonHang?.phiGiaoHang || 0)}
              </span>
            </div>
            
            {/* ✅ FIX: Luôn hiển thị dòng giảm giá */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Giảm giá:</span>
              <span className={`font-medium ${
                (order.thongTinDonHang?.soTienGiam || 0) > 0 
                  ? 'text-red-600' 
                  : 'text-gray-600'
              }`}>
                {(order.thongTinDonHang?.soTienGiam || 0) > 0 
                  ? `-${formatCurrency(order.thongTinDonHang.soTienGiam)}`
                  : formatCurrency(0)
                }
              </span>
            </div>
            
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Tổng cộng:</span>
                <span className="text-xl font-bold text-pink-600">
                  {formatCurrency(order.thongTinDonHang?.thanhTienCuoiCung || order.finalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.thongTinNguoiDung && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏠 Địa chỉ giao hàng</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <div><strong>{order.thongTinNguoiDung.tenNguoiNhan}</strong></div>
              <div>{order.thongTinNguoiDung.sdt}</div>
              <div>{order.thongTinNguoiDung.diaChi}</div>
            </div>
          </div>
        )}

        {/* ✅ QR Code Section với QR thực tế */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Quét mã QR để xem hóa đơn trực tuyến</h3>
          <div className="flex justify-center mb-4">
            <div className="relative w-48 h-48 bg-white border-2 border-pink-300 rounded-lg flex items-center justify-center shadow-lg">
              {qrLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-2"></div>
                  <div className="text-sm text-gray-500">Đang tạo QR...</div>
                </div>
              ) : qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code cho đơn hàng ORD-${order.maDonHang.toString().padStart(5, '0')}`}
                  className="w-44 h-44 object-contain rounded"
                  onError={(e) => {
                    console.error("QR image failed to load");
                    // Fallback khi ảnh QR không load được
                    const qrLink = `http://localhost:8080/user/hoadon?orderId=${order.maDonHang}`;
                    generateFallbackQR(qrLink);
                  }}
                />
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2 text-gray-400">📱</div>
                  <div className="text-sm text-gray-500">QR Code không khả dụng</div>
                  <button
                    onClick={() => {
                      const qrLink = `http://localhost:8080/user/hoadon?orderId=${order.maDonHang}`;
                      generateFallbackQR(qrLink);
                    }}
                    className="mt-2 text-pink-600 hover:text-pink-700 text-sm underline"
                  >
                    Thử tạo lại
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Quét mã QR này để truy cập hóa đơn trực tuyến bất cứ lúc nào
          </p>
          
          {/* Fallback link */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Hoặc truy cập trực tiếp:</p>
            <a
              href={`http://localhost:8080/user/hoadon?orderId=${order.maDonHang}`}
              className="text-pink-600 hover:text-pink-700 text-sm font-medium underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              http://localhost:8080/user/hoadon?orderId={order.maDonHang}
            </a>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button 
            onClick={() => navigate("/user/orders")}
            className="bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium"
          >
            ← Quay lại lịch sử đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default HoaDonPage;