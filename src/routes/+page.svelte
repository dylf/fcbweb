<script lang="ts">
	import { FCBController } from '$lib/FCBController';
	type MIDIMessage = {
		timestamp: number;
		data: number[];
	};

	let midiAccess: MIDIAccess | null = null;
	let midiInputDevices: MIDIInput[] = [];
	let midiOutputDevices: MIDIOutput[] = [];

	let selectedInputDevice: string = localStorage.getItem('selectedInputDevice') || '';
	let selectedOutputDevice: string;

	let messages: MIDIMessage[] = [];

	function onMIDIMessage(e: Event) {
		const midiEvent = e as MIDIMessageEvent;
		messages = [...messages, { timestamp: midiEvent.timeStamp, data: [...midiEvent.data] }];
		if (midiEvent.data.length) {
			const controller = FCBController.fromSysex([...midiEvent.data]);
			console.log(controller);
		}
	}

	function formatData(data: number[]): string {
		return data.map((character) => `0x${character.toString(16)}`).join(' ');
	}

	function bindMIDIInputListener(midiAccess: MIDIAccess) {
		midiAccess.inputs.forEach((entry) => {
			if (entry.id === selectedInputDevice) {
				entry.onmidimessage = onMIDIMessage;
			}
		});
	}

	navigator.requestMIDIAccess({ sysex: true }).then(
		(access) => {
			midiAccess = access;
			midiInputDevices = [...access.inputs.values()];
			midiOutputDevices = [...access.outputs.values()];
			bindMIDIInputListener(access);
		},
		() => console.error('Could not access the midi devices.')
	);

	function handleInputDeviceChange() {
		localStorage.setItem('selectedInputDevice', selectedInputDevice);
		midiAccess?.inputs.forEach((entry) => {
			if (entry.id === selectedInputDevice) {
				entry.onmidimessage = onMIDIMessage;
			} else {
				entry.onmidimessage = null;
			}
		});
	}

	function handleOutputDeviceChange() {
		localStorage.setItem('selectedOutputDevice', selectedOutputDevice);
	}
</script>

<main class="align-middle flex flex-col text-center">
	<div class="p-4" />
	<h1 class="text-4xl">FCB1010 Web Editor</h1>
	<div class="p-4" />
	<section>
		<label for="midi-input-device">Midi Input Device</label>
		<select
			class="bg-slate-800 p-2 rounded-xl"
			name="midi-input-device"
			bind:value={selectedInputDevice}
			on:change={handleInputDeviceChange}
		>
			<option value="">None</option>
			{#each midiInputDevices as midiInputDevice}
				<option value={midiInputDevice.id}>{midiInputDevice.name}</option>
			{/each}
		</select>

		<label for="midi-output-device">Midi Output Device</label>
		<select
			class="bg-slate-800 p-2 rounded-xl"
			bind:value={selectedOutputDevice}
			name="midi-output-device"
			on:change={handleOutputDeviceChange}
		>
			<option value="">None</option>
			{#each midiOutputDevices as midiOutputDevice}
				<option value={midiOutputDevice.id}>
					{midiOutputDevice.name}
				</option>
			{/each}
		</select>
	</section>
	<div class="p-4" />
	<div class="p-4 bg-slate-800 rounded-xl min-h-500px w-1/2 self-center">
		<div class="pb-2 text-left">
			<button class="bg-slate-600 px-4 py-2 rounded-xl hover:bg-slate-500">Controller</button>
			<button class="bg-slate-700 px-4 py-2 rounded-xl hover:bg-slate-500">Table</button>
		</div>
		<div class="w-full border-b-2 border-slate-700" />
		<div class="p-4" />
		<div class="bg-gray-500 p-2 rounded-md">
			<div class="p-2 border-b-2 border-gray-600">
				<h2 class="text-3xl text-left ml-16 text-black font-bold">FCB1010</h2>
			</div>
			<div class="flex flex-row p-2">
				<div class="p-7 buttons grid-cols-5 grid gap-4 flex-1">
					<button class="bg-black justify-self-start w-20 h-32 rounded-md order-6">1</button>
					<button class="bg-black justify-self-start w-20 h-32 rounded-md order-7">2</button>
					<button class="bg-black justify-self-start w-20 h-32 rounded-md order-8">3</button>
					<button class="bg-black justify-self-start w-20 h-32 rounded-md order-9">4</button>
					<button class="bg-black justify-self-start w-20 h-32 rounded-md order-10">5</button>
					<button class="bg-black justify-self-end w-20 h-32 rounded-md order-1">6</button>
					<button class="bg-black justify-self-end w-20 h-32 rounded-md order-2">7</button>
					<button class="bg-black justify-self-end w-20 h-32 rounded-md order-3">8</button>
					<button class="bg-black justify-self-end w-20 h-32 rounded-md order-4">9</button>
					<button class="bg-black justify-self-end w-20 h-32 rounded-md order-5">10</button>
				</div>
				<div class="w-64 flex flex-row justify-between">
					<button class="bg-black w-28 rounded-md">EXP A</button>
					<button class="bg-black w-28 rounded-md">EXP B</button>
				</div>
			</div>
		</div>
		<div class="bg-slate-500 min-h-full overflow-y-scroll h-500px">
			{#each messages as message}
				<p>Message at {message.timestamp} ></p>
				<p>{formatData(message.data)}</p>
			{/each}
		</div>
	</div>
</main>
