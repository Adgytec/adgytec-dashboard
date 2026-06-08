import type { CSSProperties } from "react";
import styles from "./loader.module.css";

const Loader: React.FC<{ size?: number }> = ({ size = 24 }) => {
    return (
        <span
            className={styles.loader}
            style={
                {
                    "--loader-size": size,
                } as CSSProperties
            }
        />
    );
};

export default Loader;
