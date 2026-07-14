import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, ShieldCheck, ChevronRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentBreakdown {
    dealAmount: number;
    stripeFee: number;
    commissionAmount: number;
    commissionPercent: number;
    totalCharged: number;
    creatorPayout: number;
    currency: string;
}

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dealAmount: number;
    creatorId: string;
    campaignId: string | number;
    creatorName?: string;
    campaignName?: string;
    onSuccess?: () => void;
}

const BreakdownRow = ({
    label,
    value,
    sub,
    highlight,
    bold,
}: {
    label: string;
    value: string;
    sub?: string;
    highlight?: boolean;
    bold?: boolean;
}) => (
    <div
        className={`flex items-start justify-between py-2 ${highlight ? "border-t pt-3" : ""
            }`}
    >
        <div>
            <p className={`text-sm ${bold ? "font-semibold" : "text-muted-foreground"}`}>
                {label}
            </p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        <p className={`text-sm ${bold ? "font-semibold" : ""}`}>{value}</p>
    </div>
);

const CheckoutForm = ({
    breakdown,
    onSuccess,
    onClose,
}: {
    breakdown: PaymentBreakdown;
    onSuccess?: () => void;
    onClose: () => void;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isPaying, setIsPaying] = useState(false);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: breakdown.currency || "USD",
        }).format(amount);

    const handlePay = async () => {
        if (!stripe || !elements) return;
        setIsPaying(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (error) {
            toast.error(error.message || "Payment failed");
            setIsPaying(false);
            return;
        }

        if (paymentIntent?.status === "succeeded") {
            toast.success("Payment successful!");
            onSuccess?.();
            onClose();
        }

        setIsPaying(false);
    };

    return (
        <div className="flex flex-1 min-h-0 flex-col">
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain lg:px-6 py-4">
                <div className="rounded-lg border p-4">
                    <BreakdownRow
                        label="Deal amount"
                        value={formatCurrency(breakdown.dealAmount)}
                    />
                    <BreakdownRow
                        label="Processing fee"
                        value={formatCurrency(breakdown.stripeFee)}
                    />
                    <BreakdownRow
                        label="Platform commission"
                        sub={`${breakdown.commissionPercent}%`}
                        value={formatCurrency(breakdown.commissionAmount)}
                    />
                    <BreakdownRow
                        label="Total charged"
                        value={formatCurrency(breakdown.totalCharged)}
                        highlight
                        bold
                    />
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                        Creator receives{" "}
                        <span className="font-medium text-foreground">
                            {formatCurrency(breakdown.creatorPayout)}
                        </span>{" "}
                        after completion
                    </p>
                </div>

                <div className="mt-4">
                    <PaymentElement />
                </div>
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 border-t bg-transparent px-6 py-4">
                <Button
                    onClick={handlePay}
                    disabled={!stripe || isPaying}
                    className="w-full bg-gradient-to-br from-secondary to-primary"
                >
                    {isPaying ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay &amp; Begin
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export const PaymentModal = ({
    open,
    onOpenChange,
    dealAmount,
    creatorId,
    campaignId,
    creatorName,
    campaignName,
    onSuccess,
}: PaymentModalProps) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [breakdown, setBreakdown] = useState<PaymentBreakdown | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (!open || !creatorId || !campaignId) return;

        setIsLoading(true);
        setError(null);
        setClientSecret(null);

        fetch(`${API_BASE_URL}/payments/create-intent`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dealAmount, creatorId, campaignId }),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.error) throw new Error(data.error);
                setClientSecret(data.clientSecret);
                setBreakdown(data.breakdown);
            })
            .catch((err) => setError(err.message || "Failed to initialize payment"))
            .finally(() => setIsLoading(false));
    }, [open, dealAmount, creatorId, campaignId, API_BASE_URL]);

    const handleClose = () => {
        setClientSecret(null);
        setBreakdown(null);
        setError(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[95dvh] flex-col overflow-hidden p-6 xl:p-8 sm:max-w-2xl">
                <DialogHeader className="shrink-0 border-b px-6 py-4">
                    <DialogTitle>Complete Payment</DialogTitle>
                    <DialogDescription>
                        {campaignName && creatorName
                            ? `Funding "${campaignName}" for ${creatorName}`
                            : "Review the breakdown and enter your card details"}
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex flex-1 items-center justify-center py-10">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <p className="text-sm text-muted-foreground">Preparing payment...</p>
                    </div>
                )}

                {error && (
                    <div className="px-6 py-4 text-sm text-destructive">{error}</div>
                )}

                {clientSecret && breakdown && (
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret,
                            appearance: {
                                theme: "stripe",
                                variables: {
                                    colorPrimary: "#635BFF",
                                    borderRadius: "8px",
                                    fontFamily: "Rubik",
                                    fontSizeBase: "16px",
                                    colorText: "hsl(var(--foreground))",
                                    colorTextSecondary: "hsl(var(--muted-foreground))",
                                    colorBackground: "hsl(var(--background))",
                                    colorDanger: "hsl(var(--destructive))",
                                },
                                rules: {
                                    ".Input": {
                                        border: "1px solid hsl(var(--border))",
                                        boxShadow: "none",
                                        fontFamily: "inherit",
                                    },
                                    ".Input:focus": {
                                        border: "1px solid #635BFF",
                                        boxShadow: "0 0 0 2px rgba(99, 91, 255, 0.15)",
                                    },
                                    ".Label": {
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        fontFamily: "inherit",
                                        color: "hsl(var(--muted-foreground))",
                                    },
                                    ".AccordionItem": {
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                        fontFamily: "inherit",
                                    },
                                },
                            },
                        }}
                    >
                        <CheckoutForm
                            breakdown={breakdown}
                            onSuccess={onSuccess}
                            onClose={handleClose}
                        />
                    </Elements>
                )}
            </DialogContent>
        </Dialog>
    );
};
