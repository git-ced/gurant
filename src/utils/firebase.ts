import admin from 'firebase-admin';

const CREDENTIALS: admin.AppOptions = {
  credential: admin.credential.cert({
    projectId: String(process.env.FIREBASE_PROJECT_ID),
    clientEmail: String(process.env.FIREBASE_CLIENT_EMAIL),
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(new RegExp('\\\\n', 'g'), '\n'),
  }),
  databaseURL: String(process.env.FIREBASE_DB_URL),
  serviceAccountId: String(process.env.FIREBASE_CLIENT_EMAIL),
};

export const firebaseAdmin = admin.initializeApp(CREDENTIALS);

export const firebaseAuth = firebaseAdmin.auth();
export const firebaseFirestore = firebaseAdmin.firestore();
