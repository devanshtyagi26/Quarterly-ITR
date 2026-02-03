import { NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import Log from "@/models/logModel";
import { connect } from "@/dbConnection/dbConfig";

/**
 * API Monitoring - Logs request details and performance metrics
 */
export class APIMonitor {
  constructor(request, endpoint) {
    this.request = request;
    this.endpoint = endpoint;
    this.startTime = Date.now();
    this.requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.logs = [];
    this.userId = null;
  }

  setUserId(userId) {
    this.userId = userId;
  }

  async log(level, message, meta = {}) {
    const logData = {
      requestId: this.requestId,
      timestamp: new Date().toISOString(),
      level,
      endpoint: this.endpoint,
      method: this.request.method,
      message,
      userId: this.userId,
      ...meta,
    };

    console.log(JSON.stringify(logData));
    this.logs.push(logData);
  }

  async logRequest() {
    const ipAddress =
      this.request.headers.get("x-forwarded-for") ||
      this.request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = this.request.headers.get("user-agent") || "unknown";

    await this.log("info", "Incoming request", {
      ipAddress,
      userAgent,
      url: this.request.url,
    });
  }

  async logResponse(statusCode, success = true) {
    const duration = Date.now() - this.startTime;

    // Determine log level based on status code
    let level = "info";
    if (statusCode >= 400 && statusCode < 500) {
      level = "warn";
    } else if (statusCode >= 500) {
      level = "error";
    }

    await this.log(level, "Response sent", {
      statusCode,
      success,
      duration: `${duration}ms`,
    });

    // Save to database
    await this.saveToDB(statusCode, success, duration);
  }

  async logError(error) {
    const duration = Date.now() - this.startTime;
    await this.log("error", "Request failed", {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    });

    // Save to database
    await this.saveToDB(500, false, duration, error);
  }

  async saveToDB(
    statusCode,
    success,
    duration,
    error = null,
    errorMessage = null,
  ) {
    try {
      await connect();

      const ipAddress =
        this.request.headers.get("x-forwarded-for") ||
        this.request.headers.get("x-real-ip") ||
        "unknown";
      const userAgent = this.request.headers.get("user-agent") || "unknown";

      // Determine log level based on status code
      let level = "info";
      if (error) {
        level = "error";
      } else if (statusCode >= 400 && statusCode < 500) {
        level = "warn";
      } else if (statusCode >= 500) {
        level = "error";
      }

      const logEntry = new Log({
        requestId: this.requestId,
        endpoint: this.endpoint,
        method: this.request.method,
        level,
        message: error
          ? "Request failed"
          : errorMessage ||
            (statusCode >= 400
              ? `Request rejected with status ${statusCode}`
              : "Request completed"),
        userId: this.userId,
        statusCode,
        duration: `${duration}ms`,
        success,
        metadata: this.logs,
        error: error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : errorMessage
            ? {
                message: errorMessage,
              }
            : undefined,
        ipAddress,
        userAgent,
      });

      await logEntry.save();
    } catch (dbError) {
      console.error("Failed to save log to database:", dbError);
    }
  }
}

/**
 * Authentication Middleware
 */
export async function authenticate(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return {
        authenticated: false,
        error: "No authentication token provided. Please login.",
        statusCode: 401,
      };
    }

    const userId = await getDataFromToken(request);

    if (!userId) {
      return {
        authenticated: false,
        error: "Session expired. Please login again.",
        statusCode: 401,
      };
    }

    return {
      authenticated: true,
      userId,
    };
  } catch (error) {
    console.error("Authentication error:", error);

    // Check if it's a token expiration error
    if (error.name === "TokenExpiredError") {
      return {
        authenticated: false,
        error: "Session expired. Please login again.",
        statusCode: 401,
      };
    }

    return {
      authenticated: false,
      error: "Authentication failed. Please login again.",
      statusCode: 401,
    };
  }
}

/**
 * API Handler Wrapper - Combines authentication and monitoring
 */
export function withAPIHandler(handler, options = {}) {
  const {
    requireAuth = true,
    endpoint = "unknown",
    allowedMethods = null,
  } = options;

  return async function (request) {
    const monitor = new APIMonitor(request, endpoint);
    let errorMessageToStore = null;

    try {
      // Skip logging for /api/logs endpoint to prevent recursion
      const shouldLog = !endpoint.includes("/api/logs");

      // Log incoming request
      if (shouldLog) {
        await monitor.logRequest();
      }

      // Method validation
      if (allowedMethods && !allowedMethods.includes(request.method)) {
        errorMessageToStore = `Method ${request.method} not allowed`;
        if (shouldLog) {
          await monitor.log("warn", errorMessageToStore, { statusCode: 405 });
          await monitor.saveToDB(
            405,
            false,
            Date.now() - monitor.startTime,
            null,
            errorMessageToStore,
          );
        }
        return NextResponse.json(
          { error: errorMessageToStore },
          { status: 405 },
        );
      }

      // Authentication check
      let authContext = { authenticated: false, userId: null };

      if (requireAuth) {
        authContext = await authenticate(request);

        if (!authContext.authenticated) {
          errorMessageToStore = authContext.error;
          if (shouldLog) {
            await monitor.log("warn", errorMessageToStore, {
              statusCode: authContext.statusCode,
            });
            await monitor.saveToDB(
              authContext.statusCode,
              false,
              Date.now() - monitor.startTime,
              null,
              errorMessageToStore,
            );
          }
          return NextResponse.json(
            { error: authContext.error },
            { status: authContext.statusCode },
          );
        }

        monitor.setUserId(authContext.userId);
      }

      // Execute the actual handler
      const response = await handler(request, authContext, monitor);

      // Clone response to read body
      const clonedResponse = response.clone();
      const responseData = await clonedResponse.json().catch(() => null);

      // Log error message if present in response
      if (responseData?.error && response.status >= 400 && shouldLog) {
        errorMessageToStore = responseData.error;
        await monitor.log(
          response.status >= 500 ? "error" : "warn",
          errorMessageToStore,
          { statusCode: response.status },
        );
      }

      // Log successful response
      const duration = Date.now() - monitor.startTime;
      if (shouldLog) {
        await monitor.saveToDB(
          response.status || 200,
          response.status < 400,
          duration,
          null,
          errorMessageToStore,
        );
      }

      return response;
    } catch (error) {
      // Log error
      const shouldLog = !endpoint.includes("/api/logs");
      if (shouldLog) {
        await monitor.logError(error);
      }

      return NextResponse.json(
        {
          error: "Internal server error",
          message:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 },
      );
    }
  };
}

/**
 * Rate Limiting (Optional - Basic Implementation)
 */
const rateLimitMap = new Map();

export function rateLimit(identifier, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];

  // Filter requests within the time window
  const recentRequests = userRequests.filter((time) => now - time < windowMs);

  if (recentRequests.length >= limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000),
    };
  }

  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);

  return { allowed: true };
}
