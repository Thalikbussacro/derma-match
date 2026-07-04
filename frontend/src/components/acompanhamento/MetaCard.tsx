import { useState } from 'react';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../features/auth/authContext';
import { contaApi } from '../../features/conta/conta.api';
import { mensagemDeErro } from '../../lib/erros';

export function MetaCard() {
  const { usuario, definirUsuario } = useAuth();
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const meta = usuario?.metaPele ?? null;

  async function salvar() {
    setErro(null);
    setSalvando(true);
    try {
      const atualizado = await contaApi.definirMeta(texto.trim() || null);
      definirUsuario(atualizado);
      setEditando(false);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível salvar a meta.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-extrabold text-neutral-800">Minha meta de pele</h2>
        {!editando && (
          <button
            type="button"
            onClick={() => {
              setTexto(meta ?? '');
              setEditando(true);
            }}
            className="text-sm font-bold text-brand-600"
          >
            {meta ? 'Editar' : 'Definir'}
          </button>
        )}
      </div>
      {editando ? (
        <div className="mt-2 flex flex-col gap-2">
          {erro && <Alert tipo="erro">{erro}</Alert>}
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={200}
            placeholder="Ex.: reduzir a oleosidade, hidratar mais…"
            className="min-h-11 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
          <div className="flex gap-2">
            <Button loading={salvando} onClick={() => void salvar()}>
              Salvar
            </Button>
            <Button variant="secondary" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-sm text-neutral-600">
          {meta ?? 'Você ainda não definiu uma meta. Ela guia a personalização da sua biomédica.'}
        </p>
      )}
    </Card>
  );
}
