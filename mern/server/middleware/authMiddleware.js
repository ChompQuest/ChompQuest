import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // 1. Get token from the Authorization header
  const authHeader = req.header("Authorization");

  // 2. Check if the header exists
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // 3. Check if the token is in the "Bearer <token>" format
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Token format is invalid, authorization denied" });
  }

  // 4. Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach the decoded payload (user info) to the request object
    next(); // Proceed to the route handler
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware; 