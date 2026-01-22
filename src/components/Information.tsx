import { motion } from "framer-motion";
import styles from "../styles/info.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faWhatsapp,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";

const Information = () => {
  return (
    <div className={styles["container-information"]}>
      <div className={styles["home-container"]}>
        {/* Animación del título principal */}
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          Tasly <span className={styles["version"]}>v1.1.0</span>
        </motion.h2>

        <div className={styles["info-section"]}>
          {/* Animación del subtítulo */}
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            ¿Qué es Tasly?
          </motion.h2>

          {/* Animación del párrafo principal ligeramente resumido */}
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Tasly es una aplicación web para organizar tareas, metas y hábitos
            de forma simple, clara y visualmente cómoda. Nació de la necesidad
            personal de controlar mis actividades diarias sin depender de apps
            externas, y con el tiempo ha evolucionado para adaptarse mejor a la
            forma en la que trabajamos y progresamos.
            <br />
            <br />
            En la versión 1.1.0, Tasly recibió mejoras en estabilidad, diseño y
            experiencia de usuario. Se corrigieron cierres inesperados de
            modales, problemas de fechas entre cliente y servidor y desbordes de
            diseño en pantallas pequeñas. La interfaz es 100% responsiva, más
            fluida y visualmente equilibrada, con nuevas tipografías y paleta de
            colores cómoda para la vista.
            <br />
            <br />
            La sección de tareas fue rediseñada y optimizada: ahora tienen tres
            estados (pendiente, en progreso, completada) y filtros como
            pendientes, de hoy, vencidas, futuras y completadas. Los usuarios
            reciben mensajes dinámicos que reflejan su progreso diario.
            <br />
            <br />
            Las tareas pueden incluir horarios de inicio y fin opcionales,
            validados automáticamente. Las tareas sin horas mantienen una
            experiencia flexible, y el sistema adapta el comportamiento según el
            estado: pendiente, en progreso o completada.
            <br />
            <br />
            La sección de metas también evolucionó: muestran progreso de 1 a
            100, mensajes según progreso y rachas activas, y reproducen audio al
            completarlas. Se mejoraron modales, validaciones y animaciones,
            además de pantallas de carga tipo skeleton. La arquitectura general
            fue optimizada para rapidez y escalabilidad, con seguridad
            reforzada.
            <br />
            <br />
            <strong>
              <span
                style={{
                  fontSize: "1.3em",
                  marginTop: "10px",
                  display: "block",
                }}
              >
                ¿Cómo funciona?
              </span>
            </strong>
            <br />
            El acceso es simple y seguro: no se requieren correos ni datos
            personales. Crea tu usuario y gestiona tareas y metas. Las tareas
            con más de 30 días se archivan automáticamente, pero siempre puedes
            encontrarlas con la búsqueda. Las validaciones se gestionan desde el
            servidor para mayor seguridad.
            <br />
            <br />
            Tus sugerencias son bienvenidas 💡
            <br />
            <br />
            <em>
              Algunas frases están inspiradas en el libro{" "}
              <strong>Hábitos Atómicos</strong> de <strong>James Clear</strong>.
              Es una lectura recomendada para quienes buscan{" "}
              <strong>mejorar hábitos</strong> y{" "}
              <strong>optimizar su vida diaria</strong>. Más info:{" "}
              <a href="https://jamesclear.com/atomic-habits" target="_blank">
                [Enlace al libro]
              </a>
              . “No subestimes el poder de los pequeños cambios. Un{" "}
              <strong>1% de mejora cada día</strong> puede llevar a{" "}
              <strong>resultados extraordinarios.”</strong> – James Clear
            </em>
          </motion.p>

          {/* Cita */}
          <motion.em
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            “El primer principio es que no debes engañarte a ti mismo, y eres la
            persona más fácil de engañar.” – Richard Feynman
          </motion.em>

          {/* Sección de contacto */}
          <motion.div
            className={styles["contact"]}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3>Contacto</h3>
            <p>Email: ramirodjaltor2016@gmail.com</p>
            <p>Teléfono: +57 300 235 3297</p>
            <div className={styles["social-icons"]}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a
                href="https://wa.me/573002353297"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
              <a
                href="https://github.com/Ramiro2897"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faGithub} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Information;
