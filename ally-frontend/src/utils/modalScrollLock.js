// Utility to manage body scroll lock for nested modals
let modalCount = 0;

export const lockBodyScroll = () => {
  modalCount++;
  if (modalCount === 1) {
    // Only lock on first modal
    document.body.style.overflow = 'hidden';
  }
};

export const unlockBodyScroll = () => {
  modalCount = Math.max(0, modalCount - 1);
  if (modalCount === 0) {
    // Only unlock when all modals are closed
    document.body.style.overflow = 'unset';
  }
};

export const resetModalCount = () => {
  modalCount = 0;
  document.body.style.overflow = 'unset';
};

