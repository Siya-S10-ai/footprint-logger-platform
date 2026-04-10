// JWT library for verifying access tokens
const jwt = require('jsonwebtoken')

/*
  Authentication middleware:
  - Extracts the Bearer token from Authorization header
  - Verifies it with the shared secret
  - Attaches decoded user data to req.user
*/
const authMiddleware = (req, res, next) => {
  // Read the Authorization header if present
  const authHeader = req.headers.authorization || ''

  // Expect "Bearer <token>" and strip the prefix
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  // Reject requests without a token
  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token' })
  }

  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Store decoded payload for downstream handlers
    req.user = decoded

    // Continue to the next middleware/route
    return next()
  } catch (error) {
    // Token is invalid, expired, or signed with the wrong secret
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Export the middleware for use in protected routes
module.exports = authMiddleware
