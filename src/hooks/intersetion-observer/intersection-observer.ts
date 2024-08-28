import { MutableRefObject, useEffect, useMemo, useRef } from "react";

type UseIntersection = (
	callback: IntersectionObserverCallback,
	root?: HTMLElement | null
) => MutableRefObject<HTMLDivElement | null>;

export const useIntersection: UseIntersection = (callback, root = null) => {
	const elementRef = useRef<HTMLDivElement | null>(null);

	const options: IntersectionObserverInit = useMemo(() => {
		return {
			root: root,
			rootMargin: "0px 0px 100% 0px",
			threshold: 1,
		};
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver(callback, options);

		if (elementRef.current) {
			// console.log("observing");
			observer.observe(elementRef.current);
		}

		return () => {
			if (elementRef.current) {
				// console.log("unobserving");
				observer.unobserve(elementRef.current);
			}
		};
	}, [elementRef.current, callback, options]);

	return elementRef;
};
