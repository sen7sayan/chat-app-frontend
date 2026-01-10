import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });

// app/layout.js
export const metadata = {
  title: "Convoo",
  description:
    "A Convoo chat application",
};



export default function RootLayout({ children }) {
  return (
    <>
    
    
    <html lang="en">
     
      <body className={inter.className}>
         
        {children}
        </body>
    </html>
    </>
  );
}
