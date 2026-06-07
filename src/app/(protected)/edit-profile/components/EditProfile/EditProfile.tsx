import {
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from "@adgytec/adgytec-web-ui-components";
import { LockKeyhole, UserRoundPen } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { ChangePassword } from "../ChangePassword";
import { EditUserProfile } from "../EditUserProfile";

export const EditProfile = () => {
    const isLargeScreen = useMediaQuery("(min-width: 40rem)");

    return (
        <Tabs orientation={isLargeScreen ? "vertical" : "horizontal"}>
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
