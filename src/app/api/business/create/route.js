import { connect } from "@/dbConnection/dbConfig";
import Business from "@/models/businessModel";
import OutputParticular from "@/models/outputParticularModel";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
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
    // Use provided CGST or calculate it: (Taxable * Rate) / 100 / 2 (assuming cgst + sgst = rate)
    // Most Indian GST logic: cgst = (taxable * (rate/100)) / 2
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
      sgst: cgstValue, // Usually SGST = CGST
      totalBill: totalBillValue,
      year: parseInt(year),
      quarter: parseInt(quarter),
    });

    const savedParticular = await newParticular.save();

    // --- IMPORTANT: RETURN THE SUCCESS RESPONSE ---
    return NextResponse.json(
      {
        message: "Invoice created successfully",
        success: true,
        data: savedParticular,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Database Conflict: Duplicate entry detected" },
        { status: 409 },
      );
    }

    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
