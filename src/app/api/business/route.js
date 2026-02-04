import { connect } from "@/dbConnection/dbConfig";
import Business from "@/models/businessModel";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { withAPIHandler } from "@/middleware/apiMiddleware";

async function postHandler(request, authContext, monitor) {
  await connect();

  const reqBody = await request.json();
  const { businessName, gstNo } = reqBody;

  // Input validation
  if (!businessName?.trim() || !gstNo?.trim()) {
    return NextResponse.json(
      { error: "Business name and GST number are required" },
      { status: 400 },
    );
  }

  // Optional: GST format validation (15 characters for Indian GST)
  if (gstNo.length !== 15) {
    return NextResponse.json(
      { error: "Invalid GST number format" },
      { status: 400 },
    );
  }

  const existingBusiness = await Business.findOne({
    $or: [{ businessName }, { gstNo }],
    createdBy: authContext.userId,
  });

  if (existingBusiness) {
    const conflictField =
      existingBusiness.businessName === businessName
        ? "business name"
        : "GST number";
    return NextResponse.json(
      { error: `Business with this ${conflictField} already exists` },
      { status: 400 },
    );
  }

  const newBusiness = new Business({
    uuid: uuidv4(),
    businessName: businessName.trim(),
    gstNo: gstNo.trim(),
    createdBy: authContext.userId,
  });

  const savedBusiness = await newBusiness.save();

  monitor.log("info", "Business created successfully", {
    businessId: savedBusiness._id,
    userId: authContext.userId,
  });

  return NextResponse.json({
    message: "Business created successfully",
    success: true,
    business: savedBusiness,
  });
}

async function getHandler(request, authContext, monitor) {
  await connect();

  const businesses = await Business.find({ createdBy: authContext.userId });

  monitor.log("info", "Businesses fetched", {
    count: businesses.length,
    userId: authContext.userId,
  });

  return NextResponse.json({ businesses });
}

export const POST = withAPIHandler(postHandler, {
  requireAuth: true,
  endpoint: "/api/business",
  allowedMethods: ["POST"],
});

export const GET = withAPIHandler(getHandler, {
  requireAuth: true,
  endpoint: "/api/business",
  allowedMethods: ["GET"],
});
