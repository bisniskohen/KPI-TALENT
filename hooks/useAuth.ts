import { useState, useEffect } from 'react';
// Fix: 'onAuthStateChanged' is a method on the auth instance in v8. 'User' type is available on the firebase namespace.
// import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
// Fix: Import firebase v8 compatibility packages to resolve User type.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

interface AuthState {
  // Fix: Use firebase.User for the user type in v8.
  user: firebase.User | null;
  loading: boolean;
}

const useAuth = (): AuthState => {
  // Fix: Use firebase.User for the user type in v8.
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fix: Use the v8 API for listening to auth state changes.
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};

export default useAuth;