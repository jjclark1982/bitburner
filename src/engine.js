import {dialogBoxCreate}                        from "../utils/DialogBox.js";
import {gameOptionsBoxOpen, gameOptionsBoxClose}from "../utils/GameOptions.js";
import {clearEventListeners}                    from "../utils/HelperFunctions.js";
import numeral                                  from "../utils/numeral.min.js";
import {formatNumber,
        convertTimeMsToTimeElapsedString}       from "../utils/StringHelperFunctions.js";
import {loxBoxCreate, logBoxUpdateText,
        logBoxOpened}                           from "../utils/LogBox.js";

import {setActiveScriptsClickHandlers,
        updateActiveScriptsItems}               from "./ActiveScriptsUI.js";
import {Augmentations, installAugmentations,
        initAugmentations, AugmentationNames}   from "./Augmentations.js";
import {BitNodes, initBitNodes,
        initBitNodeMultipliers}                 from "./BitNode.js";
import {CompanyPositions, initCompanies}        from "./Company.js";
import {CONSTANTS}                              from "./Constants.js";
import {Programs, displayCreateProgramContent,
        getNumAvailableCreateProgram,
        initCreateProgramButtons}               from "./CreateProgram.js";
import {displayFactionContent, joinFaction,
        processPassiveFactionRepGain, Factions,
        inviteToFaction, initFactions}          from "./Faction.js";
import {Locations, displayLocationContent,
        initLocationButtons}                    from "./Location.js";
import {displayGangContent, updateGangContent,
        Gang}                                   from "./Gang.js";
import {displayHacknetNodesContent, processAllHacknetNodeEarnings,
        updateHacknetNodesContent}              from "./HacknetNode.js";
import {iTutorialStart}                         from "./InteractiveTutorial.js";
import {initLiterature}                         from "./Literature.js";
import {checkForMessagesToSend, initMessages}   from "./Message.js";
import {inMission, currMission}                 from "./Missions.js";
import {initSingularitySFFlags,
        hasSingularitySF}                       from "./NetscriptFunctions.js";
import {updateOnlineScriptTimes,
        runScriptsLoop}                         from "./NetscriptWorker.js";
import {Player}                                 from "./Player.js";
import {prestigeAugmentation,
        prestigeSourceFile}                     from "./Prestige.js";
import {redPillFlag}                            from "./RedPill.js";
import {saveObject, loadGame}                   from "./SaveObject.js";
import {loadAllRunningScripts,
        updateScriptEditorContent}              from "./Script.js";
import {AllServers, Server, initForeignServers} from "./Server.js";
import {Settings, setSettingsLabels}            from "./Settings.js";
import {initSourceFiles, SourceFiles}           from "./SourceFile.js";
import {SpecialServerIps, initSpecialServerIps} from "./SpecialServerIps.js";
import {StockMarket, StockSymbols,
        SymbolToStockMap, initStockSymbols,
        initSymbolToStockMap, stockMarketCycle,
        updateStockPrices,
        displayStockMarketContent}              from "./StockMarket.js";
import {Terminal, postNetburnerText, post}      from "./Terminal.js";



/* Shortcuts to navigate through the game
 *  Alt-t - Terminal
 *  Alt-c - Character
 *  Alt-e - Script editor
 *  Alt-s - Active scripts
 *  Alt-h - Hacknet Nodes
 *  Alt-w - City
 *  Alt-j - Job
 *  Alt-r - Travel Agency of current city
 *  Alt-p - Create program
 *  Alt-f - Factions
 *  Alt-a - Augmentations
 *  Alt-u - Tutorial
 *  Alt-o - Options
 */
$(document).keydown(function(e) {
    if (!Player.isWorking && !redPillFlag && !inMission) {
        if (e.keyCode == 84 && e.altKey) {
            e.preventDefault();
            Engine.loadTerminalContent();
        } else if (e.keyCode == 67 && e.altKey) {
            e.preventDefault();
            Engine.loadCharacterContent();
        } else if (e.keyCode == 69 && e.altKey) {
            e.preventDefault();
            Engine.loadScriptEditorContent();
        } else if (e.keyCode == 83 && e.altKey) {
            e.preventDefault();
            Engine.loadActiveScriptsContent();
        } else if (e.keyCode == 72 && e.altKey) {
            e.preventDefault();
            Engine.loadHacknetNodesContent();
        } else if (e.keyCode == 87 && e.altKey) {
            e.preventDefault();
            Engine.loadWorldContent();
        } else if (e.keyCode == 74 && e.altKey) {
            e.preventDefault();
            Engine.loadJobContent();
        } else if (e.keyCode == 82 && e.altKey) {
            e.preventDefault();
            Engine.loadTravelContent();
        } else if (e.keyCode == 80 && e.altKey) {
            e.preventDefault();
            Engine.loadCreateProgramContent();
        } else if (e.keyCode == 70 && e.altKey) {
            e.preventDefault();
            Engine.loadFactionsContent();
        } else if (e.keyCode == 65 && e.altKey) {
            e.preventDefault();
            Engine.loadAugmentationsContent();
        } else if (e.keyCode == 85 && e.altKey) {
            e.preventDefault();
            Engine.loadTutorialContent();
        }
    }

    if (e.keyCode == 79 && e.altKey) {
        e.preventDefault();
        gameOptionsBoxOpen();
    }
});

let Engine = {
    version: "",
    Debug: true,

    //Clickable objects
    Clickables: {
        //Main menu buttons
        terminalMainMenuButton:         null,
        characterMainMenuButton:        null,
        scriptEditorMainMenuButton:     null,
        activeScriptsMainMenuButton:    null,
        hacknetNodesMainMenuButton:     null,
        worldMainMenuButton:            null,
        travelMainMenuButton:           null,
        jobMainMenuButton:              null,
        createProgramMainMenuButton:    null,
        factionsMainMenuButton:         null,
        augmentationsMainMenuButton:    null,
        tutorialMainMenuButton:         null,
        saveMainMenuButton:             null,
        deleteMainMenuButton:           null,

        //Tutorial buttons
        tutorialNetworkingButton:       null,
        tutorialHackingButton:          null,
        tutorialScriptsButton:          null,
        tutorialNetscriptButton:        null,
        tutorialTravelingButton:        null,
        tutorialCompaniesButton:        null,
        tutorialFactionsButton:         null,
        tutorialAugmentationsButton:    null,
        tutorialBackButton:             null,
    },

    //Display objects
    Display: {
        //Progress bar
        progress:               null,

        //Display for status text (such as "Saved" or "Loaded")
        statusText:             null,

        hacking_skill:          null,

        //Main menu content
        terminalContent:                null,
        characterContent:               null,
        scriptEditorContent:            null,
        activeScriptsContent:           null,
        hacknetNodesContent:            null,
        worldContent:                   null,
        createProgramContent:           null,
        factionsContent:                null,
        factionContent:                 null,
        factionAugmentationsContent:    null,
        augmentationsContent:           null,
        tutorialContent:                null,
        infiltrationContent:            null,
        stockMarketContent:             null,
        locationContent:                null,
        workInProgressContent:          null,
        redPillContent:                 null,
        missionContent:                 null,

        //Character info
        characterInfo:                  null,
    },

    //Current page status
    Page: {
        Terminal:           "Terminal",
        CharacterInfo:      "CharacterInfo",
        ScriptEditor:       "ScriptEditor",
        ActiveScripts:      "ActiveScripts",
        HacknetNodes:       "HacknetNodes",
        World:              "World",
        CreateProgram:      "CreateProgram",
        Factions:           "Factions",
        Faction:            "Faction",
        Augmentations:      "Augmentations",
        Tutorial:           "Tutorial",
        Location:           "Location",
        workInProgress:     "WorkInProgress",
        RedPill:            "RedPill",
        Infiltration:       "Infiltration",
        StockMarket:        "StockMarket",
        Gang:               "Gang",
        Mission:            "Mission",
    },
    currentPage:    null,


    //Time variables (milliseconds unix epoch time)
    _lastUpdate: new Date().getTime(),
    _idleSpeed: 200,    //Speed (in ms) at which the main loop is updated


    /* Load content when a main menu button is clicked */
    loadTerminalContent: function() {
        Engine.hideAllContent();
        Engine.Display.terminalContent.style.visibility = "visible";
        Engine.currentPage = Engine.Page.Terminal;
        document.getElementById("terminal-menu-link").classList.add("active");
    },

    loadCharacterContent: function() {
        Engine.hideAllContent();
        Engine.Display.characterContent.style.visibility = "visible";
        Engine.displayCharacterInfo();
        Engine.currentPage = Engine.Page.CharacterInfo;
        document.getElementById("stats-menu-link").classList.add("active");
    },

    loadScriptEditorContent: function(filename = "", code = "") {
        Engine.hideAllContent();
        Engine.Display.scriptEditorContent.style.visibility = "visible";
        var editor = ace.edit('javascript-editor');
        if (filename != "") {
            document.getElementById("script-editor-filename").value = filename;
            editor.setValue(code);
        }
        editor.focus();
        updateScriptEditorContent();
        Engine.currentPage = Engine.Page.ScriptEditor;
        document.getElementById("create-script-menu-link").classList.add("active");
    },

    loadActiveScriptsContent: function() {
        Engine.hideAllContent();
        Engine.Display.activeScriptsContent.style.visibility = "visible";
        setActiveScriptsClickHandlers();
        updateActiveScriptsItems();
        Engine.currentPage = Engine.Page.ActiveScripts;
        document.getElementById("active-scripts-menu-link").classList.add("active");
    },

    loadHacknetNodesContent: function() {
        Engine.hideAllContent();
        Engine.Display.hacknetNodesContent.style.visibility = "visible";
        displayHacknetNodesContent();
        Engine.currentPage = Engine.Page.HacknetNodes;
        document.getElementById("hacknet-nodes-menu-link").classList.add("active");
    },

    loadWorldContent: function() {
        Engine.hideAllContent();
        Engine.Display.worldContent.style.visibility = "visible";
        Engine.displayWorldInfo();
        Engine.currentPage = Engine.Page.World;
        document.getElementById("city-menu-link").classList.add("active");
    },

    loadCreateProgramContent: function() {
        Engine.hideAllContent();
        Engine.Display.createProgramContent.style.visibility = "visible";
        displayCreateProgramContent();
        Engine.currentPage = Engine.Page.CreateProgram;
        document.getElementById("create-program-menu-link").classList.add("active");
    },

    loadFactionsContent: function() {
        Engine.hideAllContent();
        Engine.Display.factionsContent.style.visibility = "visible";
        Engine.displayFactionsInfo();
        Engine.currentPage = Engine.Page.Factions;
        document.getElementById("factions-menu-link").classList.add("active");
    },

    loadFactionContent: function() {
        Engine.hideAllContent();
        Engine.Display.factionContent.style.visibility = "visible";
        Engine.currentPage = Engine.Page.Faction;
    },

    loadAugmentationsContent: function() {
        Engine.hideAllContent();
        Engine.Display.augmentationsContent.style.visibility = "visible";
        Engine.displayAugmentationsContent();
        Engine.currentPage = Engine.Page.Augmentations;
        document.getElementById("augmentations-menu-link").classList.add("active");
    },

    loadTutorialContent: function() {
        Engine.hideAllContent();
        Engine.Display.tutorialContent.style.visibility = "visible";
        Engine.displayTutorialContent();
        Engine.currentPage = Engine.Page.Tutorial;
        document.getElementById("tutorial-menu-link").classList.add("active");
    },

    loadLocationContent: function() {
        Engine.hideAllContent();
        Engine.Display.locationContent.style.visibility = "visible";
        displayLocationContent();
        Engine.currentPage = Engine.Page.Location;
    },

    loadTravelContent: function() {
        switch(Player.city) {
            case Locations.Aevum:
                Player.location = Locations.AevumTravelAgency;
                break;
            case Locations.Chongqing:
                Player.location = Locations.ChongqingTravelAgency;
                break;
            case Locations.Sector12:
                Player.location = Locations.Sector12TravelAgency;
                break;
            case Locations.NewTokyo:
                Player.location = Locations.NewTokyoTravelAgency;
                break;
            case Locations.Ishima:
                Player.location = Locations.IshimaTravelAgency;
                break;
            case Locations.Volhaven:
                Player.location = Locations.VolhavenTravelAgency;
                break;
            default:
                dialogBoxCreate("ERROR: Invalid city. This is a bug please contact game dev");
                break;
        }
        Engine.loadLocationContent();
    },

    loadJobContent: function() {
        if (Player.companyName == "") {
            dialogBoxCreate("You do not currently have a job! You can visit various companies " +
                            "in the city and try to find a job.");
            return;
        }
        Player.location = Player.companyName;
        Engine.loadLocationContent();
    },

    loadWorkInProgressContent: function() {
        Engine.hideAllContent();
        var mainMenu = document.getElementById("mainmenu-container");
        mainMenu.style.visibility = "hidden";
        Engine.Display.workInProgressContent.style.visibility = "visible";
        Engine.currentPage = Engine.Page.WorkInProgress;
    },

    loadRedPillContent: function() {
        Engine.hideAllContent();
        var mainMenu = document.getElementById("mainmenu-container");
        mainMenu.style.visibility = "hidden";
        Engine.Display.redPillContent.style.visibility = "visible";
        Engine.currentPage = Engine.Page.RedPill;
    },

    loadInfiltrationContent: function() {
        Engine.hideAllContent();
        Engine.Display.infiltrationContent.style.visibility = "visible";
        Engine.currentPage = Engine.Page.Infiltration;
    },

    loadStockMarketContent: function() {
        Engine.hideAllContent();
        Engine.Display.stockMarketContent.style.visibility = "visible";
        displayStockMarketContent();
        Engine.currentPage = Engine.Page.StockMarket;
    },

    loadGangContent: function() {
        Engine.hideAllContent();
        if (document.getElementById("gang-container") || Player.inGang()) {
            displayGangContent();
            Engine.currentPage = Engine.Page.Gang;
        } else {
            Engine.loadTerminalContent();
            Engine.currentPage = Engine.Page.Terminal;
        }
    },

    loadMissionContent: function() {
        Engine.hideAllContent();
        document.getElementById("mainmenu-container").style.visibility = "hidden";
        document.getElementById("character-overview-wrapper").style.visibility = "hidden";
        Engine.Display.missionContent.style.visibility = "visible";
        Engine.currentPage = Engine.Page.Mission;
    },

    //Helper function that hides all content
    hideAllContent: function() {
        Engine.Display.terminalContent.style.visibility = "hidden";
        Engine.Display.characterContent.style.visibility = "hidden";
        Engine.Display.scriptEditorContent.style.visibility = "hidden";
        Engine.Display.activeScriptsContent.style.visibility = "hidden";
        Engine.Display.hacknetNodesContent.style.visibility = "hidden";
        Engine.Display.worldContent.style.visibility = "hidden";
        Engine.Display.createProgramContent.style.visibility = "hidden";
        Engine.Display.factionsContent.style.visibility = "hidden";
        Engine.Display.factionContent.style.visibility = "hidden";
        Engine.Display.factionAugmentationsContent.style.visibility = "hidden";
        Engine.Display.augmentationsContent.style.visibility = "hidden";
        Engine.Display.tutorialContent.style.visibility = "hidden";
        Engine.Display.locationContent.style.visibility = "hidden";
        Engine.Display.workInProgressContent.style.visibility = "hidden";
        Engine.Display.redPillContent.style.visibility = "hidden";
        Engine.Display.infiltrationContent.style.visibility = "hidden";
        Engine.Display.stockMarketContent.style.visibility = "hidden";
        Engine.Display.missionContent.style.visibility = "hidden";
        if (document.getElementById("gang-container")) {
            document.getElementById("gang-container").style.visibility = "hidden";
        }

        //Location lists
        Engine.aevumLocationsList.style.display = "none";
        Engine.chongqingLocationsList.style.display = "none";
        Engine.sector12LocationsList.style.display = "none";
        Engine.newTokyoLocationsList.style.display = "none";
        Engine.ishimaLocationsList.style.display = "none";
        Engine.volhavenLocationsList.style.display = "none";

        //Make nav menu tabs inactive
        document.getElementById("terminal-menu-link").classList.remove("active");
        document.getElementById("create-script-menu-link").classList.remove("active");
        document.getElementById("active-scripts-menu-link").classList.remove("active");
        document.getElementById("create-program-menu-link").classList.remove("active");
        document.getElementById("stats-menu-link").classList.remove("active");
        document.getElementById("factions-menu-link").classList.remove("active");
        document.getElementById("augmentations-menu-link").classList.remove("active");
        document.getElementById("hacknet-nodes-menu-link").classList.remove("active");
        document.getElementById("city-menu-link").classList.remove("active");
        document.getElementById("tutorial-menu-link").classList.remove("active");
        document.getElementById("options-menu-link").classList.remove("active");
    },

    displayCharacterOverviewInfo: function() {
        if (Player.hp == null) {Player.hp = Player.max_hp;}
        if (Player.intelligence >= 1) {
            document.getElementById("character-overview-text").innerHTML =
            ("Hp:    " + Player.hp + " / " + Player.max_hp + "<br>" +
             "Money: " + numeral(Player.money.toNumber()).format('($0.000a)') + "<br>" +
             "Hack:  " + (Player.hacking_skill).toLocaleString() + "<br>" +
             "Str:   " + (Player.strength).toLocaleString() + "<br>" +
             "Def:   " + (Player.defense).toLocaleString() + "<br>" +
             "Dex:   " + (Player.dexterity).toLocaleString() + "<br>" +
             "Agi:   " + (Player.agility).toLocaleString() + "<br>" +
             "Cha:   " + (Player.charisma).toLocaleString() + "<br>" +
             "Int:   " + (Player.intelligence).toLocaleString()
            ).replace( / /g, "&nbsp;" );
        } else {
            document.getElementById("character-overview-text").innerHTML =
            ("Hp:    " + Player.hp + " / " + Player.max_hp + "<br>" +
             "Money: " + numeral(Player.money.toNumber()).format('($0.000a)') + "<br>" +
             "Hack:  " + (Player.hacking_skill).toLocaleString() + "<br>" +
             "Str:   " + (Player.strength).toLocaleString() + "<br>" +
             "Def:   " + (Player.defense).toLocaleString() + "<br>" +
             "Dex:   " + (Player.dexterity).toLocaleString() + "<br>" +
             "Agi:   " + (Player.agility).toLocaleString() + "<br>" +
             "Cha:   " + (Player.charisma).toLocaleString()
            ).replace( / /g, "&nbsp;" );
        }
    },

    /* Display character info */
    displayCharacterInfo: function() {
        var companyPosition = "";
        if (Player.companyPosition != "") {
            companyPosition = Player.companyPosition.positionName;
        }

        var bnText = "";
        if (Player.sourceFiles.length !== 0) {
            bnText = "<br>Current BitNode: " + Player.bitNodeN;
        }

        var intText = "";
        if (Player.intelligence > 0) {
            intText = 'Intelligence:  ' + (Player.intelligence).toLocaleString() + "<br><br><br>";
        }
        Engine.Display.characterInfo.innerHTML =
       ('<b>General</b><br><br>' +
        'Current City: ' + Player.city + '<br><br>' +
        'Employer: ' + Player.companyName + '<br>' +
        'Job Title: ' + companyPosition + '<br><br>' +
        'Money: $' + formatNumber(Player.money.toNumber(), 2)+ '<br><br><br>' +
        '<b>Stats</b><br><br>' +
        'Hacking Level: ' + (Player.hacking_skill).toLocaleString() +
                        " (" + numeral(Player.hacking_exp).format('(0.000a)') + ' experience)<br>' +
        'Strength:      ' + (Player.strength).toLocaleString() +
                   " (" + numeral(Player.strength_exp).format('(0.000a)') + ' experience)<br>' +
        'Defense:       ' + (Player.defense).toLocaleString() +
                  " (" + numeral(Player.defense_exp).format('(0.000a)')+ ' experience)<br>' +
        'Dexterity:     ' + (Player.dexterity).toLocaleString() +
                   " (" + numeral(Player.dexterity_exp).format('(0.000a)') + ' experience)<br>' +
        'Agility:       ' + (Player.agility).toLocaleString() +
                  " (" + numeral(Player.agility_exp).format('(0.000a)') + ' experience)<br>' +
        'Charisma:      ' + (Player.charisma).toLocaleString() +
                   " (" + numeral(Player.charisma_exp).format('(0.000a)') + ' experience)<br>' +
        intText +
        '<b>Multipliers</b><br><br>' +
        'Hacking Chance multiplier: ' + formatNumber(Player.hacking_chance_mult * 100, 2) + '%<br>' +
        'Hacking Speed multiplier:  ' + formatNumber(Player.hacking_speed_mult * 100, 2) + '%<br>' +
        'Hacking Money multiplier:  ' + formatNumber(Player.hacking_money_mult * 100, 2) + '%<br>' +
        'Hacking Growth multiplier: ' + formatNumber(Player.hacking_grow_mult * 100, 2) + '%<br><br>' +
        'Hacking Level multiplier:      ' + formatNumber(Player.hacking_mult * 100, 2) + '%<br>' +
        'Hacking Experience multiplier: ' + formatNumber(Player.hacking_exp_mult * 100, 2) + '%<br><br>' +
        'Strength Level multiplier:      ' + formatNumber(Player.strength_mult * 100, 2) + '%<br>' +
        'Strength Experience multiplier: ' + formatNumber(Player.strength_exp_mult * 100, 2) + '%<br><br>' +
        'Defense Level multiplier:      ' + formatNumber(Player.defense_mult * 100, 2) + '%<br>' +
        'Defense Experience multiplier: ' + formatNumber(Player.defense_exp_mult * 100, 2) + '%<br><br>' +
        'Dexterity Level multiplier:      ' + formatNumber(Player.dexterity_mult * 100, 2) + '%<br>' +
        'Dexterity Experience multiplier: ' + formatNumber(Player.dexterity_exp_mult * 100, 2) + '%<br><br>' +
        'Agility Level multiplier:      ' + formatNumber(Player.agility_mult * 100, 2) + '%<br>' +
        'Agility Experience multiplier: ' + formatNumber(Player.agility_exp_mult * 100, 2) + '%<br><br>' +
        'Charisma Level multiplier:      ' + formatNumber(Player.charisma_mult * 100, 2) + '%<br>' +
        'Charisma Experience multiplier: ' + formatNumber(Player.charisma_exp_mult * 100, 2) + '%<br><br>' +
        'Hacknet Node production multiplier:         ' + formatNumber(Player.hacknet_node_money_mult * 100, 2) + '%<br>' +
        'Hacknet Node purchase cost multiplier:      ' + formatNumber(Player.hacknet_node_purchase_cost_mult * 100, 2) + '%<br>' +
        'Hacknet Node RAM upgrade cost multiplier:   ' + formatNumber(Player.hacknet_node_ram_cost_mult * 100, 2) + '%<br>' +
        'Hacknet Node Core purchase cost multiplier: ' + formatNumber(Player.hacknet_node_core_cost_mult * 100, 2) + '%<br>' +
        'Hacknet Node level upgrade cost multiplier: ' + formatNumber(Player.hacknet_node_level_cost_mult * 100, 2) + '%<br><br>' +
        'Company reputation gain multiplier: ' + formatNumber(Player.company_rep_mult * 100, 2) + '%<br>' +
        'Faction reputation gain multiplier: ' + formatNumber(Player.faction_rep_mult * 100, 2) + '%<br>' +
        'Salary multiplier: ' + formatNumber(Player.work_money_mult * 100, 2) + '%<br>' +
        'Crime success multiplier: ' + formatNumber(Player.crime_success_mult * 100, 2) + '%<br>' +
        'Crime money multiplier: ' + formatNumber(Player.crime_money_mult * 100, 2) + '%<br><br><br>' +
        '<b>Misc</b><br><br>' +
        'Servers owned:       ' + Player.purchasedServers.length + '<br>' +
        'Hacknet Nodes owned: ' + Player.hacknetNodes.length + '<br>' +
        'Augmentations installed: ' + Player.augmentations.length + '<br>' +
        'Time played since last Augmentation: ' + convertTimeMsToTimeElapsedString(Player.playtimeSinceLastAug) + '<br>' +
        'Time played: ' + convertTimeMsToTimeElapsedString(Player.totalPlaytime) +
        bnText + '<br><br><br>').replace( / /g, "&nbsp;" );
    },

    /* Display locations in the world*/
    aevumLocationsList:        null,
    chongqingLocationsList:    null,
    sector12LocationsList:     null,
    newTokyoLocationsList:     null,
    ishimaLocationsList:       null,
    volhavenLocationsList:     null,

    displayWorldInfo: function() {
        Engine.aevumLocationsList.style.display = "none";
        Engine.chongqingLocationsList.style.display = "none";
        Engine.sector12LocationsList.style.display = "none";
        Engine.newTokyoLocationsList.style.display = "none";
        Engine.ishimaLocationsList.style.display = "none";
        Engine.volhavenLocationsList.style.display = "none";

        document.getElementById("world-city-name").innerHTML = Player.city;
        var cityDesc = document.getElementById("world-city-desc"); //TODO
        switch(Player.city) {
            case Locations.Aevum:
                Engine.aevumLocationsList.style.display = "inline";
                break;
            case Locations.Chongqing:
                Engine.chongqingLocationsList.style.display = "inline";
                break;
            case Locations.Sector12:
                Engine.sector12LocationsList.style.display = "inline";
                break;
            case Locations.NewTokyo:
                Engine.newTokyoLocationsList.style.display = "inline";
                break;
            case Locations.Ishima:
                Engine.ishimaLocationsList.style.display = "inline";
                break;
            case Locations.Volhaven:
                Engine.volhavenLocationsList.style.display = "inline";
                break;
            default:
                console.log("Invalid city value in Player object!");
                break;
        }

        document.getElementById("generic-locations-list").style.display = "inline";
    },

    displayFactionsInfo: function() {
        //Clear the list of joined factions
        var factionsList = document.getElementById("factions-list");
        while (factionsList.firstChild) {
            factionsList.removeChild(factionsList.firstChild);
        }

        //Re-add a link for each faction you are a member of
        for (var i = 0; i < Player.factions.length; ++i) {
            (function () {
                var factionName = Player.factions[i];

                //Add the faction to the Factions page content
                var item = document.createElement("li");
                var aElem = document.createElement("a");
                aElem.setAttribute("class", "a-link-button");
                aElem.innerHTML = factionName;
                aElem.addEventListener("click", function() {
                    Engine.loadFactionContent();
                    displayFactionContent(factionName);
                    return false;
                });
                item.appendChild(aElem);
                factionsList.appendChild(item);
            }()); //Immediate invocation
        }

        //Clear the list of invitations
        var invitationsList = document.getElementById("outstanding-faction-invitations-list");
        while (invitationsList.firstChild) {
            invitationsList.removeChild(invitationsList.firstChild);
        }

        //Add a link to accept for each faction you have invitiations for
        for (var i = 0; i < Player.factionInvitations.length; ++i) {
            (function () {
                var factionName = Player.factionInvitations[i];

                var item = document.createElement("li");

                var pElem = document.createElement("p");
                pElem.innerText = factionName;
                pElem.style.display = "inline";
                pElem.style.margin = "4px";
                pElem.style.padding = "4px";

                var aElem = document.createElement("a");
                aElem.innerText = "Accept Faction Invitation";
                aElem.setAttribute("class", "a-link-button");
                aElem.style.display = "inline";
                aElem.style.margin = "4px";
                aElem.style.padding = "4px";
                aElem.addEventListener("click", function() {
                    joinFaction(Factions[factionName]);
                    for (var i = 0; i < Player.factionInvitations.length; ++i) {
                        if (Player.factionInvitations[i] == factionName) {
                            Player.factionInvitations.splice(i, 1);
                            break;
                        }
                    }
                    Engine.displayFactionsInfo();
                    return false;
                });

                item.appendChild(pElem);
                item.appendChild(aElem);
                item.style.margin = "6px";
                item.style.padding = "6px";
                invitationsList.appendChild(item);
            }());
        }
    },

    displayAugmentationsContent: function() {
        //Purchased/queued augmentations
        var queuedAugmentationsList = document.getElementById("queued-augmentations-list");

        while (queuedAugmentationsList.firstChild) {
            queuedAugmentationsList.removeChild(queuedAugmentationsList.firstChild);
        }

        for (var i = 0; i < Player.queuedAugmentations.length; ++i) {
            var augName = Player.queuedAugmentations[i].name;
            var aug = Augmentations[augName];

            var item = document.createElement("li");
            var hElem = document.createElement("h2");
            var pElem = document.createElement("p");

            item.setAttribute("class", "installed-augmentation");
            hElem.innerHTML = augName;
            if (augName == AugmentationNames.NeuroFluxGovernor) {
                hElem.innerHTML += " - Level " + (Player.queuedAugmentations[i].level);
            }
            pElem.innerHTML = aug.info;

            item.appendChild(hElem);
            item.appendChild(pElem);

            queuedAugmentationsList.appendChild(item);
        }

        //Install Augmentations button
        var installButton = clearEventListeners("install-augmentations-button");
        installButton.addEventListener("click", function() {
            installAugmentations();
            return false;
        });

        //Installed augmentations
        var augmentationsList = document.getElementById("augmentations-list");

        while (augmentationsList.firstChild) {
            augmentationsList.removeChild(augmentationsList.firstChild);
        }

        //Source Files - Temporary...Will probably put in a separate pane Later
        for (var i = 0; i < Player.sourceFiles.length; ++i) {
            var srcFileKey = "SourceFile" + Player.sourceFiles[i].n;
            var sourceFileObject = SourceFiles[srcFileKey];
            if (sourceFileObject == null) {
                console.log("ERROR: Invalid source file number: " + Player.sourceFiles[i].n);
                continue;
            }
            var item = document.createElement("li");
            var hElem = document.createElement("h2");
            var pElem = document.createElement("p");

            item.setAttribute("class", "installed-augmentation");
            hElem.innerHTML = sourceFileObject.name + "<br>";
            hElem.innerHTML += "Level " + (Player.sourceFiles[i].lvl) + " / 3";
            pElem.innerHTML = sourceFileObject.info;

            item.appendChild(hElem);
            item.appendChild(pElem);

            augmentationsList.appendChild(item);
        }

        for (var i = 0; i < Player.augmentations.length; ++i) {
            var augName = Player.augmentations[i].name;
            var aug = Augmentations[augName];

            var item = document.createElement("li");
            var hElem = document.createElement("h2");
            var pElem = document.createElement("p");

            item.setAttribute("class", "installed-augmentation");
            hElem.innerHTML = augName;
            if (augName == AugmentationNames.NeuroFluxGovernor) {
                hElem.innerHTML += " - Level " + (Player.augmentations[i].level);
            }
            pElem.innerHTML = aug.info;

            item.appendChild(hElem);
            item.appendChild(pElem);

            augmentationsList.appendChild(item);
        }
    },

    displayTutorialContent: function() {
        document.getElementById("tutorial-getting-started-link").style.display = "block";
        Engine.Clickables.tutorialNetworkingButton.style.display = "block";
        Engine.Clickables.tutorialHackingButton.style.display = "block";
        Engine.Clickables.tutorialScriptsButton.style.display = "block";
        Engine.Clickables.tutorialNetscriptButton.style.display = "block";
        Engine.Clickables.tutorialTravelingButton.style.display = "block";
        Engine.Clickables.tutorialCompaniesButton.style.display = "block";
        Engine.Clickables.tutorialFactionsButton.style.display = "block";
        Engine.Clickables.tutorialAugmentationsButton.style.display = "block";
        document.getElementById("tutorial-shortcuts-link").style.display = "block";

        Engine.Clickables.tutorialBackButton.style.display = "none";
        document.getElementById("tutorial-text").style.display = "none";
    },

    //Displays the text when a section of the Tutorial is opened
    displayTutorialPage: function(text) {
        document.getElementById("tutorial-getting-started-link").style.display = "none";
        Engine.Clickables.tutorialNetworkingButton.style.display = "none";
        Engine.Clickables.tutorialHackingButton.style.display = "none";
        Engine.Clickables.tutorialScriptsButton.style.display = "none";
        Engine.Clickables.tutorialNetscriptButton.style.display = "none";
        Engine.Clickables.tutorialTravelingButton.style.display = "none";
        Engine.Clickables.tutorialCompaniesButton.style.display = "none";
        Engine.Clickables.tutorialFactionsButton.style.display = "none";
        Engine.Clickables.tutorialAugmentationsButton.style.display = "none";
        document.getElementById("tutorial-shortcuts-link").style.display = "none";

        Engine.Clickables.tutorialBackButton.style.display = "inline-block";
        document.getElementById("tutorial-text").style.display = "block";
        document.getElementById("tutorial-text").innerHTML = text;
    },

    /* Main Event Loop */
    idleTimer: function() {
        //Get time difference
        var _thisUpdate = new Date().getTime();
        var diff = _thisUpdate - Engine._lastUpdate;
        var offset = diff % Engine._idleSpeed;

        //Divide this by cycle time to determine how many cycles have elapsed since last update
        diff = Math.floor(diff / Engine._idleSpeed);

        if (diff > 0) {
            //Update the game engine by the calculated number of cycles
            Engine._lastUpdate = _thisUpdate - offset;
            Player.lastUpdate = _thisUpdate - offset;
            Engine.updateGame(diff);
        }

        window.requestAnimationFrame(Engine.idleTimer);
    },

    updateGame: function(numCycles = 1) {
        //Update total playtime
        var time = numCycles * Engine._idleSpeed;
        if (Player.totalPlaytime == null) {Player.totalPlaytime = 0;}
        if (Player.playtimeSinceLastAug == null) {Player.playtimeSinceLastAug = 0;}
        Player.totalPlaytime += time;
        Player.playtimeSinceLastAug += time;

        //Start Manual hack
        if (Player.startAction == true) {
            Engine._totalActionTime = Player.actionTime;
            Engine._actionTimeLeft = Player.actionTime;
            Engine._actionInProgress = true;
            Engine._actionProgressBarCount = 1;
            Engine._actionProgressStr = "[                                                  ]";
            Engine._actionTimeStr = "Time left: ";
            Player.startAction = false;
        }

        //Working
        if (Player.isWorking) {
            if (Player.workType == CONSTANTS.WorkTypeFaction) {
                Player.workForFaction(numCycles);
            } else if (Player.workType == CONSTANTS.WorkTypeCreateProgram) {
                Player.createProgramWork(numCycles);
            } else if (Player.workType == CONSTANTS.WorkTypeStudyClass) {
                Player.takeClass(numCycles);
            } else if (Player.workType == CONSTANTS.WorkTypeCrime) {
                Player.commitCrime(numCycles);
            } else if (Player.workType == CONSTANTS.WorkTypeCompanyPartTime) {
                Player.workPartTime(numCycles);
            } else {
                Player.work(numCycles);
            }
        }

        //Gang, if applicable
        if (Player.bitNodeN == 2 && Player.inGang()) {
            Player.gang.process(numCycles);
        }

        //Mission
        if (inMission && currMission) {
            currMission.process(numCycles);
        }

        //Counters
        Engine.decrementAllCounters(numCycles);
        Engine.checkCounters();

        //Manual hacks
        if (Engine._actionInProgress == true) {
            Engine.updateHackProgress(numCycles);
        }

        //Update the running time of all active scripts
        updateOnlineScriptTimes(numCycles);

        //Hacknet Nodes
        processAllHacknetNodeEarnings(numCycles);
    },

    //Counters for the main event loop. Represent the number of game cycles are required
    //for something to happen.
    Counters: {
        autoSaveCounter:    300,            //Autosave every minute
        updateSkillLevelsCounter: 10,       //Only update skill levels every 2 seconds. Might improve performance
        updateDisplays: 3,                  //Update displays such as Active Scripts display and character display
        updateDisplaysMed: 9,
        updateDisplaysLong: 15,
        createProgramNotifications: 10,     //Checks whether any programs can be created and notifies
        checkFactionInvitations: 100,       //Check whether you qualify for any faction invitations
        passiveFactionGrowth: 600,
        messages: 150,
        stockTick:  30,                     //Update stock prices
        sCr: 1500,
        updateScriptEditorDisplay: 5,
    },

    decrementAllCounters: function(numCycles = 1) {
        for (var counter in Engine.Counters) {
            if (Engine.Counters.hasOwnProperty(counter)) {
                Engine.Counters[counter] = Engine.Counters[counter] - numCycles;
            }
        }
    },

    //Checks if any counters are 0 and if they are, executes whatever
    //is necessary and then resets the counter
    checkCounters: function() {
        if (Engine.Counters.autoSaveCounter <= 0) {
            saveObject.saveGame();
            Engine.Counters.autoSaveCounter = 300;
        }

        if (Engine.Counters.updateSkillLevelsCounter <= 0) {
            Player.updateSkillLevels();
            Engine.Counters.updateSkillLevelsCounter = 10;
        }

        if (Engine.Counters.updateDisplays <= 0) {
            Engine.displayCharacterOverviewInfo();
            if (Engine.currentPage == Engine.Page.CharacterInfo) {
                Engine.displayCharacterInfo();
            }  else if (Engine.currentPage == Engine.Page.HacknetNodes) {
                updateHacknetNodesContent();
            } else if (Engine.currentPage == Engine.Page.CreateProgram) {
                displayCreateProgramContent();
            }

            if (logBoxOpened) {
                logBoxUpdateText();
            }

            Engine.Counters.updateDisplays = 3;
        }

        if (Engine.Counters.updateDisplaysMed <= 0) {
            if (Engine.currentPage == Engine.Page.ActiveScripts) {
                updateActiveScriptsItems();
            }
            Engine.Counters.updateDisplaysMed = 9;
        }

        if (Engine.Counters.updateDisplaysLong <= 0) {
            if (Engine.currentPage === Engine.Page.Gang) {
                updateGangContent();
            }
            Engine.Counters.updateDisplaysLong = 15;
        }

        if (Engine.Counters.createProgramNotifications <= 0) {
            var num = getNumAvailableCreateProgram();
            var elem = document.getElementById("create-program-notification");
            if (num > 0) {
                elem.innerHTML = num;
                elem.setAttribute("class", "notification-on");
            } else {
                elem.innerHTML = "";
                elem.setAttribute("class", "notification-off");
            }
            Engine.Counters.createProgramNotifications = 10;
        }

        if (Engine.Counters.checkFactionInvitations <= 0) {
            var invitedFactions = Player.checkForFactionInvitations();
            if (invitedFactions.length > 0) {
                if (Player.firstFacInvRecvd === false) {
                    Player.firstFacInvRecvd = true;
                    document.getElementById("factions-tab").style.display = "list-item";
                    document.getElementById("character-menu-header").click();
                    document.getElementById("character-menu-header").click();
                }

                var randFaction = invitedFactions[Math.floor(Math.random() * invitedFactions.length)];
                inviteToFaction(randFaction);
            }
            Engine.Counters.checkFactionInvitations = 100;
        }

        if (Engine.Counters.passiveFactionGrowth <= 0) {
            var adjustedCycles = Math.floor((600 - Engine.Counters.passiveFactionGrowth));
            processPassiveFactionRepGain(adjustedCycles);
            Engine.Counters.passiveFactionGrowth = 600;
        }

        if (Engine.Counters.messages <= 0) {
            checkForMessagesToSend();
            if (Augmentations[AugmentationNames.TheRedPill].owned) {
                Engine.Counters.messages = 4500; //15 minutes for Red pill message
            } else {
                Engine.Counters.messages = 150;
            }
        }

        if (Engine.Counters.stockTick <= 0) {
            if (Player.hasWseAccount) {
                updateStockPrices();
            }
            Engine.Counters.stockTick = 30;
        }

        if (Engine.Counters.sCr <= 0) {
            //Assume 4Sig will always indicate state of market
            if (Player.hasWseAccount) {
                stockMarketCycle();
            }
            Engine.Counters.sCr = 1500;
        }

        if (Engine.Counters.updateScriptEditorDisplay <= 0) {
            if (Engine.currentPage == Engine.Page.ScriptEditor) {
                updateScriptEditorContent();
            }
            Engine.Counters.updateScriptEditorDisplay = 5;
        }
    },

    /* Calculates the hack progress for a manual (non-scripted) hack and updates the progress bar/time accordingly */
    _totalActionTime: 0,
    _actionTimeLeft: 0,
    _actionTimeStr: "Time left: ",
    _actionProgressStr: "[                                                  ]",
    _actionProgressBarCount: 1,
    _actionInProgress: false,
    updateHackProgress: function(numCycles = 1) {
        var timeElapsedMilli = numCycles * Engine._idleSpeed;
        Engine._actionTimeLeft -= (timeElapsedMilli/ 1000);    //Substract idle speed (ms)
        Engine._actionTimeLeft = Math.max(Engine._actionTimeLeft, 0);

        //Calculate percent filled
        var percent = Math.round((1 - Engine._actionTimeLeft / Engine._totalActionTime) * 100);

        //Update progress bar
        while (Engine._actionProgressBarCount * 2 <= percent) {
            Engine._actionProgressStr = Engine._actionProgressStr.replaceAt(Engine._actionProgressBarCount, "|");
            Engine._actionProgressBarCount += 1;
        }

        //Update hack time remaining
        Engine._actionTimeStr = "Time left: " + Math.max(0, Math.round(Engine._actionTimeLeft)).toString() + "s";
        document.getElementById("hack-progress").innerHTML = Engine._actionTimeStr;

        //Dynamically update progress bar
        document.getElementById("hack-progress-bar").innerHTML = Engine._actionProgressStr.replace( / /g, "&nbsp;" );

        //Once percent is 100, the hack is completed
        if (percent >= 100) {
            Engine._actionInProgress = false;
            Terminal.finishAction();
        }
    },

    _prevTimeout: null,
    createStatusText: function(txt) {
        if (Engine._prevTimeout != null) {
            clearTimeout(Engine._prevTimeout);
            Engine._prevTimeout = null;
        }
        var statusText = document.getElementById("status-text")
        statusText.style.display = "inline-block";
        statusText.setAttribute("class", "status-text");
        statusText.innerHTML = txt;
        Engine._prevTimeout = setTimeout(function() {
            statusText.style.display = "none";
            statusText.removeAttribute("class");
            statusText.innerHTML = "";
        }, 3000);
    },

    removeLoadingScreen: function() {
        var loader = document.getElementById("loader");
        if (!loader) {return;}
        while(loader.firstChild) {
            loader.removeChild(loader.firstChild);
        }
        loader.parentNode.removeChild(loader);
        document.getElementById("entire-game-container").style.visibility = "visible";
    },

    //Used when initializing a game
    //elems should be an array of all DOM elements under the header
    closeMainMenuHeader: function(elems) {
        for (var i = 0; i < elems.length; ++i) {
            elems[i].style.maxHeight            = null;
            elems[i].style.opacity              = 0;
            elems[i].style.pointerEvents        = "none";
        }
    },

    //Used when initializing the game
    //elems should be an array of all DOM elements under the header
    openMainMenuHeader: function(elems) {
        for (var i = 0; i < elems.length; ++i) {
            elems[i].style.maxHeight = elems[i].scrollHeight + "px";
            elems[i].style.display = "block";
        }
    },

    //Used in game when clicking on a main menu header (NOT FOR INITIALIZATION)
    //open is a boolean specifying whether its being opened or closed
    //elems is an array of DOM elements for main menu tabs (li)
    //links is an array of DOM elements for main menu links (a)
    toggleMainMenuHeader: function(open, elems, links) {
        for (var i = 0; i < elems.length; ++i) {
            if (open) {
                elems[i].style.opacity = 1;
                elems[i].style.maxHeight = elems[i].scrollHeight + "px";
            } else {
                elems[i].style.opacity = 0;
                elems[i].style.maxHeight = null;
            }
        }

        for (var i = 0; i < links.length; ++i) {
            if (open) {
                links[i].style.opacity = 1;
                links[i].style.maxHeight = links[i].scrollHeight + "px";
                links[i].style.pointerEvents = "auto";
            } else {
                links[i].style.opacity = 0;
                links[i].style.maxHeight = null;
                links[i].style.pointerEvents = "none";
            }
        }
    },

    load: function() {
        //Initialize main menu accordion panels to all start as "open"
        var terminal            = document.getElementById("terminal-tab");
        var createScript        = document.getElementById("create-script-tab");
        var activeScripts       = document.getElementById("active-scripts-tab");
        var createProgram       = document.getElementById("create-program-tab");
        var stats               = document.getElementById("stats-tab");
        var factions            = document.getElementById("factions-tab");
        var augmentations       = document.getElementById("augmentations-tab");
        var hacknetnodes        = document.getElementById("hacknet-nodes-tab");
        var city                = document.getElementById("city-tab");
        var travel              = document.getElementById("travel-tab");
        var job                 = document.getElementById("job-tab");
        var tutorial            = document.getElementById("tutorial-tab");
        var options             = document.getElementById("options-tab");

        //Load game from save or create new game
        if (loadGame(saveObject)) {
            console.log("Loaded game from save");
            initBitNodes();
            initBitNodeMultipliers();
            initSourceFiles();
            Engine.setDisplayElements();    //Sets variables for important DOM elements
            Engine.init();                  //Initialize buttons, work, etc.
            CompanyPositions.init();
            initAugmentations();            //Also calls Player.reapplyAllAugmentations()
            Player.reapplyAllSourceFiles();
            initStockSymbols();
            if (Player.hasWseAccount) {
                initSymbolToStockMap();
            }
            initLiterature();
            initSingularitySFFlags();

            console.log(Player.intelligence_exp);

            //Calculate the number of cycles have elapsed while offline
            Engine._lastUpdate = new Date().getTime();
            var lastUpdate = Player.lastUpdate;
            var numCyclesOffline = Math.floor((Engine._lastUpdate - lastUpdate) / Engine._idleSpeed);

            /* Process offline progress */
            var offlineProductionFromScripts = loadAllRunningScripts();    //This also takes care of offline production for those scripts
            if (Player.isWorking) {
                console.log("work() called in load() for " + numCyclesOffline * Engine._idleSpeed + " milliseconds");
                if (Player.workType == CONSTANTS.WorkTypeFaction) {
                    Player.workForFaction(numCyclesOffline);
                } else if (Player.workType == CONSTANTS.WorkTypeCreateProgram) {
                    Player.createProgramWork(numCyclesOffline);
                } else if (Player.workType == CONSTANTS.WorkTypeStudyClass) {
                    Player.takeClass(numCyclesOffline);
                } else if (Player.workType == CONSTANTS.WorkTypeCrime) {
                    Player.commitCrime(numCyclesOffline);
                } else if (Player.workType == CONSTANTS.WorkTypeCompanyPartTime) {
                    Player.workPartTime(numCyclesOffline);
                } else {
                    Player.work(numCyclesOffline);
                }
            }

            //Hacknet Nodes offline progress
            var offlineProductionFromHacknetNodes = processAllHacknetNodeEarnings(numCyclesOffline);

            //Passive faction rep gain offline
            processPassiveFactionRepGain(numCyclesOffline);

            //Gang progress for BitNode 2
            if (Player.bitNodeN != null && Player.bitNodeN === 2 && Player.inGang()) {
                Player.gang.process(numCyclesOffline);
            }

            //Update total playtime
            var time = numCyclesOffline * Engine._idleSpeed;
            if (Player.totalPlaytime == null) {Player.totalPlaytime = 0;}
            if (Player.playtimeSinceLastAug == null) {Player.playtimeSinceLastAug = 0;}
            Player.totalPlaytime += time;
            Player.playtimeSinceLastAug += time;

            Player.lastUpdate = Engine._lastUpdate;
            Engine.start();                 //Run main game loop and Scripts loop
            Engine.removeLoadingScreen();
            dialogBoxCreate("While you were offline, your scripts generated $" +
                            formatNumber(offlineProductionFromScripts, 2) + " and your Hacknet Nodes generated $" +
                            formatNumber(offlineProductionFromHacknetNodes, 2));
            //Close main menu accordions for loaded game
            var visibleMenuTabs = [terminal, createScript, activeScripts, stats,
                                   hacknetnodes, city, tutorial, options];
            if (Player.firstFacInvRecvd) {visibleMenuTabs.push(factions);}
            else {factions.style.display = "none";}
            if (Player.firstAugPurchased) {visibleMenuTabs.push(augmentations);}
            else {augmentations.style.display = "none";}
            if (Player.firstJobRecvd) {visibleMenuTabs.push(job);}
            else {job.style.display = "none";}
            if (Player.firstTimeTraveled) {visibleMenuTabs.push(travel);}
            else {travel.style.display = "none";}
            if (Player.firstProgramAvailable) {visibleMenuTabs.push(createProgram);}
            else {createProgram.style.display = "none";}

            Engine.closeMainMenuHeader(visibleMenuTabs);
        } else {
            //No save found, start new game
            console.log("Initializing new game");
            initBitNodes();
            initBitNodeMultipliers();
            initSourceFiles();
            initSpecialServerIps();
            Engine.setDisplayElements();        //Sets variables for important DOM elements
            Engine.start();                     //Run main game loop and Scripts loop
            Player.init();
            initForeignServers();
            initCompanies();
            initFactions();
            CompanyPositions.init();
            initAugmentations();
            initMessages();
            initStockSymbols();
            initLiterature();
            initSingularitySFFlags();

            //Open main menu accordions for new game
            //Main menu accordions
            var hackingHdr      = document.getElementById("hacking-menu-header");
            hackingHdr.classList.toggle("opened");
            var characterHdr    = document.getElementById("character-menu-header");
            characterHdr.classList.toggle("opened");
            var worldHdr        = document.getElementById("world-menu-header");
            worldHdr.classList.toggle("opened");
            var helpHdr         = document.getElementById("help-menu-header");
            helpHdr.classList.toggle("opened");

            //Hide tabs that wont be revealed until later
            factions.style.display = "none";
            augmentations.style.display = "none";
            job.style.display = "none";
            travel.style.display = "none";
            createProgram.style.display = "none";

            Engine.openMainMenuHeader(
                [terminal, createScript, activeScripts, stats,
                 hacknetnodes, city,
                 tutorial, options]
            );

            //Start interactive tutorial
            iTutorialStart();
            Engine.removeLoadingScreen();
        }
        //Initialize labels on game settings
        setSettingsLabels();
        Terminal.resetTerminalInput();
    },

    setDisplayElements: function() {
        //Content elements
        Engine.Display.terminalContent = document.getElementById("terminal-container");
        Engine.currentPage = Engine.Page.Terminal;

        Engine.Display.characterContent = document.getElementById("character-container");
        Engine.Display.characterContent.style.visibility = "hidden";

        Engine.Display.scriptEditorContent = document.getElementById("script-editor-container");
        Engine.Display.scriptEditorContent.style.visibility = "hidden";

        Engine.Display.activeScriptsContent = document.getElementById("active-scripts-container");
        Engine.Display.activeScriptsContent.style.visibility = "hidden";

        Engine.Display.hacknetNodesContent = document.getElementById("hacknet-nodes-container");
        Engine.Display.hacknetNodesContent.style.visibility = "hidden";

        Engine.Display.worldContent = document.getElementById("world-container");
        Engine.Display.worldContent.style.visibility = "hidden";

        Engine.Display.createProgramContent = document.getElementById("create-program-container");
        Engine.Display.createProgramContent.style.visibility = "hidden";

        Engine.Display.factionsContent = document.getElementById("factions-container");
        Engine.Display.factionsContent.style.visibility = "hidden";


        Engine.Display.factionContent = document.getElementById("faction-container");
        Engine.Display.factionContent.style.visibility = "hidden";

        Engine.Display.factionAugmentationsContent = document.getElementById("faction-augmentations-container");
        Engine.Display.factionAugmentationsContent.style.visibility = "hidden";

        Engine.Display.augmentationsContent = document.getElementById("augmentations-container");
        Engine.Display.augmentationsContent.style.visibility = "hidden";

        Engine.Display.tutorialContent = document.getElementById("tutorial-container");
        Engine.Display.tutorialContent.style.visibility = "hidden";

        Engine.Display.infiltrationContent = document.getElementById("infiltration-container");
        Engine.Display.infiltrationContent.style.visibility = "hidden";

        Engine.Display.stockMarketContent = document.getElementById("stock-market-container");
        Engine.Display.stockMarketContent.style.visibility = "hidden";

        Engine.Display.missionContent = document.getElementById("mission-container");
        Engine.Display.missionContent.style.visibility = "hidden";

        //Character info
        Engine.Display.characterInfo = document.getElementById("character-info");

        //Location lists
        Engine.aevumLocationsList = document.getElementById("aevum-locations-list");
        Engine.chongqingLocationsList = document.getElementById("chongqing-locations-list");
        Engine.sector12LocationsList = document.getElementById("sector12-locations-list");
        Engine.newTokyoLocationsList = document.getElementById("newtokyo-locations-list");
        Engine.ishimaLocationsList = document.getElementById("ishima-locations-list");
        Engine.volhavenLocationsList = document.getElementById("volhaven-locations-list");

        //Location page (page that shows up when you visit a specific location in World)
        Engine.Display.locationContent = document.getElementById("location-container");
        Engine.Display.locationContent.style.visibility = "hidden";

        //Work In Progress
        Engine.Display.workInProgressContent = document.getElementById("work-in-progress-container");
        Engine.Display.workInProgressContent.style.visibility = "hidden";

        //Red Pill / Hack World Daemon
        Engine.Display.redPillContent = document.getElementById("red-pill-container");
        Engine.Display.redPillContent.style.visibility = "hidden";

		//Init Location buttons
		initLocationButtons();

        //Tutorial buttons
        Engine.Clickables.tutorialNetworkingButton = document.getElementById("tutorial-networking-link");
        Engine.Clickables.tutorialNetworkingButton.addEventListener("click", function() {
            Engine.displayTutorialPage(CONSTANTS.TutorialNetworkingText);
        });

        Engine.Clickables.tutorialHackingButton = document.getElementById("tutorial-hacking-link");
        Engine.Clickables.tutorialHackingButton.addEventListener("click", function() {
            Engine.displayTutorialPage(CONSTANTS.TutorialHackingText);
        });

        Engine.Clickables.tutorialScriptsButton = document.getElementById("tutorial-scripts-link");
        Engine.Clickables.tutorialScriptsButton.addEventListener("click", function() {
            Engine.displayTutorialPage(CONSTANTS.TutorialScriptsText);
        });

        Engine.Clickables.tutorialNetscriptButton = document.getElementById("tutorial-netscript-link");
        Engine.Clickables.tutorialNetscriptButton.addEventListener("click", function() {
            if (Player.bitNodeN === 4 || hasSingularitySF) {
                Engine.displayTutorialPage(CONSTANTS.TutorialNetscriptText + CONSTANTS.TutorialSingularityFunctionsText);
            } else {
                Engine.displayTutorialPage(CONSTANTS.TutorialNetscriptText);
            }

        });

        Engine.Clickables.tutorialTravelingButton = document.getElementById("tutorial-traveling-link");
        Engine.Clickables.tutorialTravelingButton.addEventListener("click", function() {
            Engine.displayTutorialPage(CONSTANTS.TutorialTravelingText);
        });

        Engine.Clickables.tutorialCompaniesButton = document.getElementById("tutorial-jobs-link");
        Engine.Clickables.tutorialCompaniesButton.addEventListener("click", function() {
            Engine.displayTutorialPage(CONSTANTS.TutorialCompaniesText);
        });

        Engine.Clickables.tutorialFactionsButton = document.getElementById("tutorial-factions-link");
        Engine.Clickables.tutorialFactionsButton.addEventListener("click", function() {
            Engine.displayTutorialPage(CONSTANTS.TutorialFactionsText);
        });

        Engine.Clickables.tutorialAugmentationsButton = document.getElementById("tutorial-augmentations-link");
        Engine.Clickables.tutorialAugmentationsButton.addEventListener("click", function() {
            Engine.displayTutorialPage(CONSTANTS.TutorialAugmentationsText);
        });

        Engine.Clickables.tutorialBackButton = document.getElementById("tutorial-back-button");
        Engine.Clickables.tutorialBackButton.addEventListener("click", function() {
            Engine.displayTutorialContent();
        });

        //If DarkWeb already purchased, disable the button
        if (SpecialServerIps.hasOwnProperty("Darkweb Server")) {
            document.getElementById("location-purchase-tor").setAttribute("class", "a-link-button-inactive");
        }
    },

    /* Initialization */
    init: function() {
        //Import game link
        document.getElementById("import-game-link").onclick = function() {
            saveObject.importGame();
        };

        //Main menu accordions
        var hackingHdr      = document.getElementById("hacking-menu-header");
        var characterHdr    = document.getElementById("character-menu-header");
        var worldHdr        = document.getElementById("world-menu-header");
        var helpHdr         = document.getElementById("help-menu-header");

        hackingHdr.onclick = function() {
            var terminal            = document.getElementById("terminal-tab");
            var terminalLink        = document.getElementById("terminal-menu-link");
            var createScript        = document.getElementById("create-script-tab");
            var createScriptLink    = document.getElementById("create-script-menu-link");
            var activeScripts       = document.getElementById("active-scripts-tab");
            var activeScriptsLink   = document.getElementById("active-scripts-menu-link");
            var createProgram       = document.getElementById("create-program-tab");
            var createProgramLink   = document.getElementById("create-program-menu-link");
            var createProgramNot    = document.getElementById("create-program-notification");
            this.classList.toggle("opened");
            if (terminal.style.maxHeight) {
                Engine.toggleMainMenuHeader(false,
                    [terminal, createScript, activeScripts, createProgram],
                    [terminalLink, createScriptLink, activeScriptsLink, createProgramLink]
                );

                createProgramNot.style.display = "none";
            } else {
                Engine.toggleMainMenuHeader(true,
                    [terminal, createScript, activeScripts, createProgram],
                    [terminalLink, createScriptLink, activeScriptsLink, createProgramLink]
                );

                createProgramNot.style.display = "block"
            }
        }

        characterHdr.onclick = function() {
            var stats               = document.getElementById("stats-tab");
            var statsLink           = document.getElementById("stats-menu-link");
            var factions            = document.getElementById("factions-tab");
            var factionsLink        = document.getElementById("factions-menu-link");
            var augmentations       = document.getElementById("augmentations-tab");
            var augmentationsLink   = document.getElementById("augmentations-menu-link");
            var hacknetnodes        = document.getElementById("hacknet-nodes-tab");
            var hacknetnodesLink    = document.getElementById("hacknet-nodes-menu-link");
            this.classList.toggle("opened");
            if (stats.style.maxHeight) {
                Engine.toggleMainMenuHeader(false,
                    [stats, factions, augmentations, hacknetnodes],
                    [statsLink, factionsLink, augmentationsLink, hacknetnodesLink]
                );
            } else {
                Engine.toggleMainMenuHeader(true,
                    [stats, factions, augmentations, hacknetnodes],
                    [statsLink, factionsLink, augmentationsLink, hacknetnodesLink]
                );
            }
        }

        worldHdr.onclick = function() {
            var city            = document.getElementById("city-tab");
            var cityLink        = document.getElementById("city-menu-link");
            var travel          = document.getElementById("travel-tab");
            var travelLink      = document.getElementById("travel-menu-link");
            var job             = document.getElementById("job-tab");
            var jobLink         = document.getElementById("job-menu-link");
            this.classList.toggle("opened");
            if (city.style.maxHeight) {
                Engine.toggleMainMenuHeader(false,
                    [city, travel, job],
                    [cityLink, travelLink, jobLink]
                );
            } else {
                Engine.toggleMainMenuHeader(true,
                    [city, travel, job],
                    [cityLink, travelLink, jobLink]
                );
            }
        }

        helpHdr.onclick = function() {
            var tutorial        = document.getElementById("tutorial-tab");
            var tutorialLink    = document.getElementById("tutorial-menu-link");
            var options         = document.getElementById("options-tab");
            var optionsLink     = document.getElementById("options-menu-link");
            this.classList.toggle("opened");
            if (tutorial.style.maxHeight) {
                Engine.toggleMainMenuHeader(false,
                    [tutorial, options],
                    [tutorialLink, optionsLink]
                );
            } else {
                Engine.toggleMainMenuHeader(true,
                    [tutorial, options],
                    [tutorialLink, optionsLink]
                );
            }
        }

        //Main menu buttons and content
        Engine.Clickables.terminalMainMenuButton = clearEventListeners("terminal-menu-link");
        Engine.Clickables.terminalMainMenuButton.addEventListener("click", function() {
            Engine.loadTerminalContent();
            return false;
        });

        Engine.Clickables.characterMainMenuButton = clearEventListeners("stats-menu-link");
        Engine.Clickables.characterMainMenuButton.addEventListener("click", function() {
            Engine.loadCharacterContent();
            return false;
        });

        Engine.Clickables.scriptEditorMainMenuButton = clearEventListeners("create-script-menu-link");
        Engine.Clickables.scriptEditorMainMenuButton.addEventListener("click", function() {
            Engine.loadScriptEditorContent();
            return false;
        });

        Engine.Clickables.activeScriptsMainMenuButton = clearEventListeners("active-scripts-menu-link");
        Engine.Clickables.activeScriptsMainMenuButton.addEventListener("click", function() {
            Engine.loadActiveScriptsContent();
            return false;
        });

        Engine.Clickables.hacknetNodesMainMenuButton = clearEventListeners("hacknet-nodes-menu-link");
        Engine.Clickables.hacknetNodesMainMenuButton.addEventListener("click", function() {
            Engine.loadHacknetNodesContent();
            return false;
        });

        Engine.Clickables.worldMainMenuButton = clearEventListeners("city-menu-link");
        Engine.Clickables.worldMainMenuButton.addEventListener("click", function() {
            Engine.loadWorldContent();
            return false;
        });

        Engine.Clickables.travelMainMenuButton = clearEventListeners("travel-menu-link");
        Engine.Clickables.travelMainMenuButton.addEventListener("click", function() {
            Engine.loadTravelContent();
            return false;
        });

        Engine.Clickables.jobMainMenuButton = clearEventListeners("job-menu-link");
        Engine.Clickables.jobMainMenuButton.addEventListener("click", function() {
            Engine.loadJobContent();
            return false;
        });


        Engine.Clickables.createProgramMainMenuButton = clearEventListeners("create-program-menu-link");
        Engine.Clickables.createProgramMainMenuButton.addEventListener("click", function() {
            Engine.loadCreateProgramContent();
            return false;
        });

        Engine.Clickables.factionsMainMenuButton = clearEventListeners("factions-menu-link");
        Engine.Clickables.factionsMainMenuButton.addEventListener("click", function() {
            Engine.loadFactionsContent();
            return false;
        });

        Engine.Clickables.augmentationsMainMenuButton = clearEventListeners("augmentations-menu-link");
        Engine.Clickables.augmentationsMainMenuButton.addEventListener("click", function() {
            Engine.loadAugmentationsContent();
            return false;
        });

        Engine.Clickables.tutorialMainMenuButton = clearEventListeners("tutorial-menu-link");
        Engine.Clickables.tutorialMainMenuButton.addEventListener("click", function() {
            Engine.loadTutorialContent();
            return false;
        });

        //Active scripts list
        Engine.ActiveScriptsList = document.getElementById("active-scripts-list");

        //Save, Delete, Import/Export buttons
        Engine.Clickables.saveMainMenuButton = document.getElementById("save-game-link");
        Engine.Clickables.saveMainMenuButton.addEventListener("click", function() {
            saveObject.saveGame();
            return false;
        });

        Engine.Clickables.deleteMainMenuButton = document.getElementById("delete-game-link");
        Engine.Clickables.deleteMainMenuButton.addEventListener("click", function() {
            saveObject.deleteGame();
            return false;
        });

        document.getElementById("export-game-link").addEventListener("click", function() {
            saveObject.exportGame();
            return false;
        });

        //Character Overview buttons
        document.getElementById("character-overview-save-button").addEventListener("click", function() {
            saveObject.saveGame();
            return false;
        });

        document.getElementById("character-overview-options-button").addEventListener("click", function() {
            gameOptionsBoxOpen();
            return false;
        });

        //Create Program buttons
        initCreateProgramButtons();

        //Message at the top of terminal
        postNetburnerText();

        //Player was working cancel button
        if (Player.isWorking) {
            var cancelButton = document.getElementById("work-in-progress-cancel-button");
            cancelButton.addEventListener("click", function() {
                if (Player.workType == CONSTANTS.WorkTypeFaction) {
                    var fac = Factions[Player.currentWorkFactionName];
                    Player.finishFactionWork(true);
                } else if (Player.workType == CONSTANTS.WorkTypeCreateProgram) {
                    Player.finishCreateProgramWork(true);
                } else if (Player.workType == CONSTANTS.WorkTypeStudyClass) {
                    Player.finishClass();
                } else if (Player.workType == CONSTANTS.WorkTypeCrime) {
                    Player.finishCrime(true);
                } else if (Player.workType == CONSTANTS.WorkTypeCompanyPartTime) {
                    Player.finishWorkPartTime();
                } else {
                    Player.finishWork(true);
                }
            });
            Engine.loadWorkInProgressContent();
        }

        //character overview screen
        document.getElementById("character-overview-container").style.display = "block";

        //Remove classes from links (they might be set from tutorial)
        document.getElementById("terminal-menu-link").removeAttribute("class");
        document.getElementById("stats-menu-link").removeAttribute("class");
        document.getElementById("create-script-menu-link").removeAttribute("class");
        document.getElementById("active-scripts-menu-link").removeAttribute("class");
        document.getElementById("hacknet-nodes-menu-link").removeAttribute("class");
        document.getElementById("city-menu-link").removeAttribute("class");
        document.getElementById("tutorial-menu-link").removeAttribute("class");

        //DEBUG Delete active Scripts on home
        document.getElementById("debug-delete-scripts-link").addEventListener("click", function() {
            console.log("Deleting running scripts on home computer");
            Player.getHomeComputer().runningScripts = [];
            dialogBoxCreate("Forcefully deleted all running scripts on home computer. Please save and refresh page");
            gameOptionsBoxClose();
            return false;
        });

        //DEBUG Soft Reset
        document.getElementById("debug-soft-reset").addEventListener("click", function() {
            dialogBoxCreate("Soft Reset!");
            prestigeAugmentation();
            gameOptionsBoxClose();
            return false;
        });
    },

    start: function() {
        //Run main loop
        Engine.idleTimer();

        //Scripts
        runScriptsLoop();
    }
};

window.onload = function() {
    Engine.load();
};

export {Engine};
