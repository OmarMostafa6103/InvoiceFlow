import { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

function InvoicePreview({
  invoiceData,
  setInvoiceData,
  zone,
  agent,
  customerType,
  selectedFolder,
}) {
  const invoiceRef = useRef(null);
  const { language } = useContext(LanguageContext);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  const currentDate = new Date().toLocaleDateString("en-US", dateOptions);

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => {
      const hasDiscount =
        item.discountedPrice && parseFloat(item.discountedPrice) > 0;
      const price = hasDiscount
        ? parseFloat(item.discountedPrice || 0)
        : parseFloat(item.originalPrice || 0);
      return sum + item.quantity * price;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const total = subtotal + (parseFloat(invoiceData.deliveryFee) || 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    const filename = `فاتورة-${invoiceData.orderNumber}-${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    const options = {
      margin: 10,
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .catch((err) => {
        console.error("Error generating PDF:", err);
        alert("خطأ في تحميل البوليصة / Error downloading PDF");
      });
  };

  const handleSaveInvoice = () => {
    // Check if required fields are filled
    if (!agent || !zone || !customerType || !selectedFolder) {
      setSaveMessage(
        language === "ar"
          ? "الرجاء تحديد المجلد والمنطقة والمندوب ونوع العميل"
          : "Please select folder, zone, agent, and customer type"
      );
      setShowSaveModal(true);
      return;
    }

    const subtotal = calculateSubtotal();
    const total = subtotal + (parseFloat(invoiceData.deliveryFee) || 0);

    // Capture invoice as image
    html2canvas(invoiceRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    })
      .then((canvas) => {
        const invoiceImage = canvas.toDataURL("image/png");

        const newInvoice = {
          id: Date.now(),
          folder: selectedFolder,
          orderNumber: invoiceData.orderNumber,
          customerName: invoiceData.customerName,
          customerPhone: invoiceData.customerPhone,
          deliveryAddress: invoiceData.deliveryAddress,
          items: invoiceData.items,
          totalAmount: total,
          agent: agent,
          zone: zone,
          customerType: customerType,
          savedDate: new Date().toISOString().split("T")[0],
          savedTime: new Date().toLocaleTimeString("ar-EG"),
          invoiceImage: invoiceImage,
        };

        // Get existing invoices from localStorage
        const saved = localStorage.getItem("savedInvoices");
        const invoices = saved ? JSON.parse(saved) : [];

        // Add new invoice
        invoices.push(newInvoice);

        // Save to localStorage
        localStorage.setItem("savedInvoices", JSON.stringify(invoices));

        // Reset form
        setInvoiceData({
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

        // Show success message
        setSaveMessage(
          language === "ar"
            ? `تم حفظ الفاتورة بنجاح!\nالمجلد: ${selectedFolder}\nالمندوب: ${agent}\nالمنطقة: ${zone}`
            : `Invoice saved successfully!\nFolder: ${selectedFolder}\nAgent: ${agent}\nZone: ${zone}`
        );
        setShowSaveModal(true);
      })
      .catch((err) => {
        console.error("Error capturing invoice:", err);
        setSaveMessage(
          language === "ar" ? "خطأ في حفظ البوليصة" : "Error saving invoice"
        );
        setShowSaveModal(true);
      });
  };

  const printIconSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9V2h12v7"></path>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
  );

  // Luna Logo - Original Design from luna.html
  const lunaLogo = (
    <svg
      className="luna-logo"
      viewBox="0 0 300.000000 253.000000"
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="55"
    >
      <g
        transform="translate(0.000000,253.000000) scale(0.100000,-0.100000)"
        fill="#000000"
        stroke="none"
      >
        <path d="M1169 2396 c-133 -46 -286 -199 -346 -346 -52 -129 -70 -329 -38 -433 26 -87 83 -174 151 -232 141 -119 237 -153 453 -159 88 -3 151 -1 151 5 0 9 -32 11 -160 9 -262 -4 -496 150 -575 379 -22 64 -20 229 5 325 50 196 210 381 379 439 25 8 37 16 29 19 -8 3 -30 0 -49 -6z" />
        <path d="M1640 2386 c157 -55 270 -140 351 -264 82 -125 93 -164 92 -332 0 -123 -3 -154 -22 -204 -54 -149 -199 -261 -365 -281 -79 -10 -67 8 16 25 134 26 242 104 302 219 43 82 48 118 7 45 -55 -94 -190 -190 -317 -223 -24 -6 -52 -24 -69 -43 l-28 -31 23 -19 c32 -26 16 -36 -23 -15 -25 13 -39 15 -57 8 -22 -8 -23 -10 -8 -16 10 -4 15 -12 11 -18 -4 -6 -1 -7 7 -2 8 5 31 8 53 6 32 -1 40 2 44 19 3 12 16 22 32 26 141 28 226 68 297 142 87 89 126 207 123 369 -3 152 -20 210 -101 339 -67 107 -185 201 -311 249 -37 14 -80 25 -95 25 -19 0 -7 -7 38 -24z" />
        <path d="M1160 2343 c-145 -69 -281 -242 -324 -409 -23 -89 -21 -259 3 -328 36 -103 131 -212 230 -265 73 -39 180 -68 277 -75 78 -6 79 -6 40 9 -21 8 -68 40 -103 71 -63 56 -66 57 -126 58 -57 1 -67 5 -117 43 -61 47 -78 48 -34 2 53 -55 91 -73 156 -71 56 2 61 0 101 -37 23 -22 39 -42 35 -46 -6 -6 -53 3 -133 27 -121 36 -242 145 -298 268 -16 33 -22 72 -25 148 -5 126 9 154 33 66 9 -33 26 -83 37 -113 20 -50 25 -55 87 -83 36 -16 76 -39 89 -51 l23 -21 -23 51 c-13 28 -28 48 -35 46 -34 -13 -143 81 -143 123 0 20 -40 108 -53 116 -14 8 3 88 33 152 34 72 45 65 47 -33 1 -48 8 -105 17 -128 18 -51 6 -56 -36 -16 -15 15 -28 22 -28 17 0 -18 29 -50 70 -79 23 -16 53 -45 67 -65 l25 -35 -7 35 c-4 19 -13 46 -21 60 -64 117 -66 127 -65 243 1 62 5 126 9 142 8 26 9 22 14 -35 4 -36 18 -93 32 -127 14 -34 28 -88 31 -120 10 -111 28 -224 37 -229 4 -3 8 12 8 33 0 27 11 58 35 97 19 32 35 70 35 85 l-1 26 -13 -30 c-8 -16 -25 -45 -40 -64 -30 -40 -33 -36 -39 69 -3 53 -14 98 -36 153 -19 48 -31 95 -31 124 0 43 4 51 53 98 29 28 79 64 110 79 31 15 61 34 68 42 16 19 14 19 -71 -23z" />
        <path d="M1669 2327 c97 -48 106 -55 119 -92 11 -33 12 -54 2 -115 -6 -41 -13 -101 -14 -132 -1 -32 -5 -60 -8 -63 -3 -3 -17 8 -32 25 -43 52 -30 7 15 -50 22 -28 47 -66 55 -83 15 -31 15 -30 7 28 -8 63 -9 187 -4 295 2 36 1 79 -4 95 -5 21 -4 27 3 20 6 -6 23 -51 38 -100 35 -114 36 -205 5 -265 -11 -22 -21 -53 -21 -68 l1 -27 14 32 c8 18 34 54 58 80 24 27 47 62 51 78 l6 30 -17 -27 c-27 -43 -39 -34 -46 35 -4 34 -13 80 -21 102 -8 22 -15 46 -16 53 0 24 36 -10 79 -73 l43 -62 -18 -89 c-9 -49 -23 -101 -31 -116 -18 -36 -64 -78 -85 -78 -11 0 -18 -8 -18 -19 0 -10 -2 -34 -6 -52 l-5 -34 14 31 c8 16 39 52 69 80 63 56 78 91 78 178 1 56 2 59 16 41 22 -29 34 -84 36 -161 2 -83 -9 -134 -28 -134 -7 0 -35 -32 -61 -72 -56 -83 -88 -110 -137 -113 -31 -2 -41 -10 -81 -64 -25 -33 -42 -61 -39 -61 3 0 44 19 92 42 99 48 195 132 235 205 38 70 53 172 38 258 -38 216 -186 391 -397 471 -103 39 -97 27 15 -29z m144 -854 c9 -8 -45 -42 -56 -36 -11 6 22 43 38 43 6 0 15 -3 18 -7z" />
        <path d="M1417 2278 c-64 -138 -67 -166 -31 -298 l7 -25 -23 20 c-13 11 -36 38 -52 60 -29 39 -29 39 -22 10 4 -16 29 -54 55 -83 30 -33 54 -72 63 -100 l15 -47 0 73 c1 53 -4 83 -18 110 -41 81 -38 116 27 285 17 42 27 77 23 77 -4 0 -24 -37 -44 -82z" />
        <path d="M1469 2310 c-10 -34 -9 -56 6 -134 17 -89 18 -97 2 -157 -9 -35 -19 -93 -22 -129 l-6 -65 16 35 c8 19 45 62 80 96 36 33 65 68 65 77 0 11 -14 3 -43 -27 -24 -23 -52 -45 -64 -48 -20 -5 -20 -5 -5 53 14 52 15 68 2 141 -8 46 -14 109 -13 141 0 31 -1 57 -3 57 -2 0 -9 -18 -15 -40z" />
        <path d="M1271 2002 c-2 -88 17 -141 70 -199 26 -29 54 -72 62 -95 l15 -43 1 68 c1 53 -2 67 -14 67 -8 0 -33 18 -54 39 -31 31 -42 52 -51 98 -25 116 -28 124 -29 65z" />
        <path d="M1601 1960 c-26 -82 -65 -131 -120 -154 -39 -15 -39 -16 -43 -76 -1 -33 -2 -60 -1 -60 1 0 14 22 28 49 16 28 45 62 71 80 24 17 49 43 55 58 6 16 15 35 19 44 9 18 25 129 18 129 -2 0 -14 -32 -27 -70z" />
        <path d="M1688 1944 c-16 -60 12 -144 63 -190 12 -10 30 -37 40 -59 l18 -40 0 52 c1 43 -2 53 -19 58 -30 10 -69 62 -76 103 -3 20 -9 51 -13 67 -6 27 -8 28 -13 9z" />
        <path d="M1181 1828 c-1 -103 -10 -131 -56 -174 l-35 -33 22 -48 21 -48 8 46 c4 28 22 69 43 100 34 51 47 105 29 123 -5 4 -13 33 -19 64 l-11 57 -2 -87z" />
        <path d="M1261 1847 c-1 -49 -4 -66 -13 -61 -8 5 -9 -2 -5 -27 5 -25 26 -51 77 -99 39 -36 77 -81 85 -100 l15 -35 -2 55 c-3 52 -5 56 -39 72 -55 28 -78 69 -99 171 l-18 92 -1 -68z" />
        <path d="M1617 1873 c-2 -5 -14 -39 -27 -76 -26 -80 -56 -120 -110 -143 l-40 -18 1 -60 c1 -48 2 -55 9 -34 14 46 47 92 89 123 27 20 47 46 60 80 23 58 38 162 18 128z" />
        <path d="M1962 1778 c-25 -81 -65 -133 -116 -146 -19 -5 -33 -19 -42 -42 l-15 -34 23 21 c13 11 46 32 75 47 55 27 97 71 89 93 -3 8 -1 36 5 63 17 81 5 80 -19 -2z" />
        <path d="M1669 1830 c-3 -8 -5 -24 -4 -35 1 -11 2 -34 3 -51 1 -18 17 -51 38 -79 20 -26 42 -67 48 -92 l12 -45 16 52 c16 51 16 51 -6 60 -34 13 -74 66 -82 108 -12 71 -20 97 -25 82z" />
        <path d="M1620 1766 c0 -9 -10 -51 -22 -94 -18 -61 -32 -86 -64 -119 -23 -23 -53 -43 -67 -45 -25 -3 -25 -4 -12 -40 18 -54 38 -81 91 -124 l46 -38 25 29 c13 17 49 63 79 103 l55 72 -31 26 c-43 37 -52 58 -60 141 -5 45 -13 78 -24 88 -14 15 -16 15 -16 1z m37 -191 c6 -11 21 -29 32 -39 24 -22 27 -48 9 -68 -7 -7 -32 -39 -56 -70 -23 -32 -47 -58 -53 -58 -18 0 -97 81 -108 111 -9 28 -8 31 29 54 53 34 85 79 107 153 l18 63 6 -63 c3 -35 10 -72 16 -83z" />
        <path d="M1230 1680 c0 -64 -19 -110 -58 -141 l-31 -24 35 -40 34 -40 0 32 c0 17 9 52 19 76 11 25 17 55 14 68 -4 14 -2 20 4 16 6 -4 14 -36 18 -72 6 -56 4 -71 -14 -100 l-20 -34 57 -52 c57 -51 141 -99 175 -99 10 0 38 5 62 11 l45 11 -51 46 c-51 46 -89 106 -89 142 0 14 -7 20 -23 20 -28 0 -101 50 -117 80 -6 11 -20 49 -31 85 -11 36 -22 65 -24 65 -3 0 -5 -23 -5 -50z m139 -191 c23 -8 38 -24 56 -59 13 -26 35 -61 49 -78 15 -16 26 -38 26 -47 0 -15 -6 -16 -47 -10 -50 7 -74 20 -140 73 -46 37 -49 46 -32 101 7 20 14 42 16 50 3 11 7 11 21 -3 10 -8 33 -21 51 -27z" />
        <path d="M924 1604 c40 -82 83 -121 141 -129 28 -3 62 -10 78 -15 27 -9 27 -9 10 14 -13 17 -28 23 -53 23 -47 0 -93 25 -127 69 -15 20 -38 48 -51 63 -23 26 -23 25 2 -25z" />
      </g>
    </svg>
  );

  return (
    <>
      {/* Save Invoice Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm mx-4 animate-fade-in text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "ar" ? "✓ تم بنجاح" : "✓ Success"}
            </h2>
            <div className="whitespace-pre-line text-gray-700 mb-6 text-sm leading-relaxed">
              {saveMessage}
            </div>

            <button
              onClick={() => setShowSaveModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {language === "ar" ? "حسناً" : "OK"}
            </button>
          </div>
        </div>
      )}
      <div className="w-full bg-gray-100 p-4">
        {/* Print & Download Buttons */}
        <div className="max-w-4xl mx-auto mb-4 no-print flex justify-end gap-3 print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            📥 Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            {printIconSvg}
            Print Invoice
          </button>
        </div>

        {/* Invoice Container */}
        <div
          className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-12 print:shadow-none print:rounded-none print:p-0 print:max-w-full print:h-screen print:flex print:flex-col"
          ref={invoiceRef}
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">{lunaLogo}</div>
              <div className="sans text-[10px] space-y-0.5">
                <p className="font-bold">Luna Healthy</p>
                <p className="text-gray-600">Natural & Wholesome</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-light tracking-widest uppercase">
                Invoice
              </h2>
              <div className="mt-2 sans text-[10px] space-y-0.5">
                <p>
                  <span className="text-gray-400">Date:</span>
                  <span className="ml-2">{currentDate}</span>
                </p>
                <p>
                  <span className="text-gray-400">Order #:</span>
                  <span className="font-bold ml-2">
                    #{invoiceData.orderNumber}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-8 my-10">
            <div>
              <h3 className="sans text-[10px] font-bold uppercase text-gray-400 mb-2">
                Bill To:
              </h3>
              <div className="space-y-2">
                <div className="border-b border-gray-200 pb-1">
                  <span className="sans text-xs text-gray-400">Name:</span>
                  <div className="text-lg font-bold pt-1 h-6" dir="rtl">
                    {invoiceData.customerName}
                  </div>
                </div>
                <div className="border-b border-gray-200 pb-1">
                  <span className="sans text-xs text-gray-400">Mobile:</span>
                  <div className="text-sm pt-1 h-6">
                    {invoiceData.customerPhone}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="sans text-[10px] font-bold uppercase text-gray-400 mb-2">
                Delivery Address:
              </h3>
              <div
                className="border-b border-gray-200 h-16 w-full pt-1 text-base font-bold overflow-hidden"
                dir="rtl"
              >
                {invoiceData.deliveryAddress}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-12 mb-12 flex-grow flex flex-col">
            <div className="grid grid-cols-12 gap-2 border-b-2 border-black pb-3 mb-6 font-bold text-gray-800 uppercase text-xs tracking-wide sans">
              <div className="col-span-7">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-3 text-right">Price</div>
            </div>

            <div className="flex-grow overflow-y-auto">
              {invoiceData.items.map((item) => {
                const hasDiscount =
                  item.discountedPrice && parseFloat(item.discountedPrice) > 0;
                const displayPrice = hasDiscount
                  ? item.discountedPrice
                  : item.originalPrice;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 border-b border-gray-200 py-4 px-2 sans text-sm"
                  >
                    <div className="col-span-7 font-medium italic text-gray-800">
                      {item.description}
                    </div>
                    <div className="col-span-2 text-center text-gray-800">
                      {item.quantity}
                    </div>
                    <div className="col-span-3 text-right">
                      {hasDiscount && (
                        <div className="text-xs text-gray-500 line-through mb-1">
                          {parseFloat(item.originalPrice).toFixed(0)}
                        </div>
                      )}
                      <div className="font-bold text-lg text-gray-800">
                        {parseFloat(displayPrice || 0).toFixed(0)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="flex justify-end mt-8 mb-12">
            <div className="w-64 space-y-2 sans">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal:</span>
                <span className="font-semibold">{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 border-b-2 border-black pb-4 mb-4">
                <span>Delivery Fee:</span>
                <span className="font-semibold">
                  {invoiceData.deliveryFee
                    ? `${parseFloat(invoiceData.deliveryFee).toFixed(0)}`
                    : "Free"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold uppercase tracking-wider text-gray-800">
                  Total:
                </span>
                <span className="font-bold text-xl text-gray-800">
                  {total.toFixed(0)} EGP
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 border-t border-gray-100 pt-8">
            <div className="flex justify-between items-end">
              <div className="sans text-[10px] text-gray-400 max-w-xs uppercase leading-relaxed">
                <p className="font-bold text-gray-600 mb-1">
                  Thank you for choosing healthy!
                </p>
                <p>
                  Every cookie is baked with love and premium barley flour to
                  support your healthy lifestyle.
                </p>
              </div>
              <div className="text-right">
                <p className="sans text-[10px] font-bold uppercase mb-2">
                  Follow our journey
                </p>
                <div className="flex justify-end items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3l-.5 3H13v6.8c4.56-.93 8-4.96 8-9.8z" />
                  </svg>
                  <span className="sans text-xs font-medium">Luna-healthy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Element */}
          <div className="mt-12 text-center italic text-gray-300 sans text-[9px] uppercase tracking-[0.3em]">
            Nature's Goodness In Every Bite
          </div>
        </div>

        {/* Save Invoice Button */}
        <div className="max-w-4xl mx-auto mt-4 no-print flex justify-center print:hidden">
          <button
            onClick={handleSaveInvoice}
            className="bg-green-600 text-white px-8 py-2 rounded-full font-bold hover:bg-green-700 transition-colors"
          >
            💾 {language === "ar" ? "حفظ الفاتورة" : "Save Invoice"}
          </button>
        </div>
      </div>
    </>
  );
}

export default InvoicePreview;
