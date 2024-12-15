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
    console.log('Starting file upload process for:', file.name);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated session');

      // Convert file to base64
      const reader = new FileReader();
      const filePromise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64File = await filePromise;
      console.log('File converted to base64, sending to Edge Function');
      
      const { error } = await supabase.functions.invoke('process-files', {
        body: {
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            base64: base64File
          },
          agentId
        }
      });

      if (error) throw error;

      console.log('File processed successfully');
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