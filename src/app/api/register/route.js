import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect"
import bcrypt from "bcryptjs";
import { transporter } from "@/lib/mailer";
import { generateOTP } from "@/lib/generateOTP"
import { User } from "@/model/user-model";

export const POST = async (request) => {
  try {
    await dbConnect();
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }
    const otp = generateOTP();
    const otpExpiry = new Date(
      Date.now() + parseInt(process.env.OTP_EXPIRY_MS || "60000")
    );
    const hashedPassword = await bcrypt.hash(password, 5);


    const user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
    });
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    });

    return NextResponse.json(
      {
        message: "User registered. Please verify OTP sent to email.",
        otpExpiry: otpExpiry.getTime(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error during registration:", err); 
    return new NextResponse(err.message || "Server error", { status: 500 });
  }
};
