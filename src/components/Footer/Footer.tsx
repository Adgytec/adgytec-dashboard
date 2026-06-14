import Container from "../Container/Container";
import styles from "./footer.module.scss";

function Footer() {
    return (
        <footer className={styles.footer}>
            <Container>
                <p className={styles.text}>
                    © 2024 Adgytec All rights reserved.
                </p>
            </Container>
        </footer>
    );
}

export default Footer;
