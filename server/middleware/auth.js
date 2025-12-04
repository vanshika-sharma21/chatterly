import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Middleware to protect route
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;

        // Check if token exists
        if (!token) {
            return res.json({ success: false, message: "No token provided" });
        }

        // ✅ Correct: use 'jwt.verify', not 'JsonWebTokenError.verify'
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by decoded ID
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // ✅ Attach user to request and continue
        req.user = user;
        next();

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Controller to check if user is authenticated
export const checkAuth = (req, res)=>{
    res.json({success: true, user: req.user});
}