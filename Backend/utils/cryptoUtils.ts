import crypto from "crypto";

type EncryptedData = {
  content: string;
  iv: string;
  tag: string;
};

// Encrypt
export function encrypt(text: string): EncryptedData {
  const algorithm = "aes-256-gcm"; // ✅ was "aes-256-cbc"

  const rawKey = process.env.KEY;
  if (!rawKey) {
    throw new Error("KEY is missing in environment variables");
  }

  const SECRET_KEY: Buffer = crypto
    .createHash("sha256")
    .update(rawKey)
    .digest();

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, SECRET_KEY, iv);

  const encrypted = cipher.update(text, "utf8", "hex") + cipher.final("hex");

  return {
    content: encrypted,
    iv: iv.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"), // ✅ was empty
  };
}

// Decrypt
export function decrypt(
  content: string,
  ivHex: string,
  tagHex: string,
): string {
  try {
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const rawKey = process.env.KEY;
    if (!rawKey) {
      throw new Error("KEY is missing in environment variables");
    }

    const SECRET_KEY: Buffer = crypto
      .createHash("sha256")
      .update(rawKey)
      .digest();

    const decipher = crypto.createDecipheriv("aes-256-gcm", SECRET_KEY, iv);
    decipher.setAuthTag(tag);

    const decrypted =
      decipher.update(content, "hex", "utf8") + decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return "[Decryption Failed]";
  }
}