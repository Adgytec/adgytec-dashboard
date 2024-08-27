import { MutableRefObject, useEffect, useMemo, useRef } from "react";

type Callback = IntersectionObserverCallback;
type UseIntersection = (
	callback: Callback
) => MutableRefObject<HTMLElement | null>;

const useIntersection: UseIntersection = (callback) => {
	const elementRef = useRef<HTMLElement | null>(null);

	const options = useMemo(() => {
		return {
			root: null,
			rootMargin: "0 0 -100vb 0",
			threshold: 1,
		} as IntersectionObserverInit;
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver(callback, options);
		if (elementRef.current) observer.observe(elementRef.current);

		return () => {
			if (elementRef.current) observer.unobserve(elementRef.current);
		};
	}, [elementRef, callback, options]);

	return elementRef;
};
