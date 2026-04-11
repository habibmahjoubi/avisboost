"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resendVerificationEmail } from "@/actions/auth";
import { Mail, RefreshCw } from "lucide-react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  async function handleResend() {
    if (!email) return;
    setResending(true);
    setError("");
    setResent(false);

    const result = await resendVerificationEmail(email);

    if (result.error) {
      setError(result.error);
    } else {
      setResent(true);
    }
    setResending(false);
  }

  return (
    <>
      <div className="text-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Valoravis
        </Link>

        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mt-6 mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-xl font-semibold">Vérifiez votre email</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          Nous avons envoyé un lien de vérification à{" "}
          {email ? (
            <span className="font-medium text-foreground">{email}</span>
          ) : (
            "votre adresse email"
          )}
          . Cliquez sur le lien pour activer votre compte.
        </p>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground space-y-2">
        <p>Le lien expire dans <span className="font-medium">24 heures</span>.</p>
        <p>Pensez à vérifier vos <span className="font-medium">spams</span> si vous ne voyez pas l&apos;email.</p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {resent && (
        <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success">
          Email de vérification renvoyé avec succès.
        </div>
      )}

      {email && (
        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
          {resending ? "Envoi en cours..." : "Renvoyer l'email"}
        </button>
      )}

      <p className="text-center text-sm text-muted-foreground mt-6">
        <Link href="/login" className="text-primary font-medium">
          Retour à la connexion
        </Link>
      </p>
    </>
  );
}

export default function CheckEmailPage() {
  return (
    <div className="min-h-dvh w-full flex flex-col justify-start sm:justify-center px-4 pt-10 sm:pt-0 pb-8">
      <div className="w-full sm:max-w-md lg:max-w-lg sm:mx-auto sm:bg-card sm:border sm:border-border sm:rounded-2xl sm:shadow-sm sm:p-8 lg:p-10">
        <Suspense
          fallback={
            <div className="text-center text-muted-foreground">Chargement...</div>
          }
        >
          <CheckEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
