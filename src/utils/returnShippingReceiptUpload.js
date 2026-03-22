import { message, Upload } from "antd";
import userService from "../services/userService";

/** BE trả body đã qua axios interceptor (response.data) */
export function parseUploadImageUrl(body) {
  if (body == null) return null;
  if (typeof body === "string") return body;
  const inner = body.result ?? body.data ?? body;
  if (typeof inner === "string") return inner;
  return inner?.url ?? inner?.imageUrl ?? inner?.image_url ?? null;
}

export function normUploadFileList(e) {
  if (Array.isArray(e)) return e;
  return e?.fileList ?? [];
}

export function beforeUploadReceiptImage(file) {
  if (!file?.type?.startsWith("image/")) {
    message.error("Chỉ được tải file ảnh.");
    return Upload.LIST_IGNORE;
  }
  if (file.size / 1024 / 1024 >= 5) {
    message.error("Ảnh phải nhỏ hơn 5MB.");
    return Upload.LIST_IGNORE;
  }
  return false;
}

/** @param {import('antd').UploadFile[] | undefined} fileList */
export async function resolveShippingReceiptUrl(fileList) {
  const file = fileList?.[0]?.originFileObj;
  if (file instanceof File) {
    const res = await userService.uploadAvatar(file);
    const url = parseUploadImageUrl(res);
    if (!url) throw new Error("Không nhận được URL sau khi upload ảnh.");
    return url;
  }
  return undefined;
}
