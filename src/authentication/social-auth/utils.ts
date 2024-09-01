function base64Encode(unencoded: any): string {
  return Buffer.from(unencoded || "").toString("base64");
}
function base64urlEncode(unencoded: string | ArrayBuffer): string {
  const encoded: string = base64Encode(unencoded);
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export async function sha256_hash(text: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return base64urlEncode(hashBuffer);
}
