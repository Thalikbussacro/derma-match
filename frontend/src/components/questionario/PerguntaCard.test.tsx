import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Pergunta } from '../../features/questionario/questionario.types';
import { PerguntaCard } from './PerguntaCard';

const pergunta: Pergunta = {
  id: 1,
  texto: 'Como está sua pele?',
  ordem: 1,
  opcoes: [
    { id: 10, texto: 'Oleosa' },
    { id: 11, texto: 'Seca' },
  ],
};

describe('PerguntaCard', () => {
  it('renderiza o enunciado e as opções', () => {
    render(<PerguntaCard pergunta={pergunta} enviando={false} aoResponder={() => undefined} />);
    expect(screen.getByText('Como está sua pele?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Oleosa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Seca' })).toBeInTheDocument();
  });

  it('chama aoResponder com o id da opção clicada', async () => {
    const aoResponder = vi.fn();
    render(<PerguntaCard pergunta={pergunta} enviando={false} aoResponder={aoResponder} />);
    await userEvent.click(screen.getByRole('button', { name: 'Seca' }));
    expect(aoResponder).toHaveBeenCalledWith(11);
  });

  it('desabilita as opções enquanto envia', () => {
    render(<PerguntaCard pergunta={pergunta} enviando aoResponder={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Oleosa' })).toBeDisabled();
  });
});
