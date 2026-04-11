"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail } from "@/actions/auth";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Lien de vérification invalide.");
      return;
    }

    verifyEmail(token).then((result) => {
      if (result.error) {
        setStatus("error");
        setError(result.error);
      } else {
        setStatus("success");
      }
    });
  }, [token]);

  if (status === "loading") {
    return (
      <div className="text-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Valoravis
        </Link>
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mt-6 mb-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h1 className="text-xl font-semibold">Vérification en cours...</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Veuillez patienter pendant que nous vérifions votre email.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Valoravis
        </Link>
        <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center mx-auto mt-6 mb-4">
          <AlertTriangle className="w-7 h-7 text-warning" />
        </div>
        <h1 className="text-xl font-bold mb-2">Vérification échouée</h1>
        <p className="text-muted-foreground text-sm mb-6">{error}</p>
        <Link
          href="/check-email"
          className="text-primary text-sm font-medium hover:underline"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Link href="/" className="text-2xl font-bold text-primary">
        Valoravis
      </Link>
      <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mt-6 mb-4">
        <CheckCircle className="w-7 h-7 text-success" />
      </div>
      <h1 className="text-xl font-bold mb-2">Email vérifié !</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Votre compte est maintenant actif. Vous pouvez vous connecter.
      </p>
      <button
        onClick={() => router.push("/login")}
        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 text-sm"
      >
        Se connecter
      </button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-dvh w-full flex flex-col justify-start sm:justify-center px-4 pt-10 sm:pt-0 pb-8">
      <div className="w-full sm:max-w-md lg:max-w-lg sm:mx-auto sm:bg-card sm:border sm:border-border sm:rounded-2xl sm:shadow-sm sm:p-8 lg:p-10">
        <Suspense
          fallback={
            <div className="text-center text-muted-foreground">Chargement...</div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
