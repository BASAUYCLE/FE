# VNPay Wallet Integration Guide

## Overview
This document explains the VNPay Sandbox integration for wallet top-ups in BASAUYCLE frontend.

## Flow Diagram
```
User Interface (FE)
  ↓
1. User enters amount and clicks "Nạp tiền ngay" button
  ↓
Wallet Page Component
  ↓
2. handleTopUp() calls walletService.topUp(amount)
  ↓
walletService.topUp()
  ↓
3. POST /wallet/top-up
   Body: { amount: number, returnUrl: string }
  ↓
Backend (BE)
  ↓
4. BE generates VNPay payment URL with returnUrl parameter
   Returns: { result: "https://sandbox.vnpayment.vn/paygate/..." }
  ↓
Frontend receives payment URL
  ↓
5. window.location.href = paymentUrl
  ↓
VNPay Sandbox (Browser redirect)
  ↓
6. User completes payment in VNPay UI
   - Demo Bank: Techcombank
   - STK: 00000000
   - OTP: 000000
  ↓
7. VNPay redirects browser to: returnUrl?vnp_Amount=...&vnp_ResponseCode=...&...
   (redirects to: http://localhost:5173/payment/result?vnp_...)
  ↓
Frontend PaymentResult Page
  ↓
8. PaymentResult component receives VNPay params from URL
  ↓
9. If vnp_ResponseCode === "00" (success):
   - Display success message
   - Call walletService.getWallet() to refresh balance
   - Show transaction details
  ↓
10. If vnp_ResponseCode !== "00" (failure):
    - Display error message
    - Show error code and troubleshooting steps
  ↓
User returns to Wallet with updated balance
```

## API Endpoints

### 1. Get Wallet Information
```
GET /wallet
Authentication: Required (Bearer JWT token)
Response: {
  "code": 0,
  "result": {
    "walletId": "UUID",
    "userId": "UUID",
    "balance": 1000000,
    "totalTopUp": 5000000,
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Initiate Top-Up (VNPay Payment)
```
POST /wallet/top-up
Authentication: Required (Bearer JWT token)
Content-Type: application/json

Request Body:
{
  "amount": 100000,        // VND amount (10K-100M)
  "returnUrl": "https://basauycle.com/payment/result"  // Where VNPay redirects after payment
}

Response (Success):
{
  "code": 0,
  "result": "https://sandbox.vnpayment.vn/paygate/pay?vnp_TxnRef=...&vnp_Amount=...&..."
}

Response (Error):
{
  "code": 1,
  "message": "Invalid amount or other error"
}
```

### 3. Get Transaction History
```
GET /transactions?limit=20&offset=0
Authentication: Required
Response: {
  "code": 0,
  "result": [
    {
      "transactionId": "UUID",
      "walletId": "UUID",
      "type": "TOP_UP",
      "amount": 100000,
      "status": "SUCCESS",
      "paymentMethod": "VNPAY",
      "vnpayTransactionNo": "12345678",
      "bankCode": "TECHCOMBANK",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

## Frontend Implementation Files

### src/services/walletService.js
Handles wallet API calls with built-in VNPay returnUrl construction.

Key Methods:
- `getWallet()`: Fetch current wallet info
- `topUp(amount)`: Initiate top-up with auto-constructed returnUrl

```javascript
// Auto-constructed return URL
const returnUrl = `${window.location.origin}/payment/result`;
```

### src/pages/Wallet/index.jsx
Main wallet page with:
- Wallet balance display
- Top-up form with validation (10K-100M VND)
- Quick amount buttons (100K, 500K, 1M, 5M)
- Transaction history table
- Loading states for VNPay redirect

Key Features:
- Real-time balance refresh
- Amount validation
- VNPay sandbox demo bank info display
- Formatted currency display (Vietnamese locale)
- Transaction history with sorting/pagination

### src/pages/Payment/PaymentResult.jsx
Handles VNPay callback page.

Receives URL parameters from VNPay:
- `vnp_Amount`: Transaction amount (in smallest units)
- `vnp_ResponseCode`: "00" = success, others = failure
- `vnp_TransactionNo`: VNPay transaction ID
- `vnp_BankCode`: Bank code used for payment
- `vnp_PayDate`: Payment timestamp (YYYYMMDDHHmmss)

Features:
- Auto-parse VNPay response
- Display success/failure message
- Show transaction details
- Refresh wallet on success
- Troubleshooting help on failure
- Navigation buttons to Wallet or Home

### Routes
- `/wallet` → MyWallet component (ProtectedRoute)
- `/payment/result` → PaymentResult component (ProtectedRoute)

## VNPay Sandbox Setup

### Demo Bank Credentials
```
Bank: Techcombank
Account Number: 00000000
OTP: 000000
```

### Sandbox URL
```
https://sandbox.vnpayment.vn/paygate/pay?...
```

### Testing Steps
1. Login to BASAUYCLE
2. Go to /wallet
3. Enter amount (e.g., 50,000 VND)
4. Click "Nạp tiền ngay"
5. Redirected to VNPay Sandbox
6. Select demo bank (Techcombank)
7. Use demo credentials above
8. Complete payment
9. Auto-redirected to /payment/result with success message
10. Verify wallet balance updated in database

## Error Handling

### Common VNPay Response Codes
- `00`: Success
- `01` to `99`: Various failures (transaction declined, wrong OTP, timeout, etc.)

### Frontend Error Handling
```javascript
// In PaymentResult.jsx
const isSuccess = responseCode === "00";

if (isSuccess) {
  // Display success
  // Refresh wallet data
} else {
  // Display error
  // Show troubleshooting steps
  // Allow retry
}
```

### Browser Redirect Issues
If user sees "lỗi browser" or crash:
1. Check network tab in DevTools - look for 404 on /payment/result route
2. Verify PaymentResult.jsx is imported in App.jsx
3. Check returnUrl parameter is correct (window.location.origin)
4. Ensure BE is configured with correct VNPay Merchant ID
5. Check console for JavaScript errors

## Currency Formatting

### Vietnamese Locale
```javascript
// BDD format with symbol
formatCurrency(100000)  // Returns: "100,000 ₫"
```

Used by:
- Wallet balance display
- Transaction history
- Payment Result page
- Top-up form

## State Management

### Wallet Context (AuthContext)
- User login info stored
- JWT token extracted during login
- User info: `{ id, email, userId, ...}`

### Wallet Page Local State
```javascript
const [wallet, setWallet] = useState(null);        // Wallet info
const [transactions, setTransactions] = useState([]); // Transaction history
const [loading, setLoading] = useState(false);      // Data loading
const [topUpLoading, setTopUpLoading] = useState(false); // VNPay redirect loading
```

## Important Notes

1. **returnUrl is Critical**: The walletService automatically constructs it from `window.location.origin`. This must match the FE deployment URL.

2. **Amount in Smallest Units**: VNPay sends amounts in smallest units. PaymentResult divides by 100 for VND display.

3. **Protected Routes**: Both /wallet and /payment/result require user to be authenticated.

4. **JWT Token**: All API calls include Bearer token automatically via axiosConfig interceptor.

5. **Wallet DB Updates**: Backend callback handler updates wallet.balance after successful VNPay payment.

## Next Steps / Improvements

- [ ] Add wallet transaction export functionality
- [ ] Implement transaction detail modal
- [ ] Add dispute/refund request for failed transactions
- [ ] Create admin transaction management page
- [ ] Add email notification on successful top-up
- [ ] Implement wallet balance alerts/notifications
- [ ] Add payment method history tracking
