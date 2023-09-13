import { expect, test } from "bun:test";
import { FCBController } from "./FCBController";

const testFile = Bun.file(import.meta.dir + '/test_sysex.txt');
const testFileContents = await testFile.text();

const TEST_SYSEX = testFileContents.split(' ').map((s) => parseInt(s, 16));

test('test valid sysex', () => {
  expect(FCBController.validSysex(TEST_SYSEX)).toBe(true);
  expect(FCBController.validSysex(TEST_SYSEX.slice(1))).toBe(false);
  expect(FCBController.validSysex(TEST_SYSEX.map(n => ++n))).toBe(false);
});

test('from sysex', () => {
  const controller = FCBController.fromSysex(TEST_SYSEX);
  expect(controller).toBeInstanceOf(FCBController);
  expect(controller.presets[0].pc1.enabled).toBe(false);
  expect(controller.presets[0].cc1.enabled).toBe(true);
  expect(controller.presets[0].cc1?.controller).toBe(36);
  expect(controller.presets[0].cc1.value).toBe(1);
})
