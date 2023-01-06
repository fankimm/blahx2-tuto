import { Auth, getAuth } from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const { apiKey, authDomain, projectId } = publicRuntimeConfig;
const FirebaseCredentials = {
  apiKey,
  authDomain,
  projectId,
};

export default class FirebaseClient {
  private static instance: FirebaseClient;

  private auth: Auth;

  public constructor() {
    const apps = getApps();
    if (apps.length === 0) {
      initializeApp(FirebaseCredentials);
    }
    this.auth = getAuth();
  }

  public static getInstance(): FirebaseClient {
    if (!FirebaseClient.instance) {
      FirebaseClient.instance = new FirebaseClient();
    }
    return FirebaseClient.instance;
  }

  public get Auth(): Auth {
    return this.auth;
  }
}
