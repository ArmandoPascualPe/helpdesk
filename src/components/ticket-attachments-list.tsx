'use client';

import { pb } from '@/lib/pocketbase';

interface TicketAttachmentsListProps {
  ticketId: string;
  files: string[];
}

export function TicketAttachmentsList({ ticketId, files }: TicketAttachmentsListProps) {
  if (!files || files.length === 0) {
    return null;
  }

  const getFileUrl = (filename: string) => {
    return pb.files.getUrl({ collectionId: 'tickets', id: ticketId }, filename);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Archivos adjuntos ({files.length})</div>
      <div className="space-y-1">
        {files.map((filename, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <span className="text-sm">{filename}</span>
            </div>
            <a
              href={getFileUrl(filename)}
              download={filename}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Descargar
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}