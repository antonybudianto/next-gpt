"use client";

import "@/app/utils/initFirebase";
import { useCallback, useEffect, useState } from "react";
import { getAuth, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";

export default function LoginView() {
  const [loading, setLoading] = useState(true);
  const signInGoogle = useCallback(() => {
    let provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithRedirect(auth, provider).then((res) => {});
  }, []);

  useEffect(() => {
    const auth = getAuth();
    auth.onAuthStateChanged(
      (user) => {
        if (user) {
          window.location.replace("/");
        } else {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="container mx-3 md:mx-auto">
      <div className="mt-3 py-5 bg-light rounded md:my-28">
        <h1 className="text-4xl mb-10">NextGPT Login</h1>
        {loading ? (
          <div>Checking, please wait...</div>
        ) : (
          <>
            <p className="lead">
              Sign-in for free and access your chat histories anywhere.
            </p>
            <div className="mt-5">
              <button
                className="btn btn-default border px-4 py-2 btn-outline-secondary hover:bg-slate-300"
                onClick={signInGoogle}
              >
                <i className="fa fa-google" /> Sign in using Google
              </button>
            </div>
          </>
        )}
      </div>
      <div className="col-md-12"></div>
    </div>
  );
}
