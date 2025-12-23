import React, { useState } from "react";

const EditDialog = ({
  isOpen,
  title,
  label,
  initialValue,
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState(initialValue || "");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!value.trim()) {
      setError("لا يمكن ترك الحقل فارغاً");
      return;
    }
    if (value === initialValue) {
      setError("الاسم الجديد يجب أن يكون مختلفاً");
      return;
    }
    onConfirm(value.trim());
    setValue("");
    setError("");
  };

  const handleCancel = () => {
    setValue(initialValue || "");
    setError("");
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4 animate-fade-in">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            placeholder={initialValue}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            تحديث
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDialog;
