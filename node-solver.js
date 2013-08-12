var fs = require('fs');
var http = require('http');
var $ = require('jquery');

var data = fs.readFileSync('words.txt', { encoding: 'utf-8'});
var all_words = data.split("\n").map(function(o) { return o.trim(); }).sort();
var found_words = [];

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
				return true;
			}
			
		}
	}
	return false;
}


function printBoard(visited) {
	for(var i = 0; i < 4; i++) {
		for(var j = 0; j < 4; j++) {
			if(visited[i][j]) {
				process.stdout.write(visited[i][j] + " ");
			} else {
				process.stdout.write("X ");
			}
		}
		process.stdout.write("\n");
	}
	process.stdout.write("----------\n");
}

function generateAllWords(word, i, j, letters, visited) {
	function generateWordsForPosition(i, j) {
		if(!visited[i][j]) { 
			visited[i][j] = word.length + 1;

			var new_word = word + letters[i][j];

			if(isWord(new_word)) {
				console.log(new_word);
				printBoard(visited);
				found_words.push(new_word);
			}

			generateAllWords(new_word, i, j, letters, visited);

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
        // collect the data chunks to the variable named "html"
        html += data;
    }).on('end', function() {
        var letters = getAllLetters(html);
        console.log("Got letters!");
        console.log(letters);
		generateForEeachStartingPoint(letters);
		console.log("Found words:");
		console.log(found_words.sort(function(a, b) { if(a.length >= b.length) return -1; else return 1; }).join(", "));
     });
});
