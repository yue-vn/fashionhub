using Microsoft.EntityFrameworkCore;
using UltraStrore.Data;
using UltraStrore.Models.CreateModels;
using UltraStrore.Models.EditModels;
using UltraStrore.Models.ViewModels;
using UltraStrore.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace UltraStrore.Services
{
    public class LienHeServices : ILienHeServices
    {
        private readonly ApplicationDbContext _context;

        public LienHeServices(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<List<LienHeView>> GetLienHeList(string? searchTerm)
        {
            try
            {
                var query = _context.LienHes.AsNoTracking().AsQueryable();

                if (!string.IsNullOrWhiteSpace(searchTerm))
                {
                    var term = searchTerm.Trim().ToLower();
                    query = query.Where(l =>
                        (l.HoTen != null && l.HoTen.ToLower().Contains(term)) ||
                        (l.Sdt != null && l.Sdt.ToLower().Contains(term)) ||
                        (l.NoiDung != null && l.NoiDung.ToLower().Contains(term)) ||
                        (l.Email != null && l.Email.ToLower().Contains(term)) ||
                        l.MaLienHe.ToString().Contains(term)
                    );
                }

                return await query
                    .OrderByDescending(l => l.NgayTao)
                    .Select(l => new LienHeView
                    {
                        MaLienHe = l.MaLienHe,
                        HoTen = l.HoTen,
                        Sdt = l.Sdt,
                        NoiDung = l.NoiDung,
                        Email = l.Email,
                        TrangThai = l.TrangThai,
                        NgayTao = l.NgayTao
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách liên hệ: {ex.Message}", ex);
            }
        }

        public async Task<LienHeView> GetLienHeById(int id)
        {
            try
            {
                var entity = await _context.LienHes.FindAsync(id);
                if (entity == null)
                    throw new Exception("Liên hệ không tồn tại.");

                return new LienHeView
                {
                    MaLienHe = entity.MaLienHe,
                    HoTen = entity.HoTen,
                    Sdt = entity.Sdt,
                    NoiDung = entity.NoiDung,
                    Email = entity.Email,
                    TrangThai = entity.TrangThai,
                    NgayTao = entity.NgayTao
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy thông tin liên hệ: {ex.Message}", ex);
            }
        }

        public async Task<LienHeView> CreateLienHe(LienHeCreate model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            try
            {
                var entity = new LienHe
                {
                    HoTen = model.HoTen,
                    Sdt = model.Sdt,
                    NoiDung = model.NoiDung,
                    Email = model.Email,
                    TrangThai = model.TrangThai ?? 0,
                    NgayTao = model.NgayTao ?? DateTime.Now
                };

                _context.LienHes.Add(entity);
                await _context.SaveChangesAsync();

                return new LienHeView
                {
                    MaLienHe = entity.MaLienHe,
                    HoTen = entity.HoTen,
                    Sdt = entity.Sdt,
                    NoiDung = entity.NoiDung,
                    Email = entity.Email,
                    TrangThai = entity.TrangThai,
                    NgayTao = entity.NgayTao
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo liên hệ: {ex.Message}", ex);
            }
        }

        public async Task<LienHeView> AddLienHe(LienHeCreate model)
        {
            return await CreateLienHe(model);
        }

        public async Task<LienHeView> UpdateLienHe(LienHeEdit model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            try
            {
                var entity = await _context.LienHes.FindAsync(model.MaLienHe);
                if (entity == null)
                    throw new Exception("Liên hệ không tồn tại.");

                entity.HoTen = model.HoTen;
                entity.Sdt = model.Sdt;
                entity.NoiDung = model.NoiDung;
                entity.Email = model.Email;
                entity.TrangThai = model.TrangThai;
                if (model.NgayTao.HasValue)
                {
                    entity.NgayTao = model.NgayTao.Value;
                }

                await _context.SaveChangesAsync();

                return new LienHeView
                {
                    MaLienHe = entity.MaLienHe,
                    HoTen = entity.HoTen,
                    Sdt = entity.Sdt,
                    NoiDung = entity.NoiDung,
                    Email = entity.Email,
                    TrangThai = entity.TrangThai,
                    NgayTao = entity.NgayTao
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật liên hệ: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteLienHe(int id)
        {
            try
            {
                var entity = await _context.LienHes.FindAsync(id);
                if (entity == null)
                    return false;

                _context.LienHes.Remove(entity);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi xóa liên hệ: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteMultipleLienHe(List<int> ids)
        {
            if (ids == null || ids.Count == 0)
                return false;

            try
            {
                var entities = await _context.LienHes
                    .Where(l => ids.Contains(l.MaLienHe))
                    .ToListAsync();

                if (entities.Count == 0)
                    return false;

                _context.LienHes.RemoveRange(entities);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi xóa nhiều liên hệ: {ex.Message}", ex);
            }
        }
    }
}
