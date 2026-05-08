Output docs/public/praxis-gen-keys.gif

Set FontSize 14
Set Width 1000
Set Height 600
Set Padding 30
Set Theme "Catppuccin Macchiato"

Hide
Type "export PS1='praxis-dev:~/app$ '" Enter
Type "rm -rf keys" Enter
Type "clear" Enter
Show

Sleep 500ms
Type "# Praxis Security: Generate RSA Keys, Certificates & JWKS" Enter
Sleep 1s
Type "bun gen:keys"
Sleep 500ms
Enter
Sleep 3s

Type "# Verify generated security artifacts" Enter
Sleep 500ms
Type "tree keys"
Sleep 500ms
Enter

Sleep 5s
