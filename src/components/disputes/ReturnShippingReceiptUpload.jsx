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
      label="Receipt / proof image (optional)"
      valuePropName="fileList"
      getValueFromEvent={normUploadFileList}
      extra="PNG, JPG - max 5MB. The image will be uploaded and stored as a URL."
    >
      <Upload
        listType="picture-card"
        maxCount={1}
        beforeUpload={beforeUploadReceiptImage}
        accept="image/*"
      >
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload image</div>
        </div>
      </Upload>
    </Form.Item>
  );
}
