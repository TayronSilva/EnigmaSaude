const niveis = [
    {
      nome: "Fácil",
      palavras: ["AMOR", "BEIJO", "SEXO"],
      letrasExtras: "AEIOUBCDFGH",
      tamanho: 10,
      tempo: 90
    },
    {
      nome: "Médio",
      palavras: ["CAMISINHA", "RESPEITO", "DESEJO"],
      letrasExtras: "ZXCVBNMLKJHGFDS",
      tamanho: 12,
      tempo: 120
    },
    {
      nome: "Difícil",
      palavras: ["CONSENTIMENTO", "CONTRACEPTIVO", "PREVENÇÃO"],
      letrasExtras: "QWERTYUIOPASDFGHJKL",
      tamanho: 14,
      tempo: 180
    }
  ];
  
  let nivelAtual = 0;
  let tempoRestante;
  let intervalo;
  let palavrasEncontradas = [];
  
  const telaInicial = document.getElementById('tela-inicial');
  const telaJogo = document.getElementById('tela-jogo');
  const btnIniciar = document.getElementById('btn-iniciar');
  const nivelSpan = document.getElementById('nivel-atual');
  const tempoSpan = document.getElementById('tempo');
  const palavrasDiv = document.getElementById('palavras');
  const gridDiv = document.getElementById('grid');
  
  btnIniciar.addEventListener('click', iniciarJogo);
  
  function iniciarJogo() {
    telaInicial.classList.remove('visivel');
    telaJogo.classList.add('visivel');
    palavrasEncontradas = [];
    carregarNivel(nivelAtual);
  }
  
  function carregarNivel(nivel) {
    const config = niveis[nivel];
    nivelSpan.textContent = config.nome;
    tempoRestante = config.tempo;
    tempoSpan.textContent = tempoRestante;
  
    // Mostrar palavras a encontrar
    palavrasDiv.innerHTML = `<h3>Palavras para encontrar:</h3><ul>${config.palavras.map(p => `<li>${p}</li>`).join('')}</ul>`;
  
    // Gera a grade dinâmica
    const gradeGerada = gerarGrade(nivel);
  
    criarGrid(gradeGerada);
  
    if (intervalo) clearInterval(intervalo);
    intervalo = setInterval(atualizarTempo, 1000);
  }
  
  // Gera a grade do caça palavras com as palavras posicionadas horizontalmente e letras extras preenchendo o resto
  function gerarGrade(nivel) {
    const config = niveis[nivel];
    const tamanho = config.tamanho;
    const grid = Array(tamanho).fill(null).map(() => Array(tamanho).fill(''));
  
    const randInt = (max) => Math.floor(Math.random() * max);
  
    const linhasUsadas = new Set();
  
    for (const palavra of config.palavras) {
      let linha;
      do {
        linha = randInt(tamanho);
      } while (linhasUsadas.has(linha));
      linhasUsadas.add(linha);
  
      const maxInicio = tamanho - palavra.length;
      const inicio = randInt(maxInicio + 1);
  
      for (let i = 0; i < palavra.length; i++) {
        grid[linha][inicio + i] = palavra[i];
      }
    }
  
    // Preenche espaços vazios com letras extras aleatórias
    for (let i = 0; i < tamanho; i++) {
      for (let j = 0; j < tamanho; j++) {
        if (grid[i][j] === '') {
          const letras = config.letrasExtras;
          grid[i][j] = letras.charAt(randInt(letras.length));
        }
      }
    }
  
    return grid;
  }
  
  let palavraSelecionada = '';
  let celulasSelecionadas = [];
  
  function criarGrid(grid) {
    gridDiv.innerHTML = '';
    const tamanho = grid.length;
  
    gridDiv.style.gridTemplateColumns = `repeat(${tamanho}, 1fr)`;
  
    // Ajusta o tamanho das células para caber na tela (mínimo 30px, máximo 50px)
    const maxCellSize = 50;
    const minCellSize = 30;
    // Considera 20px de padding + gaps (8px * (tamanho-1))
    const larguraDisponivel = Math.min(window.innerWidth * 0.95, 600) - 40;
    let cellSize = Math.floor((larguraDisponivel - (tamanho - 1) * 8) / tamanho);
    cellSize = Math.min(maxCellSize, Math.max(minCellSize, cellSize));
  
    for(let i = 0; i < tamanho; i++) {
      for(let j = 0; j < tamanho; j++) {
        const celula = document.createElement('div');
        celula.classList.add('celula');
        celula.textContent = grid[i][j];
        celula.dataset.linha = i;
        celula.dataset.coluna = j;
        celula.dataset.letra = grid[i][j];
        celula.style.width = `${cellSize}px`;
        celula.style.height = `${cellSize}px`;
        celula.style.fontSize = `${cellSize * 0.6}px`;
        celula.addEventListener('click', () => selecionarCelula(celula));
        gridDiv.appendChild(celula);
      }
    }
  }
  
  function selecionarCelula(celula) {
    if (celula.classList.contains('selecionada')) {
      celula.classList.remove('selecionada');
      celulasSelecionadas = celulasSelecionadas.filter(c => c !== celula);
      palavraSelecionada = palavraSelecionada.replace(celula.textContent, '');
    } else {
      celula.classList.add('selecionada');
      celulasSelecionadas.push(celula);
      palavraSelecionada += celula.textContent;
    }
  
    verificarPalavra();
  }
  
  function verificarPalavra() {
    const config = niveis[nivelAtual];
    const palavras = config.palavras;
  
    if(palavras.includes(palavraSelecionada)) {
      palavrasEncontradas.push(palavraSelecionada);
  
      // Marca palavra como encontrada na lista
      const lista = palavrasDiv.querySelectorAll('li');
      lista.forEach(li => {
        if(li.textContent === palavraSelecionada) {
          li.style.textDecoration = 'line-through';
          li.style.color = 'gray';
        }
      });
  
      // Limpa seleção
      palavraSelecionada = '';
      limparSelecao();
  
      Swal.fire({
        icon: 'success',
        title: 'Parabéns!',
        text: `Você encontrou a palavra!`,
        timer: 1500,
        showConfirmButton: false
      });
  
      if(palavrasEncontradas.length === palavras.length) {
        clearInterval(intervalo);
        Swal.fire({
          icon: 'success',
          title: `Você completou o nível ${config.nome}!`,
          confirmButtonText: 'Próximo nível'
        }).then(() => {
          nivelAtual++;
          if(nivelAtual < niveis.length) {
            carregarNivel(nivelAtual);
            palavrasEncontradas = [];
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Parabéns!',
              text: 'Você completou todos os níveis!',
              confirmButtonText: 'Reiniciar'
            }).then(() => location.reload());
          }
        });
      }
    }
  }
  
  function limparSelecao() {
    celulasSelecionadas.forEach(celula => celula.classList.remove('selecionada'));
    celulasSelecionadas = [];
    palavraSelecionada = '';
  }
  
  function atualizarTempo() {
    tempoRestante--;
    tempoSpan.textContent = tempoRestante;
  
    if(tempoRestante <= 0) {
      clearInterval(intervalo);
      Swal.fire({
        icon: 'error',
        title: 'Tempo esgotado!',
        text: 'Você não conseguiu encontrar todas as palavras a tempo. Tente novamente!',
        confirmButtonText: 'Reiniciar'
      }).then(() => location.reload());
    }
  }
  
  // Registra Service Worker para PWA (se existir sw.js)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker registrado com sucesso'))
        .catch(err => console.log('Falha ao registrar Service Worker:', err));
    });
  }
  