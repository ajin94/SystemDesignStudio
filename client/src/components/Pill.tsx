import type { Difficulty } from '@sds/shared';
import styles from './Pill.module.css';

const LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
  return <span className={`${styles.pill} ${styles[difficulty]}`}>{LABEL[difficulty]}</span>;
}
