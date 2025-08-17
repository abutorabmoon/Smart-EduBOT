"use client";
import { signIn } from "next-auth/react";
import React from "react";
import { useState } from "react";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import LoadingDots from "@/components/LoadingDots";
import { useToast } from "@/components/hooks/use-toast";
import Image from "next/image";

function Login() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { toast } = useToast();
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/chat" }); 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.ok) {
      toast({
        title: "Login Successful",
        description: "You are ready to go.",
      });
      router.push("/chat");
    } else {
      // Show toast with error from backend
      let errorMessage = "Login failed. Please try again.";

      if (res?.error) {
        errorMessage = res.error;
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });

      setError(errorMessage);
    }
  };
  return (
    <div className="w-96 bg-transparent border-2 border-white/10 backdrop-filter backdrop-blur-lg shadow-lg text-white rounded-lg p-8 opacity-100">
      <h1 className="text-black text-3xl font-bold text-center">Login</h1>
      <p className="text-black text-center mb-6 ">Welcome again!</p>
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full h-11 bg-black text-white font-semibold rounded-full shadow-lg mb-4 flex items-center justify-center"
        disabled={googleLoading}
      >
        {googleLoading ? (
          <>
            <span>Signing in</span>
            <LoadingDots color="bg-white" />
          </>
        ) : (
          <>
            <Image
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className=" mr-2"
              width={20}
              height={20}
            />
            <span>Sign in with Google</span>
          </>
        )}
      </button>
      <div className="flex items-center justify-center mb-4">
        <hr className="w-full border-gray-600" />
        <span className="px-2 text-black">OR</span>
        <hr className="w-full border-gray-600" />
      </div>
      <form onSubmit={handleLogin}>
        <div className="relative w-full h-12 my-8">
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-full bg-transparent border-2 border-gray-600 rounded-full px-5 py-3 text-black placeholder-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-xl text-gray-900">
            <FaUser />
          </div>
        </div>
        <div className="relative w-full h-12 mb-4">
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-full bg-transparent border-2 border-gray-600 rounded-full px-5 py-3 text-black placeholder-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {!isFocused && (
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-xl text-gray-900">
              <MdPassword />
            </div>
          )}
        </div>
        <div className="flex justify-between items-center text-sm mb-4 text-black">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="accent-gray-900 mr-1"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            Remember me
          </label>
          <a href="#" className="text-black hover:underline">
            Forget Password?
          </a>
        </div>
        <button
          type="submit"
          className="w-full h-11 bg-black text-white font-semibold rounded-full shadow-lg  flex items-center justify-center space-x-3 group"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="group-hover:text-xl transition-all duration-200">
                Signing In
              </span>
              <LoadingDots color="bg-white" />
            </>
          ) : (
            <span className="group-hover:text-xl transition-all duration-200">
              Sign In
            </span>
          )}
        </button>

        <div className="text-sm text-black text-center mt-5 group">
          <p>
            Don&apos;t have an account?
            <Link
              href="register"
              className="text-black font-semibold hover:underline ml-1 group-hover:text-xl transition-all duration-200"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
