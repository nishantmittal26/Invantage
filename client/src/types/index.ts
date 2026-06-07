export interface BaseEntity {
  id: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Category extends BaseEntity {
  categoryName: string;
  description: string;
}

export interface Brand extends BaseEntity {
  brandName: string;
  description: string;
}

export interface Unit extends BaseEntity {
  unitName: string;
  abbreviation: string;
}

export interface Supplier extends BaseEntity {
  supplierName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
}

export interface Warehouse extends BaseEntity {
  warehouseCode: string;
  warehouseName: string;
  address: string;
  manager: string;
}

export interface Product extends BaseEntity {
  productCode: string;
  sku: string;
  productName: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  brandId: string;
  brandName?: string;
  unitId: string;
  unitName?: string;
  reorderLevel: number;
  minimumStock: number;
  maximumStock: number;
  costPrice: number;
  sellingPrice: number;
  barcode: string;
  imageUrl?: string;
  currentStock?: number; // Total stock calculated across all warehouses
}

export interface WarehouseStock {
  id?: string;
  warehouseId: string;
  warehouseName?: string;
  productId: string;
  productName?: string;
  productCode?: string;
  currentStock: number;
  lastUpdated: string;
}

export enum TransactionStatus {
  Draft = 'Draft',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Received = 'Received',
  Cancelled = 'Cancelled'
}

export interface StockInDetail {
  id?: string;
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  costPrice: number;
  batchNumber: string;
  expiryDate?: string;
}

export interface StockInHeader extends BaseEntity {
  transactionNo: string;
  date: string;
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  remarks?: string;
  status: TransactionStatus;
  approvedDate?: string;
  approvedBy?: string;
  details: StockInDetail[];
}

export interface StockOutDetail {
  id?: string;
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
}

export interface StockOutHeader extends BaseEntity {
  transactionNo: string;
  date: string;
  warehouseId: string;
  warehouseName?: string;
  departmentOrUser: string;
  remarks?: string;
  status: TransactionStatus;
  approvedDate?: string;
  approvedBy?: string;
  details: StockOutDetail[];
}

export enum AdjustmentReason {
  StockCountingDifference = 0,
  DamagedGoods = 1,
  TheftOrLoss = 2,
  ExpiredItems = 3,
  Other = 4
}

export interface Adjustment extends BaseEntity {
  productId: string;
  productName?: string;
  productCode?: string;
  warehouseId: string;
  warehouseName?: string;
  currentStock: number;
  adjustQuantity: number;
  reason: AdjustmentReason;
  remarks: string;
}

export interface TransferDetail {
  id?: string;
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
}

export interface TransferHeader extends BaseEntity {
  transactionNo: string;
  date: string;
  sourceWarehouseId: string;
  sourceWarehouseName?: string;
  destinationWarehouseId: string;
  destinationWarehouseName?: string;
  remarks?: string;
  status: TransactionStatus;
  approvedDate?: string;
  approvedBy?: string;
  details: TransferDetail[];
}

export interface PurchaseOrderDetail {
  id?: string;
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  rate: number;
}

export interface PurchaseOrder extends BaseEntity {
  poNumber: string;
  date: string;
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  remarks?: string;
  status: TransactionStatus;
  approvedDate?: string;
  approvedBy?: string;
  details: PurchaseOrderDetail[];
}

export interface AuditLog {
  id: string;
  username: string;
  action: string;
  entityName: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  timestamp: string;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  gstNumber?: string;
  logoUrl?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpEmail?: string;
  smtpPassword?: string;
  enableSmtp: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  mobile?: string;
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission?: Permission;
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
  refreshTokenExpiration: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}
