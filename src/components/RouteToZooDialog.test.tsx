import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RouteToZooDialog from '@/components/RouteToZooDialog';
import { ZOO_MAPS_DEEP_LINK, ZOO_COORDINATES } from '@/services/mapsService';

describe('RouteToZooDialog', () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza o título e a descrição quando open=true', () => {
    render(<RouteToZooDialog open={true} onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByText('Você está fora do zoo')).toBeTruthy();
    expect(
      screen.getByText(/Deseja obter a rota até o Parque Zoológico de Sapucaia do Sul/i)
    ).toBeTruthy();
  });

  it('não renderiza conteúdo quando open=false', () => {
    render(<RouteToZooDialog open={false} onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.queryByText('Você está fora do zoo')).toBeNull();
  });

  it('botão de confirmação abre o deep link correto via window.open', () => {
    const mockOpen = vi.fn(() => ({ focus: vi.fn() } as unknown as Window));
    vi.stubGlobal('open', mockOpen);

    render(<RouteToZooDialog open={true} onConfirm={onConfirm} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Obter rota'));

    expect(mockOpen).toHaveBeenCalledWith(ZOO_MAPS_DEEP_LINK, '_blank');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('botão de cancelamento fecha o diálogo sem chamar window.open', () => {
    const mockOpen = vi.fn();
    vi.stubGlobal('open', mockOpen);

    render(<RouteToZooDialog open={true} onConfirm={onConfirm} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Agora não'));

    expect(mockOpen).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('exibe mensagem de fallback com coordenadas quando window.open retorna null', () => {
    vi.stubGlobal('open', vi.fn(() => null));

    render(<RouteToZooDialog open={true} onConfirm={onConfirm} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Obter rota'));

    // onConfirm should NOT be called when fallback is triggered
    expect(onConfirm).not.toHaveBeenCalled();

    // Fallback message with coordinates should be visible
    expect(screen.getByRole('status')).toBeTruthy();
    const statusEl = screen.getByRole('status');
    expect(statusEl.textContent).toContain(String(ZOO_COORDINATES.lat));
    expect(statusEl.textContent).toContain(String(ZOO_COORDINATES.lng));
  });
});
