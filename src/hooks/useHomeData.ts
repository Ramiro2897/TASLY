import { useEffect } from "react";
import { fetchHomeData } from "../services/home.api";

export const useHomeData = ({
  token,
  setIsLoading,
  setShowSkeleton,
  setTareas,
  setTaskSummary,
  setTimeTasks,
  setFrases,
  setMetas,
  setShowAlert,
  setClosing,
  setErrors,
}: any) => {
  useEffect(() => {
    let skeletonTimer: ReturnType<typeof setTimeout>;

    const fetchData = async () => {
      setIsLoading(true);

      skeletonTimer = setTimeout(() => {
        setShowSkeleton(true);
      }, 250);

      const now = new Date();
      const todayLocal = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      try {
        const [tareasRes, tareasLengthRes, frasesRes, metasRes] =
          await fetchHomeData(token, todayLocal);

        setTareas(tareasRes.data);
        setTaskSummary({
          total: tareasLengthRes.data?.total ?? 0,
          pending: tareasLengthRes.data?.pending ?? 0,
          inProgress: tareasLengthRes.data?.inProgress ?? 0,
          completed: tareasLengthRes.data?.completed ?? 0,
        });
        setTimeTasks(tareasLengthRes.data?.timeTasks ?? []);
        setFrases(frasesRes.data);
        setMetas(metasRes.data);

        const taskNotified = localStorage.getItem("taskNotified") === "true";

        if (
          (tareasLengthRes.data?.pending > 0 ||
            tareasLengthRes.data?.inProgress > 0) &&
          taskNotified
        ) {
          setShowAlert(true);
          localStorage.setItem("taskNotified", "false");

          setTimeout(() => {
            setClosing(true);
            setTimeout(() => {
              setShowAlert(false);
              setClosing(false);
            }, 500);
          }, 30000);
        } else {
          setShowAlert(false);
        }
      } catch (error: any) {
        setErrors(
          error.response?.data.errors || {
            general: "Error inesperado.",
          }
        );
      } finally {
        clearTimeout(skeletonTimer);
        setShowSkeleton(false);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);
};