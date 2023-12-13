/*
Copyright (c) 2023 The Gamepad Navigator Authors
See the AUTHORS.md file at the top-level directory of this distribution and at
https://github.com/fluid-lab/gamepad-navigator/raw/main/AUTHORS.md.

Licensed under the BSD 3-Clause License. You may not use this file except in
compliance with this License.

You may obtain a copy of the BSD 3-Clause License at
https://github.com/fluid-lab/gamepad-navigator/blob/main/LICENSE
*/
/* globals chrome */
(function (fluid) {
    "use strict";
    var gamepad = fluid.registerNamespace("gamepad");
    fluid.defaults("gamepad.settings.ui.mainPanel", {
        gradeNames: ["gamepad.templateRenderer"],
        injectionType: "replaceWith",
        markup: {
            container: "<div class='gamepad-settings-body'></div>"
        },
        model: {
            prefs: gamepad.prefs.defaults,
            bindings: gamepad.bindings.defaults
        },
        modelListeners: {
            prefs: {
                excludeSource: "init",
                funcName: "gamepad.settings.savePrefs",
                args: ["{that}.model.prefs"]
            },
            bindings: {
                excludeSource: "init",
                funcName: "gamepad.settings.saveBindings",
                args: ["{that}.model.bindings"]
            }
        },
        listeners: {
            "onCreate.loadSettings": {
                funcName: "gamepad.settings.loadSettings",
                args: ["{that}"]
            }
        },
        components: {
            prefsPanel: {
                container: "{that}.container",
                type: "gamepad.settings.ui.prefsPanel",
                options: {
                    model: {
                        prefs: "{gamepad.settings.ui.mainPanel}.model.prefs"
                    }
                }
            },

            buttonsPanel: {
                container: "{that}.container",
                type: "gamepad.settings.ui.buttonsPanel",
                options: {
                    model: {
                        label: "Buttons / Triggers",
                        bindings: "{gamepad.settings.ui.mainPanel}.model.bindings.buttons"
                    }
                }
            },
            axesPanel: {
                container: "{that}.container",
                type: "gamepad.settings.ui.axesPanel",
                options: {
                    model: {
                        label: "Axes (Thumb sticks)",
                        bindings: "{gamepad.settings.ui.mainPanel}.model.bindings.axes"
                    }
                }
            }
        }
    });

    gamepad.settings.loadSettings = async function (that) {
        gamepad.settings.loadPrefs(that);

        gamepad.settings.loadBindings(that);

        // In the similar function in input mapper, we add a listener for changes to values in local storage.  As we
        // have code to ensure that there is only open settings panel, and since only the settings panel can update
        // stored values, we should safely be able to avoid listening for local storage changes here.
    };

    gamepad.settings.loadPrefs = async function (that) {
        var storedPrefs = await gamepad.utils.getStoredKey("gamepad-prefs");
        var prefsToSave = storedPrefs || gamepad.prefs.defaults;

        var transaction = that.applier.initiate();

        transaction.fireChangeRequest({ path: "prefs", type: "DELETE"});
        transaction.fireChangeRequest({ path: "prefs", value: prefsToSave });

        transaction.commit();
    };

    gamepad.settings.loadBindings = async function (that) {
        var storedBindings = await gamepad.utils.getStoredKey("gamepad-bindings");
        var bindingsToSave = storedBindings || gamepad.bindings.defaults;

        var transaction = that.applier.initiate();

        transaction.fireChangeRequest({ path: "bindings", type: "DELETE"});
        transaction.fireChangeRequest({ path: "bindings", value: bindingsToSave });

        transaction.commit();
    };

    gamepad.settings.savePrefs = function (prefs) {
        var prefsEqualDefaults = gamepad.utils.isDeeplyEqual(gamepad.prefs.defaults, prefs);
        if (prefsEqualDefaults) {
            chrome.storage.local.remove("gamepad-prefs");
        }
        else {
            chrome.storage.local.set({ "gamepad-prefs": prefs });
        }
    };

    gamepad.settings.saveBindings = async function (bindings) {
        var bindingsEqualDefaults = gamepad.utils.isDeeplyEqual(gamepad.bindings.defaults, bindings);
        if (bindingsEqualDefaults) {
            chrome.storage.local.remove("gamepad-bindings");
        }
        else {
            chrome.storage.local.set({ "gamepad-bindings": bindings });
        }
    };

    window.component = gamepad.settings.ui.mainPanel(".gamepad-settings-body");
})(fluid);
