'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountSettingsPage() {
  const t = useTranslations('Account');
  const { data: session } = authClient.useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
  });

  React.useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: '',
      });
    }
  }, [session]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement user update API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(t('settings.saveSuccess'));
      setIsEditing(false);
    } catch (error) {
      toast.error(t('settings.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">{t('settings.title')}</h1>

      {/* Avatar Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.avatar')}</CardTitle>
          <CardDescription>
            Foto de perfil visible en tus anuncios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback className="text-2xl">
                {session?.user?.name ? (
                  getInitials(session.user.name)
                ) : (
                  <User className="h-12 w-12" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Cambiar foto
              </Button>
              <FieldDescription className="text-xs">
                JPG, PNG o GIF. Máx 2MB.
              </FieldDescription>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {t('settings.personalInfo')}
              </CardTitle>
              <CardDescription>Información básica de tu cuenta</CardDescription>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name">
              <User className="h-4 w-4 inline mr-2" />
              {t('settings.name')}
            </FieldLabel>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Tu nombre completo"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">
              <Mail className="h-4 w-4 inline mr-2" />
              {t('settings.email')}
            </FieldLabel>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled={true}
              className="bg-muted"
            />
            <FieldDescription className="text-xs">
              El email no puede ser modificado
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">
              <Phone className="h-4 w-4 inline mr-2" />
              {t('settings.phone')}
            </FieldLabel>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={!isEditing}
              placeholder="+52 xxx xxx xxxx"
            />
          </Field>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? t('settings.saving') : t('settings.save')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: session?.user?.name || '',
                    email: session?.user?.email || '',
                    phone: '',
                  });
                }}
                disabled={isSaving}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
