"use client";

import {
    Button,
    Checkbox,
    IconButton,
    Input,
    InputButton,
    Loader,
    useSnackbarQueue,
    validateAndGetFormValues,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { onAuthStateChanged } from "firebase/auth";
import { Eye, EyeOff, Palette } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { Suspense, useEffect, useState } from "react";
import { DialogTrigger, Form } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import z from "zod";
import { ThemeSelectorModal } from "@/components/ThemeSelectorModal";
import {
    auth,
    resendEmailVerification,
    signin,
    signoutUser,
} from "@/firebase/auth/auth";
import type { ValidationErrors } from "@/helpers/validation";
import { ForgetPasswordModal } from "./components/ForgetPasswordModal";
import styles from "./login.module.css";

const LoginSchema = z.object({
    email: z.email(),
    password: z.string(),
    remember: z
        .literal("on")
        .transform(() => true)
        .optional()
        .transform(Boolean),
});

const Login = () => {
    const { value: showPassword, toggle: togglePasswordVisibility } =
        useBoolean();

    const [signingIn, setSigningIn] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const [formFieldErr, setFormFieldErr] = useState<
        ValidationErrors | undefined
    >(undefined);

    const nextPath = useSearchParams().get("next");

    const snackBarQueue = useSnackbarQueue();

    const router = useRouter();

    useEffect(() => {
        const authState = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (!user.emailVerified) {
                    await resendEmailVerification();
                    snackBarQueue.add({
                        supportingText:
                            "A verification email has been sent to your email address. Verify your email and try again.",
                    });
                    await signoutUser();
                    setLoading(false);
                    return;
                }

                const path = nextPath ?? "/";
                router.push(path);
            } else {
                setLoading(false);
            }
        });

        return () => authState();
    }, [router, nextPath, snackBarQueue]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const result = validateAndGetFormValues(e.currentTarget, LoginSchema);
        if (!result.success) {
            setFormFieldErr(result.errors);
            return;
        }

        setFormFieldErr(undefined);

        setSigningIn(true);
        const { email, password, remember } = result.data;

        const { error } = await signin(email, password, remember);

        if (error) {
            setSigningIn(false);
            if (error.code === "auth/invalid-credential") {
                snackBarQueue.add({
                    supportingText:
                        "The email or password you entered is incorrect. Please try again.",
                });
            } else {
                snackBarQueue.add({
                    supportingText:
                        "We encountered an unexpected error on our end. Please try refreshing the page or come back later.",
                });
            }
            return;
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    width: "100dvi",
                    height: "100dvb",
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: "inherit",
                    color: "inherit",
                }}
            >
                <Loader size="medium" />
            </div>
        );
    }

    return (
        <div className={clsx(styles["page"])}>
            <div className={clsx(styles["blob3"])} />

            <div className={clsx(styles["login"])}>
                <div className={clsx(styles["header"])}>
                    <Image
                        src="/logo.svg"
                        alt="adgytec"
                        width="250"
                        height="50"
                    />

                    <ThemeSelectorModal>
                        <IconButton
                            icon={Palette}
                            tooltip="Theme options"
                            color="standard"
                        />
                    </ThemeSelectorModal>
                </div>

                <Form
                    onSubmit={handleLogin}
                    validationErrors={formFieldErr}
                    className={clsx(styles["form"])}
                >
                    <Input
                        name="email"
                        type="email"
                        placeholder="Email"
                        isRequired
                        isReadOnly={signingIn}
                        label={"Email ID"}
                    />

                    <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        isRequired
                        isReadOnly={signingIn}
                        label={"Password"}
                        trailing={
                            <InputButton
                                onPress={togglePasswordVisibility}
                                icon={showPassword ? EyeOff : Eye}
                            />
                        }
                    />

                    <Checkbox
                        name="remember"
                        isReadOnly={signingIn}
                        containerStateLayer
                    >
                        Remember me
                    </Checkbox>

                    <Button
                        type="submit"
                        isPending={signingIn}
                        data-login-button
                    >
                        Login
                    </Button>
                </Form>

                <div>
                    <DialogTrigger>
                        <Button isDisabled={signingIn} color="text">
                            Forgot Password?
                        </Button>

                        <ForgetPasswordModal />
                    </DialogTrigger>
                </div>
            </div>
        </div>
    );
};

const LoginSuspense = () => {
    return (
        <Suspense fallback={<Loader size="medium" />}>
            <Login />
        </Suspense>
    );
};

export default LoginSuspense;
