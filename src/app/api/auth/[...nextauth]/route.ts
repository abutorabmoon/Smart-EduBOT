// import NextAuth from "next-auth/next";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { User } from "@/model/user-model";
// import dbConnect from "@/lib/dbConnect";
// import { compare } from "bcryptjs";

// export const authOptions = {
//  session: {
//     strategy: "jwt",
//   },

//   pages: {
//     signIn: "/login",
//   },

//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: {},
//         password: {},
//       },
//       async authorize(credentials, req) {
//         try {
//           await dbConnect();
//           const user = await User.findOne({ email: credentials.email });

//           if (user) {
//             console.log("User verified:", user.isVerified);

//             if (user.isVerified) {
//               const passwordCorrect = await compare(
//                 credentials?.password || "",
//                 user.password
//               );
//               if (passwordCorrect) {
//                 console.log(
//                   `🎉 Login successful for user: ${credentials?.email}`
//                 );
//                 return {
//                   id: user.id,
//                   name: user.name,
//                   email: user.email,
//                 };
//               } else {
//                 throw new Error("Incorrect password");
//               }
//             } else {
//               throw new Error(
//                 "Your account is not verified. Please verify your email."
//               );
//               console.log("User not verified");
//             }
//           } else {
//             throw new Error("No account found with this email.");
//             console.log(
//               `❌ Login failed for user: ${credentials?.email} - User not found.`
//             );
//           }
//         } catch (error) {
//           console.error("Error during login:", error);
//           throw new Error(error.message);
//         }
//         console.log("credentials", credentials);
//         return null;
//       },
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code",
//         },
//       },
//     }),
//   ],
//   callbacks: {
//     async signIn({ user, account }) {
//       if (account.provider === "google") {
//         try {
//           await dbConnect();
//           const existingUser = await User.findOne({ email: user.email });

//           if (!existingUser) {
//             const newUser = new User({
//               name: user.name,
//               email: user.email,
//               password: "",
//               isVerified: true,
//             });

//             await newUser.save();
//             console.log("✅ Google user added to DB.");
//             return {
//               id: user.id,
//               name: user.name,
//               email: user.email,
//             };

//           } else {
//             console.log("🔁 Google user already in DB.");
//             return true;
//           }
//         } catch (err) {
//           console.error("❌ Error saving Google user:", err);
//           return false;
//         }
//       }
//       return true;
//     },

//     // async signIn({ user, account }) {
//     //   if (account.provider === "google") {
//     //     try {
//     //       await dbConnect();
//     //       const existingUser = await User.findOne({ email: user.email });

//     //       if (existingUser) {
//     //         // console.log("❌ Google user not found in DB.");
//     //         // throw new Error("User does not exist. Please sign up first.");
//     //         return true;
//     //       } else {
//     //         console.log("❌ Google user not found in DB.");
//     //         throw new Error("User does not exist. Please sign up first.");

//     //       }
//     //     } catch (err) {
//     //       console.error("❌ Error checking Google user:", err);
//     //       throw new Error(err.message || "Authentication error");
//     //     }
//     //   }
//     // },
//     async jwt({ token, user, account, profile }) {
//       // For initial sign in
//       if (user) {
//         token.name = user.name;
//         token.email = user.email;
//         token.picture = user.image;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       // Copy token values to session
//       if (token) {
//         session.user.name = token.name;
//         session.user.email = token.email;
//         session.user.image = token.picture;
//       }
//       return session;
//     },

//     async redirect({ url, baseUrl }) {
//       return baseUrl;
//     },
//   },

// }

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

import NextAuth, { AuthOptions, SessionStrategy } from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@/model/user-model";
import dbConnect from "@/lib/dbConnect";
import { compare } from "bcryptjs";
import { AdapterUser } from "next-auth/adapters";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          await dbConnect();
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("No account found with this email");
          }

          console.log("User verified:", user.isVerified);

          if (!user.isVerified) {
            throw new Error(
              "Your account is not verified. Please verify your email."
            );
          }

          if (typeof user.password !== "string") {
            throw new Error("User password is not set.");
          }
          const passwordCorrect = await compare(
            credentials.password,
            user.password
          );

          if (!passwordCorrect) {
            throw new Error("Incorrect password");
          }

          console.log(`🎉 Login successful for user: ${credentials.email}`);
          return {
            id: (user as { _id: { toString: () => string } })._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error: any) {
          console.error("Error during login:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            const newUser = new User({
              name: user.name,
              email: user.email,
              password: "",
              isVerified: true,
            });

            await newUser.save();
            // console.log("✅ Google user added to DB.");
            return true;
          }

          // console.log("🔁 Google user already in DB.");
          return true;
        } catch (err: any) {
          console.error("❌ Error saving Google user:", err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.picture = (user as AdapterUser).image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          name: token.name,
          email: token.email,
          image: token.picture,
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to /chat after successful login
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/chat`;
      }
      // Allows callback URLs to work properly
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
