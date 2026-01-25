import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const outputSheetSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    year: {
      type: Number,
      required: [true, "Please provide a year"],
    },
    quarter: {
      type: String,
      required: [true, "Please provide a quarter"],
    },
    particulars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "outputParticulars", // Should be a STRING of the model name, not the model itself
      },
    ],
  },
  {
    timestamps: true, // Optional: adds createdAt and updatedAt fields
  },
);

const OutputSheet =
  mongoose.models.outputSheets ||
  mongoose.model("outputSheets", outputSheetSchema);

export default OutputSheet;
