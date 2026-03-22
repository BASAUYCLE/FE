import { Form, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  normUploadFileList,
  beforeUploadReceiptImage,
} from "../../utils/returnShippingReceiptUpload";

export default function ReturnShippingReceiptFormItem() {
  return (
    <Form.Item
      name="shippingReceipt"
      label="Ảnh biên lai / chứng minh (tuỳ chọn)"
      valuePropName="fileList"
      getValueFromEvent={normUploadFileList}
      extra="PNG, JPG — tối đa 5MB. Ảnh sẽ được tải lên và lưu dưới dạng liên kết."
    >
      <Upload
        listType="picture-card"
        maxCount={1}
        beforeUpload={beforeUploadReceiptImage}
        accept="image/*"
      >
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Tải ảnh</div>
        </div>
      </Upload>
    </Form.Item>
  );
}
