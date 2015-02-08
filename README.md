Use standard node.js installation

On windows if in start menu you click node.js you get interactive shell

To run node. I found `Git bash` and `Git Shell` to be useful in windows. It displays current branch among other things

* `node start.js` to run the node server
* PhpStorm Debugging
 * Configuration
  * Run > Edit Configuration
  * Added new node.js configuration
  * Node Parameters `G:\PF\nodejs\node.exe`
  * Working directory `G:\dev\GitHub\nodeJs-Hello-Windows`
  * javascript file `start.js`
  * Do `NOT` click After launch in Browse Live/Edit
 * Run > Debug ..
 * I was unable to modify the values, using evaluate or watch
* Also noted that when you edit files and Save. JS Node refreshes whole cycle

To set up win merge as gitdiff tool

Edit `C:\Users\ZMac\.gitconfig` and change its content similar to

```
[user]
	name = zainengineer
	email = myemail@gmail.com
[core]
	autocrlf = true
[difftool "sourcetree"]
	cmd = 'G:/PFWinMerge/WinMergeU.exe' \"$LOCAL\" \"$REMOTE\"
[diff]
	tool = winmerge
[difftool "winmerge"]
	cmd = 'G:/PFWinMerge/WinMergeU.exe' \"$LOCAL\" \"$REMOTE\"
[difftool]
	prompt = false
```