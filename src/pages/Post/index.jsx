import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, Input, Select, Button, Upload, message } from "antd";
import {
  InfoCircleOutlined,
  SettingOutlined,
  CreditCardOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Header from "../../components/header";
import Footer from "../../components/footer";
import StepProgress from "../../components/StepProgress";
import { usePostings } from "../../contexts/PostingContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/useNotifications";
import { postService, userService } from "../../services";
import { POSTING_STATUS } from "../../constants/postingStatus";
import { STORAGE_KEYS } from "../../constants/storageKeys";
import "./index.css";

export default function PostBike() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPosting } = usePostings();
  const { addNotification } = useNotifications();
  const [sellerId, setSellerId] = useState(user?.userId ?? null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);

  // Form field states
  const [bikeName, setBikeName] = useState("");
  const [brandId, setBrandId] = useState(undefined);
  const [categoryId, setCategoryId] = useState(undefined);
  const [frameSize, setFrameSize] = useState("");
  const [frameMaterial, setFrameMaterial] = useState(undefined);
  const [groupset, setGroupset] = useState(undefined);
  const [brakeType, setBrakeType] = useState(undefined);
  const [modelYear, setModelYear] = useState(undefined);
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [brandOptions, setBrandOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [dropdownError, setDropdownError] = useState(null);

  const SIZE_OPTIONS = [
    "XS (42 - 47) / 147 - 155 cm",
    "S (48 - 52) / 155 - 165 cm",
    "M (53 - 55) / 165 - 175 cm",
    "L (56 - 58) / 175 - 183 cm",
    "XL (59 - 60) / 183 - 191 cm",
    "XXL (61 - 63) / 191 - 198 cm",
  ];

  // Required photos: 6 slots by category (Backend)
  const REQUIRED_PHOTO_KEYS = [
    { key: "driveSide", label: "Drive Side", labelVi: "Bên phải" },
    { key: "nonDrive", label: "Non-Drive", labelVi: "Bên trái" },
    { key: "cockpit", label: "Cockpit", labelVi: "Tay lái" },
    { key: "drivetrain", label: "Drivetrain", labelVi: "Bộ đề" },
    { key: "frontBrake", label: "Front Brake", labelVi: "Phanh trước" },
    { key: "rearBrake", label: "Rear Brake", labelVi: "Phanh sau" },
  ];

  const groupsetOptions = [
    {
      label: "Shimano Road (Phổ biến nhất cho Giant, Merida, Trek)",
      options: [
        {
          value: "Shimano 105",
          label: "Shimano 105 (Chuẩn mực cho Giant/Merida)",
        },
        {
          value: "Shimano Ultegra",
          label: "Shimano Ultegra (Phổ biến trên Trek/Specialized)",
        },
        {
          value: "Shimano Dura-Ace",
          label: "Shimano Dura-Ace (Dòng cao cấp nhất)",
        },
        { value: "Shimano Tiagra", label: "Shimano Tiagra (Dòng tầm trung)" },
        { value: "Shimano Sora", label: "Shimano Sora (Dòng giá rẻ)" },
      ],
    },
    {
      label: "SRAM (Thường gặp trên Specialized, Trek đời mới)",
      options: [
        {
          value: "SRAM Red eTap AXS",
          label: "SRAM Red eTap AXS (Cao cấp Specialized S-Works)",
        },
        { value: "SRAM Force eTap AXS", label: "SRAM Force eTap AXS" },
        { value: "SRAM Rival", label: "SRAM Rival" },
      ],
    },
    {
      label: "Campagnolo (Đặc thù cho Pinarello)",
      options: [
        {
          value: "Campagnolo Super Record",
          label: "Campagnolo Super Record (Chuẩn bài cho Pinarello)",
        },
        { value: "Campagnolo Chorus", label: "Campagnolo Chorus" },
        { value: "Campagnolo Record", label: "Campagnolo Record" },
      ],
    },
    {
      label: "Shimano MTB (Cho dòng địa hình Giant, Trek, Merida)",
      options: [
        {
          value: "Shimano Deore XT",
          label: "Shimano Deore XT (Huyền thoại MTB)",
        },
        { value: "Shimano Deore", label: "Shimano Deore" },
        { value: "Shimano Alivio", label: "Shimano Alivio" },
      ],
    },
  ];

  const brakeTypeOptions = [
    {
      value: "Rim Brake",
      label: "Phanh vành (Phổ biến Giant/Merida đời cũ, Pinarello)",
    },
    {
      value: "Disc Brake (Hydraulic)",
      label: "Phanh đĩa dầu (Tiêu chuẩn mới cho Trek/Specialized/Giant)",
    },
    {
      value: "Disc Brake (Mechanical)",
      label: "Phanh đĩa cơ (Xe Giant/Merida giá rẻ)",
    },
    { value: "V-Brake", label: "Phanh V (Xe City/MTB đời cũ)" },
  ];
  const [requiredPhotos, setRequiredPhotos] = useState(() =>
    REQUIRED_PHOTO_KEYS.reduce((acc, { key }) => ({ ...acc, [key]: [] }), {}),
  );
  const [requiredPhotoDataUrls, setRequiredPhotoDataUrls] = useState(() =>
    REQUIRED_PHOTO_KEYS.reduce((acc, { key }) => ({ ...acc, [key]: null }), {}),
  );
  const [defectFiles, setDefectFiles] = useState([]);
  const [defectImageDataUrls, setDefectImageDataUrls] = useState([]);

  // Section IDs for scroll detection
  const sectionIds = [
    "basic-info",
    "technical-specs",
    "photos-videos",
    "pricing",
  ];

  // Load dropdown data + ensure we have sellerId (userId)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setDropdownLoading(true);
        setDropdownError(null);
        const [brands, categories] = await Promise.all([
          postService.getBrands(),
          postService.getCategories(),
        ]);

        if (cancelled) return;

        const brandList = Array.isArray(brands)
          ? brands
          : Array.isArray(brands?.result)
            ? brands.result
            : [];
        const categoryList = Array.isArray(categories)
          ? categories
          : Array.isArray(categories?.result)
            ? categories.result
            : [];

        setBrandOptions(
          brandList.map((b) => ({ value: b.brandId, label: b.brandName })),
        );
        setCategoryOptions(
          categoryList.map((c) => ({
            value: c.categoryId,
            label: c.categoryName,
          })),
        );
      } catch (err) {
        console.error("[PostBike] Failed to load brands/categories:", err);
        const msg =
          err?.message ||
          "Không load được danh sách Brand/Category từ backend.";
        setDropdownError(msg);
        message.error(msg);
      } finally {
        if (!cancelled) setDropdownLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSellerId(user?.userId ?? null);
  }, [user?.userId]);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return;
    if (sellerId) return;

    let cancelled = false;
    userService
      .getProfile()
      .then((profile) => {
        if (!cancelled) setSellerId(profile?.userId ?? null);
      })
      .catch(() => {
        // Nếu token không hợp lệ, axios interceptor sẽ redirect về /login
      });

    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  // Check section completion and update completedSections
  const allRequiredPhotosFilled = REQUIRED_PHOTO_KEYS.every(
    ({ key }) => requiredPhotos[key]?.length > 0,
  );
  useEffect(() => {
    const completed = [];

    // Basic Info: bikeName + brand + biketype
    if (bikeName.trim() && brandId && categoryId) {
      completed.push(0);
    }

    // Technical Specs: frameSize + frameMaterial + groupset + brakeType + modelYear + color + description
    if (
      frameSize.trim() &&
      frameMaterial &&
      groupset &&
      brakeType &&
      modelYear &&
      color.trim() &&
      description.trim()
    ) {
      completed.push(1);
    }

    // Photos: all 6 required slots filled
    if (allRequiredPhotosFilled) {
      completed.push(2);
    }

    // Pricing: price entered
    if (price.trim()) {
      completed.push(3);
    }

    setCompletedSections(completed);
  }, [
    bikeName,
    brandId,
    categoryId,
    frameSize,
    frameMaterial,
    groupset,
    brakeType,
    modelYear,
    color,
    description,
    allRequiredPhotosFilled,
    price,
  ]);

  // Scroll detection
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sectionIds.indexOf(entry.target.id);
          if (index !== -1) setCurrentStep(index);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    // Observe all sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Handle step click navigation
  const handleStepClick = (stepIndex) => {
    const sectionId = sectionIds[stepIndex];
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -100; // Offset for header
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const readFileAsDataUrl = (file, callback) => {
    if (!file?.originFileObj?.type?.startsWith("image/")) {
      callback(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file.originFileObj);
  };

  const createRequiredUploadProps = (slotKey) => ({
    name: "file",
    maxCount: 1,
    listType: "picture-card",
    fileList: requiredPhotos[slotKey] || [],
    accept: "image/*",
    customRequest({ onSuccess }) {
      setTimeout(() => onSuccess({ url: "" }), 0);
    },
    onChange(info) {
      const { status } = info.file;
      if (status === "done" || status === "uploading") {
        setRequiredPhotos((prev) => ({ ...prev, [slotKey]: info.fileList }));
        const file = info.fileList[0];
        if (file) {
          readFileAsDataUrl(file, (dataUrl) => {
            setRequiredPhotoDataUrls((prev) => ({
              ...prev,
              [slotKey]: dataUrl,
            }));
          });
        } else {
          setRequiredPhotoDataUrls((prev) => ({ ...prev, [slotKey]: null }));
        }
      } else if (status === "removed") {
        setRequiredPhotos((prev) => ({ ...prev, [slotKey]: [] }));
        setRequiredPhotoDataUrls((prev) => ({ ...prev, [slotKey]: null }));
      } else if (status === "error") {
        message.error(`${info.file.name} upload failed.`);
      }
    },
  });

  const readDefectFilesAsDataUrls = (fileList) => {
    const imageFiles = fileList
      .map((f) => f.originFileObj)
      .filter((file) => file?.type?.startsWith("image/"));
    if (imageFiles.length === 0) {
      setDefectImageDataUrls([]);
      return;
    }
    let loaded = 0;
    const results = [];
    imageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        results[index] = reader.result;
        loaded += 1;
        if (loaded === imageFiles.length) {
          setDefectImageDataUrls(results.filter(Boolean));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const defectUploadProps = {
    name: "file",
    multiple: true,
    maxCount: 5,
    listType: "picture-card",
    fileList: defectFiles,
    accept: "image/*",
    customRequest({ onSuccess }) {
      setTimeout(() => onSuccess({ url: "" }), 0);
    },
    onChange(info) {
      const { status } = info.file;
      if (
        status === "done" ||
        (status === "uploading" && info.fileList.length > 0)
      ) {
        setDefectFiles(info.fileList);
        readDefectFilesAsDataUrls(info.fileList);
      } else if (status === "removed") {
        setDefectFiles(info.fileList);
        if (info.fileList.length === 0) setDefectImageDataUrls([]);
        else readDefectFilesAsDataUrls(info.fileList);
      } else if (status === "error") {
        message.error(`${info.file.name} upload failed.`);
      }
    },
  };

  const buildPayload = () => {
    const requiredPhotoUrls = REQUIRED_PHOTO_KEYS.reduce((acc, { key }) => {
      acc[key] = requiredPhotoDataUrls[key] ?? null;
      return acc;
    }, {});
    const primaryImage =
      requiredPhotoDataUrls.driveSide ??
      requiredPhotoDataUrls.nonDrive ??
      requiredPhotoDataUrls.cockpit ??
      null;
    return {
      bikeName: bikeName.trim() || "Untitled Listing",
      brandId,
      categoryId,
      frameSize,
      frameMaterial,
      groupset,
      brakeType,
      modelYear,
      color: color.trim() || null,
      description: description.trim() || null,
      price: price.trim(),
      imageUrl: primaryImage,
      imageUrls: Object.values(requiredPhotoDataUrls).filter(Boolean),
      requiredPhotos: requiredPhotoUrls,
      defectPhotos: defectImageDataUrls.length > 0 ? defectImageDataUrls : null,
    };
  };

  const handleSaveDraft = () => {
    if (!allRequiredPhotosFilled) {
      message.warning(
        "Please upload all 6 required photos (Drive Side, Non-Drive, Cockpit, Drivetrain, Front Brake, Rear Brake) before saving.",
      );
      return;
    }
    addPosting(buildPayload(), POSTING_STATUS.DRAFT, sellerId);
    addNotification({
      title: "Đã lưu bản nháp",
      message: "Tin đăng đã lưu. Xem tại Quản lý tin đăng.",
      type: "info",
      status: "Bản nháp",
    });
    message.success("Bản nháp đã lưu. Xem tại Quản lý tin đăng.");
    navigate("/manage-listings");
  };

  const handlePublish = () => {
    if (!bikeName.trim() || !brandId || !categoryId || !price.trim()) {
      message.warning("Please fill in basic info and price.");
      return;
    }
    if (
      !frameSize.trim() ||
      !frameMaterial ||
      !groupset ||
      !brakeType ||
      !modelYear ||
      !color.trim() ||
      !description.trim()
    ) {
      message.warning(
        "Please fill in all Technical Specifications (Frame Size, Material, Groupset, Brake Type, Model Year, Color, Description).",
      );
      return;
    }
    if (!allRequiredPhotosFilled) {
      message.warning(
        "Please upload all 6 required photos (Drive Side, Non-Drive, Cockpit, Drivetrain, Front Brake, Rear Brake) before publishing.",
      );
      return;
    }
    if (!sellerId) {
      message.error(
        "Không lấy được thông tin tài khoản (userId). Vui lòng đăng nhập lại.",
      );
      return;
    }

    const IMAGE_TYPE_BY_SLOT = {
      driveSide: "OVERALL_DRIVE_SIDE",
      nonDrive: "OVERALL_NON_DRIVE_SIDE",
      cockpit: "COCKPIT_AREA",
      drivetrain: "DRIVETRAIN_CLOSEUP",
      frontBrake: "FRONT_BRAKE",
      rearBrake: "REAR_BRAKE",
    };

    const sanitizeVnd = (raw) => {
      const digits = String(raw ?? "").replace(/[^\d]/g, "");
      if (!digits) return null;
      const n = Number(digits);
      return Number.isFinite(n) ? n : null;
    };

    const getFileFromAntdList = (fileList) =>
      fileList?.[0]?.originFileObj ?? null;

    const run = async () => {
      const key = "post-bike";
      message.loading({ content: "Đang đăng tin...", key, duration: 0 });

      try {
        const vnd = sanitizeVnd(price);
        if (vnd == null) {
          message.warning({
            content: "Giá bán không hợp lệ. Vui lòng nhập số (VNĐ).",
            key,
          });
          return;
        }

        const createReq = {
          sellerId: Number(sellerId),
          brandId: Number(brandId),
          categoryId: Number(categoryId),
          bicycleName: bikeName.trim(),
          bicycleColor: color.trim(),
          price: vnd,
          bicycleDescription: description.trim(),
          groupset: String(groupset).trim(),
          frameMaterial: String(frameMaterial).trim(),
          brakeType: String(brakeType).trim(),
          size: String(frameSize).trim(),
          modelYear: Number(modelYear),
        };

        const created = await postService.createPost(createReq);
        const postId = created?.postId;
        if (!postId) {
          throw new Error("Tạo bài đăng thất bại (không nhận được postId).");
        }

        // Upload required images
        await Promise.all(
          REQUIRED_PHOTO_KEYS.map(({ key: slotKey }) => {
            const imageFile = getFileFromAntdList(requiredPhotos[slotKey]);
            if (!imageFile) {
              throw new Error(`Thiếu ảnh bắt buộc: ${slotKey}`);
            }
            return postService.uploadPostImage({
              postId,
              imageFile,
              imageType: IMAGE_TYPE_BY_SLOT[slotKey],
              isThumbnail: slotKey === "driveSide",
            });
          }),
        );

        // Upload defect images (optional)
        if (defectFiles?.length > 0) {
          await Promise.all(
            defectFiles
              .map((f) => f?.originFileObj)
              .filter(Boolean)
              .map((imageFile) =>
                postService.uploadPostImage({
                  postId,
                  imageFile,
                  imageType: "DEFECT_POINT",
                  isThumbnail: false,
                }),
              ),
          );
        }

        const full = await postService.getPostById(postId);
        const imageUrls = (full?.images ?? [])
          .map((i) => i?.imageUrl)
          .filter(Boolean);
        const thumbnail =
          (full?.images ?? []).find((i) => i?.isThumbnail)?.imageUrl ??
          imageUrls[0] ??
          null;

        addPosting(
          {
            ...buildPayload(),
            imageUrl: thumbnail,
            imageUrls,
            priceDisplay: `${vnd.toLocaleString("vi-VN")} ₫`,
            backendPostId: postId,
            postStatus: full?.postStatus ?? "PENDING",
          },
          POSTING_STATUS.PENDING_REVIEW,
          sellerId,
        );

        addNotification({
          title: "Tin đăng đã gửi",
          message: "Tin đang chờ duyệt. Sẽ hiển thị khi được phê duyệt.",
          type: "success",
          status: "Chờ duyệt",
        });

        message.success({ content: "Đăng tin thành công.", key, duration: 2 });
        navigate("/manage-listings");
      } catch (err) {
        const msg = err?.message || "Đăng tin thất bại. Vui lòng thử lại.";
        message.error({ content: msg, key, duration: 3 });
      }
    };

    run();
  };

  return (
    <div className="post-bike-container">
      <Header />

      <main className="post-main-content">
        {/* Breadcrumb */}
        <Breadcrumb
          className="post-breadcrumb"
          separator=">"
          items={[{ title: "Marketplace" }, { title: "Sell Your Bike" }]}
        />

        {/* Page Header */}
        <div className="post-header">
          <h1 className="post-title">Post a Bike for Sale</h1>
          <p className="post-subtitle">
            Reach over 50,000 cycling enthusiasts worldwide
          </p>
        </div>

        {/* Step Progress */}
        <StepProgress
          currentStep={currentStep}
          completedSections={completedSections}
          onStepClick={handleStepClick}
        />

        {/* Form Container */}
        <div className="post-form-container">
          {/* Basic Information */}
          <div id="basic-info" className="form-section">
            <div className="section-content">
              <div className="section-title-row">
                <InfoCircleOutlined className="section-icon-teal" />
                <h2 className="section-title">Basic Information</h2>
              </div>

              <div className="form-field">
                <label className="field-label">Bike Name / Listing Title</label>
                <Input
                  placeholder="e.g. 2023 Specialized Tarmac SL7 Pro"
                  size="large"
                  className="field-input"
                  value={bikeName}
                  onChange={(e) => setBikeName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">Brand</label>
                  <Select
                    placeholder="Select Brand"
                    size="large"
                    className="field-select"
                    value={brandId}
                    onChange={(value) => setBrandId(value)}
                    options={brandOptions}
                    loading={dropdownLoading}
                    notFoundContent={
                      dropdownError
                        ? dropdownError
                        : "Chưa có Brand trong DB (hãy seed bảng Brands)."
                    }
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Category</label>
                  <Select
                    placeholder="Select Category"
                    size="large"
                    className="field-select"
                    value={categoryId}
                    onChange={(value) => setCategoryId(value)}
                    options={categoryOptions}
                    loading={dropdownLoading}
                    notFoundContent={
                      dropdownError
                        ? dropdownError
                        : "Chưa có Category trong DB (hãy seed bảng Categories)."
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div id="technical-specs" className="form-section">
            <div className="section-content">
              <div className="section-title-row">
                <SettingOutlined className="section-icon-teal" />
                <h2 className="section-title">Technical Specifications</h2>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">Frame Size</label>
                  <Select
                    placeholder="Select Size"
                    size="large"
                    className="field-select"
                    value={frameSize || undefined}
                    onChange={(value) => setFrameSize(value)}
                    options={SIZE_OPTIONS.map((s) => ({ value: s, label: s }))}
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Frame Material</label>
                  <Select
                    placeholder="Select Material"
                    size="large"
                    className="field-select"
                    value={frameMaterial}
                    onChange={(value) => setFrameMaterial(value)}
                    options={[
                      { value: "Carbon Fiber", label: "Carbon Fiber" },
                      { value: "Aluminum", label: "Aluminum" },
                      { value: "Steel", label: "Steel" },
                      { value: "Titanium", label: "Titanium" },
                    ]}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">Groupset</label>
                  <Select
                    placeholder="Select Groupset"
                    size="large"
                    className="field-select"
                    value={groupset}
                    onChange={(value) => setGroupset(value)}
                    options={groupsetOptions}
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Brake Type</label>
                  <Select
                    placeholder="Select Brake Type"
                    size="large"
                    className="field-select"
                    value={brakeType}
                    onChange={(value) => setBrakeType(value)}
                    options={brakeTypeOptions}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">Model Year</label>
                  <Select
                    placeholder="Select Year"
                    size="large"
                    className="field-select"
                    value={modelYear}
                    onChange={(value) => setModelYear(value)}
                    options={Array.from({ length: 15 }, (_, i) => {
                      const year = 2025 - i;
                      return { value: String(year), label: String(year) };
                    })}
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Color</label>
                  <Input
                    placeholder="e.g. Black/Red"
                    size="large"
                    className="field-input"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Description</label>
                <Input.TextArea
                  placeholder="Mô tả chi tiết về tình trạng xe, lịch sử sử dụng, phụ kiện đi kèm, lý do bán..."
                  size="large"
                  className="field-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  showCount
                  maxLength={2000}
                />
              </div>
            </div>
          </div>

          {/* Photos & Videos - style giống Register */}
          <div id="photos-videos" className="form-section post-upload-section">
            <h3 className="post-upload-title">Ảnh xe bắt buộc</h3>
            <p className="post-upload-subtitle">
              Tải lên 6 ảnh theo các góc dưới đây (bắt buộc)
            </p>

            <div className="required-photos-grid">
              {REQUIRED_PHOTO_KEYS.map(({ key, label, labelVi }) => (
                <div key={key} className="required-photo-slot">
                  <Upload
                    {...createRequiredUploadProps(key)}
                    className="required-photo-upload"
                    showUploadList={{
                      showPreviewIcon: true,
                      showRemoveIcon: true,
                    }}
                  >
                    {(requiredPhotos[key]?.length || 0) < 1 && (
                      <div className="upload-content">
                        <UploadOutlined />
                        <div className="upload-text">
                          {label} ({labelVi})
                        </div>
                      </div>
                    )}
                  </Upload>
                </div>
              ))}
            </div>

            <div className="defect-section">
              <h3 className="post-upload-title defect-title">
                Điểm lỗi (tùy chọn)
              </h3>
              <p className="post-upload-subtitle">
                Tối đa 5 ảnh - Chụp các vết trầy, hư hỏng nếu có.
              </p>
              <div className="defect-upload-row">
                <Upload
                  {...defectUploadProps}
                  className="defect-upload"
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                  }}
                >
                  <div className="upload-content">
                    <UploadOutlined />
                    <div className="upload-text">Thêm ảnh</div>
                  </div>
                </Upload>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div id="pricing" className="form-section">
            <div className="section-content">
              <div className="section-title-row">
                <CreditCardOutlined className="section-icon-teal" />
                <h2 className="section-title">Pricing</h2>
              </div>

              <div className="form-field price-field">
                <label className="field-label">Sale Price (VND)</label>
                <Input
                  placeholder="0.00"
                  size="large"
                  className="field-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Button
              size="large"
              className="action-btn-draft"
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleSaveDraft}
            >
              Save as Draft
            </Button>

            <div className="action-btn-group">
              <Button
                type="primary"
                size="large"
                className="action-btn-publish"
                onClick={handlePublish}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer
        exploreLinks={[
          { label: "Featured Road Bikes", href: "#" },
          { label: "New MTB Arrivals", href: "#" },
          { label: "Certified Pre-owned", href: "#" },
          { label: "Popular Categories", href: "#" },
        ]}
        supportLinks={[
          { label: "Help Center", href: "#" },
          { label: "Safety Guidelines", href: "#" },
          { label: "Listing Fees", href: "#" },
          { label: "Contact Us", href: "#" },
        ]}
      />
    </div>
  );
}
