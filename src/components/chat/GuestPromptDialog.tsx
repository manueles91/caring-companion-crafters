import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GuestPromptDialogProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const GuestPromptDialog = ({ open, onClose, onContinue }: GuestPromptDialogProps) => {
  const navigate = useNavigate();

  const handleContinueAsGuest = () => {
    onClose();
    onContinue();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Your Conversation</DialogTitle>
          <DialogDescription>
            Sign up to keep your conversation history and continue chatting without limits.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={handleContinueAsGuest}
          >
            Continue as Guest
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Sign Up Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GuestPromptDialog;