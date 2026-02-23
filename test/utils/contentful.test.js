import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock setup ──────────────────────────────────────────────────────────────
// Must be declared before any import of the module under test so Vitest hoists it.

const mockGetEntries = vi.fn();

vi.mock('contentful', () => ({
  createClient: vi.fn(() => ({
    getEntries: mockGetEntries,
  })),
}));

// Mock import.meta.env before the module is imported
vi.stubEnv('VITE_CONTENTFUL_SPACE_ID', 'test-space');
vi.stubEnv('VITE_CONTENTFUL_ACCESS_TOKEN', 'test-token');

// Now import the function under test (after mocks are in place)
const { getServices } = await import('../../src/utils/contentful');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeServiceItem = ({
  id = 'sys-id-1',
  title = 'Test Service',
  subtitle = 'A subtitle',
  description = 'A description',
  icon = 'FaCode',
  order = 1,
  active = true,
} = {}) => ({
  sys: { id },
  fields: { title, subtitle, description, icon, order, active },
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('getServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a mapped array of services from Contentful', async () => {
    const rawItem = makeServiceItem({ id: 'abc123', title: 'My Service' });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getServices();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'abc123',
      title: 'My Service',
      subtitle: 'A subtitle',
      description: 'A description',
      icon: 'FaCode',
      order: 1,
      active: true,
    });
  });

  it('passes correct content_type and order to getEntries', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    await getServices();

    expect(mockGetEntries).toHaveBeenCalledWith({
      content_type: 'service',
      order: 'fields.order',
    });
  });

  it('defaults icon to null when not provided', async () => {
    const rawItem = makeServiceItem({ icon: undefined });
    rawItem.fields.icon = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getServices();

    expect(result[0].icon).toBeNull();
  });

  it('defaults subtitle to empty string when not provided', async () => {
    const rawItem = makeServiceItem({ subtitle: undefined });
    rawItem.fields.subtitle = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getServices();

    expect(result[0].subtitle).toBe('');
  });

  it('defaults order to 0 when not provided', async () => {
    const rawItem = makeServiceItem();
    rawItem.fields.order = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getServices();

    expect(result[0].order).toBe(0);
  });

  it('defaults active to true when not provided', async () => {
    const rawItem = makeServiceItem();
    rawItem.fields.active = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getServices();

    expect(result[0].active).toBe(true);
  });

  it('returns empty array when Contentful returns no items', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    const result = await getServices();

    expect(result).toEqual([]);
  });

  it('returns empty array and logs error on Contentful failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEntries.mockRejectedValueOnce(new Error('API failure'));

    const result = await getServices();

    expect(result).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('maps multiple items preserving all fields', async () => {
    const items = [
      makeServiceItem({ id: 'id1', title: 'Alpha', order: 2 }),
      makeServiceItem({ id: 'id2', title: 'Beta', order: 1 }),
    ];
    mockGetEntries.mockResolvedValueOnce({ items });

    const result = await getServices();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('id1');
    expect(result[1].id).toBe('id2');
  });
});
