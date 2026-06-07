import { useMediaQuery } from "usehooks-ts";

export function useNavigationDocked() {
    return useMediaQuery("(min-width: 52.5rem)");
}
