namespace Invantage.Core.Enums
{
    public enum TransactionStatus
    {
        Draft = 0,
        Approved = 1,
        Received = 2,
        Rejected = 3
    }

    public enum AdjustmentReason
    {
        Damage = 0,
        Lost = 1,
        Found = 2,
        ManualCorrection = 3
    }

    public enum NotificationType
    {
        LowStock = 0,
        ExpiryAlert = 1,
        ApprovalRequired = 2,
        SystemAlert = 3
    }
}
