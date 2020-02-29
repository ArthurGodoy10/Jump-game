//variáveis de jogo

var canvas, ctx, ALTURA, LARGURA, maxPulos = 3, velocidade = 6,
estadoAtual, record, img, bg, spriteBoneco, spriteChao, jogar, perdeu,
novo, spriteRecorde,


estados = {
    jogar: 0,
    jogando: 1,
    perdeu: 2
},

chao = {
  y: 550,
  x: 0,
  altura: 50,

  atualiza: function() {
    this.x -= velocidade;
      if (this.x <= -300)
          this.x += 300;
  },

  desenha: function() {
    spriteChao.desenha(this.x, this.y);
    spriteChao.desenha(this.x + spriteChao.largura, this.y);
  }
},

bloco = {
  x: 50,
  y: 0,
  altura: 50,
  largura: 50,
  gravidade: 1.6,
  velocidade:0,
  forcaDoPulo:23.6,
  qntPulos: 0,
  score: 0,
  rotacao: 0,

  vidas: 3,
  colidindo: false,

  atualiza: function() {
    this.velocidade += this.gravidade;
    this.y += this.velocidade;
    this.rotacao += Math.PI / 180 * velocidade;
    console.log(this.y)

    //so segura o bloco no chão se o estadoAtual for !=(diferente) de estados.perdeu,no caso é como se desliga-se a gravidade
    if (this.y > chao.y - this.altura && estadoAtual != estados.perdeu) {
        this.y = chao.y - this.altura;
        this.qntPulos = 0;
        this.velocidade = 0;
    }
  },

  pula: function() {
    if (this.qntPulos < maxPulos) {
      this.velocidade = -this.forcaDoPulo;
      this.qntPulos++;
    }3
  },

  reset: function() {
    this.velocidade = 0;
    this.y = 0;
    if (this.score > record) {
        localStorage.setItem("record", this.score);
        record = this.score;
    }
    this.vidas = 3;
    this.score = 0;

    velocidade = 6;

  },

  desenha: function() {
      ctx.save();
      //operacoes para rotacionar
      ctx.translate(this.x + this.largura / 2, this.y + this.altura / 2);
      ctx.rotate(this.rotacao);
      spriteBoneco.desenha(-this.largura / 2, -this.altura / 2);
      ctx.restore();

      }
},

obstaculos = {
  _obs: [],
  _scored: false,
  cores: ["#FF0000", "#FF0000", "#120a8f", "	#FFFF00", "#FFFFFF"],
  tempoInsere: 0,

  insere: function () {
    this._obs.push({
        x:LARGURA,
        largura: 50,
        altura: 30 + Math.floor(120 * Math.random()),
        cor: this.cores[Math.floor(5 * Math.random())]
      });

      this.tempoInsere = 30 + Math.floor(21 * Math.random());
  },

  atualiza: function() {
      if (this.tempoInsere == 0)
          this.insere();
      else
          this.tempoInsere--;

      for (var i = 0, tam = this._obs.length; i < tam; i++) {
        var obs = this._obs[i];
        obs.x -= velocidade;

        //confirir a condição de colisão
        if (!bloco.colidindo && bloco.x < obs.x + obs.largura &&
            bloco.x + bloco.largura >= obs.x &&
            bloco.y + bloco.altura >= chao.y - obs.altura) {
            bloco.colidindo = true;

            setTimeout( function() {
              bloco.colidindo = false;
            }, 500);

          if (bloco.vidas >= 1)
              bloco.vidas--;

          else
              estadoAtual = estados.perdeu;
          }


        //se não colidir, olhar o x do obs e remover ele do arrey de obstaculos
        else if (obs.x <= 0 && !obs._scored) {
              bloco.score++;
              obs._scored = true;

        }

        else if (obs.x <= -obs.largura) {
          this._obs.splice(i, 1);
          tam--;
          i--;
        }
      }
  },

  //quando perder limpar a arrey de obstaculos
  limpa: function() {
    this._obs = [];
  },

  desenha: function() {
      for (var i = 0, tam = this._obs.length; i < tam; i++){
        var obs = this._obs[i];
        ctx.fillStyle = obs.cor;
        ctx.fillRect(obs.x, chao.y - obs.altura, obs.largura, obs.altura);
      }
  }
};

function Sprite(x, y, largura, altura, img) {
    this.x = x;
    this.y = y;
    this.largura = largura;
    this.altura = altura;
    console.log("LARGURA", this.largura)
    console.log("ALTURA", this.altura)

    this.desenha = function(xCanvas, yCanvas) {
        ctx.drawImage(img, this.x, this.y, this.largura, this.altura, xCanvas, yCanvas, this.largura, this.altura);

    }
}



function clique(event) {
    if (estadoAtual == estados.jogando)
        bloco.pula();

        else if (estadoAtual == estados.jogar) {
          estadoAtual = estados.jogando;
        }

        else if (estadoAtual == estados.perdeu && bloco.y >= 2 * ALTURA) {
          estadoAtual = estados.jogar;

          obstaculos.limpa ();
          bloco.reset();
          }
}

function main(){
  ALTURA = window.innerHeight;
  LARGURA = window.innerWidth;

  if (LARGURA >= 500) {
      LARGURA = 600;
      ALTURA = 600;

  }
  canvas = document.createElement("canvas");
  canvas.width = LARGURA;
  canvas.height = ALTURA;
  canvas.style.border = "1px solid #000";

  ctx = canvas.getContext("2d");
  document.body.appendChild(canvas);

  //variável para fazer saltar com a tecla espaço
  var teclas = {};
  document.addEventListener("keydown", function(e) {
    teclas[e.keyCode] = true;
    if( e.keyCode == 32 ) saltarBloco();
  }, false);

  function saltarBloco() {
    if (32 in teclas) {
      clique()
    }
  }

  estadoAtual = estados.jogar;
  record = localStorage.getItem("record");

  if ( record == null)
        record = 0;

  img = new Image();
  img.src = "imagens/itachifundo.jpg";
  bg = new Sprite(0, 0, 600, 600, img);

  img2 = new Image();
  img2.src = "imagens/sharingam3.png";
  spriteBoneco = new Sprite(0, 0, 51, 51, img2);

  img3 = new Image();
  img3.src = "imagens/chaoofc2.jpg";
  spriteChao = new Sprite(0, 0, 600, 50, img3);

  img4 = new Image();
  img4.src = "imagens/rocklee.png";
  jogar = new Sprite(0, 0, 200, 200, img4);

  img5 = new Image();
  img5.src = "imagens/perdeuofc.jpg";
  perdeu = new Sprite(0, 0, 200, 250, img5);

  img6 = new Image();
  img6.src = "imagens/recordofc.jpg";
  spriteRecorde = new Sprite(0, 0, 200, 50, img6);

  img7 = new Image();
  img7.src = "imagens/parabens.jpg";
  novo = new Sprite(0, 0, 200, 250, img7);

  roda();
}

function roda() {
  atualiza();
  desenha();

  window.requestAnimationFrame(roda);
}

function atualiza() {

  //so atualiza os obstaculosquando estiver jogando
  if (estadoAtual == estados.jogando)
      obstaculos.atualiza();

    bloco.atualiza();
    chao.atualiza();
  }

function desenha() {
  bg.desenha(0, 0);

  ctx.fillStyle = "#f00";
  ctx.font = "50px Arial";
  ctx.fillText(bloco.score, 30, 68);
  ctx.fillText(bloco.vidas, 540, 68);

  // ctx.fillStyle = "rgba(f, f, f, "+ labelNovaFase.opacidade +")";
  // ctx.fillText(labelNovaFase.texto, canvas.width / 2 - ctx.measureText(labelNovaFase.texto).width / 2, canvas.height / 3);

  if ( estadoAtual == estados.jogando)
      obstaculos.desenha();

  chao.desenha();
  bloco.desenha();

  if (estadoAtual == estados.jogar)
      jogar.desenha(LARGURA / 2 - jogar.largura / 2,
       ALTURA / 2 -jogar.altura / 2);

  if(estadoAtual == estados.perdeu) {
    perdeu.desenha(LARGURA / 2 - perdeu.largura / 2,
   ALTURA / 2 - perdeu.altura / 2 - spriteRecorde.altura / 2);

   spriteRecorde.desenha(LARGURA / 2 - spriteRecorde.largura / 2,
   ALTURA / 2 + perdeu.altura / 2 - spriteRecorde.altura / 2 + 5);

   ctx.fillStyle = "#f00";
   ctx.fillText(bloco.score, 345, 390);

   if (bloco.score > record){
      novo.desenha(LARGURA / 2 - 100, ALTURA / 2 - 150);
      ctx.fillText(bloco.score, 345, 450);
    }

    else
      ctx.fillText(record, 345, 450);
  }
}

//incializa o jogo
main();
