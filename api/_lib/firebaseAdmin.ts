import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const DATABASE_ID = process.env.FIREBASE_DATABASE_ID || "ai-studio-d8ed89a2-6662-4aa5-9cc7-1e8d0693722e";

let cachedFirestore: Firestore | null | undefined;

export function getAdminFirestore(): Firestore | null {
  if (cachedFirestore !== undefined) return cachedFirestore;

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawServiceAccount) {
    cachedFirestore = null;
    return cachedFirestore;
  }

  try {
    const serviceAccount = JSON.parse(rawServiceAccount) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
      cachedFirestore = null;
      return cachedFirestore;
    }

    const app = getApps().find((candidate) => candidate.name === "qul-server") || initializeApp({
      credential: cert(serviceAccount as any),
      projectId: serviceAccount.project_id,
    }, "qul-server");
    cachedFirestore = getFirestore(app, DATABASE_ID);
    return cachedFirestore;
  } catch (error) {
    console.error("Firebase Admin configuration is invalid", error instanceof Error ? error.message : "unknown error");
    cachedFirestore = null;
    return cachedFirestore;
  }
}
