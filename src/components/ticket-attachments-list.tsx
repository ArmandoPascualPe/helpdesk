'use client';

import { useState, useEffect } from 'react';
import { getAttachmentDownloadInfo } from '@/actions/download-attachment';
import { pb } from '@/lib/pocketbase';
import { MAX_FILES_PER_TICKET } from '@/lib/attachments';

interface TicketAttachmentsListProps {
  ticketId: string;
}

export function TicketAttachmentsList({ ticketId }: TicketAttachmentsListProps) {
  const [files, setFiles] = useState<Array<{ filename: string; url: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchAttachments() {
      setLoading(true);
      setError(null);
      try {
        const result = await pb.collection('tickets').getOne(ticketId, {
          fields: 'adjuntos',
        });
        const adjuntos = (result.adjuntos as string[]) || [];
        
        const filesWithUrls = adjuntos.map((filename: string) => ({
          filename,
          url: pb.files.getUrl(result, filename),
        }));
        
        setFiles(filesWithUrls);
      } catch (err: any) {
        console.error('Error fetching attachments:', err);
        setError('Error al cargar archivos');
        setFiles([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAttachments();
  }, [ticketId]);

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  if (loading) {
    return <p className="text-gray-500 text-sm">Cargando archivos...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-sm">{error}</p>;
  }

  if (files.length === 0) {
    return (
      <div>
        <p className="text-gray-500 text-sm">No hay archivos adjuntos</p>
        <p className="text-xs text-gray-400 mt-1">
          ({files.length}/{MAX_FILES_PER_TICKET})
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 mb-2">
        Archivos ({files.length}/{MAX_FILES_PER_TICKET})
      </p>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.filename}
            className="flex items-center justify-between border rounded-lg p-2 bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                {getFileExtension(file.filename)}
              </span>
              <span className="text-sm truncate max-w-[150px]">
                {file.filename}
              </span>
            </div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
              download
            >
              Descargar
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}