import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserActions } from "./UserActions";

interface NavigationMenuProps {
  session: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NavigationMenu = ({ session, open, onOpenChange }: NavigationMenuProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64">
        <div className="flex flex-col gap-4 mt-8">
          <UserActions session={session} onAction={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
};