"use client";

import { useEffect, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import LoadingDots from "@/components/LoadingDots";
import { useToast } from "@/components/hooks/use-toast";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(0);

  
  useEffect(() => {
    const interval = setInterval(() => {
      const expiry = localStorage.getItem("otpExpiry");
      if (expiry) {
        const timeRemaining = Math.floor(
          (parseInt(expiry) - Date.now()) / 1000
        );
        setTimeLeft(timeRemaining > 0 ? timeRemaining : 0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const storedEmail = localStorage.getItem("emailForOtp");
    if (!storedEmail) {
      setMessage("No email found. Please register again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: storedEmail, otp }),
      });

      const data = await response.json();
      switch (response.status) {
        case 200:
          toast({
            title: "OTP Verified",
            description: data.message,
          });
          localStorage.removeItem("emailForOtp");
          localStorage.removeItem("otpExpiry");
          router.push("/login");
          break;
        case 400:
          toast({
            title: "OTP Expired",
            description: data.message,
            variant: "destructive",
          });
          break;
        case 401:
          toast({
            title: "Invalid OTP",
            description: data.message,
            variant: "destructive",
          });
          break;
        case 403:
          toast({
            title: "Access Denied",
            description: data.message,
            variant: "destructive",
          });
          break;
        default:
          toast({
            title: "Verification Failed",
            description: data.message || "Something went wrong.",
            variant: "destructive",
          });
          break;
      }
    } catch (error) {
      toast({
        title: "Error verifying OTP",
        description: error || "Something went wrong.",
        variant: "destructive",
      });
  
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const storedEmail = localStorage.getItem("emailForOtp");
    if (!storedEmail) {
      toast({
        title: "No email found.",
        description: "Please register again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setResending(true);
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: storedEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "OTP Sent",
          description: data.message || "OTP has been resent to your email.",
        });
        if (data.otpExpiry) {
          localStorage.setItem("otpExpiry", data.otpExpiry);
        }
      }
      else if (response.status === 429) {
        toast({
          title: "OTP already sent.",
          description:
            data.message || "Please wait before requesting a new OTP.",
          variant: "destructive",
        });
      } 
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to resend OTP. Try again.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  const verifyDisabled = otp.length !== 6 || loading;
  const resendDisabled = timeLeft > 0 || resending;


  return (
    <div className="w-96 bg-transparent border-2 border-white/10 backdrop-filter backdrop-blur-lg shadow-lg text-white rounded-lg p-8 opacity-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">
        Verify OTP
      </h1>
      <p className="mb-4 text-base text-gray-600 text-center">
        Check your email for a 6-digit code.
      </p>

      <div className="flex justify-center items-center relative">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => setOtp(value)}
          className=""
        >
          <InputOTPGroup>
            {[...Array(6)].map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        className="w-full mb-3 text-lg mt-5"
        onClick={handleSubmit}
        disabled={verifyDisabled}
      >
        {loading ? (
          <>
            <span>Verifying...</span>
            <LoadingDots color="bg-white" />
          </>
        ) : (
          "Verify"
        )}
      </Button>

      <Button
        variant="outline"
        className="w-full text-sm text-black"
        onClick={handleResendOtp}
        disabled={resendDisabled}
      >
     {resending ? (
          <>
            <span>Resending...</span>
            <LoadingDots color="bg-black" />
          </>
        ) : timeLeft > 0 ? (
          `Resend OTP in ${timeLeft}s`
        ) : (
          "Resend OTP"
        )}
      </Button>
    </div>
  );
}
