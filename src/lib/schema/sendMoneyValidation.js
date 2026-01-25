import * as z from "zod";

const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const fullSchema = z.object({
  // --- Business Details ---
  businessName: z.string().min(1, "Business name is missing"),
  gstNo: z.string().regex(gstRegex, "Invalid GST Number format"),

  // --- Invoice Details ---
  invoiceDate: z.string().min(1, "Invoice date is required"),
  invoiceNo: z.string().min(1, "Invoice number is required"),

  // --- Financials ---
  taxableValue: z.coerce.number().min(1, "Taxable value must be at least 1"),

  gstRate: z.coerce
    .number()
    .min(1, "GST rate must be at least 1")
    .max(100, "GST rate cannot exceed 100"),

  cgst: z.coerce.number().min(1, "CGST must be at least 1"),
  sgst: z.coerce.number().min(1, "SGST must be at least 1"),
  totalBill: z.coerce.number().min(1, "Total bill must be at least 1"),

  // --- Period Details ---
  year: z.coerce.number().min(2000, "Invalid year").max(2100, "Invalid year"),

  // UPDATED: Quarter [1-4]
  quarter: z.coerce
    .number()
    .int("Quarter must be a whole number")
    .min(1, "Quarter must be between 1 and 4")
    .max(4, "Quarter must be between 1 and 4"),
});
export { fullSchema };
