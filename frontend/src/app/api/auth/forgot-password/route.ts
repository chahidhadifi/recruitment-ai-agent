import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "L'adresse email est requise" },
        { status: 400 }
      );
    }

    // Dans un environnement de production, vous devriez vérifier si l'email existe dans votre base de données
    // Pour cette démonstration, nous supposons que l'email existe

    // Générer un token de réinitialisation (dans un environnement de production, stockez-le dans la base de données)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Configuration du transporteur d'email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'smtp.example.com',
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER || 'user@example.com',
        pass: process.env.EMAIL_SERVER_PASSWORD || 'password',
      },
    });

    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@airecruitment.com',
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Vous avez demandé une réinitialisation de mot de passe. Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Réinitialisation de votre mot de passe</h2>
          <p>Vous avez demandé une réinitialisation de mot de passe pour votre compte AI Recruitment Platform.</p>
          <p>Veuillez cliquer sur le bouton ci-dessous pour réinitialiser votre mot de passe:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Réinitialiser mon mot de passe</a>
          </div>
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
          <p>Ce lien expirera dans 1 heure.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;" />
          <p style="color: #6B7280; font-size: 14px;">AI Recruitment Platform</p>
        </div>
      `,
    };

    // Envoyer l'email (commenté pour éviter l'envoi réel en développement)
    // En mode développement, nous affichons simplement les informations dans la console
    console.log('====== EMAIL DE RÉCUPÉRATION ======');
    console.log('Destinataire:', email);
    console.log('URL de réinitialisation:', resetUrl);
    console.log('====================================');
    
    // Envoi de l'email avec les informations d'identification configurées
    await transporter.sendMail(mailOptions);

    // Pour la démonstration, nous simulons l'envoi d'email
    console.log('Email de réinitialisation envoyé à:', email);
    console.log('URL de réinitialisation:', resetUrl);

    return NextResponse.json(
      { message: "Email de réinitialisation envoyé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    return NextResponse.json(
      { error: "Une erreur s'est produite lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}