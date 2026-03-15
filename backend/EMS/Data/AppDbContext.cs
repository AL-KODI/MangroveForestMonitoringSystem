namespace EMS.Data
{

    using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore;
    using EMS.Entities;
    using System.Threading.Tasks;
    using System;

    public class AppDbContext : IdentityDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
        public DbSet<Unit> Units { get; set; }
        public DbSet<Property> Properties { get; set; }
    public DbSet<Alert> Alerts { get; set; }
        public DbSet<UnitProperty> UnitProperties { get; set; }
        public DbSet<Measurement> Measurements { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UnitProperty>()
                .HasIndex(up => new { up.UnitId, up.PropertyId })
                .IsUnique();
        }

    }
}

