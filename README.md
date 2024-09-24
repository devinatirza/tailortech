# TailorTech

Welcome to TailorTech, an innovative platform designed to bridge the gap between clients and tailors, offering a seamless experience for both parties. Below are the key features and instructions on how to set up and run the application.

## Application Name: TailorTech

### Features for Clients:
- **Tailor Search by Specialization**: Find tailors based on their specific areas of expertise.
- **Purchase Tailored Products**: Buy products directly from tailors.
- **Wishlist and Cart**: Save and manage items of interest.
- **Measurement Assistance**: Get help with measurements through chat, call assistant, or home service.
- **E-Wallet Payments**: Make payments using e-wallets (currently illustrated with TailorPay, with plans to integrate GoPay and others).
- **Real-Time Transaction Status Updates**: Stay updated on the status of your transactions.
- **Profile Editing**: Update your profile information.
- **Point Collection for Discounts**: Earn points to redeem discount coupons.
- **Top-Up Balance**: Add funds to your account for seamless transactions.

### Features for Tailors:
- **Product Management**: Activate or deactivate products for sale (future updates will include account activation and deactivation).
- **Add Tailored Products for Sale**: List new products for clients.
- **Detailed Client Requests**: View detailed requests, including client descriptions and measurements, to ensure precise tailoring.
- **Withdraw Funds**: Withdraw earnings from sales directly to your account.

## Getting Started

This README provides instructions on how to set up and run the TailorTech application.

### Prerequisites

1. Clone the repository to your local machine.
2. Download the `tailor_tech.sql` file provided in the repository.
3. Install React Native and Node.js. Note that we use TypeScript.
4. Install Go (Golang) for the backend development.
5. Make sure you have XAMPP to manage the database. If you don't, please install it.

### Setup Instructions

1. **Create a Database**:
   - Open XAMPP and create a new database named `tailor_tech`.
   - Import the `tailor_tech.sql` file into the `tailor_tech` database.

2. **Open Project in VS Code**:
   - Open both the `frontend` and `backend` folders in separate Visual Studio Code windows.

3. **Backend Setup**:
   - Open a terminal in the `backend` folder.
   - Run `go mod tidy` to tidy up the module dependencies.
   - Execute `go run main.go` to start the backend server.

4. **Frontend Setup**:
   - Open a terminal in the `frontend` folder.
   - Run `npm install` to install all necessary dependencies.
   - Execute `npm start` to start the frontend server.

5. **Run the Application**:
   - Open your browser and navigate to `localhost`.
   - Use the browser's inspect tool to switch to mobile view for a better experience.

Thank you for using TailorTech.
