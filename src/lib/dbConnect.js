// import mongoose from "mongoose";

// const connection = {};

// async function dbConnect() {
//   if (connection.isConnected) {
//     // console.log(
//     //   "------------✅ Already connected to the database ------------"
//     // );
//     return;
//   }

//   try {
//     const db = await mongoose.connect(process.env.MONGODB_URI);
//     // console.log("MongoDB URI:", process.env.MONGODB_URI);
//     connection.isConnected = db.connections[0].readyState;

//     // console.log("------------✅ Database connected successfully ------------");
//   } catch (error) {
//     // console.error(
//     //   "------------------------ Database connection failed -----------------------:",
//     //   error
//     // );
//     throw new Error("Failed to connect to the database");
//   }
// }

// export default dbConnect; 





import mongoose from "mongoose";

const connection = {};

async function dbConnect() {
  if (connection.isConnected) {
    // console.log(
    //   "------------✅ Already connected to the database ------------"
    // );
    return;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
    
    const db = await mongoose.connect(process.env.MONGODB_URI);
    // console.log("MongoDB URI:", process.env.MONGODB_URI);
    connection.isConnected = db.connections[0].readyState;

    // console.log("------------✅ Database connected successfully ------------");
  } catch (error) {
    // console.error(
    //   "------------------------ Database connection failed -----------------------:",
    //   error
    // );
    console.error("Database connection error:", error.message);
    
    if (error.message.includes("MONGODB_URI")) {
      throw new Error("Missing database connection string in environment variables");
    } else if (error.name === "MongoServerSelectionError") {
      throw new Error("Could not connect to MongoDB server. Please check your connection");
    } else {
      throw new Error("Failed to connect to the database: " + error.message);
    }
  }
}

export default dbConnect;




