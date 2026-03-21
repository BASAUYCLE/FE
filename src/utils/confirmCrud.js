import { useCallback } from "react";
import { Modal, App } from "antd";

function runConfirm(confirmFn, options) {
  const {
    title,
    content,
    okText = "Xác nhận",
    cancelText = "Hủy",
    danger = false,
  } = options;
  return new Promise((resolve) => {
    confirmFn({
      title,
      content,
      okText,
      cancelText,
      okButtonProps: danger ? { danger: true } : undefined,
      centered: true,
      maskClosable: true,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

/**
 * Dùng trong component là con của `<App>` (antd) — modal đúng lớp / theme (khuyến nghị cho admin).
 */
export function useConfirmCrud() {
  const { modal } = App.useApp();
  return useCallback(
    (opts) => runConfirm((props) => modal.confirm(props), opts),
    [modal],
  );
}

/**
 * Modal.confirm tĩnh — giữ tương thích các màn không dùng hook.
 */
export function confirmCrud(options) {
  return runConfirm(Modal.confirm, options);
}
