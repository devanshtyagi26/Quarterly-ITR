import { connect } from "@/dbConnection/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";

await connect();

export async function POST(request) {
  const userId = await getDataFromToken(request);
  const user = await User.findOne({ uuid: userId }).select("-passoword");

  return NextResponse.json({
    message: "User Found",
    data: user,
  });
}
