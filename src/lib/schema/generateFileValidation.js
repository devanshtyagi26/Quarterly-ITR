import * as z from "zod";

const fullSchema = z.object({
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
