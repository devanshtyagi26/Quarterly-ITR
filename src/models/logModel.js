import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["info", "warn", "error"],
      default: "info",
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      index: true,
    },
    statusCode: {
      type: Number,
    },
    duration: {
      type: String,
    },
    success: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    error: {
      message: String,
      stack: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying
logSchema.index({ createdAt: -1 });
logSchema.index({ userId: 1, createdAt: -1 });

const Log = mongoose.models.Log || mongoose.model("Log", logSchema);

export default Log;
