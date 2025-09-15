document.addEventListener('DOMContentLoaded', () => {

    const BYPASS_PUZZLES = false;
    const SECRET_CODE = "260425"; 
    const FINAL_TEXT = "¡Te amo, mi Angie!";
    const photoData = {
        1: { src: "assets/images/foto1.jpg", message: "No estes triste amor🌻tienes que seguir adelante pese a todo mi niña", unlocked: false },
        2: { src: "assets/images/foto2.jpg", message: "Ese dia en el cine lo pase genial💖.", unlocked: false },
        3: { src: "assets/images/foto3.jpg", message: "Agarra mi mano fuerte si?😐", unlocked: false },
        4: { src: "assets/images/foto4.jpg", message: "Siempre recuerdame por si un dia no estoy💖", unlocked: false }
    };

    const loginScreen = document.getElementById('login-screen');
    const galleryScreen = document.getElementById('gallery-screen');
    const secretCodeInput = document.getElementById('secret-code');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');
    const backgroundMusic = document.getElementById('background-music');
    const fireworkSound = document.getElementById('firework-sound');
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
    const characterImage = document.getElementById('character-silhouette');
    const referenceImage = document.getElementById('reference-image'); 
    
    // --- AÑADIDO PARA LA LLUVIA DE MY MELODY ---
    const melodyRainContainer = document.getElementById('melody-rain-container');
    let rainIntervalId = null;
    // ------------------------------------------

    const fireworkSoundPool = [];
    const POOL_SIZE = 5; 
    let currentSoundIndex = 0;
    if (fireworkSound) { for (let i = 0; i < POOL_SIZE; i++) { fireworkSoundPool.push(fireworkSound.cloneNode()); } }

    loginButton.addEventListener('click', () => {
        if (secretCodeInput.value === SECRET_CODE) {
            backgroundMusic.play(); 
            fireworkSoundPool.forEach(sound => { sound.play(); sound.pause(); sound.currentTime = 0; });
            if (BYPASS_PUZZLES) {
                loginScreen.classList.remove('active');
                startFinalCelebration();
            } else {
                loginScreen.classList.remove('active');
                galleryScreen.classList.add('active');
                startMelodyRain(); // <-- LLUVIA INICIA AQUÍ
            }
        } else {
            errorMessage.classList.remove('hidden');
            secretCodeInput.classList.add('error');
            setTimeout(() => secretCodeInput.classList.remove('error'), 500);
        }
    });
    
    secretCodeInput.addEventListener('keyup', (event) => { if (event.key === 'Enter') { event.preventDefault(); loginButton.click(); } });
    
    let currentPuzzleId = null;
    let draggedPiece = null;
    
    document.querySelectorAll('.photo-container').forEach(c => { c.addEventListener('click', () => { const id = c.dataset.id; if (!photoData[id].unlocked) openPuzzle(id); }); });

    function openPuzzle(id) {
        currentPuzzleId = id;
        referenceImage.src = photoData[id].src;
        puzzleModal.style.display = 'flex';
        setTimeout(() => {
            generatePuzzle(id);
        }, 0); 
    }

    function generatePuzzle(id) {
        puzzleBoard.innerHTML = '';
        pieceContainer.innerHTML = '';
        const boardSize = puzzleBoard.clientWidth;
        const pieceSize = (boardSize - (4 * 2)) / 3;
        const pieces = [];
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.classList.add('puzzle-slot');
            slot.dataset.index = i;
            puzzleBoard.appendChild(slot);
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.draggable = true;
            piece.style.width = `${pieceSize}px`;
            piece.style.height = `${pieceSize}px`;
            piece.style.backgroundImage = `url(${photoData[id].src})`;
            piece.style.backgroundSize = `${boardSize}px ${boardSize}px`;
            const x = (i % 3) * pieceSize;
            const y = Math.floor(i / 3) * pieceSize;
            piece.style.backgroundPosition = `-${x}px -${y}px`;
            piece.dataset.index = i;
            pieces.push(piece);
        }
        pieces.sort(() => Math.random() - 0.5).forEach(p => pieceContainer.appendChild(p));
        addDragAndDropListeners();
    }

    function addDragAndDropListeners() {
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            piece.addEventListener('dragstart', (e) => {
                draggedPiece = e.target;
                setTimeout(() => e.target.classList.add('dragging'), 0);
            });
            piece.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });

        document.querySelectorAll('.puzzle-slot').forEach(slot => {
            slot.addEventListener('dragover', (e) => e.preventDefault());
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                if (e.target.classList.contains('puzzle-slot') && !e.target.hasChildNodes()) {
                    e.target.appendChild(draggedPiece);
                    if (draggedPiece.dataset.index === e.target.dataset.index) {
                        e.target.classList.add('correct');
                        e.target.classList.remove('incorrect');
                    } else {
                        e.target.classList.add('incorrect');
                        e.target.classList.remove('correct');
                    }
                }
            });
        });

        pieceContainer.addEventListener('dragover', (e) => e.preventDefault());
        pieceContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const parentSlot = draggedPiece.parentElement;
            if (parentSlot && parentSlot.classList.contains('puzzle-slot')) {
                parentSlot.classList.remove('correct', 'incorrect');
            }
            pieceContainer.appendChild(draggedPiece);
        });
    }
    
    checkPuzzleButton.addEventListener('click', () => { let isCorrect = true; const slots = puzzleBoard.querySelectorAll('.puzzle-slot'); for (let i = 0; i < slots.length; i++) { const piece = slots[i].querySelector('.puzzle-piece'); if (!piece || piece.dataset.index != slots[i].dataset.index) { isCorrect = false; break; } } if (isCorrect) { alert('¡Felicidades, lo lograste!'); unlockPhoto(currentPuzzleId); puzzleModal.style.display = 'none'; } else { alert('Ups, algunas piezas no están en su lugar. ¡Sigue intentando!'); } });
    closePuzzleButton.addEventListener('click', () => puzzleModal.style.display = 'none');
    function unlockPhoto(id) { photoData[id].unlocked = true; const c = document.querySelector(`.photo-container[data-id='${id}']`); c.classList.add('unlocked'); c.querySelector('.photo-preview').classList.remove('blurred'); showUnlockedModal(id); }
    function showUnlockedModal(id) { unlockedPhoto.src = photoData[id].src; loveMessage.textContent = photoData[id].message; unlockedModal.style.display = 'flex'; }
    closeUnlockedButton.addEventListener('click', () => { unlockedModal.style.display = 'none'; checkCompletion(); });
    
    function checkCompletion() {
        if (Object.values(photoData).every(p => p.unlocked)) {
            stopMelodyRain(); // <-- LLUVIA SE DETIENE AQUÍ
            setTimeout(startFinalCelebration, 500);
        }
    }

    function startFinalCelebration() {
        galleryScreen.style.display = 'none'; loginScreen.style.display = 'none';
        finalMessage.textContent = FINAL_TEXT; finalCelebration.classList.add('active');
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        let fireworks = [], fallingSunflowers = [], shiningStars = [];
        const sunflowerEmoji = '🌻';
        let animationStartTime = Date.now();
        const animationDuration = 3000;
        class Firework { constructor() { this.x = Math.random() * canvas.width; this.y = canvas.height; this.targetY = 100 + Math.random() * (canvas.height / 2); this.color = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`; this.particles = []; this.exploded = false; this.speed = 2 + Math.random() * 3; } update() { if (!this.exploded) { this.y -= this.speed; if (this.y <= this.targetY) this.explode(); } this.particles.forEach(p => p.update()); } draw() { if (!this.exploded) { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill(); } this.particles.forEach(p => p.draw()); } explode() { this.exploded = true; if (fireworkSoundPool.length > 0) { const soundToPlay = fireworkSoundPool[currentSoundIndex]; soundToPlay.currentTime = 0; soundToPlay.play().catch(e => console.log("Error al reproducir sonido:", e)); currentSoundIndex = (currentSoundIndex + 1) % POOL_SIZE; } const s = 50 + Math.random() * 50; for (let i = 0; i < s; i++) { const a = Math.random() * Math.PI * 2, v = Math.random() * 5 + 1; this.particles.push(new Particle(this.x, this.y, this.color, a, v)); } } }
        class Particle { constructor(x, y, color, angle, speed) { this.x = x; this.y = y; this.color = color; this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed; this.alpha = 1; this.gravity = 0.08; this.friction = 0.98; } update() { this.x += this.vx; this.y += this.vy; this.vx *= this.friction; this.vy *= this.friction; this.vy += this.gravity; this.alpha -= 0.015; } draw() { ctx.save(); ctx.globalAlpha = Math.max(0, this.alpha); ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, 2, 2); ctx.restore(); } }
        class FallingSunflower { constructor() { this.x = Math.random() * canvas.width; this.y = -50; this.size = 20 + Math.random() * 30; this.speed = 1 + Math.random() * 2; this.rotation = Math.random() * Math.PI * 2; this.rotationSpeed = (Math.random() - 0.5) * 0.02; } update() { this.y += this.speed; this.rotation += this.rotationSpeed; if (this.y > canvas.height + 50) { this.y = -50; this.x = Math.random() * canvas.width; } } draw() { ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rotation); ctx.font = `${this.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sunflowerEmoji, 0, 0); ctx.restore(); } }
        class ShiningStar { constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.size = Math.random() * 2; this.maxAlpha = 0.5 + Math.random() * 0.5; this.alpha = 0; this.speed = 0.005 + Math.random() * 0.01; this.direction = 1; } update() { this.alpha += this.speed * this.direction; if (this.alpha > this.maxAlpha || this.alpha < 0) this.direction *= -1; } draw() { ctx.save(); ctx.globalAlpha = this.alpha; ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } }
        for(let i=0; i<30; i++) fallingSunflowers.push(new FallingSunflower());
        for(let i=0; i<100; i++) shiningStars.push(new ShiningStar());
        let frameCount = 0;
        function animate() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (frameCount % 20 === 0) fireworks.push(new Firework());
            shiningStars.forEach(s => { s.update(); s.draw(); });
            if (characterImage.complete && characterImage.naturalWidth !== 0) { const elapsed = Date.now() - animationStartTime; const progress = Math.min(elapsed / animationDuration, 1); const easeProgress = 1 - Math.pow(1 - progress, 3); const finalWidth = 350; const scale = finalWidth / characterImage.width; const finalHeight = characterImage.height * scale; const currentWidth = finalWidth * easeProgress; const currentHeight = finalHeight * easeProgress; const x = (canvas.width - currentWidth) / 2; const y = (canvas.height - currentHeight) / 2; ctx.globalAlpha = easeProgress; ctx.shadowColor = 'white'; ctx.shadowBlur = 25; ctx.drawImage(characterImage, x, y, currentWidth, currentHeight); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
            fallingSunflowers.forEach(sf => { sf.update(); sf.draw(); });
            fireworks.forEach((fw, i) => { fw.update(); fw.draw(); if (fw.exploded && fw.particles.every(p => p.alpha <= 0)) fireworks.splice(i, 1); });
            frameCount++; requestAnimationFrame(animate);
        }
        animate();
    }

    // --- FUNCIONES AÑADIDAS PARA LA LLUVIA DE MY MELODY ---
    function startMelodyRain() {
        melodyRainContainer.style.display = 'block';
        setTimeout(() => { melodyRainContainer.style.opacity = 1; }, 10); 
        rainIntervalId = setInterval(() => {
            const melody = document.createElement('img');
            melody.src = 'assets/images/my-melody.png';
            melody.classList.add('falling-melody');
            melody.style.left = Math.random() * 100 + 'vw';
            melody.style.animationDuration = (Math.random() * 5 + 5) + 's';
            const size = Math.random() * 40 + 30;
            melody.style.width = size + 'px';
            melody.style.opacity = Math.random() * 0.5 + 0.4;
            melodyRainContainer.appendChild(melody);
            melody.addEventListener('animationend', () => {
                melody.remove();
            });
        }, 300);
    }

    function stopMelodyRain() {
        if (rainIntervalId) {
            clearInterval(rainIntervalId);
        }
        melodyRainContainer.style.opacity = 0;
        setTimeout(() => {
            melodyRainContainer.style.display = 'none';
        }, 1000);
    }
    // ----------------------------------------------------

});