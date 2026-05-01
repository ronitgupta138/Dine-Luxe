import admin from 'firebase-admin';
import { config } from './env';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.FIREBASE_PROJECT_ID,
      // Cloud Run / Railway store the private key with literal \n — unescape here
      privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

export const firebaseAdmin = admin;
export const messaging = admin.messaging();
