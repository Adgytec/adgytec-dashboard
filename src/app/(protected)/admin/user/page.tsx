"use client";

import React from "react";
import UserList from "./components/userList/UserList";
import styles from "./user.module.scss";

const UserAdmin = () => {
    return (
        <div className={styles.container}>
            <UserList />
        </div>
    );
};

export default UserAdmin;
