import type { ProblemSummary } from '@sds/shared';
import { Button } from '../../components/Button';
import { DifficultyPill } from '../../components/Pill';
import styles from './HomePage.module.css';

export function ProblemCard({ problem }: { problem: ProblemSummary }) {
  return (
    <article className={styles.card} aria-labelledby={`problem-${problem.id}`}>
      <h2 id={`problem-${problem.id}`} className={styles.cardTitle}>
        {problem.title}
      </h2>
      <DifficultyPill difficulty={problem.difficulty} />
      <p className={styles.cardDescription} title={problem.prompt}>
        {problem.tags.join(', ')}
      </p>
      {/* Sessions (POST /api/sessions) and the workspace are the next milestone. */}
      <Button className={styles.start} disabled title="Workspace coming soon" aria-label={`Start ${problem.title}`}>
        Start
      </Button>
    </article>
  );
}
