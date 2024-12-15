import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  agentId: string | null;
  onUploadComplete?: () => void;
}

const FileUpload = ({ agentId, onUploadComplete }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !agentId) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('agentId', agentId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated session');

      const { error } = await supabase.functions.invoke('process-files', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Archivo subido exitosamente",
        description: "El archivo se ha agregado al agente",
      });

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept=".txt,.pdf,.doc,.docx"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => document.getElementById('file-upload')?.click()}
        disabled={isUploading || !agentId}
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? "Subiendo..." : "Subir archivo"}
      </Button>
    </div>
  );
};

export default FileUpload;