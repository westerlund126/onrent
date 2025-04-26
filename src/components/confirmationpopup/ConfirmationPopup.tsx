interface ConfirmationPopupProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6">
        <p className="mb-6 text-center">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            className="rounded bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};
