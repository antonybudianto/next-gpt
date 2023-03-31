import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";

const WHITELISTED_EMAIL = ["antonybudianto@gmail.com"];

export async function verifyToken(token: string) {
  const FBSA_KEY = process.env.FIREBASE_ADMIN_PKEY || "";

  const { verifyIdToken } = getFirebaseAuth(
    {
      projectId: "next-gpt",
      privateKey: FBSA_KEY,
      clientEmail: process.env.FIREBASE_ADMIN_SA_EMAIL || "",
    },
    "firebase-api-key"
  );

  try {
    const payload = await verifyIdToken(token || "");
    if (
      payload.email_verified &&
      WHITELISTED_EMAIL.includes(payload.email || "")
    ) {
      const sharedPayload = {
        name: payload.name,
        email: payload.email,
        email_verified: payload.email_verified,
        user_id: payload.user_id,
        iat: payload.iat,
        exp: payload.exp,
      };

      return sharedPayload;
    } else {
      return {
        email_verified: false,
      };
    }
  } catch (e) {
    console.error("ERR-verifyIdToken:", e);
    throw e;
  }
}
