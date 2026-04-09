'use client';

import { useState, useRef } from 'react';
import { pb } from '@/lib/pocketbase';
import { validateAttachment, MAX_FILES_PER_TICKET, MAX_FILE_SIZE } from '@/lib/attachments';

interface TicketAttachmentUploadProps {
  ticketId: string;
  currentCount: number;
  onUploadComplete?: () => void;
}

export function TicketAttachmentUpload({ ticketId, currentCount, onUploadComplete }: TicketAttachmentUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const canUpload = currentCount < MAX_FILES_PER_TICKET;
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setError(null);
    setSuccess(false);
    
    // Check file limit
    if (currentCount + files.length > MAX_FILES_PER_TICKET) {
      setError(`Máximo ${MAX_FILES_PER_TICKET} archivos por ticket`);
      return;
    }
    
    // Validate each file
    for (const file of files) {
      const validation = validateAttachment(file);
      if (!validation.valid) {
        setError(validation.error || 'Archivo inválido');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      for (const file of files) {
        formData.append('file', file);
      }
      
      // Get current attachments
      const ticket = await pb.collection('tickets').getOne(ticketId, {
        fields: 'adjuntos',
      });
      const currentAdjuntos = (ticket.adjuntos as string[]) || [];
      
      // Upload each file
      const newAdjuntos = [...currentAdjuntos];
      for (const file of files) {
        const formDataFile = new FormData();
        formDataFile.append('file', file);
        
        await pb.collection('tickets').update(ticketId, formDataFile);
        
        // Get the uploaded filename
        const updated = await pb.collection('tickets').getOne(ticketId, {
          fields: 'adjuntos',
        });
        const updatedAdjuntos = (updated.adjuntos as string[]) || [];
        
        // Find new files
        for (const filename of updatedAdjuntos) {
          if (!newAdjuntos.includes(filename)) {
            newAdjuntos.push(filename);
          }
        }
      }
      
      setSuccess(true);
      onUploadComplete?.();
      setTimeout(() => setSuccess(false), 2000);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Error al subir archivo');
    } finally {
      setLoading(false);
    }
  };
  
  if (!canUpload) {
    return (
      <p className="text-gray-500 text-sm">
        Máximo {MAX_FILES_PER_TICKET} archivos permitidos
      </p>
    );
  }
  
  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpeg,.jpg,.pdf,.zip"
        multiple
        onChange={handleFileChange}
        disabled={loading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {success && (
        <p className="text-green-600 text-sm">Archivo(s) subido(s) correctamente</p>
      )}
      
      <p className="text-xs text-gray-500">
        Máximo {MAX_FILES_PER_TICKET} archivos, 5MB cada uno. Tipos: PNG, JPEG, PDF, ZIP
      </p>
    </div>
  );
}