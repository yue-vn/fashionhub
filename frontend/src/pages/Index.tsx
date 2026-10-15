
import { cn, formatImageSrc } from "@/lib/utils";
import { useEffect, useRef, useState, Component, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Clock, Calendar, Gift, Percent, Timer ,Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, Sun, Moon, CalendarDays, Tag, Eye, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/default/HeroSection";
import Newsletter from "@/components/default/Newsletter";
import Features from "@/components/default/Features";
import CategoryView from "@/components/default/CategoryView";
import { BlogList } from "@/components/default/BlogList";
import VoucherUser from "@/components/layout/voucher/VoucherUser";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CartItem } from "@/types/cart";
import Swal from "sweetalert2";
import { } from 'lucide-react';
import FlipCountdownTimer from "@/components/user/KhuyenMai/KhuyenMaiList"; 

interface PromotionItem {
  id: number;
  idSanPham?: string;
  idCombo?: number;
  tenSanPhamCombo: string;
  giaMoi: number;
  percent: number;
  giaGoc: number;
  hinhAnh: string[];
}

interface PromotionData {
  id: number;
  tenKhuyenMai: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  percentChung: number;
  hinhAnh: string[];
  danhSachKhuyenMai: PromotionItem[];
  moTa: {
    header: {
      title: string;
    };
    Picture: Array<{
      url: string;
    }>;
    title: Array<{
      name: string;
      subtitle: Array<{
        name: string;
        description: {
          content: string;
        };
        picture: {
          url: string;
        };
      }>;
      picture: {
        url: string;
      };
    }>;
  };
}

interface ApiProduct {
  id: string;
  name: string;
  thuongHieu: string;
  loaiSanPham: string;
  kichThuoc: string[];
  soLuong: number;
  donGia: number;
  moTa: string | null;
  chatLieu: string;
  mauSac: string[];
  hinh: string[];
  ngayTao: string;
  trangThai: number;
  soLuongDaBan: number;
  gioiTinh: string;
  hot: boolean;
  listHashTag: {
    id: number;
    name: string;
  }[];
  khuyenMaiMax: number;
}

interface ApiComboSanPham {
  id: number;
  idSanPham: string;
  name: string;
  thuongHieu: string;
  loaiSanPham: string;
  kichThuoc: string[];
  soLuong: number;
  donGia: number;
  moTa: string | null;
  chatLieu: string;
  mauSac: string[];
  hinh: string[];
  ngayTao: string;
  trangThai: number;
}

interface ApiCombo {
  maCombo: number;
  name: string;
  hinhAnh: string;
  sanPhams: ApiComboSanPham[];
  moTa: string;
  gia: number;
  trangThai: boolean;
  soLuong: number;
  ngayTao: string;
  khuyenMaiMax: number;
}

interface UserData {
  maNguoiDung?: string;
  hoTen?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  price: number;
  sizes: string[];
  colors: string[];
  averageRating: number;
  commentCount: number;
  isFavorite: boolean;
  hot: boolean;
  likedId?: string;
  hashTags: {
    id: number;
    name: string;
  }[];
  discountPercent: number;
  thuongHieu: string;
  chatLieu: string;
  soLuongDaBan: number;
}

interface Combo {
  id: number;
  name: string;
  description: string;
  imageSrc: string;
  price: number;
  originalPrice: number;
  products: {
    id: string;
    name: string;
    brand: string;
    material: string;
    type: string;
    price: number;
    quantity: number;
    colors: string[];
    hinh: string;
  }[];
  isFavorite: boolean;
  likedId?: string;
  savings: number;
  savingsPercentage: number;
  savingsPercentageComparedToRetail: number;
  productCount: number;
  discountPercent: number;
  allImages: string[];
}

const showNotification = (message: string, type: "success" | "error" | "warning") => {
  return Swal.fire({
    title: type === "error" ? "Lỗi!" : type === "warning" ? "Cảnh báo!" : "Thành công!",
    text: message,
    icon: type,
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = { hasError: false };

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-500 p-4">
          <p>Đã xảy ra lỗi khi hiển thị combo.</p>
          <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
            Thử lại
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

const transformProductApiData = (apiData: ApiProduct[], commentData: any[], yeuThichData: any[]): Product[] => {
  const activeProducts = apiData.filter((item) => item.trangThai === 1);

  return activeProducts.map((item) => {
    const baseProductId = item.id.split("_")[0] || item.id;
    const productComments = commentData.filter(
      (comment) => comment?.maSanPham === baseProductId && comment?.trangThai === 1
    );
    const totalRating = productComments.reduce(
      (sum: number, comment: any) => sum + (comment?.danhGia || 0),
      0
    );
    const averageRating = productComments.length > 0 ? totalRating / productComments.length : 0;
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = userData?.maNguoiDung;
    const userFavorite = yeuThichData.find(
      (yeuThich) => yeuThich?.maSanPham === baseProductId && yeuThich?.maNguoiDung === currentUserId
    );

    return {
      id: item.id,
      name: item.name || "Không có tên",
      description: item.moTa || `Thương hiệu: ${item.thuongHieu || "Không xác định"} <br/> Chất liệu: ${item.chatLieu || "Không xác định"}`,
      imageSrc: item.hinh[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3C/svg%3E",
      price: item.donGia || 0,
      sizes: item.kichThuoc || [],
      colors: item.mauSac || [],
      averageRating,
      commentCount: productComments.length,
      isFavorite: !!userFavorite,
      hot: item.hot || false,
      likedId: userFavorite?.maYeuThich,
      hashTags: item.listHashTag || [],
      discountPercent: item.khuyenMaiMax || 0,
      thuongHieu: item.thuongHieu || "Không xác định",
      chatLieu: item.chatLieu || "Không xác định",
      soLuongDaBan: item.soLuongDaBan || 0,
    };
  });
};
const FlipCountdownTimer = ({ endDate, promotionId }) => {
  const flipdownRef = useRef(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);
    
    const endTimestamp = Math.floor(endDateTime.getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);

    if (endTimestamp <= now) {
      setIsExpired(true);
      return;
    }

    if (!document.getElementById('flipdown-css')) {
      const cssLink = document.createElement('link');
      cssLink.id = 'flipdown-css';
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://pbutcher.uk/flipdown/css/flipdown/flipdown.css';
      document.head.appendChild(cssLink);
    }

    if (!window.FlipDown) {
      const script = document.createElement('script');
      script.src = 'https://pbutcher.uk/flipdown/js/flipdown/flipdown.js';
      script.onload = () => {
        initFlipDown();
      };
      document.body.appendChild(script);
    } else {
      initFlipDown();
    }

    function initFlipDown() {
      if (flipdownRef.current && window.FlipDown) {
        try {
          flipdownRef.current.innerHTML = '';
          const flipdownId = `flipdown-${promotionId}`;
          flipdownRef.current.id = flipdownId;
          const flipdown = new window.FlipDown(endTimestamp, flipdownId)
            .start()
            .ifEnded(() => {
              setIsExpired(true);
              if (flipdownRef.current) {
                flipdownRef.current.innerHTML = `<h2 style="color: #fca5a5; font-weight: bold; text-align: center; padding: 20px;">Timer is ended</h2>`;
              }
            });
        } catch (error) {
          console.error('FlipDown initialization error:', error);
          setIsExpired(true);
        }
      }
    }

    return () => {
      if (flipdownRef.current) {
        flipdownRef.current.innerHTML = '';
      }
    };
  }, [endDate, promotionId]);

  if (isExpired) {
    return (
      <div className="bg-red-500/20 border border-red-300/50 rounded-xl p-4 text-center">
        <p className="text-red-300 font-bold text-lg">⏰ Khuyến mại đã hết hạn</p>
      </div>
    );
  }

  return (
    <div className="count-down" style={{ width: '550px', maxHeight: '300px', marginLeft: '-105px', padding: '20px', overflow: 'hidden', scale: '0.4' }}>
      <div ref={flipdownRef} className="flipdown" style={{ margin: 'auto', width: '600px', marginTop: '-30px', maxHeight: '200px', overflow: 'hidden' }}></div>
      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        .count-down {
          width: 550px;
          max-height: 300px;
          margin: auto;
          padding: 20px;
          overflow: hidden;
        }
        .count-down .flipdown {
          margin: auto;
          width: 600px;
          margin-top: 30px;
          max-height: 200px;
          overflow: hidden;
        }
        .count-down h1 {
          text-align: center;
          font-weight: 400;
          font-size: 2em;
          margin-top: 0;
          margin-bottom: 10px;
        }
        @media (max-width: 550px) {
          .count-down {
            width: 100%;
            height: 362px;
          }
          .count-down h1 {
            font-size: 1.5em;
          }
        }
      `}</style>
    </div>
  );
};
const getPromotionDiscount = (promotion) => {
  if (promotion.percentChung !== null && promotion.percentChung !== undefined) {
    return promotion.percentChung;
  }
  if (promotion.danhSachKhuyenMai && promotion.danhSachKhuyenMai.length > 0) {
    return Math.max(...promotion.danhSachKhuyenMai.map(item => item.percent || 0));
  }
  return 0;
};

const getTimeRemaining = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { text: 'Đã hết hạn', status: 'expired' };
  if (diffDays === 0) return { text: 'Hết hạn hôm nay', status: 'urgent' };
  if (diffDays === 1) return { text: 'Còn 1 ngày', status: 'urgent' };
  if (diffDays <= 3) return { text: `Còn ${diffDays} ngày`, status: 'warning' };
  return { text: `Còn ${diffDays} ngày`, status: 'normal' };
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
const transformComboApiData = (apiData: ApiCombo[], yeuThichData: any[]): Combo[] => {
  const activeCombos = apiData.filter((item) => item.trangThai === true);

  return activeCombos.map((item) => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = userData?.maNguoiDung;
    const userFavorite = yeuThichData.find(
      (yt) => yt?.maCombo === item.maCombo && yt?.maNguoiDung === currentUserId
    );

    const totalRetailPrice = item.sanPhams.reduce(
      (sum, p) => sum + (p.donGia * (p.soLuong || 1)),
      0
    );

    const comboPrice = item.gia;

    const finalPrice = Math.round(comboPrice * (1 - (item.khuyenMaiMax || 0) / 100));

    const savingsPercentageComparedToRetail = Math.round(
      ((totalRetailPrice - comboPrice) / totalRetailPrice) * 100
    );

    const savings = totalRetailPrice - finalPrice;

    const products = item.sanPhams.map((p) => ({
      id: p.idSanPham || p.id?.toString() || '',
      name: p.name || 'Không có tên',
      brand: p.thuongHieu || 'Không xác định',
      material: p.chatLieu || 'Không xác định',
      type: p.loaiSanPham || 'Không xác định',
      price: p.donGia || 0,
      quantity: p.soLuong || 1,
      colors: p.mauSac || [],
      hinh: p.hinh[0]
    }));

    const allImages: string[] = [];
    if (item.hinhAnh) allImages.push(item.hinhAnh);
    item.sanPhams.forEach((p) => {
      if (Array.isArray(p.hinh)) allImages.push(...p.hinh);
    });

    return {
      id: item.maCombo,
      name: item.name,
      description: item.moTa,
      imageSrc: allImages[0] || '',
      price: finalPrice,
      originalPrice: totalRetailPrice,
      products,
      isFavorite: !!userFavorite,
      likedId: userFavorite?.maYeuThich,
      savings,
      savingsPercentage: item.khuyenMaiMax || 0,
      savingsPercentageComparedToRetail,
      productCount: products.length,
      discountPercent: item.khuyenMaiMax || 0,
      allImages
    };
  });
};

const PromotionCard = ({ promotion }: { promotion: PromotionData }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    try {
      const today = new Date();
      const end = new Date(endDate);
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch {
      return 0;
    }
  };

  const getDiscountPercent = () => {
    if (promotion.percentChung && promotion.percentChung > 0) {
      return promotion.percentChung;
    }
    
    if (promotion.danhSachKhuyenMai && promotion.danhSachKhuyenMai.length > 0) {
      const maxPercent = Math.max(...promotion.danhSachKhuyenMai.map(item => item.percent || 0));
      return maxPercent;
    }
    
    return 0;
  };

  const getMainImage = () => {
    if (promotion.moTa?.Picture && promotion.moTa.Picture.length > 0) {
      return promotion.moTa.Picture[0].url;
    }
    if (promotion.hinhAnh && promotion.hinhAnh.length > 0) {
      return promotion.hinhAnh[0];
    }
    return null;
  };

  const daysRemaining = calculateDaysRemaining(promotion.ngayKetThuc);
  const mainImage = getMainImage();
  const discountPercent = getDiscountPercent();

  return (
    <Card className="overflow-hidden h-full relative">
      <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        {mainImage && (
          <img
            src={formatImageSrc(mainImage)}
            alt={promotion.tenKhuyenMai}
            className="w-full h-full object-cover"
          />
        )}
        
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="absolute top-4 right-4 bg-gradient-to-br from-red-500 to-red-600 text-white p-3 min-w-[80px] min-h-[80px] flex flex-col items-center justify-center shadow-lg z-10">
          <div className="text-xs font-medium leading-tight text-center">
            Giảm tới
          </div>
          <div className="text-lg font-bold leading-none">
            {discountPercent > 0 ? discountPercent : 'Tới'}%
          </div>
        </div>
        
        <div className="absolute top-4 left-4">
          <Badge className={`${daysRemaining > 0 ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
            {daysRemaining > 0 ? 'Đang diễn ra' : 'Đã kết thúc'}
          </Badge>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
            {promotion.tenKhuyenMai}
          </h3>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">
              {formatDate(promotion.ngayBatDau)} - {formatDate(promotion.ngayKetThuc)}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">
              {promotion.percentChung && promotion.percentChung > 0 
                ? `Giảm giá chung ${promotion.percentChung}% toàn bộ sản phẩm` 
                : `Giảm giá theo sản phẩm (tối đa ${discountPercent}%)`
              }
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Áp dụng cho: {promotion.percentChung && promotion.percentChung > 0 
                ? 'Toàn bộ sản phẩm' 
                : `${promotion.danhSachKhuyenMai.length} sản phẩm`
              }
            </span>
            <span className="text-sm font-medium text-blue-600">
              Còn lại: {daysRemaining} ngày
            </span>
          </div>
        </div>

        {(!promotion.percentChung || promotion.percentChung === 0) && 
         promotion.danhSachKhuyenMai && promotion.danhSachKhuyenMai.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">
              Sản phẩm và Combo khuyến mãi:
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {promotion.danhSachKhuyenMai.slice(0, 3).map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {item.hinhAnh && item.hinhAnh.length > 0 && (
                    <img
                      src={formatImageSrc(item.hinhAnh[0])}
                      alt={item.tenSanPhamCombo}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.tenSanPhamCombo}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-red-600">
                        {item.giaMoi.toLocaleString('vi-VN')} VND
                      </span>
                      {item.giaGoc > item.giaMoi && (
                        <span className="text-xs text-gray-500 line-through">
                          {item.giaGoc.toLocaleString('vi-VN')} VND
                        </span>
                      )}
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        -{item.percent}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {promotion.danhSachKhuyenMai.length > 3 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  +{promotion.danhSachKhuyenMai.length - 3} sản phẩm khác
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Tag className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-800 font-medium">
              {promotion.percentChung && promotion.percentChung > 0
                ? `Giảm giá ${promotion.percentChung}% cho toàn bộ sản phẩm và combo`
                : `Giảm giá cho ${promotion.danhSachKhuyenMai.length} sản phẩm được chọn`
              }
            </span>
          </div>
          
          <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
            {promotion.percentChung && promotion.percentChung > 0
              ? `Tất cả sản phẩm và combo trong cửa hàng được giảm giá ${promotion.percentChung}%`
              : `Giảm giá từ 1% đến ${discountPercent}% cho các sản phẩm được chọn`
            }
          </div>
        </div>

        <div className="flex gap-2 mt-4 absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="flex-1" size="sm">
            <Link to={`/KhuyenMais/${promotion.id}`}>
              Xem chi tiết
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductCard = ({
  product,
  index,
  toggleFavorite,
}: {
  product: Product;
  index: number;
  toggleFavorite: (productId: string) => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleBuyNow = () => {
    const cartItem: CartItem = {
      id: parseInt(product.id),
      name: product.name,
      image: product.imageSrc,
      price: product.price,
      quantity: 1,
      type: "product",
    };
    console.log("Đã thêm vào giỏ hàng:", cartItem);
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name} đã được thêm vào giỏ hàng của bạn.`,
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <Card className="overflow-hidden group relative" style={{ height: "650px" }}>
        <div className="relative aspect-square">
          <Link to={`/products/${product.id}`}>
            <img
              src={formatImageSrc(product.imageSrc)}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {product.hot && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white z-10">
              Đang bán chạy
            </Badge>
          )}

          {product.discountPercent > 0 && (
            <div className="absolute top-0 right-0 bg-gradient-to-br from-red-500 to-red-600 text-white p-3 min-w-[80px] min-h-[80px] flex flex-col items-center justify-center shadow-lg z-10">
              <div className="text-xs font-medium leading-tight text-center">
                Giảm tới
              </div>
              <div className="text-lg font-bold leading-none">
                {product.discountPercent}%
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 hover:bg-white z-10"
            onClick={() => toggleFavorite(product.id)}
            aria-label={product.isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            <Heart
              className={`h-4 w-4 ${product.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </Button>
        </div>

        <CardContent className="p-4">
          <Link to={`/products/${product.id}`}>
            <h3 className="font-medium hover:text-crocus-600 transition-colors mb-3 line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <div className="flex justify-between items-start mb-3">
            <div className="flex flex-col">
              {product.discountPercent > 0 ? (
                <>
                  <p className="font-bold text-lg text-red-600 mb-1">
                    {Math.round(product.price * (1 - product.discountPercent / 100)).toLocaleString('vi-VN')} VND
                  </p>
                  <p className="text-sm text-gray-500 line-through">
                    {product.price.toLocaleString('vi-VN')} VND
                  </p>
                </>
              ) : (
                <p className="font-semibold text-lg text-red-600">
                  {product.price.toLocaleString('vi-VN')} VND
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => {
                if (i < Math.floor(product.averageRating)) {
                  return <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
                } else if (i < Math.ceil(product.averageRating)) {
                  return <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" fill="half" />;
                } else {
                  return <Star key={i} className="w-4 h-4 text-gray-300" />;
                }
              })}
              <span className="text-sm text-gray-600">({product.commentCount})</span>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-1">
            <span className="text-xs text-gray-500 mr-2">Màu:</span>
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color}
                className="inline-block w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: `#${color}` }}
                title={`Màu #${color}`}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-gray-500 ml-1">+{product.colors.length - 4}</span>
            )}
          </div>

          <div className="mb-2 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="text-xs px-2 py-1 bg-blue-50 border-blue-200 text-blue-700 font-medium"
            >
              🏷️ {product.thuongHieu}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs px-2 py-1 bg-green-50 border-green-200 text-green-700 font-medium"
            >
              🧵 {product.chatLieu}
            </Badge>
          </div>

          {product.hashTags && product.hashTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1">
              {product.hashTags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-crocus-100 text-crocus-700 hover:bg-crocus-200"
                >
                  #{tag.name}
                </Badge>
              ))}
              {product.hashTags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{product.hashTags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-2 absolute bottom-4 left-4 right-4">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link to={`/products/${product.id}`}>Chi tiết</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ImageGallery = ({ images, comboName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="w-full">
      <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={formatImageSrc(images[currentImageIndex])}
          alt={`${comboName} - Hình ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="w-full">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2">
              {images.map((image, index) => (
                <CarouselItem key={index} className="basis-1/3 pl-2">
                  <div
                    className={cn(
                      "aspect-square bg-gray-100 rounded cursor-pointer overflow-hidden border-2 transition-all",
                      currentImageIndex === index ? "border-crocus-500" : "border-transparent hover:border-gray-300"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={formatImageSrc(image)}
                      alt={`${comboName} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 3 && (
              <>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </>
            )}
          </Carousel>
        </div>
      )}
    </div>
  );
};

const ComboSlideCard = ({ combo, toggleFavorite }) => {
  return (
    <Card 
      className="overflow-hidden h-full"
      style={{
        backgroundColor: '#EBE7FD'
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-[500px]" style={{scale: '0.8'}}>
        <div className="relative p-6 bg-gray-50/80 backdrop-blur-sm">
          {combo.discountPercent > 0 && (
            <div className="absolute top-4 right-4 bg-gradient-to-br from-red-500 to-red-600 text-white p-3 min-w-[80px] min-h-[80px] flex flex-col items-center justify-center shadow-lg z-10 rounded">
              <div className="text-xs font-medium text-gray-50">Khuyến Mãi</div>
              <div className="text-lg font-bold"> -{combo.discountPercent}%</div>
            </div>
          )}
          {combo.savingsPercentageComparedToRetail > 0 && (
            <div className="absolute top-4 right-28 bg-blue-500 text-white p-3 rounded shadow-lg z-10 flex flex-col items-center">
              <div className="text-xs font-medium">Đã Giảm</div>
              <div className="text-lg font-bold">{combo.savingsPercentageComparedToRetail}%</div>
            </div>
          )}
          <ImageGallery images={combo.allImages} comboName={combo.name} />
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/80 hover:bg-white z-10"
            onClick={() => toggleFavorite(combo.id)}
            aria-label={combo.isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            <Heart
              className={`h-5 w-5 ${combo.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </Button>
        </div>

        <div className="p-6 flex flex-col justify-between bg-white/80 backdrop-blur-sm">
          <div>
            <Link to={`/combos/${combo.id}`}>
              <h3 className="text-2xl font-bold hover:text-crocus-600 transition-colors mb-3">{combo.name}</h3>
            </Link>
            <div className="mb-4">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-red-600">
                  {combo.price.toLocaleString('vi-VN')} VND
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {combo.originalPrice.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <p className="text-sm text-green-700 font-semibold bg-green-50 px-3 py-2 rounded-lg inline-block">
                💰 Tiết kiệm {combo.savings.toLocaleString('vi-VN')} VND
              </p>
            </div>

            <Badge className="mb-4 bg-crocus-500 text-white px-3 py-1">
              📦 {combo.productCount} sản phẩm trong combo
            </Badge>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">Sản phẩm trong combo:</h4>
              <div className="space-y-3">
                {combo.products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                  >
                    <div className="grid grid-cols-3 gap-4 items-start">
                      <div className="flex flex-col items-center">
                        <Link to={`/product/${product.id}`}>
                          <img
                            src={formatImageSrc(product.hinh)}
                            alt={product.name}
                            className="w-full max-w-[200px] object-contain rounded shadow"
                          />
                          <p className="font-semibold text-lg text-gray-800 mt-2 text-center">{product.name}</p>
                        </Link>                        
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          Số lượng:{" "}
                          <span className="font-medium text-gray-800">{product.quantity}</span>
                        </p>
                        <p className="text-gray-600">
                          Thương hiệu:{" "}
                          <span className="font-medium text-gray-800">{product.brand}</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {product.colors.map((color) => (
                            <span
                              key={color}
                              className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                              style={{ backgroundColor: `#${color}` }}
                              title={`Màu ${color}`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          Chất liệu:{" "}
                          <span className="font-medium text-gray-800">{product.material}</span>
                        </p>
                        <p className="text-gray-600">
                          Giá gốc:{" "}
                          <span className="font-bold text-lg text-red-600">
                            {product.price.toLocaleString("vi-VN")} VND
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button asChild variant="outline" className="flex-1">
                <Link to={`/combos/${combo.id}`}>Xem chi tiết</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const ComboSlider = ({
  combos,
  toggleFavorite,
}: {
  combos: Combo[];
  toggleFavorite: (comboId: number) => void;
}) => {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {combos.map((combo) => (
          <CarouselItem key={combo.id} className="basis-full">
            <ComboSlideCard combo={combo} toggleFavorite={toggleFavorite} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [promotions, setPromotions] = useState<PromotionData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCombos, setLoadingCombos] = useState(true);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [errorCombos, setErrorCombos] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [scrollY, setScrollY] = useState(0);
  const [isMultiLayerActive, setIsMultiLayerActive] = useState(false);
  const multiLayerRef = useRef<HTMLDivElement>(null);
  const [multiLayerScrollY, setMultiLayerScrollY] = useState(0);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const layers = [
    { 
      id: 'products', 
      title: 'Sản Phẩm Bán Chạy', 
      bg: 'from-indigo-900 to-purple-900', 
      color: 'from-indigo-500/50 to-purple-500/50',
      content: 'products'
    },
    { 
      id: 'combos', 
      title: 'Combo Tiết Kiệm', 
      bg: 'from-purple-900 to-pink-900', 
      color: 'from-purple-500/50 to-pink-500/50',
      content: 'combos'
    },
    { 
      id: 'promotions', 
      title: 'Khuyến Mãi Hấp Dẫn', 
      bg: 'from-yellow-900 to-green-900', 
      color: 'from-yellow-500/50 to-green-500/50',
      content: 'promotions'
    }
  ];
  const scrollSegment = 400;
  const totalLayers = layers.length;
  const activeLayerIndex = currentLayerIndex;
  const transitionProgress = 0;
  const maxMultiLayerScroll = (totalLayers - 1) * scrollSegment;
  const effectiveScrollY = isMultiLayerActive ? multiLayerScrollY : scrollY;
  const rawScrollProgress = effectiveScrollY / scrollSegment;
  const scrollProgress = Math.min(rawScrollProgress, totalLayers - 1); 

    
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

useEffect(() => {
  const handleScroll = () => {
    if (!multiLayerRef.current) return;

    const rect = multiLayerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const multiLayerMiddle = rect.top + rect.height / 2;
    const windowMiddle = windowHeight / 2;

    const isMultiLayerCentered = Math.abs(multiLayerMiddle - windowMiddle) < 100;

    // Nếu multi-layer ở giữa màn hình thì active
    if (isMultiLayerCentered && !isMultiLayerActive) {
      // Nếu cuộn từ trên xuống thì bắt đầu từ layer đầu tiên
      // Nếu cuộn từ dưới lên thì bắt đầu từ layer cuối cùng
      if (rect.top > 0) {
        setCurrentLayerIndex(0); // từ trên xuống
      } else {
        setCurrentLayerIndex(layers.length - 1); // từ dưới lên
      }
      setIsMultiLayerActive(true);
      document.body.style.overflow = "hidden";
    }
    // Nếu multi-layer không ở giữa màn hình thì tắt active
    if (!isMultiLayerCentered && isMultiLayerActive) {
      setIsMultiLayerActive(false);
      document.body.style.overflow = "auto";
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", handleScroll);
    document.body.style.overflow = "auto";
  };
}, [isMultiLayerActive, layers.length]);
useEffect(() => {
  const handleWheel = (e: WheelEvent) => {
    if (!isMultiLayerActive || isTransitioning) return;

    const scrollDirection = e.deltaY;
    const scrollThreshold = 50;

    // Nếu ở layer cuối cùng và cuộn xuống, tắt multi-layer, cho phép trang web scroll tiếp
    if (currentLayerIndex === totalLayers - 1 && scrollDirection > 0) {
      document.body.style.overflow = "auto";
      setIsMultiLayerActive(false);
      return;
    }
    // Nếu ở layer đầu tiên và cuộn lên, tắt multi-layer, cho phép trang web scroll lên tiếp
    if (currentLayerIndex === 0 && scrollDirection < 0) {
      document.body.style.overflow = "auto";
      setIsMultiLayerActive(false);
      return;
    }

    // Chỉ chuyển layer khi chưa ở đầu/cuối
    if (Math.abs(scrollDirection) < scrollThreshold) return;

    e.preventDefault();
    setIsTransitioning(true);

    if (scrollDirection > 0 && currentLayerIndex < totalLayers - 1) {
      setCurrentLayerIndex(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 600);
    } else if (scrollDirection < 0 && currentLayerIndex > 0) {
      setCurrentLayerIndex(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  if (isMultiLayerActive) {
    document.body.style.overflow = "hidden";
    window.addEventListener("wheel", handleWheel, { passive: false });
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    window.removeEventListener("wheel", handleWheel);
    document.body.style.overflow = "auto";
  };
}, [isMultiLayerActive, currentLayerIndex, totalLayers, isTransitioning]);
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isMultiLayerActive || isTransitioning) return;
    
    setIsTransitioning(true);
    
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      if (currentLayerIndex < totalLayers - 1) {
        setCurrentLayerIndex(prev => prev + 1);
        setTimeout(() => setIsTransitioning(false), 600);
      } else {
        setIsMultiLayerActive(false);
        document.body.style.overflow = 'auto';
        setIsTransitioning(false);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      if (currentLayerIndex > 0) {
        setCurrentLayerIndex(prev => prev - 1);
        setTimeout(() => setIsTransitioning(false), 600);
      } else {
        setIsMultiLayerActive(false);
        document.body.style.overflow = 'auto';
        setIsTransitioning(false);
      }
    }
  };

  if (isMultiLayerActive) {
    window.addEventListener('keydown', handleKeyDown);
  }
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [isMultiLayerActive, currentLayerIndex, totalLayers, isTransitioning]);

  const getLayerTransform = (index: number) => {
    const relativeIndex = index - activeLayerIndex;
    
    // Chỉ hiển thị layer hiện tại và 2 layer kế cận
    if (Math.abs(relativeIndex) > 2) {
      return {
        transform: 'translateZ(-1000px)',
        opacity: 0,
        zIndex: -1,
        scale: 0.5,
      };
    }
    
    const stackDepth = Math.abs(relativeIndex) * 80;
    const stackOffsetX = relativeIndex * 50;
    const stackOffsetY = relativeIndex * -30;
    
    const finalZ = relativeIndex < 0 ? stackDepth : -stackDepth;
    const finalX = stackOffsetX;
    const finalY = stackOffsetY;
    
    const rotationX = -10;
    const rotationY = relativeIndex < 0 ? -20 : relativeIndex > 0 ? 20 : 0;
    
    return {
      transform: `
        translateX(${finalX}px) 
        translateY(${finalY}px) 
        translateZ(${finalZ}px) 
        rotateX(${rotationX}deg) 
        rotateY(${rotationY}deg)
      `,
      opacity: relativeIndex === 0 ? 1 : Math.max(0.3, 1 - Math.abs(relativeIndex) * 0.4),
      zIndex: totalLayers - Math.abs(relativeIndex),
      scale: relativeIndex === 0 ? 1 : 1 - Math.abs(relativeIndex) * 0.1,
    };
  };

  const currentBg = layers[activeLayerIndex]?.bg || 'from-purple-900 to-indigo-900';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProducts(true);
        setLoadingCombos(true);
        setLoadingPromotions(true);

        const commentResponse = await fetch("http://localhost:8080/api/Comment/list");
        if (!commentResponse.ok) throw new Error("Không thể tải bình luận");
        const commentData = await commentResponse.json();

        let userData: UserData = {};
        try {
          const user = localStorage.getItem("user");
          userData = user ? JSON.parse(user) : {};
        } catch (error) {
          console.error("Lỗi parse user data:", error);
        }
        const currentUserId = userData?.maNguoiDung;
        let yeuThichData: any[] = [];
        if (currentUserId) {
          const yeuThichResponse = await fetch("http://localhost:8080/api/YeuThich", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
          });
          if (yeuThichResponse.ok) {
            yeuThichData = await yeuThichResponse.json();
          }
        }

        const productResponse = await fetch("http://localhost:8080/api/SanPham/ListSanPham");
        if (!productResponse.ok) {
          throw new Error("Không thể tải sản phẩm");
        }
        const productData: ApiProduct[] = await productResponse.json();
        const transformedProducts = transformProductApiData(productData, commentData, yeuThichData);
        setProducts(transformedProducts);
        setLoadingProducts(false);
        setErrorProducts(null);

        const comboResponse = await fetch("http://localhost:8080/api/Combo/ComboSanPhamView");
        if (!comboResponse.ok) {
          throw new Error("Không thể tải combo");
        }
        const comboData = await comboResponse.json();
        if (!Array.isArray(comboData)) {
          throw new Error("API response is not an array");
        }
        const transformedCombos = transformComboApiData(comboData, yeuThichData);
        setCombos(transformedCombos);
        setLoadingCombos(false);
        setErrorCombos(null);

        const promoResponse = await fetch('http://localhost:8080/api/KhuyenMai/ListKhuyenMaiUser');
        if (!promoResponse.ok) {
          throw new Error('Không thể tải danh sách khuyến mãi');
        }
        const promoData = await promoResponse.json();
        setPromotions(promoData || []);
        setLoadingPromotions(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        console.error("Lỗi khi lấy dữ liệu:", errorMessage);
        if (errorMessage.includes("sản phẩm")) {
          setErrorProducts(errorMessage);
          setLoadingProducts(false);
        }
        if (errorMessage.includes("combo")) {
          setErrorCombos(errorMessage);
          setLoadingCombos(false);
        }
        if (errorMessage.includes("khuyến mãi")) {
          setLoadingPromotions(false);
        }
      }
    };

    fetchData();
  }, []);

  const toggleProductFavorite = async (productId: string) => {
    try {
      const product = products.find((p) => p.id === productId);
      let userData: UserData = {};
      try {
        const user = localStorage.getItem("user");
        userData = user ? JSON.parse(user) : {};
      } catch (error) {
        console.error("Lỗi parse user data:", error);
      }
      const userId = userData?.maNguoiDung;
      const hoTen = userData?.hoTen;

      if (!userId) {
        showNotification("Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!", "warning").then(() => {
          navigate("/auth/login");
        });
        return;
      }

      if (product?.isFavorite) {
        const response = await fetch(`http://localhost:8080/api/YeuThich/${product.likedId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Không thể xóa sản phẩm khỏi danh sách yêu thích");
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isFavorite: false, likedId: undefined } : p))
        );
        showNotification("Đã xóa sản phẩm khỏi danh sách yêu thích!", "success");
      } else {
        const yeuThichData = {
          maSanPham: productId.split("_")[0] || productId,
          tenSanPham: product?.name,
          maNguoiDung: userId,
          hoTen: hoTen,
          soLuongYeuThich: 1,
          ngayYeuThich: new Date().toISOString(),
        };
        const response = await fetch("http://localhost:8080/api/YeuThich", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify(yeuThichData),
        });
        if (!response.ok) throw new Error("Không thể thêm sản phẩm vào danh sách yêu thích");
        const addedFavorite = await response.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isFavorite: true, likedId: addedFavorite.maYeuThich } : p))
        );
        showNotification("Đã thêm sản phẩm vào danh sách yêu thích!", "success");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu thích:", error);
      showNotification("Có lỗi xảy ra khi cập nhật yêu thích!", "error");
    }
  };

  const toggleComboFavorite = async (comboId: number) => {
    try {
      const combo = combos.find((c) => c.id === comboId);
      let userData: UserData = {};
      try {
        const user = localStorage.getItem("user");
        userData = user ? JSON.parse(user) : {};
      } catch (error) {
        console.error("Lỗi parse user data:", error);
      }
      const userId = userData?.maNguoiDung;
      const hoTen = userData?.hoTen;

      if (!userId) {
        showNotification("Vui lòng đăng nhập để thêm combo vào danh sách yêu thích!", "warning").then(() => {
          navigate("/login");
        });
        return;
      }

      if (combo?.isFavorite) {
        const response = await fetch(`http://localhost:8080/api/YeuThich/${combo.likedId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Không thể xóa combo khỏi danh sách yêu thích");
        setCombos((prev) =>
          prev.map((c) => (c.id === comboId ? { ...c, isFavorite: false, likedId: undefined } : c))
        );
        showNotification("Đã xóa combo khỏi danh sách yêu thích!", "success");
      } else {
        const yeuThichData = {
          maCombo: comboId,
          tenCombo: combo?.name,
          maNguoiDung: userId,
          hoTen: hoTen,
          soLuongYeuThich: 1,
          ngayYeuThich: new Date().toISOString(),
        };
        const response = await fetch("http://localhost:8080/api/YeuThich", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify(yeuThichData),
        });
        if (!response.ok) throw new Error("Không thể thêm combo vào danh sách yêu thích");
        const addedFavorite = await response.json();
        setCombos((prev) =>
          prev.map((c) => (c.id === comboId ? { ...c, isFavorite: true, likedId: addedFavorite.maYeuThich } : c))
        );
        showNotification("Đã thêm combo vào danh sách yêu thích!", "success");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu thích:", error);
      showNotification("Có lỗi xảy ra khi cập nhật yêu thích!", "error");
    }
  };

  const renderLayerContent = (layerContent: string) => {
    switch (layerContent) {
      case 'promotions':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="max-w-6xl mx-auto px-4">
            {loadingPromotions ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-pink-500 mx-auto"></div>
                <span className="ml-6 text-black text-2xl font-bold">Đang tải khuyến mại...</span>
              </div>
            ) : promotions.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {promotions.slice(0, 6).map((promotion, index) => {
                    const discount = getPromotionDiscount(promotion);
                    const timeRemaining = getTimeRemaining(promotion.ngayKetThuc);
                    const isGeneral = promotion.percentChung !== null && promotion.percentChung !== undefined;
                    const mainImage = promotion.moTa?.Picture?.[0]?.url;

                    return (
                      <CarouselItem key={promotion.id} className="basis-full">
                        <div className="group relative bg-white rounded-3xl overflow-hidden border-2 border-yellow-400/40 shadow-2xl h-[700px] flex flex-col md:flex-row transition-all duration-500">
                        <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>

                        <div className="md:flex relative z-10 h-full">
                          <div className="md:w-2/5 relative overflow-hidden">
                            {mainImage ? (
                              <img 
                                src={formatImageSrc(mainImage)}
                                alt={promotion.tenKhuyenMai}
                                className="w-full h-80 md:h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-80 md:h-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/20"></div>
                                <div className="relative z-10 text-center">
                                  <span className="text-white text-8xl font-black drop-shadow-2xl">{discount}%</span>
                                  <div className="text-white text-xl font-bold mt-2">GIẢM GIÁ</div>
                                </div>
                                <Sparkles className="absolute top-4 left-4 w-8 h-8 text-yellow-300 animate-pulse" />
                                <Sparkles className="absolute bottom-4 right-4 w-6 h-6 text-pink-300 animate-pulse animation-delay-1000" />
                              </div>
                            )}
                            
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full font-black text-xl shadow-2xl animate-bounce">
                              -{discount}%
                            </div>

                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold shadow-lg ${
                              isGeneral 
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            }`}>
                              {isGeneral ? '🔥 CHUNG' : '🎯 RIÊNG'}
                            </div>

                        
                            </div>

                            <div className="md:w-3/5 p-8 flex flex-col justify-between h-full">
                              <div>
                                <div className="flex flex-wrap gap-4 mb-6">
                                  <div className="bg-blue-100 text-black px-4 py-2 rounded-xl flex items-center shadow-lg">
                                    <Calendar className="w-4 h-4 mr-2 text-black" />
                                    <div className="text-sm">
                                      <div className="font-semibold text-black">Thời gian</div>
                                      <div className="text-black">{formatDate(promotion.ngayBatDau)} - {formatDate(promotion.ngayKetThuc)}</div>
                                    </div>
                                  </div>

                                  <div className="bg-green-100 text-black px-4 py-2 rounded-xl flex items-center shadow-lg">
                                    <Gift className="w-4 h-4 mr-2 text-black" />
                                    <div className="text-sm">
                                      <div className="font-semibold text-black">Sản phẩm và Combo</div>
                                      <div className="text-black">Áp dụng cho: {isGeneral ? 'Tất cả đối tượng' : `${promotion.danhSachKhuyenMai?.length || 0} đối tượng`}</div>
                                    </div>
                                  </div>                                 
                                </div>

                                <div className="flex justify-between items-start mb-6">
                                  <h2 className="text-3xl font-black text-black group-hover:text-blue-700 transition-colors duration-300 flex-1 pr-4 leading-tight font-family: 'Poppins', sans-serif">
                                    {promotion.tenKhuyenMai}
                                  </h2>
                                </div>

                                {isGeneral && (
                                  <div className="mb-6 p-4 bg-purple-100 rounded-2xl border border-purple-300/30">
                                    <div className="flex items-center mb-2">
                                      <Tag className="w-5 h-5 text-purple-600 mr-2" />
                                      <span className="text-black font-bold">Áp dụng cho toàn bộ sản phẩm và combo</span>
                                    </div>
                                    <p className="text-black text-sm">
                                      Tất cả sản phẩm và combo trong cửa hàng được giảm giá {discount}%
                                    </p>
                                  </div>
                                )}

                                {promotion.moTa?.header?.title && (
                                  <div className="mb-6 p-4 bg-gray-100 rounded-2xl border border-gray-200">
                                    <p className="text-black text-lg leading-relaxed">
                                      {promotion.moTa.header.title}
                                    </p>
                                  </div>
                                )}

                                {!isGeneral && (
                                  <div className="mb-6">
                                    <h4 className="font-semibold text-black mb-3 text-sm">
                                      Sản phẩm và Combo khuyến mại:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {promotion.danhSachKhuyenMai && promotion.danhSachKhuyenMai.length > 0 ? (
                                        <>
                                          {promotion.danhSachKhuyenMai.slice(0, 4).map((item, index) => (                                            
                                            <span key={index} className="text-black px-3 py-1 rounded-full text-sm border border-gray-300" style={{backgroundColor: '#F3E6F8'}}>
                                              {item.tenSanPhamCombo}
                                            </span>
                                          ))}
                                          {promotion.danhSachKhuyenMai.length > 4 && (
                                            <span className="bg-purple-200 text-black px-3 py-1 rounded-full text-sm border border-purple-300">
                                              +{promotion.danhSachKhuyenMai.length - 4} khác
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        <span className="text-black text-sm italic">Không có sản phẩm cụ thể</span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {promotion.danhSachKhuyenMai && promotion.danhSachKhuyenMai.length > 0 && (
                                  <div className="mb-6">
                                    <h4 className="font-bold text-black mb-3 text-lg">
                                      📋 Danh sách sản phẩm và combo:
                                    </h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                      {promotion.danhSachKhuyenMai.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                                          <Link
                                            to={item.idSanPham ? `/products/${item.idSanPham}` : `/combos/${item.idCombo}`}
                                          >
                                          <div className="flex-1">
                                            <span className="text-black font-medium">{item.tenSanPhamCombo}</span>
                                          </div>
                                          </Link>

                                          <div className="flex items-center space-x-3">
                                            {item.giaGoc && item.giaMoi && (
                                                <div className="text-gray-500 line-through text-sm">
                                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.giaGoc)}
                                                </div>
                                            )}
                                            {item.giaMoi && (
                                              <div className="text-green-600 font-bold text-sm">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.giaGoc - (item.giaGoc * item.percent / 100))}
                                              </div>
                                            )}
                                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                              -{item.percent}%
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {/* Countdown & Button */}
                              <div className="grid grid-cols-2 gap-4 items-center mt-auto bg-gray-100 rounded-2xl p-4 border border-gray-200">
                                <div className="flex justify-center">
                                  <div className="w-full max-w-xs">
                                    <FlipCountdownTimer endDate={promotion.ngayKetThuc} promotionId={promotion.id} />
                                  </div>
                                </div>
                                <div className="flex justify-center items-center">
                                  <Button asChild className="bg-white text-purple-600 px-6 py-4 rounded-2xl font-black text-lg hover:bg-gradient-to-r hover:from-pink-400 hover:via-pink-500 hover:to-purple-500 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl group-hover:animate-pulse w-full max-w-xs">
                                    <Link to={`/khuyenmais/${promotion.id}`} className="flex items-center justify-center">
                                      <Sparkles className="w-5 h-5 mr-2" />
                                      XEM CHI TIẾT
                                      <Sparkles className="w-5 h-5 ml-2" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            ) : (
              <div className="text-center text-gray-400 text-2xl">Hiện tại không có khuyến mãi nào</div>
            )}
          </div>
        </div>
      );
      case 'products':
  
      const productGroups = [];
      for (let i = 0; i < products.slice(0, 12).length; i += 3) {
        productGroups.push(products.slice(i, i + 3));
      }
      return (
        <div className="w-full h-full flex items-center justify-center" style={{scale: '0.8'}}>
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="text-6xl font-bold text-white mb-12 text-center">Sản Phẩm Bán Chạy</h2>
            {loadingProducts ? (
              <div className="text-center text-gray-300 text-2xl">Đang tải sản phẩm...</div>
            ) : errorProducts ? (
              <div className="text-center text-red-500 text-2xl">Lỗi: {errorProducts}</div>
            ) : (
              <Carousel className="w-full">
                <CarouselContent>
                  {productGroups.map((group, idx) => (
                    <CarouselItem key={idx} className="basis-full">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {group.map((product, i) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            index={idx * 3 + i}
                            toggleFavorite={toggleProductFavorite}
                          />
                        ))}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            )}
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" className="text-xl px-8 py-4 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white">
                <Link to="/products">Xem Tất Cả Sản Phẩm</Link>
              </Button>
            </div>
          </div>
        </div>
      );
      case 'combos':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-8">
              <h2 className="text-6xl font-bold text-white mb-12 text-center">Combo Siêu Tiết Kiệm</h2>
              {loadingCombos ? (
                <div className="text-center text-gray-300 text-2xl">Đang tải combo...</div>
              ) : errorCombos ? (
                <div className="text-center text-red-500 text-2xl">Lỗi: {errorCombos}</div>
              ) : combos.length > 0 ? (
                <ErrorBoundary>
                  <ComboSlider combos={combos.slice(0, 6)} toggleFavorite={toggleComboFavorite} />
                </ErrorBoundary>
              ) : (
                <div className="text-center text-gray-400 text-2xl">Không có combo nào để hiển thị</div>
              )}
              <div className="text-center mt-12">
                <Button size="lg" variant="outline" className="text-xl px-8 py-4 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white">
                  <Link to="/combos">Xem Tất Cả Combo</Link>
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
    <div className={cn("space-y-6 py-6", theme === 'dark' ? 'dark' : '')}>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 w-12 h-12 rounded-full bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 z-50"
        onClick={toggleTheme}
        aria-label={theme === 'light' ? "Chuyển sang giao diện tối" : "Chuyển sang giao diện sáng"}
      >
        {theme === 'light' ? (
          <Moon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Sun className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        )}
      </Button>

      <HeroSection />
      <CategoryView />
      <Features />
      <VoucherUser />

      <section 
        ref={multiLayerRef}
        className="min-h-[100vh] bg-transparent transition-colors duration-1000 overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-transparent z-0"></div>

        {/* Progress Indicator với tên layer */}
        {isMultiLayerActive && (
          <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-50">
            <div className="flex flex-col gap-4">
              {layers.map((layer, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={cn(
                      "text-sm font-medium transition-all duration-300",
                      index === activeLayerIndex ? "text-blue-600" : "text-gray-400"
                    )}>
                      {layer.title}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all duration-500",
                      index === activeLayerIndex 
                        ? "bg-blue-500 border-blue-500 scale-125 shadow-lg" 
                        : index < activeLayerIndex
                        ? "bg-green-400 border-green-400"
                        : "bg-transparent border-gray-300"
                    )}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <div className="text-lg font-bold text-gray-800">
                {activeLayerIndex + 1} / {totalLayers}
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-8 py-16 relative" style={{ perspective: '2000px' }}>
          <div className="relative w-full h-[85vh]" style={{ perspective: '2000px' }}>
            {layers.map((layer, index) => {
              const layerStyle = getLayerTransform(index);
              const isActive = index === activeLayerIndex;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "absolute bg-white border border-gray-200 rounded-2xl backdrop-blur-md shadow-2xl",
                    "transition-all duration-700 ease-in-out",
                    isActive ? "border-blue-300" : "border-gray-200"
                  )}
                  style={{
                    width: '100%',
                    height: '100%',
                    ...layerStyle,
                    background: isActive 
                      ? 'rgba(255, 255, 255, 1)' 
                      : 'rgba(255, 255, 255, 0.8)',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    boxShadow: isActive
                      ? '0 25px 50px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.9)'
                      : `0 ${Math.abs(index - activeLayerIndex) * 5}px ${15 + Math.abs(index - activeLayerIndex) * 10}px rgba(0,0,0,0.15)`,
                  }}
                >
                  <div className="w-full h-full p-8 relative overflow-hidden">
                    {renderLayerContent(layer.content)}
                  </div>
                  
                  <div className="absolute bottom-8 left-8 bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 border border-gray-300 shadow-xl">
                    <div className="text-white text-2xl font-bold">{layer.title}</div>
                  </div>

                  {isActive && (
                    <div className="absolute inset-0 border-2 border-blue-400/50 rounded-2xl pointer-events-none">
                      <div className="absolute inset-2 border border-blue-300/30 rounded-xl"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Navigation Instructions */}
          {isMultiLayerActive && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-8 py-4 rounded-2xl text-center backdrop-blur-sm border border-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-sm">
                  <span className="font-medium">
                    {currentLayerIndex === 0 ? "Bắt đầu từ Sản phẩm" :
                    currentLayerIndex === totalLayers - 1 ? "Cuộn để tiếp tục trang web" :
                    "Cuộn để chuyển layer"}
                  </span>
                  <span className="text-gray-300 text-xs">
                    {currentLayerIndex > 0 ? "↑ Lên: " + layers[currentLayerIndex - 1].title : "↑ Thoát"}
                    {" • "}
                    {currentLayerIndex < totalLayers - 1 ? "↓ Xuống: " + layers[currentLayerIndex + 1].title : "↓ Tiếp tục"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Tin tức</h2>
          <Button asChild variant="link" className="text-crocus-600">
            <Link to="/blogs">
              Xem tất cả <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>
        <BlogList />
      </section>

      <Newsletter />
    </div>
    </>
  );
};

export default Index;
