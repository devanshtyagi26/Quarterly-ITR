import { connect } from "@/dbConnection/dbConfig";
import OutputParticular from "@/models/outputParticularModel";
import { NextResponse } from "next/server";
import { withAPIHandler } from "@/middleware/apiMiddleware";

// Helper for cleaner validation logic
function validateParams(year, quarter) {
  if (!year || !quarter) {
    return { error: "Year and quarter are required", status: 400 };
  }

  const currentYear = new Date().getFullYear();
  if (year < 2000 || year > currentYear) {
    return {
      error: `Invalid year. Must be between 2000 and ${currentYear}.`,
      status: 400,
    };
  }

  if (![1, 2, 3, 4].includes(Number(quarter))) {
    return { error: "Invalid quarter. Must be between 1 and 4.", status: 400 };
  }

  return null;
}

async function getHandler(request, authContext, monitor) {
  await connect();

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year"));
  const quarter = parseInt(searchParams.get("quarter"));

  const validationError = validateParams(year, quarter);
  if (validationError) {
    return NextResponse.json(
      { error: validationError.error },
      { status: validationError.status },
    );
  }

  const generatedQuarterReport = await OutputParticular.find({
    createdBy: authContext.userId,
    year,
    quarter,
  }).sort({ invoiceDate: -1 }); // Added sorting for better UX

  monitor.log("info", "Fetched quarterly report", {
    userId: authContext.userId,
    year,
    quarter,
    count: generatedQuarterReport.length,
  });

  return NextResponse.json({
    success: true,
    generatedQuarterReport,
  });
}

async function postHandler(request, authContext, monitor) {
  await connect();

  const { year, quarter } = await request.json();
  const validationError = validateParams(year, quarter);
  if (validationError) {
    return NextResponse.json(
      { error: validationError.error },
      { status: validationError.status },
    );
  }

  // Logic to potentially generate/aggregate data can go here
  const report = await OutputParticular.find({
    createdBy: authContext.userId,
    year,
    quarter,
  });

  return NextResponse.json({
    success: true,
    message: "Report generated successfully",
    generatedQuarterReport: report,
  });
}

export const GET = withAPIHandler(getHandler, {
  requireAuth: true,
  endpoint: "/api/generate",
  allowedMethods: ["GET"],
});

// EXPORT THE POST METHOD
export const POST = withAPIHandler(postHandler, {
  requireAuth: true,
  endpoint: "/api/generate",
  allowedMethods: ["POST"],
});
