import { connect } from "@/dbConnection/dbConfig";
import OutputParticular from "@/models/outputParticularModel";
import { NextResponse } from "next/server";
import { withAPIHandler } from "@/middleware/apiMiddleware";

async function getHandler(request, authContext, monitor) {
  await connect();

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year"));
  const quarter = parseInt(searchParams.get("quarter"));

  // Input validation
  if (!year || !quarter) {
    return NextResponse.json(
      { error: "Year and quarter parameters are required" },
      { status: 400 },
    );
  }

  const currentYear = new Date().getFullYear();
  if (year < 2000 || year > currentYear) {
    return NextResponse.json(
      { error: "Invalid year. Must be between 2000 and the current year." },
      { status: 400 },
    );
  }

  if (![1, 2, 3, 4].includes(quarter)) {
    return NextResponse.json(
      { error: "Invalid quarter. Must be between 1 and 4." },
      { status: 400 },
    );
  }

  // Fetch only this user's business filtered by year/quarter
  const generatedQuarterReport = await OutputParticular.find({
    createdBy: authContext.userId,
    year,
    quarter,
  });

  monitor.log("info", "Fetched filtered businesses", {
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

export const GET = withAPIHandler(getHandler, {
  requireAuth: true,
  endpoint: "/api/generate",
  allowedMethods: ["GET"],
});
