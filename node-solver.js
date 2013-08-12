var fs = require('fs');
var http = require('http');
var $ = require('jquery');

var data = fs.readFileSync('words.txt', { encoding: 'utf-8'});
var all_words = data.split("\n").map(function(o) { return o.trim(); }).sort();

var results = [];
var min_length_to_show = 8;


console.log("Words loaded!");

function getAllLetters(html) {
	var letters = $.parseJSON(html)['Letters'];
	return [letters.slice(0, 4), letters.slice(4, 8), letters.slice(8, 12), letters.slice(12, 16)];
}

function getInitialVisited() {
	return new Array([false, false, false, false], [false, false, false, false], [false, false, false, false], [false, false, false, false]);
}

function isWord(word) {
	word = word.toLowerCase();

	var a = 0;
	var b = all_words.length - 1;

	while(a <= b) {
		var mid = Math.floor((a + b) / 2);
		if(all_words[mid] < word) {
			a = mid + 1;
		} else {
			if(all_words[mid] > word) {
				b = mid - 1;
			} else {
				// found exact match
				return 1; 
			}
			
		}
	}

	if(all_words[a].match(word) || all_words[b].match(word)) {
		// still a chance
		return 0; 
	} else {
		return -1;
	}
}


function printBoard(board) {
	for(var i = 0; i < 4; i++) {
		for(var j = 0; j < 4; j++) {
			if(board[i][j]) {
				process.stdout.write(board[i][j] + " ");
			} else {
				process.stdout.write("X ");
			}
		}
		process.stdout.write("\n");
	}
	process.stdout.write("----------\n");
}

function copyBoard(board) {
	var newBoard = [];

	for(var i = 0; i < 4; i++) {
		newBoard.push([]);
		for(var j = 0; j < 4; j++) {
			newBoard[i][j] = board[i][j];
		}
	}

	return newBoard;
}


function generateAllWords(word, i, j, letters, visited) {
	function generateWordsForPosition(i, j) {
		if(!visited[i][j]) { 
			visited[i][j] = word.length + 1;

			var new_word = word + letters[i][j];
			var res = isWord(new_word);

			if(res == 1) {
				results.push({ 'word' : new_word, 'board' : copyBoard(visited) });
			} 

			if(res >= 0) {
				generateAllWords(new_word, i, j, letters, visited);
			}

			visited[i][j] = false; 
		}
	}

	if(i < 3) {
		generateWordsForPosition(i+1, j);
	}

	if(i > 0) {
		generateWordsForPosition(i-1, j);
	}

	if(j < 3) {
		generateWordsForPosition(i, j+1);
	}

	if(j > 0) {
		generateWordsForPosition(i, j-1);
	}

	if(i < 3 && j < 3) {
		generateWordsForPosition(i+1, j+1);
	}

	if(i < 3 && j > 0) {
		generateWordsForPosition(i+1, j-1);
	}

	if(i > 0 && j < 3) {
		generateWordsForPosition(i-1, j+1);
	}

	if(i > 0 && j > 0) {
		generateWordsForPosition(i-1, j-1);
	}
}

function generateForEeachStartingPoint(letters) {
	var visited;

	for(var i = 0; i < 4; i++) {
		for(var j = 0; j < 4; j++) {
			visited = getInitialVisited();
			visited[i][j] = 1;

			// console.log("Started for letter " + letters[i][j]);
			generateAllWords(letters[i][j], i, j, letters, visited);

		}
	}
}


function solve() {
	options = {
	    host: 'slowotok.pl',
	    port: 80,
	    path: '/play/board',
	    headers: {
	    	'Cookie' : '.ASPXAUTH=<YOUR COOKIE>'
	    }
	};

	var html = '';
	http.get(options, function(res) {
	    res.on('data', function(data) {
	        html += data;
	    }).on('end', function() {
	        var letters = getAllLetters(html);
	        console.log("Got letters!");     
	        console.log(letters);

			generateForEeachStartingPoint(letters);
			results = results.filter(function(o) { return o.word.length >= min_length_to_show }).sort(function(a, b) { if(a.word.length >= b.word.length) return -1; else return 1; });

			for (var i = 0; i < results.length; i++) {
				console.log(results[i].word);
				printBoard(results[i].board);
			};
	     });
	});
}


process.stdin.on('data', function (chunk) {
	results = [];
	solve();
});
