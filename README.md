# Invantage - Inventory & Warehouse Management System

Invantage is a modern, enterprise-grade **Inventory and Warehouse Management System** designed to streamline inventory operations, stock control, and warehouse transfers. Built with a robust **Clean Architecture** backend in **.NET 8** and a fast, responsive **React 19** frontend, Invantage provides high reliability, auditability, and granular access controls for businesses managing multiple warehouses.

---

## 🚀 Key Features

### 📦 Product & Catalog Management
- **Detailed Product Registry**: Track SKU, product codes, barcodes, cost and selling prices, and image attachments.
- **Stock Rules**: Define minimum, maximum, and reorder stock levels per product to prevent stockouts and overstocking.
- **Category & Brand Organization**: Group products logically into categories, brands, and Units of Measurement (UoM).

### 🔄 Inventory Operations (Transactions)
- **Stock In**: Receive stock from suppliers. Links to existing Purchase Orders, tracks bill reference numbers, GST, and updates warehouse counts.
- **Stock Out**: Record stock dispatches for sales, internal consumption, or customer fulfillment.
- **Stock Transfer**: Perform and track inventory movements between warehouses (Source to Destination) with status workflows (Draft, Transferred, Cancelled).
- **Inventory Adjustments**: Adjust stock levels due to damage, loss, or audit discrepancies, complete with mandatory adjustment reason codes.

### 📝 Purchase Orders (PO)
- Create purchase order drafts to request goods from suppliers.
- Multi-status tracking: `Draft` ➔ `Pending Approval` ➔ `Approved` ➔ `Received` / `Cancelled`.
- Automatically copy PO items to **Stock In** transactions upon delivery.

### 🏢 Warehouse & Supplier Masters
- **Multi-Warehouse Support**: Track inventory counts independently across multiple physical warehouses.
- **Supplier Directory**: Manage supplier contacts, GST numbers, and addresses.

### 🔒 Security & Role-Based Access Control (RBAC)
- **Granular Module Permissions**: Configurable access rules (View, Add, Edit, Delete) across system modules (Products, Inventory, Users, Dashboard, Reports, Settings).
- **Seeded Roles**:
  - `MasterAdmin`: Full administrative control across the system.
  - `InventoryManager`: Full control over catalog, transactions, and reports; restricted from user management and system settings.
  - `StoreUser`: View stock levels, issue transfers, and request stock.

### 📊 Reports & Analytics
- **Live Dashboards**: Interactive charts visualizing total stock valuation, low stock alerts, pending purchase orders, and monthly transaction distributions (Stock In vs. Stock Out).
- **Audit Logs**: Auto-generated system logs tracking critical user actions (who created/updated/deleted what and when) to ensure compliance and traceability.
- **Company & Notification Settings**: Customize company details (name, address, GSTIN, logo) and SMTP email settings for automated system alerts.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: .NET 10.0 (ASP.NET Core Web API)
- **Database**: Microsoft SQL Server
- **ORM**: Entity Framework Core 8 (EF Core)
- **Security & Identity**: ASP.NET Core Identity with **JWT Bearer Authentication**
- **Logging**: Serilog (structured logging to console and rolling log files)
- **Documentation**: Swagger / OpenAPI with JWT Authorization support
- **Architecture Pattern**: Clean Architecture (Onion Pattern)

### Frontend
- **Framework**: React 19 (Vite + TypeScript)
- **State Management**: Redux Toolkit & React Redux
- **UI Framework**: Material UI (MUI v9) & Material Icons
- **Data Tables**: MUI X Data Grid (`@mui/x-data-grid`)
- **Forms**: React Hook Form with Yup schema validation
- **HTTP Client**: Axios with request/response interceptors (attaches JWT auth headers, handles token expiration)
- **Routing**: React Router DOM (v7)
- **Charts / Analytics**: Recharts

---

## 🏛️ Architecture & Project Structure

The project follows the principles of **Clean Architecture**, separating concerns into isolated layers to maximize testability, maintainability, and independence from external frameworks/databases.

```
Invantage/
├── client/                      # React Frontend App
│   ├── src/                     # React source files (components, pages, redux store)
│   ├── package.json             # NPM dependencies & scripts
│   └── vite.config.ts           # Vite configuration
│
├── src/                         # .NET Backend Projects
│   ├── Invantage.Core/          # Core Domain Layer
│   │   ├── Entities/            # Domain Models (Product, Warehouse, Transaction, etc.)
│   │   └── Enums/               # Domain Enums (e.g., TransactionType, OrderStatus)
│   │
│   ├── Invantage.Application/   # Application Logic Layer (Use Cases)
│   │   ├── Services/            # Business logic services (AuthService, ProductService, etc.)
│   │   ├── DTOs/                # Data Transfer Objects
│   │   └── Common/              # Interfaces & Application exceptions
│   │
│   ├── Invantage.Infrastructure/# Infrastructure Layer (Data & External Services)
│   │   ├── Data/                # EF Core ApplicationDbContext and Configuration
│   │   ├── Migrations/          # EF Core Database Migrations
│   │   ├── Repositories/        # Unit of Work & Repository Pattern implementation
│   │   └── Security/            # Token generation & password services
│   │
│   └── Invantage.Api/           # Presentation Layer (API endpoints)
│       ├── Controllers/         # REST API Controllers (Products, Transactions, Users, etc.)
│       ├── Middleware/          # Global Exception Handling Middleware
│       └── Program.cs           # Application bootstrap, DI configuration, and pipeline
│
└── Invantage.slnx               # Visual Studio Solution File (XML format)
```

---

## ⚙️ Setup & Run Instructions

Follow these steps to set up and run the project locally on your machine.

### 📋 Prerequisites
Ensure you have the following installed:
1. **.NET 8.0 SDK** ([Download here](https://dotnet.microsoft.com/download/dotnet/8.0))
2. **Node.js** v18+ and **npm** ([Download here](https://nodejs.org/))
3. **Microsoft SQL Server** (LocalDB, Express, or Developer edition)
4. **Visual Studio 2022** (v17.10+) or **VS Code** with C# Dev Kit extension

---

### 🖥️ Step 1: Backend Setup (API)

1. **Configure the Connection String**:
   - Open [appsettings.json](file:///c:/Nishant/Code/Antigravity/Invantage/src/Invantage.Api/appsettings.json).
   - Under `ConnectionStrings`, update the `DefaultConnection` string to point to your local SQL Server instance:
     ```json
     "ConnectionStrings": {
       "DefaultConnection": "Server=YOUR_SERVER;Database=InvantageDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
     }
     ```
     *Tip: If using standard SQL Server Authentication, use:*
     `"Server=localhost;Database=InvantageDb;User Id=sa;Password=your_password;TrustServerCertificate=True"`

2. **Database Migration & Seeding**:
   - **No manual migrations execution is required!** On API startup, the system will detect any pending migrations, apply them automatically to create/update the database schema, and seed the default master data, roles, and default users.
   - If you prefer to apply migrations manually before running, open the terminal in the root folder and run:
     ```bash
     dotnet ef database update --project src/Invantage.Infrastructure/ --startup-project src/Invantage.Api/
     ```

3. **Run the Backend**:
   - Open a terminal at the project root directory and run:
     ```bash
     dotnet run --project src/Invantage.Api/Invantage.Api.csproj
     ```
   - Alternatively, open `Invantage.slnx` in Visual Studio 2022 and press **F5** to start debugging.
   - The API will start on:
     - HTTP: `http://localhost:5147`
     - Swagger UI: `http://localhost:5147/swagger` (Access this URL to browse the API endpoints and test requests interactively).

---

### 🌐 Step 2: Frontend Setup (React Client)

1. **Open a terminal** and navigate to the frontend directory:
   ```bash
   cd client
   ```

2. **Configure Environment Variables**:
   - Check the [.env](file:///c:/Nishant/Code/Antigravity/Invantage/client/.env) file inside the `client` directory.
   - Verify that the `VITE_API_URL` variable correctly points to your backend API endpoint:
     ```env
     VITE_API_URL=http://localhost:5147/api
     ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   - The application will run locally at: `http://localhost:5173`.

---

### 🔑 Step 3: Logging In

Once both the backend and frontend are running, navigate to `http://localhost:5173` on your browser. Use the seeded MasterAdmin credentials to log in:

- **Email/Username**: `admin@invantage.com`
- **Password**: `Admin@123`

---

## 📂 Logs & Auditing
- **Serilog Logs**: Backend system log files are written daily in the `src/Invantage.Api/Logs/` folder.
- **Audit Logs Table**: All critical modifications to products, adjustments, and transactions are logged in the `AuditLogs` database table and visible inside the application reports.
