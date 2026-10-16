using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;
using UltraStrore.Models.CreateModels;
using UltraStrore.Models.EditModels;
using UltraStrore.Repository;

namespace UltraStrore.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartServices services;

        public CartController(ICartServices services)
        {
            this.services = services;
        }

        [HttpPost("ThemSanPhamVaoGioHang")]
        public async Task<IActionResult> ThemSanPhamVaoGioHang([FromBody] ChiTietGioHangSanPhamCreate info)
        {
            var data = await this.services.ThemSanPham(info);
            return Ok(data);
        }

        [HttpGet("GioHangByKhachHang")]
        public async Task<IActionResult> GioHangByKhachHang(string id)
        {
            var data = await this.services.GioHangViews(id);
            return Ok(data);
        }

        [HttpPost("ThemComboVaoGioHang")]
        public async Task<IActionResult> ThemComboVaoGioHang([FromBody] ChiTietGioHangComboCreate info)
        {
            var data = await this.services.ThemCombo(info);
            return Ok(data);
        }

        [HttpPost("TangSoLuongSanPham")]
        public async Task<IActionResult> TangSoLuongSanPham([FromBody] TangGiamSoLuongGioHang info)
        {
            var data = await this.services.TangSoLuongSanPham(info);
            return Ok(data);
        }

        [HttpPost("GiamSoLuongSanPham")]
        public async Task<IActionResult> GiamSoLuongSanPham([FromBody] TangGiamSoLuongGioHang info)
        {
            var data = await this.services.GiamSoLuongSanPham(info);
            return Ok(data);
        }

        [HttpDelete("XoaSanPham")]
        [HttpPost("XoaSanPham")]
        public async Task<IActionResult> XoaSanPham([FromBody] TangGiamSoLuongGioHang info)
        {
            var data = await this.services.XoaChiTietGioHang(info);
            return Ok(data);
        }

        [HttpDelete("XoaCombo")]
        [HttpPost("XoaCombo")]
        public async Task<IActionResult> XoaCombo([FromBody] TangGiamSoLuongGioHang info)
        {
            var data = await this.services.XoaChiTietGiohangCombo(info);
            return Ok(data);
        }

        [HttpDelete("XoaComboVersion")]
        [HttpPost("XoaComboVersion")]
        public async Task<IActionResult> XoaComboVersion([FromBody] GioHangComboVersion info)
        {
            var data = await this.services.XoaVersionComboGioHang(info);
            return Ok(data);
        }

        [HttpPost("CopyGioHang")]
        public async Task<IActionResult> CopyGioHang([FromBody] CopyGHModel info)
        {
            var data = await this.services.CopyGioHang(info);
            return Ok(data);
        }
    }
}
