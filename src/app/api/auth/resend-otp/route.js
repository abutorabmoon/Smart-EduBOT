import { NextResponse } from "next/server";
import {User} from "@/model/user-model";
import { transporter } from "@/lib/mailer";
import { generateOTP } from "@/lib/generateOTP";
import dbConnect from "@/lib/dbConnect";

export async function POST(req) {
  await dbConnect();
  const { email } = await req.json();
  const user = await User.findOne({ email });

  if (!user || user.isVerified) {
    return NextResponse.json(
      { message: "User not found or already verified" },
      { status: 400 }
    );
  }
  const now = new Date();
  if (user.otpExpiry > now) {
    return NextResponse.json(
      {
        message: "OTP already sent. Please wait before requesting a new one.",
      },
      { status: 429 }
    );
  }
  
  const otp = generateOTP();
  // user.otp = otp;
  // user.otpExpiry = new Date(
  //   Date.now() + parseInt(process.env.OTP_EXPIRY_MS || "60000")
  // );
  // await user.save();
  const expiryTime = new Date(
    Date.now() + parseInt(process.env.OTP_EXPIRY_MS || "60000")
  );

  user.otp = otp;
  user.otpExpiry = expiryTime;
  await user.save();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Resend OTP Verification",
    text: `Your new OTP is: ${otp}`,
  });

  return NextResponse.json({
    message: "OTP sent successfully.",
    otpExpiry: expiryTime.getTime(),
  }, { status: 200 });
}
