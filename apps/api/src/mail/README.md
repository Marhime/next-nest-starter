# Mail Module avec Resend

Module NestJS pour l'envoi d'emails via [Resend](https://resend.com/) avec des templates HTML professionnels.

## 📋 Table des matières

- [Configuration](#configuration)
- [Utilisation dans NestJS](#utilisation-dans-nestjs)
- [Utilisation hors NestJS (better-auth)](#utilisation-hors-nestjs)
- [Templates disponibles](#templates-disponibles)
- [Endpoints de test](#endpoints-de-test)

## ⚙️ Configuration

### Variables d'environnement requises

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@votredomaine.com
WEB_URL=https://votreapp.com
```

### Installation des dépendances

```bash
npm install resend
```

## 🚀 Utilisation dans NestJS

### Importer le module

```typescript
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    // ... autres modules
    MailModule,
  ],
})
export class AppModule {}
```

### Injecter le service

```typescript
import { MailService } from './mail/mail.service';

@Injectable()
export class YourService {
  constructor(private readonly mailService: MailService) {}

  async onUserSignup(email: string, name: string) {
    await this.mailService.sendWelcomeEmail(email, name);
  }
}
```

## 📧 Méthodes disponibles

### 1. `sendEmail(to, subject, html)`

Envoi d'un email générique avec HTML personnalisé.

```typescript
await this.mailService.sendEmail(
  'user@example.com',
  'Sujet personnalisé',
  '<h1>Contenu HTML</h1>',
);
```

### 2. `sendWelcomeEmail(to, userName)`

Envoi d'un email de bienvenue avec template professionnel.

```typescript
await this.mailService.sendWelcomeEmail('user@example.com', 'Jean Dupont');
```

### 3. `sendVerificationEmail(to, userName, verificationToken)`

Envoi d'un email de vérification avec lien et token.

```typescript
await this.mailService.sendVerificationEmail(
  'user@example.com',
  'Jean Dupont',
  'verification-token-xyz',
);
```

**URL générée :** `${WEB_URL}/auth/verify-email?token=${verificationToken}`

### 4. `sendPasswordResetEmail(to, userName, resetToken)`

Envoi d'un email de réinitialisation de mot de passe.

```typescript
await this.mailService.sendPasswordResetEmail(
  'user@example.com',
  'Jean Dupont',
  'reset-token-abc',
);
```

**URL générée :** `${WEB_URL}/auth/forgot-password?token=${resetToken}`

## 🔧 Utilisation hors NestJS

Pour utiliser l'envoi d'emails dans un contexte non-NestJS (comme `better-auth` dans `auth.ts`), utilisez la fonction helper :

```typescript
import { sendWelcomeEmailHelper } from './mail/mail.service';

// Dans votre code better-auth
await sendWelcomeEmailHelper('user@example.com', 'Jean Dupont');
```

## 🎨 Templates disponibles

### Welcome Email

- **Fichier :** `templates/welcome.template.ts`
- **Design :** Gradient violet, CTA pour se connecter
- **Usage :** Inscription réussie

### Verification Email

- **Fichier :** `templates/verification.template.ts`
- **Design :** Gradient vert, CTA pour vérifier
- **Usage :** Vérification d'email lors de l'inscription
- **Expiration :** 24 heures

### Password Reset Email

- **Fichier :** `templates/password-reset.template.ts`
- **Design :** Gradient rouge, CTA pour réinitialiser
- **Usage :** Demande de réinitialisation de mot de passe
- **Expiration :** 1 heure

## 🧪 Endpoints de test

Le module inclut plusieurs endpoints pour tester l'envoi d'emails :

### 1. Test email simple

```bash
GET http://localhost:3000/mail/test?email=test@example.com
```

### 2. Test email de bienvenue

```bash
GET http://localhost:3000/mail/test-welcome?email=test@example.com&name=John
```

### 3. Test email de vérification

```bash
GET http://localhost:3000/mail/test-verification?email=test@example.com&name=John
```

### 4. Test email de réinitialisation

```bash
GET http://localhost:3000/mail/test-reset?email=test@example.com&name=John
```

### 5. Test avec la fonction helper

```bash
GET http://localhost:3000/mail/test-helper?email=test@example.com&name=John
```

## 📁 Structure du module

```
mail/
├── resend.module.ts           # Module global Resend
├── mail.module.ts             # Module principal
├── mail.service.ts            # Service avec méthodes d'envoi
├── mail.controller.ts         # Controller pour les tests
├── templates/
│   ├── index.ts              # Export des templates
│   ├── welcome.template.ts   # Template de bienvenue
│   ├── verification.template.ts  # Template de vérification
│   └── password-reset.template.ts  # Template de reset
└── README.md                 # Cette documentation
```

## 🔐 Sécurité

- ✅ Les tokens sont générés côté backend (better-auth)
- ✅ Les liens expirent automatiquement
- ✅ Les emails sont envoyés via Resend (fiable et sécurisé)
- ✅ Logging des erreurs pour le monitoring

## 📝 Notes

- Tous les templates sont responsive et compatibles avec les principaux clients email
- Les erreurs sont automatiquement loggées via le Logger de NestJS
- Le module utilise `@Global()` pour le ResendModule, donc pas besoin de le réimporter partout
- Les templates utilisent des gradients CSS et des designs modernes

## 🐛 Dépannage

### Erreur : "RESEND_API_KEY is not defined"

Vérifiez que la variable `RESEND_API_KEY` est bien définie dans votre `.env`

### Les emails ne sont pas reçus

1. Vérifiez votre configuration Resend
2. Vérifiez que le domaine `EMAIL_FROM` est vérifié dans Resend
3. Consultez les logs NestJS pour voir les erreurs

### Les liens dans les emails ne fonctionnent pas

Vérifiez que `WEB_URL` est correctement configuré dans votre `.env`
