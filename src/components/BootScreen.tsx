import styles from '../styles/home.module.css';

const BootScreen = () => {
  return (
    <div className={styles.bootScreen}>
      <div className={styles.loader}>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default BootScreen;
