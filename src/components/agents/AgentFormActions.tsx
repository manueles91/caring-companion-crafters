import React from "react";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AgentFormActionsProps {
  isSubmitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
  onDelete?: () => void;
}

const AgentFormActions = ({
  isSubmitting,
  isEditing,
  onCancel,
  onDelete,
}: AgentFormActionsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 justify-center">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
        >
          Cancelar
        </Button>

        <Button 
          type="submit" 
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Agente"}
        </Button>
      </div>

      {isEditing && onDelete && (
        <div className="pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Agente
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente el agente. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={onDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default AgentFormActions;