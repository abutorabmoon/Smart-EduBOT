import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import {User} from "@/model/user-model";

await dbConnect();

export async function POST(request) {
  try {
    const reqBody = await request.json();
    const { token } = reqBody;
    // console.log(token);
    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }
    // console.log("User found:", user);

    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    user.isVerified = true;
    await user.save();

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { message: "Error verifying email" },
      { status: 500 }
    );
  }
}
