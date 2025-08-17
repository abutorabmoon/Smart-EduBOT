import { NextResponse } from "next/server";
import { User } from "@/model/user-model";
import dbConnect from "@/lib/dbConnect";

export async function POST(req) {
  await dbConnect();
  const { email, otp } = await req.json();
  const user = await User.findOne({ email });

  if (user.otpExpiry < new Date()) {
    return NextResponse.json({ message: "Your OTP has expired" }, { status: 400 });
  } else if (user.otp !== otp) {
    return NextResponse.json({ message: "Your OTP is not correct" }, { status: 401 });
  } else if (!user || user.isVerified) {
    return NextResponse.json(
      { message: "User not registered" },
      { status: 403 }
    );
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  return NextResponse.json(
    {
      message: "Email verified successfully. You can now log in.",
      otpExpiry: user.otpExpiry,
    },
    { status: 200 }
  );
}
