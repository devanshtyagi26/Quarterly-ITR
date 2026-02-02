import * as z from "zod";

const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const fullSchema = z.object({
  // --- Business Details ---
  businessName: z.string().min(1, "Business name is missing"),
  gstNo: z.string().regex(gstRegex, "Invalid GST Number format"),
});

export { fullSchema };
