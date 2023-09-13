type ProgramChange = {
  enabled?: boolean;
  value?: number;
};

type ControlChange = {
  enabled?: boolean;
  controller?: number;
  value?: number;
};

type ExpressionPedal = {
  enabled?: boolean;
  controller?: number;
  min?: number;
  max?: number;
};

type Note = {
  enabled?: boolean;
  note?: number;
};

type Preset = {
  bank?: number;
  preset?: number;
  pc1?: ProgramChange;
  pc2?: ProgramChange;
  pc3?: ProgramChange;
  pc4?: ProgramChange;
  pc5?: ProgramChange;
  cc1?: ControlChange;
  cc2?: ControlChange;
  switch1Enabled?: boolean;
  switch2Enabled?: boolean;
  expressionA?: ExpressionPedal;
  expressionB?: ExpressionPedal;
  note?: Note;
};

export class FCBController {
  presets: Preset[] = [];
  pc1MidiChannel: number;
  pc2MidiChannel: number;
  pc3MidiChannel: number;
  pc4MidiChannel: number;
  pc5MidiChannel: number;
  cc1MidiChannel: number;
  cc2MidiChannel: number;
  expressionAMidiChannel: number;
  expressionBMidiChannel: number;
  noteMidiChannel: number;
  directSelectEnabled: boolean;
  runningStatus: boolean;
  mergeEnabled: boolean;
  switch1Enabled: boolean;
  switch2Enabled: boolean;
  expressionACalibrationMin: number;
  expressionACalibrationMax: number;
  expressionBCalibrationMin: number;
  expressionBCalibrationMax: number;

  private constructor(
    presets: Preset[],
    pc1MidiChannel: number,
    pc2MidiChannel: number,
    pc3MidiChannel: number,
    pc4MidiChannel: number,
    pc5MidiChannel: number,
    cc1MidiChannel: number,
    cc2MidiChannel: number,
    expressionAMidiChannel: number,
    expressionBMidiChannel: number,
    noteMidiChannel: number,
    directSelectEnabled: boolean,
    runningStatus: boolean,
    mergeEnabled: boolean,
    switch1Enabled: boolean,
    switch2Enabled: boolean,
    expressionACalibrationMin: number,
    expressionACalibrationMax: number,
    expressionBCalibrationMin: number,
    expressionBCalibrationMax: number
  ) {
    this.presets = presets;
    this.pc1MidiChannel = pc1MidiChannel;
    this.pc2MidiChannel = pc2MidiChannel;
    this.pc3MidiChannel = pc3MidiChannel;
    this.pc4MidiChannel = pc4MidiChannel;
    this.pc5MidiChannel = pc5MidiChannel;
    this.cc1MidiChannel = cc1MidiChannel;
    this.cc2MidiChannel = cc2MidiChannel;
    this.expressionAMidiChannel = expressionAMidiChannel;
    this.expressionBMidiChannel = expressionBMidiChannel;
    this.noteMidiChannel = noteMidiChannel;
    this.directSelectEnabled = directSelectEnabled;
    this.runningStatus = runningStatus;
    this.mergeEnabled = mergeEnabled;
    this.switch1Enabled = switch1Enabled;
    this.switch2Enabled = switch2Enabled;
    this.expressionACalibrationMin = expressionACalibrationMin;
    this.expressionACalibrationMax = expressionACalibrationMax;
    this.expressionBCalibrationMin = expressionBCalibrationMin;
    this.expressionBCalibrationMax = expressionBCalibrationMax;
  }

  static fromSysex(data: number[]): FCBController {
    if (!this.validSysex(data)) {
      throw new Error('Invalid sysex data');
    }
    let offset = 14;
    let flag = 0;
    let presets: Preset[] = [];
    let enabled = false;
    for (let i = 0; i < 100; i++) {
      presets[i] = {};
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, true));
      presets[i].pc1 = { enabled: enabled };
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, true));
      presets[i].pc2 = { enabled: enabled };
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, true));
      presets[i].pc3 = { enabled: enabled };
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, true));
      presets[i].pc4 = { enabled: enabled };
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, true));
      presets[i].pc5 = { enabled: enabled };
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, true));
      presets[i].cc1 = { enabled: enabled };
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, false));
      presets[i].switch1Enabled = enabled;
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, true));
      presets[i].cc2 = { enabled: enabled };
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, false));
      presets[i].switch2Enabled = enabled;
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, true));
      presets[i].expressionA = { enabled: enabled };
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, false));
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, false));
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, true));
      presets[i].expressionB = { enabled: enabled };
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, false));
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, false));
      ({ enabled, offset, flag } = this.getPresetEnabledState(data, offset, flag, true));
      presets[i].note = { enabled: enabled };
    }

    offset = 7;
    for (let i = 0; i < 100; i++) {
      [presets[i]!.pc1!.value, offset] = this.getPresetParams(data, offset);
      [presets[i]!.pc2!.value, offset] = this.getPresetParams(data, offset);
      [presets[i]!.pc3!.value, offset] = this.getPresetParams(data, offset);
      [presets[i]!.pc4!.value, offset] = this.getPresetParams(data, offset);
      [presets[i]!.pc5!.value, offset] = this.getPresetParams(data, offset);
      [presets[i]!.cc1!.controller, offset] = this.getPresetParams(data, offset);
      [presets[i]!.cc1!.value, offset] = this.getPresetParams(data, offset);
      [presets[i]!.cc2!.controller, offset] = this.getPresetParams(data, offset);
      [presets[i]!.cc2!.value, offset] = this.getPresetParams(data, offset);
      [presets[i]!.expressionA!.controller, offset] = this.getPresetParams(data, offset);
      [presets[i]!.expressionA!.min, offset] = this.getPresetParams(data, offset);
      [presets[i]!.expressionA!.max, offset] = this.getPresetParams(data, offset);
      [presets[i]!.expressionB!.controller, offset] = this.getPresetParams(data, offset);
      [presets[i]!.expressionB!.min, offset] = this.getPresetParams(data, offset);
      [presets[i]!.expressionB!.max, offset] = this.getPresetParams(data, offset);
      [presets[i]!.note!.note, offset] = this.getPresetParams(data, offset);
    }

    return new FCBController(
      presets,
      data[2311],
      data[2312],
      data[2313],
      data[2314],
      data[2315],
      data[2316],
      data[2317],
      data[2319],
      data[2320],
      data[2321],
      (data[2330] & 2) == 2,
      (data[2330] & 4) == 4,
      (data[2330] & 16) == 16,
      (data[2334] & 4) == 4,
      (data[2329] & 64) == 64,
      data[2343],
      data[2344],
      data[2345],
      data[2346],
    );
  }

  /**
    * Get the enable state of a preset's parameters
    *   @param data Raw sysex data as list of integers
    *   @param offset Offset of bitwise flag byte within sysex data
    *   @param flag Index of flag bit within byte
    *   @param invert True to invert the result
    */
  private static getPresetEnabledState(data: number[], offset: number, flag: number, invert: boolean): { enabled: boolean, offset: number, flag: number } {
    let result = (data[offset] & (1 << flag)) == (1 << flag);
    result = invert ? !result : result;
    flag++;
    if (flag > 6) {
      offset += 8;
      flag = 0;
    }
    return { enabled: result, offset: offset, flag: flag };
  }

  /**
   * Get the value of a preset's parameters
   *  @param data Raw sysex data as list of integers
   *  @param offset Offset of value bytes within sysex data
   */
  private static getPresetParams(data: number[], offset: number): [number, number] {
    let result = data[offset];
    offset += 1;
    if ((offset - 6) % 8 === 0) {
      offset += 1;
    }
    return [result, offset];
  }


  /**
  * Validates the sysex data for the FCB1010.
  */
  static validSysex(data: number[]): boolean {
    return data.length === 2352
      && data[0] === 240
      && data[data.length - 1] === 247
      && data[1] === 0
      && data[2] === 32
      && data[3] === 50
      && data[4] === 1
      && data[5] === 12
      && data[6] === 15;
  }
}
