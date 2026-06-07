using System;

namespace Invantage.Core.Entities.Identity
{
    public class RolePermission : BaseEntity
    {
        public Guid RoleId { get; set; }
        public Guid PermissionId { get; set; }

        public bool View { get; set; }
        public bool Add { get; set; }
        public bool Edit { get; set; }
        public bool Delete { get; set; }

        public virtual ApplicationRole Role { get; set; } = null!;
        public virtual Permission Permission { get; set; } = null!;
    }
}
