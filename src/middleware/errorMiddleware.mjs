function errorHandler(err, req, res, next) {
  if (err.message === "User not found") {
    return res.status(404).json({ message: err.message });
  }

  if (err.message === "Bad credentials") {
    return res.status(401).json({ message: err.message });
  }

  if (err.message === "Email and password are required") {
    return res.status(401).json({ message: err.message });
  }

  if (err.message === "ID and token required") {
    return res.status(401).json({ message: err.message });
  }

  if (err.message === "Invalid or expired password reset token") {
    return res.status(401).json({ message: err.message });
  }

  if (err.message === "Invalid or expired account activate token") {
    return res.status(401).json({ message: err.message });
  }

  res.status(500).json({ message: "Internal Server Error" });
}

export default errorHandler;
