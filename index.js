module.exports = function NpcSummoner(mod) {
	let debug = false;
	let debugData = [];

	mod.dispatch.addDefinition("C_REQUEST_CONTRACT", 50, [
		["name", "refString"],
		["data", "refBytes"],
		["type", "int32"],
		["target", "int64"],
		["value", "int32"],
		["name", "string"],
		["data", "bytes"]
	]);

	Object.keys(mod.settings.npc).forEach(name => {
		mod.command.add(name, () => {
			const npc = mod.settings.npc[name];
			const buffer = Buffer.alloc(4);

			buffer.writeUInt32LE(npc.value);
			mod.send("C_REQUEST_CONTRACT", 50, {
				"type": npc.type,
				"target": npc.gameId,
				"value": npc.value,
				"name": "",
				"data": buffer
			});
		});
	});

	mod.command.add("broker", () =>
		mod.send("S_NPC_MENU_SELECT", 1, { "type": 28 })
	);

	mod.command.add("npcsummoner", () => {
		debug = !debug;
		mod.command.message(`Module debug ${debug ? "enabled" : "disabled"}`);
	});

	mod.hook("S_SPAWN_NPC", mod.majorPatchVersion >= 101 ? 12 : 11, event => {
		const npc = Object.values(mod.settings.npc).find(n =>
			n.huntingZoneId === event.huntingZoneId &&
			n.templateId === event.templateId
		);

		if (npc) {
			npc.gameId = parseInt(event.gameId);
		}
	});

	mod.hook("S_DIALOG", 2, event => {
		if (!debug) return;

		debugData = [
			"Detected NPC:",
			`   "value": ${event.options[0]?.type}`,
			`   "gameId": ${event.gameId}`,
			`   "templateId": ${event.questId}`,
			`   "huntingZoneId": ${event.huntingZoneId}`
		];
	});

	mod.hook("S_REQUEST_CONTRACT", 1, event => {
		if (!debug) return;

		debugData.push(`   "type": ${event.type}`);
		debugData.forEach(data => {
			console.log(data);
			mod.command.message(data);
		});

		debugData = [];
	});
	mod.hook("S_STORE_SELL_LIST", 1, event => {
		if (!debug) return;

		debugData.push(`   "value1": ${event.button}`);
		debugData.forEach(data => {
			console.log(data);
			mod.command.message(data);
		});

		debugData = [];
	});

	this.destructor = () => {
		mod.command.remove(["broker", ...Object.keys(mod.settings.npc)]);
	};
};
