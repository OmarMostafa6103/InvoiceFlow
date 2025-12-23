import { useContext, useState } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../translations/translations";
import ConfirmDialog from "./ConfirmDialog";
import EditDialog from "./EditDialog";

function InvoiceForm({
  invoiceData,
  setInvoiceData,
  selectedFolder,
  zone,
  newZone,
  setNewZone,
  newAgent,
  setNewAgent,
  agent,
  setAgent,
  customerType,
  setCustomerType,
  showAddZone,
  setShowAddZone,
  showAddAgent,
  setShowAddAgent,
  getZonesForFolder,
  getAgentsForZone,
  handleZoneChange,
  addZone,
  addAgent,
  editZone,
  deleteZone,
  editAgent,
  deleteAgent,
}) {
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  // Dialogs state
  const [editDialog, setEditDialog] = useState({
    isOpen: false,
    type: "",
    item: "",
    value: "",
    callback: null,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: "",
    item: "",
    callback: null,
  });

  // Custom dropdown state
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showCustomerTypeDropdown, setShowCustomerTypeDropdown] =
    useState(false);
  const [newCustomerType, setNewCustomerType] = useState("");
  const [customerTypes, setCustomerTypes] = useState(() => {
    const saved = localStorage.getItem("customerTypes");
    return saved ? JSON.parse(saved) : [];
  });

  // Add new customer type
  const addCustomerType = () => {
    if (!newCustomerType.trim()) return;
    if (customerTypes.includes(newCustomerType.trim())) return;
    const updated = [...customerTypes, newCustomerType.trim()];
    setCustomerTypes(updated);
    localStorage.setItem("customerTypes", JSON.stringify(updated));
    setNewCustomerType("");
  };

  // Edit customer type
  const editCustomerType = (oldName, newName) => {
    if (!newName.trim() || newName === oldName) return;
    if (customerTypes.includes(newName.trim())) return;
    const updated = customerTypes.map((ct) =>
      ct === oldName ? newName.trim() : ct
    );
    setCustomerTypes(updated);
    localStorage.setItem("customerTypes", JSON.stringify(updated));
    if (customerType === oldName) setCustomerType(newName.trim());
  };

  // Delete customer type
  const deleteCustomerType = (name) => {
    const updated = customerTypes.filter((ct) => ct !== name);
    setCustomerTypes(updated);
    localStorage.setItem("customerTypes", JSON.stringify(updated));
    if (customerType === name) setCustomerType("");
  };

  const handleInputChange = (field, value) => {
    setInvoiceData({ ...invoiceData, [field]: value });
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = invoiceData.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setInvoiceData({ ...invoiceData, items: updatedItems });
  };

  const addItem = () => {
    const newId =
      invoiceData.items.length > 0
        ? Math.max(...invoiceData.items.map((i) => i.id)) + 1
        : 1;
    const newItem = {
      id: newId,
      description: "",
      quantity: 1,
      originalPrice: "",
      discountedPrice: "",
    };
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, newItem],
    });
  };

  const removeItem = (id) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData({
        ...invoiceData,
        items: invoiceData.items.filter((item) => item.id !== id),
      });
    }
  };

  return (
    <form className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">{t.invoice}</h2>

      {/* Zone Selection */}
      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 space-y-3">
        {/* Zone Input */}
        <div>
          <label className="block text-sm font-semibold text-blue-900 mb-2">
            {language === "ar" ? "المنطقة" : "Zone"}
          </label>
          {!showAddZone ? (
            <div className="space-y-2 relative">
              <div className="flex gap-2 items-center">
                {/* Custom Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setShowZoneDropdown(!showZoneDropdown)}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between"
                >
                  <span>
                    {zone ||
                      (language === "ar" ? "اختر منطقة" : "Select a zone")}
                  </span>
                  <span>{showZoneDropdown ? "▲" : "▼"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddZone(true)}
                  className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap text-sm"
                >
                  {language === "ar" ? "إضافة" : "Add"}
                </button>
              </div>

              {/* Custom Dropdown Menu */}
              {showZoneDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-blue-300 rounded-lg shadow-lg z-10">
                  {getZonesForFolder(selectedFolder).length === 0 ? (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      {language === "ar" ? "لا توجد مناطق" : "No zones"}
                    </div>
                  ) : (
                    getZonesForFolder(selectedFolder).map((z) => (
                      <div
                        key={z}
                        className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 group"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            handleZoneChange(z);
                            setShowZoneDropdown(false);
                          }}
                          className="flex-1 text-left py-1 rounded hover:bg-blue-100 px-2"
                        >
                          {z}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditDialog({
                              isOpen: true,
                              type: "editZone",
                              item: z,
                              value: z,
                              callback: (newName) => {
                                if (newName && newName !== z) {
                                  editZone(z, newName);
                                }
                              },
                            });
                          }}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {language === "ar" ? "تعديل" : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDialog({
                              isOpen: true,
                              type: "deleteZone",
                              item: z,
                              callback: () => {
                                deleteZone(z);
                                setShowZoneDropdown(false);
                              },
                            });
                          }}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {language === "ar" ? "حذف" : "Delete"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  language === "ar" ? "اسم المنطقة الجديدة" : "New zone name"
                }
                value={newZone}
                onChange={(e) => setNewZone(e.target.value)}
                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addZone}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddZone(false);
                  setNewZone("");
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors whitespace-nowrap"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Agent Input */}
        <div>
          <label className="block text-sm font-semibold text-blue-900 mb-2">
            {language === "ar" ? "المندوب" : "Agent"}
          </label>
          {!showAddAgent ? (
            <div className="space-y-2 relative">
              <div className="flex gap-2 items-center">
                {/* Custom Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                  disabled={!zone}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400 text-left flex items-center justify-between disabled:cursor-not-allowed"
                >
                  <span>
                    {agent ||
                      (language === "ar" ? "اختر مندوب" : "Select an agent")}
                  </span>
                  <span>{showAgentDropdown ? "▲" : "▼"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddAgent(true)}
                  disabled={!zone}
                  className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                >
                  {language === "ar" ? "إضافة" : "Add"}
                </button>
              </div>

              {/* Custom Dropdown Menu */}
              {showAgentDropdown && zone && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-blue-300 rounded-lg shadow-lg z-10">
                  {getAgentsForZone(selectedFolder, zone).length === 0 ? (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      {language === "ar" ? "لا توجد مناديب" : "No agents"}
                    </div>
                  ) : (
                    getAgentsForZone(selectedFolder, zone).map((a) => (
                      <div
                        key={a}
                        className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 group"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setAgent(a);
                            setShowAgentDropdown(false);
                          }}
                          className="flex-1 text-left py-1 rounded hover:bg-blue-100 px-2"
                        >
                          {a}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditDialog({
                              isOpen: true,
                              type: "editAgent",
                              item: a,
                              value: a,
                              callback: (newName) => {
                                if (newName && newName !== a) {
                                  editAgent(a, newName);
                                }
                              },
                            });
                          }}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {language === "ar" ? "تعديل" : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDialog({
                              isOpen: true,
                              type: "deleteAgent",
                              item: a,
                              callback: () => {
                                deleteAgent(a);
                                setShowAgentDropdown(false);
                              },
                            });
                          }}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {language === "ar" ? "حذف" : "Delete"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  language === "ar" ? "اسم المندوب الجديد" : "New agent name"
                }
                value={newAgent}
                onChange={(e) => setNewAgent(e.target.value)}
                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addAgent}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddAgent(false);
                  setNewAgent("");
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors whitespace-nowrap"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Customer Type Selection */}
        <div className="relative">
          <label className="block text-sm font-semibold text-blue-900 mb-2">
            {language === "ar" ? "نوع العميل" : "Customer Type"}
          </label>
          <div className="space-y-2 relative">
            <div className="flex gap-2 items-center">
              {/* Custom Dropdown Button */}
              <button
                type="button"
                onClick={() =>
                  setShowCustomerTypeDropdown(!showCustomerTypeDropdown)
                }
                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between"
              >
                <span>
                  {customerType ||
                    (language === "ar"
                      ? "اختر نوع عميل"
                      : "Select customer type")}
                </span>
                <span>{showCustomerTypeDropdown ? "▲" : "▼"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCustomerTypeDropdown(false)}
                className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm whitespace-nowrap hidden"
              />
            </div>

            {/* Input for new customer type */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  language === "ar"
                    ? "أدخل نوع عميل جديد"
                    : "Enter new customer type"
                }
                value={newCustomerType}
                onChange={(e) => setNewCustomerType(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addCustomerType();
                  }
                }}
                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addCustomerType}
                className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap text-sm"
              >
                {language === "ar" ? "إضافة" : "Add"}
              </button>
            </div>

            {/* Custom Dropdown Menu */}
            {showCustomerTypeDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-blue-300 rounded-lg shadow-lg z-10">
                {customerTypes.length === 0 ? (
                  <div className="px-3 py-2 text-gray-500 text-sm">
                    {language === "ar"
                      ? "لا توجد أنواع عملاء"
                      : "No customer types"}
                  </div>
                ) : (
                  customerTypes.map((ct) => (
                    <div
                      key={ct}
                      className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 group"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerType(ct);
                          setShowCustomerTypeDropdown(false);
                        }}
                        className="flex-1 text-left py-1 rounded hover:bg-blue-100 px-2"
                      >
                        {ct}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditDialog({
                            isOpen: true,
                            type: "editCustomerType",
                            item: ct,
                            value: ct,
                            callback: (newName) => {
                              if (newName && newName !== ct) {
                                editCustomerType(ct, newName);
                              }
                            },
                          });
                        }}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {language === "ar" ? "تعديل" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            type: "deleteCustomerType",
                            item: ct,
                            callback: () => {
                              deleteCustomerType(ct);
                              setShowCustomerTypeDropdown(false);
                            },
                          });
                        }}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {language === "ar" ? "حذف" : "Delete"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Info Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.customerName}
        </label>
        <input
          type="text"
          value={invoiceData.customerName}
          onChange={(e) => handleInputChange("customerName", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.customerPhone}
        </label>
        <input
          type="tel"
          value={invoiceData.customerPhone}
          onChange={(e) => handleInputChange("customerPhone", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.deliveryAddress}
        </label>
        <textarea
          value={invoiceData.deliveryAddress}
          onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.orderNumber}
        </label>
        <input
          type="text"
          value={invoiceData.orderNumber}
          onChange={(e) => handleInputChange("orderNumber", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mt-6 pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.items}</h3>
        <div className="space-y-4">
          {invoiceData.items.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.description}
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(item.id, "description", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.quantity}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "quantity",
                        e.target.value === ""
                          ? ""
                          : Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    onBlur={(e) =>
                      handleItemChange(
                        item.id,
                        "quantity",
                        e.target.value === ""
                          ? 1
                          : Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ar" ? "السعر الأصلي" : "Original Price"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.originalPrice}
                    placeholder="0.00"
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "originalPrice",
                        e.target.value === ""
                          ? ""
                          : Math.max(0, parseFloat(e.target.value) || 0)
                      )
                    }
                    onBlur={(e) =>
                      handleItemChange(
                        item.id,
                        "originalPrice",
                        e.target.value === ""
                          ? 0
                          : Math.max(0, parseFloat(e.target.value) || 0)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ar" ? "السعر بعد الخصم" : "Discounted"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discountedPrice}
                    placeholder="0.00"
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        "discountedPrice",
                        e.target.value === ""
                          ? ""
                          : Math.max(0, parseFloat(e.target.value) || 0)
                      )
                    }
                    onBlur={(e) =>
                      handleItemChange(
                        item.id,
                        "discountedPrice",
                        e.target.value === ""
                          ? 0
                          : Math.max(0, parseFloat(e.target.value) || 0)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={invoiceData.items.length === 1}
                  className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {language === "ar" ? "حذف" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          {language === "ar" ? "إضافة منتج" : "Add Item"}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.deliveryFee}
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={invoiceData.deliveryFee}
          placeholder="0.00"
          onChange={(e) =>
            handleInputChange(
              "deliveryFee",
              e.target.value === ""
                ? ""
                : Math.max(0, parseFloat(e.target.value) || 0)
            )
          }
          onBlur={(e) =>
            handleInputChange(
              "deliveryFee",
              e.target.value === ""
                ? 0
                : Math.max(0, parseFloat(e.target.value) || 0)
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Edit Dialog */}
      <EditDialog
        isOpen={editDialog.isOpen}
        title={
          editDialog.type === "editZone"
            ? "تحديث اسم المنطقة"
            : editDialog.type === "editAgent"
            ? "تحديث اسم المندوب"
            : "تحديث نوع العميل"
        }
        label={
          editDialog.type === "editZone"
            ? "اسم المنطقة الجديد"
            : editDialog.type === "editAgent"
            ? "اسم المندوب الجديد"
            : "نوع العميل الجديد"
        }
        initialValue={editDialog.value}
        onConfirm={(newValue) => {
          editDialog.callback?.(newValue);
          setEditDialog({
            isOpen: false,
            type: "",
            item: "",
            value: "",
            callback: null,
          });
        }}
        onCancel={() =>
          setEditDialog({
            isOpen: false,
            type: "",
            item: "",
            value: "",
            callback: null,
          })
        }
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.type === "deleteZone"
            ? "حذف المنطقة"
            : confirmDialog.type === "deleteAgent"
            ? "حذف المندوب"
            : "حذف نوع العميل"
        }
        message={
          confirmDialog.type === "deleteZone"
            ? `هل تريد حذف المنطقة "${confirmDialog.item}"؟`
            : confirmDialog.type === "deleteAgent"
            ? `هل تريد حذف المندوب "${confirmDialog.item}"؟`
            : `هل تريد حذف نوع العميل "${confirmDialog.item}"؟`
        }
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={() => {
          confirmDialog.callback?.();
          setConfirmDialog({
            isOpen: false,
            type: "",
            item: "",
            callback: null,
          });
        }}
        onCancel={() =>
          setConfirmDialog({
            isOpen: false,
            type: "",
            item: "",
            callback: null,
          })
        }
      />
    </form>
  );
}

export default InvoiceForm;
