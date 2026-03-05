import axiosInstance from "./axiosConfig";

const paymentService = {
  // GET /payment/vnpay/callback - VNPay redirect
  // Params: vnp_Amount, vnp_TransactionNo, vnp_ResponseCode, etc.
  // BE will process and redirect to frontend with result
  handleVNPayCallback: (params) => {
    // This is typically handled by backend redirect
    // FE just needs to parse the query params from callback URL
    return Promise.resolve(params);
  },

  // Verify payment status by checking transaction
  // This is done through transactionService.getById() instead
};

export default paymentService;
