import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

// A imagem vem de um endpoint autenticado, então buscamos o blob com o token e criamos um object URL.
export function FotoAnexo({ anexoId }: { anexoId: number }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    let objectUrl: string | null = null;
    void api
      .get<Blob>(`/anexos/${anexoId}`, { responseType: 'blob' })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        if (ativo) {
          setUrl(objectUrl);
        }
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [anexoId]);

  if (!url) {
    return <div className="h-32 w-32 animate-pulse rounded-lg bg-neutral-200" />;
  }
  return <img src={url} alt="Foto enviada" className="max-h-48 rounded-lg" />;
}
