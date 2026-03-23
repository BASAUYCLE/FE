import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input, Select, Button, Upload, App, Alert } from "antd";
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
import { confirmCrud } from "../../utils/confirmCrud";
import { formatCurrency } from "../../utils/formatCurrency";
import systemConfigService from "../../services/systemConfigService";
import {
  POSTING_FEE_FALLBACK_VND,
  parsePostingFeeVnd,
  readCachedPostingFeeVnd,
  writeCachedPostingFeeVnd,
} from "../../constants/postingFee";
import "./index.css";

export default function PostBike() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit") || null;
  const { user } = useAuth();
  const { addPosting, getPostingById, updatePosting } = usePostings();
  const { addNotification } = useNotifications();
  const [sellerId, setSellerId] = useState(user?.userId ?? user?.id ?? null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [listingFeeVnd, setListingFeeVnd] = useState(POSTING_FEE_FALLBACK_VND);

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

  // Trạng thái nháp – BE chỉ có DRAFTED
  const [postStatus, setPostStatus] = useState(null);
  const [postStatusLoaded, setPostStatusLoaded] = useState(false);
  // Chuẩn hóa status: BE có thể trả "Draft" / "DRAFT" / "DRAFTED"
  const statusUpper = postStatus ? String(postStatus).toUpperCase() : "";
  const isDraftStatus = statusUpper === "DRAFTED" || statusUpper === "DRAFT";
  const isEditingDraft = editId && isDraftStatus;
  const canEditPost = isEditingDraft;
  const isEditingNonDraft = editId && postStatusLoaded && !canEditPost; // chỉ lock sau khi đã biết status
  // Disabled when viewing a non-draft post; NEW posts (!editId) are always editable
  const isFormReadOnly = !!isEditingNonDraft;

  // Default (fallback khi BE chưa có hoặc lỗi) – dữ liệu lấy từ BE sẽ ghi đè
  const DEFAULT_SIZE_OPTIONS = [
    "XS (42 - 47) / 147 - 155 cm",
    "S (48 - 52) / 155 - 165 cm",
    "M (53 - 55) / 165 - 175 cm",
    "L (56 - 58) / 175 - 183 cm",
    "XL (59 - 60) / 183 - 191 cm",
    "XXL (61 - 63) / 191 - 198 cm",
  ];
  const DEFAULT_REQUIRED_PHOTO_KEYS = [
    { key: "driveSide", label: "Drive Side", labelVi: "Bên phải" },
    { key: "nonDrive", label: "Non-Drive", labelVi: "Bên trái" },
    { key: "cockpit", label: "Cockpit", labelVi: "Tay lái" },
    { key: "drivetrain", label: "Drivetrain", labelVi: "Bộ đề" },
    { key: "frontBrake", label: "Front Brake", labelVi: "Phanh trước" },
    { key: "rearBrake", label: "Rear Brake", labelVi: "Phanh sau" },
  ];
  const IMAGE_TYPE_BY_SLOT = {
    driveSide: "OVERALL_DRIVE_SIDE",
    nonDrive: "OVERALL_NON_DRIVE_SIDE",
    cockpit: "COCKPIT_AREA",
    drivetrain: "DRIVETRAIN_CLOSEUP",
    frontBrake: "FRONT_BRAKE",
    rearBrake: "REAR_BRAKE",
  };
  const DEFAULT_GROUPSET_OPTIONS = [
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
  const DEFAULT_BRAKE_TYPE_OPTIONS = [
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

  const [sizeOptions, setSizeOptions] = useState(DEFAULT_SIZE_OPTIONS);
  const [requiredPhotoKeys, setRequiredPhotoKeys] = useState(
    DEFAULT_REQUIRED_PHOTO_KEYS,
  );
  const [groupsetOptions, setGroupsetOptions] = useState(
    DEFAULT_GROUPSET_OPTIONS,
  );
  const [brakeTypeOptions, setBrakeTypeOptions] = useState(
    DEFAULT_BRAKE_TYPE_OPTIONS,
  );
  const [requiredPhotos, setRequiredPhotos] = useState(() =>
    DEFAULT_REQUIRED_PHOTO_KEYS.reduce(
      (acc, { key }) => ({ ...acc, [key]: [] }),
      {},
    ),
  );
  /** Lưu File gốc theo slot để khi bấm Post luôn có file (tránh mất originFileObj từ Ant Design) */
  const [requiredPhotoFiles, setRequiredPhotoFiles] = useState(() =>
    DEFAULT_REQUIRED_PHOTO_KEYS.reduce(
      (acc, { key }) => ({ ...acc, [key]: null }),
      {},
    ),
  );
  const [requiredPhotoDataUrls, setRequiredPhotoDataUrls] = useState(() =>
    DEFAULT_REQUIRED_PHOTO_KEYS.reduce(
      (acc, { key }) => ({ ...acc, [key]: null }),
      {},
    ),
  );
  const [defectFiles, setDefectFiles] = useState([]);
  const [defectImageDataUrls, setDefectImageDataUrls] = useState([]);

  const filledEditIdRef = useRef(null);

  // Section IDs for scroll detection
  const sectionIds = [
    "basic-info",
    "technical-specs",
    "photos-videos",
    "pricing",
  ];

  // Phí đăng tin (cấu hình admin) — hiển thị cho member khi đăng bài
  useEffect(() => {
    let cancelled = false;
    systemConfigService
      .getByKey("POSTING_FEE")
      .then((res) => {
        if (!cancelled) {
          const fee = parsePostingFeeVnd(res);
          setListingFeeVnd(fee);
          writeCachedPostingFeeVnd(fee);
        }
      })
      .catch(() => {
        if (!cancelled) {
          const cached = readCachedPostingFeeVnd();
          setListingFeeVnd(cached ?? POSTING_FEE_FALLBACK_VND);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load dropdown data (brands, categories) + form metadata (sizes, photo categories, groupsets, brake types) từ BE
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setDropdownLoading(true);
        setDropdownError(null);
        const [brandsRes, categoriesRes] = await Promise.all([
          postService.getBrands(),
          postService.getCategories(),
          // BE chưa có /metadata/post-form endpoint - đã tắt call này để tránh 404 error
          // postService.getPostFormMetadata().catch((err) => {
          //   return null;
          // }),
        ]);
        // Use null for metadataRes since endpoint doesn't exist yet
        const metadataRes = null;

        if (cancelled) return;

        const brands = brandsRes?.data ?? brandsRes?.result ?? brandsRes;
        const categories =
          categoriesRes?.data ?? categoriesRes?.result ?? categoriesRes;
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
          brandList.map((b) => ({
            value: b.brandId ?? b.id,
            label: b.brandName ?? b.name,
          })),
        );
        setCategoryOptions(
          categoryList.map((c) => ({
            value: c.categoryId ?? c.id,
            label: c.categoryName ?? c.name,
          })),
        );

        // Metadata form Post: sizes, photo categories, groupsets, brake types (từ BE)
        const meta = metadataRes?.data ?? metadataRes?.result ?? metadataRes;
        if (meta && typeof meta === "object") {
          if (Array.isArray(meta.frameSizes) && meta.frameSizes.length > 0) {
            setSizeOptions(meta.frameSizes);
          }
          if (
            Array.isArray(meta.photoCategories) &&
            meta.photoCategories.length > 0
          ) {
            const merged = DEFAULT_REQUIRED_PHOTO_KEYS.map((def, i) => {
              const fromApi = meta.photoCategories[i];
              if (!fromApi) return def;
              return {
                key: def.key,
                label: fromApi.label ?? def.label,
                labelVi: fromApi.labelVi ?? def.labelVi,
              };
            });
            setRequiredPhotoKeys(merged);
          }
          if (Array.isArray(meta.groupsets) && meta.groupsets.length > 0) {
            const list = meta.groupsets
              .map((g) => ({
                label: g.label ?? g.groupName ?? "",
                options: Array.isArray(g.options)
                  ? g.options.map((o) => ({
                      value: o.value ?? o.id,
                      label: o.label ?? o.name ?? o.value,
                    }))
                  : [],
              }))
              .filter((g) => g.label || (g.options && g.options.length > 0));
            if (list.length > 0) setGroupsetOptions(list);
          }
          if (Array.isArray(meta.brakeTypes) && meta.brakeTypes.length > 0) {
            const list = meta.brakeTypes.map((b) => ({
              value: b.value ?? b.id ?? b.code,
              label: b.label ?? b.name ?? b.value,
            }));
            if (list.length > 0) setBrakeTypeOptions(list);
          }
        }
      } catch (err) {
        // Chỉ log error nếu không phải là metadata 404 (expected error)
        const isMetadata404 = err?.config?.url?.includes("/metadata/post-form");
        if (!isMetadata404) {
          console.error("[PostBike] Failed to load brands/categories:", err);
          const msg =
            err?.message || "Failed to load Brand/Category list from backend.";
          setDropdownError(msg);
          message.error(msg);
        }
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
    setSellerId(user?.userId ?? user?.id ?? null);
  }, [user?.userId, user?.id]);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return;
    if (sellerId) return;

    let cancelled = false;
    userService
      .getProfile()
      .then((profileRes) => {
        if (cancelled) return;
        const profile = profileRes?.result ?? profileRes?.data ?? profileRes;
        const id = profile?.userId ?? profile?.id ?? profile?.user_id;
        if (id != null) setSellerId(id);
      })
      .catch(() => {
        // Nếu token không hợp lệ, axios interceptor sẽ redirect về /login
      });

    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  // Chế độ chỉnh sửa: đọc ?edit=id, tải bài đăng và điền form
  useEffect(() => {
    if (!editId || filledEditIdRef.current === editId) return;

    const applyPosting = (posting) => {
      if (!posting) return;
      filledEditIdRef.current = editId;

      setBikeName(posting.bikeName ?? "");
      setFrameSize(posting.frameSize ?? "");
      setFrameMaterial(posting.frameMaterial ?? undefined);
      setGroupset(posting.groupset ?? undefined);
      setBrakeType(posting.brakeType ?? undefined);
      setColor(posting.color ?? "");
      setDescription(posting.description ?? "");
      setPrice(
        typeof posting.price === "number"
          ? String(posting.price)
          : (posting.priceDisplay?.replace(/\D/g, "") ?? posting.price ?? ""),
      );
      if (posting.modelYear != null) setModelYear(posting.modelYear);

      // Ưu tiên set trực tiếp từ id (không phụ thuộc options đã load)
      if (posting.brandId != null && posting.brandId !== undefined) {
        setBrandId(posting.brandId);
      } else {
        const brandOpt = brandOptions.find(
          (o) =>
            String(o.label).toLowerCase() ===
              String(posting.brand || "").toLowerCase() ||
            o.value === posting.brandId,
        );
        if (brandOpt) setBrandId(brandOpt.value);
      }

      if (posting.categoryId != null && posting.categoryId !== undefined) {
        setCategoryId(posting.categoryId);
      } else {
        const categoryOpt = categoryOptions.find(
          (o) =>
            String(o.label).toLowerCase() ===
              String(posting.category || "").toLowerCase() ||
            o.value === posting.categoryId,
        );
        if (categoryOpt) setCategoryId(categoryOpt.value);
      }

      // Ánh xạ ảnh theo slot (driveSide, nonDrive, cockpit, ...) nếu có slotImageMap;
      // fallback: dùng imageUrls theo thứ tự.
      const slotImageMap =
        posting.slotImageMap && typeof posting.slotImageMap === "object"
          ? posting.slotImageMap
          : null;

      if (slotImageMap) {
        const photoData = {};
        const fileListBySlot = {};
        requiredPhotoKeys.forEach(({ key }, i) => {
          const url = slotImageMap[key] ?? null;
          photoData[key] = url;
          fileListBySlot[key] = url
            ? [
                {
                  uid: `edit-${key}-${i}`,
                  url,
                  status: "done",
                  name: `Ảnh ${key}`,
                },
              ]
            : [];
        });
        setRequiredPhotoDataUrls(photoData);
        setRequiredPhotos(fileListBySlot);
      } else {
        const urls = posting.imageUrls?.length
          ? posting.imageUrls
          : posting.imageUrl
            ? [posting.imageUrl]
            : [];
        const photoDataUrls = requiredPhotoKeys.reduce((acc, { key }, i) => {
          acc[key] = urls[i] ?? null;
          return acc;
        }, {});
        setRequiredPhotoDataUrls(photoDataUrls);
        const fileListBySlot = requiredPhotoKeys.reduce((acc, { key }, i) => {
          acc[key] = urls[i]
            ? [
                {
                  uid: `edit-${key}-${i}`,
                  url: urls[i],
                  status: "done",
                  name: `Ảnh ${key}`,
                },
              ]
            : [];
          return acc;
        }, {});
        setRequiredPhotos(fileListBySlot);
      }

      // Ảnh lỗi (DEFECT_POINT)
      if (Array.isArray(posting.defectImageUrls)) {
        setDefectImageDataUrls(posting.defectImageUrls);
        const defectList = posting.defectImageUrls.map((url, idx) => ({
          uid: `edit-defect-${idx}`,
          url,
          status: "done",
          name: `Defect ${idx + 1}`,
        }));
        setDefectFiles(defectList);
      }
    };

    // editId từ URL là string ("6"), id trong context có thể là number (6) → thử cả hai
    let posting = getPostingById(Number(editId)) ?? getPostingById(editId);
    if (posting) {
      const ctxStatus = posting.postStatus ?? posting.status ?? null;
      const normalized =
        ctxStatus != null ? String(ctxStatus).toUpperCase() : "";
      setPostStatus(normalized === "DRAFT" ? "DRAFTED" : normalized || null);
      setPostStatusLoaded(true);
      applyPosting(posting);
      return;
    }

    let cancelled = false;
    postService
      .getPostById(editId)
      .then((res) => {
        if (cancelled) return;
        const raw = res?.result ?? res;
        if (!raw) return;
        const images = raw.images ?? [];
        const slotImageMap = {};
        const defectImageUrls = [];
        const imageUrls = [];
        images.forEach((img) => {
          const url = img?.imageUrl ?? img?.image_url;
          if (!url) return;
          const type = (img?.imageType ?? img?.image_type ?? "")
            .toString()
            .toUpperCase();
          switch (type) {
            case "OVERALL_DRIVE_SIDE":
              slotImageMap.driveSide = slotImageMap.driveSide ?? url;
              break;
            case "OVERALL_NON_DRIVE_SIDE":
              slotImageMap.nonDrive = slotImageMap.nonDrive ?? url;
              break;
            case "COCKPIT_AREA":
              slotImageMap.cockpit = slotImageMap.cockpit ?? url;
              break;
            case "DRIVETRAIN_CLOSEUP":
              slotImageMap.drivetrain = slotImageMap.drivetrain ?? url;
              break;
            case "FRONT_BRAKE":
              slotImageMap.frontBrake = slotImageMap.frontBrake ?? url;
              break;
            case "REAR_BRAKE":
              slotImageMap.rearBrake = slotImageMap.rearBrake ?? url;
              break;
            case "DEFECT_POINT":
              defectImageUrls.push(url);
              break;
            default:
              imageUrls.push(url);
          }
        });
        const primaryUrls = requiredPhotoKeys
          .map(({ key }) => slotImageMap[key])
          .filter(Boolean);
        const allImageUrls = [...primaryUrls, ...imageUrls, ...defectImageUrls];

        const status = raw.postStatus ?? raw.post_status ?? raw.status;
        const normalized = status != null ? String(status).toUpperCase() : "";
        setPostStatus(normalized === "DRAFT" ? "DRAFTED" : normalized || null);
        setPostStatusLoaded(true);

        applyPosting({
          bikeName: raw.bicycleName ?? raw.bicycle_name,
          brand: raw.brandName ?? raw.brand_name,
          brandId: raw.brandId ?? raw.brand_id,
          category: raw.categoryName ?? raw.category_name,
          categoryId: raw.categoryId ?? raw.category_id,
          frameSize: raw.size ?? raw.frameSize ?? "",
          frameMaterial: raw.frameMaterial ?? raw.frame_material,
          groupset: raw.groupset ?? undefined,
          brakeType: raw.brakeType ?? raw.brake_type ?? undefined,
          modelYear: raw.modelYear ?? raw.model_year ?? undefined,
          color: raw.bicycleColor ?? raw.bicycle_color ?? raw.color ?? "",
          description:
            raw.bicycleDescription ??
            raw.bicycle_description ??
            raw.description ??
            "",
          price: raw.price,
          imageUrl: primaryUrls[0] ?? allImageUrls[0] ?? null,
          imageUrls: allImageUrls,
          slotImageMap,
          defectImageUrls,
        });
      })
      .catch((err) => {
        if (!cancelled)
          message.error(err?.message ?? "Failed to load listing details.");
      });

    return () => {
      cancelled = true;
    };
  }, [editId, getPostingById, brandOptions, categoryOptions, message]);

  // Check section completion and update completedSections
  const allRequiredPhotosFilled = requiredPhotoKeys.every(
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

  /* Cách làm giống Register: beforeUpload return false, set fileList thủ công (không customRequest) */
  const beforeUploadRequired = (slotKey, file) => {
    if (!file?.type?.startsWith("image/")) {
      message.error("Only image files are allowed.");
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Ảnh phải nhỏ hơn 5MB.");
      return Upload.LIST_IGNORE;
    }
    setRequiredPhotos((prev) => ({
      ...prev,
      [slotKey]: [
        {
          uid: file.uid ?? `${slotKey}-${Date.now()}`,
          name: file.name,
          status: "done",
          url: URL.createObjectURL(file),
          originFileObj: file,
        },
      ],
    }));
    setRequiredPhotoFiles((prev) => ({ ...prev, [slotKey]: file }));
    readFileAsDataUrl({ originFileObj: file }, (dataUrl) => {
      setRequiredPhotoDataUrls((prev) => ({ ...prev, [slotKey]: dataUrl }));
    });
    return false;
  };

  const handleRemoveRequired = (slotKey) => {
    setRequiredPhotos((prev) => ({ ...prev, [slotKey]: [] }));
    setRequiredPhotoFiles((prev) => ({ ...prev, [slotKey]: null }));
    setRequiredPhotoDataUrls((prev) => ({ ...prev, [slotKey]: null }));
  };

  const createRequiredUploadProps = (slotKey) => ({
    name: "file",
    maxCount: 1,
    listType: "picture-card",
    fileList: requiredPhotos[slotKey] || [],
    accept: "image/*",
    beforeUpload: (file) => beforeUploadRequired(slotKey, file),
    onRemove: () => handleRemoveRequired(slotKey),
    showUploadList: { showPreviewIcon: true, showRemoveIcon: true },
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
    const requiredPhotoUrls = requiredPhotoKeys.reduce((acc, { key }) => {
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

  const handleSaveDraft = async () => {
    if (!bikeName.trim()) {
      message.warning("Please enter bike name to save draft.");
      return;
    }

    // sellerId bắt buộc cho cả tạo mới và cập nhật (BE dùng để xác thực owner)
    const effectiveSellerId = sellerId ?? user?.userId ?? user?.id;
    const sellerIdNum =
      effectiveSellerId != null ? Number(effectiveSellerId) : NaN;
    if (!Number.isFinite(sellerIdNum) || sellerIdNum < 1) {
      message.warning("Could not identify account. Please sign in again.");
      return;
    }

    if (editId && postStatusLoaded && !canEditPost) {
      message.warning(
        "You can only update a listing in draft status. This listing is not in draft.",
      );
      return;
    }

    const key = "save-draft";
    message.loading({
      content: editId ? "Updating draft..." : "Saving draft...",
      key,
      duration: 0,
    });

    try {
      const sanitizeVnd = (raw) => {
        const digits = String(raw ?? "").replace(/[^\d]/g, "");
        if (!digits) return null;
        const n = Number(digits);
        return Number.isFinite(n) ? n : null;
      };

      const vnd = price.trim() ? sanitizeVnd(price) : null;

      const draftPayload = {
        sellerId: sellerIdNum,
        brandId: brandId != null && brandId !== "" ? Number(brandId) : null,
        categoryId:
          categoryId != null && categoryId !== "" ? Number(categoryId) : null,
        bicycleName: bikeName.trim(),
        bicycleColor: color.trim() || null,
        price: vnd,
        bicycleDescription: description.trim() || null,
        groupset: groupset ? String(groupset).trim() : null,
        frameMaterial: frameMaterial ? String(frameMaterial).trim() : null,
        brakeType: brakeType ? String(brakeType).trim() : null,
        size: frameSize ? String(frameSize).trim() : null,
        modelYear:
          modelYear != null && modelYear !== "" ? Number(modelYear) : null,
      };

      let postId = editId ? Number(editId) : null;

      if (editId) {
        const postIdForApi = Number(editId);
        if (!Number.isFinite(postIdForApi) || postIdForApi < 1) {
          message.error({ content: "Invalid listing ID.", key });
          return;
        }
        await postService.updatePost(postIdForApi, draftPayload);
        postId = postIdForApi;
      } else {
        // Tạo bản nháp mới khi chưa có editId
        const created = await postService.createDraftPost(draftPayload);
        postId =
          created?.result?.postId ??
          created?.result?.id ??
          created?.postId ??
          created?.data?.postId ??
          created?.data?.id ??
          created?.id ??
          null;

        if (postId == null) {
          throw new Error("Failed to create draft (no postId returned).");
        }
        postId = Number(postId) || postId;
      }

      // Upload images if any exist (optional for draft)
      const getFileFromAntdList = (fileList) => {
        const first = fileList?.[0];
        if (!first) return null;
        return first.originFileObj ?? (first instanceof File ? first : null);
      };

      const hasNewFiles = requiredPhotoKeys.some(
        ({ key: slotKey }) =>
          requiredPhotoFiles[slotKey] instanceof File ||
          getFileFromAntdList(requiredPhotos[slotKey]),
      );

      if (postId && hasNewFiles) {
        try {
          await Promise.all(
            requiredPhotoKeys.map(({ key: slotKey }) => {
              const imageFile =
                requiredPhotoFiles[slotKey] instanceof File
                  ? requiredPhotoFiles[slotKey]
                  : getFileFromAntdList(requiredPhotos[slotKey]);
              if (!imageFile) return Promise.resolve();
              const isThumbnail = slotKey === "driveSide";
              return postService.uploadPostImage({
                postId,
                imageFile,
                imageType: IMAGE_TYPE_BY_SLOT[slotKey],
                isThumbnail: isThumbnail,
              });
            }),
          );

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
        } catch (imgErr) {
          // Tiếp tục lưu nháp ngay cả khi upload ảnh lỗi
        }
      }

      addPosting(buildPayload(), POSTING_STATUS.DRAFTED, sellerId);
      addNotification({
        title: "Draft saved",
        message: "Draft has been saved. You can continue editing later.",
        type: "info",
        status: "Draft",
      });

      message.success({
        content: editId
          ? "Draft updated successfully!"
          : "Draft saved successfully!",
        key,
      });
      if (!editId) {
        navigate("/manage-listings");
      }
      if (editId) {
        setPostStatus(POSTING_STATUS.DRAFTED);
        setPostStatusLoaded(true);
      }
    } catch (error) {
      console.error("[SaveDraft] Error:", error);
      const status = error?.status ?? error?.response?.status;
      const code = error?.data?.code ?? error?.data?.result?.code;
      const msg = error?.message ?? error?.data?.message ?? error?.data?.msg;
      const isStatusError =
        status === 400 &&
        (code === 1020 ||
          /current status|cannot update|trạng thái/i.test(String(msg)));
      const content = isStatusError
        ? "You can only update a listing in draft status. This one may have been submitted or already posted."
        : msg || "Save draft failed. Please try again.";
      message.error({ content, key });
    }
  };

  const handlePublish = async () => {
    if (editId && postStatusLoaded && !canEditPost) {
      message.warning("You can only edit a listing in draft status.");
      return;
    }

    // Validate all required fields for publishing
    const validationErrors = [];

    if (!bikeName.trim() || !brandId || !categoryId || !price.trim()) {
      validationErrors.push("Basic info: Bike name, Brand, Category, Price");
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
      validationErrors.push(
        "Specs: Size, Material, Groupset, Brake, Year, Color, Description",
      );
    }
    if (!allRequiredPhotosFilled) {
      validationErrors.push("Required photos: All 6 slots");
    }
    if (!sellerId) {
      message.error("Could not get account info. Please sign in again.");
      return;
    }

    if (validationErrors.length > 0) {
      message.warning(`Please fill in:\n${validationErrors.join("\n")}`);
      return;
    }

    const publishTitle = isEditingDraft
      ? "Submit listing for review?"
      : editId
        ? "Update listing?"
        : "Post listing to Marketplace?";
    const feeHint =
      !editId || isEditingDraft
        ? ` Listing fee (current setting): ${formatCurrency(listingFeeVnd)} — will be deducted from your wallet when the fee applies.`
        : "";
    const publishContent = isEditingDraft
      ? `Your listing will move to pending review. You will not be able to edit until there is a decision.${feeHint}`
      : editId
        ? `Your listing details will be updated in the system.${feeHint}`
        : `Your listing will be created and published to the system.${feeHint}`;
    const confirmed = await confirmCrud({
      title: publishTitle,
      content: publishContent,
      okText: "Continue",
    });
    if (!confirmed) return;

    const key = "post-bike";
    message.loading({
      content: isEditingDraft
        ? "Submitting draft..."
        : editId
          ? "Updating..."
          : "Posting...",
      key,
      duration: 0,
    });

    try {
      // Sanitize and validate price
      const sanitizeVnd = (raw) => {
        const digits = String(raw ?? "").replace(/[^\d]/g, "");
        if (!digits) return null;
        const n = Number(digits);
        return Number.isFinite(n) ? n : null;
      };

      const vnd = sanitizeVnd(price);
      if (vnd == null) {
        message.warning({
          content: "Invalid price. Please enter a number.",
          key,
        });
        return;
      }

      // Create unified payload (same format for all cases)
      const payload = {
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

      // Helper to extract file from Antd list (item có thể chứa originFileObj)
      const getFileFromAntdList = (fileList) => {
        const first = fileList?.[0];
        if (!first) return null;
        return first.originFileObj ?? (first instanceof File ? first : null);
      };
      // Lấy File cho slot: ưu tiên requiredPhotoFiles, fallback fileList (đã lưu originFileObj)
      const getRequiredPhotoFile = (slotKey) =>
        requiredPhotoFiles[slotKey] instanceof File
          ? requiredPhotoFiles[slotKey]
          : getFileFromAntdList(requiredPhotos[slotKey]);

      // Khi đăng bài mới: kiểm tra đủ 6 file trước khi tạo post (tránh tạo xong mới lỗi upload)
      if (!editId) {
        const missing = requiredPhotoKeys.filter(
          ({ key: slotKey }) => !getRequiredPhotoFile(slotKey),
        );
        if (missing.length > 0) {
          message.warning({
            content: `Photos not ready (${missing.map((m) => m.label || m.key).join(", ")}). Please select images for each slot and try again.`,
            key,
          });
          return;
        }
      }

      let postId = editId ? Number(editId) : null;
      let imageUploadFailed = false;
      let lastImageErrorMsg = null;

      const setImageError = (imgErr) => {
        imageUploadFailed = true;
        const body = imgErr?.response?.data ?? imgErr?.data;
        lastImageErrorMsg =
          body?.message ?? body?.msg ?? body?.error ?? imgErr?.message ?? null;
      };

      // CASE 1: Submitting a draft
      if (isEditingDraft && editId) {
        postId = Number(editId);

        // Step 1: Upload images before submission
        try {
          const hasNewFiles = requiredPhotoKeys.some(({ key: slotKey }) =>
            getRequiredPhotoFile(slotKey),
          );

          if (hasNewFiles) {
            await Promise.all(
              requiredPhotoKeys.map(({ key: slotKey }) => {
                const raw = getRequiredPhotoFile(slotKey);
                const imageFile = raw?.originFileObj ?? raw;
                if (
                  !imageFile ||
                  !(imageFile instanceof File || imageFile instanceof Blob)
                )
                  return Promise.resolve();
                return postService.uploadPostImage({
                  postId,
                  imageFile,
                  imageType: IMAGE_TYPE_BY_SLOT[slotKey],
                  isThumbnail: slotKey === "driveSide",
                });
              }),
            );
          }

          if (defectFiles?.length > 0) {
            await Promise.all(
              defectFiles
                .map((f) => f?.originFileObj ?? f)
                .filter(
                  (file) =>
                    file && (file instanceof File || file instanceof Blob),
                )
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
        } catch (imgErr) {
          setImageError(imgErr);
        }

        // Step 2: Update draft with latest data, then submit for review
        // Order: Update content → Change status from DRAFTED to PENDING
        await postService.updatePost(editId, payload);
        await postService.submitDraft(editId);
      }
      // CASE 2: Creating new post
      else if (!editId) {
        const created = await postService.createPost(payload);
        const rawPostId =
          created?.result?.postId ??
          created?.result?.id ??
          created?.postId ??
          created?.data?.postId ??
          created?.data?.id ??
          created?.data?.post?.id ??
          created?.id ??
          null;

        if (rawPostId == null) {
          console.error("[Publish] createPost response (no postId):", created);
          throw new Error("Failed to create listing (no postId returned).");
        }
        postId = Number(rawPostId);
        if (!Number.isFinite(postId) || postId < 1) {
          console.error(
            "[Publish] createPost returned invalid postId:",
            rawPostId,
            created,
          );
          throw new Error("Failed to create listing (invalid postId).");
        }
        if (typeof console?.debug === "function") {
          console.debug("[Publish] createPost OK, postId:", postId);
        }

        // Upload images for new post: chờ BE commit post (tránh 404 "Not Found")
        if (postId > 0) {
          try {
            await new Promise((r) => setTimeout(r, 600));
            const uploadOne = async (slotKey, imageFile, isThumbnail) => {
              const file = imageFile?.originFileObj ?? imageFile;
              if (!file || !(file instanceof File || file instanceof Blob))
                return null;
              try {
                return await postService.uploadPostImage({
                  postId,
                  imageFile: file,
                  imageType: IMAGE_TYPE_BY_SLOT[slotKey] || "DEFECT_POINT",
                  isThumbnail,
                });
              } catch (e) {
                const status = e?.status ?? e?.response?.status;
                const isTimeout = /timeout|ETIMEDOUT/i.test(e?.message ?? "");
                if (status === 404 || isTimeout) {
                  await new Promise((r) =>
                    setTimeout(r, isTimeout ? 1500 : 500),
                  );
                  return postService.uploadPostImage({
                    postId,
                    imageFile: file,
                    imageType: IMAGE_TYPE_BY_SLOT[slotKey] || "DEFECT_POINT",
                    isThumbnail,
                  });
                }
                throw e;
              }
            };
            for (const { key: slotKey } of requiredPhotoKeys) {
              const imageFile = getRequiredPhotoFile(slotKey);
              if (!imageFile) continue;
              await uploadOne(slotKey, imageFile, slotKey === "driveSide");
            }
            for (const f of defectFiles) {
              const imageFile = f?.originFileObj ?? f;
              if (!imageFile) continue;
              await uploadOne("defect", imageFile, false);
            }
          } catch (imgErr) {
            setImageError(imgErr);
          }
        }
      }
      // CASE 3: Updating existing post
      else {
        await postService.updatePost(editId, payload);

        // Upload images for updated post
        try {
          const hasNewFiles = requiredPhotoKeys.some(({ key: slotKey }) =>
            getRequiredPhotoFile(slotKey),
          );

          if (hasNewFiles) {
            await Promise.all(
              requiredPhotoKeys.map(({ key: slotKey }) => {
                const raw = getRequiredPhotoFile(slotKey);
                const imageFile = raw?.originFileObj ?? raw;
                if (
                  !imageFile ||
                  !(imageFile instanceof File || imageFile instanceof Blob)
                )
                  return Promise.resolve();
                return postService.uploadPostImage({
                  postId,
                  imageFile,
                  imageType: IMAGE_TYPE_BY_SLOT[slotKey],
                  isThumbnail: slotKey === "driveSide",
                });
              }),
            );
          }

          if (defectFiles?.length > 0) {
            await Promise.all(
              defectFiles
                .map((f) => f?.originFileObj ?? f)
                .filter(
                  (file) =>
                    file && (file instanceof File || file instanceof Blob),
                )
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
        } catch (imgErr) {
          setImageError(imgErr);
        }
      }

      // Fetch updated post data
      const fullRes = await postService.getPostById(postId);
      const full = fullRes?.result ?? fullRes;
      const images = full?.images ?? [];

      const slotImageMap = {};
      const defectImageUrls = [];
      const extraImageUrls = [];
      images.forEach((img) => {
        const url = img?.imageUrl ?? img?.image_url;
        if (!url) return;
        const type = (img?.imageType ?? img?.image_type ?? "")
          .toString()
          .toUpperCase();
        switch (type) {
          case "OVERALL_DRIVE_SIDE":
            slotImageMap.driveSide = slotImageMap.driveSide ?? url;
            break;
          case "OVERALL_NON_DRIVE_SIDE":
            slotImageMap.nonDrive = slotImageMap.nonDrive ?? url;
            break;
          case "COCKPIT_AREA":
            slotImageMap.cockpit = slotImageMap.cockpit ?? url;
            break;
          case "DRIVETRAIN_CLOSEUP":
            slotImageMap.drivetrain = slotImageMap.drivetrain ?? url;
            break;
          case "FRONT_BRAKE":
            slotImageMap.frontBrake = slotImageMap.frontBrake ?? url;
            break;
          case "REAR_BRAKE":
            slotImageMap.rearBrake = slotImageMap.rearBrake ?? url;
            break;
          case "DEFECT_POINT":
            defectImageUrls.push(url);
            break;
          default:
            extraImageUrls.push(url);
        }
      });
      const primaryUrls = requiredPhotoKeys
        .map(({ key }) => slotImageMap[key])
        .filter(Boolean);
      const imageUrls = [...primaryUrls, ...extraImageUrls, ...defectImageUrls];
      const thumbnail =
        images.find((i) => i?.isThumbnail)?.imageUrl ??
        primaryUrls[0] ??
        imageUrls[0] ??
        null;

      // Update context
      if (editId) {
        updatePosting(Number(editId), {
          ...buildPayload(),
          imageUrl: thumbnail,
          imageUrls,
          slotImageMap,
          defectImageUrls,
          priceDisplay: `${vnd.toLocaleString("vi-VN")} ₫`,
          backendPostId: postId,
          postStatus: full?.postStatus ?? POSTING_STATUS.PENDING,
        });
      } else {
        addPosting(
          {
            ...buildPayload(),
            imageUrl: thumbnail,
            imageUrls,
            slotImageMap,
            defectImageUrls,
            priceDisplay: `${vnd.toLocaleString("vi-VN")} ₫`,
            backendPostId: postId,
            postStatus: full?.postStatus ?? POSTING_STATUS.PENDING,
          },
          POSTING_STATUS.PENDING_REVIEW,
          sellerId,
        );
      }

      // Show success notification
      addNotification({
        title: isEditingDraft
          ? "Draft submitted"
          : editId
            ? "Updated"
            : "Listing posted",
        message: isEditingDraft
          ? "Draft has been submitted for review. Awaiting admin approval."
          : editId
            ? "Listing has been updated."
            : "Listing is pending approval. It will show when approved.",
        type: "success",
        status: editId ? "Updated" : "Pending",
      });

      if (imageUploadFailed) {
        const detail =
          lastImageErrorMsg && String(lastImageErrorMsg).trim()
            ? ` Chi tiết: ${lastImageErrorMsg}`
            : "";
        message.warning({
          content: `Listing ${isEditingDraft ? "submitted" : editId ? "updated" : "created"} (ID: ${postId}) but images could not be uploaded. You can edit later.${detail}`,
          key,
          duration: 6,
        });
      } else {
        message.success({
          content: `${isEditingDraft ? "Draft submitted" : editId ? "Updated" : "Posted"} successfully!`,
          key,
        });
      }

      navigate("/manage-listings");
    } catch (err) {
      const fromBackend =
        err?.data?.message ??
        err?.data?.msg ??
        err?.data?.error ??
        (err?.data?.result && typeof err.data.result === "object"
          ? (err.data.result.message ?? err.data.result.msg)
          : null);
      let msg =
        typeof fromBackend === "string"
          ? fromBackend
          : err?.message ||
            (isEditingDraft
              ? "Submit for review failed. Please try again."
              : editId
                ? "Update failed."
                : "Post failed. Please try again.");
      if (/uncategorized error|unknown error|something went wrong/i.test(msg)) {
        msg = isEditingDraft
          ? "Submit for review failed. Check listing details or try again later."
          : "An error occurred. Please try again or contact support.";
      }
      message.error({ content: msg, key, duration: 3 });
    }
  };

  return (
    <div className="post-bike-container">
      <Header />

      <main className="post-main-content">
        <div className="post-content-container">
          {/* Page Header */}
          <div className="post-header">
            <h1 className="post-title">Post a Bike for Sale</h1>
            <p className="post-subtitle"></p>
          </div>

          {!isFormReadOnly && (
            <Alert
              className="post-listing-fee-alert"
              type="info"
              showIcon
              message="Listing fee (member)"
              description={
                <>
                  When your listing is published or goes live, the system may
                  deduct <strong>{formatCurrency(listingFeeVnd)}</strong> from
                  your wallet (per admin configuration, synced with the admin
                  panel). Please ensure you have enough balance or add funds
                  before posting.
                </>
              }
            />
          )}

          {/* Step Progress */}
          <StepProgress
            currentStep={currentStep}
            completedSections={completedSections}
            onStepClick={handleStepClick}
          />

          {/* Warning for non-draft (non-DRAFTED) posts */}
          {isEditingNonDraft && (
            <div
              style={{
                padding: "16px",
                margin: "20px 0",
                background: "#fff7e6",
                border: "1px solid #ffd591",
                borderRadius: "8px",
                color: "#ad6800",
              }}
            >
              <InfoCircleOutlined style={{ marginRight: "8px" }} />
              <strong>Read-only listing:</strong> You can only edit a listing in
              draft status. This listing cannot be edited.
            </div>
          )}

          {/* Info when editing draft (DRAFTED) */}
          {isEditingDraft && (
            <div
              style={{
                padding: "16px",
                margin: "20px 0",
                background: "#e6f7ff",
                border: "1px solid #91d5ff",
                borderRadius: "8px",
                color: "#0050b3",
              }}
            >
              <InfoCircleOutlined style={{ marginRight: "8px" }} />
              <strong>Editing draft:</strong> You can update the details and
              submit for review when ready.
            </div>
          )}

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
                  <label className="field-label">
                    Bike Name / Listing Title
                  </label>
                  <Input
                    placeholder="e.g. 2023 Specialized Tarmac SL7 Pro"
                    size="large"
                    className="field-input"
                    value={bikeName}
                    onChange={(e) => setBikeName(e.target.value)}
                    disabled={isFormReadOnly}
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
                      disabled={isFormReadOnly}
                      notFoundContent={
                        dropdownError
                          ? dropdownError
                          : "No brands in DB (seed Brands table)."
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
                      disabled={isFormReadOnly}
                      notFoundContent={
                        dropdownError
                          ? dropdownError
                          : "No categories in DB (seed Categories table)."
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
                      options={sizeOptions.map((s) => ({ value: s, label: s }))}
                      disabled={isFormReadOnly}
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
                      disabled={isFormReadOnly}
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
                      disabled={isFormReadOnly}
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
                      disabled={isFormReadOnly}
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
                      disabled={isFormReadOnly}
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
                      disabled={isFormReadOnly}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">Description</label>
                  <Input.TextArea
                    placeholder="Describe condition, history, accessories, reason for selling..."
                    size="large"
                    className="field-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    showCount
                    maxLength={2000}
                    disabled={isFormReadOnly}
                  />
                </div>
              </div>
            </div>

            {/* Photos & Videos - style giống Register */}
            <div
              id="photos-videos"
              className="form-section post-upload-section"
            >
              <h3 className="post-upload-title">Required bike photos</h3>
              <p className="post-upload-subtitle">
                Upload 6 images from the following angles (required)
              </p>

              <div className="required-photos-grid">
                {requiredPhotoKeys.map(({ key, label, labelVi }) => (
                  <div key={key} className="required-photo-slot">
                    <div className="required-photo-label">
                      {label} ({labelVi})
                    </div>
                    <Upload
                      {...createRequiredUploadProps(key)}
                      className="required-photo-upload register-style-upload"
                    >
                      {(requiredPhotos[key]?.length || 0) < 1 && (
                        <div className="upload-content">
                          <UploadOutlined />
                          <div className="upload-text">{label}</div>
                        </div>
                      )}
                    </Upload>
                  </div>
                ))}
              </div>

              <div className="defect-section">
                <h3 className="post-upload-title defect-title">
                  Describe the issue (optional)
                </h3>
                <p className="post-upload-subtitle">
                  Up to 5 images – Show any scratches or damage (if any)
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
                      <div className="upload-text">Add photo</div>
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
                    disabled={isFormReadOnly}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions - sibling of post-form-container for correct layout */}
          <div className="form-actions">
            <Button
              size="large"
              className="action-btn-draft"
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleSaveDraft}
              disabled={isFormReadOnly}
            >
              {isEditingDraft ? "Update Draft" : "Save Draft"}
            </Button>

            <div className="action-btn-group">
              <Button
                type="primary"
                size="large"
                className="action-btn-publish"
                onClick={handlePublish}
                disabled={isFormReadOnly}
              >
                {isEditingDraft ? "Submit for review" : "Post listing"}
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
