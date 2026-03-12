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

export function CookieConsent({ categories, onAccept, onDecline, className }: CookieConsentProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("cookie_consent_given");
    if (!saved) setIsOpen(true);

    const handleOpenSettings = () => {
      setShowSettings(true);
    };

    window.addEventListener("open-cookie-settings", handleOpenSettings);
    return () => window.removeEventListener("open-cookie-settings", handleOpenSettings);
  }, []);

  const saveConsent = (prefsArray: boolean[]) => {
    localStorage.setItem("cookie_consent_given", "true");
    localStorage.setItem("cookie_preferences", JSON.stringify(prefsArray));
    onAccept(prefsArray);
    setIsOpen(false);
    setShowSettings(false);
  };

  return (
    <>
      {isOpen && (
        <div className={cn(
          "fixed bottom-4 left-4 right-4 z-[50] md:left-auto md:max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300 p-6",
          className
        )}>
          <div className="bg-white border shadow-2xl rounded-2xl p-5 border-slate-200">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">{t("cookies.banner.title")}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {t("cookies.banner.description")}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <Button
                variant="outline"
                className="flex-1 text-xs h-9 rounded-xl"
                onClick={() => setShowSettings(true)}
              >
                <Settings2 className="mr-2 h-3.5 w-3.5" />
                {t("cookies.buttons.settings")}
              </Button>
              <Button
                className="flex-1 text-xs h-9 rounded-xl"
                onClick={() => saveConsent(categories.map(() => true))}
              >
                {t("cookies.buttons.acceptAll")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Controlled by showSettings, independent of isOpen */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-[90vw] md:max-w-md rounded-3xl p-6 md:p-10 z-[50]">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl">{t("cookies.banner.title")}</DialogTitle>
            <DialogDescription className="text-sm">
              {t("cookies.banner.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4 max-h-[50vh] overflow-y-auto px-1">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-start gap-4 p-3 rounded-xl border border-transparent hover:bg-slate-50 transition-colors">
                <Checkbox
                  id={cat.id}
                  disabled={cat.isEssential}
                  checked={cat.isEssential ? true : !!preferences[cat.id]}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, [cat.id]: !!checked }))
                  }
                  className="mt-1"
                />
                <div className="grid gap-1 leading-tight">
                  <label htmlFor={cat.id} className="flex items-center gap-2 font-semibold text-sm cursor-pointer">
                    {t(`cookies.categories.${cat.id}.name`)}
                    {cat.isEssential && (
                      <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">
                        {t("cookies.misc.essentialTag")}
                      </span>
                    )}
                  </label>
                  <p className="text-xs text-muted-foreground leading-normal">
                    {t(`cookies.categories.${cat.id}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="ghost"
              className="w-full sm:w-auto text-xs order-2 sm:order-1"
              onClick={() => {
                onDecline();
                saveConsent(categories.map(c => !!c.isEssential));
              }}
            >
              {t("cookies.buttons.declineAll")}
            </Button>
            <Button
              className="w-full sm:w-auto text-xs order-1 sm:order-2 px-8"
              onClick={() => saveConsent(categories.map(cat => preferences[cat.id]))}
            >
              {t("cookies.buttons.saveChoice")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}