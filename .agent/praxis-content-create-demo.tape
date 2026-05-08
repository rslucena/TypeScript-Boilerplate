Output docs/public/praxis-content-create-demo.gif

Require bun

Set FontSize 16
Set Width 1000
Set Height 550
Set Padding 40
Set Theme "Catppuccin Macchiato"
Set WindowBar Colorful
Set Framerate 30
Set PlaybackSpeed 0.8
Set TypingSpeed 75ms

Hide
Type 'export PS1="\e[36mpraxis-dev\e[0m:\e[34m~/app\e[0m$ "'
Enter
Type 'clear'
Enter
Show

Sleep 1s

Type "bun gen:domain invoice"
Sleep 500ms
Enter

Sleep 3s
Type "tree src/domain/invoice"
Sleep 500ms
Enter

Sleep 3s
