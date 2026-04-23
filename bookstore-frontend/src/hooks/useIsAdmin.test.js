import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useIsAdmin from './useIsAdmin';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';

describe('useIsAdmin', () => {
  it('returns false when user is null (unauthenticated)', () => {
    useAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useIsAdmin());

    expect(result.current).toBe(false);
  });

  it('returns false when user has role "user"', () => {
    useAuth.mockReturnValue({ user: { id: 1, role: 'user' } });

    const { result } = renderHook(() => useIsAdmin());

    expect(result.current).toBe(false);
  });

  it('returns true when user has role "admin"', () => {
    useAuth.mockReturnValue({ user: { id: 2, role: 'admin' } });

    const { result } = renderHook(() => useIsAdmin());

    expect(result.current).toBe(true);
  });

  it('returns false when user object has no role field', () => {
    useAuth.mockReturnValue({ user: { id: 3, name: 'No Role User' } });

    const { result } = renderHook(() => useIsAdmin());

    expect(result.current).toBe(false);
  });

  it('returns false when role is an unexpected value', () => {
    useAuth.mockReturnValue({ user: { id: 4, role: 'moderator' } });

    const { result } = renderHook(() => useIsAdmin());

    expect(result.current).toBe(false);
  });
});
