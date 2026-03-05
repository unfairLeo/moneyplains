const Index = () => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden flex items-center justify-center">
      
      {/* 1. O VÍDEO NO FUNDO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source 
          src="http://googleusercontent.com/generated_video_content/8505759798573875816" 
          type="video/mp4" 
        />
      </video>

      {/* 2. A PELÍCULA ESCURA (Para dar contraste com o texto) */}
      <div className="absolute top-0 left-0 w-full h-full bg-slate-950/75 z-10"></div>

      {/* 3. O CONTEÚDO DA LANDING PAGE */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
          Money<span className="text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">Plan$</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-300 mb-10">
          Seu Assistente Financeiro Inteligente. Organize, guarde e invista com a ajuda da nossa IA de finanças.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Botão que leva para o Login ou Dashboard */}
          <a 
            href="/login" 
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
          >
            Começar Agora
          </a>
          
          <button className="bg-transparent border-2 border-green-500 text-green-500 hover:bg-green-500/10 font-bold py-4 px-8 rounded-full transition-all">
            Saiba Mais
          </button>
        </div>
      </div>

    </div>
  );
};

export default Index;
