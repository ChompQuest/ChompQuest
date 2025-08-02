import jwt from "jsonwebtoken";

// Middleware to check if user is authenticated and has admin role
const adminMiddleware = (req, res, next) => {
  // 1. Get token from the Authorization header
  const authHeader = req.header("Authorization");

  // 2. Check if the header exists
  if (!authHeader) {
    return res.status(401).json({ 
      message: "No token, authorization denied",
      requiresAuth: true 
    });
  }

  // 3. Check if the token is in the "Bearer <token>" format
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ 
      message: "Token format is invalid, authorization denied",
      requiresAuth: true 
    });
  }

  // 4. Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Check if user has admin role
    if (!decoded.user || decoded.user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Access denied. Admin privileges required.",
        requiresAdmin: true 
      });
    }
    
    req.user = decoded.user; // Attach the decoded payload (user info) to the request object
    next(); // Proceed to the route handler
  } catch (err) {
    res.status(401).json({ 
      message: "Token is not valid",
      requiresAuth: true 
    });
  }
};

export default adminMiddleware;