import cn from 'classnames'

import styles from './Pagination.module.css'

export interface PaginationProps {
  nextPage: () => void
  page: number
  prevPage: () => void
  totalPages: number
}

export function Pagination({
  nextPage,
  page,
  prevPage,
  totalPages
}: PaginationProps): JSX.Element {
  return (
    <div className={styles.paginationContainer}>
      <button
        className={cn(styles.paginationButton, 'button')}
        disabled={page === 1}
        onClick={prevPage}
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
        onClick={nextPage}
        title="Go to next page"
      >
        &gt;
      </button>
    </div>
  )
}
