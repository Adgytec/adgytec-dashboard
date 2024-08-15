import Container from "@/components/Container/Container";
import React from "react";

const NotFoundService = () => {
	return (
		<Container data-empty={true}>
			<h3>
				This service doesn&apos;t exist or we are working on it. Please
				contact us at{" "}
				<a
					href="mailto:info@adgytec.in"
					data-type="link"
					data-variant="secondary"
				>
					info@adgytec.in
				</a>{" "}
				if it&apos;s a valid service.
			</h3>
		</Container>
	);
};

export default NotFoundService;
