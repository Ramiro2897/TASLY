import styles from '../styles/home.module.css';

const TaskSkeleton = () => {
  return (
    <div className={styles.taskTextSkeleton}>
      <div className={styles.skeletonTitle}></div>
      <div className={styles.skeletonStatus}></div>
      <div className={styles.skeletonDate}></div>
    </div>
  );
};

export default TaskSkeleton;
