import { useState, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";
import InvoiceForm from "../components/InvoiceForm";
import InvoicePreview from "../components/InvoicePreview";
import ConfirmDialog from "../components/ConfirmDialog";
import EditDialog from "../components/EditDialog";
import { LanguageContext } from "../context/LanguageContext";

function Invoice() {
  const { language, toggleLanguage } = useContext(LanguageContext);

  const [invoiceData, setInvoiceData] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    orderNumber: "",
    items: [
      {
        id: 1,
        description: "",
        quantity: 1,
        originalPrice: "",
        discountedPrice: "",
      },
    ],
    deliveryFee: 0,
  });

  const [zone, setZone] = useState("");
  const [newZone, setNewZone] = useState("");
  const [newAgent, setNewAgent] = useState("");
  const [agent, setAgent] = useState("");
  const [customerType, setCustomerType] = useState("regular");
  const [showAddZone, setShowAddZone] = useState(false);
  const [showAddAgent, setShowAddAgent] = useState(false);

  // New Folder System
  const [selectedFolder, setSelectedFolder] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showFolderSelect, setShowFolderSelect] = useState(true);

  // Edit/Delete Dialogs
  const [editDialog, setEditDialog] = useState({
    isOpen: false,
    type: "",
    item: "",
    value: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: "",
    item: "",
  });

  // Get folder data from localStorage
  const getFolderData = () => {
    const savedFolders = localStorage.getItem("invoiceFolders");
    return savedFolders ? JSON.parse(savedFolders) : {};
  };

  const getAllFolders = () => {
    const folders = getFolderData();
    return Object.keys(folders);
  };

  const getZonesForFolder = (folderName) => {
    if (!folderName) return [];
    const folders = getFolderData();
    return Object.keys(folders[folderName]?.zones || {});
  };

  const getAgentsForZone = (folderName, zoneName) => {
    if (!folderName || !zoneName) return [];
    const folders = getFolderData();
    return folders[folderName]?.zones?.[zoneName] || [];
  };

  // Add new folder
  const addFolder = () => {
    if (!newFolderName.trim()) {
      toast.error(language === "ar" ? "أدخل اسم المجلد" : "Enter folder name");
      return;
    }
    const folders = getFolderData();
    if (folders[newFolderName.trim()]) {
      toast.error(
        language === "ar" ? "المجلد موجود بالفعل" : "Folder already exists"
      );
      return;
    }
    folders[newFolderName.trim()] = { zones: {} };
    localStorage.setItem("invoiceFolders", JSON.stringify(folders));
    setSelectedFolder(newFolderName.trim());
    setNewFolderName("");
    setShowAddFolder(false);
    setShowFolderSelect(false);
    setZone("");
    setAgent("");
    toast.success(
      language === "ar"
        ? "تم إنشاء المجلد بنجاح"
        : "Folder created successfully"
    );
  };

  // Add new zone to selected folder
  const addZone = () => {
    if (!newZone.trim()) {
      toast.error(language === "ar" ? "أدخل اسم المنطقة" : "Enter zone name");
      return;
    }
    if (!selectedFolder) {
      toast.error(
        language === "ar" ? "اختر مجلد أولاً" : "Select a folder first"
      );
      return;
    }
    const folders = getFolderData();
    if (folders[selectedFolder].zones[newZone.trim()]) {
      toast.error(
        language === "ar" ? "المنطقة موجودة بالفعل" : "Zone already exists"
      );
      return;
    }
    folders[selectedFolder].zones[newZone.trim()] = [];
    localStorage.setItem("invoiceFolders", JSON.stringify(folders));
    setZone(newZone.trim());
    setNewZone("");
    setShowAddZone(false);
    toast.success(
      language === "ar" ? "تم إضافة المنطقة بنجاح" : "Zone added successfully"
    );
  };

  // Add new agent to selected zone in selected folder
  const addAgent = () => {
    if (!newAgent.trim()) {
      toast.error(language === "ar" ? "أدخل اسم المندوب" : "Enter agent name");
      return;
    }
    if (!selectedFolder) {
      toast.error(
        language === "ar" ? "اختر مجلد أولاً" : "Select a folder first"
      );
      return;
    }
    if (!zone) {
      toast.error(
        language === "ar" ? "اختر منطقة أولاً" : "Select a zone first"
      );
      return;
    }
    const folders = getFolderData();
    if (folders[selectedFolder].zones[zone].includes(newAgent.trim())) {
      toast.error(
        language === "ar" ? "المندوب موجود بالفعل" : "Agent already exists"
      );
      return;
    }
    folders[selectedFolder].zones[zone].push(newAgent.trim());
    localStorage.setItem("invoiceFolders", JSON.stringify(folders));
    setAgent(newAgent.trim());
    setNewAgent("");
    setShowAddAgent(false);
    toast.success(
      language === "ar" ? "تم إضافة المندوب بنجاح" : "Agent added successfully"
    );
  };

  const handleZoneChange = (zoneName) => {
    setZone(zoneName);
    setAgent("");
  };

  // Edit Folder
  const editFolder = (oldName, newName) => {
    if (!newName.trim()) return;
    const folders = getFolderData();
    if (newName === oldName) return;
    if (folders[newName]) {
      toast.error(
        language === "ar" ? "المجلد موجود بالفعل" : "Folder already exists"
      );
      return;
    }
    folders[newName] = folders[oldName];
    delete folders[oldName];
    localStorage.setItem("invoiceFolders", JSON.stringify(folders));
    setSelectedFolder(newName);
    toast.success(language === "ar" ? "تم تحديث المجلد" : "Folder updated");
  };

  // Delete Folder
  const deleteFolder = (folderName) => {
    const folders = getFolderData();
    delete folders[folderName];
    localStorage.setItem("invoiceFolders", JSON.stringify(folders));
    setSelectedFolder("");
    setShowFolderSelect(true);
    setZone("");
    setAgent("");
    toast.success(language === "ar" ? "تم حذف المجلد" : "Folder deleted");
  };

  // Edit Zone
  const editZone = (oldName, newName) => {
    if (!newName.trim() || !selectedFolder) return;
    const folders = getFolderData();
    if (newName === oldName) return;
    if (folders[selectedFolder].zones[newName]) {
      toast.error(
        language === "ar" ? "المنطقة موجودة بالفعل" : "Zone already exists"
      );
      return;
    }
    folders[selectedFolder].zones[newName] =
      folders[selectedFolder].zones[oldName];
    delete folders[selectedFolder].zones[oldName];
    localStorage.setItem("invoiceFolders", JSON.stringify(folders));
    if (zone === oldName) setZone(newName);
    toast.success(language === "ar" ? "تم تحديث المنطقة" : "Zone updated");
  };

  // Delete Zone
  const deleteZone = (zoneName) => {
    if (!selectedFolder) return;
    const folders = getFolderData();
    delete folders[selectedFolder].zones[zoneName];
    localStorage.setItem("invoiceFolders", JSON.stringify(folders));
    if (zone === zoneName) setZone("");
    toast.success(language === "ar" ? "تم حذف المنطقة" : "Zone deleted");
  };

  // Edit Agent
  const editAgent = (oldName, newName) => {
    if (!newName.trim() || !selectedFolder || !zone) return;
    const folders = getFolderData();
    if (newName === oldName) return;
    const agentList = folders[selectedFolder].zones[zone];
    if (agentList.includes(newName)) {
      toast.error(
        language === "ar" ? "المندوب موجود بالفعل" : "Agent already exists"
      );
      return;
    }
    const index = agentList.indexOf(oldName);
    if (index !== -1) {
      agentList[index] = newName;
      localStorage.setItem("invoiceFolders", JSON.stringify(folders));
      if (agent === oldName) setAgent(newName);
      toast.success(language === "ar" ? "تم تحديث المندوب" : "Agent updated");
    }
  };

  // Delete Agent
  const deleteAgent = (agentName) => {
    if (!selectedFolder || !zone) return;
    const folders = getFolderData();
    const agentList = folders[selectedFolder].zones[zone];
    const index = agentList.indexOf(agentName);
    if (index !== -1) {
      agentList.splice(index, 1);
      localStorage.setItem("invoiceFolders", JSON.stringify(folders));
      if (agent === agentName) setAgent("");
      toast.success(language === "ar" ? "تم حذف المندوب" : "Agent deleted");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4 mx-auto min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.type === "deleteFolder"
            ? "حذف المجلد"
            : confirmDialog.type === "deleteZone"
            ? "حذف المنطقة"
            : "حذف المندوب"
        }
        message={
          confirmDialog.type === "deleteFolder"
            ? `هل تريد حذف المجلد "${confirmDialog.item}"؟ سيتم حذف جميع البيانات المرتبطة به`
            : confirmDialog.type === "deleteZone"
            ? `هل تريد حذف المنطقة "${confirmDialog.item}"؟`
            : `هل تريد حذف المندوب "${confirmDialog.item}"؟`
        }
        confirmText={language === "ar" ? "حذف" : "Delete"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        isDanger={true}
        onConfirm={() => {
          if (confirmDialog.type === "deleteFolder")
            deleteFolder(confirmDialog.item);
          else if (confirmDialog.type === "deleteZone")
            deleteZone(confirmDialog.item);
          else if (confirmDialog.type === "deleteAgent")
            deleteAgent(confirmDialog.item);
          setConfirmDialog({ isOpen: false, type: "", item: "" });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, type: "", item: "" })}
      />

      <EditDialog
        isOpen={editDialog.isOpen}
        title={
          editDialog.type === "editFolder"
            ? "تحديث اسم المجلد"
            : editDialog.type === "editZone"
            ? "تحديث اسم المنطقة"
            : "تحديث اسم المندوب"
        }
        label={
          editDialog.type === "editFolder"
            ? "اسم المجلد الجديد"
            : editDialog.type === "editZone"
            ? "اسم المنطقة الجديد"
            : "اسم المندوب الجديد"
        }
        initialValue={editDialog.value}
        onConfirm={(newValue) => {
          if (editDialog.type === "editFolder")
            editFolder(editDialog.item, newValue);
          else if (editDialog.type === "editZone")
            editZone(editDialog.item, newValue);
          else if (editDialog.type === "editAgent")
            editAgent(editDialog.item, newValue);
          setEditDialog({ isOpen: false, type: "", item: "", value: "" });
        }}
        onCancel={() =>
          setEditDialog({ isOpen: false, type: "", item: "", value: "" })
        }
      />
      <div className="flex flex-col gap-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-fit"
        >
          <span>{language === "ar" ? "EN" : "العربية"}</span>
        </button>

        {/* Folder Selection */}
        {showFolderSelect && (
          <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200 space-y-2">
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              {language === "ar" ? "المجلد" : "Folder"}
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={selectedFolder}
                onChange={(e) => {
                  setSelectedFolder(e.target.value);
                  setZone("");
                  setAgent("");
                  if (e.target.value) setShowFolderSelect(false);
                }}
                className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="">
                  {language === "ar" ? "اختر مجلد" : "Select folder"}
                </option>
                {getAllFolders().map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              {/* Edit/Delete Buttons - Show when folder selected */}
              {selectedFolder && (
                <>
                  <button
                    onClick={() =>
                      setEditDialog({
                        isOpen: true,
                        type: "editFolder",
                        item: selectedFolder,
                        value: selectedFolder,
                      })
                    }
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm whitespace-nowrap"
                  >
                    {language === "ar" ? "تعديل" : "Edit"}
                  </button>
                  <button
                    onClick={() =>
                      setConfirmDialog({
                        isOpen: true,
                        type: "deleteFolder",
                        item: selectedFolder,
                      })
                    }
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm whitespace-nowrap"
                  >
                    {language === "ar" ? "حذف" : "Delete"}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setShowAddFolder(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
              >
                {language === "ar" ? "مجلد جديد" : "New Folder"}
              </button>
            </div>

            {showAddFolder && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={language === "ar" ? "اسم المجلد" : "Folder name"}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={addFolder}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddFolder(false);
                    setNewFolderName("");
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors whitespace-nowrap"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form - Show only when folder is selected */}
        {selectedFolder && (
          <div className="flex flex-col gap-4 sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
            <button
              onClick={() => setShowFolderSelect(true)}
              className="text-sm bg-purple-200 text-purple-900 px-2 py-1 rounded hover:bg-purple-300"
            >
              {language === "ar"
                ? `← تغيير المجلد (${selectedFolder})`
                : `← Change Folder (${selectedFolder})`}
            </button>
            <InvoiceForm
              invoiceData={invoiceData}
              setInvoiceData={setInvoiceData}
              selectedFolder={selectedFolder}
              zone={zone}
              setZone={setZone}
              newZone={newZone}
              setNewZone={setNewZone}
              newAgent={newAgent}
              setNewAgent={setNewAgent}
              agent={agent}
              setAgent={setAgent}
              customerType={customerType}
              setCustomerType={setCustomerType}
              showAddZone={showAddZone}
              setShowAddZone={setShowAddZone}
              showAddAgent={showAddAgent}
              setShowAddAgent={setShowAddAgent}
              getZonesForFolder={getZonesForFolder}
              getAgentsForZone={getAgentsForZone}
              handleZoneChange={handleZoneChange}
              addZone={addZone}
              addAgent={addAgent}
              editZone={editZone}
              deleteZone={deleteZone}
              editAgent={editAgent}
              deleteAgent={deleteAgent}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <InvoicePreview
          invoiceData={invoiceData}
          setInvoiceData={setInvoiceData}
          zone={zone}
          agent={agent}
          customerType={customerType}
          selectedFolder={selectedFolder}
        />
      </div>
    </div>
  );
}

export default Invoice;
