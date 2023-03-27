import { Inter } from "next/font/google";
import HomeClient from "./components/HomeClient";
import styles from "./page.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className="container mx-auto mt-10">
      <HomeClient />
    </main>
  );
}
