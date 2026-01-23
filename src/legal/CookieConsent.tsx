"use client";

import React, { useState, useEffect } from "react";
import { Shield, Settings2, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/hooks/useTranslation"; // Using your custom hook
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name?: string;
  description?: string;
  icon?: React.ReactNode;
  isEssential?: boolean;
}

interface CookieConsentProps {
  categories: Category[];
  onAccept: (preferences: boolean[]) => void;
  onDecline: () => void;
  cookiePolicyUrl?: string;
  className?: string;
}

export function CookieConsent({
  categories,
  onAccept,
  onDecline,
  className,
}: CookieConsentProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("cookie_consent_given");
    if (!saved) setIsOpen(true);
    
    const initialPrefs: Record<string, boolean> = {};
    categories.forEach((cat) => {
      initialPrefs[cat.id] = cat.isEssential || false;
    });
    setPreferences(initialPrefs);
  }, [categories]);

  const saveConsent = (prefsArray: boolean[]) => {
    localStorage.setItem("cookie_consent_given", "true");
    localStorage.setItem("cookie_preferences", JSON.stringify(prefsArray));
    onAccept(prefsArray);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Floating Mini Banner */}
      <div className={cn("fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:max-w-md", className)}>
        <div className="bg-white border shadow-2xl rounded-xl p-6 border-slate-200">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{t("cookies.banner.title")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("cookies.banner.description")}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => setShowSettings(true)}>
              <Settings2 className="mr-2 h-4 w-4" />
              {t("cookies.buttons.settings")}
            </Button>
            <Button className="flex-1" onClick={() => saveConsent(categories.map(() => true))}>
              {t("cookies.buttons.acceptAll")}
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md !p-10">
          <DialogHeader>
            <DialogTitle>{t("cookies.banner.title")}</DialogTitle>
            <DialogDescription>{t("cookies.banner.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-start gap-4">
                <Checkbox 
                  id={cat.id}
                  disabled={cat.isEssential}
                  checked={preferences[cat.id]}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, [cat.id]: !!checked }))
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor={cat.id} className="flex items-center gap-2 font-medium cursor-pointer">
                    {cat.icon}
                    {t(`cookies.categories.${cat.id}.name`)}
                    {cat.isEssential && (
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold text-slate-500">
                        {t("cookies.misc.essentialTag")}
                      </span>
                    )}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t(`cookies.categories.${cat.id}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" className="sm:mr-auto border-2" onClick={() => {
              onDecline();
              saveConsent(categories.map(c => !!c.isEssential));
            }}>
              {t("cookies.buttons.declineAll")}
            </Button>
            <Button onClick={() => saveConsent(categories.map(cat => preferences[cat.id]))}>
              {t("cookies.buttons.saveChoice")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}