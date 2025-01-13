const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

// Encryption setup (must match the setup used in your main application)
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update("super-secure-key90890")
  .digest("hex")
  .slice(0, 32);
const ALGORITHM = "aes-256-cbc";

// File paths
const logFilePath = path.join(__dirname, "keylog.enc");
const outputFilePath = path.join(__dirname, "decrypted.txt");

// Function to decrypt data
function decryptData(encryptedData) {
  const [ivHex, encryptedHex] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "utf-8"),
    iv
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

// Function to read and decrypt the log file
function decryptLogFile() {
  try {
    // Read the encrypted file
    const encryptedLogs = fs.readFileSync(logFilePath, "utf-8");
    const encryptedEntries = encryptedLogs.split("\n").filter(Boolean); // Filter out empty lines

    // Prepare output array
    const decryptedEntries = [];

    // Decrypt each line
    encryptedEntries.forEach((entry, index) => {
      try {
        const decrypted = decryptData(entry);
        decryptedEntries.push(`${decrypted}`);
      } catch (error) {
        console.error(`Failed to decrypt entry ${index + 1}:`, error.message);
      }
    });

    // Write decrypted logs to file
    fs.writeFileSync(outputFilePath, decryptedEntries.join("\n"), "utf-8");
    console.log(`Decrypted logs written to ${outputFilePath}`);
  } catch (error) {
    console.error("Error reading or decrypting the log file:", error.message);
  }
}

// Run the decryption process
decryptLogFile();
