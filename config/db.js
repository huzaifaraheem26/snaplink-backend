const mongoose = require("mongoose");

const connectDB = async () => {
    // Fail fast with a clear message if the connection string is missing.
    // On Render this is the #1 cause of "Exited with status 1": the .env file
    // is not deployed, so MONGO_URI must be set in the dashboard Environment tab.
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not defined.");
        console.error("Set it in Render → your service → Environment → Environment Variables.");
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);

        // Common Render + Atlas cause: the host's IP isn't allowlisted.
        if (/ETIMEDOUT|ENOTFOUND|querySrv|whitelist|IP address/i.test(error.message || "")) {
            console.error(
                "Hint: In MongoDB Atlas → Network Access, add 0.0.0.0/0 to allow " +
                "connections from Render's dynamic IPs, and verify the credentials in MONGO_URI."
            );
        }
        process.exit(1);
    }
};

module.exports = connectDB;
