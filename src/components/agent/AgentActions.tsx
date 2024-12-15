import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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

interface AgentActionsProps {
  id: string;
  name: string;
  session: any;
}

const AgentActions = ({ id, name, session }: AgentActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/?edit=${id}`);
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat?agent=${id}`);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Agente eliminado",
        description: "El agente ha sido eliminado exitosamente",
      });

      // Redirect to home page after deletion
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el agente",
        variant: "destructive",
      });
    }
  };

  if (session) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleEdit}
          className="p-1.5 rounded-full bg-accent hover:bg-accent/80 transition-colors"
        >
          <Edit className="h-4 w-4" />
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 transition-colors">
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará permanentemente el agente "{name}". Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="bg-red-500 hover:bg-red-600"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <Button
        onClick={handleChat}
        className="w-[80%] bg-green-500 text-white hover:bg-green-600 hover:translate-y-[1px] transform transition-all shadow-[0_4px_0_0_rgb(22,163,74)] hover:shadow-[0_2px_0_0_rgb(22,163,74)] active:translate-y-[2px] active:shadow-[0_0px_0_0_rgb(22,163,74)]"
        size="sm"
      >
        Chat
      </Button>
    </div>
  );
};

export default AgentActions;