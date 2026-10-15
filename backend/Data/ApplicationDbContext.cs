using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using UltraStrore.Data;
using UltraStrore.Data.Temp;

namespace UltraStrore.Data
{
    public partial class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext()
        {
        }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<BinhLuan> BinhLuans { get; set; } = null!;
        public virtual DbSet<ChiTietComBo> ChiTietComBos { get; set; } = null!;
        public virtual DbSet<ChiTietDonHang> ChiTietDonHangs { get; set; } = null!;
        public virtual DbSet<ChiTietGioHang> ChiTietGioHangs { get; set; } = null!;
        public virtual DbSet<ComBoSanPham> ComBoSanPhams { get; set; } = null!;
        public virtual DbSet<DanhSachDiaChi> DanhSachDiaChis { get; set; } = null!;
        public virtual DbSet<DonHang> DonHangs { get; set; } = null!;
        public virtual DbSet<GioHang> GioHangs { get; set; } = null!;
        public virtual DbSet<HinhAnh> HinhAnhs { get; set; } = null!;
        public virtual DbSet<NguoiDung> NguoiDungs { get; set; } = null!;
        public virtual DbSet<SanPham> SanPhams { get; set; } = null!;
        public virtual DbSet<ThuongHieu> ThuongHieus { get; set; } = null!;
        public virtual DbSet<Video> Videos { get; set; } = null!;
        public virtual DbSet<Voucher> Vouchers { get; set; } = null!;
        public virtual DbSet<Coupon> Coupons { get; set; } = null!;
        public virtual DbSet<YeuThich> YeuThichs { get; set; } = null!;
        public virtual DbSet<LienHe> LienHes { get; set; } = null!;
        public virtual DbSet<TinNhan> TinNhans { get; set; } = null!;
        public virtual DbSet<ChiTietGioHangSupport> GioHangSupports { get; set; }
        public virtual DbSet<GiaoDien> GiaoDiens { get; set; } = null!;
        public virtual DbSet<KichThuoc> KichThuocs { get; set; } = null!;
        public virtual DbSet<Blogs> Blogs { get; set; } = null!;
        public DbSet<PendingOder> PendingOrders { get; set; }
        public virtual DbSet<DonHangSupport> DonHangSupports { get; set; } = null!;
        public virtual DbSet<HashTag> HashTags { get; set; } = null!;
        public virtual DbSet<KhuyenMai> KhuyenMais { get; set; }
        public virtual DbSet<ChiTietKhuyenMai> ChiTietKhuyenMais { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            optionsBuilder.ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PendingOder>(entity =>
            {
                entity.HasKey(p => p.TempOrderId);
                entity.HasIndex(p => p.TempOrderId).IsUnique();
            });

            modelBuilder.Entity<DonHangSupport>(entity =>
            {
                entity.HasKey(p => p.ID);
                entity.Property(e => e.ID).ValueGeneratedOnAdd();
            });

            modelBuilder.Entity<ChiTietGioHangSupport>(entity =>
            {
                entity.HasKey(e => e.ID).HasName("PK__SupportGioHang");
                entity.Property(e => e.ID).ValueGeneratedOnAdd();
                entity.Property(e => e.MaSanPham).IsRequired().HasMaxLength(20);
                entity.Property(e => e.ChiTietGioHang);
                entity.Property(e => e.MaChiTietCombo);
                entity.Property(e => e.SoLuong);
                entity.Property(e => e.Version);
            });

            modelBuilder.Entity<Blogs>(entity =>
            {
                entity.HasKey(e => e.MaBlog).HasName("PK_BLOGS");
                entity.ToTable("BLOGS");
                entity.HasIndex(e => e.MaNguoiDung, "IX_BLOGS_ma_nguoi_dung");
                entity.Property(e => e.MaBlog).ValueGeneratedOnAdd().HasColumnName("ma_blog");
                entity.Property(e => e.MaNguoiDung).IsRequired().HasMaxLength(10).IsUnicode(false).HasColumnName("ma_nguoi_dung");
                entity.Property(e => e.NgayTao).HasColumnType("datetime").HasDefaultValueSql("GETDATE()").HasColumnName("ngay_tao");
                entity.Property(e => e.NoiDung).IsRequired().HasColumnType("nvarchar(max)").HasColumnName("noi_dung");
                entity.Property(e => e.TieuDe).IsRequired().HasMaxLength(255).HasColumnName("tieu_de");
                entity.Property(e => e.Likes).HasDefaultValue(0).HasColumnName("likes");

                entity.Property(e => e.UserLikes)
                    .HasColumnType("nvarchar(max)")
                    .HasConversion(
                        v => v == null ? null : JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                        v => v == null ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, new JsonSerializerOptions()))
                    .HasColumnName("user_likes");

                entity.Property(e => e.Tags)
                    .HasColumnType("nvarchar(max)")
                    .HasConversion(
                        v => v == null ? null : JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                        v => v == null ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, new JsonSerializerOptions()))
                    .HasColumnName("Tags");
            });

            modelBuilder.Entity<NguoiDung>(entity =>
            {
                entity.HasKey(e => e.MaNguoiDung).HasName("PK__NGUOI_DU__19C32CF72B9CA41E");
                entity.ToTable("NGUOI_DUNG");
                entity.Property(e => e.MaNguoiDung).HasMaxLength(10).IsUnicode(false).HasColumnName("ma_nguoi_dung");
                entity.Property(e => e.Cccd).HasMaxLength(20).HasColumnName("cccd");
                entity.Property(e => e.DiaChi).HasMaxLength(255).HasColumnName("dia_chi");
                entity.Property(e => e.Email).HasMaxLength(100).HasColumnName("email");
                entity.Property(e => e.HinhAnh).HasColumnName("hinh_anh");
                entity.Property(e => e.HoTen).HasMaxLength(100).HasColumnName("ho_ten");
                entity.Property(e => e.MoTa).HasMaxLength(10).IsUnicode(false).HasColumnName("mo_ta");
                entity.Property(e => e.MatKhau).HasMaxLength(255).HasColumnName("mat_khau");
                entity.Property(e => e.TaiKhoan).HasMaxLength(50).HasColumnName("tai_khoan");
                entity.Property(e => e.NgayTao).HasColumnName("ngay_dang_ky");
                entity.Property(e => e.NgaySinh).HasColumnName("ngay_sinh");
                entity.Property(e => e.Sdt).HasMaxLength(15).HasColumnName("sdt");
                entity.Property(e => e.TrangThai).HasColumnName("trang_thai");
                entity.Property(e => e.GioiTinh).HasColumnName("gioi_tinh");
            });

            modelBuilder.Entity<SanPham>(entity =>
            {
                entity.HasKey(e => e.MaSanPham).HasName("PK__SAN_PHAM__9D25990C2713A687");
                entity.ToTable("SAN_PHAM");
                entity.HasIndex(e => e.MaLoaiSanPham, "IX_SAN_PHAM_ma_loai_san_pham");
                entity.HasIndex(e => e.MaThuongHieu, "IX_SAN_PHAM_ma_thuong_hieu");
                entity.Property(e => e.MaSanPham).HasMaxLength(20).IsUnicode(false).HasColumnName("ma_san_pham");
                entity.Property(e => e.Example).HasColumnName("example");
                entity.Property(e => e.Gia).HasColumnName("gia");
                entity.Property(e => e.KichThuoc).HasMaxLength(10).IsFixedLength().HasColumnName("kich_thuoc");
                entity.Property(e => e.MaLoaiSanPham).HasColumnName("ma_loai_san_pham");
                entity.Property(e => e.MaThuongHieu).HasColumnName("ma_thuong_hieu");
                entity.Property(e => e.MaHashTag).HasColumnName("ma_hash_tag");
                entity.Property(e => e.MoTa).HasMaxLength(150).HasColumnName("mo_ta");
                entity.Property(e => e.NgayTao).HasColumnName("ngay_tao");
                entity.Property(e => e.SoLuong).HasColumnName("so_luong");
                entity.Property(e => e.TenSanPham).HasMaxLength(100).HasColumnName("ten_san_pham");
                entity.HasOne(d => d.MaThuongHieuNavigation).WithMany(p => p.SanPhams)
                    .HasForeignKey(d => d.MaThuongHieu)
                    .HasConstraintName("FK_SAN_PHAM_THUONG_HIEU");
            });

            modelBuilder.Entity<BinhLuan>(entity =>
            {
                entity.HasKey(e => e.MaBinhLuan).HasName("PK__BINH_LUA__300DD2D899CEB418");
                entity.ToTable("BINH_LUAN");
                entity.HasIndex(e => e.MaSanPham, "IX_BINH_LUAN_ma_san_pham");
                entity.Property(e => e.MaBinhLuan).HasColumnName("ma_binh_luan");
                entity.Property(e => e.DanhGia).HasColumnName("danh_gia");
                entity.Property(e => e.MaNguoiDung).HasMaxLength(10).IsUnicode(false).HasColumnName("ma_nguoi_dung");
                entity.Property(e => e.MaSanPham).HasMaxLength(20).IsUnicode(false).HasColumnName("ma_san_pham");
                entity.Property(e => e.NgayBinhLuan).HasColumnType("datetime2").HasColumnName("NgayBinhLuan");
                entity.Property(e => e.NoiDungBinhLuan).HasColumnType("nvarchar(max)").HasColumnName("noi_dung_binh_luan");
                entity.Property(e => e.SoTimBinhLuan).HasColumnName("so_tim_binh_luan");
                entity.Property(e => e.TrangThai).HasColumnName("TrangThai");
                entity.Property(e => e.MaBlog).HasColumnName("MaBlog");
                entity.Property(e => e.MaCombo).HasColumnName("MaCombo");

            });

            modelBuilder.Entity<ChiTietComBo>(entity =>
            {
                entity.HasKey(e => e.MaChiTietComBo).HasName("PK__CHI_TIET__1B885A91D07009B0");
                entity.ToTable("CHI_TIET_COM_BO");
                entity.HasIndex(e => e.MaComBo, "IX_CHI_TIET_COM_BO_ma_com_bo");
                entity.HasIndex(e => e.MaSanPham, "IX_CHI_TIET_COM_BO_ma_san_pham");
                entity.Property(e => e.MaChiTietComBo).HasColumnName("ma_chi_tiet_com_bo");
                entity.Property(e => e.MaComBo).HasColumnName("ma_com_bo");
                entity.Property(e => e.MaSanPham).HasMaxLength(20).IsUnicode(false).HasColumnName("ma_san_pham");
                entity.Property(e => e.SoLuong).HasColumnName("so_luong");
                entity.HasOne(d => d.MaComBoNavigation).WithMany(p => p.ChiTietComBos)
                    .HasForeignKey(d => d.MaComBo)
                    .HasConstraintName("FK_CHI_TIET_COM_BO_COM_BO_SAN_PHAM");

            });

            modelBuilder.Entity<ChiTietDonHang>(entity =>
            {
                entity.HasKey(e => e.MaCtdh).HasName("PK__CHI_TIET__5AE495ECA888E079");
                entity.ToTable("CHI_TIET_DON_HANG");
                entity.HasIndex(e => e.MaDonHang, "IX_CHI_TIET_DON_HANG_ma_don_hang");
                entity.Property(e => e.MaCtdh).HasColumnName("ma_ctdh");
                entity.Property(e => e.Gia).HasColumnName("gia");
                entity.Property(e => e.MaCombo).HasColumnName("ma_combo");
                entity.Property(e => e.MaDonHang).HasColumnName("ma_don_hang");
                entity.Property(e => e.MaSanPham).HasMaxLength(20).IsUnicode(false).HasColumnName("ma_san_pham");
                entity.Property(e => e.Percent).HasColumnName("Percent");
                entity.Property(e => e.SoLuong).HasColumnName("so_luong");
                entity.Property(e => e.ThanhTien).HasColumnName("thanh_tien");
                entity.HasOne(d => d.MaDonHangNavigation).WithMany(p => p.ChiTietDonHangs)
                    .HasForeignKey(d => d.MaDonHang)
                    .HasConstraintName("FK_CHI_TIET_DON_HANG_DON_HANG");
            });

            modelBuilder.Entity<ChiTietGioHang>(entity =>
            {
                entity.HasKey(e => e.MaCtgh).HasName("PK__CHI_TIET__5AE495EDA6F2A925");
                entity.ToTable("CHI_TIET_GIO_HANG");
                entity.HasIndex(e => e.MaCombo, "IX_CHI_TIET_GIO_HANG_ma_combo");
                entity.HasIndex(e => e.MaGioHang, "IX_CHI_TIET_GIO_HANG_ma_gio_hang");
                entity.HasIndex(e => e.MaSanPham, "IX_CHI_TIET_GIO_HANG_ma_san_pham");
                entity.Property(e => e.MaCtgh).HasColumnName("ma_ctgh");
                entity.Property(e => e.DeadTime).HasColumnName("DeadTime");
                entity.Property(e => e.Gia).HasColumnName("gia");
                entity.Property(e => e.MaCombo).HasColumnName("ma_combo");
                entity.Property(e => e.MaGioHang).HasColumnName("ma_gio_hang");
                entity.Property(e => e.MaKhuyenMai).HasColumnName("MaKhuyenMai");
                entity.Property(e => e.MaSanPham).HasMaxLength(20).IsUnicode(false).HasColumnName("ma_san_pham");
                entity.Property(e => e.Percent).HasColumnName("Percent");
                entity.Property(e => e.SoLuong).HasColumnName("so_luong");
                entity.Property(e => e.ThanhTien).HasColumnName("thanh_tien");
                entity.HasOne(d => d.MaComboNavigation).WithMany(p => p.ChiTietGioHangs)
                    .HasForeignKey(d => d.MaCombo)
                    .HasConstraintName("FK_CHI_TIET_GIO_HANG_COM_BO_SAN_PHAM");
                entity.HasOne(d => d.MaGioHangNavigation).WithMany(p => p.ChiTietGioHangs)
                    .HasForeignKey(d => d.MaGioHang)
                    .HasConstraintName("FK_CHI_TIET_GIO_HANG_GIO_HANG");
                entity.HasOne(d => d.MaSanPhamNavigation).WithMany(p => p.ChiTietGioHangs)
                    .HasForeignKey(d => d.MaSanPham)
                    .HasConstraintName("FK_CHI_TIET_GIO_HANG_SAN_PHAM");
            });

            modelBuilder.Entity<ComBoSanPham>(entity =>
            {
                entity.HasKey(e => e.MaComBo).HasName("PK__COM_BO_S__AF6434A35D0F47EB");
                entity.ToTable("COM_BO_SAN_PHAM");
                entity.Property(e => e.MaComBo).ValueGeneratedOnAdd().HasColumnName("ma_com_bo");
                entity.Property(e => e.Discount).HasColumnName("Discount");
                entity.Property(e => e.HinhAnh).HasColumnName("HinhAnh");
                entity.Property(e => e.MoTa).HasMaxLength(150).HasColumnName("mo_ta");
                entity.Property(e => e.NgayTao).HasColumnName("NgayTao");
                entity.Property(e => e.SoLuong).HasColumnName("so_luong");
                entity.Property(e => e.TenComBo).HasMaxLength(100).HasColumnName("ten_com_bo");
                entity.Property(e => e.TongGia).HasColumnName("tong_gia");
                entity.Property(e => e.TrangThai).HasColumnName("trang_thai");
            });

            modelBuilder.Entity<DanhSachDiaChi>(entity =>
            {
                entity.HasKey(e => e.MaDiaChi).HasName("PK__DANH_SAC__80439859B4824340");
                entity.ToTable("DANH_SACH_DIA_CHI");
                entity.HasIndex(e => e.MaNguoiDung, "IX_DANH_SACH_DIA_CHI_ma_nguoi_dung");
                entity.Property(e => e.MaDiaChi).HasColumnName("ma_dia_chi");
                entity.Property(e => e.DiaChi).HasMaxLength(100).HasColumnName("dia_chi");
                entity.Property(e => e.HoTen).HasMaxLength(100).HasColumnName("ho_ten");
                entity.Property(e => e.MaNguoiDung).HasMaxLength(10).IsUnicode(false).HasColumnName("ma_nguoi_dung");
                entity.Property(e => e.MoTa).HasMaxLength(255).HasColumnName("mo_ta");
                entity.Property(e => e.PhuongXa).HasMaxLength(50).HasColumnName("phuong_xa");
                entity.Property(e => e.QuanHuyen).HasMaxLength(50).HasColumnName("quan_huyen");
                entity.Property(e => e.Sdt).HasMaxLength(15).HasColumnName("sdt");
                entity.Property(e => e.Tinh).HasMaxLength(50).HasColumnName("tinh");
                entity.Property(e => e.TrangThai).HasColumnName("trang_thai");
                entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.DanhSachDiaChis)
                    .HasForeignKey(d => d.MaNguoiDung)
                    .HasConstraintName("FK_DANH_SACH_DIA_CHI_NGUOI_DUNG");
            });

            modelBuilder.Entity<DonHang>(entity =>
            {
                entity.HasKey(e => e.MaDonHang).HasName("PK__DON_HANG__0246C5EAB291F99F");
                entity.ToTable("DON_HANG");
                entity.HasIndex(e => e.MaNguoiDung, "IX_DON_HANG_ma_nguoi_dung");
                entity.HasIndex(e => e.MaNhanVien, "IX_DON_HANG_ma_nhan_vien");
                entity.Property(e => e.MaDonHang).HasColumnName("ma_don_hang");
                entity.Property(e => e.DiaChi).HasMaxLength(255).HasColumnName("dia_chi");
                entity.Property(e => e.DiscountAmount).HasColumnType("decimal(18, 2)").HasColumnName("DiscountAmount");
                entity.Property(e => e.FinalAmount).HasColumnType("decimal(18, 2)").HasColumnName("FinalAmount");
                entity.Property(e => e.LyDoHuy).HasMaxLength(255).HasColumnName("ly_do_huy");
                entity.Property(e => e.MaNguoiDung).HasMaxLength(10).IsUnicode(false).HasColumnName("ma_nguoi_dung");
                entity.Property(e => e.MaNhanVien).HasMaxLength(10).IsUnicode(false).HasColumnName("ma_nhan_vien");
                entity.Property(e => e.NgayDat).HasColumnType("datetime").HasColumnName("ngay_dat");
                entity.Property(e => e.Sdt).HasMaxLength(15).HasColumnName("sdt");
                entity.Property(e => e.ShippingFee).HasColumnType("decimal(18, 2)").HasColumnName("ShippingFee");
                entity.Property(e => e.TenNguoiNhan).HasMaxLength(100).HasColumnName("ten_nguoi_nhan");
                entity.Property(e => e.TrangThaiDonHang).HasColumnName("trang_thai_don_hang");
                entity.Property(e => e.TrangThaiHang).HasColumnName("trang_thai_hang");
                entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.DonHangMaNguoiDungNavigations)
                    .HasForeignKey(d => d.MaNguoiDung)
                    .HasConstraintName("FK_DON_HANG_NGUOI_DUNG");
                entity.HasOne(d => d.MaNhanVienNavigation).WithMany(p => p.DonHangMaNhanVienNavigations)
                    .HasForeignKey(d => d.MaNhanVien)
                    .HasConstraintName("FK_DON_HANG_NHAN_VIEN");
            });

            modelBuilder.Entity<GioHang>(entity =>
            {
                entity.HasKey(e => e.MaGioHang).HasName("PK__GIO_HANG__6C00DDA3D3ED86DE");
                entity.ToTable("GIO_HANG");
                entity.HasIndex(e => e.MaNguoiDung, "IX_GIO_HANG_ma_nguoi_dung");
                entity.Property(e => e.MaGioHang).HasColumnName("ma_gio_hang");
                entity.Property(e => e.MaNguoiDung).HasMaxLength(10).IsUnicode(false).HasColumnName("ma_nguoi_dung");
                entity.HasOne(d => d.MaNguoiDungNavigation).WithMany(p => p.GioHangs)
                    .HasForeignKey(d => d.MaNguoiDung)
                    .HasConstraintName("FK_GIO_HANG_NGUOI_DUNG");
            });

            modelBuilder.Entity<HinhAnh>(entity =>
            {
                entity.HasKey(e => e.MaHinhAnh).HasName("PK__HINH_ANH__5AE49D8E2E189F36");
                entity.ToTable("HINH_ANH");
                entity.HasIndex(e => e.MaBinhLuan, "IX_HINH_ANH_ma_binh_luan");
                entity.HasIndex(e => e.MaSanPham, "IX_HINH_ANH_ma_san_pham");
                entity.Property(e => e.MaHinhAnh).HasColumnName("ma_hinh_anh");
                entity.Property(e => e.Data).HasColumnName("data");
                entity.Property(e => e.Link).HasColumnName("Link");
                entity.Property(e => e.MaBinhLuan).HasColumnName("ma_binh_luan");
                entity.Property(e => e.MaSanPham).HasMaxLength(20).IsUnicode(false).HasColumnName("ma_san_pham");
                entity.Property(e => e.TenHinhAnh).HasMaxLength(100).HasColumnName("ten_hinh_anh");

            });

            modelBuilder.Entity<ThuongHieu>(entity =>
            {
                entity.HasKey(e => e.MaThuongHieu).HasName("PK__THUONG_H__C4FB3F32AE837BB2");
                entity.ToTable("THUONG_HIEU");
                entity.Property(e => e.MaThuongHieu).HasColumnName("ma_thuong_hieu");
                entity.Property(e => e.HinhAnh).HasColumnName("hinh_anh");
                entity.Property(e => e.TenThuongHieu).HasMaxLength(100).HasColumnName("ten_thuong_hieu");
                entity.Property(e => e.TrangThai).HasColumnName("TrangThai");
            });

            modelBuilder.Entity<KichThuoc>(entity =>
            {
                entity.HasKey(e => e.MaKichThuoc).HasName("PK_KICH_THUOC");
                entity.ToTable("KICH_THUOC");
                entity.Property(e => e.MaKichThuoc).ValueGeneratedOnAdd().HasColumnName("ma_kich_thuoc");
                entity.Property(e => e.MaLoai).HasColumnName("ma_loai");
                entity.Property(e => e.TenKichThuoc).HasMaxLength(50).HasColumnName("ten_kich_thuoc");
            });

            modelBuilder.Entity<Video>(entity =>
            {
                entity.HasKey(e => e.MaVideo).HasName("PK__VIDEO__946AD5B8DC15860F");
                entity.ToTable("VIDEO");
                entity.HasIndex(e => e.MaSanPham, "IX_VIDEO_ma_san_pham");
                entity.Property(e => e.MaVideo).HasColumnName("ma_video");
                entity.Property(e => e.MaSanPham).HasMaxLength(20).IsUnicode(false).HasColumnName("ma_san_pham");
                entity.Property(e => e.TenVideo).HasMaxLength(100).HasColumnName("ten_video");
                entity.HasOne(d => d.MaSanPhamNavigation).WithMany(p => p.Videos)
                    .HasForeignKey(d => d.MaSanPham)
                    .HasConstraintName("FK_VIDEO_SAN_PHAM");
            });

            modelBuilder.Entity<Voucher>(entity =>
            {
                entity.HasKey(e => e.MaVoucher).HasName("PK__VOUCHER__466D17BE6217DC60");
                entity.ToTable("VOUCHER");
                entity.Property(e => e.MaVoucher).ValueGeneratedOnAdd().HasColumnName("ma_voucher");
                entity.Property(e => e.DieuKien).HasColumnType("decimal(18, 2)").HasColumnName("dieu_kien");
                entity.Property(e => e.GiaTri).HasColumnName("giam_gia");
                entity.Property(e => e.GiaTriToiDa).HasColumnType("decimal(18, 2)").HasColumnName("GiaTriToiDa");
                entity.Property(e => e.HinhAnh).HasColumnName("HinhAnh");
                entity.Property(e => e.LoaiVoucher).HasColumnName("LoaiVoucher");
                entity.Property(e => e.MoTa).HasMaxLength(255).HasColumnName("mo_ta");
                entity.Property(e => e.NgayBatDau).HasColumnType("datetime").HasColumnName("ngay_bat_dau");
                entity.Property(e => e.NgayKetThuc).HasColumnType("datetime").HasColumnName("ngay_ket_thuc");
                entity.Property(e => e.TenVoucher).HasMaxLength(100).HasColumnName("ten_voucher");
                entity.Property(e => e.TrangThai).HasColumnName("trang_thai");
            });

            modelBuilder.Entity<YeuThich>(entity =>
            {
                entity.HasKey(e => e.MaYeuThich).HasName("PK__YEU_THIC__6427C4C6C61640D4");
                entity.ToTable("YEU_THICH");
                entity.HasIndex(e => e.MaSanPham, "IX_YEU_THICH_ma_san_pham");
                entity.Property(e => e.MaYeuThich).HasColumnName("ma_yeu_thich");
                entity.Property(e => e.HoTen).HasMaxLength(100).HasColumnName("HoTen");
                entity.Property(e => e.MaComBo).HasColumnName("MaComBo");
                entity.Property(e => e.MaNguoiDung).HasMaxLength(10).IsUnicode(false).HasColumnName("ma_nguoi_dung");
                entity.Property(e => e.MaSanPham).HasMaxLength(20).IsUnicode(false).HasColumnName("ma_san_pham");
                entity.Property(e => e.NgayYeuThich).HasColumnType("datetime").HasColumnName("ngay_yeu_thich");
                entity.Property(e => e.TenSanPham).HasMaxLength(100).HasColumnName("TenSanPham");

            });

            modelBuilder.Entity<TinNhan>(entity =>
            {
                entity.HasKey(e => e.MaTinNhan).HasName("PK__TIN_NHAN__3214EC07");
                entity.ToTable("TIN_NHAN");
                entity.Property(e => e.MaTinNhan).HasColumnName("ma_tin_nhan");
                entity.Property(e => e.NguoiGuiId).HasMaxLength(10).IsUnicode(false).IsRequired().HasColumnName("nguoi_gui_id");
                entity.Property(e => e.NguoiNhanId).HasMaxLength(10).IsUnicode(false).IsRequired().HasColumnName("nguoi_nhan_id");
                entity.Property(e => e.NoiDung).HasMaxLength(1000).HasColumnName("noi_dung");
                entity.Property(e => e.KieuTinNhan).HasMaxLength(20).HasDefaultValue("text");
                entity.Property(e => e.TepDinhKemUrl).HasMaxLength(500);
                entity.Property(e => e.NgayTao).HasDefaultValueSql("GETDATE()").HasColumnName("ngay_tao");
                entity.Property(e => e.TrangThai).HasMaxLength(20).HasDefaultValue("Sent").HasColumnName("trang_thai");
                entity.HasOne(d => d.NguoiGui).WithMany(p => p.TinNhanGui)
                    .HasForeignKey(d => d.NguoiGuiId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_TIN_NHAN_NGUOI_GUI");
                entity.HasOne(d => d.NguoiNhan).WithMany(p => p.TinNhanNhan)
                    .HasForeignKey(d => d.NguoiNhanId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_TIN_NHAN_NGUOI_NHAN");
            });

            modelBuilder.Entity<KhuyenMai>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID).ValueGeneratedOnAdd();
            });

            modelBuilder.Entity<ChiTietKhuyenMai>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID).ValueGeneratedOnAdd();
            });

            modelBuilder.Entity<Coupon>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID).ValueGeneratedOnAdd();
                entity.HasOne<Voucher>()
                    .WithMany()
                    .HasForeignKey(c => c.MaVoucher);
            });

            modelBuilder.Entity<LienHe>(entity =>
            {
                entity.HasKey(e => e.MaLienHe);
                entity.ToTable("LienHes");
                entity.Property(e => e.MaLienHe).ValueGeneratedOnAdd();
                entity.Property(e => e.HoTen).HasMaxLength(100);
                entity.Property(e => e.Sdt).HasMaxLength(20);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.NoiDung).HasColumnType("nvarchar(max)");
                entity.Property(e => e.NgayTao).HasColumnType("datetime2");
            });

            modelBuilder.Entity<GiaoDien>(entity =>
            {
                entity.HasKey(e => e.MaGiaoDien);
                entity.ToTable("GiaoDiens");
                entity.Property(e => e.MaGiaoDien).ValueGeneratedOnAdd();
                entity.Property(e => e.TenGiaoDien).HasMaxLength(100);
            });

            modelBuilder.Entity<HashTag>(entity =>
            {
                entity.HasKey(e => e.MaHashTag);
                entity.ToTable("HashTags");
                entity.Property(e => e.MaHashTag).ValueGeneratedOnAdd();
                entity.Property(e => e.TenHashTag).HasMaxLength(100);
            });

            OnModelCreatingPartial(modelBuilder);


            modelBuilder.Entity<ThuongHieu>().HasData(
new ThuongHieu
              {
                  MaThuongHieu = 1,
                  TenThuongHieu = "Gucci",
                  HinhAnh = Encoding.UTF8.GetBytes("/uploads/brands/brand1.png"),
              },
              new ThuongHieu
              {
                  MaThuongHieu = 2,
                  TenThuongHieu = "LalaHanyu",
                  HinhAnh = Encoding.UTF8.GetBytes("/uploads/brands/brand2.png"),
              },
              new ThuongHieu
              {
                  MaThuongHieu = 3,
                  TenThuongHieu = "Fressher",
                  HinhAnh = Encoding.UTF8.GetBytes("/uploads/brands/brand3.png"),
              },
              new ThuongHieu
              {
                  MaThuongHieu = 4,
                  TenThuongHieu = "Loisse",
                  HinhAnh = Encoding.UTF8.GetBytes("/uploads/brands/brand4.png"),
              }
            );

            modelBuilder.Entity<SanPham>().HasData(
new SanPham
                {
                    MaSanPham = "Q00001_000000_XL",
                    TenSanPham = "Quần Thun Nam",
                    MaThuongHieu = 1,
                    MaLoaiSanPham = 2,
                    KichThuoc = "XL",
                    SoLuong = 100,
                    Gia = 150000,
                    NgayTao = DateOnly.FromDateTime(DateTime.Now),
                    TrangThai = 1,
                    Example = true,
                    ChatLieu = "Cotton",
                    SoLuongDaBan = 0,
                    GioiTinh = 0,
                    GiaNhap = 75000,
                },
                new SanPham
                {
                    MaSanPham = "Q00001_0C06F5_XXL",
                    TenSanPham = "Quần thun nam",
                    MaThuongHieu = 1,
                    MaLoaiSanPham = 2,
                    KichThuoc = "XXL",
                    SoLuong = 100,
                    Gia = 150000,
                    NgayTao = DateOnly.FromDateTime(DateTime.Now),
                    TrangThai = 1,
                    Example = true,
                    ChatLieu = "Cotton",
                    SoLuongDaBan = 0,
                    GioiTinh = 0,
                    GiaNhap = 75000,
                },
               new SanPham
               {
                   MaSanPham = "A00001_ff0000_XL",
                   TenSanPham = "Áo thun nam",
                   MaThuongHieu = 1,
                   MaLoaiSanPham = 1,
                   KichThuoc = "XL",
                   SoLuong = 100,
                   Gia = 150000,
                   NgayTao = DateOnly.FromDateTime(DateTime.Now),
                   TrangThai = 1,
                   Example = true,
                   ChatLieu = "Cotton",
                   SoLuongDaBan = 0,
                   GioiTinh = 0,
                   GiaNhap = 75000,
               },
                new SanPham
                {
                    MaSanPham = "A00001_ff0000_XXL",
                    TenSanPham = "Áo thun nam",
                    MaThuongHieu = 1,
                    MaLoaiSanPham = 1,
                    KichThuoc = "XXL",
                    SoLuong = 100,
                    Gia = 150000,
                    NgayTao = DateOnly.FromDateTime(DateTime.Now),
                    TrangThai = 1,
                    Example = true,
                    ChatLieu = "Cotton",
                    SoLuongDaBan = 0,
                    GioiTinh = 0,
                    GiaNhap = 75000,
                },
                 new SanPham
                 {
                     MaSanPham = "A00001_ff0000_S",
                     TenSanPham = "Áo thun nam",
                     MaThuongHieu = 1,
                     MaLoaiSanPham = 1,
                     KichThuoc = "S",
                     SoLuong = 100,
                     Gia = 150000,
                     NgayTao = DateOnly.FromDateTime(DateTime.Now),
                     TrangThai = 1,
                     Example = true,
                     ChatLieu = "Cotton",
                     SoLuongDaBan = 0,
                     GioiTinh = 0,
                     GiaNhap = 75000
                 },
                  new SanPham
                  {
                      MaSanPham = "A00001_ff00ff_XL",
                      TenSanPham = "Áo thun nam",
                      MaThuongHieu = 1,
                      MaLoaiSanPham = 1,
                      KichThuoc = "XL",
                      SoLuong = 100,
                      Gia = 150000,
                      NgayTao = DateOnly.FromDateTime(DateTime.Now),
                      TrangThai = 1,
                      Example = true,
                      ChatLieu = "Cotton",
                      SoLuongDaBan = 0,
                      GioiTinh = 0,
                      GiaNhap = 75000
                  },
                   new SanPham
                   {
                       MaSanPham = "A00001_ff00ff_M",
                       TenSanPham = "Áo thun nam",
                       MaThuongHieu = 1,
                       MaLoaiSanPham = 1,
                       KichThuoc = "M",
                       SoLuong = 100,
                       Gia = 150000,
                       NgayTao = DateOnly.FromDateTime(DateTime.Now),
                       TrangThai = 1,
                       Example = true,
                       ChatLieu = "Cotton",
                       SoLuongDaBan = 0,
                       GioiTinh = 0,
                       GiaNhap = 75000,
                   },
                    new SanPham
                    {
                        MaSanPham = "A00002_ff0000_XL",
                        TenSanPham = "Áo khoác nữ",
                        MaThuongHieu = 1,
                        MaLoaiSanPham = 1,
                        KichThuoc = "XL",
                        SoLuong = 100,
                        Gia = 150000,
                        NgayTao = DateOnly.FromDateTime(DateTime.Now),
                        TrangThai = 1,
                        Example = true,
                        ChatLieu = "Cotton",
                        SoLuongDaBan = 0,
                        GioiTinh = 1,
                        GiaNhap = 75000
                    },
                     new SanPham
                     {
                         MaSanPham = "A00002_ff0000_XXL",
                         TenSanPham = "Áo khoác nữ",
                         MaThuongHieu = 1,
                         MaLoaiSanPham = 1,
                         KichThuoc = "XXL",
                         SoLuong = 100,
                         Gia = 150000,
                         NgayTao = DateOnly.FromDateTime(DateTime.Now),
                         TrangThai = 1,
                         Example = true,
                         ChatLieu = "Cotton",
                         SoLuongDaBan = 0,
                         GioiTinh = 1,
                         GiaNhap = 75000,
                     },
                      new SanPham
                      {
                          MaSanPham = "A00002_ff00ff_XL",
                          TenSanPham = "Áo khoác nữ",
                          MaThuongHieu = 1,
                          MaLoaiSanPham = 1,
                          KichThuoc = "XL",
                          SoLuong = 100,
                          Gia = 150000,
                          NgayTao = DateOnly.FromDateTime(DateTime.Now),
                          TrangThai = 1,
                          Example = true,
                          ChatLieu = "Cotton",
                          SoLuongDaBan = 0,
                          GioiTinh = 1,
                          GiaNhap = 75000,
                      },
                      new SanPham
                      {
                          MaSanPham = "A00002_ff00ff_M",
                          TenSanPham = "Áo khoác nữ",
                          MaThuongHieu = 1,
                          MaLoaiSanPham = 1,
                          KichThuoc = "M",
                          SoLuong = 100,
                          Gia = 150000,
                          NgayTao = DateOnly.FromDateTime(DateTime.Now),
                          TrangThai = 1,
                          Example = true,
                          ChatLieu = "Cotton",
                          SoLuongDaBan = 0,
                          GioiTinh = 1,
                          GiaNhap = 75000,
                      }
            );

            modelBuilder.Entity<HinhAnh>().HasData(
new HinhAnh
                 {
                     MaHinhAnh = 1,
                     MaSanPham = "A00001",
                     Link = "/uploads/products/A00001.jpg",
                     Data = Encoding.UTF8.GetBytes("/uploads/products/A00001.jpg")
                 },
                 new HinhAnh
                 {
                     MaHinhAnh = 2,
                     MaSanPham = "A00002",
                     Link = "/uploads/products/A00002.jpg",
                     Data = Encoding.UTF8.GetBytes("/uploads/products/A00002.jpg")
                 },
                 new HinhAnh
                 {
                     MaHinhAnh = 3,
                     MaSanPham = "Q00001",
                     Link = "/uploads/products/Q00001.jpg",
                     Data = Encoding.UTF8.GetBytes("/uploads/products/Q00001.jpg")
                 }
            );

            modelBuilder.Entity<GioHang>().HasData(
                new GioHang
                {
                    MaGioHang = 1,
                    MaNguoiDung = "KH001"
                },
                new GioHang
                {
                    MaGioHang = 2,
                    MaNguoiDung = "KH0001"
                }
            );

            modelBuilder.Entity<ChiTietGioHang>().HasData(
                new ChiTietGioHang
                {
                    MaCtgh = 1,
                    MaGioHang = 1,
                    MaSanPham = "A00001_ff00ff_XL",
                    MaCombo = null,
                    SoLuong = 2,
                    Gia = 150000,
                    ThanhTien = 300000
                },
                new ChiTietGioHang
                {
                    MaCtgh = 2,
                    MaGioHang = 1,
                    MaSanPham = "A00002_ff00ff_XL",
                    MaCombo = null,
                    SoLuong = 3,
                    Gia = 150000,
                    ThanhTien = 450000
                },
                new ChiTietGioHang
                {
                    MaCtgh = 3,
                    MaGioHang = 1,
                    MaCombo = 1,
                    SoLuong = 1,
                    Gia = 399000,
                    ThanhTien = 399000,
                    DeadTime = false
                }
            );

            modelBuilder.Entity<NguoiDung>().HasData(
new NguoiDung
                {
                    MaNguoiDung = "KH001",
                    TaiKhoan = "User",
                    HoTen = "Embo",
                    NgaySinh = DateTime.Now,
                    Sdt = "0973713274",
                    Cccd = "066099000137",
                    Email = "nguyenquangquyX@gmail.com",
                    DiaChi = "Here",
                    TrangThai = 0,
                    HinhAnh = null,
                    MatKhau = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    NgayTao = DateTime.Now,
                    VaiTro = 1,

                },
                new NguoiDung
                {
                    MaNguoiDung = "ND00001",
                    TaiKhoan = "user1",
                    HoTen = "Nguyen Van An",
                    NgaySinh = new DateTime(1990, 1, 1),
                    Sdt = "0123456789",
                    Cccd = "111111111111",
                    Email = "user1@example.com",
                    DiaChi = "123 Main Street",
                    TrangThai = 0, // 0: Hoạt động
                    HinhAnh = null,
                    MatKhau = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    NgayTao = DateTime.Now,
                    VaiTro = 0,
                    CancelConunt = 2,
                    LockoutEndDate = null
                },
                new NguoiDung
                {
                    MaNguoiDung = "ND00002",
                    TaiKhoan = "user2",
                    HoTen = "Tran Thi Bình",
                    NgaySinh = new DateTime(1992, 2, 2),
                    Sdt = "0987654321",
                    Cccd = "222222222222",
                    Email = "user2@example.com",
                    DiaChi = "456 Market Street",
                    TrangThai = 0,
                    HinhAnh = null,
                    MatKhau = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    NgayTao = DateTime.Now,
                    VaiTro = 0,
                    CancelConunt = 2,
                    LockoutEndDate = null,

                },
                new NguoiDung
                {
                    MaNguoiDung = "ND00003",
                    TaiKhoan = "user3",
                    HoTen = "Le Van Chính",
                    NgaySinh = new DateTime(1991, 3, 3),
                    Sdt = "0912345678",
                    Cccd = "333333333333",
                    Email = "user3@example.com",
                    DiaChi = "789 Broadway",
                    TrangThai = 0,
                    HinhAnh = null,
                    MatKhau = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    NgayTao = DateTime.Now,
                    VaiTro = 0,
                    CancelConunt = 4,
                    LockoutEndDate = DateTime.Now.AddDays(2)
                },
                new NguoiDung
                {
                    MaNguoiDung = "ND00004",
                    TaiKhoan = "user4",
                    HoTen = "Pham Thi Dung",
                    NgaySinh = new DateTime(1989, 4, 4),
                    Sdt = "0901234567",
                    Cccd = "444444444444",
                    Email = "user4@example.com",
                    DiaChi = "101 Center Ave",
                    TrangThai = 0,
                    HinhAnh = null,
                    MatKhau = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    NgayTao = DateTime.Now,
                    VaiTro = 0
                },
                new NguoiDung
                {
                    MaNguoiDung = "ND00005",
                    TaiKhoan = "user5",
                    HoTen = "Do Van Em",
                    NgaySinh = new DateTime(1993, 5, 5),
                    Sdt = "0934567890",
                    Cccd = "555555555555",
                    Email = "user5@example.com",
                    DiaChi = "202 Park Lane",
                    TrangThai = 0,
                    HinhAnh = null,
                    MatKhau = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    NgayTao = DateTime.Now,
                    VaiTro = 0
                },
                new NguoiDung
                {
                    MaNguoiDung = "NV00006",
                    TaiKhoan = "staff1",
                    HoTen = "Nguyen Thi Fan",
                    NgaySinh = new DateTime(1994, 6, 6),
                    Sdt = "0945678901",
                    Cccd = "666666666666",
                    Email = "staff1@example.com",
                    DiaChi = "303 Sunset Blvd",
                    TrangThai = 0,
                    HinhAnh = null,
                    MatKhau = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    NgayTao = DateTime.Now,
                    VaiTro = 2 // Nhân viên
                },
                new NguoiDung
                {
                    MaNguoiDung = "NV00007",
                    TaiKhoan = "staff2",
                    HoTen = "Tran Van Gin",
                    NgaySinh = new DateTime(1990, 7, 7),
                    Sdt = "0956789012",
                    Cccd = "777777777777",
                    Email = "staff2@example.com",
                    DiaChi = "404 Broadway",
                    TrangThai = 0,
                    HinhAnh = null,
                    MatKhau = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    NgayTao = DateTime.Now,
                    VaiTro = 2
                },
                new NguoiDung
                {
                    MaNguoiDung = "NV00008",
                    TaiKhoan = "staff3",
                    HoTen = "Le Thi Hai",
                    NgaySinh = new DateTime(1991, 8, 8),
                    Sdt = "0967890123",
                    Cccd = "888888888888",
                    Email = "staff3@example.com",
                    DiaChi = "505 Industrial Way",
                    TrangThai = 0,
                    HinhAnh = null,
                    MatKhau = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    NgayTao = DateTime.Now,
                    VaiTro = 2
                },
                new NguoiDung
                {
                    MaNguoiDung = "NV00009",
                    TaiKhoan = "user9",
                    HoTen = "Pham Van Im",
                    NgaySinh = new DateTime(1992, 9, 9),
                    Sdt = "0978901234",
                    Cccd = "999999999999",
                    Email = "user9@example.com",
                    DiaChi = "606 Hill Road",
                    TrangThai = 0,
                    HinhAnh = null,
                    MatKhau = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    NgayTao = DateTime.Now,
                    VaiTro = 2
                },
                new NguoiDung
                {
                    MaNguoiDung = "AD00010",
                    TaiKhoan = "user10",
                    HoTen = "Tran Thi Jin",
                    NgaySinh = new DateTime(1993, 10, 10),
                    Sdt = "0989012345",
                    Cccd = "101010101010",
                    Email = "user10@example.com",
                    DiaChi = "707 Park Ave",
                    TrangThai = 0,
                    HinhAnh = null,
                    MatKhau = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    NgayTao = DateTime.Now,
                    VaiTro = 1
                },
                new NguoiDung
                {
                    MaNguoiDung = "KH0001",
                    TaiKhoan = "customer1",
                    HoTen = "Nguyen Van Khach",
                    NgaySinh = new DateTime(1992, 9, 9),
                    Sdt = "0971234567",
                    Cccd = "999999999999",
                    Email = "customer1@example.com",
                    DiaChi = "606 Customer Road",
                    TrangThai = 0,
                    HinhAnh = null,
                    MatKhau = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    NgayTao = DateTime.Now,
                    VaiTro = 0
                },
                new NguoiDung
                {
                    MaNguoiDung = "AD00012",
                    TaiKhoan = "user12",
                    HoTen = "Tran Van Lung",
                    NgaySinh = new DateTime(1995, 12, 12),
                    Sdt = "0901234567",
                    Cccd = "121212121212",
                    Email = "user12@example.com",
                    DiaChi = "909 Downtown St",
                    TrangThai = 0,
                    HinhAnh = null,
                    MatKhau = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
                    NgayTao = DateTime.Now,
                    VaiTro = 1
                }
            );

            modelBuilder.Entity<ComBoSanPham>().HasData(
new ComBoSanPham
                            {
                                MaComBo = 1,
                                TenComBo = "Combo Trang phục mùa Hè",
                                MoTa = "Trang phục mùa hè",
                                HinhAnh = Encoding.UTF8.GetBytes("/uploads/combos/combo1.jpg"),
                                SoLuong = 10,
                                TongGia = 200000,
                                TrangThai = true,
                                NgayTao = DateOnly.FromDateTime(DateTime.Now),
                                Discount = 20,
                            },
                            new ComBoSanPham
                            {
                                MaComBo = 2,
                                TenComBo = "Combo Hè Năng Động",
                                MoTa = "Áo thun nam nhiều màu - giảm giá đặc biệt mùa hè",
                                HinhAnh = Encoding.UTF8.GetBytes("/uploads/combos/combo2.jpg"),
                                TongGia = 250000,
                                SoLuong = 50,
                                TrangThai = true,
                                NgayTao = DateOnly.FromDateTime(DateTime.Now),
                                Discount = 20,
                            },
                            new ComBoSanPham
                            {
                                MaComBo = 3,
                                TenComBo = "Combo Áo Thun Đôi",
                                MoTa = "Combo áo thun cho cặp đôi",
                                HinhAnh = Encoding.UTF8.GetBytes("/uploads/combos/combo3.jpg"),
                                SoLuong = 20,
                                TongGia = 500000,
                                TrangThai = true,
                                NgayTao = DateOnly.FromDateTime(DateTime.Now),
                                Discount = 20,
                            },
                            new ComBoSanPham
                            {
                                MaComBo = 4,
                                TenComBo = "Combo Mùa Hè Phối Đồ",
                                MoTa = "Áo thun và quần short phối đồ mùa hè",
                                SoLuong = 15,
                                HinhAnh = Encoding.UTF8.GetBytes("/uploads/combos/combo4.jpg"),
                                TongGia = 220000,
                                TrangThai = true,
                                NgayTao = DateOnly.FromDateTime(DateTime.Now),
                                Discount = 20,
                            },
                            new ComBoSanPham
                            {
                                MaComBo = 5,
                                TenComBo = "Combo Đi Chơi",
                                MoTa = "Áo thun và mũ lưỡi trai",
                                SoLuong = 25,
                                HinhAnh = Encoding.UTF8.GetBytes("/uploads/combos/combo5.jpg"),
                                TongGia = 180000,
                                TrangThai = true,
                                NgayTao = DateOnly.FromDateTime(DateTime.Now),
                                Discount = 20,
                            }
            );

            modelBuilder.Entity<ChiTietComBo>().HasData(
new ChiTietComBo
                     {
                         MaChiTietComBo = 1,
                         MaComBo = 1,
                         MaSanPham = "Q00001",
                         SoLuong = 1,
                     },
                    new ChiTietComBo
                    {
                        MaChiTietComBo = 2,
                        MaComBo = 1,
                        MaSanPham = "A00001",
                        SoLuong = 1,
                    },
                    new ChiTietComBo
                    {
                        MaChiTietComBo = 3,
                        MaComBo = 2,
                        MaSanPham = "A00002",
                        SoLuong = 1
                    },
                    new ChiTietComBo
                    {
                        MaChiTietComBo = 4,
                        MaComBo = 2,
                        MaSanPham = "A00001",
                        SoLuong = 1
                    },
                    new ChiTietComBo
                    {
                        MaChiTietComBo = 5,
                        MaComBo = 3,
                        MaSanPham = "A00001",
                        SoLuong = 2
                    },
                    new ChiTietComBo
                    {
                        MaChiTietComBo = 6,
                        MaComBo = 3,
                        MaSanPham = "A00002",
                        SoLuong = 2
                    },
                    new ChiTietComBo
                    {
                        MaChiTietComBo = 7,
                        MaComBo = 4,
                        MaSanPham = "A00001",
                        SoLuong = 2
                    },
                    new ChiTietComBo
                    {
                        MaChiTietComBo = 8,
                        MaComBo = 4,
                        MaSanPham = "A00002",
                        SoLuong = 2
                    },
                    new ChiTietComBo
                    {
                        MaChiTietComBo = 9,
                        MaComBo = 5,
                        MaSanPham = "A00001",
                        SoLuong = 1
                    },
                    new ChiTietComBo
                    {
                        MaChiTietComBo = 10,
                        MaComBo = 5,
                        MaSanPham = "A00002",
                        SoLuong = 2
                    }
            );

            modelBuilder.Entity<BinhLuan>().HasData(
new BinhLuan
            {
                MaBinhLuan = 3,
                MaNguoiDung = "KH0001",
                MaSanPham = null,
                NoiDungBinhLuan = "Sản phẩm rất đẹp, chất lượng tốt!",
                SoTimBinhLuan = 5,
                DanhGia = 5,
                TrangThai = 0,
                NgayBinhLuan = DateTime.Now.AddDays(-10)
            },
            new BinhLuan
            {
                MaBinhLuan = 4,
                MaNguoiDung = "ND00001",
                MaSanPham = "Q00001",
                NoiDungBinhLuan = "Giao hàng nhanh, nhưng màu sắc hơi khác hình.",
                SoTimBinhLuan = 2,
                DanhGia = 4,
                TrangThai = 1,
                NgayBinhLuan = DateTime.Now.AddDays(-9)
            },
            new BinhLuan
            {
                MaBinhLuan = 5,
                MaNguoiDung = "ND00002",
                MaSanPham = "Q00001",
                NoiDungBinhLuan = "Giá cả hợp lý, sẽ mua lại lần sau.",
                SoTimBinhLuan = 3,
                DanhGia = 4,
                TrangThai = 0,
                NgayBinhLuan = DateTime.Now.AddDays(-8)
            },
            new BinhLuan
            {
                MaBinhLuan = 6,
                MaNguoiDung = "ND00003",
                MaSanPham = "Q00001",
                NoiDungBinhLuan = "Chất liệu hơi mỏng, cần cải thiện.",
                SoTimBinhLuan = 1,
                DanhGia = 3,
                TrangThai = 1,
                NgayBinhLuan = DateTime.Now.AddDays(-7)
            },
            new BinhLuan
            {
                MaBinhLuan = 7,
                MaNguoiDung = "ND00004",
                MaSanPham = "A00001",
                NoiDungBinhLuan = "Rất hài lòng, đúng như mô tả!",
                SoTimBinhLuan = 8,
                DanhGia = 5,
                TrangThai = 0,
                NgayBinhLuan = DateTime.Now.AddDays(-6)
            },
            new BinhLuan
            {
                MaBinhLuan = 8,
                MaNguoiDung = "ND00005",
                MaSanPham = "A00001",
                NoiDungBinhLuan = "Sản phẩm ổn, nhưng đóng gói chưa cẩn thận.",
                SoTimBinhLuan = 0,
                DanhGia = 3,
                TrangThai = 1,
                NgayBinhLuan = DateTime.Now.AddDays(-5)
            },
            new BinhLuan
            {
                MaBinhLuan = 9,
                MaNguoiDung = "NV00006",
                MaSanPham = "A00002",
                NoiDungBinhLuan = "Tuyệt vời, xứng đáng 5 sao!",
                SoTimBinhLuan = 10,
                DanhGia = 5,
                TrangThai = 0,
                NgayBinhLuan = DateTime.Now.AddDays(-4)
            },
            new BinhLuan
            {
                MaBinhLuan = 10,
                MaNguoiDung = "NV00007",
                MaSanPham = "A00002",
                NoiDungBinhLuan = "Hàng đẹp nhưng giao trễ 1 ngày.",
                SoTimBinhLuan = 4,
                DanhGia = 4,
                TrangThai = 1,
                NgayBinhLuan = DateTime.Now.AddDays(-3)
            },
            new BinhLuan
            {
                MaBinhLuan = 11,
                MaNguoiDung = "NV00008",
                MaSanPham = "A00002",
                NoiDungBinhLuan = "Chất lượng trung bình, giá hơi cao.",
                SoTimBinhLuan = 2,
                DanhGia = 3,
                TrangThai = 0,
                NgayBinhLuan = DateTime.Now.AddDays(-2)
            },
            new BinhLuan
            {
                MaBinhLuan = 12,
                MaNguoiDung = "NV00008",
                MaSanPham = "A00002",
                NoiDungBinhLuan = "Sản phẩm tốt, dịch vụ khách hàng tuyệt vời!",
                SoTimBinhLuan = 6,
                DanhGia = 5,
                TrangThai = 1,
                NgayBinhLuan = DateTime.Now.AddDays(-1)
            }
            );

            modelBuilder.Entity<DanhSachDiaChi>().HasData(
new DanhSachDiaChi
                {
                    MaDiaChi = 1,
                    MaNguoiDung = "ND00001",
                    HoTen = "Nguyễn Văn Anh",
                    Sdt = "0901111222",
                    MoTa = "Gần chợ",
                    DiaChi = "123 Đường Chính",
                    PhuongXa = "Phường 1",
                    QuanHuyen = "Quận 1",
                    Tinh = "TP. Hồ Chí Minh",
                    TrangThai = 1
                },
                new DanhSachDiaChi
                {
                    MaDiaChi = 2,
                    MaNguoiDung = "ND00001",
                    HoTen = "Lê Thị Bim",
                    Sdt = "0902222333",
                    MoTa = "Gần công viên",
                    DiaChi = "456 Phố Hẻo",
                    PhuongXa = "Phường 2",
                    QuanHuyen = "Quận 2",
                    Tinh = "TP. Hồ Chí Minh",
                    TrangThai = 1
                },
                new DanhSachDiaChi
                {
                    MaDiaChi = 3,
                    MaNguoiDung = "ND00001",
                    HoTen = "Trần Văn Cinn",
                    Sdt = "0903333444",
                    MoTa = "Cách trung tâm 10km",
                    DiaChi = "789 Phố Cổ",
                    PhuongXa = "Phường 3",
                    QuanHuyen = "Quận 3",
                    Tinh = "TP. Hồ Chí Minh",
                    TrangThai = 0
                },
                new DanhSachDiaChi
                {
                    MaDiaChi = 4,
                    MaNguoiDung = "ND00001",
                    HoTen = "Phạm Thị Dung",
                    Sdt = "0904444555",
                    MoTa = "Gần trường học",
                    DiaChi = "101 Đường Lê Lợi",
                    PhuongXa = "Phường 4",
                    QuanHuyen = "Quận 4",
                    Tinh = "TP. Hồ Chí Minh",
                    TrangThai = 1
                },
                new DanhSachDiaChi
                {
                    MaDiaChi = 5,
                    MaNguoiDung = "ND00002",
                    HoTen = "Đỗ Văn Em",
                    Sdt = "0905555666",
                    MoTa = "Gần bệnh viện",
                    DiaChi = "202 Đường Nguyễn Trãi",
                    PhuongXa = "Phường 5",
                    QuanHuyen = "Quận 5",
                    Tinh = "TP. Hồ Chí Minh",
                    TrangThai = 0
                }
            );

            modelBuilder.Entity<Voucher>().HasData(
new Voucher
                           {
                               MaVoucher = 1,
                               TenVoucher = "Voucher mùa Hè",
                               GiaTri = 12,
                               MoTa = "Voucher hót hít có hạn nha các bạn yêu!",
                               NgayBatDau = DateTime.Now,
                               NgayKetThuc = new DateTime(2025, 12, 12),
                               HinhAnh = Encoding.UTF8.GetBytes("/uploads/vouchers/voucher1.jpg"),
                               DieuKien = 50000,
                               GiaTriToiDa = 200000,
                               LoaiVoucher = 0, // 0 là giảm theo giá trị, 1 là giảm theo số tiền
                               TrangThai = 0
                           },
                           new Voucher
                           {
                               MaVoucher = 2,
                               TenVoucher = "Voucher mùa Hạ",
                               GiaTri = 50000,
                               MoTa = "Voucher hót hít có hạn nha các bạn yêu!",
                               NgayBatDau = DateTime.Now,
                               NgayKetThuc = new DateTime(2025, 12, 12),
                               HinhAnh = Encoding.UTF8.GetBytes("/uploads/vouchers/voucher2.jpg"),
                               DieuKien = 50000,
                               LoaiVoucher = 1, // 0 là giảm theo giá trị, 1 là giảm theo số tiền
                               GiaTriToiDa = 200000,
                               TrangThai = 0
                           }
            );

            modelBuilder.Entity<Coupon>().HasData(
new Coupon
               {
                   ID = 1,
                   MaVoucher = 1,
                   MaNhap = "VC02912",
                   TrangThai = 0
               },
               new Coupon
               {
                   ID = 2,
                   MaVoucher = 1,
                   MaNhap = "VC03912",
                   TrangThai = 0
               },
               new Coupon
               {
                   ID = 3,
                   MaVoucher = 1,
                   MaNhap = "VC04912",
                   TrangThai = 0
               },
               new Coupon
               {
                   ID = 4,
                   MaVoucher = 1,
                   MaNhap = "VC10912",
                   TrangThai = 0
               },
               new Coupon
               {

                   ID = 5,
                   MaVoucher = 1,
                   MaNhap = "VC40912",
                   TrangThai = 0
               },
               new Coupon
               {
                   ID = 6,
                   MaVoucher = 1,
                   MaNhap = "VC60912",
                   TrangThai = 0
               },
               new Coupon
               {
                   ID = 7,
                   MaVoucher = 2,
                   MaNhap = "V502912",
                   TrangThai = 0
               },
               new Coupon
               {
                   ID = 8,
                   MaVoucher = 2,
                   MaNhap = "V103912",
                   TrangThai = 0
               },
               new Coupon
               {
                   ID = 9,
                   MaVoucher = 2,
                   MaNhap = "VC14912",
                   TrangThai = 0
               },
               new Coupon
               {
                   ID = 10,
                   MaVoucher = 2,
                   MaNhap = "VC11912",
                   TrangThai = 0
               },
               new Coupon
               {
                   ID = 11,
                   MaVoucher = 2,
                   MaNhap = "VC41912",
                   TrangThai = 0
               },
               new Coupon
               {
                   ID = 12,
                   MaVoucher = 2,
                   MaNhap = "VC61912",
                   TrangThai = 0
               }
            );

            modelBuilder.Entity<KhuyenMai>().HasData(
new KhuyenMai
                {
                    ID = 1,
                    TenKhuyenMai = "Giảm giá Hè 2025",
                    BatDau = new DateOnly(2025, 8, 1),
                    KetThuc = new DateOnly(2025, 10, 31),
                    PercentChung = 10,
                    All = true,
                    TrangThai = true
                },
                new KhuyenMai
                {
                    ID = 2,
                    TenKhuyenMai = "Khuyến mãi Sinh nhật",
                    BatDau = new DateOnly(2025, 8, 1),
                    KetThuc = new DateOnly(2025, 9, 30),
                    PercentChung = null,
                    All = false,
                    TrangThai = true
                }
            );

            modelBuilder.Entity<ChiTietKhuyenMai>().HasData(
new ChiTietKhuyenMai
                {
                    ID = 1,
                    MaKhuyenMai = 2,  
                    SP = "A00001",  
                    CB = null,
                    PercentRieng = 15
                },
                new ChiTietKhuyenMai
                {
                    ID = 2,
                    MaKhuyenMai = 2,
                    SP = "A00002",
                    CB = 1,
                    PercentRieng = 20
                }
            );

            modelBuilder.Entity<Blogs>().HasData(
                new Blogs
                {
                    MaBlog = 1,
                    MaNguoiDung = "ADMIN01",
                    HoTen = "Quản Trị Viên",
                    TieuDe = "Top 5 Xu Hướng Thời Trang Nam Mùa Hè 2026 Đầy Phong Cách",
                    NoiDung = "<p>Mùa hè 2026 chứng kiến sự lên ngôi của các dòng chất liệu thoáng mát như Cotton Compact, Modal và Kaki co giãn. Điểm nhấn là sự tối giản tinh tế cùng gam màu trung tính mang lại sự tự tin cho phái mạnh.</p>",
                    Slug = "top-5-xu-huong-thoi-trang-nam-mua-he-2026",
                    MetaTitle = "Top 5 Xu Hướng Thời Trang Nam Mùa Hè 2026 - UltraStore",
                    MetaDescription = "Khám phá top 5 xu hướng thời trang nam mùa hè 2026 hot nhất hiện nay tại UltraStore.",
                    HinhAnh = Encoding.UTF8.GetBytes("/uploads/blogs/blog1.jpg"),
                    MoTaHinhAnh = "Xu hướng thời trang nam 2026",
                    ChuDe = "Xu Hướng",
                    IsPublished = true,
                    NgayTao = new DateTime(2026, 3, 15),
                    Likes = 45
                },
                new Blogs
                {
                    MaBlog = 2,
                    MaNguoiDung = "ADMIN01",
                    HoTen = "Quản Trị Viên",
                    TieuDe = "Bí Quyết Phối Đồ Với Áo Polo Cho Chàng Chuẩn Soái Ca",
                    NoiDung = "<p>Áo Polo luôn là item kinh điển trong tủ đồ của nam giới. Khi kết hợp với quần short kaki hoặc quần tây âu, áo polo mang lại diện mạo vừa lịch lãm vừa trẻ trung năng động.</p>",
                    Slug = "bi-quyet-phoi-do-voi-ao-polo-cho-chang-chuan-soai-ca",
                    MetaTitle = "Bí Quyết Phối Đồ Với Áo Polo Chuẩn Soái Ca - UltraStore",
                    MetaDescription = "Hướng dẫn cách phối đồ chuẩn đẹp với áo polo nam cho mọi dịp từ đi làm đến dạo phố.",
                    HinhAnh = Encoding.UTF8.GetBytes("/uploads/blogs/blog2.jpg"),
                    MoTaHinhAnh = "Phối đồ áo polo nam",
                    ChuDe = "Phối Đồ",
                    IsPublished = true,
                    NgayTao = new DateTime(2026, 4, 1),
                    Likes = 38
                },
                new Blogs
                {
                    MaBlog = 3,
                    MaNguoiDung = "NV001",
                    HoTen = "Nguyễn Văn Nhân",
                    TieuDe = "Cách Bảo Quản Quần Áo Cotton Luôn Bền Màu Và Như Mới",
                    NoiDung = "<p>Để giữ quần áo cotton luôn bền màu và không bị bai nhão, bạn nên giặt bằng nước lạnh, lộn trái sản phẩm khi phơi và tránh phơi trực tiếp dưới ánh nắng gay gắt.</p>",
                    Slug = "cach-bao-quan-quan-ao-cotton-luon-ben-mau",
                    MetaTitle = "Cách Bảo Quản Quần Áo Cotton Bền Màu - UltraStore",
                    MetaDescription = "Mẹo giặt và bảo quản trang phục cotton giữ dáng bền màu theo thời gian.",
                    HinhAnh = Encoding.UTF8.GetBytes("/uploads/blogs/blog3.jpg"),
                    MoTaHinhAnh = "Bảo quản quần áo cotton",
                    ChuDe = "Mẹo Vặt",
                    IsPublished = true,
                    NgayTao = new DateTime(2026, 4, 10),
                    Likes = 29
                },
                new Blogs
                {
                    MaBlog = 4,
                    MaNguoiDung = "ADMIN01",
                    HoTen = "Quản Trị Viên",
                    TieuDe = "Combo Tiết Kiệm - Lựa Chọn Thông Minh Cho Tủ Đồ Hiện Đại",
                    NoiDung = "<p>Tại sao phải mất thời gian suy nghĩ hôm nay mặc gì khi các combo thời trang được thiết kế sẵn vừa chuẩn gu vừa giúp bạn tiết kiệm đến 20% chi phí mua sắm!</p>",
                    Slug = "combo-tiet-kiem-lua-chon-thong-minh",
                    MetaTitle = "Combo Tiết Kiệm Cho Tủ Đồ Hiện Đại - UltraStore",
                    MetaDescription = "Giải pháp mua sắm combo thời trang tiện lợi và tiết kiệm cho nam giới.",
                    HinhAnh = Encoding.UTF8.GetBytes("/uploads/blogs/blog4.jpg"),
                    MoTaHinhAnh = "Combo thời trang nam",
                    ChuDe = "Bộ Sưu Tập",
                    IsPublished = true,
                    NgayTao = new DateTime(2026, 4, 20),
                    Likes = 52
                },
                new Blogs
                {
                    MaBlog = 5,
                    MaNguoiDung = "NV001",
                    HoTen = "Nguyễn Văn Nhân",
                    TieuDe = "Chất Liệu Pique Cotton Có Gì Đặc Biệt Khiến Nam Giới Say Đắm?",
                    NoiDung = "<p>Pique Cotton sở hữu bề mặt dệt vân mắt chim đặc trưng, giúp tăng cường khả năng thoát ẩm và lưu thông không khí, là lựa chọn số một cho áo polo thể thao cao cấp.</p>",
                    Slug = "chat-lieu-pique-cotton-co-gi-dac-biet",
                    MetaTitle = "Chất Liệu Pique Cotton Có Gì Đặc Biệt - UltraStore",
                    MetaDescription = "Tìm hiểu chi tiết về chất liệu vải Pique Cotton cao cấp tại UltraStore.",
                    HinhAnh = Encoding.UTF8.GetBytes("/uploads/blogs/blog5.jpg"),
                    MoTaHinhAnh = "Chất liệu vải Pique Cotton",
                    ChuDe = "Chất Liệu",
                    IsPublished = true,
                    NgayTao = new DateTime(2026, 5, 2),
                    Likes = 19
                }
            );

            modelBuilder.Entity<LienHe>().HasData(
                new LienHe
                {
                    MaLienHe = 1,
                    HoTen = "Nguyễn Hoàng Nam",
                    Sdt = "0988112233",
                    Email = "nam.nguyen@gmail.com",
                    NoiDung = "Tôi muốn hỏi chính sách đổi trả hàng nếu không vừa size.",
                    TrangThai = 0,
                    NgayTao = new DateTime(2026, 5, 10, 8, 30, 0)
                },
                new LienHe
                {
                    MaLienHe = 2,
                    HoTen = "Lê Thị Mai",
                    Sdt = "0977223344",
                    Email = "mai.le@gmail.com",
                    NoiDung = "Cửa hàng có giao hàng hỏa tốc trong 2 giờ tại nội thành không?",
                    TrangThai = 1,
                    NgayTao = new DateTime(2026, 5, 11, 14, 15, 0)
                },
                new LienHe
                {
                    MaLienHe = 3,
                    HoTen = "Phạm Quốc Tuấn",
                    Sdt = "0911334455",
                    Email = "tuan.pham@gmail.com",
                    NoiDung = "Sản phẩm áo polo rất đẹp và thoáng mát, cảm ơn shop!",
                    TrangThai = 1,
                    NgayTao = new DateTime(2026, 5, 12, 10, 0, 0)
                }
            );

            modelBuilder.Entity<TinNhan>().HasData(
                new TinNhan
                {
                    MaTinNhan = 1,
                    NguoiGuiId = "KH001",
                    NguoiNhanId = "NV00006",
                    NoiDung = "Chào shop, áo polo A00001 còn size L màu xanh không ạ?",
                    KieuTinNhan = "text",
                    NgayTao = new DateTime(2026, 5, 12, 9, 0, 0),
                    TrangThai = "DaXem"
                },
                new TinNhan
                {
                    MaTinNhan = 2,
                    NguoiGuiId = "NV00006",
                    NguoiNhanId = "KH001",
                    NoiDung = "Dạ chào bạn, mẫu này shop còn sẵn hàng size L bạn nhé!",
                    KieuTinNhan = "text",
                    NgayTao = new DateTime(2026, 5, 12, 9, 2, 0),
                    TrangThai = "DaGui"
                }
            );

            modelBuilder.Entity<DonHang>().HasData(
                new DonHang
                {
                    MaDonHang = 1,
                    MaNguoiDung = "KH001",
                    MaNhanVien = "NV00006",
                    NgayDat = new DateTime(2026, 5, 1, 10, 30, 0),
                    TrangThaiDonHang = TrangThaiDonHang.DaGiaoHang,
                    TrangThaiHang = TrangThaiThanhToan.ThanhToanVNPay,
                    TenNguoiNhan = "Trần Thị Khách",
                    Sdt = "0901234567",
                    DiaChi = "123 Nguyễn Thị Minh Khai, Q.1, TP.HCM",
                    ShippingFee = 30000m,
                    DiscountAmount = 50000m,
                    FinalAmount = 578000m
                },
                new DonHang
                {
                    MaDonHang = 2,
                    MaNguoiDung = "KH001",
                    MaNhanVien = "NV00006",
                    NgayDat = new DateTime(2026, 5, 10, 15, 0, 0),
                    TrangThaiDonHang = TrangThaiDonHang.DangGiaoHang,
                    TrangThaiHang = TrangThaiThanhToan.ThanhToanKhiNhanHang,
                    TenNguoiNhan = "Trần Thị Khách",
                    Sdt = "0901234567",
                    DiaChi = "123 Nguyễn Thị Minh Khai, Q.1, TP.HCM",
                    ShippingFee = 30000m,
                    DiscountAmount = 0m,
                    FinalAmount = 429000m
                }
            );

            modelBuilder.Entity<ChiTietDonHang>().HasData(
                new ChiTietDonHang
                {
                    MaCtdh = 1,
                    MaDonHang = 1,
                    MaSanPham = "A00001_ff0000_S",
                    SoLuong = 2,
                    Gia = 299000,
                    ThanhTien = 598000
                },
                new ChiTietDonHang
                {
                    MaCtdh = 2,
                    MaDonHang = 2,
                    MaCombo = 1,
                    SoLuong = 1,
                    Gia = 399000,
                    ThanhTien = 399000
                }
            );

            modelBuilder.Entity<YeuThich>().HasData(
                new YeuThich
                {
                    MaYeuThich = 1,
                    MaNguoiDung = "KH001",
                    MaSanPham = "A00001_ff0000_S",
                    TenSanPham = "Áo Polo Nam Thể Thao Pique",
                    HoTen = "Trần Thị Khách",
                    NgayYeuThich = new DateTime(2026, 5, 1)
                },
                new YeuThich
                {
                    MaYeuThich = 2,
                    MaNguoiDung = "KH001",
                    MaSanPham = "A00002_ff0000_XL",
                    TenSanPham = "Áo Thun Nam Cổ Tròn Cotton Compact",
                    HoTen = "Trần Thị Khách",
                    NgayYeuThich = new DateTime(2026, 5, 2)
                }
            );

            modelBuilder.Entity<Video>().HasData(
                new Video
                {
                    MaVideo = 1,
                    TenVideo = "Giới thiệu Áo Polo Pique Cao Cấp",
                    MaSanPham = "A00001_ff0000_S"
                },
                new Video
                {
                    MaVideo = 2,
                    TenVideo = "Trải nghiệm Áo Thun Cotton Compact",
                    MaSanPham = "A00002_ff0000_XL"
                }
            );

            modelBuilder.Entity<KichThuoc>().HasData(
                new KichThuoc { MaKichThuoc = 1, TenKichThuoc = "S", MaLoai = 1 },
                new KichThuoc { MaKichThuoc = 2, TenKichThuoc = "M", MaLoai = 1 },
                new KichThuoc { MaKichThuoc = 3, TenKichThuoc = "L", MaLoai = 1 },
                new KichThuoc { MaKichThuoc = 4, TenKichThuoc = "XL", MaLoai = 1 },
                new KichThuoc { MaKichThuoc = 5, TenKichThuoc = "29", MaLoai = 2 },
                new KichThuoc { MaKichThuoc = 6, TenKichThuoc = "30", MaLoai = 2 },
                new KichThuoc { MaKichThuoc = 7, TenKichThuoc = "31", MaLoai = 2 }
            );

            modelBuilder.Entity<GiaoDien>().HasData(
                new GiaoDien
                {
                    MaGiaoDien = 1,
                    TenGiaoDien = "Giao Diện Mặc Định UltraStore",
                    Logo = Encoding.UTF8.GetBytes("/uploads/ui/logo.png"),
                    Avt = Encoding.UTF8.GetBytes("/uploads/ui/avatar.png"),
                    Slider1 = Encoding.UTF8.GetBytes("/uploads/ui/slider1.jpg"),
                    Slider2 = Encoding.UTF8.GetBytes("/uploads/ui/slider2.jpg"),
                    Slider3 = Encoding.UTF8.GetBytes("/uploads/ui/slider3.jpg"),
                    Slider4 = Encoding.UTF8.GetBytes("/uploads/ui/slider4.jpg"),
                    NgayTao = new DateTime(2026, 1, 1),
                    TrangThai = 1
                }
            );

            modelBuilder.Entity<HashTag>().HasData(
                new HashTag
                {
                    MaHashTag = 1,
                    TenHashTag = "AoThunNam",
                    HinhAnh = Encoding.UTF8.GetBytes("/uploads/products/A00001.jpg"),
                    TrangThai = 1
                },
                new HashTag
                {
                    MaHashTag = 2,
                    TenHashTag = "AoPolo",
                    HinhAnh = Encoding.UTF8.GetBytes("/uploads/products/A00002.jpg"),
                    TrangThai = 1
                },
                new HashTag
                {
                    MaHashTag = 3,
                    TenHashTag = "QuanShort",
                    HinhAnh = Encoding.UTF8.GetBytes("/uploads/products/Q00001.jpg"),
                    TrangThai = 1
                }
            );

            modelBuilder.Entity<DonHangSupport>().HasData(
                new DonHangSupport
                {
                    ID = 1,
                    MaSanPham = "A00001_ff0000_S",
                    ChiTietGioHang = 1,
                    MaChiTietCombo = 0,
                    SoLuong = 1,
                    Version = 1
                }
            );

            modelBuilder.Entity<ChiTietGioHangSupport>().HasData(
                new ChiTietGioHangSupport
                {
                    ID = 1,
                    MaSanPham = "A00001_ff0000_S",
                    ChiTietGioHang = 1,
                    MaChiTietCombo = 0,
                    SoLuong = 1,
                    Version = 1
                }
            );

            modelBuilder.Entity<PendingOder>().HasData(
                new PendingOder
                {
                    TempOrderId = "TEMP_ORDER_001",
                    OrderData = "{\"MaNguoiDung\":\"KH001\",\"Total\":578000}",
                    CreatedAt = new DateTime(2026, 5, 1)
                }
            );
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
