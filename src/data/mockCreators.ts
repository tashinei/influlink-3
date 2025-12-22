import { useTranslation } from "@/hooks/useTranslation";

export const useCreatorNiches = (): string[] => {
  const { t } = useTranslation();

  const raw = t("form.arrays.creatorNiches");

  return Array.isArray(raw) ? raw : [];
};

export const useCreatorCountries = (): string[] => {
  const { t } = useTranslation();

  const raw = t("form.countries");

  return Array.isArray(raw) ? raw : [];
};
