import styles from '../styles/home.module.css';

const BootScreen = () => {
  return (
    <div className={styles.bootScreen}>
      <p>Preparando tu espacio…</p>
      <small>Esto puede tardar unos segundos</small>
    </div>
  );
};

export default BootScreen;
 
 