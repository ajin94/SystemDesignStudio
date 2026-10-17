import { useSearchParams } from 'react-router-dom';
import { DifficultySchema, type Difficulty } from '@sds/shared';
import { EmptyState, ErrorState } from '../../components/StateMessage';
import { DifficultyFilter } from './DifficultyFilter';
import { ProblemCard } from './ProblemCard';
import { useProblems } from './useProblems';
import styles from './HomePage.module.css';

export function HomePage() {
  const [params, setParams] = useSearchParams();
  const parsed = DifficultySchema.safeParse(params.get('difficulty'));
  const difficulty = parsed.success ? parsed.data : undefined;
  const { state, retry } = useProblems(difficulty);

  const setDifficulty = (value: Difficulty | undefined) => setParams(value ? { difficulty: value } : {});

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Practice a system design problem</h1>
      <p className={styles.subtitle}>
        Pick a problem, work through requirements to design, then get an AI review.
      </p>
      <DifficultyFilter value={difficulty} onChange={setDifficulty} />

      {state.status === 'loading' && (
        <div className={styles.grid} aria-busy="true" aria-label="Loading problems">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${styles.card} ${styles.skeleton}`} />
          ))}
        </div>
      )}
      {state.status === 'error' && (
        <ErrorState
          message={`Could not load problems: ${state.error.message}`}
          onRetry={state.error.retryable ? retry : undefined}
        />
      )}
      {state.status === 'ok' && state.problems.length === 0 && <EmptyState message="No problems match this filter." />}
      {state.status === 'ok' && state.problems.length > 0 && (
        <div className={styles.grid}>
          {state.problems.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      )}
    </main>
  );
}
