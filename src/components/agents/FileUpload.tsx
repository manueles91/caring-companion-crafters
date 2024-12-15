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

      // First upload the file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${agentId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('agent-files')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      console.log('File uploaded to storage, processing file...');

      // Now call the edge function to process the file
      const { error: processError } = await supabase.functions.invoke('process-files', {
        body: {
          filename: file.name,
          filePath,
          contentType: file.type,
          size: file.size,
          agentId
        }
      });

      if (processError) throw processError;

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