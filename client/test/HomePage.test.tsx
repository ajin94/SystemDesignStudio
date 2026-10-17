import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { ProblemSummary } from '@sds/shared';
import { App } from '../src/App';

const PROBLEMS: ProblemSummary[] = [
  { id: 'url-shortener', title: 'URL Shortener', prompt: 'p', difficulty: 'easy', tags: ['Hashing', 'caching'] },
  { id: 'design-twitter', title: 'Design Twitter', prompt: 'p', difficulty: 'medium', tags: ['Fan-out'] },
  { id: 'ride-sharing', title: 'Ride Sharing', prompt: 'p', difficulty: 'hard', tags: ['Geo-indexing'] },
];

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/** Fake server: filters by ?difficulty= like the real API. */
function mockApi() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = new URL(String(input), 'http://localhost');
    const d = url.searchParams.get('difficulty');
    return json(200, { problems: d ? PROBLEMS.filter((p) => p.difficulty === d) : PROBLEMS });
  });
}

function renderAt(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('lists problems with title, difficulty and tags', async () => {
    mockApi();
    renderAt();
    const card = (await screen.findByRole('heading', { name: 'URL Shortener' })).closest('article')!;
    expect(within(card).getByText('Easy')).toBeInTheDocument();
    expect(within(card).getByText('Hashing, caching')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('filters by difficulty through the API and marks the selected chip', async () => {
    const fetchMock = mockApi();
    renderAt();
    await screen.findByRole('heading', { name: 'URL Shortener' });

    await userEvent.click(screen.getByRole('button', { name: 'Hard' }));

    expect(await screen.findByRole('heading', { name: 'Ride Sharing' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'URL Shortener' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hard' })).toHaveAttribute('aria-pressed', 'true');
    expect(fetchMock).toHaveBeenLastCalledWith('/api/problems?difficulty=hard', expect.anything());
  });

  it('reads the initial filter from the URL and ignores invalid values', async () => {
    const fetchMock = mockApi();
    renderAt('/?difficulty=medium');
    expect(await screen.findByRole('heading', { name: 'Design Twitter' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(1);

    fetchMock.mockClear();
    renderAt('/?difficulty=bogus');
    await screen.findAllByRole('heading', { name: 'URL Shortener' });
    expect(fetchMock).toHaveBeenCalledWith('/api/problems', expect.anything());
  });

  it('shows an empty state when no problems match', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(json(200, { problems: [] }));
    renderAt();
    expect(await screen.findByText('No problems match this filter.')).toBeInTheDocument();
  });

  it('shows a retryable error when the server is unreachable, and recovers on Retry', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));
    renderAt();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not reach the local server');

    fetchMock.mockResolvedValue(json(200, { problems: PROBLEMS }));
    await userEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('heading', { name: 'URL Shortener' })).toBeInTheDocument();
  });

  it('shows a non-retryable API error without a Retry button', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      json(400, { error: { code: 'validation_error', message: 'Request validation failed' } }),
    );
    renderAt();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Request validation failed');
    expect(within(alert).queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('keeps Start disabled until the workspace exists', async () => {
    mockApi();
    renderAt();
    expect(await screen.findByRole('button', { name: 'Start URL Shortener' })).toBeDisabled();
  });
});
