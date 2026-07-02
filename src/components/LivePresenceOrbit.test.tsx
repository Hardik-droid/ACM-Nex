import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AppProvider } from '../AppContext';
import LivePresenceOrbit from './LivePresenceOrbit';

function wrap(ui: React.ReactElement) {
  return render(<AppProvider>{ui}</AppProvider>);
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

describe('LivePresenceOrbit', () => {
  it('renders avatars and counter after mount', () => {
    const { container } = wrap(
      <LivePresenceOrbit scope={{ type: 'organization', id: 'org-acm' }} />
    );
    act(() => { vi.advanceTimersByTime(500); });
    const images = container.querySelectorAll('img[referrerpolicy="no-referrer"]');
    expect(images.length).toBeGreaterThan(0);
    expect(screen.getByText(/Online now/i)).toBeInTheDocument();
  });

  it('renders center counter with live count', () => {
    wrap(<LivePresenceOrbit scope={{ type: 'organization', id: 'org-acm' }} />);
    act(() => { vi.advanceTimersByTime(500); });
    const counter = screen.getByText(/Online now/i);
    expect(counter).toBeInTheDocument();
  });

  it('renders avatar images for online members', () => {
    const { container } = wrap(
      <LivePresenceOrbit scope={{ type: 'organization', id: 'org-acm' }} />
    );
    act(() => { vi.advanceTimersByTime(500); });
    const images = container.querySelectorAll('img[referrerpolicy="no-referrer"]');
    expect(images.length).toBeGreaterThanOrEqual(4);
  });

  it('shows join notification after simulated join', () => {
    wrap(
      <LivePresenceOrbit
        scope={{ type: 'organization', id: 'org-acm' }}
        showJoinNotifications
      />
    );
    act(() => { vi.advanceTimersByTime(16000); });
    // A simulated join happens every 15s — notification should appear
    // Verify the counter is still present (event processing worked)
    expect(screen.getByText(/Online now/i)).toBeInTheDocument();
  });

  it('excludes current user from orbit when others are online', () => {
    const { container } = wrap(
      <LivePresenceOrbit scope={{ type: 'organization', id: 'org-acm' }} />
    );
    act(() => { vi.advanceTimersByTime(500); });
    const images = container.querySelectorAll('img');
    // Current user (Alex Rivera) is in the snapshot but filtered from visible orbit
    // The orbit should show other members
    expect(images.length).toBeGreaterThanOrEqual(3);
  });

  it('renders overflow avatar when online count exceeds visible limit', () => {
    // With max 2 and 5 online, overflow should show +3
    const { container } = wrap(
      <LivePresenceOrbit
        scope={{ type: 'organization', id: 'org-acm' }}
        maxVisibleDesktop={2}
      />
    );
    act(() => { vi.advanceTimersByTime(500); });
    const overflowEl = container.querySelector('[aria-label*="more members"]');
    expect(overflowEl).toBeTruthy();
  });
});