'use client';

import { useState, useRef } from 'react';
import { pb } from '@/lib/pocketbase';
import { validateAttachment, validateFileCount, MAX_FILES_PER_TICKET } from '@/lib/attachments';

interface TicketAttachmentUploadProps {
  ticketId: string;
  currentFiles?: string[];
}

export function TicketAttachmentUpload({ ticketId, currentFiles = [] }: TicketAttachmentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentCount = currentFiles.length;
  const countValidation = validateFileCount(currentCount);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setError(null);
    setSuccess(false);
    
    const file = files[0];
    
    const validation = validateAttachment(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo inválido');
      return;
    }
    
    if (!countValidation.valid) {
      setError(countValidation.error || 'Máximo de archivos alcanzado');
      return;
    }
    
    const totalAfterUpload = currentCount + 1;
    if (totalAfterUpload > MAX_FILES_PER_TICKET) {
      setError(`Máximo ${MAX_FILES_PER_TICKET} archivos permitidos`);
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('archivos', file);
      
      await pb.collection('tickets').update(ticketId, formData);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Error al subir archivo');
    }
    
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Adjuntos</label>
        <span className="text-xs text-gray-500">
          {currentCount}/{MAX_FILES_PER_TICKET} archivos
        </span>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpeg,.jpg,.pdf,.zip"
        onChange={handleFileChange}
        disabled={uploading || !countValidation.valid}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          disabled:opacity-50"
      />
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {success && (
        <p className="text-green-500 text-sm">Archivo subido correctamente</p>
      )}
      
      {uploading && (
        <p className="text-gray-500 text-sm">Subiendo archivo...</p>
      )}
    </div>
  );
}