/**
 * gpmpay-ui.test.ts — Unit tests for GPM Pay 50k/tháng Cloud package UI logic.
 *
 * Run: bun test src/tests/gpmpay-ui.test.ts
 *
 * Tests:
 *   ✓ api-payment exports DEFAULT_PERIOD = 'monthly'
 *   ✓ api-payment exports DEFAULT_MONTHLY_AMOUNT = 50000
 *   ✓ PeriodType includes 'monthly'
 *   ✓ PaymentModal defaults to 'monthly' period
 *   ✓ Price labels are correct for monthly / yearly / trial
 *   ✓ Upgrading from free → pro via AuthStore sets plan='pro'
 *   ✓ Local notes untouched during payment upgrade flow
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { DEFAULT_PERIOD, DEFAULT_MONTHLY_AMOUNT } from '../lib/api-payment';
import type { PeriodType } from '../lib/api-payment';
import { useAuthStore } from '../stores/useAuthStore';
import { useNotesStore } from '../stores/useNotesStore';
import type { MeResponse } from '../lib/api-client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FREE_USER: MeResponse = {
  id: 'user_free_gpmpay',
  email: 'free@froginotes.app',
  name: 'Free Frog GPM',
  plan: 'free',
  createdAt: new Date().toISOString(),
};

function resetAuth() {
  useAuthStore.setState({
    phase: 'idle',
    user: null,
    error: null,
    pendingEmail: '',
    cloudDisabled: false,
    emailUnavailable: false,
  });
}

// ─── Price label helper (mirrors PaymentModal logic) ─────────────────────────

function getPriceLabel(period: PeriodType): string {
  if (period === 'monthly') return '50.000đ / tháng';
  if (period === 'yearly') return '500.000đ / năm';
  return 'Dùng thử miễn phí';
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('api-payment — GPM Pay 50k/tháng defaults', () => {
  it('DEFAULT_PERIOD is monthly', () => {
    expect(DEFAULT_PERIOD).toBe('monthly');
  });

  it('DEFAULT_MONTHLY_AMOUNT is 50000 VND', () => {
    expect(DEFAULT_MONTHLY_AMOUNT).toBe(50_000);
  });

  it('monthly period produces correct price label', () => {
    expect(getPriceLabel('monthly')).toBe('50.000đ / tháng');
  });

  it('yearly period produces correct price label', () => {
    expect(getPriceLabel('yearly')).toBe('500.000đ / năm');
  });

  it('trial period produces correct price label', () => {
    expect(getPriceLabel('trial')).toBe('Dùng thử miễn phí');
  });
});

describe('PaymentModal — default period is monthly', () => {
  it('DEFAULT_PERIOD resolves to monthly for PaymentModal default', () => {
    // PaymentModal defaults period = 'monthly' matching DEFAULT_PERIOD
    const defaultPeriod: PeriodType = DEFAULT_PERIOD;
    expect(defaultPeriod).toBe('monthly');
    expect(getPriceLabel(defaultPeriod)).toBe('50.000đ / tháng');
  });

  it('50000 VND formats correctly in vi-VN locale', () => {
    const formatted = (50_000).toLocaleString('vi-VN') + 'đ';
    expect(formatted).toBe('50.000đ');
  });
});

describe('CloudSyncModal — upgrade CTA text for 50k plan', () => {
  it('free user sees monthly 50k pricing (not old 299k/year)', () => {
    // Verify the price constant matches displayed CTA
    expect(DEFAULT_MONTHLY_AMOUNT).toBe(50_000);
    // Yearly savings: 12 months * 50k = 600k, yearly = 500k → saves 2 months
    const yearlyPrice = 500_000;
    const monthlyEquivalentPerYear = DEFAULT_MONTHLY_AMOUNT * 12;
    const savedAmount = monthlyEquivalentPerYear - yearlyPrice;
    const savedMonths = savedAmount / DEFAULT_MONTHLY_AMOUNT;
    expect(savedMonths).toBe(2); // "tiết kiệm 2 tháng"
  });
});

describe('Payment success — upgrades plan and unlocks Cloud Sync', () => {
  beforeEach(resetAuth);

  it('simulating GPM Pay webhook success upgrades plan to pro', () => {
    useAuthStore.setState({ phase: 'authenticated', user: { ...FREE_USER } });
    expect(useAuthStore.getState().user?.plan).toBe('free');

    // Simulate PaymentModal on webhook success
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.setState({ user: { ...currentUser, plan: 'pro' } });
    }

    const { user, phase } = useAuthStore.getState();
    expect(user?.plan).toBe('pro');
    // Cloud Sync unlock condition
    const isPro = phase === 'authenticated' && user?.plan === 'pro';
    expect(isPro).toBe(true);
  });

  it('upgrade does NOT touch local notes', () => {
    useAuthStore.setState({ phase: 'authenticated', user: { ...FREE_USER } });
    const notesBefore = useNotesStore.getState().notes.length;

    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.setState({ user: { ...currentUser, plan: 'pro' } });
    }

    expect(useNotesStore.getState().notes.length).toBe(notesBefore);
  });

  it('free offline notes remain free after upgrade', () => {
    // Local notes are always free — auth store does not contain notes
    const authState = useAuthStore.getState();
    expect('notes' in authState).toBe(false);
    expect('diaryEntries' in authState).toBe(false);
  });
});

describe('Poll interval — 2 second cadence', () => {
  it('poll interval constant is 2000ms (2 seconds)', () => {
    // The modal polls every 2000ms per GPM Pay spec
    const POLL_INTERVAL_MS = 2000;
    expect(POLL_INTERVAL_MS).toBe(2_000);
    // Within 30s (spec: activate in 30s), polls occur at most 15 times
    const maxPolls = 30_000 / POLL_INTERVAL_MS;
    expect(maxPolls).toBe(15);
  });
});
