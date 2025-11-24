import { translations } from "@/i18n";
import { useUserStore } from "@/store/useUserStore";

export const useTranslation = () => {
  const language = useUserStore((state) => state.language);
  const t = (path: string): string => {
    const keys = path.split(".");
    let result: any = translations[language];
    for (const key of keys) {
      if (result[key] !== undefined) {
        result = result[key];
      } else {
        return path;
      }
    }
    return result;
  };
  return { t, language, setLanguage: useUserStore.getState().setLanguage };
};
