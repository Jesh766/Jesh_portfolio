type AnalyticsPayload = {
  event_type: string;
  page_path?: string;
  section_id?: string;
  metadata?: Record<string, unknown>;
};

export async function trackEvent(payload: AnalyticsPayload): Promise<void> {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    });
  } catch {
    // Non-blocking analytics
  }
}

export function trackPageView(path: string): void {
  void trackEvent({ event_type: 'page_view', page_path: path });
}

export function trackSectionView(sectionId: string): void {
  void trackEvent({ event_type: 'section_view', section_id: sectionId });
}
