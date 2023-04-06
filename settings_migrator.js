/* eslint-disable no-param-reassign */
"use strict";

const DefaultSettings = {
	"npc": {
		// For bank NPC.
		// The "type" is a "type" from S_REQUEST_CONTRACT packet.
		// The "value" is a "container" from S_VIEW_WARE_EX packet.
		"bank": {
			"type": 27,
			"value": 1
		},
		"gbank": {
			"type": 27,
			"value": 3
		},
		"mail": {
			"type": 8,
			"value": 0
		},
		// For other NPCs.
		// You can use "npcsummoner" command to enable debug for get values.
		"store": {
			"type": 9,
			"value": 70310,
			"gameId": null,
			"templateId": 2019,
			"huntingZoneId": 183
		},
		"sstore": {
			"type": 9,
			"value": 250,
			"gameId": null,
			"templateId": 2109,
			"huntingZoneId": 183
		},
		"vg": {
			"type": 49,
			"value": 609,
			"gameId": null,
			"templateId": 2056,
			"huntingZoneId": 183
		},
	}
};

// Settings Migrator Extended v2
module.exports = function MigrateSettings(from_ver, to_ver, settings) {
	if (from_ver === undefined) return { ...DefaultSettings, ...settings };
	else if (from_ver === null) return DefaultSettings;
	else {
		from_ver = Number(from_ver);
		to_ver = Number(to_ver);

		if (from_ver + 1 < to_ver) {
			settings = MigrateSettings(from_ver, from_ver + 1, settings);
			return MigrateSettings(from_ver + 1, to_ver, settings);
		}

		const oldsettings = settings;

		switch (to_ver) {
			default:
				settings = Object.assign(DefaultSettings, {});

				for (const option in oldsettings) {
					if (settings[option] !== undefined) {
						settings[option] = MigrateOption(settings[option], oldsettings[option], ["gameId"]);
					}
				}
		}

		return settings;
	}
};

function MigrateOption(option, oldoption, excludes = []) {
	if (oldoption === undefined) {
		oldoption = option;
	}

	if (Array.isArray(option)) {
		for (const key of Object.keys(option)) {
			option[key] = MigrateOption(option[key], oldoption[key], excludes);
		}
	} else if (Object.getPrototypeOf(option) === Object.prototype) {
		for (const key of Object.keys(option)) {
			if (excludes.includes(key)) {
				option[key] = oldoption[key] || null;
			} else {
				option[key] = MigrateOption(option[key], oldoption[key], excludes);
			}
		}
	} else {
		option = oldoption;
	}

	return option;
}
