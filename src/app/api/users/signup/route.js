import { connect } from "@/dbConnection/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";
import { v4 as uuidv4 } from "uuid";

await connect();

export async function POST(request) {
  try {
    const reqBody = await request.json();
    console.log(reqBody);

    const { userName, email, password } = reqBody;

    const existingUser = await User.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 400 }
      );
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      uuid: uuidv4(),
      userName,
      email,
      password: hashPassword,
    });

    const savedUser = await newUser.save();
    console.log(savedUser);

    await sendEmail({ email, emailType: "VERIFY", userId: savedUser._id });

    return NextResponse.json({
      message: "User Registered Successfully",
      success: true,
      savedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        { error: `Duplicate value for field: ${field}` },
        { status: 400 }
      );
    }

    console.error("Error during registration:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
