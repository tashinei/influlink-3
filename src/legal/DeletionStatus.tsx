import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const DeletionStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const confirmationId = searchParams.get("id");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-md w-full rounded-3xl shadow-xl border-none overflow-hidden">
        <div className="h-2 bg-green-500" />
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600 w-10 h-10" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Request Processed</h1>
          <p className="text-slate-600 mb-6">
            Your Instagram data deletion request has been successfully received and processed.
          </p>

          {confirmationId && (
            <div className="bg-slate-100 p-4 rounded-xl mb-8">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Confirmation ID</p>
              <code className="text-sm font-mono text-primary font-bold">{confirmationId}</code>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-full rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeletionStatus;