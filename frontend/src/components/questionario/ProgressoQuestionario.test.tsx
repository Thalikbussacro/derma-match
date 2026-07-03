import { render, screen } from '@testing-library/react';
import { ProgressoQuestionario } from './ProgressoQuestionario';

describe('ProgressoQuestionario', () => {
  it('mostra a contagem e a porcentagem', () => {
    render(<ProgressoQuestionario respondidas={3} total={6} />);
    expect(screen.getByText('3 de 6 respondidas')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('não passa de 100%', () => {
    render(<ProgressoQuestionario respondidas={10} total={8} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('lida com total zero sem quebrar', () => {
    render(<ProgressoQuestionario respondidas={0} total={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
