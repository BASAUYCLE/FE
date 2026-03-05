import axiosInstance from "./axiosConfig";

const walletService = {
  // GET /wallet - Lấy thông tin ví của user đang đăng nhập
  getWallet: () => axiosInstance.get("/wallet"),

  // POST /wallet/top-up - Nạp tiền vào ví (trả về VNPay payment URL)
  // Body: { amount: number, returnUrl: string }
  // Return: { result: "https://sandbox.vnpayment.vn/paygate/..." }
  topUp: (amount) => {
    if (!amount || amount <= 0) {
      return Promise.reject(new Error("Số tiền phải lớn hơn 0"));
    }
    
    // Construct callback URL - will be called by VNPay after payment
    const returnUrl = `${window.location.origin}/payment/result`;
    
    return axiosInstance.post("/wallet/top-up", { 
      amount,
      returnUrl
    });
  },
};

export default walletService;


