import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { CreatorPlan, PlanDeliverable } from "@/types/profile";
import { PlanDraft } from "@/hooks/useCreatorPlans";
import {
  MAX_DELIVERABLES,
  MAX_PLANS,
  PLAN_DELIVERABLES,
  PLAN_DELIVERY_DAYS,
  PLAN_PLATFORMS,
  PLAN_QUANTITIES,
  PLAN_TIERS,
  PlanPlatform,
  optionLabel,
} from "@/config/planOptions";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

/**
 * Editor for the creator's rate card. The whole list is saved at once, so the
 * dialog holds a local draft and only commits on save — closing discards.
 *
 * Every field except price and description is a fixed dropdown, so packages
 * stay comparable across profiles. The server re-validates each value against
 * the same allowlists (PLAN_* in server.js).
 */

const emptyPlan = (): PlanDraft => ({
  platform: "instagram",
  title: "starter",
  description: "",
  price: 0,
  deliveryDays: 7,
  deliverables: [{ type: "reel", qty: 1 }],
  isFeatured: false,
});

const toDrafts = (plans: CreatorPlan[]): PlanDraft[] =>
  plans.map((p) => ({
    platform: p.platform,
    title: p.title,
    description: p.description,
    price: p.price,
    deliveryDays: p.deliveryDays,
    // Legacy rows arrive with a null quantity; the pickers need a real one.
    deliverables: p.deliverables.map((d) => ({ type: d.type, qty: d.qty ?? 1 })),
    isFeatured: p.isFeatured,
  }));

/** Options still available on this platform (a type can only be listed once). */
const remainingTypes = (platform: string, used: PlanDeliverable[]) =>
  (PLAN_DELIVERABLES[platform as PlanPlatform] ?? []).filter(
    (type) => !used.some((d) => d.type === type)
  );

export function EditPlansDialog({
  open,
  onOpenChange,
  plans,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: CreatorPlan[];
  onSave: (drafts: PlanDraft[]) => Promise<string | null>;
}) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<PlanDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Reset the draft from the server state every time the dialog opens.
  useEffect(() => {
    if (open) setRows(plans.length ? toDrafts(plans) : [emptyPlan()]);
  }, [open, plans]);

  const update = (index: number, patch: Partial<PlanDraft>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  // Switching platform invalidates the deliverables, so reset them to the first
  // option of the new platform rather than silently keeping unavailable ones.
  const changePlatform = (index: number, platform: string) =>
    update(index, {
      platform,
      deliverables: [{ type: PLAN_DELIVERABLES[platform as PlanPlatform][0], qty: 1 }],
    });

  const setDeliverable = (index: number, di: number, patch: Partial<PlanDeliverable>) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, deliverables: r.deliverables.map((d, j) => (j === di ? { ...d, ...patch } : d)) }
          : r
      )
    );

  const addDeliverable = (index: number) =>
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const next = remainingTypes(r.platform, r.deliverables)[0];
        if (!next) return r;
        return { ...r, deliverables: [...r.deliverables, { type: next, qty: 1 }] };
      })
    );

  const removeDeliverable = (index: number, di: number) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, deliverables: r.deliverables.filter((_, j) => j !== di) } : r
      )
    );

  // Only one plan can be the highlighted one.
  const setFeatured = (index: number, value: boolean) =>
    setRows((prev) => prev.map((r, i) => ({ ...r, isFeatured: value && i === index })));

  const move = (index: number, delta: number) =>
    setRows((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const remove = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!Number.isFinite(r.price) || r.price < 0) {
        toast.error(t("plans.errPrice").replace("{{n}}", String(i + 1)));
        return;
      }
      if (r.deliverables.length === 0) {
        toast.error(t("plans.errDeliverables").replace("{{n}}", String(i + 1)));
        return;
      }
    }

    setIsSaving(true);
    const error = await onSave(rows);
    setIsSaving(false);

    if (error) {
      toast.error(error);
      return;
    }
    toast.success(t("plans.saved"));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-6 sm:max-w-2xl">
        <DialogHeader className="space-y-1.5 border-b px-6 py-5 text-left sm:text-left">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {t("plans.editTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("plans.editDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {rows.map((row, i) => {
            const available = remainingTypes(row.platform, row.deliverables);
            return (
              <div key={i} className="rounded-2xl border bg-muted/10 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("plans.planLabel")} {i + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={t("plans.moveUp")}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === rows.length - 1}
                      aria-label={t("plans.moveDown")}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      aria-label={t("plans.remove")}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("plans.fieldPlatform")}</Label>
                    <Select value={row.platform} onValueChange={(v) => changePlatform(i, v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAN_PLATFORMS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {t(`plans.platforms.${p}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("plans.fieldTier")}</Label>
                    <Select value={row.title} onValueChange={(v) => update(i, { title: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAN_TIERS.map((tier) => (
                          <SelectItem key={tier} value={tier}>
                            {t(`plans.tiers.${tier}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`plan-price-${i}`} className="text-xs">
                      {t("plans.fieldPrice")}
                    </Label>
                    <Input
                      id={`plan-price-${i}`}
                      type="number"
                      min={0}
                      step="1"
                      value={row.price || ""}
                      placeholder="0"
                      onChange={(e) => update(i, { price: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("plans.fieldDelivery")}</Label>
                    <Select
                      value={String(row.deliveryDays ?? "")}
                      onValueChange={(v) => update(i, { deliveryDays: Number(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAN_DELIVERY_DAYS.map((d) => (
                          <SelectItem key={d} value={String(d)}>
                            {t("plans.inDays").replace("{{days}}", String(d))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Deliverables: quantity + type, both fixed lists */}
                <div className="mt-3.5 space-y-2">
                  <Label className="text-xs">{t("plans.fieldDeliverables")}</Label>
                  {row.deliverables.map((item, di) => (
                    <div key={di} className="flex items-center gap-2">
                      <Select
                        value={String(item.qty)}
                        onValueChange={(v) => setDeliverable(i, di, { qty: Number(v) })}
                      >
                        <SelectTrigger className="w-20 shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLAN_QUANTITIES.map((q) => (
                            <SelectItem key={q} value={String(q)}>
                              {q}×
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={item.type}
                        onValueChange={(v) => setDeliverable(i, di, { type: v })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Current value plus anything not already used. A
                              legacy free-text value shows as-is until re-picked. */}
                          {[item.type, ...available].map((type) => (
                            <SelectItem key={type} value={type}>
                              {optionLabel(t, "deliverables", type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <button
                        type="button"
                        onClick={() => removeDeliverable(i, di)}
                        disabled={row.deliverables.length === 1}
                        aria-label={t("plans.remove")}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {row.deliverables.length < MAX_DELIVERABLES && available.length > 0 && (
                    <button
                      type="button"
                      onClick={() => addDeliverable(i)}
                      className="text-xs font-semibold text-primary transition-opacity hover:opacity-80"
                    >
                      + {t("plans.addDeliverable")}
                    </button>
                  )}
                </div>

                <div className="mt-3.5 space-y-1.5">
                  <Label htmlFor={`plan-desc-${i}`} className="text-xs">
                    {t("plans.fieldDescription")}
                  </Label>
                  <Textarea
                    id={`plan-desc-${i}`}
                    value={row.description}
                    maxLength={400}
                    rows={2}
                    placeholder={t("plans.descriptionPlaceholder")}
                    onChange={(e) => update(i, { description: e.target.value })}
                  />
                </div>

                <div className="mt-3.5 flex items-center gap-2.5">
                  <Switch
                    id={`plan-featured-${i}`}
                    checked={row.isFeatured}
                    onCheckedChange={(checked) => setFeatured(i, checked)}
                  />
                  <Label htmlFor={`plan-featured-${i}`} className="text-sm font-normal">
                    {t("plans.markPopular")}
                  </Label>
                </div>
              </div>
            );
          })}

          {rows.length < MAX_PLANS && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setRows((prev) => [...prev, emptyPlan()])}
              className="w-full gap-2 rounded-xl border-dashed"
            >
              <Plus className="h-4 w-4" />
              {t("plans.addPlan")}
            </Button>
          )}
          <p className="text-center text-[11px] text-muted-foreground">
            {t("plans.maxHint").replace("{{max}}", String(MAX_PLANS))}
          </p>
        </div>

        <DialogFooter className="gap-2 border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t("plans.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-br from-secondary to-primary text-white"
          >
            {isSaving ? t("plans.saving") : t("plans.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
