using System;
using System.Collections.Generic;

namespace Invantage.Core.Entities
{
    public class Unit : BaseEntity
    {
        public string UnitName { get; set; } = string.Empty; // Piece, Kg, Box, Liter

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
