"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function VerifyEmail() {
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const verifyUserEmail = async () => {
    
    try {
      const res = await fetch("/api/auth/verifyemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
      setVerified(true);

      const data = await res.json();
      if (res.status === 200) {
        setVerified(true);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    const urlParams = window.location.search.split("=")[1];
    setToken(urlParams || "");
  }, []);

  useEffect(() => {
    if (token.length > 0) {
      verifyUserEmail();
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-4xl backdrop-blur-3xl">
      {verified ? (
        <div className="text-green-500">
          <h1>Email verified successfully!</h1>
          <Link href="/login" className="text-blue-500">
            Go to Login
          </Link>
        </div>
      ) : (
        <div className="text-red-500">
          {error ? (
            <h1>{error}</h1>
          ) : (
            <h1>Verifying your email...</h1>
          )}
        </div>
      )}
    </div>
  );
}
