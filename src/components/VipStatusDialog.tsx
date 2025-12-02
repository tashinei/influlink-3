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
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react"

export default function VipStatusDialog({ open, onOpenChange }) {
  const [step, setStep] = useState(1) // 1 = Имейл, 2 = Код
  const [statusEmail, setStatusEmail] = useState("")
  const [statusCode, setStatusCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleStatusSubmit = () => {
    setIsSubmitting(true)
    // Тук добавете вашата API логика
    console.log("Checking:", statusEmail, statusCode)
    
    // Симулация на заявка
    setTimeout(() => {
      setIsSubmitting(false)
      onOpenChange(false) // Затваря диалога при успех
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[40dvw] p-0 overflow-hidden gap-0 max-h-[45dvh] md:pr-0">
        
        {/* Хедър с динамична икона */}
        <div className="flex flex-col items-center pt-10 md:pt-16 text-center">
          <div className="mb-4 bg-gradient-to-br from-primary to-secondary p-3 rounded-full transition-all duration-300">
            {step === 1 ? <Mail className="h-6 w-6 text-[white]" /> : <ShieldCheck className="text-[white] h-6 w-6" />}
          </div>
          
          <DialogTitle className="text-xl lg:text-3xl font-bold transition-all">
            {step === 1 ? "Проверете статус" : "Статус код"}
          </DialogTitle>
          
          <DialogDescription className="mt-2 text-center max-w-[280px] lg:text-[15px]">
            {step === 1 
              ? "Моля, въведете вашия имейл адрес, за да продължите."
              : <>Въведете кодa, който сте получили при регистрация на <span className="font-medium text-foreground">{statusEmail}</span></>
            }
          </DialogDescription>
        </div>

        <div className="pt-6 pb-10 flex flex-col items-center">
          {/* --- СТЪПКА 1: ИМЕЙЛ --- */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300 w-full flex flex-col justify-center">
              <div className="space-y-2">
                <Label htmlFor="email" className="sr-only">Имейл</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="text-center h-11 w-[60%]"
                  style={{alignSelf:"center", justifySelf:"center"}}
                  value={statusEmail}
                  onChange={(e) => setStatusEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" className="bg-gradient-to-tl from-primary to-secondary w-[40%] h-10 font-medium" style={{alignSelf:"center", justifySelf:"center"}}>
                Продължи
              </Button>
            </form>
          )}

          {/* --- СТЪПКА 2: OTP КОД --- */}
          {step === 2 && (
            <div className="space-y-6 flex flex-col items-center animate-in slide-in-from-right-4 fade-in duration-300">
              
              <InputOTP
                maxLength={11}
                value={statusCode}
                onChange={(value) => setStatusCode(value)}
              >
                <InputOTPGroup className="gap-2 justify-center">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
                    <InputOTPSlot 
                      key={index} 
                      index={index} 
                      className="w-6 h-6 text-md md:w-10 md:h-10 md:text-[15px] lg:w-9 lg:h-9 lg:text-md 2xl:w-12 2xl:h-12 2xl:text-lg border rounded-md shadow-sm" 
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <Button 
                onClick={handleStatusSubmit} 
                className="h-10 font-medium bg-gradient-to-tr from-primary to-secondary w-[50%]" 
                disabled={statusCode.length < 11 || isSubmitting}
              >
                {isSubmitting ? "Проверка..." : "Потвърди кода"}
              </Button>

              <div className="flex justify-between w-full text-xs text-muted-foreground px-1">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" /> Промяна на имейл
                </button>
                <button 
                  onClick={() => console.log("Resend code")}
                  className="hover:underline hover:text-foreground transition-colors"
                >
                  Изпрати нов код
                </button>
              </div>
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  )
}