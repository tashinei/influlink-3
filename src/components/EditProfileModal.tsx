import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronDown, ChevronUp, Twitter, Instagram, Facebook, Linkedin } from "lucide-react";
import { ProfileData } from "@/types/profile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";

type EditableProfileFields = Pick<ProfileData, 'name' | 'bio' | 'niche' | 'location'>;
type SocialLinks = Record<string, string>;

interface EditProfileModalProps {
  profile: ProfileData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: Partial<ProfileData>) => Promise<void>;
}

export const EditProfileModal = ({ profile, isOpen, onClose, onSave }: EditProfileModalProps) => {
  const { t } = useTranslation();

  const NICHE_ARRAY_STRINGS: string[] = t('form.arrays.creatorNiches') as unknown as string[];
  const NICHE_PLACEHOLDER = t('form.placeholders.yourNiche');

  const [form, setForm] = useState<EditableProfileFields>({
    name: profile.name,
    bio: profile.bio,
    niche: profile.niche || NICHE_PLACEHOLDER,
    location: profile.location,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [socialExpanded, setSocialExpanded] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(profile.socialLinks || {});

  useEffect(() => {
    setForm({
      name: profile.name,
      bio: profile.bio,
      niche: profile.niche || NICHE_PLACEHOLDER,
      location: profile.location,
    });
    setSocialLinks(profile.socialLinks || {});
  }, [profile, NICHE_PLACEHOLDER]);

  const nicheOptions = useMemo(
    () => NICHE_ARRAY_STRINGS.map(n => ({ code: n, name: n })),
    [NICHE_ARRAY_STRINGS]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setForm(prev => ({ ...prev, niche: value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
  };

  const handleSave = async () => {
    if (!form.niche || form.niche === NICHE_PLACEHOLDER) {
      alert(t('form.validation.nicheRequired'));
      return;
    }

    setIsSaving(true);
    try {
      const updates: Partial<ProfileData> = Object.keys(form).reduce((acc, key) => {
        const k = key as keyof EditableProfileFields;
        if (form[k] !== profile[k]) acc[k] = form[k];
        return acc;
      }, {} as Partial<ProfileData>);

      if (JSON.stringify(socialLinks) !== JSON.stringify(profile.socialLinks || {})) {
        updates.socialLinks = socialLinks;
      }

      await onSave(updates);
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const socialIconMap: Record<string, JSX.Element> = {
    X: <i className="fa-brands fa-x-twitter absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-500"></i>,
    Instagram: <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />,
    Facebook: <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />,
    LinkedIn: <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background rounded-xl w-full max-w-lg p-0 flex flex-col max-h-[90vh]">
        {/* Fixed Header */}
        <DialogHeader className="px-10 pt-10 pb-4 border-b shrink-0">
          <DialogTitle className="text-2xl font-bold">{t('editProfile.title')}</DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-10 py-4">
          <div className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground/80">{t('editProfile.subtitle')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">{t('form.labels.name')}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t('form.placeholders.name')}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="niche">{t('form.labels.niche')}</Label>
                  <Select onValueChange={handleSelectChange} value={form.niche}>
                    <SelectTrigger id="niche" className="w-full">
                      <SelectValue placeholder={NICHE_PLACEHOLDER} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="placeholder" value={NICHE_PLACEHOLDER} disabled>{NICHE_PLACEHOLDER}</SelectItem>
                      {nicheOptions.map(n => (
                        <SelectItem key={n.code} value={n.code}>{n.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="location">{t('form.labels.country')}</Label>
                <Input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder={t('form.placeholders.country')}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="bio">{t('form.labels.audience')}</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder={t('form.placeholders.description')}
                  className="min-h-[100px]"
                  maxLength={160}
                />
              </div>
            </section>

            <Separator />

            {/* Collapsible Social Media Section */}
            <section className="space-y-2">
              <button
                type="button"
                className="flex items-center justify-between w-full text-left text-lg font-semibold"
                onClick={() => setSocialExpanded(prev => !prev)}
              >
                {`Social Media & Links`}
                {socialExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {socialExpanded && (
                <div className="space-y-3 pt-2">
                  {['X', 'Instagram', 'Facebook', 'LinkedIn'].map(platform => (
                    <div key={platform} className="space-y-1">
                      <Label htmlFor={platform.toLowerCase()}>{platform}</Label>
                      <div className="relative">
                        {socialIconMap[platform]}
                        <Input
                          id={platform.toLowerCase()}
                          value={socialLinks[platform] || ''}
                          onChange={e => handleSocialChange(platform, e.target.value)}
                          placeholder={`Enter your ${platform} URL`}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="px-10 pb-10 pt-4 border-t shrink-0 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>{t('common.back')}</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('common.loading')}</> : t('common.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
