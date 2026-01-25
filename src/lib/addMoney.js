function formatDate(date) {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

const handleDateChange = (
  e,
  setValue,
  setDate,
  setMonth,
  setFormData,
  date,
) => {
  // A. Remove all non-numeric characters
  let input = e.target.value.replace(/\D/g, "");

  // B. Limit to 8 digits (DDMMYYYY)
  if (input.length > 8) input = input.slice(0, 8);

  // C. Add Dashes logic
  let formatted = input;
  if (input.length >= 3) {
    formatted = `${input.slice(0, 2)}-${input.slice(2)}`;
  }
  if (input.length >= 5) {
    formatted = `${input.slice(0, 2)}-${input.slice(2, 4)}-${input.slice(4)}`;
  }

  setValue(formatted);

  // D. Validate and Sync with Calendar if complete (8 digits)
  if (input.length === 8) {
    const day = parseInt(input.slice(0, 2), 10);
    const mth = parseInt(input.slice(2, 4), 10);
    const year = parseInt(input.slice(4, 8), 10);

    // Create date object (Month is 0-indexed in JS)
    const dateObj = new Date(year, mth - 1, day);

    // Check if valid date exists (handles 32-01-2023 or 29-02-2023 checks)
    if (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === mth - 1 &&
      dateObj.getDate() === day
    ) {
      setDate(dateObj);
      setMonth(dateObj);
    }

    setFormData((prev) => ({
      ...prev,
      year: year,
      quarter: Math.floor((mth - 1) / 3 + 1),
    }));
  } else {
    // Optional: Clear calendar selection if input is incomplete/invalid
    if (date) setDate(undefined);
  }
};

const handleInvoiceNo = (e, setFormData) => {
  const value = e.target.value;
  setFormData((prev) => ({ ...prev, invoiceNo: value }));
};

const handleTaxManualChange = (e, setFormData) => {
  const value = e.target.value;
  if (value < 0) return;

  setFormData((prev) => ({
    ...prev,
    cgst: value,
    sgst: value,
    // Calculate Bill Value using existing Taxable Value and MANUAL taxes
    billValue: calculateBillValue(prev.taxableValue, value, value),
  }));
};

const handleBillValueChange = (e, setFormData) => {
  const value = e.target.value;
  if (value < 0) return;

  setFormData((prev) => ({
    ...prev,
    billValue: value,
  }));
};

const handleTaxableValueChange = (e, setFormData) => {
  const value = e.target.value;
  if (value < 0) return;

  setFormData((prev) => {
    let newCgst = prev.cgst;
    let newSgst = prev.sgst;

    // If Rate exists, recalculate taxes immediately
    if (prev.gstRate) {
      const taxes = calculateTaxes(value, prev.gstRate);
      newCgst = taxes.cgst;
      newSgst = taxes.sgst;
    }

    return {
      ...prev,
      taxableValue: value,
      cgst: newCgst,
      sgst: newSgst,
      // Calculate Bill Value using the NEW taxable value and NEW taxes
      billValue: calculateBillValue(value, newCgst, newSgst),
    };
  });
};

const handleGstRateChange = (e, setFormData) => {
  const value = e.target.value;
  if (value < 0) return;

  setFormData((prev) => {
    // Recalculate taxes based on existing Taxable Value
    const { cgst, sgst } = calculateTaxes(prev.taxableValue, value);

    return {
      ...prev,
      gstRate: value,
      cgst: cgst,
      sgst: sgst,
      // Calculate Bill Value using existing Taxable Value and NEW taxes
      billValue: calculateBillValue(prev.taxableValue, cgst, sgst),
    };
  });
};

// --- Helper Functions ---

const calculateTaxes = (taxableValue, rate) => {
  const val = parseFloat(taxableValue);
  const r = parseFloat(rate);

  if (isNaN(val) || isNaN(r)) return { cgst: "", sgst: "" };

  // Total GST = (Value * Rate) / 100
  // CGST = Total / 2
  // SGST = Total / 2
  const totalTax = (val * r) / 100;
  const halfTax = (totalTax / 2).toFixed(2); // Fixing to 2 decimal places

  return { cgst: halfTax, sgst: halfTax };
};

const calculateBillValue = (taxable, cgst, sgst) => {
  const t = parseFloat(taxable) || 0;
  const c = parseFloat(cgst) || 0;
  const s = parseFloat(sgst) || 0;

  // Returns formatted string like "1416.00"
  return (t + c + s).toFixed(2);
};

export {
  calculateTaxes,
  calculateBillValue,
  formatDate,
  handleInvoiceNo,
  handleTaxManualChange,
  handleBillValueChange,
  handleTaxableValueChange,
  handleGstRateChange,
  handleDateChange,
};
