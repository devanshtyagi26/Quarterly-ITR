import * as z from "zod";

const fullSchema = z.object({
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
  billValue: z.coerce.number().min(1, "Bill value must be at least 1"),

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
