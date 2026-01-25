import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const outputParticularSchema = new mongoose.Schema({
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
  invoiceNo: {
    type: String,
    required: [true, "Please provide an invoice number"],
  },
  invoiceDate: {
    type: Date,
    required: [true, "Please provide an invoice date"],
  },
  taxableValue: {
    type: Number,
    required: [true, "Please provide a taxable value"],
  },
  gstRate: {
    type: Number,
    required: [true, "Please provide a GST rate"],
  },
  cgst: {
    type: Number,
    required: [true, "Please provide CGST amount"],
  },
  sgst: {
    type: Number,
    required: [true, "Please provide SGST amount"],
  },
  totalBill: {
    type: Number,
    required: [true, "Please provide total bill amount"],
  },
});

const OutputParticular =
  mongoose.models.outputParticulars ||
  mongoose.model("outputParticulars", outputParticularSchema);

export default OutputParticular;
