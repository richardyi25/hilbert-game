# SKilbert

A JavaScript-based game of deducing theorems in propositional intuitionistic logic.

More information will be added soon (see list below)

Features to be implemented, in rough order of decreasing importance

- [X] Finish Specific Mode
- [X] Finish Rename Mode
- [X] Save progress to cookie
- [X] Use spaces to pad for theorems in display
- [X] Change Sub (Apply Mode) syntax and display
- [X] Add arrow keys for command history
- [ ] Option to toggle between binary and flat display
- [ ] Fix theorem parsing so that tokens with spaces but without -> in between throws an error
- [ ] Disallow variables with - or > in them
- [ ] Use color to distinguish which variables are original or not in Apply/Specific
- [ ] Allow user to see original variables in Apply/Specific
- [ ] Rename Specific to Case (?)
- [ ] Implement goals and write a cirriculum
- [ ] Add About page
	- [ ] Also add to this readme
- [ ] Add Tutorial page
- [ ] Add in-game tutorial
- [ ] Make the interface better (make panel larger?)
- [ ] Add confirm to "quit" in Apply and Specific Modes
- [ ] Support undos and redos
	- [ ] Make system entirely persistent without having to redo all operations
- [ ] Allow exporting and importing of theorems
	- [ ] Normalize the syntax (convert all optional syntax to the same thing)
- [ ] Code Quality
	- [ ] Make JS code better (no new features)
		- [ ] Switch to objects for theorems instead of lists of length 3
		- [ ] Have a consistent storage between flat and binary modes of theorems
		- [ ] Rename, fix, and use checkEmpty and checkEOL
		- [ ] Change registers to be deep copies
		- [ ] Don't have HTML code in rendering
		- [ ] Reset thm* and sub* variables on done/quit (?)
		- [ ] Make sure it's impossible to have input executed as code
		- [ ] Performance: Optimal time complexities for operations (what even is optimal?)
		- [ ] Check if I should use event.which or an alternative
		- [ ] Remove JQuery from JS (?)
	- [ ] Fix CSS so it has no * selector
	- [ ] Document code entirely
	- [ ] Investigate whether the → character might have issues and alternate representations
