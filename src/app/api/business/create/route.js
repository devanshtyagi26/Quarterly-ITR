import { connect } from "@/dbConnection/dbConfig";
import Business from "@/models/businessModel";
import OutputParticular from "@/models/outputParticularModel";
import OutputSheet from "@/models/outputSheetModel";
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

    // Comprehensive Input validation
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
        { error: "All financial fields are required" },
        { status: 400 },
      );
    }

    // GST format validation (15 characters for Indian GST)
    if (gstNo.length !== 15) {
      return NextResponse.json(
        { error: "Invalid GST number format (must be 15 characters)" },
        { status: 400 },
      );
    }

    // Check if business exists
    const business = await Business.findOne({ gstNo: gstNo.trim() });

    if (!business) {
      return NextResponse.json(
        {
          error:
            "Business with this GST number does not exist. Please create the business first.",
        },
        { status: 404 },
      );
    }

    // Verify business name matches
    if (business.businessName !== businessName.trim()) {
      return NextResponse.json(
        {
          error:
            "Business name does not match the registered name for this GST number",
          registeredName: business.businessName,
        },
        { status: 400 },
      );
    }

    // Check for duplicate invoice
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

    let cgstValue = cgst;
    let totalBillValue = totalBill;

    if (cgstValue == null || totalBillValue == null) {
      // Calculate CGST and total bill
      cgstValue = (parseFloat(taxableValue) * parseFloat(gstRate)) / 100;
      totalBillValue = parseFloat(taxableValue) + 2 * cgstValue;
    }
    // Create new particular
    const newParticular = new OutputParticular({
      uuid: uuidv4(),
      businessName: businessName.trim(),
      gstNo: gstNo.trim(),
      invoiceNo: invoiceNo.trim(),
      invoiceDate: new Date(invoiceDate),
      taxableValue: parseFloat(taxableValue),
      gstRate: parseFloat(gstRate),
      cgst: parseFloat(cgstValue),
      sgst: parseFloat(cgstValue),
      totalBill: parseFloat(totalBillValue),
    });
    const savedParticular = await newParticular.save();

    // Find or create output sheet for the year-quarter
    let outputSheet = await OutputSheet.findOne({
      year: parseInt(year),
      quarter: quarter,
    });

    if (outputSheet) {
      // Add to existing sheet
      outputSheet.particulars.push(savedParticular._id);
      await outputSheet.save();

      return NextResponse.json({
        message: "Invoice added to existing quarter sheet",
        success: true,
        outputSheet: outputSheet,
        particular: savedParticular,
      });
    } else {
      // Create new output sheet
      const newOutputSheet = new OutputSheet({
        uuid: uuidv4(),
        year: parseInt(year),
        quarter: quarter,
        particulars: [savedParticular._id],
      });
      const savedOutputSheet = await newOutputSheet.save();

      return NextResponse.json({
        message: "Invoice added to new quarter sheet",
        success: true,
        outputSheet: savedOutputSheet,
        particular: savedParticular,
      });
    }
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      {
        error: "Failed to create invoice",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
