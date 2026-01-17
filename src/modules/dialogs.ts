import { t } from '../i18n';
import type { AlertDialogParams, ConfirmDialogParams } from '../types/dialogs';

export async function alertDialog({
  title,
  message,
  detail,
}: AlertDialogParams): Promise<void> {
  return new Promise((resolve) => {
    const dialog =
      document.querySelector<HTMLDialogElement>('#alert-dialog')!;
    const titleEl = dialog.querySelector<HTMLHeadingElement>('h3')!;
    const messageEl =
      dialog.querySelector<HTMLParagraphElement>('.dialog-text')!;
    const detailEl = dialog.querySelector<HTMLParagraphElement>(
      '.dialog-description'
    )!;
    const okButton =
      dialog.querySelector<HTMLButtonElement>('#alert-ok-button')!;

    titleEl.innerHTML = title;

    messageEl.textContent = message;
    if (detail) {
      detailEl.innerHTML = detail;
      detailEl.style.display = 'block';
    } else {
      detailEl.style.display = 'none';
    }

    function onOk() {
      dialog.close();
      okButton.removeEventListener('click', onOk);
      resolve();
    }

    okButton.textContent = t('accept');
    okButton.addEventListener('click', onOk);

    dialog.showModal();
  });
}

export async function confirmDialog({
  title,
  message,
  detail,
  confirmButtonText = t('yes'),
  cancelButtonText = t('no'),
  confirmButtonClass
}: ConfirmDialogParams): Promise<boolean> {
  return new Promise((resolve) => {
    const dialog =
      document.querySelector<HTMLDialogElement>('#confirm-dialog')!;
    const titleEl = dialog.querySelector<HTMLHeadingElement>('h3')!;
    const messageEl =
      dialog.querySelector<HTMLParagraphElement>('.dialog-text')!;
    const detailEl = dialog.querySelector<HTMLParagraphElement>(
      '.dialog-description'
    )!;
    const confirmButton = dialog.querySelector<HTMLButtonElement>(
      '#confirm-yes-button'
    )!;
    const cancelButton =
      dialog.querySelector<HTMLButtonElement>('#confirm-no-button')!;

    titleEl.innerHTML = title;

    messageEl.textContent = message;
    if (detail) {
      detailEl.innerHTML = detail;
      detailEl.style.display = 'block';
    } else {
      detailEl.style.display = 'none';
    }

    function cleanUp(result: boolean) {
      confirmButton.removeEventListener('click', onConfirm);
      cancelButton.removeEventListener('click', onCancel);
      resolve(result);
    }

    function onConfirm() {
      dialog.close();
      cleanUp(true);
    }

    function onCancel() {
      dialog.close();
      cleanUp(false);
    }

    confirmButton.textContent = confirmButtonText;
    if (confirmButtonClass) {
      confirmButton.classList.add(confirmButtonClass);
    }
    cancelButton.textContent = cancelButtonText;
    confirmButton.addEventListener('click', onConfirm);
    cancelButton.addEventListener('click', onCancel);

    dialog.showModal();
  });
}
