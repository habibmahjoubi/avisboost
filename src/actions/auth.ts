"use server";

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/resend";
import { absoluteUrl, escapeHtml } from "@/lib/utils";
import { headers } from "next/headers";
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

async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

async function generateVerificationToken(email: string): Promise<string> {
  // Supprimer les anciens tokens pour cet email
  await prisma.emailVerificationToken.deleteMany({ where: { email } });

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

  await prisma.emailVerificationToken.create({
    data: { email, token: tokenHash, expires },
  });

  return token;
}

async function sendVerificationEmail(email: string, name: string | null, token: string) {
  const verifyUrl = absoluteUrl(`/verify-email?token=${token}`);
  const displayName = escapeHtml(name || email.split("@")[0]);

  await sendEmail({
    to: email,
    subject: `Vérifiez votre email - Valoravis`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#ffffff;color:#1a1a1a">
  <h2>Bienvenue sur Valoravis !</h2>
  <p>Bonjour ${displayName},</p>
  <p>Merci pour votre inscription. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
  <a href="${verifyUrl}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
    Vérifier mon email
  </a>
  <p style="color:#888;font-size:13px">Ce lien expire dans 24 heures.</p>
  <p style="color:#888;font-size:13px">Si vous n'avez pas créé ce compte, ignorez cet email.</p>
</div>`,
  });
}

// --- Vérifier si un email non vérifié bloque le login ---
export async function checkEmailVerificationStatus(email: string) {
  if (!email || !validateEmail(email)) return { status: "unknown" as const };

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { emailVerified: true },
  });

  if (!user) return { status: "unknown" as const };
  if (!user.emailVerified) return { status: "unverified" as const };
  return { status: "verified" as const };
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

  // Rate limit par email
  const rlEmail = rateLimit(`register:${email}`, { maxAttempts: 5, windowMs: 15 * 60 * 1000 });
  if (!rlEmail.success) {
    return { error: `Trop de tentatives. Réessayez dans ${rlEmail.retryAfterSeconds}s.` };
  }

  // Rate limit par IP (3 inscriptions / 5 minutes)
  const ip = await getClientIp();
  const rlIp = rateLimit(`register-ip:${ip}`, { maxAttempts: 3, windowMs: 5 * 60 * 1000 });
  if (!rlIp.success) {
    return { error: `Trop de tentatives depuis cette adresse. Réessayez dans ${rlIp.retryAfterSeconds}s.` };
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
        businessName: name,
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

  // Envoyer l'email de vérification
  try {
    const token = await generateVerificationToken(email);
    await sendVerificationEmail(email, name, token);
  } catch (err) {
    console.error("[register] verification email failed:", err);
    // Le compte est créé, l'utilisateur pourra renvoyer l'email depuis /check-email
  }

  return { success: true, email };
}

// --- Vérifier l'email ---
export async function verifyEmail(token: string) {
  if (!token) {
    return { error: "Token manquant" };
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token: tokenHash },
  });

  if (!verificationToken) {
    return { error: "Lien invalide ou déjà utilisé" };
  }

  if (verificationToken.expires < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } });
    return { error: "Ce lien a expiré. Demandez un nouveau lien de vérification." };
  }

  // Activer le compte
  try {
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    });
  } catch {
    return { error: "Erreur lors de la vérification. Réessayez." };
  }

  // Supprimer le token utilisé
  await prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } });

  return { success: true };
}

// --- Renvoyer l'email de vérification ---
export async function resendVerificationEmail(email: string) {
  if (!email || !validateEmail(email)) {
    return { error: "Adresse email invalide" };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Rate limit par email (3 renvois / 15 minutes)
  const rl = rateLimit(`resend-verify:${normalizedEmail}`, { maxAttempts: 3, windowMs: 15 * 60 * 1000 });
  if (!rl.success) {
    return { error: `Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds}s.` };
  }

  // Rate limit par IP
  const ip = await getClientIp();
  const rlIp = rateLimit(`resend-verify-ip:${ip}`, { maxAttempts: 5, windowMs: 15 * 60 * 1000 });
  if (!rlIp.success) {
    return { error: `Trop de tentatives. Réessayez dans ${rlIp.retryAfterSeconds}s.` };
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Ne pas révéler si l'email existe — toujours retourner succès
  if (!user || user.emailVerified) {
    return { success: true };
  }

  try {
    const token = await generateVerificationToken(normalizedEmail);
    await sendVerificationEmail(normalizedEmail, user.name, token);
  } catch (err) {
    console.error("[resend-verify] email failed:", err);
    return { error: "Erreur lors de l'envoi. Réessayez dans quelques instants." };
  }

  return { success: true };
}

// --- Mot de passe oublié ---
export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();

  if (!email || !validateEmail(email)) {
    return { error: "Adresse email invalide" };
  }

  const rl = rateLimit(`reset:${email}`, { maxAttempts: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.success) {
    return { error: `Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds}s.` };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Toujours retourner succès pour ne pas révéler si l'email existe
  if (!user) {
    return { success: true };
  }

  // Supprimer les anciens tokens pour cet email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  // Générer un token sécurisé — on stocke le hash en DB, pas le token brut
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

  await prisma.passwordResetToken.create({
    data: { email, token: tokenHash, expires },
  });

  // Envoyer l'email avec le token brut (le user clique dessus)
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

  // Vérifier le token — on hash le token reçu et on compare avec la DB
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: tokenHash },
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
