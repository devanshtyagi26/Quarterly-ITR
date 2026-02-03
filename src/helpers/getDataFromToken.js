import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function getDataFromToken(request) {
  try {
    const token = request.cookies.get("token")?.value || "";

    if (!token) {
      return null;
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    return decodedToken.uuid;
  } catch (error) {
    // We log the error here for your terminal,
    // but return null so the middleware logic can trigger its own 401 response.
    if (error.name === "TokenExpiredError") {
      console.error("Auth Error: Token has expired");
    } else {
      console.error("Auth Error: Token verification failed", error.message);
    }

    // Instead of throwing, return null to signify "No valid user found"
    return null;
  }
}
