import escapeStringRegexp from "escape-string-regexp";
import bttv from "./bttv.js";

export const TWITCH_URL_PREFIX = `https://static-cdn.jtvnw.net/emoticons/v2`;
const EMOTE_REGEX_PART_1 = "(?:^|(?<=\\s))";
const EMOTE_REGEX_PART_2 = "(?:(?=\\s)|$)";

const BTTV_URL_PREFIX = "https://cdn.betterttv.net/emote";
const FFZ_URL_PREFIX = "https://cdn.betterttv.net/frankerfacez_emote";

// JavaScript's standard slice function does not work well with strings that contain
// unicode characters represented by more than one code unit. This trick helps solve
// that problem:
const unicodeSlice = (string, start, end) =>
  [...string].slice(start, end).join("");

/*
  This function takes the Twitch message's `emotes` data to inject
  one `<img>` tag per emote into the message that.

  For example for this emotes object...

  {
    "9080864508308403": "2-4",
    "1010283120381084": "70-72",
  }

  ...this means that characters 2-4 in the message string need
  to be replaced with an `<img>` tag which has an URL to the image
  for the emote with the ID 9080864508308403.
*/
export const replaceTwitchStandardEmotes = (message, emotes) => {
  // Twitch didn't recognize any emotes in the message.
  // So we just return the original message.
  if (!emotes) return message;

  let result = message;
  let replacementList = [];

  for (const [emoteId, occurenceIndices] of Object.entries(emotes)) {
    const [startIndex, endIndex] = occurenceIndices[0].split("-");

    replacementList.push({
      emoteStartIndex: Number(startIndex),
      emoteEndIndex: Number(endIndex) + 1,
      replacement: `<img src="${TWITCH_URL_PREFIX}/${emoteId}/default/light/2.0" alt="emote" />`,
    });
  }

  // reverse sort by start index
  replacementList = replacementList.sort((a, b) => {
    return b.emoteStartIndex - a.emoteStartIndex;
  });

  for (const {
    emoteStartIndex,
    emoteEndIndex,
    replacement,
  } of replacementList) {
    result = `${unicodeSlice(
      result,
      0,
      emoteStartIndex
    )}${replacement}${unicodeSlice(result, emoteEndIndex)}`;
  }

  return result;
};

/*
  This function scans the message text for occurences of bttv global emote codes.

  It uses the global bttv emotes list and for each emote code (e.g. SourPls),
  it replaces that code with an `<img>` tag with the URL to that bttv emote.
*/
const replaceBTTVGlobalEmotes = async (message) => {
  const bttvGlobalLookupTable = await bttv.getBttvGlobalLookupTable();
  const bttvGlobalEmoteCodes = Object.keys(bttvGlobalLookupTable);

  // Check if there are any global emote codes found in the message...
  const noGlobalEmoteCodeFound = bttvGlobalEmoteCodes.every(
    (emoteCode) => !message.includes(emoteCode)
  );

  // ... and if not just return the original message
  if (noGlobalEmoteCodeFound) return message;

  // Else do the work: Go through each code and if you find it replace it respectively.
  let result = message;
  bttvGlobalEmoteCodes.forEach((emoteCode) => {
    const escapedEmoteCode = escapeStringRegexp(emoteCode);
    const emoteRegexp = new RegExp(`\\b${escapedEmoteCode}\\b`, "g");

    result = result.replaceAll(emoteRegexp, (matchedEmoteCode) => {
      const emoteId = bttvGlobalLookupTable[matchedEmoteCode].id;
      return `<img src="${BTTV_URL_PREFIX}/${emoteId}/2x" />`;
    });
  });

  return result;
};

/*
  This function scans the message text for occurences of bttv channel emote codes.

  It uses the channel's bttv emotes list and for each emote code (e.g. myChannelEmote),
  it replaces that code with an `<img>` tag with the URL to that bttv emote.
*/
const replaceBTTVChannelEmotes = async (message) => {
  const bttvChannelLookupTable = await bttv.getBttvChannelLookupTable();
  const bttvChannelEmoteCodes = Object.keys(bttvChannelLookupTable);

  // Check if there are any channel emote codes found in the message...
  const noChannelEmoteCodeFound = bttvChannelEmoteCodes.every(
    (emoteCode) => !message.includes(emoteCode)
  );

  // ... and if not just return the original message
  if (noChannelEmoteCodeFound) return message;

  // Else do the work: Go through each code and if you find it replace it respectively.
  let result = message;
  bttvChannelEmoteCodes.forEach((emoteCode) => {
    const escapedEmoteCode = escapeStringRegexp(emoteCode);
    const emoteRegexp = new RegExp(`\\b${escapedEmoteCode}\\b`, "g");

    result = result.replaceAll(emoteRegexp, (matchedEmoteCode) => {
      const emoteId = bttvChannelLookupTable[matchedEmoteCode].id;
      return `<img src="${BTTV_URL_PREFIX}/${emoteId}/2x" />`;
    });
  });

  return result;
};

/*
  This function scans the message text for occurences of FrankerFaceZ emote codes.

  It uses the global FrankerFaceZ emotes list and for each emote code (e.g. OMEGALUL),
  it replaces that code with an `<img>` tag with the URL to that FFZ emote.
*/
const replaceFFZChannelEmotes = async (message) => {
  const ffzChannelLookupTable = await bttv.getFfzChannelLookupTable();
  const ffzChannelEmoteCodes = Object.keys(ffzChannelLookupTable);

  // Check if there are any channel emote codes found in the message...
  const noChannelEmoteCodeFound = ffzChannelEmoteCodes.every(
    (emoteCode) => !message.includes(emoteCode)
  );

  // ... and if not just return the original message
  if (noChannelEmoteCodeFound) return message;

  // Else do the work: Go through each code and if you find it replace it respectively.
  let result = message;
  ffzChannelEmoteCodes.forEach((emoteCode) => {
    const escapedEmoteCode = escapeStringRegexp(emoteCode);
    const emoteRegexp = new RegExp(`\\b${escapedEmoteCode}\\b`, "g");

    result = result.replaceAll(emoteRegexp, (matchedEmoteCode) => {
      const emoteId = ffzChannelLookupTable[matchedEmoteCode].id;
      return `<img src="${FFZ_URL_PREFIX}/${emoteId}/2" />`;
    });
  });

  return result;
};

const replaceEmotesWithImageTags = async (message, emotes) => {
  let result = message;
  result = replaceTwitchStandardEmotes(result, emotes);
  result = await replaceBTTVGlobalEmotes(result);
  result = await replaceBTTVChannelEmotes(result);
  result = await replaceFFZChannelEmotes(result);
  return result;
};

export default replaceEmotesWithImageTags;
