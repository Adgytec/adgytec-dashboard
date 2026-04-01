"use client";

import React from "react";
import styles from "./home.module.scss";
import Container from "@/components/Container/Container";
import Image from "next/image";
import { Changelog } from "@/components/Changelog/Changelog";

const Home = () => {
    return (
        <div className={styles.home}>
            <Container className={styles.container}>
                {/* <h1> Welcome to the Adgytec Dashboard!👋</h1> */}

                {/* <p> */}
                {/*     Here you can manage all your project content. Simply select */}
                {/*     an option from the navigation bar to get started. */}
                {/* </p> */}

                <Changelog />

                <div className={styles.image}>
                    <Image
                        src="/home.png"
                        alt=""
                        width={420}
                        height={370}
                        priority
                    />
                </div>
            </Container>
        </div>
    );
};

export default Home;
