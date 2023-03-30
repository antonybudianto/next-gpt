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
    <div className="container mx-auto mt-3 lg:mt-10 max-w-3xl">
      <div className="bg-light px-3 lg:px-0 rounded md:my-28">
        <h1 className="font-extrabold text-transparent text-4xl bg-clip-text bg-gradient-to-r from-cyan-400 to-green-600">
          NextGPT
        </h1>
        {loading ? (
          <div className="mt-1">Checking, please wait...</div>
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
