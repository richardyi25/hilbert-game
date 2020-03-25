# SKilbert

A JavaScript-based game of deducing theorems in propositional intuitionistic logic.
More information will be added soon (see 10th item in list)

Features to be implemented, in rough order of decreasing importance

- [X] Finish Specific Mode
- [X] Finish Rename Mode
- [X] Save progress to cookie
- [X] Use spaces to pad for theorems in display
- [ ] Change Sub (Apply Mode) syntax and display
- [ ] Make the interface better (make panel larger?)
- [ ] Add Tutorial page
- [ ] Add in-game tutorial
- [ ] Implement goals and write a cirriculum
- [ ] Add About page
	- [ ] Also add to this readme
- [ ] Option to toggle between binary and flat display
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
		- [ ] Fix theorem parsing so that tokens with spaces but without -> in between throws an error
		- [ ] Reset thm* and sub* variables on done/quit (?)
		- [ ] Make sure it's impossible to have input executed as code
		- [ ] Performance: Optimal time complexities for operations (what even is optimal?)
		- [ ] Remove JQuery dependency
	- [ ] Fix CSS so it has no * selector
	- [ ] Document code entirely
