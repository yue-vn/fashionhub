namespace UltraStrore.Middleware
{
    public class RestrictAdminAccessMiddleware
    {
        private readonly RequestDelegate _next;

        public RestrictAdminAccessMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Path.StartsWithSegments("/admin", StringComparison.OrdinalIgnoreCase))
            {
                var isAuthorized = context.User.Identity?.IsAuthenticated == true &&
                    (context.User.IsInRole("Admin") ||
                     context.User.IsInRole("admin") ||
                     context.User.IsInRole("Staff") ||
                     context.User.IsInRole("staff") ||
                     context.User.HasClaim(c => (c.Type == System.Security.Claims.ClaimTypes.Role || c.Type == "role" || c.Type == "vaiTro") &&
                         (c.Value.Equals("admin", StringComparison.OrdinalIgnoreCase) ||
                          c.Value.Equals("staff", StringComparison.OrdinalIgnoreCase) ||
                          c.Value == "1" || c.Value == "2")));

                if (!isAuthorized)
                {
                    context.Response.StatusCode = StatusCodes.Status404NotFound;
                    await context.Response.WriteAsync("Not Found");
                    return;
                }
            }

            await _next(context);
        }
    }
}
