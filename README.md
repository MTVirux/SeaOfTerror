# Sea of Terror

This is a fork of the Dalamud plugin repo automations of SeaOfStars for my plugins.

## Installing
- Enter `/xlsettings` in the chat window and go to the Experimental tab in the opening window.
- **Skip below the DevPlugins section to the Custom Plugin Repositories section.**
- Copy and paste the repo.json link into the first free text input field.
```
https://raw.githubusercontent.com/MTVirux/SeaOfTerror/main/repo.json
```
- Click on the + button and make sure the checkmark beside the new field is set afterwards.
- **Click on the Save-icon in the bottom right.**

Following these steps, you should be able to see all contained plugins in the Available Plugins tab in the Dalamud Plugin Installer.
No Plugins will be installed, you have just made them available. You can now select which of these plugins you actually want to install.
# My Plugins

## [Kaleidoscope](https://github.com/MTVirux/Kaleidoscope)
Financial and inventory tracking HUD for FFXIV

## [Damage Terror](https://github.com/MTVirux/DamageTerror)
Native ImGui damage meter overlay powered by IINACT.

## [Crystal Terror](https://github.com/MTVirux/CrystalTerror)
Automatic management of auto-retainer ventures to maximixe elemental crystals output.

## [TempoTerror](https://github.com/MTVirux/TempoTerror)
Real-time scrolling timeline showing skill usage with action icons, cast bars, and per-player tracking.
Requires IINACT for network log data.


# Modified

## [Market Terror](https://github.com/MTVirux/MarketTerror) | [(Original Repo by fmauNeko)](https://github.com/fmauNeko/MarketBoardPlugin)
Modifications from the original:
- Lifestream integration
    - Clicking a listing will teleport you to that world's marketboard
- Modfied Charts tab with detailed market data from Unviersallis and FFXIVMT

## [Glamorous Terror](https://github.com/MTVirux/GlamorousTerror) | [(Original Repo by Ottermandias)](https://github.com/Ottermandias/Glamourer)
Modifications from the original include:
- Wildcard support
- Unlocked cheat mode -> Renamed to Fun Modes and toggles have been added
- Preview on equipment on mouse hover from the combo boxes

# External

## [IINACT](https://github.com/marzent/IINACT)
A plugin to run the FFXIV_ACT_Plugin in an ACT-like environment with a heavily modified port of OverlayPlugin. Provides network log parsing and overlay support; required by `Damage Terror` and `TempoTerror` for real-time data.

