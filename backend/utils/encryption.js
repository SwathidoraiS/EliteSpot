const crypto = require("crypto");

// Encryption algorithm
const algorithm = "aes-256-cbc";

/**
 * Generate a 256-bit key using SHA-256 hash
 * Secret key is taken from environment variable
 */
const key = crypto
  .createHash("sha256")
  .update(process.env.DOB_SECRET_KEY)
  .digest();

/**
 * Encrypts plain text using AES-256-CBC
 * @param {string} text - Plain text to encrypt
 * @returns {string} iv:encryptedText (hex format)
 */
function encrypt(text) {
  // Generate a random 16-byte Initialization Vector (IV)
  const iv = crypto.randomBytes(16);

  // Create cipher instance
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  // Encrypt the text
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Return IV + encrypted data (needed for decryption)
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypts encrypted text
 * Handles multiple formats (Date, Buffer, plain string)
 * @param {string|Buffer|Date} encryptedText
 * @returns {string|null}
 */
function decrypt(encryptedText) {
  try {
    // Handle null/undefined
    if (!encryptedText) return null;

    // If SQL returned Date object (for old records)
    if (encryptedText instanceof Date) {
      return encryptedText.toISOString().split("T")[0];
    }

    // If SQL returned Buffer
    if (Buffer.isBuffer(encryptedText)) {
      encryptedText = encryptedText.toString();
    }

    // If already plain text (not encrypted)
    if (typeof encryptedText !== "string" || !encryptedText.includes(":")) {
      return encryptedText;
    }

    // Split IV and encrypted content
    const [ivHex, encrypted] = encryptedText.split(":");

    const iv = Buffer.from(ivHex, "hex");

    // Create decipher instance
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    // Decrypt
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;

  } catch (error) {
    console.error("❌ Decryption failed:", error.message);
    return null; // Fail safely
  }
}

// Export functions
module.exports = { encrypt, decrypt };