import { ResponsiveCarousel } from "@/components/slide";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <main className="flex justify-center items-center h-screen">
        <ResponsiveCarousel />
      </main>
      <footer></footer>
    </>
  );
}
