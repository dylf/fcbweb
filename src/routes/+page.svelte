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

<h1>FCB1010 Web Editor</h1>
<label for="midi-input-device">Midi Input Device</label>
<select
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
<div style="background-color: lightgrey; max-height: 500px; overflow-y: scroll">
	{#each messages as message}
		<p>Message at {message.timestamp} ></p>
		<p>{formatData(message.data)}</p>
	{/each}
</div>
