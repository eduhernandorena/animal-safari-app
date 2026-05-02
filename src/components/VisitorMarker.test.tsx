// Feature: gps-zoo-tracking, Property 10: Posição do VisitorMarker corresponde à ImagePosition
import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import VisitorMarker from '@/components/VisitorMarker';

/**
 * Validates: Requirement 5.1
 *
 * Property P10: Para qualquer ImagePosition { x, y } válida, o VisitorMarker deve ser
 * renderizado com style.left = x% e style.top = y%.
 */
describe('VisitorMarker', () => {
  it('P10: renderiza com style.left e style.top correspondentes à posição recebida', () => {
    fc.assert(
      fc.property(
        fc.record({
          x: fc.float({ min: 0, max: 100, noNaN: true }),
          y: fc.float({ min: 0, max: 100, noNaN: true }),
        }),
        (position) => {
          const { getByTestId } = render(
            <VisitorMarker position={position} isLowAccuracy={false} />
          );

          const marker = getByTestId('visitor-marker');
          expect(marker.style.left).toBe(`${position.x}%`);
          expect(marker.style.top).toBe(`${position.y}%`);

          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('exibe indicador de baixa precisão quando isLowAccuracy é true', () => {
    const { getByLabelText } = render(
      <VisitorMarker position={{ x: 50, y: 50 }} isLowAccuracy={true} />
    );
    expect(getByLabelText('Baixa precisão GPS')).toBeTruthy();
  });

  it('não exibe indicador de baixa precisão quando isLowAccuracy é false', () => {
    const { queryByLabelText } = render(
      <VisitorMarker position={{ x: 50, y: 50 }} isLowAccuracy={false} />
    );
    expect(queryByLabelText('Baixa precisão GPS')).toBeNull();
  });
});
