import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
  try {
    const bearerHeader = req.headers["authorization"];
    console.log(bearerHeader);

    if (!bearerHeader) {
      throw new Error("Falta el token");
    }

    try {
      const payload = jwt.verify(bearerHeader, process.env.JWT_SECRET);
      console.log(payload);
      req.userData = payload;
    } catch (error) {
      console.log(error);
      throw new Error("Token Invalido");
    }

    next();
  } catch (e) {
    next(e);
  }
}
