# Configuration de l'envoi d'emails

Ce document explique comment configurer l'envoi d'emails pour la fonctionnalité de récupération de mot de passe.

## Configuration des variables d'environnement

Pour activer l'envoi d'emails, vous devez configurer les variables d'environnement suivantes dans un fichier `.env.local` à la racine du projet frontend :

```
# Configuration du serveur d'email
EMAIL_SERVER_HOST=smtp.votreserveur.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=votre_utilisateur@example.com
EMAIL_SERVER_PASSWORD=votre_mot_de_passe
EMAIL_SERVER_SECURE=false
EMAIL_FROM=noreply@votredomaine.com
```

## Services d'email recommandés

Vous pouvez utiliser l'un des services suivants pour l'envoi d'emails :

1. **SendGrid** : Un service d'envoi d'emails populaire avec un plan gratuit permettant d'envoyer jusqu'à 100 emails par jour.
2. **Mailgun** : Offre un plan gratuit avec un nombre limité d'emails.
3. **Amazon SES** : Solution économique pour l'envoi d'emails à grande échelle.
4. **SMTP de Gmail** : Peut être utilisé pour les tests, mais a des limitations strictes.

## Activation de l'envoi d'emails

Pour activer l'envoi réel d'emails, vous devez décommenter la ligne suivante dans le fichier `src/app/api/auth/forgot-password/route.ts` :

```typescript
// await transporter.sendMail(mailOptions);
```

Remplacez-la par :

```typescript
await transporter.sendMail(mailOptions);
```

## Installation de la dépendance nodemailer

Assurez-vous d'installer la dépendance nodemailer :

```bash
npm install nodemailer
# ou
yarn add nodemailer
```

Et ajoutez les types pour TypeScript :

```bash
npm install --save-dev @types/nodemailer
# ou
yarn add --dev @types/nodemailer
```

## Test de la configuration

Pour tester si votre configuration fonctionne correctement, vous pouvez utiliser la page de récupération de mot de passe et vérifier les logs dans la console du serveur pour voir si l'email est envoyé correctement.