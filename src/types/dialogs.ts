export type AlertDialogParams = {
  title: string;
  message: string;
  detail?: string;
  buttonText?: string;
};

export type ConfirmDialogParams = {
  title: string;
  message: string;
  detail?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonClass?: string;
};
