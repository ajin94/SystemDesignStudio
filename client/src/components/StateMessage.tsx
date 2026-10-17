import { Button } from './Button';
import styles from './StateMessage.module.css';

export function EmptyState({ message }: { message: string }) {
  return (
    <div className={styles.box} role="status">
      {message}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={styles.box} role="alert">
      <p className={styles.error}>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
