/**
 * Dữ liệu mẫu cho hàng đợi kiểm định (có thể thay bằng API).
 * Logic: bên thứ ba trao đổi hàng hóa - inspector nhận yêu cầu kiểm định xe từ seller.
 */
import bikeTarmac from "../assets/bike-tarmac-sl7.png";
import santaCruzNomadCC from "../assets/SantaCruzNomaCC.png";
import canyonGrizlCFSL from "../assets/CanyonGrizlCFSL.jpg";
import specializedTurboLevo from "../assets/SpecializedTurboLevo.png";

export const mockInspections = [
  {
    id: "CME-98231",
    bicycleId: "1",
    bicycleName: "Trek Fuel EX 8",
    bicycleImage: bikeTarmac,
    bicycleType: "MTB",
    sellerName: "John Doe",
    sellerLocation: "Hanoi, Vietnam",
    requestedDate: "2024-10-24T10:30:00",
    status: "PENDING",
  },
  {
    id: "CME-98232",
    bicycleId: "2",
    bicycleName: "Pinarello Dogma F12",
    bicycleImage: santaCruzNomadCC,
    bicycleType: "Road",
    sellerName: "Jane Smith",
    sellerLocation: "Ho Chi Minh City, Vietnam",
    requestedDate: "2024-10-23T14:00:00",
    status: "IN_PROGRESS",
  },
  {
    id: "CME-98233",
    bicycleId: "3",
    bicycleName: "Canyon Grizl CF SL",
    bicycleImage: canyonGrizlCFSL,
    bicycleType: "Gravel",
    sellerName: "Nguyen Van A",
    sellerLocation: "Da Nang, Vietnam",
    requestedDate: "2024-10-20T09:00:00",
    status: "OVERDUE",
  },
  {
    id: "CME-98234",
    bicycleId: "4",
    bicycleName: "Specialized Turbo Levo",
    bicycleImage: specializedTurboLevo,
    bicycleType: "E-MTB",
    sellerName: "Tran Thi B",
    sellerLocation: "Hanoi, Vietnam",
    requestedDate: "2024-10-25T11:00:00",
    status: "PENDING",
  },
];

/** Disputes for dashboard card (compact). */
export const mockDisputes = [
  { id: "D-001", reportId: "CME-98230", description: "Buyer claims mechanical issue not noted in report.", status: "open" },
  { id: "D-002", reportId: "CME-98229", description: "Seller disputes condition rating.", status: "open" },
];

/**
 * Dispute cases for Dispute Support page.
 * Lấy dữ liệu từ project: xe từ mockInspections/marketplace, buyer/seller thống nhất với project.
 */
export const mockDisputeCases = [
  {
    id: "DSP-7821",
    reportId: "CME-98231",
    disputeType: "Item not as described",
    itemName: "Trek Fuel EX 8",
    buyerName: "Nguyen Van C",
    sellerName: "John Doe",
    status: "IN_REVIEW",
    priority: "HIGH",
    date: "2024-10-12T09:00:00",
  },
  {
    id: "DSP-7822",
    reportId: "CME-98232",
    disputeType: "Shipping Damage",
    itemName: "Pinarello Dogma F12",
    buyerName: "Le Thi D",
    sellerName: "Jane Smith",
    status: "ESCALATED",
    priority: "HIGH",
    date: "2024-10-11T14:30:00",
  },
  {
    id: "DSP-7825",
    reportId: "CME-98233",
    disputeType: "Non-Delivery",
    itemName: "Canyon Grizl CF SL",
    buyerName: "Tran Van E",
    sellerName: "Nguyen Van A",
    status: "OPEN",
    priority: "MEDIUM",
    date: "2024-10-10T11:00:00",
  },
  {
    id: "DSP-7819",
    reportId: "CME-98234",
    disputeType: "Condition dispute",
    itemName: "Specialized Turbo Levo",
    buyerName: "Pham Thi F",
    sellerName: "Tran Thi B",
    status: "RESOLVED",
    priority: "LOW",
    date: "2024-10-09T16:45:00",
  },
  {
    id: "DSP-7820",
    reportId: "CME-98232",
    disputeType: "Wrong item received",
    itemName: "Pinarello Dogma F12",
    buyerName: "Hoang Van G",
    sellerName: "Jane Smith",
    status: "IN_REVIEW",
    priority: "MEDIUM",
    date: "2024-10-08T10:00:00",
  },
];

export const mockCompletedReports = [
  { id: "R-001", title: "Pinarello Dogma F12", completedAt: "2024-10-24T12:00:00" },
  { id: "R-002", title: "Trek Domane SLR 9", completedAt: "2024-10-24T10:00:00" },
];

/**
 * Completed inspection orders for management page (đơn đã hoàn thành).
 * Replace with API when ready.
 */
export const mockCompletedOrders = [
  { id: "R-001", inspectionId: "CME-98232", reportId: "CME-98230-X12", bicycleName: "Pinarello Dogma F12", bicycleType: "Road", sellerName: "Jane Smith", completedAt: "2024-10-24T12:00:00", status: "APPROVED" },
  { id: "R-002", inspectionId: "CME-98231", reportId: "CME-98228-X12", bicycleName: "Trek Domane SLR 9", bicycleType: "Road", sellerName: "John Doe", completedAt: "2024-10-24T10:00:00", status: "APPROVED" },
  { id: "R-003", inspectionId: "CME-98233", reportId: "CME-98227-X12", bicycleName: "Canyon Grizl CF SL", bicycleType: "Gravel", sellerName: "Nguyen Van A", completedAt: "2024-10-23T16:30:00", status: "APPROVED" },
  { id: "R-004", inspectionId: "CME-98234", reportId: "CME-98226-X12", bicycleName: "Specialized Tarmac SL7", bicycleType: "Road", sellerName: "BikeShop Hanoi", completedAt: "2024-10-23T09:00:00", status: "APPROVED" },
  { id: "R-005", inspectionId: "CME-98234", reportId: "CME-98225-X12", bicycleName: "Giant TCR Advanced", bicycleType: "Road", sellerName: "Tran Thi B", completedAt: "2024-10-22T14:00:00", status: "APPROVED" },
];

/** Report detail for inspection details page (third-party exchange logic). Replace with API. */
export function getInspectionReport(inspectionId) {
  const inspection = mockInspections.find((i) => i.id === inspectionId);
  if (!inspection) return null;
  const reportId = `${inspectionId}-X12`;
  const updatedAt = "2024-05-24";
  const inspectorName = "Inspector Name";
  const checklist = [
    {
      category: "Frame & Fork",
      items: [
        { title: "Straightness & deformation", description: "No deformation detected.", status: "good" },
        { title: "Paint condition (cosmetic)", description: "Light scratch on top tube.", status: "good", statusLabel: "95%" },
        { title: "Welds & connections", description: "All joints intact.", status: "good" },
      ],
    },
    {
      category: "Drivetrain",
      items: [
        { title: "Derailleurs", description: "Shimano 105 R7000, adjusted.", status: "good" },
        { title: "Chain wear", description: "Elongation 0.5, replacement recommended.", status: "fair", statusLabel: "Fair" },
        { title: "Bottom bracket", description: "Smooth rotation.", status: "good" },
      ],
    },
    {
      category: "Brakes",
      items: [
        { title: "Brake pads", description: "~80% thickness remaining.", status: "good" },
        { title: "Brake lever response", description: "Firm and even.", status: "good" },
      ],
    },
  ];
  const completionPercent = 100;
  const inspectorNotes = "Bike is well maintained. Minor cosmetic wear. Continental GP5000 tires in good condition. Recommend chain replacement within 500 km.";
  const reportStatus =
    inspection.status === "COMPLETED"
      ? "APPROVED"
      : inspection.status === "IN_PROGRESS"
        ? "PENDING_APPROVAL"
        : "DRAFT";
  const inspectionImages = [inspection.bicycleImage, inspection.bicycleImage, inspection.bicycleImage, inspection.bicycleImage];
  return {
    ...inspection,
    reportId,
    updatedAt,
    inspectorName,
    checklist,
    completionPercent,
    inspectorNotes,
    reportStatus,
    inspectionImages,
    owner: inspection.sellerName,
    frameNumber: `SN-${inspection.id.replace(/-/g, "")}-KL91`,
    modelYear: "2022",
    size: "54",
  };
}
