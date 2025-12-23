import { useState, useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

function SavedInvoices() {
  const { language, toggleLanguage } = useContext(LanguageContext);
  const [selectedInvoiceImage, setSelectedInvoiceImage] = useState(null);

  const getInitialInvoices = () => {
    const saved = localStorage.getItem("savedInvoices");
    return saved ? JSON.parse(saved) : [];
  };

  const getInitialFolders = () => {
    const saved = localStorage.getItem("savedInvoices");
    if (saved) {
      const invoices = JSON.parse(saved);
      return [...new Set(invoices.map((inv) => inv.folder).filter(Boolean))];
    }
    return [];
  };

  const [invoices, setInvoices] = useState(getInitialInvoices());
  const [searchDate, setSearchDate] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [folders, setFolders] = useState(getInitialFolders());

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesDate = !searchDate || invoice.savedDate.startsWith(searchDate);
    const matchesFolder =
      selectedFolder === "all" || invoice.folder === selectedFolder;
    return matchesDate && matchesFolder;
  });

  const deleteInvoice = (id) => {
    if (
      window.confirm(language === "ar" ? "حذف الفاتورة؟" : "Delete invoice?")
    ) {
      const updated = invoices.filter((inv) => inv.id !== id);
      setInvoices(updated);
      localStorage.setItem("savedInvoices", JSON.stringify(updated));
      const uniqueFolders = [
        ...new Set(updated.map((inv) => inv.folder).filter(Boolean)),
      ];
      setFolders(uniqueFolders);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "المجلد",
      "Folder",
      "رقم الفاتورة",
      "Order #",
      "التاريخ",
      "Date",
      "المندوب",
      "Agent",
      "المنطقة",
      "Zone",
      "العميل",
      "Customer",
      "المبلغ النهائي",
      "Total Amount",
    ];
    const rows = filteredInvoices.map((inv) => [
      inv.folder || "-",
      inv.folder || "-",
      inv.orderNumber || "-",
      inv.orderNumber || "-",
      inv.savedDate,
      inv.savedDate,
      inv.agent || "-",
      inv.agent || "-",
      inv.zone || "-",
      inv.zone || "-",
      inv.customerName || "-",
      inv.customerName || "-",
      inv.totalAmount || "0",
      inv.totalAmount || "0",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `invoices-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="max-w-6xl mx-auto p-5 bg-gray-100 min-h-screen"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-gray-800">
          <h1 className="m-0 text-3xl font-bold text-gray-800">
            {language === "ar" ? "الفواتير المحفوظة" : "Saved Invoices"}
          </h1>
          <button
            onClick={toggleLanguage}
            className="px-5 py-2 bg-blue-600 text-white border-none rounded cursor-pointer font-bold transition hover:bg-blue-700"
          >
            {language === "ar" ? "EN" : "العربية"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">
            {language === "ar" ? "المجلد" : "Folder"}
          </label>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">
              {language === "ar" ? "جميع المجلدات" : "All Folders"}
            </option>
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">
            {language === "ar" ? "البحث بالتاريخ" : "Search by Date"}
          </label>
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-600 text-white border-none rounded cursor-pointer font-bold transition hover:bg-green-700"
        >
          {language === "ar" ? "📊 تصدير CSV" : "📊 Export CSV"}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded shadow-sm">
          <span className="block text-xs text-gray-600 font-semibold uppercase">
            {language === "ar" ? "عدد الفواتير" : "Total Invoices"}
          </span>
          <span className="block text-2xl font-bold text-blue-600">
            {filteredInvoices.length}
          </span>
        </div>
        <div className="bg-white p-5 rounded shadow-sm">
          <span className="block text-xs text-gray-600 font-semibold uppercase">
            {language === "ar" ? "المبلغ الإجمالي" : "Total Amount"}
          </span>
          <span className="block text-2xl font-bold text-green-600">
            {filteredInvoices
              .reduce((sum, inv) => sum + inv.totalAmount, 0)
              .toFixed(2)}{" "}
            EGP
          </span>
        </div>
        <div className="bg-white p-5 rounded shadow-sm">
          <span className="block text-xs text-gray-600 font-semibold uppercase">
            {language === "ar" ? "عدد المجلدات" : "Total Folders"}
          </span>
          <span className="block text-2xl font-bold text-purple-600">
            {folders.length}
          </span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInvoices.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-500 text-lg">
            <p>
              {language === "ar"
                ? "لا توجد فواتير محفوظة"
                : "No saved invoices"}
            </p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white rounded shadow-sm overflow-hidden hover:shadow-lg transition"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="m-0 text-lg font-bold">
                      {invoice.orderNumber}
                    </h3>
                    <p className="m-0 text-xs opacity-80 mt-1">
                      {invoice.savedDate}
                    </p>
                  </div>
                  <span className="text-2xl font-bold">
                    {invoice.totalAmount.toFixed(2)} EGP
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {invoice.folder && (
                    <span className="bg-purple-800 px-2 py-1 rounded">
                      📁 {invoice.folder}
                    </span>
                  )}
                  {invoice.agent && (
                    <span className="bg-blue-700 px-2 py-1 rounded">
                      👤 {invoice.agent}
                    </span>
                  )}
                  {invoice.zone && (
                    <span className="bg-green-700 px-2 py-1 rounded">
                      📍 {invoice.zone}
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <p className="text-sm mb-2">
                  <strong>{language === "ar" ? "العميل:" : "Customer:"}</strong>{" "}
                  {invoice.customerName}
                </p>
                <p className="text-sm mb-3">
                  <strong>{language === "ar" ? "الهاتف:" : "Phone:"}</strong>{" "}
                  {invoice.customerPhone}
                </p>
                <div className="border-t pt-3 text-xs text-gray-600">
                  <strong>{language === "ar" ? "البنود:" : "Items:"}</strong>
                  <ul className="list-none p-0 m-0 mt-2">
                    {invoice.items &&
                      invoice.items.map((item) => (
                        <li key={item.id}>
                          • {item.description} x{item.quantity}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 flex gap-2">
                {invoice.invoiceImage && (
                  <button
                    onClick={() =>
                      setSelectedInvoiceImage(invoice.invoiceImage)
                    }
                    className="flex-1 py-2 bg-blue-600 text-white border-none rounded cursor-pointer font-semibold text-sm hover:bg-blue-700"
                  >
                    👁️
                  </button>
                )}
                <button
                  onClick={() => deleteInvoice(invoice.id)}
                  className="flex-1 py-2 bg-red-600 text-white border-none rounded cursor-pointer font-semibold text-sm hover:bg-red-700"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Modal */}
      {selectedInvoiceImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedInvoiceImage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selectedInvoiceImage} alt="Invoice" className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedInvoices;
