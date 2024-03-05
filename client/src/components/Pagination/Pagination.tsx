import cn from 'classnames'

import styles from './Pagination.module.css'

export interface PaginationProps {
  onNextPage: () => void
  onPrevPage: () => void
  page: number
  totalPages: number
}

export function Pagination({
  onNextPage,
  onPrevPage,
  page,
  totalPages
}: PaginationProps): JSX.Element {
  return (
    <div className={styles.paginationContainer}>
      <button
        className={cn(styles.paginationButton, 'button')}
        disabled={page === 1}
        onClick={onPrevPage}
        title="Go to previous page"
      >
        &lt;
      </button>
      <div>
        Page {page} of {totalPages}
      </div>
      <button
        className={cn(styles.paginationButton, 'button')}
        disabled={page === totalPages}
        onClick={onNextPage}
        title="Go to next page"
      >
        &gt;
      </button>
    </div>
  )
}
