import { useCallback } from "react";
import { Modal, App } from "antd";

function runConfirm(confirmFn, options) {
  const {
    title,
    content,
    okText = "Confirm",
    cancelText = "Cancel",
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

/** Use inside components wrapped by `<App>` (antd) so modals use the correct layer/theme. */
export function useConfirmCrud() {
  const { modal } = App.useApp();
  return useCallback(
    (opts) => runConfirm((props) => modal.confirm(props), opts),
    [modal],
  );
}

/** Static `Modal.confirm` for screens that do not use the hook. */
export function confirmCrud(options) {
  return runConfirm(Modal.confirm, options);
}
