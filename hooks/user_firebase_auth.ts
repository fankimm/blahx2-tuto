import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import FirebaseClient from '@/models/firebase-client';
import { InAuthUser } from '../models/in_auth_user';

const useFirebaseAuth = () => {
  const [authUser, setAuthUser] = useState<InAuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const signInWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
      const signInResult = await signInWithPopup(FirebaseClient.getInstance().Auth, provider);
      if (signInResult.user) {
        const resp = await fetch('/api/members.add', {
          method: 'POST',
          body: JSON.stringify({
            uid: signInResult.user.uid,
            email: signInResult.user.email,
            displayName: signInResult.user.displayName,
            photoURL: signInResult.user.photoURL,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const respData = await resp.json();
      }
    } catch (err) {
      console.error(err);
    }
  };
  const clear = () => {
    setAuthUser(null);
    setLoading(true);
  };
  const signOut = () => FirebaseClient.getInstance().Auth.signOut().then(clear);

  const authStateChanged = async (authState: User | null) => {
    if (!authState) {
      setAuthUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setAuthUser({
      uid: authState.uid,
      email: authState.email,
      photoURL: authState.photoURL,
      displayName: authState.displayName,
    });
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = FirebaseClient.getInstance().Auth.onAuthStateChanged(authStateChanged);
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    loading,
    signInWithGoogle,
    signOut,
  };
};

export default useFirebaseAuth;
