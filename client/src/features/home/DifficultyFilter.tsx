import type { Difficulty } from '@sds/shared';
import { Chip } from '../../components/Chip';
import styles from './HomePage.module.css';

const OPTIONS: { value: Difficulty | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

interface Props {
  value: Difficulty | undefined;
  onChange: (value: Difficulty | undefined) => void;
}

export function DifficultyFilter({ value, onChange }: Props) {
  return (
    <div className={styles.filters} role="group" aria-label="Filter by difficulty">
      {OPTIONS.map((o) => (
        <Chip key={o.label} label={o.label} selected={value === o.value} onSelect={() => onChange(o.value)} />
      ))}
    </div>
  );
}
