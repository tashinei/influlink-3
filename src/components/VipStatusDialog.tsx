import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { ArrowLeft, CheckCircle2, Clock, Mail, ShieldCheck, XCircle } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"

export default function VipStatusDialog({ open, onOpenChange, accountType }) {
  const [step, setStep] = useState(1) // 1 = Имейл, 2 = Код
  const [statusEmail, setStatusEmail] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const { t } = useTranslation();

  const isCreator = accountType === "creator";
  const accountAbout = isCreator ? "creatorAbout" : "brandAbout";

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setStep(1)
        setStatusCode("")
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleNextStep = (e) => {
    e.preventDefault()
    if (statusEmail) setStep(2)
  }

  const handleStatusSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("https://influ-link.com/api/checkStatus.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: statusEmail,
          statusCode: statusCode
        })
      });

      const result = await response.json();
      setIsSubmitting(false);

      if (result.status === "active") {
        // VIP ACTIVE
        setModalType("success");
        setModalMessage(result.message);
        setIsSuccessModalOpen(true);
      } else if (result.status === "pending") {
        // CODE VALID BUT VIP NOT ACTIVE
        setModalType("pending");
        setModalMessage(result.message);
        setIsSuccessModalOpen(true);
      } else {
        // INVALID CODE / EMAIL
        setModalType("error");
        setModalMessage(result.message);
        setIsSuccessModalOpen(true);
      }

    } catch (error) {
      setIsSubmitting(false);
      setModalType("error");
      setModalMessage("Системна грешка. Опитайте пак.");
      setIsSuccessModalOpen(true);
    }
  };

  return (
    <>
      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[999] animate-fade-in"
          onClick={() => setIsSuccessModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gradient-to-br from-primary to-secondary rounded-3xl shadow-2xl p-10 text-center w-[90%] sm:w-[450px] border-2 border-primary/20 overflow-visible animate-modal-pop"
          >
            <div className="relative z-10 bg-transparent rounded-3xl">

              {/* ICON BASED ON TYPE */}
              <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                {modalType === "success" && (
                  <CheckCircle2 className="mx-auto text-white mb-4 drop-shadow-lg animate-scale-in" size={64} />
                )}
                {modalType === "pending" && (
                  <Clock className="mx-auto text-[white] mb-4 drop-shadow-lg animate-scale-in" size={64} />
                )}
                {modalType === "error" && (
                  <XCircle className="mx-auto text-[white] mb-4 drop-shadow-lg animate-scale-in" size={64} />
                )}
              </div>

              {/* TITLE */}
              <h2
                className="text-2xl font-bold mb-2 text-white animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                {modalType === "success"
                  ? "Поздравления!"
                  : modalType === "pending"
                    ? "Кодът е валиден, но..."
                    : "Грешка или невалиден код"}
              </h2>

              {/* MESSAGE */}
              <p
                className="text-white mb-6 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                {modalMessage}
              </p>

              {/* Button */}
              {/* <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
                                    <Button
                                        onClick={() => setIsSuccessModalOpen(false)}
                                        className="bg-white text-black rounded-full px-8 py-6 text-[16px] font-semibold shadow-md shadow-primary transition duration-300 ease-in-out hover:scale-105"
                                    >
                                        Добре
                                    </Button>
                                </div> */}
            </div>
          </div>
        </div>
      )}
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* FIX: added 'h-fit' to ensure the modal wraps the content tightly */}
        <DialogContent className="w-[92vw] max-w-[440px] p-0 overflow-hidden gap-0 !h-fit max-h-[90dvh] flex flex-col">

          {/* Header Section */}
          <div className="flex flex-col items-center pt-8 pb-2 px-8 text-center shrink-0">
            <div className="mb-4 bg-gradient-to-br from-primary to-secondary p-3 rounded-full shrink-0 shadow-sm">
              {step === 1
                ? <Mail className="h-6 w-6 text-white" />
                : <ShieldCheck className="h-6 w-6 text-white" />}
            </div>

            <DialogTitle className="text-xl font-bold leading-tight">
              {step === 1
                ? t(`${accountAbout}.statusSection.modalFirstTitle`)
                : t(`${accountAbout}.statusSection.modalSecondTitle`)}
            </DialogTitle>

            <DialogDescription className="mt-2 text-sm leading-snug max-w-[280px]">
              {step === 1
                ? t(`${accountAbout}.statusSection.modalFirstSubtitle`)
                : (
                  <>
                    {t(`${accountAbout}.statusSection.modalSecondSubtitle`)}
                    <span className="font-semibold text-foreground block mt-1 break-all"> {statusEmail}</span>
                  </>
                )}
            </DialogDescription>
          </div>

          <div className="flex flex-col items-center px-8 pt-6 pb-10">

            {step === 1 && (
              <form
                onSubmit={handleNextStep}
                className="flex flex-col items-center gap-4 w-full animate-in slide-in-from-left-4 fade-in duration-300"
              >
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="text-center h-12 w-full text-base"
                  value={statusEmail}
                  onChange={(e) => setStatusEmail(e.target.value)}
                  autoFocus
                  required
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-tl from-primary to-secondary h-12 w-full font-bold text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  {t(`${accountAbout}.statusSection.modalFirstButton`)}
                </Button>
              </form>
            )}

            {step === 2 && (
              <div className="flex flex-col items-center gap-6 w-full animate-in slide-in-from-right-4 fade-in duration-300">
                <InputOTP
                  maxLength={11}
                  value={statusCode}
                  onChange={(value) => setStatusCode(value)}
                  className="w-full"
                >
                  <div className="flex flex-col gap-3 w-full items-center">
                    {/* Row 1: 6 Slots */}
                    <InputOTPGroup className="flex gap-1.5 justify-center">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-10 h-10 sm:w-11 sm:h-11 text-lg border-2 rounded-xl"
                        />
                      ))}
                    </InputOTPGroup>

                    {/* Row 2: 5 Slots */}
                    <InputOTPGroup className="flex gap-1.5 justify-center">
                      {[6, 7, 8, 9, 10].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-10 h-10 sm:w-11 sm:h-11 text-lg border-2 rounded-xl"
                        />
                      ))}
                    </InputOTPGroup>
                  </div>
                </InputOTP>

                <div className="w-full space-y-5">
                  <Button
                    onClick={handleStatusSubmit}
                    className="h-12 w-full font-bold text-base bg-gradient-to-tr from-primary to-secondary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                    disabled={statusCode.length < 11 || isSubmitting}
                  >
                    {isSubmitting ? "Проверка..." : t(`${accountAbout}.statusSection.modalSecondButton`)}
                  </Button>

                  <div className="flex justify-between w-full text-[13px] font-medium text-muted-foreground px-1">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {t(`${accountAbout}.statusSection.modalBackButton`)}
                    </button>
                    <button
                      onClick={() => console.log("Resend code")}
                      className="hover:text-primary transition-colors underline underline-offset-4 decoration-primary/30"
                    >
                      {t(`${accountAbout}.statusSection.modalResendButton`)}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </DialogContent>
      </Dialog>
    </>
  )
}