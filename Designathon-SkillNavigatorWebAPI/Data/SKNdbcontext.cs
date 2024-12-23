using Designathon_SkillNavigatorWebAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace Designathon_SkillNavigatorWebAPI.Data
{
    public class SKNsbcontext : DbContext
    {
        public SKNsbcontext(DbContextOptions options) : base(options)
        {

        }
        public DbSet<User> Users { get; set; }
    }
}
