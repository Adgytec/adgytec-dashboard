import AuthProvider from "@/components/AuthContext/AuthProvider";
import Footer from "@/components/Footer/Footer";
import Nav from "@/components/Nav/Nav";

export default function ProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<AuthProvider>
			<div
				style={{
					display: "flex",
					gap: "2em",
					minHeight: "100vb",
					flexDirection: "column",
				}}
			>
				<Nav />
				<main
					style={{
						flexGrow: "1",
						position: "relative",
					}}
				>
					{children}
				</main>
				<Footer />
			</div>
		</AuthProvider>
	);
}
