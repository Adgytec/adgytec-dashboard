"use client";

import Image from "next/image";
import { Changelog } from "@/components/Changelog/Changelog";
import Container from "@/components/Container/Container";

const Home = () => {
    return (
        <div>
            <Container>
                {/* <h1> Welcome to the Adgytec Dashboard!👋</h1> */}

                {/* <p> */}
                {/*     Here you can manage all your project content. Simply select */}
                {/*     an option from the navigation bar to get started. */}
                {/* </p> */}

                <Changelog />

                <div>
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
