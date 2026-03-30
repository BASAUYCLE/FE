// Re-export services và axios – dùng trong page/component
export { default as axiosInstance } from "./axiosConfig";

export { default as authService } from "./authService";
export { default as userService } from "./userService";
export { default as bikeService } from "./bikeService";
export { default as bookingService } from "./bookingService";
export { default as paymentService } from "./paymentService";
export { default as postService } from "./postService";
export { default as adminPostService } from "./adminPostService";
export { default as orderService } from "./orderService";
export { default as disputeService } from "./disputeService";
export { default as adminService } from "./adminService";
export { default as inspectionService } from "./inspectionService";
export { default as walletService } from "./walletService";
export { default as transactionService } from "./transactionService";
export { default as wishlistService } from "./wishlistService";
export { default as addressService } from "./addressService";
export { default as locationService } from "./locationService";
export { default as feedbackService } from "./feedbackService";
export { default as brandService } from "./brandService";
export { default as categoryService } from "./categoryService";

// Cùng instance axios (nếu có chỗ còn import "api")
export { default as api } from "./axiosConfig";
