import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const businessSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, "Please provide a business name"],
      unique: true,
    },
    gstNo: {
      type: String,
      required: [true, "Please provide a GST number"],
      unique: true,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

businessSchema.index({ businessName: 1, createdBy: 1 });

const Business =
  mongoose.models.businesses || mongoose.model("businesses", businessSchema);

export default Business;
