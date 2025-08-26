import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#0d102b] text-white overflow-hidden font-abeezee">
      {/* Links - parte de cima */}
      <div className="flex flex-row justify-between mt-4">
        <Link
          href="https://www.statum.com.br/"
          target="_blank"
          className="ml-6 text-white text-lg z-20"
        >
          STATUM
        </Link>
        <div>
          <Link href="" className="mr-4">
            Módulos
          </Link>
          <Link href="" className="mr-4">
            Serviços
          </Link>
          <Link href="" className="mr-4">
            Soluções
          </Link>
          <Link href="" className="mr-4">
            Roadmap
          </Link>
          <Link href="" className="mr-4">
            Whitepaper
          </Link>
        </div>
        <div className="flex">
          <Link href="" className="mr-4">
            <Image src="/img/github.svg" alt="Icon" width={24} height={24} />
          </Link>
          <Link href="" className="mr-4">
            <Image src="/img/discord.svg" alt="Icon" width={24} height={24} />
          </Link>
          <Link href="" className="mr-4">
            <Image src="/img/reddit.svg" alt="Icon" width={24} height={24} />
          </Link>
          <Link href="" className="mr-4">
            <Image src="/img/twitter.svg" alt="Icon" width={24} height={24} />
          </Link>
        </div>
      </div>
      {/* Conteúdo central */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center px-4 z-10">
        <h1 className="text-5xl md:text-7xl font-semibold bg-gradient-to-r from-[#a0a5b8] to-[#8da6d3] bg-clip-text text-transparent">
          KOMVOS <span className="text-[#8da6d3]">MIND</span>
        </h1>

        <p className="max-w-xl mt-6 text-sm md:text-base text-[#dcdce5]">
          Nossa tecnologia executa uma AI rápida (120 mil transações por
          segundo) e possui segurança de dados garantida. Seu algoritmo de
          consenso Proof of Stake permite velocidades ilimitadas.
        </p>

        <div className="mt-8 flex gap-4 flex-wrap justify-center">
          <Link href="#conheca">
            <p className="px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-br from-[#3f77ff] to-[#1e3a8a] hover:opacity-90 transition">
              Conheça mais
            </p>
          </Link>
          <Link href="#ecossistemas">
            <p className="px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-br from-[#d1b2ff] to-[#8e7aff] hover:opacity-90 transition">
              Ecossistemas
            </p>
          </Link>
        </div>
      </div>

      {/* Imagem de fundo */}
      <Image
        src="/img/Looper.png"
        alt="Looper Animation"
        width={1920}
        height={1080}
        className="w-full h-auto absolute bottom-0 left-0 z-0"
        priority
        style={{ objectFit: "cover" }}
        unoptimized
      />
    </div>
  );
}
