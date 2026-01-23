import { connect } from "@/dbConnection/dbConfig";
import Business from "@/models/businessModel";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
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
    });

    const savedBusiness = await newBusiness.save();

    return NextResponse.json({
      message: "Business created successfully",
      success: true,
      business: savedBusiness,
    });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { error: "Failed to create business" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    await connect();
    const businesses = await Business.find({});
    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 },
    );
  }
}
