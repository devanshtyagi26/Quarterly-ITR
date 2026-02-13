import fs from "fs";
import path from "path";
import os from "os";

export async function saveToSystemStorage(buffer, filename) {
  let storageDir;

  // Detect if we are on a Windows machine (Local Dev) or Linux (Production Server)
  const isWindows = process.platform === "win32";
  const isDev = process.env.NODE_ENV === "development";

  if (isDev && isWindows) {
    // For local development, saving in the project is fine
    storageDir = path.join(process.cwd(), "tmp", "exports");
  } else {
    // In a real Linux production environment, we use /var/tmp or a persistent volume
    // /tmp is cleared on reboot, which is good for storage maintenance
    storageDir = "/var/tmp/app-exports";
  }

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const safeName = `${Date.now()}-${filename.replace(/\s+/g, "_")}`;
  const finalPath = path.join(storageDir, safeName);

  fs.writeFileSync(finalPath, buffer);
  return finalPath;
}
