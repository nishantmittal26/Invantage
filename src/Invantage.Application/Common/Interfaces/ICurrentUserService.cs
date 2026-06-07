namespace Invantage.Application.Common.Interfaces
{
    public interface ICurrentUserService
    {
        string? UserId { get; }
        string? Username { get; }
        string? IpAddress { get; }
    }
}
