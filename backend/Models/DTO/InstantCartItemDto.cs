namespace UltraStrore.Models.DTO
{
    public class InstantCartItemDto
    {
        public string? IdSanPham { get; set; }
        public string? TenSanPham { get; set; }
        public string? MauSac { get; set; }
        public string? KickThuoc { get; set; }
        public int? SoLuong { get; set; }
        public int? SoLuongMua { get; set; }
        public decimal? TienSanPham { get; set; }
        public decimal? Gia { get; set; }
        public string? HinhAnh { get; set; }
    }
}
