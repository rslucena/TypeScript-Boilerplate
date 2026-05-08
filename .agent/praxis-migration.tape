Output docs/public/praxis-migration.gif

Set FontSize 14
Set Width 1000
Set Height 600
Set Padding 30
Set Theme "Catppuccin Mocha"

Hide
Type 'export PS1="\[\e[32m\]praxis-dev\[\e[m\]:\[\e[34m\]~/app\[\e[m\]$ "'
Enter
Type 'clear'
Enter
Show

Sleep 1s
Type "bun db:migrate"
Sleep 1s
Enter

Sleep 3s

Type "bun db:migrate:push"
Sleep 1s
Enter

Sleep 4s

Down
Sleep 1s
Enter

Sleep 4s
