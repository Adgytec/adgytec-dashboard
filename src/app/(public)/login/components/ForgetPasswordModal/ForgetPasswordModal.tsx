import {
    ActionDialog,
    Button,
    Input,
    Modal,
    ModalOverlay,
    typography,
    useSnackbarQueue,
    validateAndGetFormValues,
} from "@adgytec/adgytec-web-ui-components";
import clsx from "clsx";
import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Form } from "react-aria-components";
import { useBoolean } from "usehooks-ts";
import z from "zod";
import { forgotPassword } from "@/firebase/auth/auth";
import type { ValidationErrors } from "@/helpers/validation";
import styles from "./forgetPasswordModal.module.css";

const ForgetPasswordSchema = z.object({
    email: z.email(),
});

export const ForgetPasswordModal = () => {
    const {
        value: sending,
        setFalse: cancelSending,
        setTrue: startSending,
    } = useBoolean();

    const snackbarQueue = useSnackbarQueue();
    const [fieldErr, setFieldErr] = useState<ValidationErrors | undefined>(
        undefined
    );
    const [formErr, setFormErr] = useState<string | null>(null);

    const handleReset = async (
        e: React.FormEvent<HTMLFormElement>,
        close: () => void
    ) => {
        e.preventDefault();

        const result = validateAndGetFormValues(
            e.currentTarget,
            ForgetPasswordSchema
        );
        if (!result.success) {
            setFieldErr(result.errors);
            return;
        }

        setFormErr(null);
        setFieldErr(undefined);

        startSending();
        const err = await forgotPassword(result.data.email);
        cancelSending();

        if (err) {
            setFormErr(err.message);
            return;
        }

        snackbarQueue.add(
            {
                supportingText:
                    "Password reset email sent. Please check your inbox and follow the instructions to reset your password.",
            },
            {
                timeout: 5000,
            }
        );
        close();
    };

    return (
        <ModalOverlay isKeyboardDismissDisabled={sending}>
            <Modal>
                <ActionDialog
                    heading="Forget Password"
                    icon={LockKeyhole}
                    divider="all"
                    actions={[
                        <Button
                            key="cancel"
                            slot="close"
                            color="text"
                            isDisabled={sending}
                        >
                            Cancel
                        </Button>,
                        <Button
                            key="reset"
                            color="text"
                            isPending={sending}
                            type="submit"
                            form="forget-password-form"
                        >
                            Reset
                        </Button>,
                    ]}
                >
                    {({ close }) => {
                        return (
                            <Form
                                id="forget-password-form"
                                validationErrors={fieldErr}
                                onSubmit={(e) => handleReset(e, close)}
                                className={clsx(styles["form"])}
                            >
                                <Input
                                    showDescriptionOnInvalid
                                    isReadOnly={sending}
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    isRequired
                                    label="Email"
                                    description="We'll send you a secure link to reset your password."
                                />

                                {formErr && (
                                    <p
                                        className={clsx(
                                            styles["error-message"],
                                            typography.bodySmall
                                        )}
                                    >
                                        {formErr}
                                    </p>
                                )}
                            </Form>
                        );
                    }}
                </ActionDialog>
            </Modal>
        </ModalOverlay>
    );
};
