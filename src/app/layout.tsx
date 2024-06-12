import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/main.scss";
import ViewPort from "@/components/ViewPort/ViewPort";

import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Adgytec - Dashboard",
	description: "Client management dashboard for Team Adgytec",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ViewPort />
				<ToastContainer
					position="bottom-right"
					autoClose={5000}
					limit={10}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="dark"
					transition={Bounce}
				/>
				{children}
			</body>
		</html>
	);
}
