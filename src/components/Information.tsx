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

          {/* Animación del párrafo largo */}
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Tasly es una aplicación web creada para ayudarte a organizar tus
            tareas, metas y hábitos de forma simple, clara y visualmente cómoda.
            Nació de la necesidad personal de tener un control real de mis
            actividades diarias sin depender de aplicaciones de terceros, y con
            el tiempo fue evolucionando para adaptarse mejor a la forma en la
            que realmente trabajamos y progresamos.
            <br />
            <br />
            En la versión 1.1.0, Tasly recibió múltiples mejoras enfocadas en
            estabilidad, diseño y experiencia de usuario. Se corrigieron errores
            como cierres inesperados de modales, problemas de fechas entre
            cliente y servidor, y desbordes de diseño en pantallas pequeñas.
            Ahora la interfaz es 100 % responsiva, más fluida y visualmente
            equilibrada, con nuevas tipografías y una paleta de colores pensada
            para cuidar la vista, sin excesos.
            <br />
            <br />
            La sección de tareas fue rediseñada y optimizada tanto a nivel
            visual como lógico. Ahora las tareas cuentan con tres estados:
            pendiente, en progreso y completada, lo que permite un seguimiento
            más realista del avance. Las tareas se agrupan por filtros como
            pendientes, tareas de hoy, vencidas, futuras y completadas,
            facilitando una vista clara y ordenada. En la pantalla principal, el
            usuario puede ver mensajes dinámicos que reflejan su progreso diario
            y reconocer cuando ha completado todo.
            <br />
            <br />
            Ahora las tareas pueden incluir horas de inicio y final de forma
            opcional. Si una tarea fue creada con horario, el sistema valida
            automáticamente que las horas sean coherentes con la fecha actual y
            evita inconsistencias. Las tareas sin horas mantienen una
            experiencia más flexible, sin validaciones de tiempo innecesarias.
            El comportamiento de las horas se adapta de forma inteligente según
            el estado de la tarea: pendiente, en progreso o completada.
            <br />
            <br />
            La sección de metas fue la que más evolucionó. Se rediseñó
            completamente su apariencia y funcionamiento. Las metas avanzan de 1
            a 100, mostrando mensajes según el progreso, rachas activas y
            estados actuales. Al completar una meta, se reproduce un audio como
            refuerzo positivo. Además, el sistema ahora ofrece mensajes más
            inteligentes relacionados con hábitos y metas en curso.
            <br />
            <br />
            También se mejoraron los modales, validaciones y animaciones de
            entrada y salida, haciendo la experiencia más suave y agradable. Se
            añadieron pantallas de carga tipo skeleton, necesarias debido al uso
            de servicios gratuitos que requieren tiempo de activación inicial.
            <br />
            <br />
            Por último, la arquitectura de la aplicación fue optimizada: la
            interfaz, el backend y la base de datos están desplegados en
            servicios independientes, lo que permite respuestas más rápidas y
            una mejor escalabilidad. La seguridad general del sistema también
            fue reforzada. Tasly sigue creciendo versión tras versión. Cada
            mejora busca que la aplicación sea más útil, cómoda y cercana para
            quien la usa. Tus sugerencias siempre son bienvenidas 💡
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
            </strong>{" "}
            <br />
            El acceso es simple y seguro. No se requieren correos ni datos
            personales. Crea tu usuario y empieza a gestionar tus tareas y
            metas.
            <br />
            <br />
            Las validaciones se gestionan desde el servidor para mayor
            seguridad. Organiza tus tareas y metas a tu manera.
            <br />
            <br />
            Las tareas con más de 30 días se archivan automáticamente, pero
            siempre podrás encontrarlas con la búsqueda.
            <br />
            <br />
            Tus sugerencias son bienvenidas. Si encuentras un bug o tienes
            alguna idea de mejora, házmelo saber. Tasly sigue en constante
            evolución 💡
            <br />
            <br />
            <em>
              Nota: Algunas frases e ideas presentes en la aplicación están
              inspiradas en el libro
              <strong> Hábitos Atómicos </strong> de{" "}
              <strong> James Clear</strong>. Es una lectura altamente
              recomendada para quienes buscan{" "}
              <strong> mejorar sus hábitos </strong> y
              <strong> optimizar su vida diaria</strong>. Puedes obtener más
              información o adquirir el libro aquí:{" "}
              <a href="https://jamesclear.com/atomic-habits" target="_blank">
                [Enlace al libro]
              </a>
              <strong>
                {" "}
                “No subestimes el poder de los pequeños cambios.{" "}
              </strong>
              Un <strong> 1% de mejora cada día </strong> puede llevarte a{" "}
              <strong> resultados extraordinarios.”</strong> – James Clear.
            </em>
          </motion.p>

          {/* Animación de la cita */}
          <motion.em
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            “El primer principio es que no debes engañarte a ti mismo, y eres la
            persona más fácil de engañar.” – Richard Feynman
          </motion.em>

          {/* Animación de la sección de contacto */}
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
