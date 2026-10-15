using Azure;
using Google.Apis.Sheets.v4.Data;
using Microsoft.EntityFrameworkCore;
using UltraStrore.Data;
using UltraStrore.Data.Temp;
using UltraStrore.Helper;
using UltraStrore.Models.CreateModels;
using UltraStrore.Models.EditModels;
using UltraStrore.Models.ViewModels;
using UltraStrore.Repository;

namespace UltraStrore.Services
{
    public class CartServices : ICartServices
    {
        private readonly ApplicationDbContext _context;
        private readonly IKhuyenMaiServices _servicesKM;

        public CartServices(ApplicationDbContext context, IKhuyenMaiServices services)
        {
            _servicesKM = services;
            _context = context;
        }    
        public async Task<GioHangView> GioHangViews(string? MaKhachHang)
        {
            GioHangView GioHangView = new GioHangView
            {
                CTGHSanPhamView = new List<ChiTietGioHangSanPhamView>(),
                CTGHComboView = new List<ChiTietGioHangComboView>()
            };

            if (string.IsNullOrWhiteSpace(MaKhachHang))
            {
                return GioHangView;
            }

            try
            {
                var GioHang = await _context.GioHangs.FirstOrDefaultAsync(g => g.MaNguoiDung == MaKhachHang);
                if (GioHang == null)
                {
                    GioHang = new GioHang
                    {
                        MaNguoiDung = MaKhachHang
                    };
                    _context.GioHangs.Add(GioHang);
                    await _context.SaveChangesAsync();
                }

                GioHangView.ID = GioHang.MaGioHang;
                GioHangView.IDNguoiDung = MaKhachHang;

                var CTGH = await _context.ChiTietGioHangs
                    .Where(g => g.MaGioHang == GioHang.MaGioHang)
                    .ToListAsync();

                var CTGHSanPham = CTGH.Where(g => !string.IsNullOrEmpty(g.MaSanPham)).ToList();
                var DetailSanPhamView = new List<ChiTietGioHangSanPhamView>();

                foreach (var item in CTGHSanPham)
                {
                    var cleanSku = (item.MaSanPham ?? "").Trim();
                    var sp = await _context.SanPhams.FirstOrDefaultAsync(g => g.MaSanPham == cleanSku);
                    if (sp == null)
                    {
                        sp = await _context.SanPhams.FirstOrDefaultAsync(g => g.MaSanPham.ToLower() == cleanSku.ToLower());
                    }

                    var parts = cleanSku.Split('_');
                    string mauSac = parts.Length > 1 ? parts[1].Replace("#", "") : "";
                    string kickThuoc = parts.Length > 2 ? parts[2] : "";

                    int giaGoc = item.Gia ?? (sp?.Gia ?? 0);
                    int pct = item.Percent ?? 0;
                    int tien = pct > 0 ? (100 - pct) * giaGoc / 100 : giaGoc;

                    string baseSku = cleanSku.Length >= 6 ? cleanSku.Substring(0, 6) : cleanSku;
                    var hinh = await _context.HinhAnhs.FirstOrDefaultAsync(g => g.MaSanPham == baseSku);

                    byte[]? hinhData = null;
                    if (!string.IsNullOrEmpty(hinh?.Link))
                    {
                        hinhData = System.Text.Encoding.UTF8.GetBytes(hinh.Link);
                    }
                    else if (hinh?.Data != null && hinh.Data.Length > 0)
                    {
                        hinhData = hinh.Data;
                    }

                    DetailSanPhamView.Add(new ChiTietGioHangSanPhamView
                    {
                        ChiTietGioHangSanPham = item.MaCtgh,
                        IDSanPham = cleanSku,
                        TenSanPham = sp?.TenSanPham ?? cleanSku,
                        TienSanPham = tien,
                        MauSac = mauSac,
                        KickThuoc = kickThuoc,
                        SoLuong = item.SoLuong ?? 1,
                        HinhAnh = hinhData,
                        MaKhuyenMai = item.MaKhuyenMai,
                        ThanhTien = (item.SoLuong ?? 1) * tien
                    });
                }
                GioHangView.CTGHSanPhamView = DetailSanPhamView;

                var CTGHCombo = CTGH.Where(g => g.MaCombo != null).ToList();
                var DetailComboView = new List<ChiTietGioHangComboView>();

                foreach (var item in CTGHCombo)
                {
                    var Combo = await _context.ComBoSanPhams.FirstOrDefaultAsync(g => g.MaComBo == item.MaCombo);
                    var sanphamList = await _context.GioHangSupports
                        .Where(g => g.ChiTietGioHang == item.MaCtgh)
                        .ToListAsync();

                    var splist = new List<SanPhamInGioHangCombo>();
                    foreach (var s in sanphamList)
                    {
                        var spInCombo = await _context.SanPhams.FirstOrDefaultAsync(g => g.MaSanPham == s.MaSanPham);
                        string baseSku = (s.MaSanPham ?? "").Length >= 6 ? s.MaSanPham.Substring(0, 6) : (s.MaSanPham ?? "");
                        var hinh = await _context.HinhAnhs.FirstOrDefaultAsync(g => g.MaSanPham == baseSku);

                        byte[]? spHinh = null;
                        if (!string.IsNullOrEmpty(hinh?.Link))
                            spHinh = System.Text.Encoding.UTF8.GetBytes(hinh.Link);
                        else if (hinh?.Data != null)
                            spHinh = hinh.Data;

                        splist.Add(new SanPhamInGioHangCombo
                        {
                            MaSanPham = s.MaSanPham,
                            TenSanPham = spInCombo?.TenSanPham ?? s.MaSanPham,
                            SoLuong = s.SoLuong,
                            Version = s.Version,
                            HinhAnh = spHinh
                        });
                    }

                    int giaCombo = item.Gia ?? (int)(Combo?.TongGia ?? 0);
                    int pct = item.Percent ?? 0;
                    int tienCombo = pct > 0 ? (100 - pct) * giaCombo / 100 : giaCombo;

                    byte[]? comboHinh = null;
                    if (Combo?.HinhAnh != null && Combo.HinhAnh.Length > 0)
                    {
                        comboHinh = Combo.HinhAnh;
                    }

                    DetailComboView.Add(new ChiTietGioHangComboView
                    {
                        ChiTietGioHangCombo = item.MaCtgh,
                        IDCombo = item.MaCombo ?? 0,
                        TenCombo = Combo?.TenComBo ?? "Combo",
                        SoLuong = item.SoLuong ?? 1,
                        Gia = tienCombo,
                        HinhAnh = comboHinh,
                        SanPhamList = splist
                    });
                }
                GioHangView.CTGHComboView = DetailComboView;

                return GioHangView;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GioHangViews: {ex.Message}\n{ex.StackTrace}");
                return GioHangView;
            }
        }

        public async Task<APIResponse> ThemSanPham(ChiTietGioHangSanPhamCreate info)
        {
            APIResponse response = new APIResponse();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(info.IDNguoiDung))
                {
                    response.ResponseCode = 401;
                    response.Result = "Chưa cung cấp thông tin người dùng.";
                    return response;
                }

                var user = await _context.NguoiDungs.FirstOrDefaultAsync(g => g.MaNguoiDung == info.IDNguoiDung);
                if (user == null)
                {
                    response.ResponseCode = 401;
                    response.Result = "Người dùng không tồn tại.";
                    return response;
                }

                string cleanId = (info.IDSanPham ?? "").Trim().Split('_')[0];
                string cleanColor = (info.MauSac ?? "").Trim().Replace("#", "");
                string cleanSize = (info.KichThuoc ?? "").Trim();
                string maSanPham = $"{cleanId}_{cleanColor}_{cleanSize}";

                var sanPham = await _context.SanPhams.FirstOrDefaultAsync(g => g.MaSanPham == maSanPham);
                if (sanPham == null)
                {
                    sanPham = await _context.SanPhams.FirstOrDefaultAsync(g => g.MaSanPham.ToLower() == maSanPham.ToLower());
                }
                if (sanPham == null)
                {
                    sanPham = await _context.SanPhams.FirstOrDefaultAsync(g => g.MaSanPham.StartsWith(cleanId));
                }

                if (sanPham == null)
                {
                    response.ResponseCode = 404;
                    response.Result = $"Không tìm thấy sản phẩm {maSanPham}";
                    return response;
                }

                maSanPham = sanPham.MaSanPham;

                var gioHang = await _context.GioHangs.FirstOrDefaultAsync(g => g.MaNguoiDung == user.MaNguoiDung);
                if (gioHang == null)
                {
                    gioHang = new GioHang
                    {
                        MaNguoiDung = user.MaNguoiDung
                    };
                    _context.GioHangs.Add(gioHang);
                    await _context.SaveChangesAsync();
                }

                var existingItem = await _context.ChiTietGioHangs.FirstOrDefaultAsync(g =>
                    g.MaGioHang == gioHang.MaGioHang && g.MaSanPham == maSanPham);

                if (existingItem != null)
                {
                    int addQty = (info.SoLuong ?? 0) > 0 ? (info.SoLuong ?? 1) : 1;
                    existingItem.SoLuong = (existingItem.SoLuong ?? 0) + addQty;
                    existingItem.ThanhTien = existingItem.SoLuong * (existingItem.Gia ?? sanPham.Gia ?? 0);
                    _context.ChiTietGioHangs.Update(existingItem);
                }
                else
                {
                    int qty = (info.SoLuong ?? 0) > 0 ? (info.SoLuong ?? 1) : 1;
                    int unitPrice = sanPham.Gia ?? 0;
                    var ctgh = new ChiTietGioHang
                    {
                        MaGioHang = gioHang.MaGioHang,
                        MaSanPham = maSanPham,
                        MaCombo = null,
                        SoLuong = qty,
                        Gia = unitPrice,
                        ThanhTien = qty * unitPrice,
                        Percent = 0,
                        DeadTime = false
                    };
                    _context.ChiTietGioHangs.Add(ctgh);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                response.ResponseCode = 201;
                response.Result = "Thêm sản phẩm vào giỏ hàng thành công";
                return response;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                response.ResponseCode = 500;
                response.Result = $"Lỗi: {ex.Message}";
                return response;
            }
        }
        public async Task<APIResponse> ThemCombo(ChiTietGioHangComboCreate info)
        {
            APIResponse response = new APIResponse();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                int MaKhuyenMai = -1;
                bool DeadTime = false;
                int Percent = 0;
                var KhuyenMaiView = (await _servicesKM.ListKhuyenMaiAdmin(null)).ToList();
                var KhuyenMaiThis = KhuyenMaiView.Where(g => g.ID == info.MaKhuyenMai).FirstOrDefault();
                var Combo = _context.ComBoSanPhams.Where(g => g.MaComBo == info.IDCombo).FirstOrDefault();
                if (Combo == null)
                {
                    response.ResponseCode = 404;
                    response.Result = "Combo không tồn tại.";
                    return response;
                }

                var GioHang = _context.GioHangs.Where(g => g.MaNguoiDung == info.IDKhachHang).FirstOrDefault();
                if (GioHang == null) 
                {
                    GioHang newGH = new GioHang
                    {
                        MaNguoiDung = info.IDKhachHang
                    };
                    _context.GioHangs.Add(newGH);
                    await _context.SaveChangesAsync(); 
                }

                GioHang = _context.GioHangs.Where(g => g.MaNguoiDung == info.IDKhachHang).FirstOrDefault();
                if (GioHang == null)
                {
                    throw new Exception("Không thể tạo giỏ hàng mới.");
                }

                var ChiTietGioHangs = _context.ChiTietGioHangs
                    .Where(g => g.MaGioHang == GioHang.MaGioHang && g.MaCombo == info.IDCombo)
                    .FirstOrDefault();

                if (ChiTietGioHangs != null) // Đã có combo trong giỏ hàng
                {
                    int support = _context.GioHangSupports.Where(g => g.ChiTietGioHang == ChiTietGioHangs.MaCtgh).OrderByDescending(g=>g.Version).Select(g=>g.ID).FirstOrDefault() +1;
                    var CTComboList = _context.ChiTietComBos.Where(g => g.MaComBo == info.IDCombo).ToList();
                    foreach (var item in info.Detail)
                    {
                        if (item.MauSac.StartsWith("#"))
                            item.MauSac = item.MauSac.Substring(1);
                        var ChiTietCombo = CTComboList.FirstOrDefault(g => g.MaSanPham.Trim() == item.MaSanPham.Trim());
                        if (ChiTietCombo == null) continue;

                        string EndPointID = $"{item.MaSanPham.Trim()}_{item.MauSac.Trim()}_{item.KichThuoc.Trim()}";
                        bool Found = false;

                        ChiTietGioHangSupport sp = new ChiTietGioHangSupport
                        {
                            ChiTietGioHang = ChiTietGioHangs.MaCtgh,
                            MaSanPham = EndPointID,
                            MaChiTietCombo = ChiTietCombo.MaChiTietComBo,
                            SoLuong = info.SoLuong * ChiTietCombo.SoLuong ?? 0,
                            Version = support
                        };
                        _context.GioHangSupports.Add(sp);
                    }
                    ChiTietGioHangs.SoLuong += info.SoLuong;
                    ChiTietGioHangs.ThanhTien = ChiTietGioHangs.Gia * ChiTietGioHangs.SoLuong;
                    _context.ChiTietGioHangs.Update(ChiTietGioHangs);
                }
                else 
                {
                    ChiTietGioHang newCTGH = new ChiTietGioHang
                    {
                        MaGioHang = GioHang.MaGioHang,
                        MaCombo = info.IDCombo,
                        SoLuong = info.SoLuong,
                        Gia = (int)Combo.TongGia,
                        ThanhTien = (int)Combo.TongGia * info.SoLuong,
                    };
                    _context.ChiTietGioHangs.Add(newCTGH);
                    await _context.SaveChangesAsync(); // Save to get MaCtgh

                    var CTComboList = _context.ChiTietComBos.Where(g => g.MaComBo == info.IDCombo).ToList();
                    foreach (var item in info.Detail)
                    {
                        if (item.MauSac.StartsWith("#"))
                            item.MauSac = item.MauSac.Substring(1);
                        string MaSanPhamEndPoint = $"{item.MaSanPham.Trim()}_{item.MauSac.Trim()}_{item.KichThuoc.Trim()}";
                        var CTCombo = CTComboList.FirstOrDefault(g => g.MaSanPham.Trim() == item.MaSanPham.Trim());
                        if (CTCombo == null) continue;

                        ChiTietGioHangSupport support = new ChiTietGioHangSupport
                        {
                            ChiTietGioHang = newCTGH.MaCtgh,
                            MaSanPham = MaSanPhamEndPoint,
                            MaChiTietCombo = CTCombo.MaChiTietComBo,
                            SoLuong = newCTGH.SoLuong * CTCombo.SoLuong ?? 0,
                            Version = 1
                        };
                        _context.GioHangSupports.Add(support);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                response.ResponseCode = 200;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                response.ResponseCode = 500;
                response.Result = $"Lỗi: {ex.Message}";
            }
            return response;
        }

        public async Task<APIResponse> GiamSoLuongSanPham(TangGiamSoLuongGioHang info)
        {
            APIResponse response = new APIResponse();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var GioHang = _context.GioHangs.Where(g => g.MaNguoiDung.Trim() == info.MaKhachHang).FirstOrDefault();
                var ChiTietGiohang = _context.ChiTietGioHangs.Where(g => g.MaGioHang == GioHang.MaGioHang && g.MaSanPham == info.IDSanPham).FirstOrDefault();
                ChiTietGiohang.SoLuong--;
                _context.ChiTietGioHangs.Update(ChiTietGiohang);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                response.ResponseCode = 200;
            }
            catch (Exception ex) 
            {
                await transaction.RollbackAsync();
                response.ResponseCode = 500;
                response.Result = $"Lỗi: {ex.Message}";
            }
            return response;
        }

        public async Task<APIResponse> TangSoLuongSanPham(TangGiamSoLuongGioHang info)
        {
            APIResponse response = new APIResponse();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var GioHang = _context.GioHangs.Where(g => g.MaNguoiDung.Trim() == info.MaKhachHang).FirstOrDefault();
                var ChiTietGiohang = _context.ChiTietGioHangs.Where(g => g.MaGioHang == GioHang.MaGioHang && g.MaSanPham == info.IDSanPham).FirstOrDefault();
                ChiTietGiohang.SoLuong++;
                _context.ChiTietGioHangs.Update(ChiTietGiohang);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                response.ResponseCode = 200;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                response.ResponseCode = 500;
                response.Result = $"Lỗi: {ex.Message}";
            }
            return response;
        }
        public async Task<APIResponse> XoaChiTietGioHang(TangGiamSoLuongGioHang info)
        {
            APIResponse response = new APIResponse();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var GioHang = _context.GioHangs.Where(g => g.MaNguoiDung.Trim() == info.MaKhachHang).FirstOrDefault();
                var ChiTietGiohang = _context.ChiTietGioHangs.Where(g => g.MaGioHang == GioHang.MaGioHang && g.MaSanPham == info.IDSanPham).FirstOrDefault();
                _context.ChiTietGioHangs.Remove(ChiTietGiohang);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                response.ResponseCode = 200;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                response.ResponseCode = 500;
                response.Result = $"Lỗi: {ex.Message}";
            }
            return response;
        }
        public async Task<APIResponse> XoaVersionComboGioHang(GioHangComboVersion info)
        {
            APIResponse response = new APIResponse();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var ctgh = _context.ChiTietGioHangs.Where(g => g.MaCtgh == info.ChiTietGioHang).FirstOrDefault();
                var ghSupport = _context.GioHangSupports.Where(g => g.ChiTietGioHang == info.ChiTietGioHang && g.Version == info.Version).ToList();
                var ctCombo = _context.ChiTietComBos.Where(g => g.MaChiTietComBo == ghSupport[0].MaChiTietCombo).FirstOrDefault();
                ctgh.SoLuong = ctgh.SoLuong - ghSupport[0].SoLuong/ctCombo.SoLuong;
                _context.GioHangSupports.RemoveRange(ghSupport);
                if (ctgh.SoLuong == 0)
                    _context.ChiTietGioHangs.Remove(ctgh);
                else
                    _context.ChiTietGioHangs.Update(ctgh);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                response.ResponseCode = 200;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                response.ResponseCode = 500;
                response.Result = $"Lỗi: {ex.Message}";
            }
            return response;
        }

        public async Task<APIResponse> XoaChiTietGiohangCombo(TangGiamSoLuongGioHang info)
        {
            APIResponse response = new APIResponse();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var GioHang = _context.GioHangs.Where(g => g.MaNguoiDung.Trim() == info.MaKhachHang).FirstOrDefault();
                var ChiTietGiohang = _context.ChiTietGioHangs.Where(g => g.MaGioHang == GioHang.MaGioHang && g.MaCombo == info.IDCombo).FirstOrDefault();
                var ChiTietComboSupportGioHang = _context.GioHangSupports.Where(g => g.MaChiTietCombo == ChiTietGiohang.MaGioHang).ToList();
                _context.GioHangSupports.RemoveRange(ChiTietComboSupportGioHang);
                _context.ChiTietGioHangs.Remove(ChiTietGiohang);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                response.ResponseCode = 200;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                response.ResponseCode = 500;
                response.Result = $"Lỗi: {ex.Message}";
            }
            return response;
        }
        public async Task<APIResponse> CopyGioHang(CopyGHModel info)
        {
            APIResponse response = new APIResponse();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                int MaGH = -1;
                var GioHangUser = _context.GioHangs.Where(g => g.MaNguoiDung.Trim() == info.UserID.Trim()).FirstOrDefault();
                var CopyUser = _context.GioHangs.Where(g => g.MaNguoiDung.Trim() == info.CopyID.Trim()).FirstOrDefault();
                if (GioHangUser == null)
                {
                    int MaxGH = _context.GioHangs.OrderByDescending(g => g.MaGioHang).Select(g => g.MaGioHang).FirstOrDefault();
                    MaxGH++;
                    GioHang newGH = new GioHang
                    {
                        MaGioHang = MaxGH,
                        MaNguoiDung = info.UserID
                    };
                    _context.GioHangs.Add(newGH);
                    MaGH = newGH.MaGioHang;
                }
                else
                    MaGH = GioHangUser.MaGioHang;
                var ChiTietGH1List = _context.ChiTietGioHangs.Where(g => g.MaGioHang == MaGH).ToList();
                var ChiTietGH2List = _context.ChiTietGioHangs.Where(g => g.MaGioHang == CopyUser.MaGioHang).ToList();
                if (ChiTietGH1List.Count > 0)
                {
                    for (int n = 0; n < ChiTietGH2List.Count(); n++)
                    {
                        if (ChiTietGH2List[n].MaSanPham != null || !string.IsNullOrEmpty(ChiTietGH2List[n].MaSanPham))
                        {
                            bool Found = false;
                            for (int i = 0; i < ChiTietGH1List.Count(); i++)
                            {
                                if (ChiTietGH1List[i].MaSanPham != null)
                                {
                                    if (ChiTietGH1List[i].MaSanPham == ChiTietGH2List[n].MaSanPham)
                                    {
                                        Found = true;
                                        ChiTietGH1List[i].SoLuong += ChiTietGH2List[n].SoLuong;
                                        var Test = ChiTietGH1List[i];
                                        _context.ChiTietGioHangs.Update(Test);
                                        await _context.SaveChangesAsync();
                                        break;
                                    }                                                                
                                }                                  
                            }
                            if (!Found)
                            {
                                ChiTietGioHang newCTGH = new ChiTietGioHang();
                                newCTGH.MaSanPham = ChiTietGH2List[n].MaSanPham;
                                newCTGH.SoLuong = ChiTietGH2List[n].SoLuong;
                                newCTGH.Gia = ChiTietGH2List[n].Gia;
                                newCTGH.ThanhTien = ChiTietGH2List[n].ThanhTien;
                                newCTGH.MaGioHang = MaGH;
                                _context.ChiTietGioHangs.Add(newCTGH);
                                await _context.SaveChangesAsync();
                            }
                        }
                        else
                        {
                                if (ChiTietGH2List[n].MaCombo!=null)
                                {
                                    bool Found = false;
                                    for (int m = 0; m < ChiTietGH1List.Count(); m++)
                                    {
                                        if (ChiTietGH1List[m].MaCombo!=null)
                                        {
                                            if (ChiTietGH1List[m].MaCombo == ChiTietGH2List[n].MaCombo)
                                            {
                                                Found = true;
                                                ChiTietGH1List[m].SoLuong += ChiTietGH2List[n].SoLuong;
                                                var Test = ChiTietGH1List[m];               
                                                var CTCB = _context.ChiTietComBos.Where(g => g.MaComBo == ChiTietGH2List[n].MaCombo).ToList();
                                                var CTCBUser = _context.ChiTietComBos.Where(g => g.MaComBo == ChiTietGH1List[m].MaCombo).OrderByDescending(g => g.MaChiTietComBo).FirstOrDefault();
                                                int GioHangSupportUser = _context.GioHangSupports.Where(g => g.ChiTietGioHang == ChiTietGH1List[m].MaCtgh && g.MaChiTietCombo == CTCBUser.MaChiTietComBo).OrderByDescending(g => g.Version).Select(g => g.Version).FirstOrDefault() + 1;

                                                for (int k = 0; k < CTCB.Count(); k++)
                                                {
                                                    int Variant = GioHangSupportUser;
                                                    var GioHangSupportCopy = _context.GioHangSupports.Where(g => g.ChiTietGioHang == ChiTietGH2List[n].MaCtgh && g.MaChiTietCombo == CTCB[k].MaChiTietComBo).ToList();
                                                    int Temp = -1;
                                                    for (int l = 0; l < GioHangSupportCopy.Count(); l++)
                                                    {
                                                        if (l == 0)
                                                        {
                                                            Temp = GioHangSupportCopy[l].Version;
                                                            ChiTietGioHangSupport newCTGHSP = new ChiTietGioHangSupport();
                                                            newCTGHSP.ChiTietGioHang = ChiTietGH1List[m].MaCtgh;
                                                            newCTGHSP.MaSanPham = GioHangSupportCopy[l].MaSanPham;
                                                            newCTGHSP.SoLuong = GioHangSupportCopy[l].SoLuong;
                                                            newCTGHSP.MaChiTietCombo = CTCB[k].MaChiTietComBo;
                                                            newCTGHSP.Version = Variant;
                                                            _context.GioHangSupports.Add(newCTGHSP);
                                                        }
                                                        else
                                                        {
                                                            if (Temp == GioHangSupportCopy[l].Version)
                                                            {
                                                                ChiTietGioHangSupport newCTGHSP = new ChiTietGioHangSupport();
                                                                newCTGHSP.ChiTietGioHang = ChiTietGH1List[m].MaCtgh;
                                                                newCTGHSP.MaSanPham = GioHangSupportCopy[l].MaSanPham;
                                                                newCTGHSP.SoLuong = GioHangSupportCopy[l].SoLuong;
                                                                newCTGHSP.MaChiTietCombo = CTCB[k].MaChiTietComBo;
                                                                newCTGHSP.Version = Variant;
                                                                _context.GioHangSupports.Add(newCTGHSP);
                                                            }
                                                            else
                                                            {
                                                                Variant++;
                                                                Temp = GioHangSupportCopy[l].Version;
                                                                ChiTietGioHangSupport newCTGHSP = new ChiTietGioHangSupport();
                                                                newCTGHSP.ChiTietGioHang = ChiTietGH1List[m].MaCtgh;
                                                                newCTGHSP.MaSanPham = GioHangSupportCopy[l].MaSanPham;
                                                                newCTGHSP.SoLuong = GioHangSupportCopy[l].SoLuong;
                                                                newCTGHSP.MaChiTietCombo = CTCB[k].MaChiTietComBo;
                                                                newCTGHSP.Version = Variant;
                                                                _context.GioHangSupports.Add(newCTGHSP);

                                                            }
                                                        }
                                                    }
                                                }
                                                break;
                                            }
                                        }    
                                    }
                                    if (!Found)
                                    {
                                        ChiTietGioHang newCTGH = new ChiTietGioHang();
                                        newCTGH.MaCombo = ChiTietGH2List[n].MaCombo;
                                        newCTGH.SoLuong = ChiTietGH2List[n].SoLuong;
                                        newCTGH.Gia = ChiTietGH2List[n].Gia;
                                        newCTGH.ThanhTien = ChiTietGH2List[n].ThanhTien;
                                        newCTGH.MaGioHang = MaGH;
                                        _context.ChiTietGioHangs.Add(newCTGH);
                                        await _context.SaveChangesAsync();
                                        int MaChiTietGioHangCombo = newCTGH.MaCtgh;
                                        var GioHangSupport = _context.GioHangSupports.Where(g => g.ChiTietGioHang == ChiTietGH2List[n].MaCtgh).ToList();
                                        foreach (var item in GioHangSupport)
                                        {
                                            ChiTietGioHangSupport CTGHSp = new ChiTietGioHangSupport();
                                            CTGHSp.MaChiTietCombo = item.MaChiTietCombo;
                                            CTGHSp.ChiTietGioHang = MaChiTietGioHangCombo;
                                            CTGHSp.SoLuong = item.SoLuong;
                                            CTGHSp.Version = item.Version;
                                            CTGHSp.MaSanPham = item.MaSanPham;
                                            _context.GioHangSupports.Add(CTGHSp);
                                            await _context.SaveChangesAsync();
                                        }
                                    }
                                }                       
                            await _context.SaveChangesAsync();
                        }
                    }
                }
                else
                {
                    for (int j = 0; j < ChiTietGH2List.Count(); j++)
                    {
                     
                        ChiTietGioHang newCTGH = new ChiTietGioHang();

                        newCTGH.SoLuong = ChiTietGH2List[j].SoLuong;
                        newCTGH.Gia = ChiTietGH2List[j].Gia;
                        newCTGH.ThanhTien = ChiTietGH2List[j].ThanhTien;
                        newCTGH.MaGioHang = MaGH;
                        _context.ChiTietGioHangs.Add(newCTGH);
                        await _context.SaveChangesAsync();
                        int MaChiTietGioHangCombo = newCTGH.MaCtgh;
                        if (ChiTietGH2List[j].MaCombo != null)
                        {
                            newCTGH.MaCombo = ChiTietGH2List[j].MaCombo;
                            _context.ChiTietGioHangs.Update(newCTGH);
                            var GioHangSupport = _context.GioHangSupports.Where(g => g.ChiTietGioHang == ChiTietGH2List[j].MaCtgh).ToList();
                            foreach (var item in GioHangSupport)
                            {
                                ChiTietGioHangSupport CTGHSp = new ChiTietGioHangSupport();
                                CTGHSp.MaChiTietCombo = item.MaChiTietCombo;
                                CTGHSp.ChiTietGioHang = MaChiTietGioHangCombo;
                                CTGHSp.SoLuong = item.SoLuong;
                                CTGHSp.Version = item.Version;
                                CTGHSp.MaSanPham = item.MaSanPham;
                                _context.GioHangSupports.Add(CTGHSp);
                                await _context.SaveChangesAsync();
                            }
                        }  
                        else
                        {
                            newCTGH.MaSanPham = ChiTietGH2List[j].MaSanPham;
                            _context.ChiTietGioHangs.Update(newCTGH);
                            await _context.SaveChangesAsync();
                        }    
                    }
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                response.ResponseCode = 200;
            }
            catch(Exception ex)
            {
                await transaction.RollbackAsync();
                response.ResponseCode = 500;
                response.Result = $"Lỗi: {ex.Message}";
            }
            return response;
        }
    }
}

