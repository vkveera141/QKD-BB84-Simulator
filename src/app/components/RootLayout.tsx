import { Outlet, Link, useLocation } from "react-router";
import { QKDProvider } from "../context/QKDContext";

export function RootLayout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <QKDProvider>
      <div className="min-h-screen bg-[#0f1321]">
        {/* Navigation */}
        <nav className="border-b border-gray-800 bg-[#1a1f35]">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl text-white">BB84 Quantum Key Distribution</h1>
            </div>
            <div className="flex gap-1">
              <Link
                to="/"
                className={`px-6 py-3 rounded-t-lg transition-colors ${
                  isActive("/") && location.pathname === "/"
                    ? "bg-[#0f1321] text-cyan-400 border-b-2 border-cyan-400"
                    : "text-gray-400 hover:text-white hover:bg-[#252b47]"
                }`}
              >
                QKD Simulator
              </Link>
              <Link
                to="/encryption"
                className={`px-6 py-3 rounded-t-lg transition-colors ${
                  isActive("/encryption")
                    ? "bg-[#0f1321] text-cyan-400 border-b-2 border-cyan-400"
                    : "text-gray-400 hover:text-white hover:bg-[#252b47]"
                }`}
              >
                Encryption
              </Link>
              <Link
                to="/eavesdropping"
                className={`px-6 py-3 rounded-t-lg transition-colors ${
                  isActive("/eavesdropping")
                    ? "bg-[#0f1321] text-cyan-400 border-b-2 border-cyan-400"
                    : "text-gray-400 hover:text-white hover:bg-[#252b47]"
                }`}
              >
                Eavesdropping
              </Link>
              <Link
                to="/analysis"
                className={`px-6 py-3 rounded-t-lg transition-colors ${
                  isActive("/analysis")
                    ? "bg-[#0f1321] text-cyan-400 border-b-2 border-cyan-400"
                    : "text-gray-400 hover:text-white hover:bg-[#252b47]"
                }`}
              >
                Analysis
              </Link>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="max-w-[1600px] mx-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </QKDProvider>
  );
}
