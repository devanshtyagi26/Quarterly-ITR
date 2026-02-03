import { connect } from "@/dbConnection/dbConfig";
import Log from "@/models/logModel";
import { NextResponse } from "next/server";
import { withAPIHandler, rateLimit } from "@/middleware/apiMiddleware";

async function getHandler(request, authContext, monitor) {
  await connect();
  const { searchParams } = new URL(request.url);
  // 1. Identify the bucket you want to monitor
  // This must match exactly how identifier is built in withAPIHandler: `${endpoint}:${userId}`
  const businessEndpoint = "/api/business";
  const businessIdentifier = `${businessEndpoint}:${authContext.userId}`;

  // 2. Check the current state of that bucket
  // We call rateLimit with the existing settings to get the 'currentCount'
  const businessLimit = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "50"); // Ensure fallback is 50
  const businessLimitStatus = rateLimit(
    businessIdentifier,
    businessLimit, // Use the variable here
    900000,
    true,
  );

  // Query parameters for filtering
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const level = searchParams.get("level"); // info, warn, error
  const endpoint = searchParams.get("endpoint");
  const userId = searchParams.get("userId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  // Build query
  const query = {};

  if (level) query.level = level;
  if (endpoint) query.endpoint = new RegExp(endpoint, "i");
  if (userId) query.userId = userId;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [logs, totalCount] = await Promise.all([
    Log.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Log.countDocuments(query),
  ]);

  // Get statistics
  const stats = await Log.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$level",
        count: { $sum: 1 },
      },
    },
  ]);

  const statistics = {
    total: totalCount,
    info: stats.find((s) => s._id === "info")?.count || 0,
    warn: stats.find((s) => s._id === "warn")?.count || 0,
    error: stats.find((s) => s._id === "error")?.count || 0,
  };

  monitor.log("info", "Logs fetched successfully", {
    page,
    limit,
    totalCount,
  });

  return NextResponse.json({
    success: true,
    logs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
    },
    statistics,
    businessRateLimit: {
      // Use the 'businessLimit' variable you calculated at the top of the function
      remaining: Math.max(0, businessLimit - businessLimitStatus.currentCount),
      limit: businessLimit,
      currentCount: businessLimitStatus.currentCount,
    },
  });
}

async function deleteHandler(request, authContext, monitor) {
  await connect();

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await Log.deleteMany({
    createdAt: { $lt: cutoffDate },
  });

  monitor.log("info", "Old logs deleted", {
    deletedCount: result.deletedCount,
    days,
  });

  return NextResponse.json({
    success: true,
    message: `Deleted ${result.deletedCount} logs older than ${days} days`,
    deletedCount: result.deletedCount,
  });
}

export const GET = withAPIHandler(getHandler, {
  requireAuth: true,
  endpoint: "/api/logs",
  allowedMethods: ["GET"],
  rateLimitConfig: { limit: 100, windowMs: 60000 }, // 100 requests per minute for logs
});

export const DELETE = withAPIHandler(deleteHandler, {
  requireAuth: true,
  endpoint: "/api/logs",
  allowedMethods: ["DELETE"],
});
