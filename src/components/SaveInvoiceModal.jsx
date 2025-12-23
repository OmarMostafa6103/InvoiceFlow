import { useState, useMemo } from "react";

function SaveInvoiceModal({ isOpen, invoiceData, onClose, onSave }) {
  const [zone, setZone] = useState("");
  const [customZone, setCustomZone] = useState("");
  const [useCustomZone, setUseCustomZone] = useState(false);
  const [agent, setAgent] = useState("");
  const [customAgent, setCustomAgent] = useState("");
  const [useCustomAgent, setUseCustomAgent] = useState(false);
  const [customerType, setCustomerType] = useState("regular");

  // Default zone structure with agents
  const defaultZoneData = useMemo(
    () => ({
      "المنطقة الأولى": ["أحمد محمود", "فاطمة حسن"],
      "المنطقة الثانية": ["محمد علي", "سارة أحمد"],
      "المنطقة الثالثة": ["علي خالد", "نور محمد"],
      "المنطقة الرابعة": ["هند أحمد", "ياسمين علي"],
      "المنطقة الخامسة": ["خالد محمود", "ليلى حسن"],
    }),
    []
  );

  // Get zone data from localStorage or use defaults
  const getZoneData = () => {
    const savedZoneData = localStorage.getItem("zoneData");
    return savedZoneData ? JSON.parse(savedZoneData) : defaultZoneData;
  };

  const getAllZones = () => {
    const zoneData = getZoneData();
    return Object.keys(zoneData);
  };

  // Get agents for selected zone
  const getAgentsForZone = (selectedZone) => {
    if (!selectedZone) return [];
    const zoneData = getZoneData();
    return zoneData[selectedZone] || [];
  };

  const handleZoneChange = (zoneName) => {
    setZone(zoneName);
    setAgent(""); // Reset agent when zone changes
    setUseCustomAgent(false);
  };

  const handleSave = () => {
    const finalAgent = useCustomAgent ? customAgent : agent;
    const finalZone = useCustomZone ? customZone : zone;

    if (!finalZone.trim()) {
      alert("يرجى اختيار أو إدخال منطقة / Please select or enter a zone");
      return;
    }

    if (!finalAgent.trim()) {
      alert(
        "يرجى اختيار أو إدخال اسم مندوب / Please select or enter agent name"
      );
      return;
    }

    let zoneData = getZoneData();

    // Save new zone with agents if custom
    if (useCustomZone && !Object.keys(zoneData).includes(finalZone)) {
      zoneData[finalZone] = useCustomAgent ? [finalAgent] : [finalAgent];
      localStorage.setItem("zoneData", JSON.stringify(zoneData));
    }

    // Add new agent to zone if custom
    if (useCustomAgent && !getAgentsForZone(finalZone).includes(finalAgent)) {
      zoneData[finalZone] = [...(zoneData[finalZone] || []), finalAgent];
      localStorage.setItem("zoneData", JSON.stringify(zoneData));
    }

    onSave({
      agent: finalAgent,
      zone: finalZone,
      customerType: customerType,
    });

    // Reset form
    setZone("");
    setCustomZone("");
    setUseCustomZone(false);
    setAgent("");
    setCustomAgent("");
    setUseCustomAgent(false);
    setCustomerType("regular");
  };

  if (!isOpen) return null;

  const agentsInSelectedZone = getAgentsForZone(
    useCustomZone ? customZone : zone
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-xl max-w-md w-[90%] max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
          <h2 className="m-0 text-xl font-bold text-gray-800">
            حفظ الفاتورة / Save Invoice
          </h2>
          <button
            onClick={onClose}
            className="bg-none border-none text-2xl cursor-pointer text-gray-600 p-0 w-8 h-8 flex justify-center items-center hover:bg-gray-200 rounded"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="mb-5 text-sm">
            رقم الفاتورة: <strong>{invoiceData.orderNumber}</strong>
          </p>

          {/* Customer Type */}
          <div className="mb-5">
            <label className="block mb-3 font-semibold text-gray-800 text-sm">
              نوع العميل / Customer Type
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="customerType"
                  value="regular"
                  checked={customerType === "regular"}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="mr-3 cursor-pointer"
                />
                <span className="text-sm text-gray-800">
                  عميل منتظم / Regular Customer
                </span>
              </label>
              <label className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="customerType"
                  value="new"
                  checked={customerType === "new"}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="mr-3 cursor-pointer"
                />
                <span className="text-sm text-gray-800">
                  عميل جديد / New Customer
                </span>
              </label>
            </div>
          </div>

          {/* Zone Selection - FIRST */}
          <div className="mb-5 p-3 bg-blue-50 rounded border-2 border-blue-300">
            <label className="block mb-3 font-bold text-blue-900 text-sm">
              📍 اختر المنطقة أولاً / Select Zone First
            </label>
            <div className="flex flex-col gap-2">
              {!useCustomZone ? (
                <>
                  {getAllZones().map((zoneName) => (
                    <label
                      key={zoneName}
                      className={`flex items-center p-2 border rounded cursor-pointer transition ${
                        zone === zoneName
                          ? "border-blue-500 bg-blue-100"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="zone"
                        value={zoneName}
                        checked={zone === zoneName}
                        onChange={() => handleZoneChange(zoneName)}
                        className="mr-3 cursor-pointer"
                      />
                      <span className="text-sm text-gray-800 flex-1">
                        {zoneName}
                      </span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700">
                        {getAgentsForZone(zoneName).length} مندوب
                      </span>
                    </label>
                  ))}
                  <label className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="zone"
                      value="custom"
                      checked={useCustomZone}
                      onChange={() => setUseCustomZone(true)}
                      className="mr-3 cursor-pointer"
                    />
                    <span className="text-sm text-gray-800">
                      ➕ منطقة جديدة / New Zone
                    </span>
                  </label>
                </>
              ) : (
                <>
                  {getAllZones().map((zoneName) => (
                    <label
                      key={zoneName}
                      className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition"
                    >
                      <input
                        type="radio"
                        name="zone"
                        value={zoneName}
                        checked={zone === zoneName}
                        onChange={() => handleZoneChange(zoneName)}
                        className="mr-3 cursor-pointer"
                      />
                      <span className="text-sm text-gray-800 flex-1">
                        {zoneName}
                      </span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-700">
                        {getAgentsForZone(zoneName).length} مندوب
                      </span>
                    </label>
                  ))}
                  <label className="flex items-center p-2 border-2 border-blue-500 rounded cursor-pointer bg-blue-50 transition">
                    <input
                      type="radio"
                      name="zone"
                      value="custom"
                      checked={useCustomZone}
                      onChange={() => setUseCustomZone(true)}
                      className="mr-3 cursor-pointer"
                    />
                    <span className="text-sm text-gray-800">
                      ➕ منطقة جديدة / New Zone
                    </span>
                  </label>
                </>
              )}
            </div>

            {useCustomZone && (
              <input
                type="text"
                className="w-full p-2 mt-3 border-2 border-blue-500 rounded text-sm font-inherit focus:outline-none focus:shadow-lg focus:shadow-blue-400"
                placeholder="أدخل اسم المنطقة / Enter zone name"
                value={customZone}
                onChange={(e) => setCustomZone(e.target.value)}
              />
            )}
          </div>

          {/* Agent Selection - Shows agents for selected zone */}
          <div className="mb-5">
            <label className="block mb-3 font-bold text-gray-800 text-sm">
              👤 اختر المندوب في المنطقة / Select Agent in Zone
              {!useCustomZone && zone && (
                <span className="text-blue-600 text-xs block mt-1">
                  المنطقة المختارة: {zone}
                </span>
              )}
            </label>

            {!useCustomZone && !zone ? (
              <div className="p-3 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-800">
                ⚠️ يجب اختيار منطقة أولاً / Please select a zone first
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {!useCustomAgent ? (
                  <>
                    {agentsInSelectedZone.length > 0 ? (
                      agentsInSelectedZone.map((agentName) => (
                        <label
                          key={agentName}
                          className={`flex items-center p-2 border rounded cursor-pointer transition ${
                            agent === agentName
                              ? "border-green-500 bg-green-100"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="agent"
                            value={agentName}
                            checked={agent === agentName}
                            onChange={(e) => setAgent(e.target.value)}
                            className="mr-3 cursor-pointer"
                          />
                          <span className="text-sm text-gray-800">
                            {agentName}
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="p-3 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700">
                        لا توجد مناديب في هذه المنطقة / No agents in this zone
                      </div>
                    )}
                    <label className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="radio"
                        name="agent"
                        value="custom"
                        checked={useCustomAgent}
                        onChange={() => setUseCustomAgent(true)}
                        className="mr-3 cursor-pointer"
                      />
                      <span className="text-sm text-gray-800">
                        ➕ مندوب جديد / New Agent
                      </span>
                    </label>
                  </>
                ) : (
                  <>
                    {agentsInSelectedZone.map((agentName) => (
                      <label
                        key={agentName}
                        className="flex items-center p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition"
                      >
                        <input
                          type="radio"
                          name="agent"
                          value={agentName}
                          checked={agent === agentName}
                          onChange={(e) => setAgent(e.target.value)}
                          className="mr-3 cursor-pointer"
                        />
                        <span className="text-sm text-gray-800">
                          {agentName}
                        </span>
                      </label>
                    ))}
                    <label className="flex items-center p-2 border-2 border-green-500 rounded cursor-pointer bg-green-50 transition">
                      <input
                        type="radio"
                        name="agent"
                        value="custom"
                        checked={useCustomAgent}
                        onChange={() => setUseCustomAgent(true)}
                        className="mr-3 cursor-pointer"
                      />
                      <span className="text-sm text-gray-800">
                        ➕ مندوب جديد / New Agent
                      </span>
                    </label>
                  </>
                )}
              </div>
            )}

            {useCustomAgent && (
              <input
                type="text"
                className="w-full p-2 mt-3 border-2 border-green-500 rounded text-sm font-inherit focus:outline-none focus:shadow-lg focus:shadow-green-400"
                placeholder="أدخل اسم المندوب / Enter agent name"
                value={customAgent}
                onChange={(e) => setCustomAgent(e.target.value)}
              />
            )}
          </div>

          {/* Invoice Summary */}
          <div className="bg-gray-50 p-4 rounded text-sm mb-5">
            <h3 className="m-0 mb-3 text-sm font-bold text-gray-800">
              ملخص الفاتورة / Invoice Summary
            </h3>
            <p className="my-1.5 text-gray-800">
              <strong>العميل / Customer:</strong> {invoiceData.customerName}
            </p>
            <p className="my-1.5 text-gray-800">
              <strong>الهاتف / Phone:</strong> {invoiceData.customerPhone}
            </p>
            <p className="my-1.5 text-gray-800">
              <strong>عدد البنود / Items:</strong> {invoiceData.items.length}
            </p>
            <p className="my-1.5 text-lg font-bold text-blue-600">
              <strong>المبلغ النهائي / Total Amount:</strong>
              <span>
                {(
                  invoiceData.items.reduce(
                    (sum, item) =>
                      sum + item.quantity * parseFloat(item.price || 0),
                    0
                  ) + parseFloat(invoiceData.deliveryFee || 0)
                ).toFixed(2)}{" "}
                EGP
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 p-2.5 bg-gray-300 text-gray-800 border-none rounded cursor-pointer font-semibold transition hover:bg-gray-400"
          >
            إلغاء / Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 p-2.5 bg-blue-600 text-white border-none rounded cursor-pointer font-semibold transition hover:bg-blue-700"
          >
            💾 حفظ الفاتورة / Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveInvoiceModal;
