@echo off
if not exist "public\assets" mkdir "public\assets"
copy /Y "C:\Users\omdpa\.gemini\antigravity\brain\d79bbdf6-cf80-415c-a051-8b43ca8a2836\nexus_ai_logo_1769766073331.png" "public\assets\logo.png"
copy /Y "C:\Users\omdpa\.gemini\antigravity\brain\d79bbdf6-cf80-415c-a051-8b43ca8a2836\modern_office_auth_bg_1769766092264.png" "public\assets\auth-bg.png"
dir "public\assets"
