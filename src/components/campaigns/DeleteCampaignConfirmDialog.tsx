import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteCampaignConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  onConfirmDelete: () => void;
}

export const DeleteCampaignConfirmDialog = ({
  open,
  onOpenChange,
  campaignName,
  onConfirmDelete,
}: DeleteCampaignConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-9 w-9 text-destructive text-red-700" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Delete Campaign?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">"{campaignName}"</span>?
            <br />
            <span className="mt-2 block text-destructive/80">
              This action cannot be undone. All campaign data, analytics, and media will be permanently removed.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 sm:justify-center sm:space-x-4">
          <AlertDialogCancel className="sm:w-32 bg-gradient-to-br from-primary to-secondary text-white">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-32 text-red-700 border border-gray-400"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
