document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN INICIAL ---
    const SECRET_CODE = "260425";
    const FINAL_TEXT = "¡Te amo, mi Angie!";
    const photoData = {
        1: { src: "assets/images/foto1.jpg", message: "No estes triste amor🌻tienes que seguir adelante pese a todo mi niña", unlocked: false },
        2: { src: "assets/images/foto2.jpg", message: "Ese dia en el cine lo pase genial💖.", unlocked: false },
        3: { src: "assets/images/foto3.jpg", message: "Agarra mi mano fuerte si? 😐", unlocked: false },
        4: { src: "assets/images/foto4.jpg", message: "Siempre recuerdame por si un dia no estoy 💖", unlocked: false }
    };

    // --- ELEMENTOS DEL DOM ---
    const loginScreen = document.getElementById('login-screen');
    const galleryScreen = document.getElementById('gallery-screen');
    const secretCodeInput = document.getElementById('secret-code');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');
    const backgroundMusic = document.getElementById('background-music');
    const puzzleModal = document.getElementById('puzzle-modal');
    const puzzleBoard = document.getElementById('puzzle-board');
    const pieceContainer = document.getElementById('piece-container');
    const checkPuzzleButton = document.getElementById('check-puzzle-button');
    const closePuzzleButton = document.getElementById('close-puzzle-button');
    const unlockedModal = document.getElementById('unlocked-modal');
    const unlockedPhoto = document.getElementById('unlocked-photo');
    const loveMessage = document.getElementById('love-message');
    const closeUnlockedButton = document.getElementById('close-unlocked-button');
    const finalCelebration = document.getElementById('final-celebration');
    const finalMessage = document.getElementById('final-message');
    const canvas = document.getElementById('celebration-canvas');
    const ctx = canvas.getContext('2d');

    let currentPuzzleId = null;
    let draggedPiece = null;

    // --- LÓGICA DE LOGIN ---
    loginButton.addEventListener('click', () => {
        if (secretCodeInput.value.toLowerCase() === SECRET_CODE) {
            loginScreen.classList.remove('active');
            galleryScreen.classList.add('active');
            backgroundMusic.play().catch(error => console.log("La reproducción automática fue bloqueada."));
        } else {
            errorMessage.classList.remove('hidden');
            secretCodeInput.classList.add('error');
            setTimeout(() => secretCodeInput.classList.remove('error'), 500);
        }
    });

    // --- LÓGICA DE LA GALERÍA ---
    document.querySelectorAll('.photo-container').forEach(container => {
        container.addEventListener('click', () => {
            const id = container.dataset.id;
            if (!photoData[id].unlocked) openPuzzle(id);
        });
    });

    // --- LÓGICA DEL PUZZLE ---
    function openPuzzle(id) {
        currentPuzzleId = id;
        generatePuzzle(id);
        puzzleModal.style.display = 'flex';
    }

    function generatePuzzle(id) {
        puzzleBoard.innerHTML = '';
        pieceContainer.innerHTML = '';
        const pieces = [];
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.classList.add('puzzle-slot');
            slot.dataset.index = i;
            puzzleBoard.appendChild(slot);
            
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.draggable = true;
            piece.style.backgroundImage = `url(${photoData[id].src})`;
            const x = (i % 3) * 50;
            const y = Math.floor(i / 3) * 50;
            piece.style.backgroundPosition = `${x}% ${y}%`;
            piece.dataset.index = i;
            pieces.push(piece);
        }
        pieces.sort(() => Math.random() - 0.5).forEach(piece => pieceContainer.appendChild(piece));
        addDragAndDropListeners();
    }

    function addDragAndDropListeners() {
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            piece.addEventListener('dragstart', (e) => { draggedPiece = e.target; });
        });
        document.querySelectorAll('.puzzle-slot').forEach(slot => {
            slot.addEventListener('dragover', (e) => e.preventDefault());
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                if (e.target.classList.contains('puzzle-slot') && !e.target.hasChildNodes()) {
                    e.target.appendChild(draggedPiece);
                }
            });
        });
        pieceContainer.addEventListener('dragover', (e) => e.preventDefault());
        pieceContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            e.target.closest('#piece-container').appendChild(draggedPiece);
        });
    }

    checkPuzzleButton.addEventListener('click', () => {
        let isCorrect = true;
        const slots = puzzleBoard.querySelectorAll('.puzzle-slot');
        for (let i = 0; i < slots.length; i++) {
            const piece = slots[i].querySelector('.puzzle-piece');
            if (!piece || piece.dataset.index != slots[i].dataset.index) {
                isCorrect = false;
                break;
            }
        }
        if (isCorrect) {
            alert('¡Felicidades, lo lograste!');
            unlockPhoto(currentPuzzleId);
            puzzleModal.style.display = 'none';
        } else {
            alert('Ups, algunas piezas no están en su lugar. ¡Sigue intentando!');
        }
    });

    closePuzzleButton.addEventListener('click', () => { puzzleModal.style.display = 'none'; });
    
    // --- LÓGICA DE DESBLOQUEO ---
    function unlockPhoto(id) {
        photoData[id].unlocked = true;
        const container = document.querySelector(`.photo-container[data-id='${id}']`);
        container.classList.add('unlocked');
        container.querySelector('.photo-preview').classList.remove('blurred');
        showUnlockedModal(id);
    }
    
    function showUnlockedModal(id) {
        unlockedPhoto.src = photoData[id].src;
        loveMessage.textContent = photoData[id].message;
        unlockedModal.style.display = 'flex';
    }

    closeUnlockedButton.addEventListener('click', () => {
        unlockedModal.style.display = 'none';
        checkCompletion();
    });

    // --- LÓGICA DE COMPLETADO Y CELEBRACIÓN FINAL ---
    function checkCompletion() {
        const allUnlocked = Object.values(photoData).every(photo => photo.unlocked);
        if (allUnlocked) {
            setTimeout(startFinalCelebration, 500);
        }
    }

    function startFinalCelebration() {
        galleryScreen.style.display = 'none';
        finalMessage.textContent = FINAL_TEXT;
        finalCelebration.classList.add('active');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let fireworks = [];
        let fallingSunflowers = [];
        let shiningStars = [];

        // Preparamos el emoji de girasol para dibujarlo
        const sunflowerEmoji = '🌻';

        // Clase para los Fuegos Artificiales (mejorada)
        class Firework {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height;
                this.targetY = 100 + Math.random() * (canvas.height / 2);
                this.color = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`; // Tonos amarillos y naranjas
                this.particles = [];
                this.exploded = false;
                this.speed = 2 + Math.random() * 3;
            }
            update() {
                if (!this.exploded) {
                    this.y -= this.speed;
                    if (this.y <= this.targetY) this.explode();
                }
                this.particles.forEach(p => p.update());
            }
            draw() {
                if (!this.exploded) {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                this.particles.forEach(p => p.draw());
            }
            explode() {
                this.exploded = true;
                const explosionSize = 50 + Math.random() * 50;
                for (let i = 0; i < explosionSize; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 5 + 1;
                    this.particles.push(new Particle(this.x, this.y, this.color, angle, speed));
                }
            }
        }
        class Particle {
            constructor(x, y, color, angle, speed) {
                this.x = x; this.y = y; this.color = color;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.alpha = 1; this.gravity = 0.08;
                this.friction = 0.98;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                this.vx *= this.friction; this.vy *= this.friction;
                this.vy += this.gravity; this.alpha -= 0.015;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = Math.max(0, this.alpha);
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, 2, 2);
                ctx.restore();
            }
        }

        // Clase para los Girasoles que caen
        class FallingSunflower {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = -50;
                this.size = 20 + Math.random() * 30;
                this.speed = 1 + Math.random() * 2;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            }
            update() {
                this.y += this.speed;
                this.rotation += this.rotationSpeed;
                if (this.y > canvas.height + 50) {
                    this.y = -50;
                    this.x = Math.random() * canvas.width;
                }
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.font = `${this.size}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(sunflowerEmoji, 0, 0);
                ctx.restore();
            }
        }
        
        // Clase para las estrellas/luces parpadeantes
        class ShiningStar {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2;
                this.maxAlpha = 0.5 + Math.random() * 0.5;
                this.alpha = 0;
                this.speed = 0.005 + Math.random() * 0.01;
                this.direction = 1;
            }
            update() {
                this.alpha += this.speed * this.direction;
                if (this.alpha > this.maxAlpha || this.alpha < 0) {
                    this.direction *= -1;
                }
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Inicializamos los elementos
        for(let i=0; i<30; i++) fallingSunflowers.push(new FallingSunflower());
        for(let i=0; i<100; i++) shiningStars.push(new ShiningStar());
        
        let frameCount = 0;

        function animate() {
            // Fondo semitransparente para efecto de estela
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Crear fuegos artificiales continuamente
            if (frameCount % 20 === 0) { // Lanza uno cada 20 frames (aprox 3 por segundo)
                 fireworks.push(new Firework());
            }

            // Actualizar y dibujar estrellas
            shiningStars.forEach(s => { s.update(); s.draw(); });

            // Actualizar y dibujar fuegos artificiales
            fireworks.forEach((fw, i) => {
                fw.update();
                fw.draw();
                if (fw.exploded && fw.particles.every(p => p.alpha <= 0)) {
                    fireworks.splice(i, 1);
                }
            });

            // Actualizar y dibujar girasoles
            fallingSunflowers.forEach(sf => { sf.update(); sf.draw(); });
            
            frameCount++;
            requestAnimationFrame(animate);
        }
        animate();
    }
});