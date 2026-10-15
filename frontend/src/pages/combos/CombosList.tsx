import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Search, SlidersHorizontal, X, Star, Package, ArrowUpDown, Filter, Grid3X3, List, ChevronDown, Sparkles, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import Swal from "sweetalert2";
import { cn, formatImageSrc } from "@/lib/utils";

// Define interfaces
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
}

interface ApiCombo {
  maCombo: number;
  name: string;
  hinhAnh: string;
  ngayTao: string;
  trangThai: number;
  sanPhams: ApiComboSanPham[];
  moTa: string;
  gia: number;
  soLuong: number;
  khuyenMaiMax: number;
}

interface UserData {
  maNguoiDung?: string;
  hoTen?: string;
}

interface Combo {
  id: number;
  name: string;
  description: string;
  imageSrc: string;
  price: number;
  products: string[];
  productCount: number;
  rating: number;
  isFavorite: boolean;
  occasion: string;
  savings: number;
  savingsPercentage: number;
  likedId?: string;
  daGiamPercentage: number;
  khuyenMaiPercentage: number;
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

const CombosList = () => {
  const navigate = useNavigate();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [filteredCombos, setFilteredCombos] = useState<Combo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minItems, setMinItems] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sortBy, setSortBy] = useState("name_asc");
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setIsLoading(true);
        
        // Fetch combos
        const response = await fetch("http://localhost:8080/api/Combo/ComboSanPhamView");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error("Dữ liệu API không phải là mảng");
        }

        // Fetch comments
        const commentResponse = await fetch("http://localhost:8080/api/Comment/list");
        if (!commentResponse.ok) {
          throw new Error("Không thể tải bình luận");
        }
        const commentData = await commentResponse.json();

        const transformedCombos = data.map((item: ApiCombo) => {
          // Tính toán giá gốc từ tổng giá sản phẩm
          const tongTienSanPham = Array.isArray(item.sanPhams)
            ? item.sanPhams.reduce((sum, sp) => sum + (sp.donGia * sp.soLuong), 0)
            : 0;
          
          // Tính phần trăm giảm giá từ giá combo so với tổng giá sản phẩm
          const daGiam = tongTienSanPham > 0 ? (1 - (item.gia / tongTienSanPham)) * 100 : 0;
          
          // Khuyến mãi thêm
          const khuyenMai = item.khuyenMaiMax || 0;
          
          // Giá cuối cùng sau khi áp dụng khuyến mãi
          const giaCuoi = item.gia * (1 - khuyenMai / 100);
          
          // Số tiền tiết kiệm
          const tietKiem = tongTienSanPham - giaCuoi;
          
          // Phần trăm tiết kiệm tổng
          const savingsPercentage = tongTienSanPham > 0 ? (tietKiem / tongTienSanPham) * 100 : 0;

          // Tính average rating từ comments
          const comboComments = commentData
            .filter((comment) => 
              comment.maCombo !== null && 
              comment.maCombo !== 0 && 
              comment.maCombo === item.maCombo && 
              comment.trangThai === 1
            );
          const totalRating = comboComments.reduce((sum, comment) => sum + (comment.danhGia || 0), 0);
          const averageRating = comboComments.length > 0 ? totalRating / comboComments.length : 0;

          // Tạo occasion dựa trên tên combo
          let occasion = "Other";
          const name = item.name?.toLowerCase() || "";
          if (name.includes("công sở") || name.includes("office") || name.includes("làm việc")) {
            occasion = "Office";
          } else if (name.includes("tiệc") || name.includes("formal") || name.includes("sang trọng")) {
            occasion = "Formal";
          } else if (name.includes("casual") || name.includes("dạo phố") || name.includes("cuối tuần")) {
            occasion = "Casual";
          } else if (name.includes("mùa hè") || name.includes("summer") || name.includes("biển")) {
            occasion = "Summer";
          } else if (name.includes("mùa đông") || name.includes("winter") || name.includes("ấm")) {
            occasion = "Winter";
          }

          return {
            id: item.maCombo,
            name: item.name || "Combo không tên",
            description: item.moTa || "Combo thời trang tuyệt vời",
            imageSrc: formatImageSrc(item.hinhAnh, "/api/placeholder/400/300"),
            price: Math.round(giaCuoi),
            products: Array.isArray(item.sanPhams) 
              ? item.sanPhams.map((sp) => sp.name || "Sản phẩm không tên") 
              : [],
            productCount: Array.isArray(item.sanPhams) ? item.sanPhams.length : 0,
            rating: averageRating,
            isFavorite: false,
            occasion: occasion,
            savings: Math.round(tietKiem),
            savingsPercentage: Math.round(savingsPercentage),
            daGiamPercentage: Math.round(daGiam),
            khuyenMaiPercentage: khuyenMai
          };
        });

        // Kiểm tra danh sách yêu thích nếu user đã đăng nhập
        try {
          const userData: UserData = JSON.parse(localStorage.getItem("user") || "{}");
          const currentUserId = userData?.maNguoiDung;
          
          if (currentUserId) {
            const token = localStorage.getItem("token");
            const favoriteResponse = await fetch(`http://localhost:8080/api/YeuThich?maNguoiDung=${currentUserId}`, {
              headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },
            });
            
            if (favoriteResponse.ok) {
              const yeuThichData = await favoriteResponse.json();
              
              // Cập nhật trạng thái yêu thích cho các combo
              const updatedCombos = transformedCombos.map(combo => {
                const userFavorite = yeuThichData.find(
                  (yeuThich: any) => yeuThich.maCombo === combo.id && yeuThich.maNguoiDung === currentUserId
                );
                return {
                  ...combo,
                  isFavorite: !!userFavorite,
                  likedId: userFavorite?.maYeuThich,
                };
              });
              
              setCombos(updatedCombos);
              setFilteredCombos(updatedCombos);
            } else {
              setCombos(transformedCombos);
              setFilteredCombos(transformedCombos);
            }
          } else {
            setCombos(transformedCombos);
            setFilteredCombos(transformedCombos);
          }
        } catch (favoriteError) {
          console.warn("Không thể kiểm tra danh sách yêu thích:", favoriteError);
          setCombos(transformedCombos);
          setFilteredCombos(transformedCombos);
        }

        setError(null);
      } catch (err) {
        console.error("Lỗi khi lấy combo:", err);
        setError(err instanceof Error ? err.message : "Không thể tải combo. Vui lòng thử lại sau.");
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách combo",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCombos();
  }, []);

  const uniqueOccasions = useMemo(() => {
    return [...new Set(combos.map((combo) => combo.occasion))].sort();
  }, [combos]);

  const minPrice = useMemo(
    () => (combos.length > 0 ? Math.floor(Math.min(...combos.map((c) => c.price))) : 0),
    [combos]
  );
  const maxPrice = useMemo(
    () => (combos.length > 0 ? Math.ceil(Math.max(...combos.map((c) => c.price))) : 0),
    [combos]
  );

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    let result = [...combos];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter((combo) => 
        combo.name.toLowerCase().includes(query) ||
        combo.description.toLowerCase().includes(query) ||
        combo.products.some(product => product.toLowerCase().includes(query))
      );
    }

    if (minItems && minItems !== "all") {
      result = result.filter((combo) => combo.productCount >= parseInt(minItems));
    }

    if (selectedOccasions.length > 0) {
      result = result.filter((combo) => selectedOccasions.includes(combo.occasion));
    }

    if (priceRange[0] > minPrice || priceRange[1] < maxPrice) {
      result = result.filter(
        (combo) => combo.price >= priceRange[0] && combo.price <= priceRange[1]
      );
    }

    switch (sortBy) {
      case "name_asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating_desc":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "savings_desc":
        result.sort((a, b) => b.savingsPercentage - a.savingsPercentage);
        break;
      case "items_desc":
        result.sort((a, b) => b.productCount - a.productCount);
        break;
      default:
        break;
    }

    setFilteredCombos(result);
  }, [combos, searchTerm, minItems, selectedOccasions, priceRange, sortBy, minPrice, maxPrice]);

  const handleOccasionChange = (occasion: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasion) ? prev.filter((o) => o !== occasion) : [...prev, occasion]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setMinItems(undefined);
    setPriceRange([minPrice, maxPrice]);
    setSortBy("name_asc");
    setSelectedOccasions([]);
    setShowFilters(false);
    toast({
      title: "Đã xóa bộ lọc",
      description: "Tất cả bộ lọc đã được đặt lại về mặc định.",
    });
  };

  const applyFilters = () => {
    setShowFilters(false);
    toast({
      title: "Đã áp dụng bộ lọc",
      description: "Bộ lọc combo của bạn đã được áp dụng.",
    });
  };

  const toggleFavorite = async (comboId: number) => {
    try {
      const combo = combos.find(c => c.id === comboId);
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
          navigate("/auth/login");
        });
        return;
      }

      if (combo?.isFavorite) {
        const response = await fetch(`http://localhost:8080/api/YeuThich/${combo.likedId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Không thể xóa combo khỏi danh sách yêu thích");
        setFilteredCombos((prev) =>
          prev.map((c) => c.id === comboId ? { ...c, isFavorite: false, likedId: undefined } : c)
        );
        setCombos((prev) =>
          prev.map((c) => c.id === comboId ? { ...c, isFavorite: false, likedId: undefined } : c)
        );
        showNotification("Đã xóa combo khỏi danh sách yêu thích!", "success");
        window.dispatchEvent(new Event("favorites-updated")); // Notify UserLayout
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
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(yeuThichData),
        });
        if (!response.ok) throw new Error("Không thể thêm combo vào danh sách yêu thích");
        const addedFavorite = await response.json();
        setFilteredCombos((prev) =>
          prev.map((c) => c.id === comboId ? { ...c, isFavorite: true, likedId: addedFavorite.maYeuThich } : c)
        );
        setCombos((prev) =>
          prev.map((c) => c.id === comboId ? { ...c, isFavorite: true, likedId: addedFavorite.maYeuThich } : c)
        );
        showNotification("Đã thêm combo vào danh sách yêu thích!", "success");
        window.dispatchEvent(new Event("favorites-updated")); // Notify UserLayout
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu thích:", error);
      showNotification("Có lỗi xảy ra khi cập nhật yêu thích!", "error");
    }
  };

  const handleBuyNow = (combo: Combo) => {
    const cartItem = {
      id: combo.id,
      name: combo.name,
      image: combo.imageSrc,
      price: combo.price,
      quantity: 1,
      type: "combo",
    };
    console.log("Đã thêm vào giỏ hàng:", cartItem);
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${combo.name} đã được thêm vào giỏ hàng của bạn.`,
    });
  };

  const activeFiltersCount = [
    searchTerm,
    minItems && minItems !== "all" ? minItems : null,
    selectedOccasions.length > 0 ? "occasions" : null,
    priceRange[0] > minPrice || priceRange[1] < maxPrice ? "price" : null
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-12 w-12 text-yellow-400 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Combo Thời Trang
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100 leading-relaxed">
              Khám phá những bộ sưu tập được tuyển chọn kỹ lưỡng, phù hợp cho mọi phong cách và dịp đặc biệt
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row justify-center items-center gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm combo, sản phẩm..."
                  className="pl-12 h-14 text-lg rounded-full border-0 bg-white/95 backdrop-blur-sm shadow-xl focus:ring-4 focus:ring-white/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 px-8 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Search className="h-5 w-5 mr-2" />
                Tìm kiếm
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Controls Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="h-12 px-6 rounded-full border-2 hover:border-purple-500 hover:text-purple-600 transition-all duration-300"
            >
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-purple-500">{activeFiltersCount}</Badge>
              )}
            </Button>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 h-12 rounded-full border-2">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Tên: A đến Z</SelectItem>
                <SelectItem value="name_desc">Tên: Z đến A</SelectItem>
                <SelectItem value="price_asc">Giá: Thấp đến Cao</SelectItem>
                <SelectItem value="price_desc">Giá: Cao đến Thấp</SelectItem>
                <SelectItem value="rating_desc">Đánh giá cao nhất</SelectItem>
                <SelectItem value="savings_desc">Tiết kiệm nhiều nhất</SelectItem>
                <SelectItem value="items_desc">Số sản phẩm nhiều nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-full p-1 bg-white">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-full"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-full"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="font-medium">{filteredCombos.length}</span> combo
            </div>
          </div>
        </div>

        {/* Filter Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowFilters(false)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden m-4" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                  <SlidersHorizontal className="h-6 w-6 mr-2" />
                  Bộ Lọc Nâng Cao
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(false)}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Product Count Filter */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-800 flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Số Lượng Sản Phẩm
                    </Label>
                    <Select value={minItems || ""} onValueChange={setMinItems}>
                      <SelectTrigger className="w-full h-12 rounded-xl border-2">
                        <SelectValue placeholder="Chọn số lượng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="2">2+ sản phẩm</SelectItem>
                        <SelectItem value="3">3+ sản phẩm</SelectItem>
                        <SelectItem value="4">4+ sản phẩm</SelectItem>
                        <SelectItem value="5">5+ sản phẩm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-800">Khoảng Giá</Label>
                    <div className="px-4 py-6 bg-gray-50 rounded-xl">
                      <Slider
                        min={minPrice}
                        max={maxPrice}
                        step={50000}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm font-medium text-gray-600 mt-4">
                        <span className="bg-white px-3 py-1 rounded-full border">
                          {priceRange[0].toLocaleString('vi-VN')} VND
                        </span>
                        <span className="bg-white px-3 py-1 rounded-full border">
                          {priceRange[1].toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Occasion Filter */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-800">Dịp Sử Dụng</Label>
                    <div className="space-y-3">
                      {uniqueOccasions.map((occasion) => (
                        <div key={occasion} className="flex items-center space-x-3">
                          <Checkbox
                            id={`occasion-${occasion}`}
                            checked={selectedOccasions.includes(occasion)}
                            onCheckedChange={() => handleOccasionChange(occasion)}
                            className="rounded-md"
                          />
                          <Label htmlFor={`occasion-${occasion}`} className="text-sm font-medium">
                            {occasion}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between p-6 bg-gray-50 border-t">
                <Button variant="outline" onClick={resetFilters} className="px-8 h-12 rounded-xl">
                  Xóa Tất Cả
                </Button>
                <Button onClick={applyFilters} className="px-8 h-12 rounded-xl bg-purple-600 hover:bg-purple-700">
                  Áp Dụng Bộ Lọc
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {error ? (
          <div className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Oops! Có lỗi xảy ra</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="py-16 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Đang tải combo thời trang...</p>
          </div>
        ) : filteredCombos.length === 0 ? (
          <div className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Không tìm thấy combo</h3>
              <p className="text-gray-600 mb-6">Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc</p>
              <Button onClick={resetFilters} className="rounded-full px-8">
                Xóa Tất Cả Bộ Lọc
              </Button>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : 
            "space-y-6"
          }>
            {filteredCombos.map((combo) => (
              <Card key={combo.id} className={`overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg ${
                viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
              }`}>
                <div className={`relative ${viewMode === 'list' ? 'md:w-1/3 aspect-video md:aspect-square' : 'aspect-[4/3]'}`}>
                  <Link to={`/combos/${combo.id}`}>
                    <img
                      src={combo.imageSrc}
                      alt={combo.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </Link>
                  
                  {/* Overlay with badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Heart button */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                    onClick={() => toggleFavorite(combo.id)}
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors duration-300 ${
                        combo.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                      }`}
                    />
                  </Button>

                  {/* Discount badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {combo.daGiamPercentage > 0 && (
                      <Badge className="bg-blue-500 text-white font-bold px-3 py-1 rounded-full">
                        Giảm giá so với mua lẻ-{combo.daGiamPercentage}%
                      </Badge>
                    )}
                    {combo.khuyenMaiPercentage > 0 && (
                      <Badge className="bg-red-500 text-white font-bold px-3 py-1 rounded-full animate-pulse">
                        Khuyến mãi -{combo.khuyenMaiPercentage}%
                      </Badge>
                    )}
                  </div>

                  {/* Product count badge */}
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-purple-600 text-white px-3 py-1 rounded-full font-semibold">
                      <Package className="h-4 w-4 mr-1" />
                      {combo.productCount} sản phẩm
                    </Badge>
                  </div>
                </div>

                <CardContent className={`p-6 ${viewMode === 'list' ? 'md:w-2/3 flex-1' : ''}`}>
                  <div className="space-y-4">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < Math.floor(combo.rating) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {combo.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Title */}
                    <Link to={`/combos/${combo.id}`} className="block group-hover:text-purple-600 transition-colors">
                      <h3 className="font-bold text-xl text-gray-800 line-clamp-2 leading-tight">
                        {combo.name}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {combo.description}
                    </p>

                    {/* Product list */}
                    <div className="flex flex-wrap gap-1">
                      {combo.products.slice(0, 3).map((product, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                      {combo.products.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{combo.products.length - 3} khác
                        </Badge>
                      )}
                    </div>

                    <Separator />

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold text-red-600">
                          {combo.price.toLocaleString('vi-VN')} VND
                        </span>
                        {combo.khuyenMaiPercentage > 0 && (
                          <span className="text-lg line-through text-gray-500">
                            {(combo.price / (1 - combo.khuyenMaiPercentage / 100)).toLocaleString('vi-VN')} VND
                          </span>
                        )}
                      </div>
                      
                      {combo.savings > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Tiết kiệm {combo.savings.toLocaleString('vi-VN')} VND
                          </Badge>
                          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                            Giảm giá lên đến {combo.savingsPercentage}% 
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 rounded-full hover:bg-purple-50 hover:border-purple-300">
                        <Link to={`/combos/${combo.id}`}>
                          <Search className="h-4 w-4 mr-2" />
                          Chi tiết
                        </Link>
                      </Button>
                      {/* <Button 
                        onClick={() => handleBuyNow(combo)} 
                        size="sm" 
                        className="flex-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Thêm vào giỏ
                      </Button> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats section */}
        {filteredCombos.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-3xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-600">{filteredCombos.length}</div>
                <div className="text-gray-600 font-medium">Combo Available</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-indigo-600">
                  {filteredCombos.length > 0 
                    ? Math.round(filteredCombos.reduce((sum, combo) => sum + combo.rating, 0) / filteredCombos.length * 10) / 10
                    : 0}
                </div>
                <div className="text-gray-600 font-medium">Đánh giá trung bình</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-600">
                  {filteredCombos.length > 0 
                    ? Math.round(filteredCombos.reduce((sum, combo) => sum + combo.savingsPercentage, 0) / filteredCombos.length)
                    : 0}%
                </div>
                <div className="text-gray-600 font-medium">Tiết kiệm trung bình</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-orange-600">
                  {filteredCombos.reduce((sum, combo) => sum + combo.productCount, 0)}
                </div>
                <div className="text-gray-600 font-medium">Tổng sản phẩm</div>
              </div>
            </div>
          </div>
        )}

        {/* Call to action */}
        <div className="mt-16 text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl p-12">
          <Sparkles className="h-16 w-16 mx-auto mb-6 text-yellow-400" />
          <h2 className="text-3xl font-bold mb-4">Không tìm thấy combo ưng ý?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Hãy liên hệ với chúng tôi để được tư vấn combo phù hợp nhất cho bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="rounded-full px-8 h-14 text-lg font-semibold">
              Tư vấn miễn phí
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-purple-600">
              Xem thêm combo
            </Button>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="mt-16 bg-white rounded-3xl shadow-xl p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Đăng ký nhận thông tin combo mới</h3>
            <p className="text-gray-600 mb-6">
              Được cập nhật những combo thời trang hot nhất và ưu đãi độc quyền
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Email của bạn" 
                className="flex-1 h-12 rounded-full border-2 px-6"
              />
              <Button type="submit" className="h-12 px-8 rounded-full bg-purple-600 hover:bg-purple-700">
                Đăng ký
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombosList;