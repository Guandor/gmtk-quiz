const state = {
	games: [],
	currentIndex: 0,
	yesCount: 0,
	isGameOver: false,
};

const DOM = {
	header: document.getElementsByTagName('header')[0],
	gameCard: document.getElementById('game-card'),
	gameName: document.getElementById('game-name'),
	gameImage: document.getElementById('game-image'),
	progress: document.getElementById('progress'),
	progressText: document.getElementById('progress-text'),
	result: document.getElementById('result'),
	resultText: document.getElementById('result-text'),
	noButton: document.getElementById('no-button'),
	yesButton: document.getElementById('yes-button'),
};

async function loadGames() {
	try {
		const response = await fetch('games.json');
		state.games = await response.json();
		state.games = state.games.slice(0, 5);
		showGame();
	} catch (error) {
		console.error('Error loading games:', error);
	}
}

function showGame() {
	if (state.currentIndex < state.games.length) {
		updateGameCard(state.games[state.currentIndex]);
		updateProgressBar();
		DOM.gameCard.style.display = 'block';
		animateNewCard();
	} else {
		showResult();
	}
}

function updateGameCard(game) {
	DOM.gameName.textContent = game.name;
	//DOM.gameName.style.fontSize = game.name.length > 30 ? "1.2rem" : "1.5rem";
	DOM.gameImage.src = game.image;
}

function rateGame(rating) {
	if (state.isGameOver) return;

	const direction = rating === 'yes' ? 'right' : 'left';
	animateSwipe(direction);

	if (rating === 'yes') {
		state.yesCount++;
		state.games[state.currentIndex].is_played = true;
	} else {
		state.games[state.currentIndex].is_played = false;
	}
	state.currentIndex++;

	setTimeout(() => {
		//DOM.gameCard.style.display = 'none';
		DOM.gameCard.style.opacity = 0;
		DOM.gameCard.style.transform = 'none';
		if (state.currentIndex >= state.games.length) {
			state.isGameOver = true;
			showResult();
		} else {
			showGame();
		}
	}, 300);
}

function updateProgressBar() {
	const progress = ((state.currentIndex + 1) / state.games.length) * 100;
	DOM.progress.value = progress;
	DOM.progressText.textContent = `${state.currentIndex + 1} / ${state.games.length}`;
}

function showResult() {
	DOM.header.style.display = 'none';
	DOM.gameCard.style.display = 'none';
	DOM.progress.style.display = 'none';
	DOM.progressText.style.display = 'none';
	DOM.noButton.style.display = 'none';
	DOM.yesButton.style.display = 'none';

	DOM.result.style.display = 'block';
	DOM.resultText.innerHTML = `
      You played ${state.yesCount} out of ${state.games.length} games. <br />
    `;

	played = state.games.filter((game) => game.is_played);
	non_played = state.games.filter((game) => !game.is_played);
	played.forEach((game) => {
		DOM.resultText.innerHTML += `<br />✅ ${game.name}`;
	});
	non_played.forEach((game) => {
		DOM.resultText.innerHTML += `<br />⛔ ${game.name}`;
	});
}

function exportAsCSV() {
	const headers = ['Game Name', 'Played'];
	const csvContent = [
		'sep=;',
		headers.join(';'),
		...state.games.map((game) => `"${game.name}";${game.is_played}`),
	].join('\n');

	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	if (navigator.msSaveBlob) {
		navigator.msSaveBlob(blob, 'game_results.csv');
	} else {
		link.href = URL.createObjectURL(blob);
		link.setAttribute('download', 'game_results.csv');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}

function animateSwipe(direction) {
	anime({
		targets: DOM.gameCard,
		translateX: direction === 'right' ? '150%' : '-150%',
		rotate: direction === 'right' ? 30 : -30,
		opacity: 0,
		duration: 300,
		easing: 'easeInOutQuad',
	});
}

function animateNewCard() {
	anime.set(DOM.gameCard, {
		opacity: 0,
		translateY: 50,
		scale: 0.8,
	});

	anime({
		targets: DOM.gameCard,
		opacity: 1,
		translateY: 0,
		scale: 1,
		duration: 300,
		easing: 'easeOutQuad',
	});
}

DOM.noButton.addEventListener('click', () => rateGame('no'));
DOM.yesButton.addEventListener('click', () => rateGame('yes'));

document.addEventListener('keyup', (event) => {
	if (event.key === 'ArrowRight') rateGame('yes');
	else if (event.key === 'ArrowLeft') rateGame('no');
});

loadGames();
