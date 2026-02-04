import { connect } from "@/dbConnection/dbConfig";
import Business from "@/models/businessModel";
import OutputParticular from "@/models/outputParticularModel";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { withAPIHandler } from "@/middleware/apiMiddleware";

async function postHandler(request, authContext, monitor) {
  await connect();

  const reqBody = await request.json();
  const {
    businessName,
    gstNo,
    invoiceNo,
    invoiceDate,
    taxableValue,
    gstRate,
    year,
    quarter,
    cgst,
    totalBill,
  } = reqBody;

  // 1. Comprehensive Input validation
  if (!businessName?.trim() || !gstNo?.trim()) {
    return NextResponse.json(
      { error: "Business name and GST number are required" },
      { status: 400 },
    );
  }

  if (!invoiceNo?.trim() || !invoiceDate || !year || !quarter) {
    return NextResponse.json(
      { error: "Invoice number, date, year, and quarter are required" },
      { status: 400 },
    );
  }

  if (taxableValue == null || gstRate == null) {
    return NextResponse.json(
      { error: "Financial fields (Taxable Value/GST Rate) are required" },
      { status: 400 },
    );
  }

  if (gstNo.length !== 15) {
    return NextResponse.json(
      { error: "Invalid GST number format" },
      { status: 400 },
    );
  }

  // 2. Business Verification
  const business = await Business.findOne({ gstNo: gstNo.trim() });
  if (!business) {
    return NextResponse.json(
      { error: "Business not found. Please create it first." },
      { status: 404 },
    );
  }

  if (business.businessName !== businessName.trim()) {
    return NextResponse.json(
      {
        error: "Business name does not match registered name",
        registeredName: business.businessName,
      },
      { status: 400 },
    );
  }

  // 3. Duplicate Check (Manual check before DB insert)
  const duplicateInvoice = await OutputParticular.findOne({
    gstNo: gstNo.trim(),
    invoiceNo: invoiceNo.trim(),
  });

  if (duplicateInvoice) {
    return NextResponse.json(
      { error: "Invoice number already exists for this business" },
      { status: 400 },
    );
  }

  // 4. Financial Calculations
  const parsedTaxable = parseFloat(taxableValue);
  const parsedGstRate = parseFloat(gstRate);
  let cgstValue =
    cgst != null
      ? parseFloat(cgst)
      : (parsedTaxable * (parsedGstRate / 100)) / 2;
  let totalBillValue =
    totalBill != null ? parseFloat(totalBill) : parsedTaxable + cgstValue * 2;

  // 5. Save Document
  const newParticular = new OutputParticular({
    uuid: uuidv4(),
    businessName: businessName.trim(),
    gstNo: gstNo.trim(),
    invoiceNo: invoiceNo.trim(),
    invoiceDate: new Date(invoiceDate),
    taxableValue: parsedTaxable,
    gstRate: parsedGstRate,
    cgst: cgstValue,
    sgst: cgstValue,
    totalBill: totalBillValue,
    year: parseInt(year),
    quarter: parseInt(quarter),
    createdBy: authContext.userId,
  });

  const savedParticular = await newParticular.save();

  monitor.log("info", "Invoice created successfully", {
    invoiceId: savedParticular._id,
    businessName,
    invoiceNo,
    userId: authContext.userId,
  });

  return NextResponse.json(
    {
      message: "Invoice created successfully",
      success: true,
      data: savedParticular,
    },
    { status: 201 },
  );
}

export const POST = withAPIHandler(postHandler, {
  requireAuth: true,
  endpoint: "/api/business/create",
  allowedMethods: ["POST"],
});
