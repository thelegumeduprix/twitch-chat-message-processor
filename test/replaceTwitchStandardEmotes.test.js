import { expect } from "chai";
import {
  replaceTwitchStandardEmotes,
  TWITCH_URL_PREFIX,
} from "../src/emotes.js";

describe("replaceTwitchStandardEmotes()", function () {
  let message;
  let emotes;

  describe("when emotes object contains emote ranges", function () {
    before(function () {
      message = `Ok, LUL, this is BabyRage? BOP`;
      emotes = {
        456: ["17-24"],
        789: ["27-29"],
        123: ["4-6"],
      };
    });

    it("replaces twitch emotes with image tags correctly", function () {
      const newMessage = replaceTwitchStandardEmotes(message, emotes);
      expect(newMessage).to.equal(
        `Ok, <img src="${TWITCH_URL_PREFIX}/123/default/light/2.0" alt="emote" />, this is <img src="${TWITCH_URL_PREFIX}/456/default/light/2.0" alt="emote" />? <img src="${TWITCH_URL_PREFIX}/789/default/light/2.0" alt="emote" />`
      );
    });
  });

  describe("when emotes object contains emote ranges and there are multi-codepoint emojis in the messge", function () {
    before(function () {
      message = `🤦🏾‍♀️ LUL`;
      emotes = {
        456: ["6-8"],
      };
    });

    it("replaces twitch emotes with image tags correctly", function () {
      const newMessage = replaceTwitchStandardEmotes(message, emotes);
      expect(newMessage).to.equal(
        `🤦🏾‍♀️ <img src="${TWITCH_URL_PREFIX}/456/default/light/2.0" alt="emote" />`
      );
    });
  });

  describe("when emotes object contains emote ranges and there are multi-codepoint emojis and special character based emotes in the messge", function () {
    before(function () {
      message = "🤦🏾‍♀️ LUL 👩‍👩‍👧 :O and test";
      emotes = {
        425618: ["6-8"],
        555555580: ["16-17"],
      };
    });

    it("replaces twitch emotes with image tags correctly", function () {
      const newMessage = replaceTwitchStandardEmotes(message, emotes);
      expect(newMessage).to.equal(
        `🤦🏾‍♀️ <img src="${TWITCH_URL_PREFIX}/425618/default/light/2.0" alt="emote" /> 👩‍👩‍👧 <img src="${TWITCH_URL_PREFIX}/555555580/default/light/2.0" alt="emote" /> and test`
      );
    });
  });

  describe("when emotes object is empty", function () {
    before(function () {
      message = `Ok, LUL, this is BabyRage? BOP`;
      emotes = {};
    });

    it("leaves the message as-is", function () {
      const newMessage = replaceTwitchStandardEmotes(message, emotes);
      expect(newMessage).to.equal(message);
    });
  });

  describe("when emotes object is not provided", function () {
    before(function () {
      message = `Ok, LUL, this is BabyRage? BOP`;
      emotes = undefined;
    });

    it("leaves the message as-is", function () {
      const newMessage = replaceTwitchStandardEmotes(message, emotes);
      expect(newMessage).to.equal(message);
    });
  });
});
