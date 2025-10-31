# Guide de Migration - De Nodemailer/MailerModule à Resend

Ce guide vous aide à migrer de l'ancien système d'envoi d'emails (Nodemailer + MailerModule) vers le nouveau système basé sur Resend.

## 📦 Étapes de migration

### 1. Désinstaller les anciennes dépendances

```bash
npm uninstall @nestjs-modules/mailer nodemailer @types/nodemailer
```

### 2. Installer Resend

```bash
npm install resend
```

### 3. Mettre à jour les variables d'environnement

**Anciennes variables (à supprimer) :**

```env
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user@example.com
MAIL_PASSWORD=password
MAIL_FROM=noreply@nestjs.com
```

**Nouvelles variables (à ajouter) :**

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@votredomaine.com
WEB_URL=https://votreapp.com
```

> ⚠️ **Important :** Le domaine dans `EMAIL_FROM` doit être vérifié dans votre compte Resend.

### 4. Mettre à jour vos imports

**Avant :**

```typescript
import { MailerService } from '@nestjs-modules/mailer';
```

**Après :**

```typescript
import { MailService } from './mail/mail.service';
```

### 5. Adapter vos appels de méthodes

#### Envoi d'email simple

**Avant :**

```typescript
await this.mailerService.sendMail({
  to: 'user@example.com',
  subject: 'Test',
  text: 'Hello',
});
```

**Après :**

```typescript
await this.mailService.sendEmail(
  'user@example.com',
  'Test',
  '<p>Hello</p>', // HTML requis
);
```

#### Email de bienvenue

**Avant :**

```typescript
await this.mailerService.sendMail({
  to: user.email,
  subject: 'Bienvenue',
  html: `<div>Bienvenue ${user.name}</div>`,
});
```

**Après :**

```typescript
await this.mailService.sendWelcomeEmail(user.email, user.name);
// Template professionnel inclus automatiquement
```

#### Email de vérification

**Avant :**

```typescript
await this.mailerService.sendMail({
  to: user.email,
  subject: 'Vérification',
  html: `<a href="${url}">Cliquez ici</a>`,
});
```

**Après :**

```typescript
await this.mailService.sendVerificationEmail(
  user.email,
  user.name,
  verificationToken,
);
// URL générée automatiquement avec WEB_URL
```

#### Email de réinitialisation de mot de passe

**Avant :**

```typescript
await this.mailerService.sendMail({
  to: user.email,
  subject: 'Reset Password',
  html: `<a href="${resetUrl}">Reset</a>`,
});
```

**Après :**

```typescript
await this.mailService.sendPasswordResetEmail(
  user.email,
  user.name,
  resetToken,
);
// URL générée automatiquement avec WEB_URL
```

## 🎨 Avantages de la migration

### ✅ Avant vs Après

| Aspect             | Avant (Nodemailer)               | Après (Resend)                       |
| ------------------ | -------------------------------- | ------------------------------------ |
| **Configuration**  | SMTP complexe (host, port, auth) | Juste une clé API                    |
| **Templates**      | HTML inline dans le code         | Templates séparés et réutilisables   |
| **Design**         | Basique                          | Professionnel avec gradients         |
| **Responsive**     | Non garanti                      | Optimisé pour mobile                 |
| **Fiabilité**      | Dépend du serveur SMTP           | Infrastructure Resend                |
| **Monitoring**     | Logs manuels                     | Logs automatiques + Dashboard Resend |
| **Deliverability** | Variable                         | Optimisé par Resend                  |

## 🔧 Cas d'usage spéciaux

### Utilisation dans better-auth (hors NestJS)

**Avant :**

```typescript
const transporter = nodemailer.createTransport({...});
await transporter.sendMail({...});
```

**Après :**

```typescript
import { sendWelcomeEmailHelper } from './mail/mail.service';
await sendWelcomeEmailHelper(email, name);
```

### Personnalisation des templates

Les templates sont maintenant dans des fichiers séparés :

- `mail/templates/welcome.template.ts`
- `mail/templates/verification.template.ts`
- `mail/templates/password-reset.template.ts`

Vous pouvez les modifier directement ou créer de nouveaux templates.

## 📝 Checklist de migration

- [ ] Créer un compte Resend et obtenir une clé API
- [ ] Vérifier votre domaine dans Resend
- [ ] Désinstaller les anciennes dépendances
- [ ] Installer Resend
- [ ] Mettre à jour les variables d'environnement
- [ ] Mettre à jour turbo.json (déjà fait ✅)
- [ ] Remplacer les imports dans vos services
- [ ] Adapter les appels de méthodes
- [ ] Tester avec les endpoints `/mail/test-*`
- [ ] Mettre à jour `auth.ts` si vous utilisez better-auth
- [ ] Supprimer l'ancien code Nodemailer

## 🧪 Tester la migration

Utilisez les endpoints de test pour vérifier que tout fonctionne :

```bash
# Test email simple
curl "http://localhost:3000/mail/test?email=votre@email.com"

# Test email de bienvenue
curl "http://localhost:3000/mail/test-welcome?email=votre@email.com&name=John"

# Test email de vérification
curl "http://localhost:3000/mail/test-verification?email=votre@email.com&name=John"

# Test email de reset
curl "http://localhost:3000/mail/test-reset?email=votre@email.com&name=John"
```

## 🆘 Problèmes courants

### "RESEND_API_KEY is not defined"

- Vérifiez votre fichier `.env`
- Redémarrez votre serveur après modification

### Les emails ne sont pas reçus

- Vérifiez que votre domaine est vérifié dans Resend
- Consultez le dashboard Resend pour voir les erreurs
- Vérifiez vos logs NestJS

### Les templates ne s'affichent pas bien

- Les templates sont optimisés pour les principaux clients email
- Testez avec différents clients (Gmail, Outlook, etc.)

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [Dashboard Resend](https://resend.com/dashboard)
- [Module Mail README](./README.md)
