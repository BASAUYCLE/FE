/**
 * Central export point for all API services
 */

// Core configuration
export { default as axiosInstance } from "./axiosConfig";

// Service modules
export { default as authService } from "./authService";
export { default as userService } from "./userService";
export { default as bikeService } from "./bikeService";
export { default as bookingService } from "./bookingService";
export { default as paymentService } from "./paymentService";
export { default as postService } from "./postService";
export { default as adminPostService } from "./adminPostService";
export { default as inspectionService } from "./inspectionService";

// For backward compatibility with existing code
export { default as api } from "./axiosConfig";

// Note: Mock API can be imported directly from './mockAPI.js' if needed:
// import { mockUserApi, mockStaffApi } from './services/mockAPI';
