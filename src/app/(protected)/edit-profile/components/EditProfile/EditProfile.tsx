import {
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "@adgytec/adgytec-web-ui-components";
import { LockKeyhole, UserRoundPen } from "lucide-react";
import { useRef } from "react";
import { useResizeObserver } from "usehooks-ts";
import { ChangePassword } from "../ChangePassword";
import { EditUserProfile } from "../EditUserProfile";

export const EditProfile = () => {
    const tabsRef = useRef<HTMLDivElement>(null);
    const { width } = useResizeObserver({
        ref: tabsRef as React.RefObject<HTMLDivElement>,
    });

    const isLargeContainer = (width ?? 0) > 600;
    return (
        <Tabs
            ref={tabsRef}
            orientation={isLargeContainer ? "vertical" : "horizontal"}
        >
            <TabList style={{ scrollbarWidth: "none" }}>
                <Tab id="edit" label="Edit Profile" icon={UserRoundPen} />

                <Tab id="password" label="Change Password" icon={LockKeyhole} />
            </TabList>

            <TabPanels>
                <TabPanel id="edit">
                    <EditUserProfile />
                </TabPanel>

                <TabPanel id="password">
                    <ChangePassword />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
};
