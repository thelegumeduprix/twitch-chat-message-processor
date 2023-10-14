import $5OpyM$escapestringregexp from "escape-string-regexp";


let $ec8135fb881bd20b$var$userId;
let $ec8135fb881bd20b$var$bttvGlobalLookupTable;
let $ec8135fb881bd20b$var$bttvChannelLookupTable;
let $ec8135fb881bd20b$var$ffzChannelLookupTable;
async function $ec8135fb881bd20b$var$getUserId() {
    if ($ec8135fb881bd20b$var$userId) return $ec8135fb881bd20b$var$userId;
    const queryParameters = new URLSearchParams(window.location.search);
    const channelName = queryParameters.get("channel");
    const userIdResponse = await fetch(`https://decapi.me/twitch/id/${channelName}`);
    $ec8135fb881bd20b$var$userId = await userIdResponse.text();
    return $ec8135fb881bd20b$var$userId;
}
async function $ec8135fb881bd20b$var$getBttvGlobalLookupTable() {
    if ($ec8135fb881bd20b$var$bttvGlobalLookupTable) return $ec8135fb881bd20b$var$bttvGlobalLookupTable;
    const bttvGlobalEmotesResponse = await fetch("https://api.betterttv.net/3/cached/emotes/global");
    if (bttvGlobalEmotesResponse.ok) {
        const bttvGlobalEmotes = await bttvGlobalEmotesResponse.json();
        $ec8135fb881bd20b$var$bttvGlobalLookupTable = bttvGlobalEmotes.reduce((result, emote)=>{
            const emoteData = {
                id: emote.id,
                type: emote.imageType
            };
            result[emote.code] = emoteData;
            return result;
        }, {});
        return $ec8135fb881bd20b$var$bttvGlobalLookupTable;
    }
    return {};
}
async function $ec8135fb881bd20b$var$getBttvChannelLookupTable() {
    if ($ec8135fb881bd20b$var$bttvChannelLookupTable) return $ec8135fb881bd20b$var$bttvChannelLookupTable;
    const userId1 = await $ec8135fb881bd20b$var$getUserId();
    const bttvChannelEmotesResponse = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${userId1}`);
    if (bttvChannelEmotesResponse.ok) {
        const bttvChannelEmotesJSON = await bttvChannelEmotesResponse.json();
        const bttvChannelEmotes = bttvChannelEmotesJSON?.channelEmotes.concat(bttvChannelEmotesJSON.sharedEmotes);
        $ec8135fb881bd20b$var$bttvChannelLookupTable = bttvChannelEmotes.reduce((result, emote)=>{
            const emoteData = {
                id: emote.id,
                type: emote.imageType
            };
            result[emote.code] = emoteData;
            return result;
        }, {});
        return $ec8135fb881bd20b$var$bttvChannelLookupTable;
    }
    return {};
}
async function $ec8135fb881bd20b$var$getFfzChannelLookupTable() {
    if ($ec8135fb881bd20b$var$ffzChannelLookupTable) return $ec8135fb881bd20b$var$ffzChannelLookupTable;
    const userId2 = await $ec8135fb881bd20b$var$getUserId();
    const ffzChannelEmotesResponse = await fetch(`https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${userId2}`);
    if (ffzChannelEmotesResponse.ok) {
        const ffzChannelEmotes = await ffzChannelEmotesResponse.json();
        $ec8135fb881bd20b$var$ffzChannelLookupTable = ffzChannelEmotes.reduce((result, emote)=>{
            const emoteData = {
                id: emote.id,
                type: emote.imageType
            };
            result[emote.code] = emoteData;
            return result;
        }, {});
        return $ec8135fb881bd20b$var$ffzChannelLookupTable;
    }
    return {};
}
var $ec8135fb881bd20b$export$2e2bcd8739ae039 = {
    getBttvGlobalLookupTable: $ec8135fb881bd20b$var$getBttvGlobalLookupTable,
    getBttvChannelLookupTable: $ec8135fb881bd20b$var$getBttvChannelLookupTable,
    getFfzChannelLookupTable: $ec8135fb881bd20b$var$getFfzChannelLookupTable
};


const $fc3ee9df2dd1e135$export$9564fa4d4f9db33f = `https://static-cdn.jtvnw.net/emoticons/v2`;
const $fc3ee9df2dd1e135$var$EMOTE_REGEX_PART_1 = "(?:^|(?<=\\s))";
const $fc3ee9df2dd1e135$var$EMOTE_REGEX_PART_2 = "(?:(?=\\s)|$)";
const $fc3ee9df2dd1e135$var$BTTV_URL_PREFIX = "https://cdn.betterttv.net/emote";
const $fc3ee9df2dd1e135$var$FFZ_URL_PREFIX = "https://cdn.betterttv.net/frankerfacez_emote";
// JavaScript's standard slice function does not work well with strings that contain
// unicode characters represented by more than one code unit. This trick helps solve
// that problem:
const $fc3ee9df2dd1e135$var$unicodeSlice = (string, start, end)=>[
        ...string
    ].slice(start, end).join("");
const $fc3ee9df2dd1e135$export$25c2dea55dc4df21 = (message, emotes)=>{
    // Twitch didn't recognize any emotes in the message.
    // So we just return the original message.
    if (!emotes) return message;
    let result = message;
    let replacementList = [];
    for (const [emoteId, occurenceIndices] of Object.entries(emotes)){
        const [startIndex, endIndex] = occurenceIndices[0].split("-");
        replacementList.push({
            emoteStartIndex: Number(startIndex),
            emoteEndIndex: Number(endIndex) + 1,
            replacement: `<img src="${$fc3ee9df2dd1e135$export$9564fa4d4f9db33f}/${emoteId}/default/light/2.0" alt="emote" />`
        });
    }
    // reverse sort by start index
    replacementList = replacementList.sort((a, b)=>{
        return b.emoteStartIndex - a.emoteStartIndex;
    });
    for (const { emoteStartIndex: emoteStartIndex , emoteEndIndex: emoteEndIndex , replacement: replacement ,  } of replacementList)result = `${$fc3ee9df2dd1e135$var$unicodeSlice(result, 0, emoteStartIndex)}${replacement}${$fc3ee9df2dd1e135$var$unicodeSlice(result, emoteEndIndex)}`;
    return result;
};
/*
  This function scans the message text for occurences of bttv global emote codes.

  It uses the global bttv emotes list and for each emote code (e.g. SourPls),
  it replaces that code with an `<img>` tag with the URL to that bttv emote.
*/ const $fc3ee9df2dd1e135$var$replaceBTTVGlobalEmotes = async (message)=>{
    const bttvGlobalLookupTable = await (0, $ec8135fb881bd20b$export$2e2bcd8739ae039).getBttvGlobalLookupTable();
    const bttvGlobalEmoteCodes = Object.keys(bttvGlobalLookupTable);
    // Check if there are any global emote codes found in the message...
    const noGlobalEmoteCodeFound = bttvGlobalEmoteCodes.every((emoteCode)=>!message.includes(emoteCode));
    // ... and if not just return the original message
    if (noGlobalEmoteCodeFound) return message;
    // Else do the work: Go through each code and if you find it replace it respectively.
    let result = message;
    bttvGlobalEmoteCodes.forEach((emoteCode)=>{
        const escapedEmoteCode = (0, $5OpyM$escapestringregexp)(emoteCode);
        const emoteRegexp = new RegExp(`\\b${escapedEmoteCode}\\b`, "g");
        result = result.replaceAll(emoteRegexp, (matchedEmoteCode)=>{
            const emoteId = bttvGlobalLookupTable[matchedEmoteCode].id;
            return `<img src="${$fc3ee9df2dd1e135$var$BTTV_URL_PREFIX}/${emoteId}/2x" />`;
        });
    });
    return result;
};
/*
  This function scans the message text for occurences of bttv channel emote codes.

  It uses the channel's bttv emotes list and for each emote code (e.g. myChannelEmote),
  it replaces that code with an `<img>` tag with the URL to that bttv emote.
*/ const $fc3ee9df2dd1e135$var$replaceBTTVChannelEmotes = async (message)=>{
    const bttvChannelLookupTable = await (0, $ec8135fb881bd20b$export$2e2bcd8739ae039).getBttvChannelLookupTable();
    const bttvChannelEmoteCodes = Object.keys(bttvChannelLookupTable);
    // Check if there are any channel emote codes found in the message...
    const noChannelEmoteCodeFound = bttvChannelEmoteCodes.every((emoteCode)=>!message.includes(emoteCode));
    // ... and if not just return the original message
    if (noChannelEmoteCodeFound) return message;
    // Else do the work: Go through each code and if you find it replace it respectively.
    let result = message;
    bttvChannelEmoteCodes.forEach((emoteCode)=>{
        const escapedEmoteCode = (0, $5OpyM$escapestringregexp)(emoteCode);
        const emoteRegexp = new RegExp(`\\b${escapedEmoteCode}\\b`, "g");
        result = result.replaceAll(emoteRegexp, (matchedEmoteCode)=>{
            const emoteId = bttvChannelLookupTable[matchedEmoteCode].id;
            return `<img src="${$fc3ee9df2dd1e135$var$BTTV_URL_PREFIX}/${emoteId}/2x" />`;
        });
    });
    return result;
};
/*
  This function scans the message text for occurences of FrankerFaceZ emote codes.

  It uses the global FrankerFaceZ emotes list and for each emote code (e.g. OMEGALUL),
  it replaces that code with an `<img>` tag with the URL to that FFZ emote.
*/ const $fc3ee9df2dd1e135$var$replaceFFZChannelEmotes = async (message)=>{
    const ffzChannelLookupTable = await (0, $ec8135fb881bd20b$export$2e2bcd8739ae039).getFfzChannelLookupTable();
    const ffzChannelEmoteCodes = Object.keys(ffzChannelLookupTable);
    // Check if there are any channel emote codes found in the message...
    const noChannelEmoteCodeFound = ffzChannelEmoteCodes.every((emoteCode)=>!message.includes(emoteCode));
    // ... and if not just return the original message
    if (noChannelEmoteCodeFound) return message;
    // Else do the work: Go through each code and if you find it replace it respectively.
    let result = message;
    ffzChannelEmoteCodes.forEach((emoteCode)=>{
        const escapedEmoteCode = (0, $5OpyM$escapestringregexp)(emoteCode);
        const emoteRegexp = new RegExp(`\\b${escapedEmoteCode}\\b`, "g");
        result = result.replaceAll(emoteRegexp, (matchedEmoteCode)=>{
            const emoteId = ffzChannelLookupTable[matchedEmoteCode].id;
            return `<img src="${$fc3ee9df2dd1e135$var$FFZ_URL_PREFIX}/${emoteId}/2" />`;
        });
    });
    return result;
};
const $fc3ee9df2dd1e135$var$replaceEmotesWithImageTags = async (message, emotes)=>{
    let result = message;
    result = $fc3ee9df2dd1e135$export$25c2dea55dc4df21(result, emotes);
    result = await $fc3ee9df2dd1e135$var$replaceBTTVGlobalEmotes(result);
    result = await $fc3ee9df2dd1e135$var$replaceBTTVChannelEmotes(result);
    result = await $fc3ee9df2dd1e135$var$replaceFFZChannelEmotes(result);
    return result;
};
var $fc3ee9df2dd1e135$export$2e2bcd8739ae039 = $fc3ee9df2dd1e135$var$replaceEmotesWithImageTags;


const $f78ec825f76297b7$var$PRONOUNS_URL_PREFIX = `https://pronouns.alejo.io/api`;
let $f78ec825f76297b7$var$pronounNames;
let $f78ec825f76297b7$var$userPronouns = {};
const $f78ec825f76297b7$var$fetchAllPronounNames = async ()=>{
    if ($f78ec825f76297b7$var$pronounNames) return $f78ec825f76297b7$var$pronounNames;
    const pronounsJSON = await fetch(`${$f78ec825f76297b7$var$PRONOUNS_URL_PREFIX}/pronouns`);
    $f78ec825f76297b7$var$pronounNames = await pronounsJSON.json();
    $f78ec825f76297b7$var$pronounNames = $f78ec825f76297b7$var$pronounNames.reduce((result, pronoun)=>{
        result[pronoun.name] = pronoun.display;
        return result;
    }, {});
    return $f78ec825f76297b7$var$pronounNames;
};
const $f78ec825f76297b7$export$8d8ae72bca7669b1 = async (username)=>{
    if (!$f78ec825f76297b7$var$pronounNames) await $f78ec825f76297b7$var$fetchAllPronounNames();
    const userPronounsJSON = await fetch(`${$f78ec825f76297b7$var$PRONOUNS_URL_PREFIX}/users/${username}`);
    const userPronounsData = await userPronounsJSON.json();
    const pronounId = userPronounsData?.[0]?.pronoun_id;
    if (pronounId) $f78ec825f76297b7$var$userPronouns[username] = $f78ec825f76297b7$var$pronounNames[pronounId];
    return $f78ec825f76297b7$var$userPronouns[username];
};


const $cf838c15c8b009ba$var$processMessage = async (tags, message)=>{
    const messageHTMLWithEmotesReplaced = await (0, $fc3ee9df2dd1e135$export$2e2bcd8739ae039)(message, tags.emotes);
    const userPronouns = await (0, $f78ec825f76297b7$export$8d8ae72bca7669b1)(tags.username);
    return {
        messageHTML: messageHTMLWithEmotesReplaced,
        pronounsText: userPronouns,
        displayName: tags["display-name"],
        userColor: tags.color,
        isSlashMeMessage: tags["message-type"] === "action",
        badgeKeys: tags.badges ? Object.keys(tags.badges) : []
    };
};
var $cf838c15c8b009ba$export$2e2bcd8739ae039 = $cf838c15c8b009ba$var$processMessage;


export {$cf838c15c8b009ba$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=module.js.map
