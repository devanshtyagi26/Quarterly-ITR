import { connect } from "@/dbConnection/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

await connect();

export async function POST(request) {
  try {
    const reqBody = await request.json();
    console.log("Request Body:", reqBody);

    const { token } = reqBody;
    console.log("Token received:", token);

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });

    console.log("User found:", user);

    if (!user) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 400 });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;

    await user.save();

    return NextResponse.json(
      { message: "Email Verified Successfully", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in verification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
