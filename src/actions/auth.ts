"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { absoluteUrl } from "@/lib/utils";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// --- Helpers ---
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères";
  }
  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une majuscule";
  }
  if (!/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre";
  }
  return null;
}

// --- Inscription ---
export async function registerUser(formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string) || null;
  const niche = (formData.get("niche") as string) || "DENTIST";
  const customNiche = (formData.get("customNiche") as string) || null;

  if (!email || !password) {
    return { error: "Email et mot de passe requis" };
  }

  if (!validateEmail(email)) {
    return { error: "Adresse email invalide" };
  }

  if (email.length > 255 || (name && name.length > 100)) {
    return { error: "Données trop longues" };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { error: passwordError };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Cette adresse email est déjà associée à un compte. Connectez-vous ou utilisez une autre adresse." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const selectedPlan = (formData.get("plan") as string) || "free";

  const plan = await prisma.plan.findUnique({ where: { key: selectedPlan } });

  const isTrialPlan = plan && plan.trialDays > 0 && plan.price > 0;
  const trialEndsAt = isTrialPlan
    ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000)
    : null;

  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        niche: niche as "DENTIST" | "OSTEOPATH" | "GARAGE" | "OTHER",
        customNiche: niche === "OTHER" ? customNiche : null,
        plan: plan ? plan.key : "free",
        monthlyQuota: plan
          ? plan.quota === 0
            ? 999999
            : plan.quota
          : 50,
        trialEndsAt,
      },
    });
  } catch {
    return { error: "Erreur lors de la création du compte. Réessayez." };
  }

  // Email de bienvenue (non bloquant)
  const planLabel = plan ? plan.name : "Gratuit";
  const dashboardUrl = absoluteUrl("/dashboard");
  const displayName = name || email.split("@")[0];

  sendEmail({
    to: email,
    subject: `Bienvenue sur Valoravis, ${displayName} !`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#ffffff;color:#1a1a1a">
  <h2>Bienvenue sur Valoravis ! 🎉</h2>
  <p>Bonjour ${displayName},</p>
  <p>Votre compte a été créé avec succès. Voici le récapitulatif :</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:8px 0;color:#888">Plan</td><td style="padding:8px 0;font-weight:bold">${planLabel}</td></tr>
    ${trialEndsAt ? `<tr><td style="padding:8px 0;color:#888">Essai gratuit</td><td style="padding:8px 0;font-weight:bold">Jusqu'au ${trialEndsAt.toLocaleDateString("fr-FR")}</td></tr>` : ""}
    <tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0">${email}</td></tr>
  </table>
  <p>Prochaine étape : configurez votre établissement pour commencer à recevoir des avis.</p>
  <a href="${dashboardUrl}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
    Configurer mon établissement
  </a>
  <p style="color:#888;font-size:13px">Si vous n'avez pas créé ce compte, ignorez cet email.</p>
</div>`,
  }).catch((err) => {
    console.error("[register] welcome email failed:", err);
  });

  return { success: true };
}

// --- Mot de passe oublié ---
export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();

  if (!email || !validateEmail(email)) {
    return { error: "Adresse email invalide" };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Toujours retourner succès pour ne pas révéler si l'email existe
  if (!user) {
    return { success: true };
  }

  // Supprimer les anciens tokens pour cet email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  // Générer un token sécurisé
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

  await prisma.passwordResetToken.create({
    data: { email, token, expires },
  });

  // Envoyer l'email
  const resetUrl = absoluteUrl(`/reset-password?token=${token}`);

  try {
    await sendEmail({
      to: email,
      subject: "Réinitialisation de votre mot de passe - Valoravis",
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#ffffff;color:#1a1a1a">
  <h2>Réinitialisation du mot de passe</h2>
  <p>Bonjour,</p>
  <p>Vous avez demandé la réinitialisation de votre mot de passe Valoravis.</p>
  <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
  <a href="${resetUrl}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
    Réinitialiser mon mot de passe
  </a>
  <p style="color:#888;font-size:13px">Ce lien expire dans 1 heure.</p>
  <p style="color:#888;font-size:13px">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
</div>`,
    });
  } catch {
    // Si l'email échoue, supprimer le token créé
    await prisma.passwordResetToken.deleteMany({ where: { email } });
    return { error: "Erreur lors de l'envoi de l'email. Réessayez dans quelques instants." };
  }

  return { success: true };
}

// --- Réinitialiser le mot de passe ---
export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password) {
    return { error: "Données manquantes" };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { error: passwordError };
  }

  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas" };
  }

  // Vérifier le token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return { error: "Lien invalide ou déjà utilisé" };
  }

  if (resetToken.expires < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return { error: "Ce lien a expiré. Veuillez refaire une demande." };
  }

  // Mettre à jour le mot de passe
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });
  } catch {
    return { error: "Erreur lors de la réinitialisation. Réessayez." };
  }

  // Supprimer le token utilisé
  await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

  return { success: true };
}
