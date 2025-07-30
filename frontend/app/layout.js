import { AuthProvider } from '@/context/AuthContext'; // Use the @ alias
import "./globals.css";

export const metadata = {
  title: "AI Job Tools",
  description: "Generate cover letters and more, instantly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}