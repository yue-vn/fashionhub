import { useState, useRef, useEffect, MouseEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Chart from "chart.js/auto";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState("daily");
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split("T")[0]);
  const [monthlyYear, setMonthlyYear] = useState("2025");
  const [monthlyMonth, setMonthlyMonth] = useState("1");
  const [yearlyYear, setYearlyYear] = useState("2025");
  const [dailyData, setDailyData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [yearlyData, setYearlyData] = useState<any>(null);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [todayData, setTodayData] = useState<{
    revenue: any;
    orderStatus: any[];
    topProducts: any[];
  }>({
    revenue: null,
    orderStatus: [],
    topProducts: [],
  });
  const [activeTab, setActiveTab] = useState("summary");
  const [isLoading, setIsLoading] = useState(false);

  const dailyChartRef = useRef<Chart | null>(null);
  const monthlyChartRef = useRef<Chart | null>(null);
  const yearlyChartRef = useRef<Chart | null>(null);
  const orderStatusChartRef = useRef<Chart | null>(null);
  const topProductsChartRef = useRef<Chart | null>(null);
  const todayRevenueChartRef = useRef<Chart | null>(null);
  const todayOrderStatusChartRef = useRef<Chart | null>(null);
  const todayTopProductsChartRef = useRef<Chart | null>(null);

  const years = Array.from({ length: 76 }, (_, i) => 2025 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  // Use current date for real-time data
  const today = new Date().toISOString().split("T")[0]; // e.g., "2025-07-31"

  const API_BASE_URL = "http://localhost:8080/api/ThongKe";

  const createLineChart = (
    canvasId: string,
    labels: string[],
    revenues: number[],
    orders: number[],
    title: string,
    chartRef: React.MutableRefObject<Chart | null>
  ) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${title} - Doanh thu`,
            data: revenues,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
          {
            label: `${title} - Đơn hàng`,
            data: orders,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: { title: { display: true, text: "Thời gian" } },
          y: {
            title: { display: true, text: "Giá trị (VND/Đơn hàng)" },
            beginAtZero: true,
            ticks: {
              callback: (value) => value.toLocaleString(),
            },
          },
        },
      },
    });
  };

  const createPieChart = (
    canvasId: string,
    data: any[],
    title: string,
    chartRef: React.MutableRefObject<Chart | null>
  ) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: data.map((item) => item.tenTrangThai || item.name),
        datasets: [
          {
            data: data.map((item) => item.tongDonHang || item.soLuongDaBan),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#FFCD56",
              "#4BC0C0",
              "#36A2EB",
              "#FF6384",
            ],
            hoverOffset: 4,
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: { size: 12 },
              padding: 15,
            },
          },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const item = data[context.dataIndex];
                if (item.statusBreakdown) {
                  return [
                    `${item.name}: ${item.soLuongDaBan} sản phẩm`,
                    ...item.statusBreakdown.map(
                      (b: any) => `${b.status}: ${b.soLuong} (${b.doanhThu.toLocaleString()} VND)`
                    ),
                  ];
                }
                return `${item.tenTrangThai}: ${item.tongDonHang} đơn hàng`;
              },
            },
          },
        },
      },
    });
  };

  const getDailyStatistics = async (date: string = dailyDate) => {
    if (!date) return null;
    setIsLoading(true);

    const [year, month, day] = date.split("-");
    try {
      const response = await fetch(`${API_BASE_URL}/Daily?year=${year}&month=${month}&day=${day}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch daily statistics");
      const data = await response.json();

      if (data.length === 0) {
        return null;
      }

      const labels = data.map((x: any) => `${x.ngay}/${x.thang}/${x.nam}`);
      const revenues = data.map((x: any) => x.tongDoanhThu);
      const orders = data.map((x: any) => x.tongDonHang);

      return {
        labels,
        revenues,
        orders,
        totalRevenue: data.reduce((acc: number, curr: any) => acc + curr.tongDoanhThu, 0),
        totalOrders: data.reduce((acc: number, curr: any) => acc + curr.tongDonHang, 0),
      };
    } catch (error) {
      console.error("Error fetching daily statistics:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthlyStatistics = async () => {
    if (!monthlyYear || !monthlyMonth) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/Monthly?year=${monthlyYear}&month=${monthlyMonth}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch monthly statistics");
      const data = await response.json();

      if (data.length === 0) {
        setMonthlyData(null);
        return;
      }

      const labels = data.map((x: any) => `${x.ngay}/${x.thang}/${x.nam}`);
      const revenues = data.map((x: any) => x.tongDoanhThu);
      const orders = data.map((x: any) => x.tongDonHang);

      createLineChart("monthlyChart", labels, revenues, orders, "Thống kê theo tháng", monthlyChartRef);
      setMonthlyData({
        totalRevenue: data.reduce((acc: number, curr: any) => acc + curr.tongDoanhThu, 0),
        totalOrders: data.reduce((acc: number, curr: any) => acc + curr.tongDonHang, 0),
      });
    } catch (error) {
      console.error("Error fetching monthly statistics:", error);
      setMonthlyData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getYearlyStatistics = async () => {
    if (!yearlyYear) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/Yearly?year=${yearlyYear}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch yearly statistics");
      const data = await response.json();

      if (data.length === 0) {
        setYearlyData(null);
        return;
      }

      const labels = data.map((x: any) => `${x.ngay}/${x.thang}/${x.nam}`);
      const revenues = data.map((x: any) => x.tongDoanhThu);
      const orders = data.map((x: any) => x.tongDonHang);

      createLineChart("yearlyChart", labels, revenues, orders, "Thống kê theo năm", yearlyChartRef);
      setYearlyData({
        totalRevenue: data.reduce((acc: number, curr: any) => acc + curr.tongDoanhThu, 0),
        totalOrders: data.reduce((acc: number, curr: any) => acc + curr.tongDonHang, 0),
      });
    } catch (error) {
      console.error("Error fetching yearly statistics:", error);
      setYearlyData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderStatusStatistics = async (date?: string, year?: string, month?: string) => {
    let url = `${API_BASE_URL}/OrderStatus`;
    if (date) {
      const [y, m, d] = date.split("-");
      url += `?year=${y}&month=${m}&day=${d}`;
    } else if (year && month) {
      url += `?year=${year}&month=${month}`;
    } else if (year) {
      url += `?year=${year}`;
    }
    setIsLoading(true);

    try {
      const response = await fetch(url,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch order status statistics");
      const data = await response.json();
      return data.length > 0 ? data : [];
    } catch (error) {
      console.error("Error fetching order status statistics:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getTopProductsStatistics = async (date?: string, year?: string, month?: string) => {
    let url = `${API_BASE_URL}/TopProducts`;
    if (date) {
      const [y, m, d] = date.split("-");
      url += `?year=${y}&month=${m}&day=${d}`;
    } else if (year && month) {
      url += `?year=${year}&month=${month}`;
    } else if (year) {
      url += `?year=${year}`;
    }
    setIsLoading(true);

    try {
      const response = await fetch(url,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch top products statistics");
      const data = await response.json();
      return data.length > 0 ? data : [];
    } catch (error) {
      console.error("Error fetching top products statistics:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodayData = async () => {
    setIsLoading(true);
    const revenueData = await getDailyStatistics(today);
    const orderStatusData = await getOrderStatusStatistics(today);
    const topProductsData = await getTopProductsStatistics(today);

    setTodayData({
      revenue: revenueData,
      orderStatus: orderStatusData,
      topProducts: topProductsData,
    });

    if (revenueData) {
      createLineChart(
        "todayRevenueChart",
        revenueData.labels,
        revenueData.revenues,
        revenueData.orders,
        "Thống kê doanh thu hôm nay",
        todayRevenueChartRef
      );
    }
    if (orderStatusData.length > 0) {
      createPieChart(
        "todayOrderStatusChart",
        orderStatusData,
        "Thống kê trạng thái đơn hàng hôm nay",
        todayOrderStatusChartRef
      );
    }
    if (topProductsData.length > 0) {
      createPieChart(
        "todayTopProductsChart",
        topProductsData,
        "Top sản phẩm bán chạy hôm nay",
        todayTopProductsChartRef
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (activeTab === "summary") {
      fetchTodayData();
      // Optional: Set up polling for real-time updates (e.g., every 60 seconds)
      const interval = setInterval(fetchTodayData, 60000);
      return () => clearInterval(interval);
    } else if (activeTab === "revenue") {
      if (timeFilter === "daily") {
        getDailyStatistics().then((data) => {
          if (data) {
            setDailyData(data);
            createLineChart("dailyChart", data.labels, data.revenues, data.orders, "Thống kê theo ngày", dailyChartRef);
          } else {
            setDailyData(null);
          }
        });
      } else if (timeFilter === "monthly") {
        getMonthlyStatistics();
      } else if (timeFilter === "yearly") {
        getYearlyStatistics();
      }
    } else if (activeTab === "orderStatus") {
      getOrderStatusStatistics(
        timeFilter === "daily" ? dailyDate : undefined,
        timeFilter === "monthly" ? monthlyYear : timeFilter === "yearly" ? yearlyYear : undefined,
        timeFilter === "monthly" ? monthlyMonth : undefined
      ).then((data) => {
        setOrderStatusData(data);
        if (data.length > 0) {
          createPieChart("orderStatusChart", data, "Thống kê trạng thái đơn hàng", orderStatusChartRef);
        }
      });
    } else if (activeTab === "topProducts") {
      getTopProductsStatistics(
        timeFilter === "daily" ? dailyDate : undefined,
        timeFilter === "monthly" ? monthlyYear : timeFilter === "yearly" ? yearlyYear : undefined,
        timeFilter === "monthly" ? monthlyMonth : undefined
      ).then((data) => {
        setTopProductsData(data);
        if (data.length > 0) {
          createPieChart("topProductsChart", data, "Top Sản Phẩm Bán Chạy", topProductsChartRef);
        }
      });
    }
  }, [activeTab, timeFilter, dailyDate, monthlyYear, monthlyMonth, yearlyYear]);

  const handleDailyStatisticsClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    getDailyStatistics().then((data) => {
      if (data) {
        setDailyData(data);
        createLineChart("dailyChart", data.labels, data.revenues, data.orders, "Thống kê theo ngày", dailyChartRef);
      } else {
        setDailyData(null);
      }
    });
  };

  const handleOrderStatusStatisticsClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    getOrderStatusStatistics(
      timeFilter === "daily" ? dailyDate : undefined,
      timeFilter === "monthly" ? monthlyYear : timeFilter === "yearly" ? yearlyYear : undefined,
      timeFilter === "monthly" ? monthlyMonth : undefined
    ).then((data) => {
      setOrderStatusData(data);
      if (data.length > 0) {
        createPieChart("orderStatusChart", data, "Thống kê trạng thái đơn hàng", orderStatusChartRef);
      }
    });
  };

  const handleTopProductsStatisticsClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    getTopProductsStatistics(
      timeFilter === "daily" ? dailyDate : undefined,
      timeFilter === "monthly" ? monthlyYear : timeFilter === "yearly" ? yearlyYear : undefined,
      timeFilter === "monthly" ? monthlyMonth : undefined
    ).then((data) => {
      setTopProductsData(data);
      if (data.length > 0) {
        createPieChart("topProductsChart", data, "Top Sản Phẩm Bán Chạy", topProductsChartRef);
      }
    });
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          Quản lý thống kê
        </h1>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium">Đang tải dữ liệu...</span>
          </div>
        </div>
      )}

      <Tabs defaultValue="summary" onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
          <TabsList className="bg-gray-100 p-1 rounded-md">
            <TabsTrigger value="summary" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              📊 Tổng hợp
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              💰 Doanh thu
            </TabsTrigger>
            <TabsTrigger value="orderStatus" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              📦 Trạng thái đơn hàng
            </TabsTrigger>
            <TabsTrigger value="topProducts" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              🏆 Sản phẩm bán chạy
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary">
          <div className="space-y-6">
            {/* Header Card with Current Date */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-center">
                  📈 Thống kê tổng hợp hôm nay
                </CardTitle>
                <p className="text-center text-blue-100 text-lg font-medium">
                  {new Date().toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} - {new Date().toLocaleTimeString('vi-VN')}
                </p>
              </CardHeader>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Revenue Chart Card */}
              <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    💰 Doanh thu & Đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {todayData.revenue ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-3 flex justify-center">
                        <canvas
                          id="todayRevenueChart"
                          width="250"
                          height="180"
                          className="mx-auto"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                          <div className="text-sm text-green-700 font-medium">Tổng doanh thu</div>
                          <div className="text-2xl font-bold text-green-800">
                            {todayData.revenue.totalRevenue.toLocaleString()} VND
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                          <div className="text-sm text-blue-700 font-medium">Tổng đơn hàng</div>
                          <div className="text-2xl font-bold text-blue-800">
                            {todayData.revenue.totalOrders.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📊</div>
                      <p className="text-gray-500 font-medium">Không có dữ liệu doanh thu hôm nay</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Status Chart Card */}
              <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                  <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    📦 Trạng thái đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {todayData.orderStatus.length > 0 ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <canvas
                          id="todayOrderStatusChart"
                          width="250"
                          height="250"
                          className="mx-auto"
                        />
                      </div>
                      <div className="space-y-2">
                        {todayData.orderStatus.map((status, index) => (
                          <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-purple-700">
                                {status.tenTrangThai}
                              </span>
                              <span className="text-lg font-bold text-purple-800">
                                {status.tongDonHang} đơn
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📦</div>
                      <p className="text-gray-500 font-medium">Không có dữ liệu trạng thái đơn hàng</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Products Card */}
              <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300 lg:col-span-2 xl:col-span-1">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
                  <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    🏆 Top sản phẩm bán chạy
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {todayData.topProducts.length > 0 ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <canvas
                          id="todayTopProductsChart"
                          width="250"
                          height="250"
                          className="mx-auto"
                        />
                      </div>
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
                        <div className="text-sm text-amber-700 font-medium">Số sản phẩm bán chạy</div>
                        <div className="text-2xl font-bold text-amber-800">
                          {todayData.topProducts.length} sản phẩm
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">🏆</div>
                      <p className="text-gray-500 font-medium">Không có dữ liệu sản phẩm bán chạy</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detailed Top Products Table */}
            {todayData.topProducts.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    📋 Chi tiết sản phẩm bán chạy hôm nay
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-bold text-gray-700">Tên sản phẩm</TableHead>
                          <TableHead className="font-bold text-gray-700">Số lượng bán</TableHead>
                          <TableHead className="font-bold text-gray-700">Doanh thu</TableHead>
                          <TableHead className="font-bold text-gray-700">Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todayData.topProducts.map((product, index) => (
                          <TableRow key={product.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
                            <TableCell className="text-blue-600 font-semibold">{product.soLuongDaBan}</TableCell>
                            <TableCell className="text-green-600 font-semibold">
                              {product.doanhThu.toLocaleString()} VND
                            </TableCell>
                            <TableCell>
                              {product.statusBreakdown?.map((b: any, idx: number) => (
                                <div key={idx} className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">{b.status}:</span> {b.soLuong} 
                                  <span className="text-green-600 ml-1">
                                    ({b.doanhThu.toLocaleString()} VND)
                                  </span>
                                </div>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label htmlFor="timeFilter" className="font-medium">Chọn khoảng thời gian:</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Theo ngày</SelectItem>
                  <SelectItem value="monthly">Theo tháng</SelectItem>
                  <SelectItem value="yearly">Theo năm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timeFilter === "daily" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Thống kê theo ngày</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="date"
                      value={dailyDate}
                      onChange={(e) => setDailyDate(e.target.value)}
                      className="border rounded-md p-2"
                      style={{ width: "350px" }}
                      aria-label="Chọn ngày thống kê"
                    />
                    <Button onClick={handleDailyStatisticsClick}>Thống kê</Button>
                  </div>
                  {dailyData ? (
                    <>
                      <canvas
                        id="dailyChart"
                        width="900"
                        height="500"
                        style={{ margin: "auto", display: "block" }}
                      />
                      <div className="mt-4">
                        <p>Tổng doanh thu: {dailyData.totalRevenue.toLocaleString()} VND</p>
                        <p>Tổng đơn hàng: {dailyData.totalOrders.toLocaleString()}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Không tìm thấy dữ liệu trong khoảng thời gian này.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {timeFilter === "monthly" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Thống kê theo tháng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Select value={monthlyYear} onValueChange={setMonthlyYear}>
                      <SelectTrigger className="w-[350px]">
                        <SelectValue placeholder="Chọn năm" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={monthlyMonth} onValueChange={setMonthlyMonth}>
                      <SelectTrigger className="w-[350px]">
                        <SelectValue placeholder="Chọn tháng" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            Tháng {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={getMonthlyStatistics}>Thống kê</Button>
                  </div>
                  {monthlyData ? (
                    <>
                      <canvas
                        id="monthlyChart"
                        width="900"
                        height="500"
                        style={{ margin: "auto", display: "block" }}
                      />
                      <div className="mt-4">
                        <p>Tổng doanh thu: {monthlyData.totalRevenue.toLocaleString()} VND</p>
                        <p>Tổng đơn hàng: {monthlyData.totalOrders.toLocaleString()}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Không tìm thấy dữ liệu trong khoảng thời gian này.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {timeFilter === "yearly" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Thống kê theo năm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Select value={yearlyYear} onValueChange={setYearlyYear}>
                      <SelectTrigger className="w-[350px]">
                        <SelectValue placeholder="Chọn năm" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={getYearlyStatistics}>Thống kê</Button>
                  </div>
                  {yearlyData ? (
                    <>
                      <canvas
                        id="yearlyChart"
                        width="900"
                        height="500"
                        style={{ margin: "auto", display: "block" }}
                      />
                      <div className="mt-4">
                        <p>Tổng doanh thu: {yearlyData.totalRevenue.toLocaleString()} VND</p>
                        <p>Tổng đơn hàng: {yearlyData.totalOrders.toLocaleString()}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Không tìm thấy dữ liệu trong khoảng thời gian này.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="orderStatus">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label htmlFor="timeFilter" className="font-medium">Chọn khoảng thời gian:</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Theo ngày</SelectItem>
                  <SelectItem value="monthly">Theo tháng</SelectItem>
                  <SelectItem value="yearly">Theo năm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timeFilter === "daily" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Thống kê trạng thái đơn hàng theo ngày</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="date"
                      value={dailyDate}
                      onChange={(e) => setDailyDate(e.target.value)}
                      className="border rounded-md p-2"
                      style={{ width: "350px" }}
                      aria-label="Chọn ngày thống kê"
                    />
                    <Button onClick={handleOrderStatusStatisticsClick}>Thống kê</Button>
                  </div>
                  {orderStatusData.length > 0 ? (
                    <canvas
                      id="orderStatusChart"
                      width="500"
                      height="500"
                      style={{ margin: "auto", display: "block" }}
                    />
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Không tìm thấy dữ liệu trong khoảng thời gian này.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {timeFilter === "monthly" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Thống kê trạng thái đơn hàng theo tháng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Select value={monthlyYear} onValueChange={setMonthlyYear}>
                      <SelectTrigger className="w-[350px]">
                        <SelectValue placeholder="Chọn năm" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={monthlyMonth} onValueChange={setMonthlyMonth}>
                      <SelectTrigger className="w-[350px]">
                        <SelectValue placeholder="Chọn tháng" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            Tháng {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleOrderStatusStatisticsClick}>Thống kê</Button>
                  </div>
                  {orderStatusData.length > 0 ? (
                    <canvas
                      id="orderStatusChart"
                      width="500"
                      height="500"
                      style={{ margin: "auto", display: "block" }}
                    />
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Không tìm thấy dữ liệu trong khoảng thời gian này.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {timeFilter === "yearly" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Thống kê trạng thái đơn hàng theo năm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Select value={yearlyYear} onValueChange={setYearlyYear}>
                      <SelectTrigger className="w-[350px]">
                        <SelectValue placeholder="Chọn năm" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleOrderStatusStatisticsClick}>Thống kê</Button>
                  </div>
                  {orderStatusData.length > 0 ? (
                    <canvas
                      id="orderStatusChart"
                      width="500"
                      height="500"
                      style={{ margin: "auto", display: "block" }}
                    />
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Không tìm thấy dữ liệu trong khoảng thời gian này.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="topProducts">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label htmlFor="timeFilter" className="font-medium">Chọn khoảng thời gian:</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Theo ngày</SelectItem>
                  <SelectItem value="monthly">Theo tháng</SelectItem>
                  <SelectItem value="yearly">Theo năm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timeFilter === "daily" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Sản phẩm bán chạy theo ngày</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="date"
                      value={dailyDate}
                      onChange={(e) => setDailyDate(e.target.value)}
                      className="border rounded-md p-2"
                      style={{ width: "350px" }}
                      aria-label="Chọn ngày thống kê"
                    />
                    <Button onClick={handleTopProductsStatisticsClick}>Thống kê</Button>
                  </div>
                  {topProductsData.length > 0 ? (
                    <>
                      <canvas
                        id="topProductsChart"
                        width="500"
                        height="500"
                        style={{ margin: "auto", display: "block" }}
                      />
                      <div className="mt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tên sản phẩm</TableHead>
                              <TableHead>Thương hiệu</TableHead>
                              <TableHead>Chất liệu</TableHead>
                              <TableHead>Số lượng đã bán</TableHead>
                              <TableHead>Doanh thu</TableHead>
                              <TableHead>Trạng thái</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topProductsData.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.thuongHieu}</TableCell>
                                <TableCell>{product.chatLieu}</TableCell>
                                <TableCell>{product.soLuongDaBan}</TableCell>
                                <TableCell>{product.doanhThu.toLocaleString()} VND</TableCell>
                                <TableCell>
                                  {product.statusBreakdown.map((b: any, index: number) => (
                                    <div key={index}>
                                      {b.status}: {b.soLuong} (Doanh thu: {b.doanhThu.toLocaleString()} VND)
                                    </div>
                                  ))}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Không tìm thấy dữ liệu trong khoảng thời gian này.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {timeFilter === "monthly" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Sản phẩm bán chạy theo tháng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Select value={monthlyYear} onValueChange={setMonthlyYear}>
                      <SelectTrigger className="w-[350px]">
                        <SelectValue placeholder="Chọn năm" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={monthlyMonth} onValueChange={setMonthlyMonth}>
                      <SelectTrigger className="w-[350px]">
                        <SelectValue placeholder="Chọn tháng" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            Tháng {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleTopProductsStatisticsClick}>Thống kê</Button>
                  </div>
                  {topProductsData.length > 0 ? (
                    <>
                      <canvas
                        id="topProductsChart"
                        width="500"
                        height="500"
                        style={{ margin: "auto", display: "block" }}
                      />
                      <div className="mt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tên sản phẩm</TableHead>
                              <TableHead>Thương hiệu</TableHead>
                              <TableHead>Chất liệu</TableHead>
                              <TableHead>Số lượng đã bán</TableHead>
                              <TableHead>Doanh thu</TableHead>
                              <TableHead>Trạng thái</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topProductsData.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.thuongHieu}</TableCell>
                                <TableCell>{product.chatLieu}</TableCell>
                                <TableCell>{product.soLuongDaBan}</TableCell>
                                <TableCell>{product.doanhThu.toLocaleString()} VND</TableCell>
                                <TableCell>
                                  {product.statusBreakdown.map((b: any, index: number) => (
                                    <div key={index}>
                                      {b.status}: {b.soLuong} (Doanh thu: {b.doanhThu.toLocaleString()} VND)
                                    </div>
                                  ))}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Không tìm thấy dữ liệu trong khoảng thời gian này.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {timeFilter === "yearly" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Sản phẩm bán chạy theo năm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Select value={yearlyYear} onValueChange={setYearlyYear}>
                      <SelectTrigger className="w-[350px]">
                        <SelectValue placeholder="Chọn năm" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleTopProductsStatisticsClick}>Thống kê</Button>
                  </div>
                  {topProductsData.length > 0 ? (
                    <>
                      <canvas
                        id="topProductsChart"
                        width="500"
                        height="500"
                        style={{ margin: "auto", display: "block" }}
                      />
                      <div className="mt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tên sản phẩm</TableHead>
                              <TableHead>Thương hiệu</TableHead>
                              <TableHead>Chất liệu</TableHead>
                              <TableHead>Số lượng đã bán</TableHead>
                              <TableHead>Doanh thu</TableHead>
                              <TableHead>Trạng thái</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topProductsData.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.thuongHieu}</TableCell>
                                <TableCell>{product.chatLieu}</TableCell>
                                <TableCell>{product.soLuongDaBan}</TableCell>
                                <TableCell>{product.doanhThu.toLocaleString()} VND</TableCell>
                                <TableCell>
                                  {product.statusBreakdown.map((b: any, index: number) => (
                                    <div key={index}>
                                      {b.status}: {b.soLuong} (Doanh thu: {b.doanhThu.toLocaleString()} VND)
                                    </div>
                                  ))}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Không tìm thấy dữ liệu trong khoảng thời gian này.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;