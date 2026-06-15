"use client";

import {
    Activity,
    ArrowRight,
    Clock,
    Folder,
    FolderPen,
    ShieldCheck,
    Sparkles,
    UserRoundPen,
    UsersRound,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/components/AuthContext/authContext";
import { userRoles } from "@/helpers/type";
import styles from "./home.module.css";

const Home = () => {
    const userWithRole = useContext(UserContext);
    const user = userWithRole?.user;
    const role = userWithRole?.role;

    const isAdmin = role === userRoles.admin || role === userRoles.superAdmin;
    const isSuperAdmin = role === userRoles.superAdmin;

    const [dateStr, setDateStr] = useState<string>("");
    const [greeting, setGreeting] = useState<string>("Welcome");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");

        setDateStr(
            new Date().toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        );
    }, []);

    const displayName = user?.displayName || "Dashboard User";

    return (
        <div className={styles.dashboard}>
            {/* Hero Greeting Section */}
            <div className={styles.heroCard}>
                <div className={styles.heroContent}>
                    <div className={styles.timeGreeting}>
                        <Sparkles size={16} />
                        {greeting}
                    </div>
                    <h1 className={styles.heroTitle}>
                        Welcome back, {displayName}! 👋
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Manage your workspace, organize projects, and edit
                        content. Select an option below or use the sidebar
                        navigation to get started.
                    </p>
                </div>
                {/* <div className={styles.heroImageWrapper}> */}
                {/*     <Image */}
                {/*         src="/adgytec.jpeg" */}
                {/*         alt="Adgytec" */}
                {/*         width={200} */}
                {/*         height={200} */}
                {/*         priority */}
                {/*         className={styles.heroImage} */}
                {/*     /> */}
                {/* </div> */}
            </div>

            {/* Quick Stats Panel */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div
                        className={`${styles.statIconWrapper} ${styles.primary}`}
                    >
                        <ShieldCheck size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Security Role</span>
                        <span className={styles.statValue}>
                            {isSuperAdmin
                                ? "Super Admin"
                                : isAdmin
                                  ? "Admin"
                                  : "Workspace Member"}
                        </span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper}>
                        <Activity size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>System Status</span>
                        <span
                            className={`${styles.statValue} ${styles.successText}`}
                        >
                            Connected
                        </span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div
                        className={`${styles.statIconWrapper} ${styles.success}`}
                    >
                        <Clock size={20} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Today's Date</span>
                        <span className={styles.statValue}>
                            {dateStr || "Loading..."}
                        </span>
                    </div>
                </div>
            </div>

            {/* Section Heading */}
            <h2 className={styles.sectionHeading}>Quick Actions</h2>

            {/* Action Card Grid */}
            <div className={styles.cardGrid}>
                {/* General: Workspace Projects */}
                <Link href="/projects" className={styles.actionCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIconWrapper}>
                            <Folder size={24} />
                        </div>
                        <ArrowRight className={styles.cardArrow} size={20} />
                    </div>
                    <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>My Projects</h3>
                        <p className={styles.cardDescription}>
                            Browse and access all projects in your workspace,
                            update deliverables, and monitor progress.
                        </p>
                    </div>
                </Link>

                {/* General: Edit Profile */}
                <Link href="/edit-profile" className={styles.actionCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIconWrapper}>
                            <UserRoundPen size={24} />
                        </div>
                        <ArrowRight className={styles.cardArrow} size={20} />
                    </div>
                    <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>Edit Profile</h3>
                        <p className={styles.cardDescription}>
                            Customize your profile information, manage
                            credentials, and configure account preferences.
                        </p>
                    </div>
                </Link>

                {/* Admin Actions */}
                {isAdmin && (
                    <>
                        <Link
                            href="/admin/projects"
                            className={styles.actionCard}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.cardIconWrapper}>
                                    <FolderPen size={24} />
                                </div>
                                <ArrowRight
                                    className={styles.cardArrow}
                                    size={20}
                                />
                            </div>
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>
                                    Manage Projects
                                </h3>
                                <p className={styles.cardDescription}>
                                    Administrative control to register new
                                    projects, update configurations, and manage
                                    assignments.
                                </p>
                            </div>
                        </Link>

                        <Link href="/admin/user" className={styles.actionCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardIconWrapper}>
                                    <UsersRound size={24} />
                                </div>
                                <ArrowRight
                                    className={styles.cardArrow}
                                    size={20}
                                />
                            </div>
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>
                                    Manage Users
                                </h3>
                                <p className={styles.cardDescription}>
                                    Administrative view of accounts, role
                                    assignments, system access management, and
                                    settings.
                                </p>
                            </div>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;
