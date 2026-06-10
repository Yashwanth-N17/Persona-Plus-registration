import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";

type AppShellProps = {
  children: React.ReactNode;
};

const AppShell = ({ children }: AppShellProps) => (
  <main className="relative bg-white text-foreground min-h-screen overflow-x-hidden">
    <CustomCursor />
    <ScrollProgress />
    <Navbar />
    <div className="pt-24">{children}</div>
    <Footer />
  </main>
);

export default AppShell;
