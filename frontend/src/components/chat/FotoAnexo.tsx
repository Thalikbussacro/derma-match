import { useEffect, useState } from 'react';
import type { AxiosInstance } from 'axios';
import { api } from '../../lib/api';

// A imagem vem de um endpoint autenticado, então buscamos o blob com o token e criamos um object URL.
// `instance` permite usar o cliente da usuária (padrão) ou o da biomédica.
export function FotoAnexo({
  anexoId,
  instance = api,
}: {
  anexoId: number;
  instance?: AxiosInstance;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    let objectUrl: string | null = null;
    void instance
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
  }, [anexoId, instance]);

  if (!url) {
    return <div className="h-32 w-32 animate-pulse rounded-lg bg-neutral-200" />;
  }
  return <img src={url} alt="Foto enviada" className="max-h-48 rounded-lg" />;
}
