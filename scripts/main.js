const navBar = document.querySelector('.top-nav');
const primaryContainer = document.querySelector('#content');
const pageSearchBar = document.querySelector('.search-bar');


// Cache

let openModalsCache = 0;
let categoryFullViewCache;


// param code
const params = new URLSearchParams(window.location.search);
function setParams(params) {
    const url = new URL(window.location);
    url.search = '';
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });
    history.replaceState(null, '', url);
};
function addParams(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });
    history.replaceState(null, '', url);
};
function removeParams(params) {
    const url = new URL(window.location);
    if (!Array.isArray(params)) {
        params = [params];
    }
    params.forEach(key => url.searchParams.delete(key));
    history.replaceState(null, '', url);
};





// Settings Code

const settings = {
    "disable_bg_effect": 0,
    "disable_mouse_effect": 0
};


if (!localStorage.getItem('optionsStore')) {
    localStorage.setItem('optionsStore', JSON.stringify({}))
}

let optionsStore = JSON.parse(localStorage.getItem('optionsStore'));

// Initialize settings store
function initializeSettings() {
    if (Object.keys(optionsStore).length === 0) {
        // Initialize with default values
        for (let key in settings) {
            optionsStore[key] = settings[key];
        }
    } else {
        // Only add missing keys, don't overwrite existing ones
        for (let key in settings) {
            if (!(key in optionsStore)) {
                optionsStore[key] = settings[key];
            }
        }
    }
    
    localStorage.setItem('optionsStore', JSON.stringify(optionsStore));
}

initializeSettings();

// Function to change a setting
function changeSetting(key, value) {
    if (key in optionsStore) {
        optionsStore[key] = value;
        
        localStorage.setItem('optionsStore', JSON.stringify(optionsStore));
        
        console.log(`Setting '${key}' changed to ${value}`);
    } else {
        console.error(`Setting '${key}' does not exist`);
    }
}

// Function to toggle a setting (0 or 1)
function toggleSetting(key) {
    if (key in optionsStore) {
        const newValue = optionsStore[key] === 0 ? 1 : 0;
        changeSetting(key, newValue);
    }
}



let isMobile = navigator.userAgentData && navigator.userAgentData.mobile;
if (isMobile || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.body.classList.add('mobile');
    isMobile = true;
}


const commission_types = {
    MONEY: "Money",
    DISCORD_NITRO: "Nitro",
    DISCORD_COLLECTIBLES: "Discord Shop Items",
    STEAM_GIFTS: "Steam Gifts",
    KOFI: "Ko-fi Donations",
    NEGOTIABLE: "Payment is negotiable.",
};

const modal_types = {
    DECOR: 0,
    CATEGORY: 1,
    USER: 3
}

const urls = {
    CDN: "https://jellys-space.github.io/cdn/" // The cdn link that assets will use (makes it esier to change if you wanted to use cdn.jellys-space.vip)
};

const notFoundHTMLContent = `
    <img src="${urls.CDN}/assets/jelly404.png" alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
    <div class="text-block center">
        <h2>404</h2>
        <p>You've taken a wrong turn, and ended up in a place far, far away...</p>
        <p>:/</p>
    </div>
`;


// Fake API / Database responses

// The image urls that will be randomly picked for the home page "Decors" homenav button
const marketing = [
    `${urls.CDN}/decors/camille%20healing.png`,
    `${urls.CDN}/decors/Xiva.png`,
    `${urls.CDN}/decors/Huxleys%20Myst.png`,
    `${urls.CDN}/decors/axoblue.png`,
    `${urls.CDN}/decors/baron.png`,
    `${urls.CDN}/decors/gemstonepink.png`,
    `${urls.CDN}/decors/giratina.png`,
    `${urls.CDN}/decors/geometric.png`,
    `${urls.CDN}/decors/jellys.png`,
    `${urls.CDN}/decors/layla_skill.png`,
    `${urls.CDN}/decors/leavesmagenta.png`,
    `${urls.CDN}/decors/nyancat.png`,
    `${urls.CDN}/decors/pinkknife.png`,
    `${urls.CDN}/decors/protoss.png`,
    `${urls.CDN}/decors/purple-glow.png`,
    `${urls.CDN}/decors/radbolts.png`,
    `${urls.CDN}/decors/retrocar.png`,
    `${urls.CDN}/decors/ribbonpink.png`,
    `${urls.CDN}/decors/roly%20poly.png`,
    `${urls.CDN}/decors/kirara-skill.png`,
    `${urls.CDN}/decors/leavesautumn.png`,
    `${urls.CDN}/decors/shuriken.png`,
    `${urls.CDN}/decors/daggers.png`,
    `${urls.CDN}/decors/dark%20fountain.png`,
    `${urls.CDN}/decors/daggers.png`,
    `${urls.CDN}/decors/daggers.png`,
    `${urls.CDN}/decors/daggers.png`,
    `${urls.CDN}/decors/daggers.png`,
    `${urls.CDN}/decors/daggers.png`,
];


// List of artists

// id: the users discord id
// name: The users discord username (or just a name they want)
// listed: true: the artist is listed in the artists tab. false: the artist is not listed in the artists tab
// assets: for the avatar and banner, put the asset id (e.g <asset>-avatar.png) and "-avatar.png", "-avatar.webm", "-banner.png" and "-banner.webm" will be automatically added when rendering the assets on the client
// colors: atm the "primary" color is only used for the back of the artists modal
// commissions: what forms of payment the user accepts for commissions
const artists = [

    // Misc / Testing artists 
    {
        id: "1",
        name: "Unknown User",
        assets: null,
        sumarry: `This is an Unknown User.`,
        colors: {
            primary: "#ccb75aff"
        },
        commissions: [],
        listed: false
    },
    {
        id: "2",
        name: "The Decor Community",
        assets: null,
        sumarry: `This is a user to use when multiple artists have worked on a category.`,
        colors: {
            primary: "#ccb75aff"
        },
        commissions: [],
        listed: false
    },

    // Artists that show up on the artists page
    {
        id: "1147940825330876538",
        name: "Jelly",
        assets: {
            avatar: {
                asset: "jelly",
                animated: false
            },
            banner: {
                asset: "jelly",
                animated: true
            }
        },
        sumarry: `Founder of this website.\nI created the Pokéball Decors, the Abstract category and a few uncategorized Decors.\nLet it be known that coding this site destroyed my one and only braincell.\nIt was a labor of love!\nMwah~`,
        colors: {
            primary: "#4fe9e1"
        },
        commissions: []
    },
    {
        id: "334062444718587905",
        name: "Seele",
        assets: {
            avatar: {
                asset: "seele",
                animated: true
            },
            banner: {
                asset: "seele",
                animated: true
            }
        },
        sumarry: `I like to draw woman\nand animate them in After Effects Afterwards.`,
        colors: {
            primary: "#515151"
        },
        commissions: [
            {
                "type": "MONEY",
                "link": null
            },
            {
                "type": "DISCORD_NITRO",
                "link": null
            }
        ]
    },
    {
        id: "995651435519815772",
        name: "Ca-Cawthon",
        assets: {
            avatar: {
                asset: "cacawthon",
                animated: false
            },
            banner: {
                asset: "cacawthon",
                animated: false
            }
        },
        sumarry: `Heyo all! The name's Cawthon.\nI am the creator of the Flavor Foley set and hopefully more to come.\nI go by they/them and I'm quite the introvert.`,
        colors: {
            primary: "#f52f6a"
        },
        commissions: [
            {
                "type": "DISCORD_NITRO",
                "link": null
            }
        ]
    },
    {
        id: "1143994313034960967",
        name: "Nuki",
        assets: {
            avatar: {
                asset: "nuki",
                animated: false
            },
            banner: {
                asset: "nuki",
                animated: false
            }
        },
        sumarry: `Hi !! ♡ I'm Nuki, i go by she/they !!\ni'm a person with half a braincell\nxavvi a valorant player`,
        colors: {
            primary: "#893f79"
        },
        commissions: []
    },
    {
        id: "1187559332703899708",
        name: "Serenemist",
        assets: {
            avatar: {
                asset: "serenemist",
                animated: false
            },
            banner: {
                asset: "serenemist",
                animated: false
            }
        },
        sumarry: `haii !!! my name's serene and i also go by mist ^_^\ni am the creator of a few sets such as\nSky Dreams, Kitsune Appearings, Petting Zoo, Horns and the TBHK set!\nhttps://serenemist.carrd.co/`,
        colors: {
            primary: "#cdffeb"
        },
        commissions: []
    },
    {
        id: "1096831760089763860",
        name: "Alide",
        assets: {
            avatar: {
                asset: "alide",
                animated: false
            },
            banner: {
                asset: "alide",
                animated: false
            }
        },
        sumarry: `Hai!!! My name is alide and i go by she/her, im a big fan of the colour pink 🩷\nhttps://alidewashere.straw.page/`,
        colors: {
            primary: "#ffdcb4"
        },
        commissions: [
            {
                "type": "DISCORD_NITRO",
                "link": null
            },
            {
                "type": "DISCORD_COLLECTIBLES",
                "link": null
            }
        ]
    },
    {
        id: "811114235966521364",
        name: "CallieVD",
        assets: {
            avatar: {
                asset: "cal",
                animated: false
            },
            banner: {
                asset: "cal",
                animated: false
            }
        },
        sumarry: `hi, i'm cal! i'm just a weird lil' guy and i make things sometimes :3\nhttps://ibtvtuo.carrd.co/\nhttps://ko-fi.com/callievd`,
        colors: {
            primary: "#89ffbe"
        },
        commissions: [
            {
                "type": "KOFI",
                "link": "https://ko-fi.com/c/6d9b88bc51"
            }
        ]
    },
    {
        id: "1104844219094401215",
        name: "Random Phineaszem",
        assets: {
            avatar: {
                asset: "phineas",
                animated: false
            },
            banner: {
                asset: "phineas",
                animated: false
            }
        },
        sumarry: `Hello I'm RandomPhineaszem\nPolish Decor Creator And Dubbinger, I Love Books Over Scott Pilgrim, I Am DVD Collector, The Most Dangerous Person In Society, I Like Doing Videos.\nI Have A Specific Sense Of Humor Like Haha Gore, And My Fav Games Are Undertale-Deltarune Cookie Run Kingdom And FNF\nhttps://www.youtube.com/@Random_Phineaszem`,
        colors: {
            primary: "#c8e1ff"
        },
        commissions: [
            {
                "type": "KOFI",
                "link": "https://ko-fi.com/c/6d9b88bc51"
            }
        ]
    },
    {
        id: "1031549301001814059",
        name: "Shadow",
        assets: {
            avatar: {
                asset: "shadow",
                animated: false
            },
            banner: {
                asset: "shadow",
                animated: false
            }
        },
        sumarry: `Hi, I'm Shadow, a guy who make games and arts.\nAnd kinda obsessed with the Sonic franchise.`,
        colors: {
            primary: "#969696"
        },
        commissions: []
    },
    {
        id: "855561944257789973",
        name: "Palco",
        assets: {
            avatar: {
                asset: "palco",
                animated: false
            },
            banner: {
                asset: "palco",
                animated: false
            }
        },
        sumarry: `haiiiii i draw pizza tower art!!!\ni work on alot of pizza tower projects!!\nbaii!!`,
        colors: {
            primary: "#ffca84"
        },
        commissions: []
    },
    {
        id: "1139815872874172456",
        name: "Foxy",
        assets: {
            avatar: {
                asset: "foxy",
                animated: false
            },
            banner: {
                asset: "foxy",
                animated: false
            }
        },
        sumarry: `Helloo im Foxy!!\ni love vocaloid and pjsk and im a both tradi and digi artist\n(〃＾▽＾〃)o\nmy pronouns are she/her and im ambivert ehe..\nhttps://foooooxy.straw.page/`,
        colors: {
            primary: "#ffc0cb"
        },
        commissions: []
    },
    {
        id: "808325271949934652",
        name: "T8dy1",
        assets: {
            avatar: {
                asset: "t8dy1",
                animated: false
            },
            banner: {
                asset: "t8dy1",
                animated: false
            }
        },
        sumarry: `Hi, I'm T8dyi and I like video editing and other things revolving around graphical design etc,\nalso like photography, cars and Star Wars 😊`,
        colors: {
            primary: "#474747"
        },
        commissions: [
            {
                "type": "STEAM_GIFT",
                "link": null
            },
            {
                "type": "DISCORD_COLLECTIBLES",
                "link": null
            }
        ]
    },
    {
        id: "1088105926030000178",
        name: "Sharr",
        assets: {
            avatar: {
                asset: "sharr",
                animated: false
            },
            banner: {
                asset: "sharr",
                animated: false
            }
        },
        sumarry: `Hi, I'm Sharr!\nI'm a huge fan of the Bloons game series and absolutely love Vocaloid~\n♡ (＾▽＾)`,
        colors: {
            primary: "#96f8ff"
        },
        commissions: [
            {
                "type": "DISCORD_NITRO",
                "link": null
            },
            {
                "type": "DISCORD_COLLECTIBLES",
                "link": null
            }
        ]
    },
    {
        id: "452679089929846784",
        name: "Zin",
        assets: {
            avatar: {
                asset: "zin",
                animated: false
            },
            banner: {
                asset: "zin",
                animated: false
            }
        },
        sumarry: `Hihi Im Zin or Z for short, the creator of the Genshin Impact decors and most of the Jelly images you see on the website.\nI plan on 2 batches in the near future so look out for those !!\nI do commission work for decors I feel comfortable doing, like genshin characters i havent put onto the website like Columbina or Varesa.\nZenless Zone Zero, Honkai Star Rail, Wuthering Waves, and Neverness To Everness are in my future todo lists, but im willing to do commission for those games as well, depending on difficulty ^^`,
        colors: {
            primary: "#72ff77"
        },
        commissions: [
            {
                "type": "NEGOTIABLE",
                "link": null
            }
        ]
    },
    {
        id: "1033224131795243008",
        name: "Doger",
        assets: {
            avatar: {
                asset: "doger",
                animated: false
            },
            banner: {
                asset: "doger",
                animated: false
            }
        },
        sumarry: `Hello! im Doger.\nCurrently a big vr addict and someone who enjoys to draw alot with their computer mouse for some reason, if you dont know i dont too.\nhttps://www.roblox.com/users/1790186904/profile`,
        colors: {
            primary: "#ffc896"
        },
        commissions: []
    },
    {
        id: "995598255612239884",
        name: "Prince",
        assets: {
            avatar: {
                asset: "prince",
                animated: false
            },
            banner: {
                asset: "prince",
                animated: false
            }
        },
        sumarry: `Hey hey, I'm Prince!\nI'm a self-taught hyper-realistic artist skilled in traditional and digital mediums.\nWhile I enjoy working on various other skills,\nart always takes the top spot ^ ^\n..well i like to help others, u jus have to dm me XD`,
        colors: {
            primary: "#b6b6b6"
        },
        commissions: []
    },
    {
        id: "599654027764039690",
        name: "Xavvi",
        assets: {
            avatar: {
                asset: "xavvi",
                animated: false
            },
            banner: {
                asset: "xavvi",
                animated: false
            }
        },
        sumarry: `hi im xavi (^^)/\ni do art but not crazy into it\nim into persona 3, doom, scott pilgrim and omori (also any fps shooter game tbh)\nhttps://www.roblox.com/users/470642084/profile\nhttps://x.com/notxavvi`,
        colors: {
            primary: "#78ff88"
        },
        commissions: []
    },
    {
        id: "1071722654723219587",
        name: "Nexell",
        assets: {
            avatar: {
                asset: "nexell",
                animated: false
            },
            banner: {
                asset: "nexell",
                animated: false
            }
        },
        sumarry: `Hi, I'm Nexell! :3\nI use Blender to make the Neon set.\nhttps://linktr.ee/nebvlamusic`,
        colors: {
            primary: "#831b5f"
        },
        commissions: []
    },
    {
        id: "1039595490238529606",
        name: "Sharsame",
        assets: {
            avatar: {
                asset: "sharsame",
                animated: false
            },
            banner: {
                asset: "sharsame",
                animated: false
            }
        },
        sumarry: `HALLO!! im sharsame\ni like producing music, making art and animating!!!! :P\nhttps://www.tiktok.com/@sharsamee\nhttps://youtube.com/@exdeedeedee`,
        colors: {
            primary: "#7edbfd"
        },
        commissions: []
    },
    {
        id: "323205750262595595",
        name: "Jenku",
        assets: {
            avatar: {
                asset: "jenku",
                animated: false
            },
            banner: {
                asset: "jenku",
                animated: false
            }
        },
        sumarry: `hiiiii im jenku\ni do uh, a lot of different stuff; art, web&bot development, vtube rigging, 3d modelling etcetera etcetera and am planning on studying physics, computer science and design engineering!\nOh also I collect nintendo consoles.\ni also have a couple of presets here and in the actual plugin!\nmy interests are all over the place: mainly nintendo, ultrakill and portal\ncurrently playing through deltarune!!\nmy site is https://jenku.xyz/, more info about me there !!\nhttps://decor.jenku.xyz/ (decor faq) and https://theme.jenku.xyz/ (mobile discord theme maker)`,
        colors: {
            primary: "#ff6ee6"
        },
        commissions: []
    },
    {
        id: "713791218160500796",
        name: "GlassConsumer69",
        assets: {
            avatar: {
                asset: "glassconsumer",
                animated: false
            },
            banner: {
                asset: "glassconsumer",
                animated: false
            }
        },
        sumarry: `Hi, I'm Glass.\nI draw mostly fan-art for stickers or commissions, but am also currently working on animating my own show.\nI made the Oxygen not included, Starcraft II, and Axolotl decors on the website,\nas well as the Hotline Miami pack available through the presets in vencord.\nhttps://www.redbubble.com/people/LetsEatGlass69/shop\nhttps://glassconsumer69.newgrounds.com/\nhttps://www.tumblr.com/blog/glasseeater`,
        colors: {
            primary: "#3aa9f8"
        },
        commissions: []
    },

    // Artists that don't show up on the artists page
    {
        id: "434037775092809730",
        name: "Rainydaysout",
        listed: false
    },
    {
        id: "1199872963575550022",
        name: "Fishy",
        listed: false
    },
    {
        id: "929363923822596167",
        name: "GFNAF",
        listed: false
    },
    {
        id: "1037013172114182234",
        name: "dio._.brando.",
        listed: false
    },
    {
        id: "516709524829110322",
        name: "Beep.Boop.The.Bot",
        listed: false
    },
    {
        id: "937055290166239263",
        name: "The Crushing One",
        listed: false
    },
    {
        id: "902661352680751144",
        name: "PNG",
        listed: false
    },
    {
        id: "272359106839314446",
        name: "KURAMA",
        listed: false
    },
    {
        id: "217590527015518209",
        name: "(Niko)",
        listed: false
    },
    {
        id: "1169709406930350191",
        name: "Wahoo",
        listed: false
    },
    {
        id: "760501309937287260",
        name: "x.zii",
        listed: false
    },
    {
        id: "975582903557836820",
        name: "bpdlaios",
        listed: false
    },
    {
        id: "773625796807360563",
        name: "Katsu",
        listed: false
    },
    {
        id: "1097272848583770212",
        name: "Kyu",
        listed: false
    },
    {
        id: "555409394297339936",
        name: 'Little Glimbo',
        listed: false
    },
    {
        id: "1062953673610772480",
        name: 'Clockwork',
        listed: false,
        commissions: [
            {
                "type": "MONEY",
                "link": null
            },
            {
                "type": "STEAM_GIFTS",
                "link": null
            }
        ]
    },
    {
        id: "1244775245966086245",
        name: 'Duality',
        listed: false
    },
    {
        id: "710255469519831050",
        name: "ostensiblyrain",
        listed: false
    },
    {
        id: "1364263466000584764",
        name: "Hyst",
        listed: false
    },
    {
        id: "1317653030652608558",
        name: "reese",
        listed: false
    },
    {
        id: "1358056472809832688",
        name: "Alli",
        listed: false
    },
    {
        id: "1349840616103612428",
        name: "ICAN_AU",
        listed: false
    },
    {
        id: "1298495520423149609",
        name: "Hailey",
        listed: false
    },
    {
        id: "1106968627036557322",
        name: "Nype",
        listed: false
    },
    {
        id: "1167490687789449290",
        name: "Subspace",
        listed: false
    },
];

const categories = [
    {
        "name": "Fate Trigger",
        "banner": "fatetrigger-banner.png",
        "artist_info": `Join the Fate Trigger Discord at <strong><a href="https://discord.gg/fatetrigger" target="_blank" rel="noopener" class="commission-link">this link</a></strong>.`,
        "artists": [
            findUser('334062444718587905')
        ],
        "decorations": [
            {
                "name": "Xiva",
                "asset": "Xiva.png"
            },
            {
                "name": "Camille Healing",
                "asset": "camille healing.png"
            },
            {
                "name": "Huxleys Myst",
                "asset": "Huxleys Myst.png"
            }
        ]
    },
    {
        "name": "Deltarune",
        "banner": "deltarune-banner.png",
        "artist_info": null,
        "artists": [
            findUser('323205750262595595'),
            findUser('995651435519815772')
        ],
        "decorations": [
            {
                "name": "[[HEARTSHAPEDOBJECT]]",
                "artist": findUser('323205750262595595'),
                "asset": "[[HEARTSHAPEDOBJECT]].png"
            },
            {
                "name": "a horned headband, its said to make you more monsterlike",
                "artist": findUser('323205750262595595'),
                "asset": "a horned headband, its said to make you more monsterlike.png"
            },
            {
                "name": "Battle UI",
                "artist": findUser('323205750262595595'),
                "asset": "battle ui.png"
            },
            {
                "name": "BECOMED [[NEO]]",
                "artist": findUser('323205750262595595'),
                "asset": "BECOMED [[NEO]].PNG"
            },
            {
                "name": "Castle Town",
                "artist": findUser('323205750262595595'),
                "asset": "castle town.png"
            },
            {
                "name": "CHAOS CHAOS",
                "artist": findUser('323205750262595595'),
                "asset": "CHAOS CHAOS.PNG"
            },
            {
                "name": "CYBERS WORLD",
                "artist": findUser('323205750262595595'),
                "asset": "CYBERS WORLD.png"
            },
            {
                "name": "Dark Fountain",
                "artist": findUser('323205750262595595'),
                "asset": "dark fountain.png"
            },
            {
                "name": "DEALMAKER[]PUPPETSCARF",
                "artist": findUser('323205750262595595'),
                "asset": "DEALMAKER[]PUPPETSCARF.png"
            },
            {
                "name": "DEVILSKNIFE[]JEVILSTAIL",
                "artist": findUser('323205750262595595'),
                "asset": "DEVILSKNIFE[]JEVILSTAIL.png"
            },
            {
                "name": "FINDHER",
                "artist": findUser('323205750262595595'),
                "asset": "FINDHER.PNG"
            },
            {
                "name": "Friend Inside Me",
                "artist": findUser('323205750262595595'),
                "asset": "friend inside me.png"
            },
            {
                "name": "Game Gear",
                "artist": findUser('323205750262595595'),
                "asset": "game gear.PNG"
            },
            {
                "name": "Geen Pippins",
                "artist": findUser('323205750262595595'),
                "asset": "geen pippins.png"
            },
            {
                "name": "GONER",
                "artist": findUser('323205750262595595'),
                "asset": "GONER.png"
            },
            {
                "name": "Im Old",
                "artist": findUser('323205750262595595'),
                "asset": "Im Old.PNG"
            },
            {
                "name": "Mantle fit for a King",
                "artist": findUser('323205750262595595'),
                "asset": "mantle fit for a king.png"
            },
            {
                "name": "No one will shed a tear for him",
                "artist": findUser('323205750262595595'),
                "asset": "no one will shed a tear for him.png"
            },
            {
                "name": "Photon Readings Negative",
                "artist": findUser('323205750262595595'),
                "asset": "photon readings negative.png"
            },
            {
                "name": "Piano that might have a few keys missing",
                "artist": findUser('323205750262595595'),
                "asset": "piano that might have a few keys missing.png"
            },
            {
                "name": "Pluey",
                "artist": findUser('323205750262595595'),
                "asset": "pluey.png"
            },
            {
                "name": "Prince from the dark",
                "artist": findUser('323205750262595595'),
                "asset": "princefromthedark.png"
            },
            {
                "name": "Quiet Study",
                "artist": findUser('323205750262595595'),
                "asset": "quiet study.png"
            },
            {
                "name": "Ralsei Hat",
                "artist": findUser('323205750262595595'),
                "asset": "ralsei hat.png"
            },
            {
                "name": "Ralsei No Hat",
                "artist": findUser('323205750262595595'),
                "asset": "ralsei no hat.png"
            },
            {
                "name": "Red Pippins",
                "artist": findUser('323205750262595595'),
                "asset": "red pippins.png"
            },
            {
                "name": "Snow",
                "artist": findUser('323205750262595595'),
                "asset": "snow.png"
            },
            {
                "name": "SWOON",
                "artist": findUser('323205750262595595'),
                "asset": "SWOON.png"
            },
            {
                "name": "Tenna",
                "artist": findUser('323205750262595595'),
                "asset": "tenna.png"
            },
            {
                "name": "THE CAGE",
                "artist": findUser('323205750262595595'),
                "asset": "THE CAGE.PNG"
            },
            {
                "name": "THEYLL SEE THE TAIL OF HELL TAKE CRAWL",
                "artist": findUser('323205750262595595'),
                "asset": "THEYLL SEE THE TAIL OF HELL TAKE CRAWL.PNG"
            },
            {
                "name": "Roaring Knight",
                "artist": findUser('995651435519815772'),
                "asset": "Roaring Knight (cawthon).png"
            },
            {
                "name": "Watercooler",
                "artist": findUser('995651435519815772'),
                "asset": "Watercooler (cawthon).png"
            },
            {
                "name": "Newborn Titan",
                "artist": findUser('995651435519815772'),
                "asset": "Newborn Titan (Cawthon).png"
            },
            {
                "name": "The Weather Sticks Together",
                "artist": findUser('995651435519815772'),
                "asset": "The Weather Sticks Together (cawthon).png"
            },
            {
                "name": "Lanino",
                "artist": findUser('995651435519815772'),
                "asset": "Lanino (cawthon).png"
            },
            {
                "name": "Shuttah",
                "artist": findUser('995651435519815772'),
                "asset": "Shuttah (cawthon).png"
            },
            {
                "name": "Tenna Secondary Option",
                "artist": findUser('995651435519815772'),
                "asset": "Tenna Secondary Option (cawthon).png"
            },
            {
                "name": "ERAM",
                "artist": findUser('995651435519815772'),
                "asset": "ERAM ( cawthon).png"
            },
            {
                "name": "Elnina",
                "artist": findUser('995651435519815772'),
                "asset": "Elnina (cawthon).png"
            },
            {
                "name": "Knight Gerson",
                "artist": findUser('995651435519815772'),
                "asset": "Knight Gerson (cawthon).png"
            },
            {
                "name": "Lightners Live Kris",
                "artist": findUser('995651435519815772'),
                "asset": "Lightners Live Kris (cawthon).png"
            },
            {
                "name": "Lightners Live Susie",
                "artist": findUser('995651435519815772'),
                "asset": "Lightners Live Susie (cawthon).png"
            },
            {
                "name": "Lighters Live Ralsei",
                "artist": findUser('995651435519815772'),
                "asset": "Lighters Live Ralsei (cawthon).png"
            },
            {
                "name": "Laser Pointere",
                "artist": findUser('995651435519815772'),
                "asset": "Laser Pointere (cawthon).png"
            },
        ]
    },
    {
        "name": "Hollow Knight",
        "banner": "placeholder-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1167490687789449290'),
            findUser('995651435519815772'),
        ],
        "decorations": [
            {
                "name": "Hollow Knight UI",
                "artist": findUser('1167490687789449290'),
                "asset": "theknightthing.png"
            },
            {
                "name": "Silksong UI",
                "artist": findUser('1167490687789449290'),
                "asset": "hornetthing.png"
            },
            {
                "name": "Frog Guy",
                "artist": findUser('995651435519815772'),
                "asset": "frog guy.png"
            },
            {
                "name": "Ass Jim",
                "artist": findUser('995651435519815772'),
                "asset": "ass jim.png"
            },
            {
                "name": "Hornet",
                "artist": findUser('995651435519815772'),
                "asset": "hornet.png"
            },
            {
                "name": "Moss Mother",
                "artist": findUser('995651435519815772'),
                "asset": "moss mother.png"
            },
        ]
    },
    {
        "name": "Kawaii Gamer Girl",
        "banner": "kawaii-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1143994313034960967')
        ],
        "decorations": [
            {
                "name": "Controller",
                "asset": "controller.png"
            },
            {
                "name": "Error",
                "asset": "error.png"
            },
            {
                "name": "Tamagotchi",
                "asset": "tamagotchi.png"
            },
            {
                "name": "Lives",
                "asset": "lives.png"
            },
            {
                "name": "Headphones",
                "asset": "headphones.png"
            },
            {
                "name": "Mouse",
                "asset": "mouse.png"
            },
        ]
    },
    {
        "name": "A Frog's Life",
        "banner": "a-frog-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1143994313034960967')
        ],
        "decorations": [
            {
                "name": "Gardening",
                "asset": "gardening.png"
            },
            {
                "name": "Lillypad",
                "asset": "lillypad.png"
            },
            {
                "name": "Mlem",
                "asset": "mlem.png"
            },
            {
                "name": "Raindrop",
                "asset": "raindrop.png"
            },
            {
                "name": "Rainy Day",
                "asset": "rainy day.png"
            },
            {
                "name": "Smiles",
                "asset": "smiles.png"
            },
        ]
    },
    {
        "name": "Spider Man",
        "banner": "spiderman-banner.png",
        "artist_info": null,
        "artists": [
            findUser('995598255612239884')
        ],
        "decorations": [
            {
                "name": "Peter Porker",
                "asset": "peter Porker decor.png"
            },
            {
                "name": "Graffiti Spider Logo",
                "asset": "graffiti spider logo.png"
            },
            {
                "name": "Miguel o Hara (Spider-Man 2099)",
                "asset": "Miguel o hara (spiderman 2099) decor.png"
            },
            {
                "name": "Miles Morales",
                "asset": "miles morales decor.png"
            },
            {
                "name": "Pavitr Prabhakar",
                "asset": "Pavitr prabhakar decor.png"
            },
            {
                "name": "Peni Parker Mech",
                "asset": "peni parker mech decor.png"
            },
            {
                "name": "Spider Gwen",
                "asset": "spider Gwen decor.png"
            },
            {
                "name": "Spider Noir",
                "asset": "spider noir decor.png"
            },
            {
                "name": "Spider Punk",
                "asset": "spider punk decor.png"
            },
        ]
    },
    {
        "name": "Red Bull",
        "banner": "redbull-banner.png",
        "artist_info": null,
        "artists": [
            findUser('995598255612239884')
        ],
        "decorations": [
            {
                "name": "Red Bull gives u wing",
                "asset": "Red bull gives u wing.png"
            },
            {
                "name": "Red Bull Normal",
                "asset": "Red bull normal.png"
            },
            {
                "name": "Red Bull Amber Edition",
                "asset": "Red bull amber edition.png"
            },
            {
                "name": "Red Bull Green (dragonfruit) Edition",
                "asset": "Red bull green (dragonfruit) edition.png"
            },
            {
                "name": "Red Bull Green Edition",
                "asset": "Red bull green edition.png"
            },
            {
                "name": "Red Bull Pink Edition",
                "asset": "Red bull pink edition.png"
            },
            {
                "name": "Red Bull Purple Edition",
                "asset": "Red bull purple edition.png"
            },
            {
                "name": "Red Bull Red Edition",
                "asset": "Red bull red edition.png"
            },
            {
                "name": "Red Bull Sea Blue Edition",
                "asset": "Red bull sea blue edition.png"
            },
            {
                "name": "Red Bull Spring Edition",
                "asset": "Red bull spring edition.png"
            },
            {
                "name": "Red Bull White Edition",
                "asset": "Red bull white edition.png"
            },
            {
                "name": "Red Bull Yellow Edition",
                "asset": "Red bull yellow edition.png"
            },
            {
                "name": "Red Bull Blue Edition",
                "asset": "Red bull blue edition.png"
            },
        ]
    },
    {
        "name": "PuyoPuyo",
        "banner": "puyo-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1199872963575550022')
        ],
        "decorations": [
            {
                "name": "Amitie Cap",
                "asset": "amitiecap.png"
            },
            {
                "name": "Amitie Hat",
                "asset": "amitiehat.png"
            },
            {
                "name": "Draco Horns",
                "asset": "dracohorns.png"
            },
            {
                "name": "Rulue",
                "asset": "rulue.png"
            },
            {
                "name": "Shigu",
                "asset": "shigu.png"
            },
        ]
    },
    {
        "name": "Baba is you",
        "banner": "baba-banner.png",
        "artist_info": null,
        "artists": [
            findUser('555409394297339936')
        ],
        "decorations": [
            {
                "name": "Avatar Is You",
                "asset": "avatarisyou.png"
            },
            {
                "name": "Avitur Be U",
                "asset": "aviturbeu.png"
            },
            {
                "name": "Power",
                "asset": "babapower.png"
            },
            {
                "name": "Sad",
                "asset": "sad.png"
            },
            {
                "name": "Sleep",
                "asset": "sleep.png"
            },
            {
                "name": "Win",
                "asset": "win.png"
            },
        ]
    },
    {
        "name": "Just Shapes & Beats",
        "banner": "jsab-banner.png",
        "artist_info": null,
        "artists": [
            findUser('995651435519815772')
        ],
        "decorations": [
            {
                "name": "Annihilation 1",
                "asset": "Annihilation 1.png"
            },
            {
                "name": "Annihilation 2",
                "asset": "Annihilation 2.png"
            },
            {
                "name": "Barracuda",
                "asset": "Barracuda.png"
            },
            {
                "name": "Boat",
                "asset": "Boat.png"
            },
            {
                "name": "Close To Me Claws",
                "asset": "Close To Me Claws.png"
            },
            {
                "name": "Friend",
                "asset": "Friend.png"
            },
            {
                "name": "Helicopter Love",
                "asset": "Helicopter Love.png"
            },
            {
                "name": "JSAB Bird",
                "asset": "JSAB Bird.png"
            },
            {
                "name": "The Boss",
                "asset": "The Boss.png"
            },
            {
                "name": "The Boss (Phase 2)",
                "asset": "The Boss (Phase 2).png"
            },
        ]
    },
    {
        "name": "Clown Doodles",
        "banner": "clown-banner.png",
        "artist_info": null,
        "artists": [
            findUser('811114235966521364')
        ],
        "decorations": [
            {
                "name": "Black & White Clown",
                "asset": "b_w clown.png"
            },
            {
                "name": "Black & White Inverted Clown",
                "asset": "b_w inverted.png"
            },
            {
                "name": "Dark Blue Clown",
                "asset": "dark blue clown.png"
            },
            {
                "name": "Light Blue Clown",
                "asset": "light blue clown.png"
            },
            {
                "name": "Yellow Clown",
                "asset": "yellow clown.png"
            },
            {
                "name": "Orange Clown",
                "asset": "orange clown.png"
            },
            {
                "name": "Pink Clown",
                "asset": "pink clown.png"
            },
            {
                "name": "Purple Clown",
                "asset": "purple clown.png"
            },
            {
                "name": "Green Clown",
                "asset": "green clown.png"
            },
            {
                "name": "Red Clown",
                "asset": "red clown.png"
            },
            {
                "name": "Rainbow Clown",
                "asset": "rainbow clown.png"
            },
        ]
    },
    {
        "name": "Pizza Tower V2",
        "banner": "pizzatower2-banner.png",
        "artist_info": null,
        "artists": [
            findUser('555409394297339936')
        ],
        "decorations": [
            {
                "name": "Doise",
                "asset": "doise.png"
            },
            {
                "name": "Noise",
                "asset": "noise.png"
            },
            {
                "name": "Forest15",
                "asset": "forest15.png"
            },
            {
                "name": "Peppino",
                "asset": "peppino.png"
            },
            {
                "name": "Pizza Face",
                "asset": "pizzaface.png"
            },
            {
                "name": "Pizza Head",
                "asset": "pizzahead.png"
            },
            {
                "name": "Secret Eye",
                "asset": "secreteye.png"
            },
            {
                "name": "Vigilante",
                "asset": "vigilante.png"
            },
        ]
    },
    {
        "name": "Achievement Unlocked",
        "banner": "achievement-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1062953673610772480')
        ],
        "decorations": [
            {
                "name": "Bubble Bundle",
                "asset": "bubble bundle.png"
            },
            {
                "name": "Cassette Beasts",
                "asset": "cassette beasts.png"
            },
            {
                "name": "Elden Ring",
                "asset": "elden ring.png"
            },
            {
                "name": "GBA-Revile",
                "asset": "GBA-revile.png"
            },
            {
                "name": "Green Grid",
                "asset": "green grid.png"
            },
            {
                "name": "Halo CE UI",
                "asset": "Halo CE ui.png"
            },
            {
                "name": "MCPE UI",
                "asset": "MC pocket ui.png"
            },
            {
                "name": "MCJE UI",
                "asset": "MC ui.png"
            },
            {
                "name": "Minecraft",
                "asset": "MC.png"
            },
            {
                "name": "NES Game",
                "asset": "NES game.png"
            },
            {
                "name": "Omori Battle Party UI",
                "asset": "omori battle party ui.png"
            },
            {
                "name": "P3R Battle Party UI",
                "asset": "p3r battle party UI.png"
            },
            {
                "name": "P3R Battle UI",
                "asset": "p3r battle ui.png"
            },
            {
                "name": "P3R Social Link",
                "asset": "p3r social link.png"
            },
            {
                "name": "P4R Battle UI (Cayman Roader Concept)",
                "asset": "p4r battle ui (cayman roader concept).png"
            },
            {
                "name": "P4R Battle UI (Own Concept)",
                "asset": "p4r battle UI (own concept).png"
            },
            {
                "name": "P5R Social Link",
                "asset": "p5r social link.png"
            },
            {
                "name": "Purple Starforge",
                "asset": "purple starforge.png"
            },
            {
                "name": "Rick Astley (Get Rick Roll'd lol)",
                "asset": "rick astley.png"
            },
            {
                "name": "Rounded Outline",
                "asset": "rounded outline.png"
            },
            {
                "name": "Space Thingy",
                "asset": "space thingy idk.png"
            },
            {
                "name": "The Thing Guy",
                "asset": "the thing guy.png"
            },
            {
                "name": "Ugly Glass",
                "asset": "uglyglass.png"
            },
            {
                "name": "Windows Selection",
                "asset": "win-selection.png"
            },
            {
                "name": "Your Only Move Is Hustle",
                "asset": "your only move is hustle.png"
            },
        ]
    },
    {
        "name": "Neon Animals",
        "banner": "neonanimals-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1244775245966086245')
        ],
        "decorations": [
            {
                "name": "Neon Bear Blue",
                "asset": "Neon bear blue !.png"
            },
            {
                "name": "Neon Bear Glow",
                "asset": "Neon bear glow !.png"
            },
            {
                "name": "Neon Bear Green",
                "asset": "Neon bear green !.png"
            },
            {
                "name": "Neon Bear Purple",
                "asset": "Neon bear purple !.png"
            },
            {
                "name": "Neon Bear Red",
                "asset": "Neon bear red !.png"
            },
            {
                "name": "Neon Bunny Blue",
                "asset": "Neon bunny blue !.png"
            },
            {
                "name": "Neon Bunny Glow",
                "asset": "Neon bunny glow !.png"
            },
            {
                "name": "Neon Bunny Green",
                "asset": "Neon bunny green !"
            },
            {
                "name": "Neon Bunny Purple",
                "asset": "Neon bunny purple !.png"
            },
            {
                "name": "Neon Bunny Red",
                "asset": "Neon bunny red !.png"
            },
            {
                "name": "Neon Demon Blue",
                "asset": "Neon demon blue !.png"
            },
            {
                "name": "Neon Demon Glow",
                "asset": "Neon demon glow  !.png"
            },
            {
                "name": "Neon Demon Green",
                "asset": "Neon demon green !.png"
            },
            {
                "name": "Neon Demon Purple",
                "asset": "Neon demon purple !.png"
            },
            {
                "name": "Neon Demon Red",
                "asset": "Neon demon red !.png"
            },
            {
                "name": "Neon Kitty Blue",
                "asset": "Neon kitty blue !.png"
            },
            {
                "name": "Neon Kitty Glow",
                "asset": "Neon kitty glow !.png"
            },
            {
                "name": "Neon Kitty Green",
                "asset": "Neon kitty green !.png"
            },
            {
                "name": "Neon Kitty Purple",
                "asset": "Neon purple kitty !.png"
            },
            {
                "name": "Neon Kitty Red",
                "asset": "Neon kitty red !.png"
            },
            {
                "name": "Neon Puppy Blue",
                "asset": "Neon puppy blue !.png"
            },
            {
                "name": "Neon Puppy Glow",
                "asset": "Neon puppy glow !.png"
            },
            {
                "name": "UNeon Puppy Green",
                "asset": "Neon puppy green !.png"
            },
            {
                "name": "Neon Puppy Purple",
                "asset": "Neon puppy purple !.png"
            },
            {
                "name": "Neon Puppy Red",
                "asset": "Neon puppy red !.png"
            },
        ]
    },
    {
        "name": "World Ralley Championship",
        "banner": "wrc-banner.png",
        "artist_info": null,
        "artists": [
            findUser('808325271949934652')
        ],
        "decorations": [
            {
                "name": "AF16",
                "asset": "AF16.png"
            },
            {
                "name": "EE33",
                "asset": "EE33.png"
            },
            {
                "name": "SO17",
                "asset": "SO17.png"
            },
            {
                "name": "GM13",
                "asset": "GM13.png"
            },
            {
                "name": "MS22",
                "asset": "MS22.png"
            },
            {
                "name": "TK18",
                "asset": "TK18.png"
            },
            {
                "name": "SP20",
                "asset": "SP20.png"
            },
            {
                "name": "KR69",
                "asset": "KR69.png"
            },
            {
                "name": "OT8",
                "asset": "OT8.png"
            },
            {
                "name": "JM32",
                "asset": "JM32.png"
            },
            {
                "name": "TN11",
                "asset": "TN11.png"
            },
            {
                "name": "FORD M SPORT",
                "asset": "FORDMSPORT.png"
            },
            {
                "name": "HYUNDAI N",
                "asset": "HYUNDAIN.png"
            },
            {
                "name": "TOYOTA GR",
                "asset": "TOYOTAGR.png"
            },
        ]
    },
    {
        "name": "Phineas & Ferb",
        "banner": "phineas-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1104844219094401215')
        ],
        "decorations": [
            {
                "name": "Phineas",
                "asset": "Phineas Decor.png"
            },
            {
                "name": "Ferb",
                "asset": "Ferb Decor.png"
            },
            {
                "name": "Candace",
                "asset": "Candace Decor.png"
            },
            {
                "name": "Isabella",
                "asset": "Isabella Decor.png"
            },
            {
                "name": "Perry",
                "asset": "Perry Decor.png"
            },
        ]
    },
    {
        "name": "Project Moon",
        "banner": "moon-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1364263466000584764')
        ],
        "decorations": [
            {
                "name": "Apocalypse Bird",
                "asset": "Apocalypse_Bird.png"
            },
            {
                "name": "Big Bird",
                "asset": "Big Bird.png"
            },
            {
                "name": "Binds",
                "asset": "Binds.png"
            },
            {
                "name": "Blue Star",
                "asset": "Blue_Star.png"
            },
            {
                "name": "Burrowing Heaven",
                "asset": "Burrowing_Heaven.png"
            },
            {
                "name": "BYGONE DAYS",
                "asset": "BYGONE DAYS.png"
            },
            {
                "name": "CHEIF BUTLER RYOSHU",
                "asset": "CHEIF BUTLER RYOSHU.png"
            },
            {
                "name": "EDGAR FAMILY HEIR",
                "asset": "EDGAR FAMILY HEIR.png"
            },
            {
                "name": "ERLKING HEATHCLIFF",
                "asset": "ERLKING HEATHCLIFF.png"
            },
            {
                "name": "FAMILY BUTLER ISHMAEL",
                "asset": "FAMILY BUTLER ISHMAEL.png"
            },
            {
                "name": "Funeral Of The Dead Butterflies",
                "asset": "Funeral_Of_The_Dead_Butterflies.png"
            },
            {
                "name": "Green Dawn",
                "asset": "Green Dawn.png"
            },
            {
                "name": "Il Pianto della Luna",
                "asset": "Il Pianto della Luna.png"
            },
            {
                "name": "Judgement Bird",
                "asset": "JudgementBird.png"
            },
            {
                "name": "Malkuth",
                "asset": "Malkuth.png"
            },
            {
                "name": "Nothing There",
                "asset": "NothingThere.png"
            },
            {
                "name": "Punishment Bird",
                "asset": "PunishmentBird.png"
            },
            {
                "name": "Rabbit Protocol",
                "asset": "RabbitProtocol.png"
            },
            {
                "name": "Red Riding Hooded Mercenary",
                "asset": "Red Riding Hooded Mercenary.png"
            },
            {
                "name": "Scorched Girl",
                "asset": "Scorched Girl.png"
            },
            {
                "name": "Silent Orchestra",
                "asset": "SilentOrchestra.png"
            },
            {
                "name": "Snow Queen",
                "asset": "Snow Queen.png"
            },
            {
                "name": "Sweeper",
                "asset": "Sweeper.png"
            },
            {
                "name": "The Arbiter",
                "asset": "TheArbiter.png"
            },
            {
                "name": "The Red Mist",
                "asset": "TheRedMist.png"
            },
            {
                "name": "Tiphereth",
                "asset": "Tiphereth.png"
            },
            {
                "name": "White Night",
                "asset": "WhiteNight.png"
            },
            {
                "name": "WN Apostle",
                "asset": "WN Apostle.png"
            },
            {
                "name": "Dawn Fixer",
                "asset": "Dawn Fixer.png"
            },
            {
                "name": "Farmwatch",
                "asset": "Farmwatch.png"
            },
            {
                "name": "Iron Maiden",
                "asset": "Iron Maiden.png"
            },
            {
                "name": "Nagel und Hamer",
                "asset": "Nagel und Hamer.png"
            },
            {
                "name": "Puppet",
                "asset": "Puppet.png"
            },
            {
                "name": "Regret",
                "asset": "Regret.png"
            },
            {
                "name": "Solemn Lament",
                "asset": "Solemn Lament.png"
            },
            {
                "name": "Spicebush",
                "asset": "Spicebush.png"
            },
            {
                "name": "Thumb Capo",
                "asset": "Thumb Capo.png"
            },
        ]
    },
    {
        "name": "Terraria",
        "banner": "terraria-banner.png",
        "artist_info": null,
        "artists": [
            findUser('811114235966521364')
        ],
        "decorations": [
            {
                "name": "Overworld",
                "asset": "overworld.png"
            },
            {
                "name": "Corruption",
                "asset": "corruption.png"
            },
            {
                "name": "Crimson",
                "asset": "crimson.png"
            },
            {
                "name": "King Slime",
                "asset": "king slime.png"
            },
            {
                "name": "Eye of Cthulhu",
                "asset": "eye of cthulhu.png"
            },
            {
                "name": "Eater of Worlds",
                "asset": "eater of worlds.png"
            },
            {
                "name": "Brain of Cthulhu",
                "asset": "brain of cthulhu.png"
            },
            {
                "name": "Queen Bee",
                "asset": "queen bee.png"
            },
            {
                "name": "Skeletron",
                "asset": "skeletron.png"
            },
            {
                "name": "Deerclops",
                "asset": "deerclops.png"
            },
            {
                "name": "Wall of Flesh",
                "asset": "wall of flesh.png"
            },
            {
                "name": "Queen Slime",
                "asset": "queen slime.png"
            },
            {
                "name": "The Destroyer",
                "asset": "the destroyer.png"
            },
            {
                "name": "Skeletron Prime",
                "asset": "skeletron prime.png"
            },
            {
                "name": "The Twins",
                "asset": "the twins.png"
            },
            {
                "name": "Plantera",
                "asset": "plantera.png"
            },
            {
                "name": "Golem",
                "asset": "golem.png"
            },
            {
                "name": "Duke Fishron",
                "asset": "duke fishron.png"
            },
            {
                "name": "Empress of Light",
                "asset": "empress of light.png"
            },
            {
                "name": "Lunatic Cultist",
                "asset": "lunatic cultist.png"
            },
            {
                "name": "Moonlord",
                "asset": "moonlord.png"
            },
            {
                "name": "Solar",
                "asset": "solar.png"
            },
            {
                "name": "Nebula",
                "asset": "nebula.png"
            },
            {
                "name": "Vortex",
                "asset": "vortex.png"
            },
            {
                "name": "Stardust",
                "asset": "stardust.png"
            },
        ]
    },
    {
        "name": "Pressure",
        "banner": "pressure-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1317653030652608558')
        ],
        "decorations": [
            {
                "name": "Candlebearer",
                "asset": "candlebearer reese.png"
            },
            {
                "name": "Dark Company",
                "asset": "dark company reese.png"
            },
            {
                "name": "Dresscode Violation Glasses",
                "asset": "dresscode violation glasses reese.png"
            },
            {
                "name": "Dresscode Violation",
                "asset": "dresscode violation reese.png"
            },
            {
                "name": "ENRAGED Eyefestation",
                "asset": "ENRAGED eyefestation reese.png"
            },
            {
                "name": "OUTRAGED Eyefestation",
                "asset": "OUTRAGED eyefestation reese.png"
            },
            {
                "name": "Eyefestation",
                "asset": "eyefestation reese.png"
            },
            {
                "name": "Friends Forever",
                "asset": "friends forever reese.png"
            },
            {
                "name": "Friends 5EVER",
                "asset": "friends 5EVER reese.png"
            },
            {
                "name": "Group Hug",
                "asset": "group hug reese.png"
            },
            {
                "name": "Good People",
                "asset": "good people reese.png"
            },
            {
                "name": "Mirage",
                "asset": "mirage reese.png"
            },
            {
                "name": "Pandemonium",
                "asset": "pandemonium reese.png"
            },
            {
                "name": "Paranoias Box",
                "asset": "paranoias box reese.png"
            },
            {
                "name": "Pipsqueak Peek",
                "asset": "pipsqueak peek reese.png"
            },
            {
                "name": "Rebarb",
                "asset": "rebarb reese.png"
            },
            {
                "name": "Splat!",
                "asset": "splat! reese.png"
            },
            {
                "name": "The Bottomfeeder",
                "asset": "the bottomfeeder reese.png"
            },
            {
                "name": "The Painter",
                "asset": "the painter reese.png"
            },
            {
                "name": "The Saboteur",
                "asset": "the saboteur reese.png"
            },
            {
                "name": "The Shoal",
                "asset": "the shoal reese.png"
            },
            {
                "name": "Void Buddy Gold",
                "asset": "void buddy gold reese.png"
            },
            {
                "name": "Void Buddy Green",
                "asset": "void buddy green reese.png"
            },
            {
                "name": "Void Buddy Purple",
                "asset": "void buddy purple reese.png"
            },
            {
                "name": "Void Buddy Red",
                "asset": "void buddy red reese.png"
            },
        ]
    },
    {
        "name": "Poop Monsters",
        "banner": "placeholder-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1298495520423149609')
        ],
        "decorations": [
            {
                "name": "Brown Poop Monster",
                "asset": "Brown Poop Monster.png"
            },
            {
                "name": "Blue Poop Monster",
                "asset": "Blue Poop Monster.png"
            },
            {
                "name": "Green Poop Monster",
                "asset": "Green Poop Monster.png"
            },
            {
                "name": "Orange Poop Monster",
                "asset": "Orange Poop Monster.png"
            },
            {
                "name": "Pink Poop Monster",
                "asset": "Pink Poop Monster.png"
            },
            {
                "name": "Purple Poop Monster",
                "asset": "Purple Poop Monster.png"
            },
            {
                "name": "Red Poop Monster",
                "asset": "Red Poop Monster.png"
            },
            {
                "name": "Yellow Poop Monster",
                "asset": "Yellow Poop Monster.png"
            },
            {
                "name": "Rainbow Poop Monster",
                "asset": "Rainbow Poop Monster.png"
            },
            {
                "name": "Brat Poop Monster",
                "asset": "Brat Poop Monster.png"
            },
            {
                "name": "Bisexual Poop Monster",
                "asset": "Bisexual Poop Monster.png"
            },
            {
                "name": "Genderfluid Poop Monster",
                "asset": "Genderfluid Poop Monster.png"
            },
            {
                "name": "Lesbian Poop Monster",
                "asset": "Lesbian Poop Monster.png"
            },
            {
                "name": "Non-Binary Poop Monster",
                "asset": "Non-Binary Poop Monster.png"
            },
            {
                "name": "Pansexual Poop Monster",
                "asset": "Pansexual Poop Monster.png"
            },
            {
                "name": "Transgender Poop Monster",
                "asset": "Transgender Poop Monster.png"
            },
            {
                "name": "British Poop Monster",
                "asset": "British Poop Monster.png"
            },
            {
                "name": "United Poops of America",
                "asset": "United Poops of America.png"
            },
            {
                "name": "France Poop Monster",
                "asset": "France Poop Monster.png"
            },
            {
                "name": "Sweden Poop Monster",
                "asset": "Sweden Poop Monster.png"
            },
            {
                "name": "Poland Poop Monster",
                "asset": "Poland Poop Monster.png"
            },
        ]
    },
    {
        "name": "Epik Adventures",
        "banner": "placeholder-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1358056472809832688'),
            findUser('452679089929846784'),
        ],
        "decorations": [
            {
                "name": "Epik",
                "artist": findUser('1358056472809832688'),
                "asset": "Epik.png"
            },
            {
                "name": "Cloudo",
                "artist": findUser('1349840616103612428'),
                "asset": "Cloudo.png"
            },
            {
                "name": "Cephalo",
                "artist": findUser('1358056472809832688'),
                "asset": "Cephalo.png"
            },
            {
                "name": "Epik Ronnie",
                "artist": findUser('1358056472809832688'),
                "asset": "Epik Ronnie.png"
            },
            {
                "name": "Tecute",
                "artist": findUser('1358056472809832688'),
                "asset": "Tecute.png"
            },
            {
                "name": "Tecbrute",
                "artist": findUser('1358056472809832688'),
                "asset": "Tecbrute.png"
            },
        ]
    },
    {
        "force_break": true,
        "name": "Flags",
        "banner": "placeholder-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1106968627036557322')
        ],
        "force_pagebreak": true,
        "decorations": [
            {
                "name": "Burundi 🇧🇮",
                "asset": "Burundi 🇧🇮.png"
            },
            {
                "name": "Comoros 🇰🇲",
                "asset": "Comoros 🇰🇲.png"
            },
            {
                "name": "Djibouti 🇩🇯",
                "asset": "Djibouti 🇩🇯.png"
            },
            {
                "name": "Eritrea 🇪🇷",
                "asset": "Eritrea 🇪🇷.png"
            },
            {
                "name": "Ethiopia 🇪🇹",
                "asset": "Ethiopia 🇪🇹.png"
            },
            {
                "name": "Kenya 🇰🇪",
                "asset": "Kenya 🇰🇪.png"
            },
            {
                "name": "Madagascar 🇲🇬",
                "asset": "Madagascar 🇲🇬.png"
            },
            {
                "name": "Malawi 🇲🇼",
                "asset": "Malawi 🇲🇼.png"
            },
            {
                "name": "Mauritius 🇲🇺",
                "asset": "Mauritius 🇲🇺.png"
            },
            {
                "name": "Mozambique 🇲🇿",
                "asset": "Mozambique 🇲🇿.png"
            },
            {
                "name": "Rwanda 🇷🇼",
                "asset": "Rwanda 🇷🇼.png"
            },
            {
                "name": "Seychelles 🇸🇨",
                "asset": "Seychelles 🇸🇨.png"
            },
            {
                "name": "Somalia 🇸🇴",
                "asset": "Somalia 🇸🇴.png"
            },
            {
                "name": "South Sudan 🇸🇸",
                "asset": "South Sudan 🇸🇸.png"
            },
            {
                "name": "Tanzania 🇹🇿",
                "asset": "Tanzania 🇹🇿.png"
            },
            {
                "name": "Uganda 🇺🇬",
                "asset": "Uganda 🇺🇬.png"
            },
            {
                "name": "Zambia 🇿🇲",
                "asset": "Zambia 🇿🇲.png"
            },
            {
                "name": "Zimbabwe 🇿🇼",
                "asset": "Zimbabwe 🇿🇼.png"
            },
            {
                "name": "Angola 🇦🇴",
                "asset": "Angola 🇦🇴.png"
            },
            {
                "name": "Cameroon 🇨🇲",
                "asset": "Cameroon 🇨🇲.png"
            },
            {
                "name": "Central African Republic 🇨🇫",
                "asset": "Central African Republic 🇨🇫.png"
            },
            {
                "name": "Chad 🇹🇩",
                "asset": "Chad 🇹🇩.png"
            },
            {
                "name": "Democratic Republic of the Congo 🇨🇩",
                "asset": "Democratic Republic of the Congo 🇨🇩.png"
            },
            {
                "name": "Equatorial Guinea 🇬🇶",
                "asset": "Equatorial Guinea 🇬🇶.png"
            },
            {
                "name": "Gabon 🇬🇦",
                "asset": "Gabon 🇬🇦.png"
            },
            {
                "name": "Republic of the Congo 🇨🇬",
                "asset": "Republic of the Congo 🇨🇬.png"
            },
            {
                "name": "São Tomé and Príncipe 🇸🇹",
                "asset": "São Tomé and Príncipe 🇸🇹.png"
            },
            {
                "name": "Algeria 🇩🇿",
                "asset": "Algeria 🇩🇿.png"
            },
            {
                "name": "Egypt 🇪🇬",
                "asset": "Egypt 🇪🇬.png"
            },
            {
                "name": "Libya 🇱🇾",
                "asset": "Libya 🇱🇾.png"
            },
            {
                "name": "Morocco 🇲🇦",
                "asset": "Morocco 🇲🇦.png"
            },
            {
                "name": "Sudan 🇸🇩",
                "asset": "Sudan 🇸🇩.png"
            },
            {
                "name": "Tunisia 🇹🇳",
                "asset": "Tunisia 🇹🇳.png"
            },
            {
                "name": "Botswana 🇧🇼",
                "asset": "Botswana 🇧🇼.png"
            },
            {
                "name": "Eswatini 🇸🇿",
                "asset": "Eswatini 🇸🇿.png"
            },
            {
                "name": "Lesotho 🇱🇸",
                "asset": "Lesotho 🇱🇸.png"
            },
            {
                "name": "Namibia 🇳🇦",
                "asset": "Namibia 🇳🇦.png"
            },
            {
                "name": "South Africa 🇿🇦",
                "asset": "South Africa 🇿🇦.png"
            },
            {
                "name": "Benin 🇧🇯",
                "asset": "Benin 🇧🇯.png"
            },
            {
                "name": "Burkina Faso 🇧🇫",
                "asset": "Burkina Faso 🇧🇫.png"
            },
            {
                "name": "Cape Verde 🇨🇻",
                "asset": "Cape Verde 🇨🇻.png"
            },
            {
                "name": "Côte d'Ivoire 🇨🇮",
                "asset": "Côte d'Ivoire 🇨🇮.png"
            },
            {
                "name": "Ghana 🇬🇭",
                "asset": "Ghana 🇬🇭.png"
            },
            {
                "name": "Guinea 🇬🇳",
                "asset": "Guinea 🇬🇳.png"
            },
            {
                "name": "Guinea-Bissau 🇬🇼",
                "asset": "Guinea-Bissau 🇬🇼.png"
            },
            {
                "name": "Liberia 🇱🇷",
                "asset": "Liberia 🇱🇷.png"
            },
            {
                "name": "Mali 🇲🇱",
                "asset": "Mali 🇲🇱.png"
            },
            {
                "name": "Mauritania 🇲🇷",
                "asset": "Mauritania 🇲🇷.png"
            },
            {
                "name": "Niger 🇳🇪",
                "asset": "Niger 🇳🇪.png"
            },
            {
                "name": "Nigeria 🇳🇬",
                "asset": "Nigeria 🇳🇬.png"
            },
            {
                "name": "Senegal 🇸🇳",
                "asset": "Senegal 🇸🇳.png"
            },
            {
                "name": "Sierra Leone 🇸🇱",
                "asset": "Sierra Leone 🇸🇱.png"
            },
            {
                "name": "The Gambia 🇬🇲",
                "asset": "The Gambia 🇬🇲.png"
            },
            {
                "name": "Togo 🇹🇬",
                "asset": "Togo 🇹🇬.png"
            },
            {
                "name": "Antigua and Barbuda 🇦🇬",
                "asset": "Antigua and Barbuda 🇦🇬.png"
            },
            {
                "name": "Barbados 🇧🇧",
                "asset": "Barbados 🇧🇧.png"
            },
            {
                "name": "Cuba 🇨🇺",
                "asset": "Cuba 🇨🇺.png"
            },
            {
                "name": "Dominica 🇩🇲",
                "asset": "Dominica 🇩🇲.png"
            },
            {
                "name": "Dominican Republic 🇩🇴",
                "asset": "Dominican Republic 🇩🇴.png"
            },
            {
                "name": "Grenada 🇬🇩",
                "asset": "Grenada 🇬🇩.png"
            },
            {
                "name": "Haiti 🇭🇹",
                "asset": "Haiti 🇭🇹.png"
            },
            {
                "name": "Jamaica 🇯🇲",
                "asset": "Jamaica 🇯🇲.png"
            },
            {
                "name": "Saint Kitts and Nevis 🇰🇳",
                "asset": "Saint Kitts and Nevis 🇰🇳.png"
            },
            {
                "name": "Saint Lucia 🇱🇨",
                "asset": "Saint Lucia 🇱🇨.png"
            },
            {
                "name": "Saint Vincent and the Grenadines 🇻🇨",
                "asset": "Saint Vincent and the Grenadines 🇻🇨.png"
            },
            {
                "name": "The Bahamas 🇧🇸",
                "asset": "The Bahamas 🇧🇸.png"
            },
            {
                "name": "Trinidad and Tobado 🇹🇹",
                "asset": "Trinidad and Tobado 🇹🇹.png"
            },
            {
                "name": "Belize 🇧🇿",
                "asset": "Belize 🇧🇿.png"
            },
            {
                "name": "Canada 🇨🇦",
                "asset": "Canada 🇨🇦.png"
            },
            {
                "name": "Costa Rica 🇨🇷",
                "asset": "Costa Rica 🇨🇷.png"
            },
            {
                "name": "El Salvador 🇸🇻",
                "asset": "El Salvador 🇸🇻.png"
            },
            {
                "name": "Guatemala 🇬🇹",
                "asset": "Guatemala 🇬🇹.png"
            },
            {
                "name": "Honduras 🇭🇳",
                "asset": "Honduras 🇭🇳.png"
            },
            {
                "name": "Mexico 🇲🇽",
                "asset": "Mexico 🇲🇽.png"
            },
            {
                "name": "Nicaragua 🇳🇮",
                "asset": "Nicaragua 🇳🇮.png"
            },
            {
                "name": "Panama 🇵🇦",
                "asset": "Panama 🇵🇦.png"
            },
            {
                "name": "United States 🇺🇸",
                "asset": "United States 🇺🇸.png"
            },
            {
                "name": "Argentina 🇦🇷",
                "asset": "Argentina 🇦🇷.png"
            },
            {
                "name": "Bolivia 🇧🇴",
                "asset": "Bolivia 🇧🇴.png"
            },
            {
                "name": "Brazil 🇧🇷",
                "asset": "Brazil 🇧🇷.png"
            },
            {
                "name": "Chile 🇨🇱",
                "asset": "Chile 🇨🇱.png"
            },
            {
                "name": "Colombia 🇨🇴",
                "asset": "Colombia 🇨🇴.png"
            },
            {
                "name": "Ecuador 🇪🇨",
                "asset": "Ecuador 🇪🇨.png"
            },
            {
                "name": "Guyana 🇬🇾",
                "asset": "Guyana 🇬🇾.png"
            },
            {
                "name": "Paraguay 🇵🇾",
                "asset": "Paraguay 🇵🇾.png"
            },
            {
                "name": "Peru 🇵🇪",
                "asset": "Peru 🇵🇪.png"
            },
            {
                "name": "Suriname 🇸🇷",
                "asset": "Suriname 🇸🇷.png"
            },
            {
                "name": "Uruguay 🇺🇾",
                "asset": "Uruguay 🇺🇾.png"
            },
            {
                "name": "Venezuela 🇻🇪",
                "asset": "Venezuela 🇻🇪.png"
            },
            {
                "name": "Kazakhstan 🇰🇿",
                "asset": "Kazakhstan 🇰🇿.png"
            },
            {
                "name": "Kyrgyzstan 🇰🇬",
                "asset": "Kyrgyzstan 🇰🇬.png"
            },
            {
                "name": "Tajikistan 🇹🇯",
                "asset": "Tajikistan 🇹🇯.png"
            },
            {
                "name": "Turkmenistan 🇹🇲",
                "asset": "Turkmenistan 🇹🇲.png"
            },
            {
                "name": "Uzbekistan 🇺🇿",
                "asset": "Uzbekistan 🇺🇿.png"
            },
            {
                "name": "China 🇨🇳",
                "asset": "China 🇨🇳.png"
            },
            {
                "name": "Hong Kong 🇭🇰",
                "asset": "Hong Kong 🇭🇰.png"
            },
            {
                "name": "Japan 🇯🇵",
                "asset": "Japan 🇯🇵.png"
            },
            {
                "name": "Macau 🇲🇴",
                "asset": "Macau 🇲🇴.png"
            },
            {
                "name": "Mongolia 🇲🇳",
                "asset": "Mongolia 🇲🇳.png"
            },
            {
                "name": "North Korea 🇰🇵",
                "asset": "North Korea 🇰🇵.png"
            },
            {
                "name": "South Korea 🇰🇷",
                "asset": "South Korea 🇰🇷.png"
            },
            {
                "name": "Taiwan 🇹🇼",
                "asset": "Taiwan 🇹🇼.png"
            },
            {
                "name": "Brunei 🇧🇳",
                "asset": "Brunei 🇧🇳.png"
            },
            {
                "name": "Cambodia 🇰🇭",
                "asset": "Cambodia 🇰🇭.png"
            },
            {
                "name": "Indonesia 🇮🇩",
                "asset": "Indonesia 🇮🇩.png"
            },
            {
                "name": "Laos 🇱🇦",
                "asset": "Laos 🇱🇦.png"
            },
            {
                "name": "Malaysia 🇲🇾",
                "asset": "Malaysia 🇲🇾.png"
            },
            {
                "name": "Myanmar 🇲🇲",
                "asset": "Myanmar 🇲🇲.png"
            },
            {
                "name": "Philippines 🇵🇭",
                "asset": "Philippines 🇵🇭.png"
            },
            {
                "name": "Singapore 🇸🇬",
                "asset": "Singapore 🇸🇬.png"
            },
            {
                "name": "Thailand 🇹🇭",
                "asset": "Thailand 🇹🇭.png"
            },
            {
                "name": "Timor-Leste 🇹🇱",
                "asset": "Timor-Leste 🇹🇱.png"
            },
            {
                "name": "Vietnam 🇻🇳",
                "asset": "Vietnam 🇻🇳.png"
            },
            {
                "name": "Afghanistan 🇦🇫",
                "asset": "Afghanistan 🇦🇫.png"
            },
            {
                "name": "Bangladesh 🇧🇩",
                "asset": "Bangladesh 🇧🇩.png"
            },
            {
                "name": "Bhutan 🇧🇹",
                "asset": "Bhutan 🇧🇹.png"
            },
            {
                "name": "India 🇮🇳",
                "asset": "India 🇮🇳.png"
            },
            {
                "name": "Iran 🇮🇷",
                "asset": "Iran 🇮🇷.png"
            },
            {
                "name": "Maldives 🇲🇻",
                "asset": "Maldives 🇲🇻.png"
            },
            {
                "name": "Nepal 🇳🇵",
                "asset": "Nepal 🇳🇵.png"
            },
            {
                "name": "Pakistan 🇵🇰",
                "asset": "Pakistan 🇵🇰.png"
            },
            {
                "name": "Sri Lanka 🇱🇰",
                "asset": "Sri Lanka 🇱🇰.png"
            },
            {
                "name": "Bahrain 🇧🇭",
                "asset": "Bahrain 🇧🇭.png"
            },
            {
                "name": "Iraq 🇮🇶",
                "asset": "Iraq 🇮🇶.png"
            },
            {
                "name": "Israel 🇮🇱",
                "asset": "Israel 🇮🇱.png"
            },
            {
                "name": "Jordan 🇯🇴",
                "asset": "Jordan 🇯🇴.png"
            },
            {
                "name": "Kuwait 🇰🇼",
                "asset": "Kuwait 🇰🇼.png"
            },
            {
                "name": "Lebanon 🇱🇧",
                "asset": "Lebanon 🇱🇧.png"
            },
            {
                "name": "Oman 🇴🇲",
                "asset": "Oman 🇴🇲.png"
            },
            {
                "name": "Palestine 🇵🇸",
                "asset": "Palestine 🇵🇸.png"
            },
            {
                "name": "Qatar 🇶🇦",
                "asset": "Qatar 🇶🇦.png"
            },
            {
                "name": "Saudi Arabia 🇸🇦",
                "asset": "Saudi Arabia 🇸🇦.png"
            },
            {
                "name": "Syria 🇸🇾",
                "asset": "Syria 🇸🇾.png"
            },
            {
                "name": "United Arab Emirates 🇦🇪",
                "asset": "United Arab Emirates 🇦🇪.png"
            },
            {
                "name": "Yemen 🇾🇪",
                "asset": "Yemen 🇾🇪.png"
            },
            {
                "name": "Albania 🇦🇱",
                "asset": "Albania 🇦🇱.png"
            },
            {
                "name": "Armenia 🇦🇲",
                "asset": "Armenia 🇦🇲.png"
            },
            {
                "name": "Azerbaijan 🇦🇿",
                "asset": "Azerbaijan 🇦🇿.png"
            },
            {
                "name": "Belarus 🇧🇾",
                "asset": "Belarus 🇧🇾.png"
            },
            {
                "name": "Bosnia and Herzegovina 🇧🇦",
                "asset": "Bosnia and Herzegovina 🇧🇦.png"
            },
            {
                "name": "Bulgaria 🇧🇬",
                "asset": "Bulgaria 🇧🇬.png"
            },
            {
                "name": "Croatia 🇭🇷",
                "asset": "Croatia 🇭🇷.png"
            },
            {
                "name": "Czechia 🇨🇿",
                "asset": "Czechia 🇨🇿.png"
            },
            {
                "name": "Georgia 🇬🇪",
                "asset": "Georgia 🇬🇪.png"
            },
            {
                "name": "Hungary 🇭🇺",
                "asset": "Hungary 🇭🇺.png"
            },
            {
                "name": "Kosovo 🇽🇰",
                "asset": "Kosovo 🇽🇰.png"
            },
            {
                "name": "Moldova 🇲🇩",
                "asset": "Moldova 🇲🇩.png"
            },
            {
                "name": "Montenegro 🇲🇪",
                "asset": "Montenegro 🇲🇪.png"
            },
            {
                "name": "North Macedonia 🇲🇰",
                "asset": "North Macedonia 🇲🇰.png"
            },
            {
                "name": "Poland 🇵🇱",
                "asset": "Poland 🇵🇱.png"
            },
            {
                "name": "Romania 🇷🇴",
                "asset": "Romania 🇷🇴.png"
            },
            {
                "name": "Russia 🇷🇺",
                "asset": "Russia 🇷🇺.png"
            },
            {
                "name": "Serbia 🇷🇸",
                "asset": "Serbia 🇷🇸.png"
            },
            {
                "name": "Slovakia 🇸🇰",
                "asset": "Slovakia 🇸🇰.png"
            },
            {
                "name": "Slovenia 🇸🇮",
                "asset": "Slovenia 🇸🇮.png"
            },
            {
                "name": "Ukraine 🇺🇦",
                "asset": "Ukraine 🇺🇦.png"
            },
            {
                "name": "Denmark 🇩🇰",
                "asset": "Denmark 🇩🇰.png"
            },
            {
                "name": "Estonia 🇪🇪",
                "asset": "Estonia 🇪🇪.png"
            },
            {
                "name": "Finland 🇫🇮",
                "asset": "Finland 🇫🇮.png"
            },
            {
                "name": "Iceland 🇮🇸",
                "asset": "Iceland 🇮🇸.png"
            },
            {
                "name": "Latvia 🇱🇻",
                "asset": "Latvia 🇱🇻.png"
            },
            {
                "name": "Lithuania 🇱🇹",
                "asset": "Lithuania 🇱🇹.png"
            },
            {
                "name": "Norway 🇳🇴",
                "asset": "Norway 🇳🇴.png"
            },
            {
                "name": "Sweden 🇸🇪",
                "asset": "Sweden 🇸🇪.png"
            },
            {
                "name": "Cyprus 🇨🇾",
                "asset": "Cyprus 🇨🇾.png"
            },
            {
                "name": "Greece 🇬🇷",
                "asset": "Greece 🇬🇷.png"
            },
            {
                "name": "Italy 🇮🇹",
                "asset": "Italy 🇮🇹.png"
            },
            {
                "name": "Malta 🇲🇹",
                "asset": "Malta 🇲🇹.png"
            },
            {
                "name": "Portugal 🇵🇹",
                "asset": "Portugal 🇵🇹.png"
            },
            {
                "name": "San Marino 🇸🇲",
                "asset": "San Marino 🇸🇲.png"
            },
            {
                "name": "Spain 🇪🇸",
                "asset": "Spain 🇪🇸.png"
            },
            {
                "name": "Turkey 🇹🇷",
                "asset": "Turkey 🇹🇷.png"
            },
            {
                "name": "Vatican City 🇻🇦",
                "asset": "Vatican City 🇻🇦.png"
            },
            {
                "name": "Andorra 🇦🇩",
                "asset": "Andorra 🇦🇩.png"
            },
            {
                "name": "Austria 🇦🇹",
                "asset": "Austria 🇦🇹.png"
            },
            {
                "name": "Belgium 🇧🇪",
                "asset": "Belgium 🇧🇪.png"
            },
            {
                "name": "France 🇫🇷",
                "asset": "France 🇫🇷.png"
            },
            {
                "name": "Germany 🇩🇪",
                "asset": "Germany 🇩🇪.png"
            },
            {
                "name": "Ireland 🇮🇪",
                "asset": "Ireland 🇮🇪.png"
            },
            {
                "name": "Liechtenstein 🇱🇮",
                "asset": "Liechtenstein 🇱🇮.png"
            },
            {
                "name": "Luxembourg 🇱🇺",
                "asset": "Luxembourg 🇱🇺.png"
            },
            {
                "name": "Monaco 🇲🇨",
                "asset": "Monaco 🇲🇨.png"
            },
            {
                "name": "Netherlands 🇳🇱",
                "asset": "Netherlands 🇳🇱.png"
            },
            {
                "name": "Switzerland 🇨🇭",
                "asset": "Switzerland 🇨🇭.png"
            },
            {
                "name": "United Kingdom 🇬🇧",
                "asset": "United Kingdom 🇬🇧.png"
            },
            {
                "name": "Australia 🇦🇺",
                "asset": "Australia 🇦🇺.png"
            },
            {
                "name": "Fiji 🇫🇯",
                "asset": "Fiji 🇫🇯.png"
            },
            {
                "name": "Kiribati 🇰🇮",
                "asset": "Kiribati 🇰🇮.png"
            },
            {
                "name": "Marshall Islands 🇲🇭",
                "asset": "Marshall Islands 🇲🇭.png"
            },
            {
                "name": "Micronesia 🇫🇲",
                "asset": "Micronesia 🇫🇲.png"
            },
            {
                "name": "Nauru 🇳🇷",
                "asset": "Nauru 🇳🇷.png"
            },
            {
                "name": "New Zealand 🇳🇿",
                "asset": "New Zealand 🇳🇿.png"
            },
            {
                "name": "Palau 🇵🇼",
                "asset": "Palau 🇵🇼.png"
            },
            {
                "name": "Papua New Guinea 🇵🇬",
                "asset": "Papua New Guinea 🇵🇬.png"
            },
            {
                "name": "Samoa 🇼🇸",
                "asset": "Samoa 🇼🇸.png"
            },
            {
                "name": "Solomon Islands 🇸🇧",
                "asset": "Solomon Islands 🇸🇧.png"
            },
            {
                "name": "Tonga 🇹🇴",
                "asset": "Tonga 🇹🇴.png"
            },
            {
                "name": "Tuvalu 🇹🇻",
                "asset": "Tuvalu 🇹🇻.png"
            },
            {
                "name": "Vanuatu 🇻🇺",
                "asset": "Vanuatu 🇻🇺.png"
            },
            {
                "name": "Åland Islands 🇦🇽",
                "asset": "Åland Islands 🇦🇽.png"
            },
            {
                "name": "American Samoa 🇦🇸",
                "asset": "American Samoa 🇦🇸.png"
            },
            {
                "name": "Anguilla 🇦🇮",
                "asset": "Anguilla 🇦🇮.png"
            },
            {
                "name": "Aruba 🇦🇼",
                "asset": "Aruba 🇦🇼.png"
            },
            {
                "name": "Bermuda 🇧🇲",
                "asset": "Bermuda 🇧🇲.png"
            },
            {
                "name": "British Virgin Islands 🇻🇬",
                "asset": "British Virgin Islands 🇻🇬.png"
            },
            {
                "name": "Cayman Islands 🇰🇾",
                "asset": "Cayman Islands 🇰🇾.png"
            },
            {
                "name": "Christmas Island 🇨🇽",
                "asset": "Christmas Island 🇨🇽.png"
            },
            {
                "name": "Cocos (Keeling) Islands 🇨🇨",
                "asset": "Cocos (Keeling) Islands 🇨🇨.png"
            },
            {
                "name": "Cook Islands 🇨🇰",
                "asset": "Cook Islands 🇨🇰.png"
            },
            {
                "name": "Curaçao 🇨🇼",
                "asset": "Curaçao 🇨🇼.png"
            },
            {
                "name": "Falkland Islands 🇫🇰",
                "asset": "Falkland Islands 🇫🇰.png"
            },
            {
                "name": "Faroe Islands 🇫🇴",
                "asset": "Faroe Islands 🇫🇴.png"
            },
            {
                "name": "French Polynesia 🇵🇫",
                "asset": "French Polynesia 🇵🇫.png"
            },
            {
                "name": "Gibraltar 🇬🇮",
                "asset": "Gibraltar 🇬🇮.png"
            },
            {
                "name": "Greenland 🇬🇱",
                "asset": "Greenland 🇬🇱.png"
            },
            {
                "name": "Guam 🇬🇺",
                "asset": "Guam 🇬🇺.png"
            },
            {
                "name": "Guernsey 🇬🇬",
                "asset": "Guernsey 🇬🇬.png"
            },
            {
                "name": "Isle of Man 🇮🇲",
                "asset": "Isle of Man 🇮🇲.png"
            },
            {
                "name": "Jersey 🇯🇪",
                "asset": "Jersey 🇯🇪.png"
            },
            {
                "name": "Montserrat 🇲🇸",
                "asset": "Montserrat 🇲🇸.png"
            },
            {
                "name": "New Caledonia 🇳🇨",
                "asset": "New Caledonia 🇳🇨.png"
            },
            {
                "name": "Niue 🇳🇺",
                "asset": "Niue 🇳🇺.png"
            },
            {
                "name": "Norfolk Island 🇳🇫",
                "asset": "Norfolk Island 🇳🇫.png"
            },
            {
                "name": "Northen Mariana Islands 🇲🇵",
                "asset": "Northen Mariana Islands 🇲🇵.png"
            },
            {
                "name": "Pitcairn Islands 🇵🇳",
                "asset": "Pitcairn Islands 🇵🇳.png"
            },
            {
                "name": "Puerto Rico 🇵🇷",
                "asset": "Puerto Rico 🇵🇷.png"
            },
            {
                "name": "Saint Barthélemy 🇧🇱",
                "asset": "Saint Barthélemy 🇧🇱.png"
            },
            {
                "name": "Saint-Pierre and Miquelon 🇵🇲",
                "asset": "Saint-Pierre and Miquelon 🇵🇲.png"
            },
            {
                "name": "Sint Maarten 🇲🇫",
                "asset": "Sint Maarten 🇲🇫.png"
            },
            {
                "name": "Tokelau 🇹🇰",
                "asset": "Tokelau 🇹🇰.png"
            },
            {
                "name": "Turks and Caicos Islands 🇹🇨",
                "asset": "Turks and Caicos Islands 🇹🇨.png"
            },
            {
                "name": "United States Virgin Islands 🇻🇮",
                "asset": "United States Virgin Islands 🇻🇮.png"
            },
            {
                "name": "Wallis and Futuna 🇼🇫",
                "asset": "Wallis and Futuna 🇼🇫.png"
            },
        ]
    },
    {
        "name": "Library of Ruina",
        "banner": "ruina-banner.png",
        "artist_info": null,
        "artists": [
            findUser('434037775092809730')
        ],
        "decorations": [
            {
                "name": "Animated Apocalypse Bird",
                "asset": "Animated Apocalypse Bird.png"
            },
            {
                "name": "Apocalypse Bird",
                "asset": "Apocalypse Bird.png"
            },
            {
                "name": "Blue Star",
                "asset": "Blue Star.png"
            },
            {
                "name": "Burrowing Heaven",
                "asset": "Burrowing Heaven.png"
            },
            {
                "name": "The Happy Teddy Bear Decor",
                "asset": "The Happy Teddy Bear Decor.png"
            },
            {
                "name": "The Price of Silence Decor",
                "asset": "The Price of Silence Decor.png"
            },
            {
                "name": "The Funeral of the Dead Butterflies",
                "asset": "The Funeral of the Dead Butterflies.png"
            }
        ]
    },
    {
        "name": "Pokemart",
        "banner": "pokemart-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1147940825330876538')
        ],
        "decorations": [
            {
                "name": "Poké Ball",
                "asset": "poke ball.png"
            },
            {
                "name": "Great Ball",
                "asset": "great ball.png"
            },
            {
                "name": "Ultra Ball",
                "asset": "ultra ball.png"
            },
            {
                "name": "Master Ball",
                "asset": "master ball.png"
            },
            {
                "name": "Premier Ball",
                "asset": "premier ball.png"
            },
            {
                "name": "Strange Ball",
                "asset": "strange ball.png"
            },
            {
                "name": "Team Rocket Ball",
                "asset": "rocket ball.png"
            },
            {
                "name": "GS Ball",
                "asset": "gs ball.png"
            }
        ]
    },
    {
        "name": "Flavor Foley",
        "banner": "newflavorfoley-banner.png",
        "artist_info": null,
        "artists": [
            findUser('995651435519815772')
        ],
        "decorations": [
            {
                "name": "Cardiac Contrepoint",
                "asset": "Cardiac Contrepoint.png",
                "summary": "Here lies your profile picture.",
            },
            {
                "name": "Electric Weekend Zone",
                "asset": "Electric Weekend Zone.png",
                "summary": "Let's paartty!",
            },
            {
                "name": "Flavor Foley",
                "asset": "Flavor Foley.png",
                "summary": "The several flavors of profile pictures.",
            },
            {
                "name": "Meatgirl",
                "asset": "meatgirl.png",
                "summary": "They say my hunger's a problem.",
            },
            {
                "name": "Queen of Venus",
                "asset": "Queen of Venus.png",
                "summary": "Oh, Queen of Venus, hear my pleas!",
            },
            {
                "name": "Rawdog",
                "asset": "rawdog.png",
                "summary": "Would add a lyric here but.. yeah no",
            },
            {
                "name": "Water the roses",
                "asset": "watertheroses.png",
                "summary": "But I feel so stupid cause you feel the same!",
            },
            {
                "name": "Weathergirl",
                "asset": "weathergirl.png",
                "summary": "Wouldn't you like to know, Weathergirl?",
            },
            {
                "name": "Wei Ward Romance",
                "asset": "WeiWardRomance.png",
                "summary": "Beneath the lanterns, we'll meet!",
            },
            {
                "name": "Static's Miku",
                "asset": "Static's Miku.png",
                "summary": "This is how it should be!",
            },
            {
                "name": "Gardener Gumi",
                "asset": "Gardener Gumi.png",
                "summary": "And when I water the roses, I can't trust you to stay.",
            },
            {
                "name": "Gardener Partner",
                "asset": "Gardener Partner.png",
                "summary": "So here I lay, neath the shimmering moon! Just a lovestruck fool, what do I do but wait for you?",
            },
            {
                "name": "Plushie Vanity",
                "asset": "Plushie Vanity.png",
                "summary": "go buy it if it's still here",
            },
            {
                "name": "Vanity Knife-Swap",
                "asset": "Vanity Knife-Swap.png",
                "summary": "The slaughter's on!",
            },
        ]
    },
    {
        "name": "Star Wars",
        "banner": "starwars-banner.png",
        "artist_info": null,
        "artists": [
            findUser('808325271949934652')
        ],
        "decorations": [
            {
                "name": "Kylo Ren First Order",
                "asset": "krfo.png"
            },
            {
                "name": "Kylo Ren Unignited Lightsaber",
                "asset": "krunignited.png"
            },
            {
                "name": "Kylo Ren Ignited Lightsaber",
                "asset": "krignited.png"
            },
            {
                "name": "Kylo Ren Animated",
                "asset": "kr_anim.png"
            },
            {
                "name": "Darth Vader",
                "asset": "vader.png"
            },
            {
                "name": "Obi-Wan Kenobi",
                "asset": "obk.png"
            },
            {
                "name": "Kylo Ren Dark Side",
                "asset": "kr_illsytds.png"
            },
            {
                "name": "Yoda May the Force be With You",
                "asset": "yoda_mtfbwy.png"
            },
            {
                "name": "Peeking Grogu",
                "asset": "Grogu.png"
            },
            {
                "name": "The Armorer",
                "asset": "ta.png"
            },
            {
                "name": "Mythosaur",
                "asset": "mys.png"
            },
            {
                "name": "Clan Mudhorn",
                "asset": "CM.png"
            },
            {
                "name": "Bo-Katan Kryze",
                "asset": "bkk.png"
            },
            {
                "name": "Dark Side",
                "asset": "ds_logo.png"
            },
            {
                "name": "Luke Skywalker",
                "asset": "LS.png"
            },
            {
                "name": "Luke Skywalker (no retraction)",
                "asset": "LSnr.png"
            },
            {
                "name": "Ahsoka Tano Lightsabers",
                "asset": "ATsaber.png"
            }
        ]
    },
    {
        "name": "Bugs",
        "banner": "1bugs-banner.png",
        "artist_info": null,
        "artists": [
            findUser('811114235966521364')
        ],
        "decorations": [
            {
                "name": "Bee",
                "asset": "bee.png"
            },
            {
                "name": "Butterfly",
                "asset": "butterfly.png"
            },
            {
                "name": "Butterfly Blue Variant",
                "asset": "butterfly var.png"
            },
            {
                "name": "Fly",
                "asset": "fly.png"
            },
            {
                "name": "Moth",
                "asset": "moth.png"
            },
            {
                "name": "Roly Poly",
                "asset": "roly poly.png"
            }
        ]
    },
    {
        "name": "Monochrome",
        "banner": "monochrome-banner.png",
        "artist_info": null,
        "artists": [
            findUser('516709524829110322')
        ],
        "decorations": [
            {
                "name": "All Black",
                "asset": "All Black.png"
            },
            {
                "name": "All White",
                "asset": "All White.png"
            },
            {
                "name": "Monokuma",
                "asset": "Monokuma.png"
            },
            {
                "name": "Monodam",
                "asset": "Monodam.png"
            },
            {
                "name": "Monokid",
                "asset": "Monokid.png"
            },
            {
                "name": "Monomi",
                "asset": "Monomi.png"
            },
            {
                "name": "Monophanie",
                "asset": "Monophanie.png"
            },
            {
                "name": "Monosuke",
                "asset": "Monosuke.png"
            },
            {
                "name": "Monotaro",
                "asset": "Monotaro.png"
            },
            {
                "name": "Usami",
                "asset": "Usami.png"
            },
            {
                "name": "Shuichis cap",
                "asset": "Shuichis cap.png"
            },
            {
                "name": "Kirigiri Ramen",
                "asset": "kirigiri ramen.png"
            },
            {
                "name": "Junkos Hair Pins",
                "asset": "Junkos hair pins.png"
            }
        ]
    },
    {
        "name": "Doodleys",
        "banner": "doodleys-banner.png",
        "artist_info": null,
        "artists": [
            findUser('937055290166239263')
        ],
        "decorations": [
            {
                "name": "Appel",
                "asset": "Appel.png"
            },
            {
                "name": "Burnin'",
                "asset": "Burnin'.png"
            },
            {
                "name": "Fedora",
                "asset": "Fedora.png"
            },
            {
                "name": "Sleepy",
                "asset": "Sleepy.png"
            },
            {
                "name": "Yummers",
                "asset": "Yummers.png"
            }
        ]
    },
    {
        "name": "Angel X Devil",
        "banner": "angelxdevil-banner.png",
        "artist_info": null,
        "artists": [
            findUser('995598255612239884')
        ],
        "decorations": [
            {
                "name": "Angel Halo",
                "asset": "angel halo.png"
            },
            {
                "name": "Angel Label",
                "asset": "angel label.png"
            },
            {
                "name": "Angel Wings",
                "asset": "angel wings.png"
            },
            {
                "name": "Devil Horn",
                "asset": "devil horn.png"
            },
            {
                "name": "Devil Label",
                "asset": "devil label.png"
            },
            {
                "name": "Devil Wings",
                "asset": "devil wings.png"
            }
        ]
    },
    {
        "name": "SkyDreams",
        "banner": "skydreams-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1187559332703899708')
        ],
        "decorations": [
            {
                "name": "Cloud Platform",
                "asset": "CloudPlatform.png"
            },
            {
                "name": "Cloud Platform (Alt)",
                "asset": "CloudPlatform(Alt).png"
            },
            {
                "name": "Side Clouds",
                "asset": "SideClouds.png"
            },
            {
                "name": "Starry Night",
                "asset": "StarryNight.png"
            },
            {
                "name": "Starry Night (Alt)",
                "asset": "StarryNight(Alt).png"
            },
            {
                "name": "Sunny Day",
                "asset": "SunnyDay.png"
            }
        ]
    },
    {
        "force_break": true,
        "name": "Color Mass",
        "banner": "colormass-banner.png",
        "artist_info": null,
        "artists": [
            findUser('845613407818088498')
        ],
        "force_pagebreak": true,
        "decorations": [
            {
                "name": "Black Spike Crimson",
                "asset": "Black Spike  Crimson 2.png"
            },
            {
                "name": "Black Spike Cherise",
                "asset": "Black Spike Cherise 2.png"
            },
            {
                "name": "Black Spike Barbie Pink",
                "asset": "Black Spike Barbie Pink 2.png"
            },
            {
                "name": "Black Spike Phlox",
                "asset": "Black Spike Phlox 2.png"
            },
            {
                "name": "Black Spike Veronica",
                "asset": "Black Spike Veronica 2.png"
            },
            {
                "name": "Black Spike Bluebonnet",
                "asset": "Black Spike Bluebonnet 2.png"
            },
            {
                "name": "Black Spike Azure",
                "asset": "Black Spike Azure 2.png"
            },
            {
                "name": "Black Spike Capri",
                "asset": "Black Spike Capri 2.png"
            },
            {
                "name": "Black Spike Fluorescent Blue",
                "asset": "Black Spike Fluorescent Blue 2.png"
            },
            {
                "name": "Black Spike Munsell 5G",
                "asset": "Black Spike Munsell 5G 2.png"
            },
            {
                "name": "Black Spike Erin",
                "asset": "Black Spike Erin 2.png"
            },
            {
                "name": "Black Spike Harlequin",
                "asset": "Black Spike Harlequin 2.png"
            },
            {
                "name": "Black Spike Acid Green",
                "asset": "Black Spike Acid Green 2.png"
            },
            {
                "name": "Black Spike Chartreuse",
                "asset": "Black Spike Chartreuse 2.png"
            },
            {
                "name": "Black Spike Lemon",
                "asset": "Black Spike Lemon 2.png"
            },
            {
                "name": "Black Spike Saffron",
                "asset": "Black Spike Saffron 2.png"
            },
            {
                "name": "Black Spike Butterscotch",
                "asset": "Black Spike Butterscotch 2.png"
            },
            {
                "name": "Black Spike Safety Orange",
                "asset": "Black Spike Safety Orange 2.png"
            },
            {
                "name": "Black Spike Tangelo",
                "asset": "Black Spike Tangelo 2.png"
            },
            {
                "name": "Black Spike Vermillion",
                "asset": "Black Spike Vermillion 2.png"
            },
            {
                "name": "Black Wave Crimson",
                "asset": "Black Wave Crimson 2.png"
            },
            {
                "name": "Black Wave Cherise",
                "asset": "Black Wave Cherise 2.png"
            },
            {
                "name": "Black Wave Barbie Pink",
                "asset": "Black Wave Barbie Pink 2.png"
            },
            {
                "name": "Black Wave Phlox",
                "asset": "Black Wave Phlox 2.png"
            },
            {
                "name": "Black Wave Veronica",
                "asset": "Black Wave Veronica 2.png"
            },
            {
                "name": "Black Wave Bluebonnet",
                "asset": "Black Wave Bluebonnet 2.png"
            },
            {
                "name": "Black Wave Azure",
                "asset": "Black Wave Azure 2.png"
            },
            {
                "name": "Black Wave Capri",
                "asset": "Black Wave Capri 2.png"
            },
            {
                "name": "Black Wave Fluorescent Blue",
                "asset": "Black Wave Fluorescent Blue 2.png"
            },
            {
                "name": "Black Wave Munsell 5G",
                "asset": "Black Wave Munsell 5G 2.png"
            },
            {
                "name": "Black Wave Erin",
                "asset": "Black Wave Erin 2.png"
            },
            {
                "name": "Black Wave Harlequin",
                "asset": "Black Wave Harlequin 2.png"
            },
            {
                "name": "Black Wave Acid Green",
                "asset": "Black Wave Acid Green 2.png"
            },
            {
                "name": "Black Wave Chartreuse",
                "asset": "Black Wave Chartreuse 2.png"
            },
            {
                "name": "Black Wave Lemon",
                "asset": "Black Wave Lemon 2.png"
            },
            {
                "name": "Black Wave Saffron",
                "asset": "Black Wave Saffron 2.png"
            },
            {
                "name": "Black Wave Butterscotch",
                "asset": "Black Wave Butterscotch 2.png"
            },
            {
                "name": "Black Wave Safety Orange",
                "asset": "Black Wave Safety Orange 2.png"
            },
            {
                "name": "Black Wave Tangelo",
                "asset": "Black Wave Tangelo 2.png"
            },
            {
                "name": "Black Wave Vermillion",
                "asset": "Black Wave Vermillion 2.png"
            },
            {
                "name": "White Spike Bubblegum",
                "asset": "White Spike Bubblegum 2.png"
            },
            {
                "name": "White Spike Rose Pompadour",
                "asset": "White Spike Rose Pompadour 2.png"
            },
            {
                "name": "White Spike Rose Pink",
                "asset": "White Spike Rose Pink 2.png"
            },
            {
                "name": "White Spike Ultra Pink",
                "asset": "White Spike Ultra Pink 2.png"
            },
            {
                "name": "White Spike Lavender",
                "asset": "White Spike Lavender 2.png"
            },
            {
                "name": "White Spike Cornflower",
                "asset": "White Spike Cornflower 2.png"
            },
            {
                "name": "White Spike Maya Blue",
                "asset": "White Spike Maya Blue 2.png"
            },
            {
                "name": "White Spike Sky Blue",
                "asset": "White Spike Sky Blue 2.png"
            },
            {
                "name": "White Spike Celeste",
                "asset": "White Spike Celeste 2.png"
            },
            {
                "name": "White Spike Celadon",
                "asset": "White Spike Celadon 2.png"
            },
            {
                "name": "White Spike Pale Green",
                "asset": "White Spike Pale Green 2.png"
            },
            {
                "name": "White Spike Mantis",
                "asset": "White Spike Mantis 2.png"
            },
            {
                "name": "White Spike Green Tea",
                "asset": "White Spike Green Tea 2.png"
            },
            {
                "name": "White Spike Calamansi",
                "asset": "White Spike Calamansi 2.png"
            },
            {
                "name": "White Spike Mellow Yellow 2",
                "asset": "White Spike Mellow Yellow 2.png"
            },
            {
                "name": "White Spike Moccasin",
                "asset": "White Spike Moccasin 2.png"
            },
            {
                "name": "White Spike Apricot",
                "asset": "White Spike Apricot 2.png"
            },
            {
                "name": "White Spike Coral",
                "asset": "White Spike Coral 2.png"
            },
            {
                "name": "White Spike Atomic Tangerine",
                "asset": "White Spike Atomic Tangerine 2.png"
            },
            {
                "name": "White Spike Tango",
                "asset": "White Spike Tango 2.png"
            },
            {
                "name": "White Wave Bubblegum",
                "asset": "White Wave Bubblegum 2.png"
            },
            {
                "name": "White Wave Rose Pompadour",
                "asset": "White Wave Rose Pompadour 2.png"
            },
            {
                "name": "White Wave Rose Pink",
                "asset": "White Wave Rose Pink 2.png"
            },
            {
                "name": "White Wave Ultra Pink",
                "asset": "White Wave Ultra Pink 2.png"
            },
            {
                "name": "White Wave Lavender",
                "asset": "White Wave Lavender 2.png"
            },
            {
                "name": "White Wave Cornflower",
                "asset": "White Wave Cornflower 2.png"
            },
            {
                "name": "White Wave Maya Blue",
                "asset": "White Wave Maya Blue 2.png"
            },
            {
                "name": "White Wave Sky Blue",
                "asset": "White Wave Sky Blue 2.png"
            },
            {
                "name": "White Wave Celeste",
                "asset": "White Wave Celeste 2.png"
            },
            {
                "name": "White Wave Celadon",
                "asset": "White Wave Celadon 2.png"
            },
            {
                "name": "White Wave Pale Green",
                "asset": "White Wave Pale Green 2.png"
            },
            {
                "name": "White Wave Mantis",
                "asset": "White Wave Mantis 2.png"
            },
            {
                "name": "White Wave Green Tea",
                "asset": "White Wave Green Tea 2.png"
            },
            {
                "name": "White Wave Calamansi",
                "asset": "White Wave Calamansi 2.png"
            },
            {
                "name": "White Wave Mellow Yellow",
                "asset": "White Wave Mellow Yellow 2.png"
            },
            {
                "name": "White Wave Moccasin",
                "asset": "White Wave Moccasin 2.png"
            },
            {
                "name": "White Wave Apricot",
                "asset": "White Wave Apricot 2.png"
            },
            {
                "name": "White Wave Coral",
                "asset": "White Wave Coral 2.png"
            },
            {
                "name": "White Wave Atomic Tangerine",
                "asset": "White Wave Atomic Tangerine 2.png"
            },
            {
                "name": "White Wave Tango",
                "asset": "White Wave Tango 2.png"
            },
            {
                "name": "Black Wave Crimson (No Status)",
                "asset": "Black Wave Crimson.png"
            },
            {
                "name": "Black Wave Cherise (No Status)",
                "asset": "Black Wave Cherise.png"
            },
            {
                "name": "Black Wave Barbie Pink (No Status)",
                "asset": "Black Wave Barbie Pink.png"
            },
            {
                "name": "Black Wave Phlox (No Status)",
                "asset": "Black Wave Phlox.png"
            },
            {
                "name": "Black Wave Veronica (No Status)",
                "asset": "Black Wave Veronica.png"
            },
            {
                "name": "Black Wave Bluebonnet (No Status)",
                "asset": "Black Wave Bluebonnet.png"
            },
            {
                "name": "Black Wave Azure (No Status)",
                "asset": "Black Wave Azure.png"
            },
            {
                "name": "Black Wave Capri (No Status)",
                "asset": "Black Wave Capri.png"
            },
            {
                "name": "Black Wave Fluerescent Blue (No Status)",
                "asset": "Black Wave Fluerescent Blue.png"
            },
            {
                "name": "Black Wave Munsell 5G (No Status)",
                "asset": "Black Wave Munsell 5G.png"
            },
            {
                "name": "Black Wave Erin (No Status)",
                "asset": "Black Wave Erin.png"
            },
            {
                "name": "Black Wave Harlequin (No Status)",
                "asset": "Black Wave Harlequin.png"
            },
            {
                "name": "Black Wave Acid Green (No Status)",
                "asset": "Black Wave Acid Green.png"
            },
            {
                "name": "Black Wave Chartreuse (No Status)",
                "asset": "Black Wave Chartreuse.png"
            },
            {
                "name": "Black Wave Lemon (No Status)",
                "asset": "Black Wave Lemon.png"
            },
            {
                "name": "Black Wave Saffron (No Status)",
                "asset": "Black Wave Saffron.png"
            },
            {
                "name": "Black Wave Butterscotch (No Status)",
                "asset": "Black Wave Butterscotch.png"
            },
            {
                "name": "Black Wave Safety Orange (No Status)",
                "asset": "Black Wave Safety Orange.png"
            },
            {
                "name": "Black Wave Tangelo (No Status)",
                "asset": "Black Wave Tangelo.png"
            },
            {
                "name": "Black Wave Vermillion (No Status)",
                "asset": "Black Wave Vermillion.png"
            },
            {
                "name": "Black Spike Crimson (No Status)",
                "asset": "Black Spike Crimson.png"
            },
            {
                "name": "Black Spike Cherise (No Status)",
                "asset": "Black Spike Cherise.png"
            },
            {
                "name": "Black Spike Barbie Pink (No Status)",
                "asset": "Black Spike Barbie Pink.png"
            },
            {
                "name": "Black Spike Phlox (No Status)",
                "asset": "Black Spike Phlox.png"
            },
            {
                "name": "Black Spike Veronica (No Status)",
                "asset": "Black Spike Veronica.png"
            },
            {
                "name": "Black Spike Bluebonnet (No Status)",
                "asset": "Black Spike Bluebonnet.png"
            },
            {
                "name": "Black Spike Azure (No Status)",
                "asset": "Black Spike Azure.png"
            },
            {
                "name": "Black Spike Capri (No Status)",
                "asset": "Black Spike Capri.png"
            },
            {
                "name": "Black Spike Fluorescent Blue (No Status)",
                "asset": "Black Spike Fluorescent Blue.png"
            },
            {
                "name": "Black Spike Munsell 5G (No Status)",
                "asset": "Black Spike Munsell 5G.png"
            },
            {
                "name": "Black Spike Erin (No Status)",
                "asset": "Black Spike Erin.png"
            },
            {
                "name": "Black Spike Harlequin (No Status)",
                "asset": "Black Spike Harlequin.png"
            },
            {
                "name": "Black Spike Acid Green (No Status)",
                "asset": "Black Spike Acid Green.png"
            },
            {
                "name": "Black Spike Chartreuse (No Status)",
                "asset": "Black Spike Chartreuse.png"
            },
            {
                "name": "Black Spike Lemon (No Status)",
                "asset": "Black Spike Lemon.png"
            },
            {
                "name": "Black Spike Saffron (No Status)",
                "asset": "Black Spike Saffron.png"
            },
            {
                "name": "Black Spike Butterscotch (No Status)",
                "asset": "Black Spike Butterscotch.png"
            },
            {
                "name": "Black Spike Safety Orange (No Status)",
                "asset": "Black Spike Safety Orange.png"
            },
            {
                "name": "Black Spike Tangelo (No Status)",
                "asset": "Black Spike Tangelo.png"
            },
            {
                "name": "Black Spike Vermillion (No Status)",
                "asset": "Black Spike Vermillion.png"
            },
            {
                "name": "White Wave Bubblegum (No Status)",
                "asset": "White Wave Bubblegum.png"
            },
            {
                "name": "White Wave Rose Pompadour (No Status)",
                "asset": "White Wave Rose Pompadour.png"
            },
            {
                "name": "White Wave Rose Pink (No Status)",
                "asset": "White Wave Rose Pink.png"
            },
            {
                "name": "White Wave Ultra Pink (No Status)",
                "asset": "White Wave Ultra Pink.png"
            },
            {
                "name": "White Wave Lavender (No Status)",
                "asset": "White Wave Lavender.png"
            },
            {
                "name": "White Wave Cornflower (No Status)",
                "asset": "White Wave Cornflower.png"
            },
            {
                "name": "White Wave Maya Blue (No Status)",
                "asset": "White Wave Maya Blue.png"
            },
            {
                "name": "White Wave Sky Blue (No Status)",
                "asset": "White Wave Sky Blue.png"
            },
            {
                "name": "White Wave Celeste (No Status)",
                "asset": "White Wave Celeste.png"
            },
            {
                "name": "White Wave Celadon (No Status)",
                "asset": "White Wave Celadon.png"
            },
            {
                "name": "White Wave Pale Green (No Status)",
                "asset": "White Wave Pale Green.png"
            },
            {
                "name": "White Wave Mantis (No Status)",
                "asset": "White Wave Mantis.png"
            },
            {
                "name": "White Wave Green Tea (No Status)",
                "asset": "White Wave Green Tea.png"
            },
            {
                "name": "White Wave Calamansi (No Status)",
                "asset": "White Wave Calamansi.png"
            },
            {
                "name": "White Wave Mellow Yellow (No Status)",
                "asset": "White Wave Mellow Yellow.png"
            },
            {
                "name": "White Wave Moccasin (No Status)",
                "asset": "White Wave Moccasin.png"
            },
            {
                "name": "White Wave Apricot (No Status)",
                "asset": "White Wave Apricot.png"
            },
            {
                "name": "White Wave Coral (No Status)",
                "asset": "White Wave Coral.png"
            },
            {
                "name": "White Wave Atomic Tangerine (No Status)",
                "asset": "White Wave Atomic Tangerine.png"
            },
            {
                "name": "White Wave Tango (No Status)",
                "asset": "White Wave Tango.png"
            },
            {
                "name": "White Spike Bubblegum (No Status)",
                "asset": "White Spike Bubblegum.png"
            },
            {
                "name": "White Spike Rose Pompadour (No Status)",
                "asset": "White Spike Rose Pompadour.png"
            },
            {
                "name": "White Spike Rose Pink (No Status)",
                "asset": "White Spike Rose Pink.png"
            },
            {
                "name": "White Spike Ultra Pink (No Status)",
                "asset": "White Spike Ultra Pink.png"
            },
            {
                "name": "White Spike Lavender (No Status)",
                "asset": "White Spike Lavender.png"
            },
            {
                "name": "White Spike Cornflower (No Status)",
                "asset": "White Spike Cornflower.png"
            },
            {
                "name": "White Spike Maya Blue (No Status)",
                "asset": "White Spike Maya Blue.png"
            },
            {
                "name": "White Spike Sky Blue (No Status)",
                "asset": "White Spike Sky Blue.png"
            },
            {
                "name": "White Spike Celeste (No Status)",
                "asset": "White Spike Celeste.png"
            },
            {
                "name": "White Spike Celadon (No Status)",
                "asset": "White Spike Celadon.png"
            },
            {
                "name": "White Spike Pale Green (No Status)",
                "asset": "White Spike Pale Green.png"
            },
            {
                "name": "White Spike Mantis (No Status)",
                "asset": "White Spike Mantis.png"
            },
            {
                "name": "White Spike Green Tea (No Status)",
                "asset": "White Spike Green Tea.png"
            },
            {
                "name": "White Spike Calamansi (No Status)",
                "asset": "White Spike Calamansi.png"
            },
            {
                "name": "White Spike Mellow Yellow (No Status)",
                "asset": "White Spike Mellow Yellow.png"
            },
            {
                "name": "White Spike Moccasin (Status)",
                "asset": "White Spike Moccasin.png"
            },
            {
                "name": "White Spike Apricot (No Status)",
                "asset": "White Spike Apricot.png"
            },
            {
                "name": "White Spike Atomic Tangerine (No Status)",
                "asset": "White Spike Atomic Tangerine.png"
            },
            {
                "name": "White Spike Coral (No Status)",
                "asset": "White Spike Coral.png"
            },
            {
                "name": "White Spike Tango (No Status)",
                "asset": "White Spike Tango.png"
            },
            {
                "name": "Black Spike (No Status)",
                "asset": "Black Spike.png"
            },
            {
                "name": "Black Wave (No Status)",
                "asset": "Black Wave.png"
            },
            {
                "name": "White Spike (No Status)",
                "asset": "White Spike.png"
            },
            {
                "name": "White Wave (No Status)",
                "asset": "White Wave.png"
            },
            {
                "name": "Black Spike",
                "asset": "Black Spike 2.png"
            },
            {
                "name": "Black Wave",
                "asset": "Black Wave 2.png"
            },
            {
                "name": "White Spike",
                "asset": "White Spike 2.png"
            },
            {
                "name": "White Wave",
                "asset": "White Wave 2.png"
            },
            {
                "name": "Black Spike On White (No Status)",
                "asset": "Black Spike On White.png"
            },
            {
                "name": "Black Wave On White (No Status)",
                "asset": "Black Wave On White.png"
            },
            {
                "name": "White Spike On Black (No Status)",
                "asset": "White Spike On Black.png"
            },
            {
                "name": "White Wave On Black (No Status)",
                "asset": "White Wave On Black.png"
            },
            {
                "name": "Black Spike On White",
                "asset": "Black Spike On White 2.png"
            },
            {
                "name": "Black Wave On White",
                "asset": "Black Wave On White 2.png"
            },
            {
                "name": "White Spike On Black",
                "asset": "White Spike On Black 2.png"
            },
            {
                "name": "White Wave On Black",
                "asset": "White Wave On Black 2.png"
            },
            {
                "name": "Black Spike Rainbow (No Status)",
                "asset": "Black Spike Rainbow.png"
            },
            {
                "name": "Black Wave Rainbow (No Status)",
                "asset": "Black Wave Rainbow.png"
            },
            {
                "name": "White Spike Rainbow (No Status)",
                "asset": "White Spike Rainbow.png"
            },
            {
                "name": "White Wave Rainbow (No Status)",
                "asset": "White Wave Rainbow.png"
            },
            {
                "name": "Black Spike Rainbow",
                "asset": "Black Spike Rainbow 2.png"
            },
            {
                "name": "Black Wave Rainbow",
                "asset": "Black Wave Rainbow 2.png"
            },
            {
                "name": "White Spike Rainbow",
                "asset": "White Spike Rainbow 2.png"
            },
            {
                "name": "White Wave Rainbow",
                "asset": "White Wave Rainbow 2.png"
            }
        ]
    },
    {
        "name": "Formula 1",
        "banner": "1formula1-banner.png",
        "artist_info": null,
        "artists": [
            findUser('811114235966521364')
        ],
        "decorations": [
            {
                "name": "Tsunoda",
                "asset": "tsunoda.png"
            },
            {
                "name": "Verstappen",
                "asset": "verstappen.png"
            },
            {
                "name": "Hadjar",
                "asset": "hadjar.png"
            },
            {
                "name": "Lawson",
                "asset": "lawson.png"
            },
            {
                "name": "Bearman",
                "asset": "bearman.png"
            },
            {
                "name": "Ocon",
                "asset": "ocon.png"
            },
            {
                "name": "Bortoleto",
                "asset": "bortoleto.png"
            },
            {
                "name": "Hulkenberg",
                "asset": "hulkenberg.png"
            },
            {
                "name": "Alonso",
                "asset": "alonso.png"
            },
            {
                "name": "Stroll",
                "asset": "stroll.png"
            },
            {
                "name": "Piastri",
                "asset": "piastri.png"
            },
            {
                "name": "Norris",
                "asset": "norris.png"
            },
            {
                "name": "Hamilton",
                "asset": "hamilton.png"
            },
            {
                "name": "Leclerc",
                "asset": "leclerc.png"
            },
            {
                "name": "Albon",
                "asset": "albon.png"
            },
            {
                "name": "Sainz",
                "asset": "sainz.png"
            },
            {
                "name": "Antonelli",
                "asset": "antonelli.png"
            },
            {
                "name": "Russell",
                "asset": "russel.png"
            },
            {
                "name": "Colapinto",
                "asset": "colapinto.png"
            },
            {
                "name": "Doohan",
                "asset": "doohan.png"
            },
            {
                "name": "Gasly",
                "asset": "gasly.png"
            },
            {
                "name": "Bianchi",
                "asset": "bianchi.png"
            },
            {
                "name": "Perez",
                "asset": "perez.png"
            },
            {
                "name": "Raikkonen",
                "asset": "raikkonen.png"
            },
            {
                "name": "Ricciardo",
                "asset": "ricciardo.png"
            },
            {
                "name": "Rosberg",
                "asset": "rosberg.png"
            },
            {
                "name": "Sargeant",
                "asset": "sargeant.png"
            },
            {
                "name": "Schumacher",
                "asset": "schumacher.png"
            },
            {
                "name": "Senna",
                "asset": "senna.png"
            },
            {
                "name": "Vettel",
                "asset": "vettel.png"
            },
            {
                "name": "Webber",
                "asset": "webber.png"
            },
            {
                "name": "Red Bull",
                "asset": "red bull.png"
            },
            {
                "name": "Vcarb",
                "asset": "vcarb.png"
            },
            {
                "name": "Haas",
                "asset": "haas.png"
            },
            {
                "name": "Sauber",
                "asset": "sauber.png"
            },
            {
                "name": "Aston Martin",
                "asset": "aston martin.png"
            },
            {
                "name": "McLaren",
                "asset": "mclaren.png"
            },
            {
                "name": "Ferrari",
                "asset": "ferrari.png"
            },
            {
                "name": "Williams",
                "asset": "williams.png"
            },
            {
                "name": "Mercedes",
                "asset": "mercedes.png"
            },
            {
                "name": "Alpine",
                "asset": "alpine.png"
            }
        ]
    },
    {
        "name": "Beat Saber",
        "banner": "beatsaber-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1033224131795243008')
        ],
        "decorations": [
            {
                "name": "Beat Sabers",
                "asset": "Beat Sabers.png"
            },
            {
                "name": "Big Slash (Blue)",
                "asset": "Big Slash (Blue).png"
            },
            {
                "name": "Big Slash (Red)",
                "asset": "Big Slash (Red).png"
            },
            {
                "name": "Bombs",
                "asset": "Bombs.png"
            },
            {
                "name": "The Bloq (Blue)",
                "asset": "The Bloq (Blue).png"
            },
            {
                "name": "The Bloq (Red)",
                "asset": "The Bloq (Red).png"
            },
            {
                "name": "The Walls",
                "asset": "The Walls.png"
            }
        ]
    },
    {
        "name": "ANGRY BIRDS",
        "banner": "angrybirds-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1104844219094401215')
        ],
        "decorations": [
            {
                "name": "AB Wood Block",
                "asset": "AB Wood Block Decor.png"
            },
            {
                "name": "AB Glass Block",
                "asset": "AB Glass Block Decor.png"
            },
            {
                "name": "AB Stone Block",
                "asset": "AB Stone Block Decor.png"
            },
            {
                "name": "AB Cheetos Logo",
                "asset": "AB Cheetos Logo Decor.png"
            },
            {
                "name": "AB Coca Cola Logo",
                "asset": "AB Coca Cola Logo Decor.png"
            },
            {
                "name": "AB Seasons Easter Egg Logo",
                "asset": "AB Seasons Easter Egg Logo Decor.png"
            },
            {
                "name": "AB Logo",
                "asset": "AB Logo Decor.png"
            },
            {
                "name": "AB Space Logo",
                "asset": "AB Space Logo Decor.png"
            },
            {
                "name": "AB Space Vuela Tazos Logo",
                "asset": "AB Space Vuela Tazos Logo Decor.png"
            },
            {
                "name": "Attack Of Darth Maul",
                "asset": "Attack Of Darth Maul Decor.png"
            },
            {
                "name": "Darth Vader",
                "asset": "Darth Vader Decor.png"
            },
            {
                "name": "Solar System",
                "asset": "Solar System Decor.png"
            },
            {
                "name": "Pork Federation",
                "asset": "Pork Federation Decor.png"
            },
            {
                "name": "Bomb Space",
                "asset": "Bomb Space Decor.png"
            },
            {
                "name": "Mynock Pigs",
                "asset": "Mynock Pigs Decor.png"
            },
            {
                "name": "Electric Bomb",
                "asset": "Electric Bomb Decor.png"
            },
            {
                "name": "Red Space",
                "asset": "Red Space Decor.png"
            },
            {
                "name": "King Pig",
                "asset": "King Pig Decor.png"
            },
            {
                "name": "Stars",
                "asset": "Stars Decor.png"
            }
        ]
    },
    {
        "name": "RDR2",
        "banner": "rdr2-banner.png",
        "artist_info": null,
        "artists": [
            findUser('929363923822596167')
        ],
        "decorations": [
            {
                "name": "Arthur",
                "asset": "Arthur.png"
            },
            {
                "name": "Dutch",
                "asset": "Dutch.png"
            },
            {
                "name": "Hosea",
                "asset": "Hosea.png"
            },
            {
                "name": "John",
                "asset": "John.png"
            },
            {
                "name": "Sadie",
                "asset": "Sadie.png"
            },
            {
                "name": "RDR II",
                "asset": "RDR_II.png"
            }
        ]
    },
    {
        "name": "EASTER",
        "banner": "easter-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1143994313034960967'),
            findUser('452679089929846784'),
            findUser('811114235966521364'),
            findUser('1088105926030000178'),
            findUser('1139815872874172456')
        ],
        "decorations": [
            {
                "name": "Bunnie",
                "artist": findUser('1143994313034960967'),
                "asset": "bunnie by pixie.png"
            },
            {
                "name": "Choco Bunny",
                "artist": findUser('1143994313034960967'),
                "asset": "choco bunny by pixie.png"
            },
            {
                "name": "Egg Basket",
                "artist": findUser('1143994313034960967'),
                "asset": "egg basket by pixie.png"
            },
            {
                "name": "Community Eggs",
                "artist": findUser('452679089929846784'),
                "asset": "fixed community eggs by zin.png"
            },
            {
                "name": "Easter Bunny",
                "artist": findUser('811114235966521364'),
                "asset": "easter bunny by cal.png"
            },
            {
                "name": "Easter Egg",
                "artist": findUser('811114235966521364'),
                "asset": "easter egg by cal.png"
            },
            {
                "name": "Egg Basket",
                "artist": findUser('811114235966521364'),
                "asset": "egg basket by cal.png"
            },
            {
                "name": "Egg Bowl",
                "artist": findUser('811114235966521364'),
                "asset": "egg bowl by cal.png"
            },
            {
                "name": "Eggs in Grass",
                "artist": findUser('811114235966521364'),
                "asset": "eggs in grass by cal.png"
            },
            {
                "name": "Grass Egg",
                "artist": findUser('1088105926030000178'),
                "asset": "grass egg by sharr.png"
            },
            {
                "name": "Pastel Blue Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel blue easter decor by teto.png"
            },
            {
                "name": "Pastel Cyan Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel cyan easter decor by teto.png"
            },
            {
                "name": "Pastel Green Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel green easter decor by teto.png"
            },
            {
                "name": "Pastel Mint Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel mint easter decor by teto.png"
            },
            {
                "name": "Pastel Orange Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel orange easter decor by teto.png"
            },
            {
                "name": "Pastel Pink Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel pink easter decor by teto.png"
            },
            {
                "name": "Pastel Red Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel red easter decor by teto.png"
            },
            {
                "name": "Pastel Teal Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel teal easter decor by teto.png"
            },
            {
                "name": "Pastel Yellow Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel yellow easter decor by teto.png"
            }
        ]
    },
    {
        "name": "BLOONS",
        "banner": "bloons-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1088105926030000178')
        ],
        "decorations": [
            {
                "name": "Adora",
                "asset": "adora.png"
            },
            {
                "name": "Benjamin",
                "asset": "benjamin.png"
            },
            {
                "name": "Brickell",
                "asset": "brickell.png"
            },
            {
                "name": "Churchill",
                "asset": "churchill.png"
            },
            {
                "name": "Corvus",
                "asset": "corvus.png"
            },
            {
                "name": "Etienne",
                "asset": "etienne.png"
            },
            {
                "name": "Ezili",
                "asset": "ezili.png"
            },
            {
                "name": "Gwendolin",
                "asset": "gwendolin.png"
            },
            {
                "name": "Jones",
                "asset": "jones.png"
            },
            {
                "name": "Obyn",
                "asset": "obyn.png"
            },
            {
                "name": "Pat",
                "asset": "pat.png"
            },
            {
                "name": "Psi",
                "asset": "psi.png"
            },
            {
                "name": "Quincy",
                "asset": "quincy.png"
            },
            {
                "name": "Alchemist",
                "asset": "004-Alchemistdecorx.png"
            },
            {
                "name": "Boomerang Monkey",
                "asset": "500-BoomerangMonkeyDecorx.png"
            },
            {
                "name": "Sniper Monkey",
                "asset": "500-SniperMonkeydecorx.png"
            },
            {
                "name": "Geraldox",
                "asset": "geraldox.png"
            },
            {
                "name": "Outclassed by icicle",
                "asset": "out-classed-by-icicle-impalex.png"
            },
            {
                "name": "Rosaliax",
                "asset": "rosaliax.png"
            },
            {
                "name": "True Sun Godx",
                "asset": "truesungodx.png"
            },
            {
                "name": "005-Super Monkey",
                "asset": "005-SuperMonkeydecor.png"
            },
            {
                "name": "005-Wizard Monkey",
                "asset": "005-WizardMokeydecor.png"
            },
            {
                "name": "050-Druid Monkey",
                "asset": "050-DruidMonkeydecor.png"
            },
            {
                "name": "050-Engineer Monkey",
                "asset": "050-EngineerMonkeydecor.png"
            },
            {
                "name": "050-Ice Monkey",
                "asset": "050-IceMonkeydecor.png"
            },
            {
                "name": "500-Monkey Submarine",
                "asset": "500-MonkeySubmarinedecor.png"
            },
            {
                "name": "500-Ninja Monkey",
                "asset": "500-NinjaMonkeydecor.png"
            },
            {
                "name": "Anti-Bloons",
                "asset": "Anti-Bloons.png"
            },
            {
                "name": "Bomb Blitz",
                "asset": "Bomb Blitz.png"
            },
            {
                "name": "Sentry Champion",
                "asset": "Sentry Champion.png"
            },
        ]
    },
    {
        "name": "BAKERS",
        "banner": "nuki-bakery-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1143994313034960967')
        ],
        "decorations": [
            {
                "name": "Pink Boba",
                "asset": "pinkboba.png"
            },
            {
                "name": "Cherry On Top",
                "asset": "cherryontop.png"
            },
            {
                "name": "Chocolate Roll",
                "asset": "choco_roll.png"
            },
            {
                "name": "Strawberry Roll",
                "asset": "strawberry_roll.png"
            },
            {
                "name": "Cookie",
                "asset": "cookie.png"
            },
            {
                "name": "Croissant",
                "asset": "croissant.png"
            },
            {
                "name": "Crumb",
                "asset": "crumb.png"
            },
            {
                "name": "Pink Cupcake Circle",
                "asset": "pinkcupcake.png"
            },
            {
                "name": "Cupcake Tray",
                "asset": "cupcaketray.png"
            },
            {
                "name": "Mixing Bowl",
                "asset": "mixingbowl.png"
            },
            {
                "name": "Pie Slice",
                "asset": "pieslice.png"
            },
            {
                "name": "Strawberries",
                "asset": "strawberries.png"
            },
            {
                "name": "Sundae Bowl",
                "asset": "sundaebowl.png"
            }
        ]
    },
    {
        "name": "STARCRAFT",
        "banner": "starcraft-banner.png",
        "artist_info": null,
        "artists": [
            findUser('713791218160500796')
        ],
        "decorations": [
            {
                "name": "Protoss",
                "asset": "protoss.png"
            },
            {
                "name": "Protoss Green",
                "asset": "Protoss_green.png"
            },
            {
                "name": "Protoss Purple",
                "asset": "Protoss_purp.png"
            },
            {
                "name": "Terran",
                "asset": "terran.png"
            },
            {
                "name": "Terran Green",
                "asset": "terran_green.png"
            },
            {
                "name": "Terran Red",
                "asset": "terran_red.png"
            },
            {
                "name": "Zerg",
                "asset": "zerg.png"
            },
            {
                "name": "Zerg Green",
                "asset": "Zerg_green.png"
            },
            {
                "name": "Zerg Pink",
                "asset": "Zerg_pink.png"
            },
            {
                "name": "Zerg Purple",
                "asset": "Zerg_purp.png"
            }
        ]
    },
    {
        "name": "limbus",
        "banner": "limbus-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1096831760089763860')
        ],
        "decorations": [
            {
                "name": "Don Quixote",
                "asset": "don_quixote.png",
                "summary": "Part of the Limbus Company preset.",
            },
            {
                "name": "Heathcliff",
                "asset": "heathcliff.png"
            },
            {
                "name": "Hong Lu",
                "asset": "hong_lu.png"
            },
            {
                "name": "Ishmael",
                "asset": "ishmael.png"
            },
            {
                "name": "Meursault",
                "asset": "meursault.png"
            },
            {
                "name": "Middle Brother",
                "asset": "middle_brother.png"
            },
            {
                "name": "Ryoshu",
                "asset": "ryoshu.png"
            }
        ]
    },
    {
        "name": "JOJO",
        "banner": "jojo-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1037013172114182234')
        ],
        "decorations": [
            {
                "name": "Aerosmith",
                "asset": "Aerosmith.png"
            },
            {
                "name": "bitesthedustunderrr",
                "asset": "bitesthedustunderrr.png"
            },
            {
                "name": "Echoes Act 1",
                "asset": "echoes_act_1.png"
            },
            {
                "name": "Echoes Act 2",
                "asset": "echoes_act_2.png"
            },
            {
                "name": "Hermit",
                "asset": "hermit.png"
            },
            {
                "name": "Killer Queen",
                "asset": "killer_queen.png"
            },
            {
                "name": "Six Pistols",
                "asset": "SixPistols.png"
            }
        ]
    },
    {
        "name": "DORITOS",
        "banner": "doritos-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1104844219094401215')
        ],
        "decorations": [
            {
                "name": "American Doritos",
                "asset": "Ameican_Doritos_Decor.png"
            },
            {
                "name": "Cheese Doritos",
                "asset": "Cheese_Doritos_Decor.png"
            },
            {
                "name": "Flaming Hot Doritos",
                "asset": "Flaming_Hot_Doritos_Decor.png"
            },
            {
                "name": "Mountain Dew Doritos",
                "asset": "Mountain_Dew_Doritos_Decor.png"
            },
            {
                "name": "Rainbow Doritos",
                "asset": "Raimbow_Doritos_Decor.png"
            },
            {
                "name": "Sweet Chilli Pepper Doritos",
                "asset": "Sweet_Chilli_Pepper_Doritos_Decor.png"
            },
            {
                "name": "Whopper Doritos",
                "asset": "Whopper_Doritos_Decor.png"
            },
            {
                "name": "Sweet Paprika Doritos Bits",
                "asset": "Sweet_Paprika_Doritos_Bits_Decor.png"
            },
            {
                "name": "Honey BBQ Doritos Bits",
                "asset": "Honey_BBQ_Doritos_Bts_Decor.png"
            },
            {
                "name": "Mountain Dew Drink Doritos",
                "asset": "Montain_Dew_Drink_Doritos_Decor.png"
            },
            {
                "name": "Flaming Hot Chicken Fries",
                "asset": "Flaming_Hot_Chicken_Fries_Doritos.png"
            },
            {
                "name": "Chilli Heatwave Chicken Fries",
                "asset": "Chilli_Heatwave_Chicken_Fries_Doritos.png"
            },
            {
                "name": "Cheese Chicken Fries",
                "asset": "Cheese_Chicken_Fries_Doritos.png"
            },
            {
                "name": "Golem American Doritos",
                "asset": "Golem American Doritos Decor.png"
            },
            {
                "name": "Skeleton Cheese Doritos",
                "asset": "Skeleton Cheese Doritos Decor.png"
            },
            {
                "name": "Steve Chilli Heatwave Doritos",
                "asset": "Steve Chilli Heatwave Doritos Decor.png"
            },
            {
                "name": "The Creeper Vinegar Doritos",
                "asset": "The Creeper Vinegar Doritos Decor.png"
            },
            {
                "name": "The Ghast BBQ Doritos",
                "asset": "The Ghast BBQ Doritos Decor.png"
            },
        ]
    },
    {
        "name": "OM NOMS",
        "banner": "omnom-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1139815872874172456')
        ],
        "decorations": [
            {
                "name": "Granny Smith Apple",
                "asset": "apple (granny smith).png"
            },
            {
                "name": "Apple",
                "asset": "apple.png"
            },
            {
                "name": "Banana",
                "asset": "banana.png"
            },
            {
                "name": "Beans",
                "asset": "beans.png"
            },
            {
                "name": "Broccoli",
                "asset": "broccoli.png"
            },
            {
                "name": "Burger",
                "asset": "burger.png"
            },
            {
                "name": "Burrito",
                "asset": "burito.png"
            },
            {
                "name": "Cabbage",
                "asset": "cabbage.png"
            },
            {
                "name": "Carrot",
                "asset": "carrot.png"
            },
            {
                "name": "Cheese",
                "asset": "cheese.png"
            },
            {
                "name": "Chips",
                "asset": "chips.png"
            },
            {
                "name": "Chocolate",
                "asset": "chocolate.png"
            },
            {
                "name": "Real Cookie",
                "asset": "realcookie.png"
            },
            {
                "name": "Corns",
                "asset": "corns.png"
            },
            {
                "name": "Cotton Candy",
                "asset": "cotton candy.png"
            },
            {
                "name": "Real Cupcake",
                "asset": "realcupcake.png"
            },
            {
                "name": "Dragon Fruit",
                "asset": "dragon fruit.png"
            },
            {
                "name": "Fries",
                "asset": "fries.png"
            },
            {
                "name": "Grape",
                "asset": "grape.png"
            },
            {
                "name": "Hot Dog",
                "asset": "hot dog.png"
            },
            {
                "name": "Strawberry Ice Cream",
                "asset": "ice cream (strawberry).png"
            },
            {
                "name": "Jelly Beans",
                "asset": "jelly beans.png"
            },
            {
                "name": "Mandarin",
                "asset": "mandarin.png"
            },
            {
                "name": "Mango",
                "asset": "mango.png"
            },
            {
                "name": "Pancake",
                "asset": "pancake.png"
            },
            {
                "name": "Pie",
                "asset": "pie.png"
            },
            {
                "name": "Pizza",
                "asset": "pizza.png"
            },
            {
                "name": "Popcorn",
                "asset": "popcorns.png"
            },
            {
                "name": "Pudding",
                "asset": "pudding.png"
            },
            {
                "name": "Red Mushroom",
                "asset": "red mushroom (srry i only make 1 mushroom decor cuz i have mycophobia).png"
            },
            {
                "name": "Rice",
                "asset": "rice.png"
            },
            {
                "name": "Salad",
                "asset": "salad.png"
            },
            {
                "name": "Salmon",
                "asset": "salmon.png"
            },
            {
                "name": "Strawberry",
                "asset": "strawberry.png"
            },
            {
                "name": "Taco",
                "asset": "taco.png"
            },
            {
                "name": "Watermelon",
                "asset": "watermelon.png"
            },
            {
                "name": "The Forbidden Cheese",
                "asset": "the forbidden cheese (sulfur).png"
            },
            {
                "name": "Uranium",
                "asset": "Uranium (special).png"
            }
        ]
    },
    {
        "force_break": true,
        "name": "cat person",
        "banner": "cat-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1139815872874172456')
        ],
        "force_pagebreak": true,
        "decorations": [
            {
                "name": "Black Collar Black Cat Ears",
                "asset": "black collar black cat ears.png"
            },
            {
                "name": "Black Collar Blue Cat Ears",
                "asset": "black collar blue cat ears.png"
            },
            {
                "name": "Black Collar Calico Cat Ears",
                "asset": "black collar calico cat ears.png"
            },
            {
                "name": "Black Collar Dark Orange Cat Ears",
                "asset": "black collar dark orange cat ears.png"
            },
            {
                "name": "Black Collar Green Cat Ears",
                "asset": "black collar green cat ears.png"
            },
            {
                "name": "Black Collar Light Gray Cat Ears",
                "asset": "black collar light gray cat ears.png"
            },
            {
                "name": "Black Collar Light Orange Cat Ears",
                "asset": "black collar light orange cat ears.png"
            },
            {
                "name": "Black Collar Light Yellow Cat Ears",
                "asset": "black collar light yellow cat ears.png"
            },
            {
                "name": "Black Collar Purple Cat Ears",
                "asset": "black collar purple cat ears.png"
            },
            {
                "name": "Black Collar Red Cat Ears",
                "asset": "black collar red cat ears.png"
            },
            {
                "name": "Black Collar White Cat Ears",
                "asset": "black collar white cat ears.png"
            },
            {
                "name": "Blue Collar Black Cat Ears",
                "asset": "blue collar black cat ears.png"
            },
            {
                "name": "Blue Collar Blue Cat Ears",
                "asset": "blue collar blue cat ears.png"
            },
            {
                "name": "Blue Collar Calico Cat Ears",
                "asset": "blue collar calico cat ears.png"
            },
            {
                "name": "Blue Collar Dark Orange Cat Ears",
                "asset": "blue collar dark orange cat ears.png"
            },
            {
                "name": "Blue Collar Gray Cat Ears",
                "asset": "blue collar gray cat ears.png"
            },
            {
                "name": "Blue Collar Green Cat Ears",
                "asset": "blue collar green cat ears.png"
            },
            {
                "name": "Blue Collar Light Orange Cat Ears",
                "asset": "blue collar light orange cat ears.png"
            },
            {
                "name": "Blue Collar Purple Cat Ears",
                "asset": "blue collar purple cat ears.png"
            },
            {
                "name": "Blue Collar Red Cat Ears",
                "asset": "blue collar red cat ears.png"
            },
            {
                "name": "Blue Collar White Cat Ears",
                "asset": "blue collar white cat ears.png"
            },
            {
                "name": "Cyan Collar Black Cat Ears",
                "asset": "cyan collar black cat ears.png"
            },
            {
                "name": "Cyan Collar Blue Cat Ears",
                "asset": "cyan collar blue cat ears.png"
            },
            {
                "name": "Cyan Collar Calico Cat Ears",
                "asset": "cyan collar calico cat ears.png"
            },
            {
                "name": "Cyan Collar Dark Orange Cat Ears",
                "asset": "cyan collar dark orange cat ears.png"
            },
            {
                "name": "Cyan Collar Green Cat Ears",
                "asset": "cyan collar green cat ears.png"
            },
            {
                "name": "Cyan Collar Light Gray Cat Ears",
                "asset": "cyan collar light gray cat ears.png"
            },
            {
                "name": "Cyan Collar Light Orange Cat Ears",
                "asset": "cyan collar light orange cat ears.png"
            },
            {
                "name": "Cyan Collar Light Yellow Cat Ears",
                "asset": "cyan collar light yellow cat ears.png"
            },
            {
                "name": "Cyan Collar Red Cat Ears",
                "asset": "cyan collar red cat ears.png"
            },
            {
                "name": "Cyan Collar White Cat Ears",
                "asset": "cyan collar white cat ears.png"
            },
            {
                "name": "Green Collar Black Cat Ears",
                "asset": "green collar black cat ears.png"
            },
            {
                "name": "Green Collar Blue Cat Ears",
                "asset": "green collar blue cat ears.png"
            },
            {
                "name": "Green Collar Calico Cat Ears",
                "asset": "green collar calico cat ears.png"
            },
            {
                "name": "Green Collar Dark Orange Cat Ears",
                "asset": "green collar dark orange cat ears.png"
            },
            {
                "name": "Green Collar Green Cat Ears",
                "asset": "green collar green cat ears.png"
            },
            {
                "name": "Green Collar Light Gray Cat Ears",
                "asset": "green collar light gray cat ears.png"
            },
            {
                "name": "Green Collar Light Orange Cat Ears",
                "asset": "green collar light orange cat ears.png"
            },
            {
                "name": "Green Collar Light Yellow Cat Ears",
                "asset": "green collar light yellow cat ears.png"
            },
            {
                "name": "Green Collar Purple Cat Ears",
                "asset": "green collar purple cat ears.png"
            },
            {
                "name": "Green Collar Red Cat Ears",
                "asset": "green collar red cat ears.png"
            },
            {
                "name": "Green Collar White Cat Ears",
                "asset": "green collar white cat ears.png"
            },
            {
                "name": "Magenta Collar Black Cat Ears",
                "asset": "magneta collar black cat ears.png"
            },
            {
                "name": "Magenta Collar Blue Cat Ears",
                "asset": "magneta collar blue cat ears.png"
            },
            {
                "name": "Magenta Collar Calico Cat Ears",
                "asset": "magneta collar calico cat ears.png"
            },
            {
                "name": "Magenta Collar Dark Orange Cat Ears",
                "asset": "magneta collar dark orange cat ears.png"
            },
            {
                "name": "Magenta Collar Green Cat Ears",
                "asset": "magneta collar green cat ears.png"
            },
            {
                "name": "Magenta Collar Light Gray Cat Ears",
                "asset": "magneta collar light gray cat ears.png"
            },
            {
                "name": "Magenta Collar Light Yellow Cat Ears",
                "asset": "magneta collar light yellow cat ears.png"
            },
            {
                "name": "Magenta Collar Purple Cat Ears",
                "asset": "magneta collar purple cat ears.png"
            },
            {
                "name": "Magenta Collar Red Cat Ears",
                "asset": "magneta red cat ears.png"
            },
            {
                "name": "Magenta Collar White Cat Ears",
                "asset": "magneta collar white cat ears.png"
            },
            {
                "name": "Orange Collar Black Cat Ears",
                "asset": "orange collar black cat ears.png"
            },
            {
                "name": "Orange Collar Blue Cat Ears",
                "asset": "orange collar blue cat ears.png"
            },
            {
                "name": "Orange Collar Calico Cat Ears",
                "asset": "orange collar calico cat ears.png"
            },
            {
                "name": "Orange Collar Dark Orange Cat Ears",
                "asset": "orange collar dark orange cat ears.png"
            },
            {
                "name": "Orange Collar Green Cat Ears",
                "asset": "orange collar green cat ears.png"
            },
            {
                "name": "Orange Collar Light Gray Cat Ears",
                "asset": "orange collar light gray cat ears.png"
            },
            {
                "name": "Orange Collar Light Yellow Cat Ears",
                "asset": "orange collar light yellow cat ears.png"
            },
            {
                "name": "Orange Collar Orange Cat Ears",
                "asset": "orange collar orange cat ears.png"
            },
            {
                "name": "Orange Collar Purple Cat Ears",
                "asset": "orange collar purple cat ears.png"
            },
            {
                "name": "Orange Collar Red Cat Ears",
                "asset": "orange collar red cat ears.png"
            },
            {
                "name": "Orange Collar White Cat Ears",
                "asset": "orange collar white cat ears.png"
            },
            {
                "name": "Red Collar Black Cat Ears",
                "asset": "red collar black cat ears.png"
            },
            {
                "name": "Red Collar Blue Cat Ears",
                "asset": "red collar blue cat ears.png"
            },
            {
                "name": "Red Collar Calico Cat Ears",
                "asset": "red collar calico cat ears.png"
            },
            {
                "name": "Red Collar Dark Orange Cat Ears",
                "asset": "red collar dark orange cat ears.png"
            },
            {
                "name": "Red Collar Green Cat Ears",
                "asset": "red collar green cat ears.png"
            },
            {
                "name": "Red Collar Light Orange Cat Ears",
                "asset": "red collar light orange cat ears.png"
            },
            {
                "name": "Red Collar Light Yellow Cat Ears",
                "asset": "red collar light yellow cat ears.png"
            },
            {
                "name": "Red Collar Purple Cat Ears",
                "asset": "red collar purple cat ears.png"
            },
            {
                "name": "Red Collar Red Cat Ears",
                "asset": "red collar red cat ears.png"
            },
            {
                "name": "Red Collar White Cat Ears",
                "asset": "red collar white cat ears.png"
            },
            {
                "name": "White Collar Black Cat Ears",
                "asset": "white collar black cat ears.png"
            },
            {
                "name": "White Collar Blue Cat Ears",
                "asset": "white collar blue cat ears.png"
            },
            {
                "name": "White Collar Calico Cat Ears",
                "asset": "white collar calico cat ears.png"
            },
            {
                "name": "White Collar Dark Orange Cat Ears",
                "asset": "white collar dark orange cat ears.png"
            },
            {
                "name": "White Collar Green Cat Ears",
                "asset": "white collar green cat ears.png"
            },
            {
                "name": "White Collar Light Gray Cat Ears",
                "asset": "white collar light gray cat ears.png"
            },
            {
                "name": "White Collar Light Orange Cat Ears",
                "asset": "white collar light orange cat ears.png"
            },
            {
                "name": "White Collar Light Yellow Cat Ears",
                "asset": "white collar light yellow cat ears.png"
            },
            {
                "name": "White Collar Purple Cat Ears",
                "asset": "white collar purple cat ears.png"
            },
            {
                "name": "White Collar Red Cat Ears",
                "asset": "white collar red cat ears.png"
            },
            {
                "name": "White Collar White Cat Ears",
                "asset": "white collar white cat ears.png"
            },
            {
                "name": "Blue Cat Ears",
                "asset": "blue cat ears.png"
            },
            {
                "name": "Calico Cat Ears",
                "asset": "calico cat ears.png"
            },
            {
                "name": "Cyan Cat Ears",
                "asset": "cyan cat ears.png"
            },
            {
                "name": "Dark Orange Cat Ears",
                "asset": "dark orange cat ears.png"
            },
            {
                "name": "Green Cat Ears",
                "asset": "green cat ears.png"
            },
            {
                "name": "Light Gray Cat Ears",
                "asset": "light gray cat ears.png"
            },
            {
                "name": "Light Yellow Cat Ears",
                "asset": "light yellow cat ears.png"
            },
            {
                "name": "Purple Cat Ears",
                "asset": "purple cat ears.png"
            },
            {
                "name": "Red Cat Ears",
                "asset": "red cat ears.png"
            },
            {
                "name": "White Cat Ears",
                "asset": "white cat ears.png"
            }
        ]
    },
    {
        "name": "GENSHIN",
        "banner": "genshin-banner.png",
        "artist_info": null,
        "artists": [
            findUser('452679089929846784')
        ],
        "decorations": [
            {
                "name": "Xiangling Skill",
                "asset": "xiangling_skill.png"
            },
            {
                "name": "Greater Lord Rukkhadevata",
                "asset": "Greater_Lord_Rukkhadevata.png"
            },
            {
                "name": "Nahida",
                "asset": "Nahida.png"
            },
            {
                "name": "Nahida Skill",
                "asset": "nahida_skill.png"
            },
            {
                "name": "Layla Skill",
                "asset": "layla_skill.png"
            },
            {
                "name": "Kirara Skill",
                "asset": "kirara-skill.png"
            },
            {
                "name": "Charlotte Skill",
                "asset": "charlotte_skill.png"
            },
            {
                "name": "Chevreuse Skill",
                "asset": "chevreuse_skill.png"
            },
            {
                "name": "Citlali",
                "asset": "citlali.png"
            },
            {
                "name": "Varesa",
                "asset": "Varesa.png"
            },
            {
                "name": "Skirk",
                "asset": "Skirk.png"
            },
            {
                "name": "Dahlia",
                "asset": "Dahlia.png"
            },
        ]
    },
    {
        "name": "POKEMON",
        "banner": "pokemon-banner.png",
        "artist_info": null,
        "artists": [
            findUser('323205750262595595')
        ],
        "decorations": [
            {
                "name": "Cynthia",
                "asset": "cynthia.png"
            },
            {
                "name": "Natural Harmonia Gropius",
                "asset": "N.png"
            },
            {
                "name": "Giratina",
                "asset": "giratina.png"
            },
            {
                "name": "Ceruledge",
                "asset": "ceruledge.png"
            },
            {
                "name": "Reshiram",
                "asset": "reshiram.png"
            },
            {
                "name": "Mew",
                "asset": "mew.png"
            }
        ]
    },
    {
        "name": "BFDI",
        "banner": "bfdi-banner.png",
        "artist_info": null,
        "artists": [
            findUser('902661352680751144')
        ],
        "decorations": [
            {
                "name": "Bomby and Nickel",
                "asset": "bomby-and-nickel.png"
            },
            {
                "name": "Dirt Cake",
                "asset": "dirt-cake.png"
            },
            {
                "name": "Freesmart",
                "asset": "freesmart-alternates.png"
            },
            {
                "name": "Gumdrop Galore",
                "asset": "gumdrop-galore.png"
            },
            {
                "name": "Inside Bubble",
                "asset": "inside-bubble.png"
            },
            {
                "name": "Inside the donut hole",
                "asset": "inside-the-donut-hole.png"
            },
            {
                "name": "Pop that bubble",
                "asset": "pop-that-bubble.png"
            },
            {
                "name": "Rocky Barf",
                "asset": "rocky-barf.png"
            }
        ]
    },
    {
        "name": "FNF",
        "banner": "fnf-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1104844219094401215')
        ],
        "decorations": [
            {
                "name": "Darnell Sticker",
                "asset": "DARNELL_Sticker_Decor.png"
            },
            {
                "name": "Face Sticker",
                "asset": "FACE_Sticker_Decor.png"
            },
            {
                "name": "Tankman Sticker",
                "asset": "TANKMAN_Sticker_Decor.png"
            },
            {
                "name": "GF Sticker",
                "asset": "GF_Sticker_Decor.png"
            },
            {
                "name": "Daddy Dearest Sticker",
                "asset": "DADDY_DEAREST_Sticker_Decor.png"
            },
            {
                "name": "Mommy Dearest Sticker",
                "asset": "MOMMY_DEAREST_Sticker_Decor.png"
            },
            {
                "name": "Sempai Sticker",
                "asset": "SEMPAI_Sticker_Decor.png"
            },
            {
                "name": "Ski And Pump Sticker",
                "asset": "SKIDANDPUMP_Sticker_Decor.png"
            },
            {
                "name": "Speakers Sticker",
                "asset": "SPEAKERS_Sticker_Decor.png"
            },
            {
                "name": "Spirit Sticker",
                "asset": "SPIRIT_Sticker_Decor.png"
            },
            {
                "name": "Lemon Demon Sticker",
                "asset": "LEMON_DEMON_Sticker_Decor.png"
            },
            {
                "name": "BF Sticker",
                "asset": "Bf_Sticker_Decor.png"
            },
            {
                "name": "Pico Sticker",
                "asset": "PICO_Sticker_Decor.png"
            },
            {
                "name": "Nene Sticker",
                "asset": "NENE_Sticker_Decor.png"
            },
            {
                "name": "BF Fan",
                "asset": "Bf_Fan_Decor.png"
            },
            {
                "name": "FNF Player",
                "asset": "FNF_Player_Decor.png"
            },
            {
                "name": "GF Sit",
                "asset": "GF_Sit_Decor.png"
            }
        ]
    },
    {
        "name": "Pizza",
        "banner": "pizza-banner.png",
        "artist_info": null,
        "artists": [
            findUser('855561944257789973')
        ],
        "decorations": [
            {
                "name": "Chef",
                "asset": "chef.png"
            },
            {
                "name": "Chef Hat",
                "asset": "chefhat.png"
            },
            {
                "name": "Goo",
                "asset": "goo.png"
            },
            {
                "name": "Mouth",
                "asset": "mouth.png"
            },
            {
                "name": "Rat Knife",
                "asset": "ratknife.png"
            },
            {
                "name": "Brick",
                "asset": "brick.png"
            }
        ]
    },
    {
        "name": "Kitsune",
        "banner": "kitsune-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1187559332703899708')
        ],
        "decorations": [
            {
                "name": "Black Mask",
                "asset": "Blackmask.png"
            },
            {
                "name": "Blue Mask",
                "asset": "Bluemask.png"
            },
            {
                "name": "Green Mask",
                "asset": "Greenmask.png"
            },
            {
                "name": "Pink Mask",
                "asset": "Pinkmask.png"
            },
            {
                "name": "Purple Mask",
                "asset": "Purplemask.png"
            },
            {
                "name": "Red Mask",
                "asset": "Redmask.png"
            }
        ]
    },
    {
        "name": "NEON",
        "banner": "neon-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1071722654723219587')
        ],
        "decorations": [
            {
                "name": "Flamelike",
                "asset": "flamelike.png"
            },
            {
                "name": "Prideful",
                "asset": "prideful.png"
            },
            {
                "name": "Split Globe",
                "asset": "split-globe.png"
            },
            {
                "name": "Glitch",
                "asset": "glitch.png"
            },
            {
                "name": "RGB Circle",
                "asset": "rgbcircle.png"
            },
            {
                "name": "Purple Glow",
                "asset": "purple-glow.png"
            },
            {
                "name": "Geometric",
                "asset": "geometric.png"
            },
            {
                "name": "Particle Circle",
                "asset": "particle-circle.png"
            },
            {
                "name": "Retro Car",
                "asset": "retrocar.png"
            },
            {
                "name": "Runic",
                "asset": "runic.png"
            },
            {
                "name": "Wireframe",
                "asset": "wireframe.png"
            },
            {
                "name": "Galaxy",
                "asset": "Galaxy.png"
            }
        ]
    },
    {
        "name": "Stardew",
        "banner": "1stardew-banner.png",
        "artist_info": null,
        "artists": [
            findUser('811114235966521364')
        ],
        "decorations": [
            {
                "name": "Abigail",
                "asset": "abigail.png"
            },
            {
                "name": "Alex",
                "asset": "alex.png"
            },
            {
                "name": "Elliott",
                "asset": "elliott.png"
            },
            {
                "name": "Emily",
                "asset": "emily.png"
            },
            {
                "name": "Haley",
                "asset": "haley.png"
            },
            {
                "name": "Harvey",
                "asset": "harvey.png"
            },
            {
                "name": "Hat Mouse",
                "asset": "hatmouse.png"
            },
            {
                "name": "Junimo",
                "asset": "junimo.png"
            },
            {
                "name": "Leah",
                "asset": "leah.png"
            },
            {
                "name": "Maru",
                "asset": "maru.png"
            },
            {
                "name": "Mr Qi",
                "asset": "mrqi.png"
            },
            {
                "name": "Pendant",
                "asset": "pendant.png"
            },
            {
                "name": "Penny",
                "asset": "penny.png"
            },
            {
                "name": "Sam",
                "asset": "sam.png"
            },
            {
                "name": "Sebastian",
                "asset": "sebastian.png"
            },
            {
                "name": "Shane",
                "asset": "shane.png"
            },
            {
                "name": "Portrait",
                "asset": "portrait.png"
            }
        ]
    },
    {
        "name": "Squish",
        "banner": "1squishmallow-banner.png",
        "artist_info": null,
        "artists": [
            findUser('811114235966521364')
        ],
        "decorations": [
            {
                "name": "Carotene",
                "asset": "carotene.png"
            },
            {
                "name": "Davina",
                "asset": "davina.png"
            },
            {
                "name": "Mario",
                "asset": "mario.png"
            },
            {
                "name": "Rebecca",
                "asset": "rebecca.png"
            },
            {
                "name": "Tristan",
                "asset": "tristan.png"
            },
            {
                "name": "Omnomnom",
                "asset": "omnomnom.png"
            },
            {
                "name": "Sam Sundae",
                "asset": "sam sundae.png"
            },
            {
                "name": "Pom Pom Burger",
                "asset": "pom pom burger.png"
            },
            {
                "name": "Akilah",
                "asset": "akilah.png"
            }
        ]
    },
    {
        "force_break": true,
        "name": "BUTTERFLY",
        "banner": "nuki-crystal-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1143994313034960967')
        ],
        "force_pagebreak": true,
        "decorations": [
            {
                "name": "Dandelion Autumn",
                "asset": "dandelionautumn.png"
            },
            {
                "name": "Dandelion Blue",
                "asset": "dandelionblue.png"
            },
            {
                "name": "Dandelion Cherry",
                "asset": "dandelioncherry.png"
            },
            {
                "name": "Dandelion Cyan",
                "asset": "dandelioncyan.png"
            },
            {
                "name": "Dandelion Green",
                "asset": "dandeliongreen.png"
            },
            {
                "name": "Dandelion Mystical",
                "asset": "dandelionmystical.png"
            },
            {
                "name": "Dandelion Pink",
                "asset": "dandelionpink.png"
            },
            {
                "name": "Dandelion Purple",
                "asset": "dandelionpurple.png"
            },
            {
                "name": "Dandelion Yellow",
                "asset": "dandelionyellow.png"
            },
            {
                "name": "Dust Azure",
                "asset": "dustazure.png"
            },
            {
                "name": "Dust Cyan",
                "asset": "dustcyan.png"
            },
            {
                "name": "Dust Forest",
                "asset": "dustforest.png"
            },
            {
                "name": "Dust Green",
                "asset": "dustgreen.png"
            },
            {
                "name": "Dust Magical",
                "asset": "dustmagical.png"
            },
            {
                "name": "Dust Pink",
                "asset": "dustpink.png"
            },
            {
                "name": "Dust Purple",
                "asset": "dustpurple.png"
            },
            {
                "name": "Dust Red",
                "asset": "dustred.png"
            },
            {
                "name": "Dust Yellow",
                "asset": "dustyellow.png"
            },
            {
                "name": "Gemstone Autumn",
                "asset": "gemstoneautumn.png"
            },
            {
                "name": "Gemstone Blue",
                "asset": "gemstoneblue.png"
            },
            {
                "name": "Gemstone Green",
                "asset": "gemstonegreen.png"
            },
            {
                "name": "Gemstone Pastel",
                "asset": "gemstonepastel.png"
            },
            {
                "name": "Gemstone Pink",
                "asset": "gemstonepink.png"
            },
            {
                "name": "Gemstone Red",
                "asset": "gemstonered.png"
            },
            {
                "name": "Gemstone Spring",
                "asset": "gemstonespring.png"
            },
            {
                "name": "Gemstone Summer",
                "asset": "gemstonesummer.png"
            },
            {
                "name": "Gemstone Yellow",
                "asset": "gemstoneyellow.png"
            },
            {
                "name": "Holly Autumn",
                "asset": "hollyautumn.png"
            },
            {
                "name": "Holly Blue",
                "asset": "hollyblue.png"
            },
            {
                "name": "Holly Brown",
                "asset": "hollybrown.png"
            },
            {
                "name": "Holly Cherry",
                "asset": "hollycherry.png"
            },
            {
                "name": "Holly Forest",
                "asset": "hollyforest.png"
            },
            {
                "name": "Holly Green",
                "asset": "hollygreen.png"
            },
            {
                "name": "Holly Mint",
                "asset": "hollymint.png"
            },
            {
                "name": "Holly Purple",
                "asset": "hollypurple.png"
            },
            {
                "name": "Holly Red",
                "asset": "hollyred.png"
            },
            {
                "name": "Lantern Autumn",
                "asset": "lanternautumn.png"
            },
            {
                "name": "Lantern Blue",
                "asset": "lanternblue.png"
            },
            {
                "name": "Lantern Cherry",
                "asset": "lanterncherry.png"
            },
            {
                "name": "Lantern Crystal",
                "asset": "lanterncrystal.png"
            },
            {
                "name": "Lantern Green",
                "asset": "lanterngreen.png"
            },
            {
                "name": "Lantern Pink",
                "asset": "lanternpink.png"
            },
            {
                "name": "Lantern Purple",
                "asset": "lanternpurple.png"
            },
            {
                "name": "Lantern Red",
                "asset": "lanternred.png"
            },
            {
                "name": "Lantern Yellow",
                "asset": "lanternyellow.png"
            },
            {
                "name": "No Lantern Autumn",
                "asset": "nolanternautumn.png"
            },
            {
                "name": "No Lantern Blue",
                "asset": "nolanternblue.png"
            },
            {
                "name": "No Lantern Cherry",
                "asset": "nolanterncherry.png"
            },
            {
                "name": "No Lantern Crystal",
                "asset": "nolanterncrystal.png"
            },
            {
                "name": "No Lantern Green",
                "asset": "nolanterngreen.png"
            },
            {
                "name": "No Lantern Pink",
                "asset": "nolanternpink.png"
            },
            {
                "name": "No Lantern Purple",
                "asset": "nolanternpurple.png"
            },
            {
                "name": "No Lantern Red",
                "asset": "nolanternred.png"
            },
            {
                "name": "No Lantern Yellow",
                "asset": "nolanternyellow.png"
            },
            {
                "name": "Quartz Blue",
                "asset": "quartzblue.png"
            },
            {
                "name": "Quartz Cyan",
                "asset": "quartzcyan.png"
            },
            {
                "name": "Quartz Green",
                "asset": "quartzgreen.png"
            },
            {
                "name": "Quartz Orange",
                "asset": "quartzorange.png"
            },
            {
                "name": "Quartz Purple",
                "asset": "quartzpurple.png"
            },
            {
                "name": "Quartz Red",
                "asset": "quartzred.png"
            },
            {
                "name": "Quartz Rose",
                "asset": "quartzrose.png"
            },
            {
                "name": "Quartz Yellow",
                "asset": "quartzyellow.png"
            },
            {
                "name": "Quartz Rainbow",
                "asset": "quartzrainbow.png"
            },
            {
                "name": "Ribbon Blue",
                "asset": "ribbonblue.png"
            },
            {
                "name": "Ribbon Cyan",
                "asset": "ribboncyan.png"
            },
            {
                "name": "Ribbon Forest",
                "asset": "ribbonforest.png"
            },
            {
                "name": "Ribbon Mint",
                "asset": "ribbonmint.png"
            },
            {
                "name": "Ribbon Pink",
                "asset": "ribbonpink.png"
            },
            {
                "name": "Ribbon Purple",
                "asset": "ribbonpurple.png"
            },
            {
                "name": "Ribbon Red",
                "asset": "ribbonred.png"
            },
            {
                "name": "Ribbon Rose",
                "asset": "ribbonrose.png"
            },
            {
                "name": "Ribbon Yellow",
                "asset": "ribbonyellow.png"
            },
            {
                "name": "Sakura Autumn",
                "asset": "sakuraautumn.png"
            },
            {
                "name": "Sakura Dawn",
                "asset": "sakuradawn.png"
            },
            {
                "name": "Sakura Cyan",
                "asset": "sakuracyan.png"
            },
            {
                "name": "Sakura Emerald",
                "asset": "sakuraemerald.png"
            },
            {
                "name": "Sakura Mint",
                "asset": "sakuramint.png"
            },
            {
                "name": "Sakura Moonlight",
                "asset": "sakuramoonlight.png"
            },
            {
                "name": "Sakura Twilight",
                "asset": "sakuratwilight.png"
            },
            {
                "name": "Sakura Pink",
                "asset": "sakurapink.png"
            },
            {
                "name": "Sakura Yellow",
                "asset": "sakurayellow.png"
            },
            {
                "name": "Leaves Autumn",
                "asset": "leavesautumn.png"
            },
            {
                "name": "Leaves Blue",
                "asset": "leavesblue.png"
            },
            {
                "name": "Leaves Green",
                "asset": "leavesgreen.png"
            },
            {
                "name": "Leaves Magenta",
                "asset": "leavesmagenta.png"
            },
            {
                "name": "Leaves Mint",
                "asset": "leavesmint.png"
            },
            {
                "name": "Leaves Pink",
                "asset": "leavespink.png"
            },
            {
                "name": "Leaves Red",
                "asset": "leavesred.png"
            },
            {
                "name": "Leaves Winter",
                "asset": "leaveswinter.png"
            },
            {
                "name": "Leaves Yellow",
                "asset": "leavesyellow.png"
            }
        ]
    },
    {
        "name": "CORAL REEF",
        "banner": "coralbannernew.png",
        "artist_info": null,
        "artists": [
            findUser('2'),
            findUser('1147940825330876538'),
            findUser('272359106839314446'),
            findUser('713791218160500796')
        ],
        "decorations": [
            {
                "name": "Pink Jellyfish",
                "artist": findUser('1147940825330876538'),
                "asset": "pinkjelly.png"
            },
            {
                "name": "Happy Jellyfish",
                "artist": findUser('272359106839314446'),
                "asset": "happyjelly.png"
            },
            {
                "name": "Axolotl Blue",
                "artist": findUser('713791218160500796'),
                "asset": "axoblue.png"
            },
            {
                "name": "Axolotl Pink",
                "artist": findUser('713791218160500796'),
                "asset": "axopink.png"
            },
            {
                "name": "Axolotl Purple",
                "artist": findUser('713791218160500796'),
                "asset": "axopurple.png"
            },
            {
                "name": "Axolotl White",
                "artist": findUser('713791218160500796'),
                "asset": "axowhite.png"
            },
            {
                "name": "Axolotl Yellow",
                "artist": findUser('713791218160500796'),
                "asset": "axoyellow.png"
            },
            {
                "name": "Float Blue",
                "artist": findUser('713791218160500796'),
                "asset": "floatblue.png"
            },
            {
                "name": "Float Green",
                "artist": findUser('713791218160500796'),
                "asset": "floatgreen.png"
            },
            {
                "name": "Float Pink",
                "artist": findUser('713791218160500796'),
                "asset": "floatpink.png"
            },
            {
                "name": "Float Purple",
                "artist": findUser('713791218160500796'),
                "asset": "floatpurple.png"
            },
            {
                "name": "Float Yellow",
                "artist": findUser('713791218160500796'),
                "asset": "floatyellow.png"
            },
            {
                "name": "Blue Knife",
                "artist": findUser('713791218160500796'),
                "asset": "blueknife.png"
            },
            {
                "name": "Green Knife",
                "artist": findUser('713791218160500796'),
                "asset": "greenknife.png"
            },
            {
                "name": "Mint Knife",
                "artist": findUser('713791218160500796'),
                "asset": "mintknife.png"
            },
            {
                "name": "Pink Knife",
                "artist": findUser('713791218160500796'),
                "asset": "pinkknife.png"
            },
            {
                "name": "Purple Knife",
                "artist": findUser('713791218160500796'),
                "asset": "purpleknife.png"
            },
            {
                "name": "Red Knife",
                "artist": findUser('713791218160500796'),
                "asset": "redknife.png"
            },
            {
                "name": "Yellow Knife",
                "artist": findUser('713791218160500796'),
                "asset": "yellowknife.png"
            },
            {
                "name": "White Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "a_ white jelly.png"
            },
            {
                "name": "Cyan Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "cyan jelly.png"
            },
            {
                "name": "Light Purple Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "d_light purple jelly.png"
            },
            {
                "name": "Pink Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "d_pink jelly.png"
            },
            {
                "name": "Light Green Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "f_light green jelly.png"
            },
            {
                "name": "Dark Green Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "g_dark green jelly.png"
            },
            {
                "name": "Light Yellow Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "g_light yellow jelly.png"
            },
            {
                "name": "Gold Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "g1_gold jelly.png"
            }
        ]
    },
    {
        "name": "Zoo",
        "banner": "zoobanner.png",
        "artist_info": null,
        "artists": [
            findUser('1187559332703899708')
        ],
        "decorations": [
            {
                "name": "Bunny Ears",
                "asset": "bunnyears.png"
            },
            {
                "name": "Cat Ears",
                "asset": "catears.png"
            },
            {
                "name": "Deer Ears",
                "asset": "deerears.png"
            },
            {
                "name": "Dog Ears No Tail",
                "asset": "dogearsnotail.png"
            },
            {
                "name": "Dog Ears Tail",
                "asset": "dogearstail.png"
            },
            {
                "name": "Wing Ears",
                "asset": "wingears.png"
            }
        ]
    },
    {
        "name": "Garage",
        "banner": "garage-banner.png",
        "artist_info": null,
        "artists": [
            findUser('217590527015518209')
        ],
        "decorations": [
            {
                "name": "Holly Jolly",
                "asset": "hollyjolly.png"
            },
            {
                "name": "Rated M",
                "asset": "ratedm.png"
            },
            {
                "name": "Beat",
                "asset": "Beat.png"
            },
            {
                "name": "Corn",
                "asset": "Corn.png"
            },
            {
                "name": "Gum",
                "asset": "Gum.png"
            },
            {
                "name": "Evil Dead",
                "asset": "evildead.png"
            },
            {
                "name": "Neon Chainsaw",
                "asset": "neonchainsaw.png"
            },
            {
                "name": "Lava Lamp",
                "asset": "lavadecor.png"
            }
        ]
    },
    {
        "name": "Showtime",
        "banner": "showtime-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1139815872874172456')
        ],
        "decorations": [
            {
                "name": "It's Teto!",
                "asset": "another.png"
            },
            {
                "name": "Cat Cap",
                "asset": "catcap.png"
            },
            {
                "name": "Emu",
                "asset": "Emu.png"
            },
            {
                "name": "Glowy",
                "asset": "less_light.png"
            },
            {
                "name": "Nene",
                "asset": "Nene.png"
            },
            {
                "name": "Peachy",
                "asset": "remake.png"
            },
            {
                "name": "Rui",
                "asset": "Rui.png"
            },
            {
                "name": "Teto Pear",
                "asset": "teto_frame_ig.png"
            },
            {
                "name": "Teto Bow",
                "asset": "tetoo.png"
            },
            {
                "name": "Teto Swirl",
                "asset": "tetoswirl.png"
            },
            {
                "name": "More Teto",
                "asset": "tetoteto.png"
            },
            {
                "name": "Tsukasa",
                "asset": "Tsukasa.png"
            },
            {
                "name": "Wonderhoy",
                "asset": "wonderhoy.png"
            }
        ]
    },
    {
        "name": "Pancake Day",
        "banner": "nuki-pancake-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1143994313034960967')
        ],
        "decorations": [
            {
                "name": "Fork",
                "asset": "fork.png"
            },
            {
                "name": "Munching",
                "asset": "munching.png"
            },
            {
                "name": "Syrup",
                "asset": "syrup.png"
            },
            {
                "name": "Syrup 2",
                "asset": "syrup2.png"
            }
        ]
    },
    {
        "name": "Oxygen",
        "banner": "newoxygen-banner.png",
        "artist_info": null,
        "artists": [
            findUser('713791218160500796')
        ],
        "decorations": [
            {
                "name": "Plumbing",
                "asset": "plumbing.png"
            },
            {
                "name": "Power",
                "asset": "power.png"
            },
            {
                "name": "Radbolts",
                "asset": "radbolts.png"
            },
            {
                "name": "Slickster",
                "asset": "slickster.png"
            }
        ]
    },
    {
        "name": "Sanrio",
        "banner": "nuki-sanrio-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1143994313034960967')
        ],
        "decorations": [
            {
                "name": "Choco",
                "asset": "choco.png"
            },
            {
                "name": "Cinnamoroll",
                "asset": "cinnamoroll.png"
            },
            {
                "name": "Hello Kitty",
                "asset": "kitty.png"
            },
            {
                "name": "Kuromi",
                "asset": "kuromi.png"
            },
            {
                "name": "Melody",
                "asset": "melody.png"
            },
            {
                "name": "Purin",
                "asset": "purin.png"
            }
        ]
    },
    {
        "name": "Scribble",
        "banner": "scribble-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1169709406930350191')
        ],
        "decorations": [
            {
                "name": "Annie's Hair",
                "asset": "Annies_Hair.png"
            },
            {
                "name": "Anton's Hair",
                "asset": "Antons_Hair.png"
            },
            {
                "name": "Cookie",
                "asset": "Cookie_decoration.png"
            },
            {
                "name": "Green Dude",
                "asset": "Greendude_decoration.png"
            },
            {
                "name": "Marcie",
                "asset": "Marcie_decoration.png"
            },
            {
                "name": "Taunt",
                "asset": "Taunt_decor.png"
            }
        ]
    },
    {
        "name": "Horns",
        "banner": "horns-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1187559332703899708')
        ],
        "decorations": [
            {
                "name": "Goat Horns",
                "asset": "goat horns.png"
            },
            {
                "name": "Devil Horns",
                "asset": "devil horns.png"
            },
            {
                "name": "Squishy Horns",
                "asset": "squishy horns.png"
            },
            {
                "name": "Over Horns",
                "asset": "over horns.png"
            },
            {
                "name": "Stylish Horns",
                "asset": "stylish horns.png"
            },
            {
                "name": "Alien Ears",
                "asset": "alien ears.png"
            }
        ]
    },
    {
        "name": "TOILET BOUND",
        "banner": "toilet-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1187559332703899708')
        ],
        "decorations": [
            {
                "name": "Yashiro Clips",
                "asset": "yashiro clips.png"
            },
            {
                "name": "Hanako Ghosts",
                "asset": "hanako ghosts.png"
            },
            {
                "name": "Tsukasa Ghosts",
                "asset": "tsukasa ghosts.png"
            },
            {
                "name": "Yako Ears",
                "asset": "yako ears.png"
            },
            {
                "name": "Yako Ears Alt",
                "asset": "yako ears alt.png"
            }
        ]
    },
    {
        "name": "ABSTRACT",
        "banner": "abstract-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1147940825330876538')
        ],
        "decorations": [
            {
                "name": "Abstract Purple",
                "asset": "abstractpurple.png"
            },
            {
                "name": "Bubble",
                "asset": "bubble.png"
            }
        ]
    },
    {
        "name": "VALENTINES",
        "banner": "love-banner.png",
        "artist_info": null,
        "artists": [
            findUser('760501309937287260')
        ],
        "decorations": [
            {
                "name": "Kisses",
                "asset": "kisses.png"
            },
            {
                "name": "Envelope",
                "asset": "envelope.png"
            },
            {
                "name": "Love Thoughts",
                "asset": "lovethoughts.png"
            },
            {
                "name": "Blue Flower",
                "asset": "blueflower.png"
            },
            {
                "name": "Pink Flower",
                "asset": "pinkflower.png"
            },
            {
                "name": "Blue Candy",
                "asset": "blue candy.png"
            },
            {
                "name": "Pink Candy",
                "asset": "pink candy.png"
            },
            {
                "name": "Blue Hat",
                "asset": "bluehat.png"
            },
            {
                "name": "Pink Hat",
                "asset": "pinkhat.png"
            },
            {
                "name": "Valentines Day",
                "asset": "valentinesday.png"
            }
        ]
    },
    {
        "name": "Sonic Love",
        "banner": "nuki-sonic-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1143994313034960967')
        ],
        "decorations": [
            {
                "name": "Holding Baby",
                "asset": "holdingbaby.png"
            },
            {
                "name": "Greetings",
                "asset": "greetings.png"
            },
            {
                "name": "Sonic Pal",
                "asset": "sonicpal.png"
            },
            {
                "name": "Marry Me",
                "asset": "marryme.png"
            },
            {
                "name": "Big Day",
                "asset": "bigday.png"
            },
            {
                "name": "Streamer",
                "asset": "streamer.png"
            }
        ]
    },
    {
        "name": "BALATRO",
        "banner": "balatro-banner.png",
        "artist_info": null,
        "artists": [
            findUser('323205750262595595')
        ],
        "decorations": [
            {
                "name": "Abstract",
                "asset": "abstract.png"
            },
            {
                "name": "Baron",
                "asset": "baron.png"
            },
            {
                "name": "Canio",
                "asset": "canio.png"
            },
            {
                "name": "Chicot",
                "asset": "chicot.png"
            },
            {
                "name": "Jimbo",
                "asset": "jimbo.png"
            },
            {
                "name": "Mime",
                "asset": "mime.png"
            },
            {
                "name": "Perkeo",
                "asset": "perkeo.png"
            },
            {
                "name": "Red Chip",
                "asset": "red chip.png"
            },
            {
                "name": "Triboulet",
                "asset": "triboulet.png"
            },
            {
                "name": "Wheel of Fortune",
                "asset": "wheel of fortune.png"
            },
            {
                "name": "White Chip",
                "asset": "white chip.png"
            },
            {
                "name": "Yorick",
                "asset": "yorick.png"
            }
        ]
    },
    {
        "name": "DOODLES",
        "banner": "doodles-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1039595490238529606')
        ],
        "decorations": [
            {
                "name": "Brown Alien",
                "asset": "brownalien.png"
            },
            {
                "name": "Purple Alien",
                "asset": "purplealien.png"
            },
            {
                "name": "Sanford",
                "asset": "sanford.png"
            },
            {
                "name": "Deimos",
                "asset": "deimos.png"
            },
            {
                "name": "Dynamite",
                "asset": "dynamite.png"
            },
            {
                "name": "Ganyu",
                "asset": "ganyu.png"
            },
            {
                "name": "Shark with a Trident",
                "asset": "sharktrident.png"
            }
        ]
    },
    {
        "name": "DELICIOUS DUNGEON",
        "banner": "delicious-banner.png",
        "artist_info": null,
        "artists": [
            findUser('975582903557836820')
        ],
        "decorations": [
            {
                "name": "Senshi",
                "asset": "senshi.png"
            },
            {
                "name": "Senshi with mustache",
                "asset": "senshi1.png"
            },
            {
                "name": "Laios Touden",
                "asset": "laios-touden.png"
            },
            {
                "name": "Marcille Donato",
                "asset": "marcille-donato.png"
            },
            {
                "name": "Chilchuck Tims",
                "asset": "chilchuck-tims.png"
            },
            {
                "name": "Falin Touden",
                "asset": "falin-touden.png"
            },
            {
                "name": "Izutsumi",
                "asset": "izutsumi.png"
            },
            {
                "name": "Neck Warmer",
                "asset": "neckwarmer.png"
            }
        ]
    },
    {
        "name": "PRIDE",
        "banner": "pride-banner.png",
        "artist_info": null,
        "artists": [
            findUser('975582903557836820')
        ],
        "decorations": [
            {
                "name": "Acespec",
                "asset": "acespec.png"
            },
            {
                "name": "Agender",
                "asset": "agender.png"
            },
            {
                "name": "Aroace",
                "asset": "aroace.png"
            },
            {
                "name": "Aroacespec",
                "asset": "aroacespec.png"
            },
            {
                "name": "Aromantic",
                "asset": "aromantic.png"
            },
            {
                "name": "Arospec",
                "asset": "arospec.png"
            },
            {
                "name": "Asexual",
                "asset": "asexual.png"
            },
            {
                "name": "Demiagender",
                "asset": "demiagender.png"
            },
            {
                "name": "Demiboy",
                "asset": "demiboy.png"
            },
            {
                "name": "Demigender",
                "asset": "demigender.png"
            },
            {
                "name": "Demigirl",
                "asset": "demigirl.png"
            },
            {
                "name": "Demimix",
                "asset": "demimix.png"
            },
            {
                "name": "Gay",
                "asset": "gay.png"
            },
            {
                "name": "Genderqueer",
                "asset": "genderqueer.png"
            },
            {
                "name": "Lesbian",
                "asset": "lesbian.png"
            },
            {
                "name": "Librafem",
                "asset": "librafem.png"
            },
            {
                "name": "Libramasc",
                "asset": "libramasc.png"
            },
            {
                "name": "Non Binary",
                "asset": "nonbinary.png"
            },
            {
                "name": "Transbian",
                "asset": "transbian.png"
            },
            {
                "name": "Trans Gay",
                "asset": "trans-gay.png"
            },
            {
                "name": "Transgender",
                "asset": "transgender.png"
            },
            {
                "name": "Transfem",
                "asset": "transfem.png"
            },
            {
                "name": "Transmasc",
                "asset": "transmasc.png"
            },
            {
                "name": "Transneutral",
                "asset": "transneutral.png"
            },
            {
                "name": "Abrosexual",
                "asset": "abrosexual.png"
            },
            {
                "name": "Bisexual",
                "asset": "bisexual.png"
            },
            {
                "name": "Omnisexual",
                "asset": "omnisexual.png"
            },
            {
                "name": "Pansexual",
                "asset": "pansexual.png"
            },
            {
                "name": "Polysexual",
                "asset": "polysexual.png"
            }
        ]
    },
    {
        "name": "SPACE",
        "banner": "space-banner.png",
        "artist_info": null,
        "artists": [
            findUser('975582903557836820')
        ],
        "decorations": [
            {
                "name": "Moon",
                "asset": "moon.png"
            },
            {
                "name": "Moon & Stars",
                "asset": "moonstars.png"
            }
        ]
    },
    {
        "name": "TOTORO",
        "banner": "totoro-banner.png",
        "artist_info": null,
        "artists": [
            findUser('760501309937287260')
        ],
        "decorations": [
            {
                "name": "Chibi Totoro",
                "asset": "chibi-totoro1.png"
            },
            {
                "name": "Chibi Totoro Animated",
                "asset": "chibi-totoroanimated.png"
            },
            {
                "name": "Chu Totoro",
                "asset": "chu-totoro.png"
            },
            {
                "name": "Chu Totoro Animated",
                "asset": "chu-totoroanimated.png"
            },
            {
                "name": "Chibi Totoro Green",
                "asset": "chibi-totorofixed.png"
            },
            {
                "name": "Totoro",
                "asset": "totoro.png"
            }
        ]
    },
    {
        "name": "LAKE",
        "banner": "lake-banner.png",
        "artist_info": null,
        "artists": [
            findUser('760501309937287260')
        ],
        "decorations": [
            {
                "name": "Ladybug",
                "asset": "ladybug.png"
            },
            {
                "name": "Ducky",
                "asset": "ducky.png"
            },
            {
                "name": "Leaves",
                "asset": "leaves.png"
            },
            {
                "name": "Picnic",
                "asset": "picnic.png"
            }
        ]
    },
    {
        "name": "DESSERTS",
        "banner": "desserts-banner.png",
        "artist_info": null,
        "artists": [
            findUser('760501309937287260')
        ],
        "decorations": [
            {
                "name": "Boba",
                "asset": "boba.png"
            },
            {
                "name": "Cupcake",
                "asset": "cupcake.png"
            },
            {
                "name": "Ice Cream",
                "asset": "icecream.png"
            },
            {
                "name": "Macarons",
                "asset": "macarons.png"
            },
            {
                "name": "Strawberry Cake",
                "asset": "strawberry-cake.png"
            }
        ]
    },
    {
        "name": "KATSU",
        "banner": "collectors-banner.png",
        "artist_info": null,
        "artists": [
            findUser('773625796807360563')
        ],
        "decorations": [
            {
                "name": "Mew Card",
                "asset": "mewcard.png"
            },
            {
                "name": "Charizard Card",
                "asset": "charizardcard.png"
            },
            {
                "name": "Pokéball",
                "asset": "pokeball.png"
            },
            {
                "name": "GameBoy",
                "asset": "gameboy.png"
            },
            {
                "name": "SNES",
                "asset": "snes.png"
            },
            {
                "name": "Nintendo 3DS",
                "asset": "3ds.png"
            },
            {
                "name": "Nintendo Wii",
                "asset": "wii.png"
            },
            {
                "name": "PlayStation",
                "asset": "playstation.png"
            },
            {
                "name": "DreamCast",
                "asset": "dreamcast.png"
            },
            {
                "name": "Nintendo Switch",
                "asset": "switch.png"
            },
            {
                "name": "Xbox One",
                "asset": "xbox1.png"
            },
            {
                "name": "Xbox Series S",
                "asset": "xboxs.png"
            },
            {
                "name": "My Hero Academia",
                "asset": "mha.png"
            },
            {
                "name": "Sword Art Online",
                "asset": "sao.png"
            },
            {
                "name": "Bleach",
                "asset": "bleach.png"
            },
            {
                "name": "Majoras Mask",
                "asset": "zelda.png"
            },
            {
                "name": "Cat",
                "asset": "cat.png"
            },
            {
                "name": "Naruto",
                "asset": "naruto.png"
            },
            {
                "name": "My Deer Friend Nokotan",
                "asset": "nokotan.png"
            },
            {
                "name": "Antler",
                "asset": "antler.png"
            },
            {
                "name": "Hu Tao",
                "asset": "hutao.png"
            },
            {
                "name": "Cat Hug",
                "asset": "cathug.png"
            },
            {
                "name": "Sword Girl",
                "asset": "swordgirl.png"
            },
            {
                "name": "Jujutsu Kaisen 1",
                "asset": "juju1.png"
            },
            {
                "name": "Jujutsu Kaisen 2",
                "asset": "juju2.png"
            },
            {
                "name": "Girl 1",
                "asset": "girl1.png"
            },
            {
                "name": "Girl 2",
                "asset": "girl2.png"
            },
            {
                "name": "Girl 3",
                "asset": "girl3.png"
            }
        ]
    },
    {
        "name": "UNCATEGORIZED",
        "banner": "uncategorized-banner.png",
        "artist_info": null,
        "artists": [
            findUser("1147940825330876538"),
            findUser("272359106839314446"),
            findUser("1097272848583770212"),
            findUser("760501309937287260"),
            findUser("555409394297339936"),
            findUser("995598255612239884"),
        ],
        "decorations": [
            {
                "name": "Bamboo",
                "artist": findUser("1147940825330876538"),
                "asset": "bamboo.png"
            },
            {
                "name": "Kawaii Cat",
                "artist": findUser("272359106839314446"),
                "asset": "kawaiicat.png"
            },
            {
                "name": "Spheal",
                "artist": findUser("272359106839314446"),
                "asset": "spheal.png"
            },
            {
                "name": "Daggers",
                "artist": findUser("272359106839314446"),
                "asset": "daggers.png"
            },
            {
                "name": "Shuriken",
                "artist": findUser("272359106839314446"),
                "asset": "shuriken.png"
            },
            {
                "name": "Purple Devil",
                "artist": findUser("1097272848583770212"),
                "asset": "purpledevil.png"
            },
            {
                "name": "Pink Devil",
                "artist": findUser("1097272848583770212"),
                "asset": "pinkdevil.png"
            },
            {
                "name": "Green Devil",
                "artist": findUser("1097272848583770212"),
                "asset": "greendevil.png"
            },
            {
                "name": "Neon Devil",
                "artist": findUser("1097272848583770212"),
                "asset": "neondevil.png"
            },
            {
                "name": "Rimuru",
                "artist": findUser("760501309937287260"),
                "asset": "rimuru.png"
            },
            {
                "name": "Piplup using Bubblebeam",
                "artist": findUser("1147940825330876538"),
                "asset": "piplup decor.png"
            },
            {
                "name": "Green Radar",
                "artist": findUser("599654027764039690"),
                "asset": "green-radar.png",
                "summary": "xavvis a loser"
            },
            {
                "name": "Jellies",
                "artist": findUser("1143994313034960967"),
                "asset": "jellies.png"
            },
            {
                "name": "Nyan Cat",
                "artist": findUser("1143994313034960967"),
                "asset": "nyancat.png"
            },
            {
                "name": "Energy Ring",
                "artist": findUser("1031549301001814059"),
                "asset": "energyring.png"
            },
            {
                "name": "Biblically Accurate Angel",
                "artist": findUser("1143994313034960967"),
                "asset": "angel no sparkle.png"
            },
            {
                "name": "Biblically Accurate Angel with Sparkles",
                "artist": findUser("1143994313034960967"),
                "asset": "angel sparkle.png"
            },
            {
                "name": "Pink Ribbon",
                "artist": findUser("1096831760089763860"),
                "asset": "pinkribbon.png"
            },
            {
                "name": "Interstellar Smoke",
                "artist": findUser("334062444718587905"),
                "asset": "0 sec delay.png"
            },
            {
                "name": "Gods Portal",
                "artist": findUser("334062444718587905"),
                "asset": "jellys.png"
            },
            {
                "name": "Dark Fountain Smoke",
                "artist": findUser("555409394297339936"),
                "asset": "darkfountainsmoke.png"
            },
            {
                "name": "Ancient Writings",
                "artist": findUser("995598255612239884"),
                "asset": "ancient writings.png"
            },
            {
                "name": "Barbed Wires",
                "artist": findUser("995598255612239884"),
                "asset": "barbed wires.png"
            },
            {
                "name": "Demon",
                "artist": findUser("995598255612239884"),
                "asset": "demon.png"
            },
            {
                "name": "Sunflowers & Sakuras",
                "artist": findUser("710255469519831050"),
                "asset": "sunflowersandsakurasanimated.png"
            },
            {
                "name": "Lavender & Lillies",
                "artist": findUser("710255469519831050"),
                "asset": "lavenderandlilliesanimated.png"
            },
            {
                "name": "Dandelion Daydreams",
                "artist": findUser("710255469519831050"),
                "asset": "dandeliondaydreamsanimated.png"
            },
            {
                "name": "Realm Prison",
                "artist": findUser("334062444718587905"),
                "asset": "Realm Prison.png"
            },
            {
                "name": "Dimensional Portal",
                "artist": findUser("334062444718587905"),
                "asset": "Dimensional Portal.png"
            },
            {
                "name": "Gods Mirror",
                "artist": findUser("334062444718587905"),
                "asset": "Gods Mirror.png"
            },
        ]
    }
];


// Gets the user info from their id (if they're in the "artists" list)
function findUser(id) {
    const index = artists.findIndex(u => u.id === id);
    if (index === -1) {
        return artists[0];
    }

    const updatedUser = {
        ...artists[index],
        commissions: commissions(artists[index].commissions)
    };

    return updatedUser;
};

// Cleanly renders the artists commissions from config
function commissions(data) {
    if (!data) return null;

    const readableTypes = data
        .map(entry => {
            const label = commission_types[entry.type];
            if (!label) return null;

            if (entry.link) {
                return `<a href="${entry.link}" target="_blank" rel="noopener noreferrer">${label}</a>`;
            }

            return label;
        })
        .filter(Boolean);

    if (readableTypes.length === 0) return null;

    if (data[0].type === "NEGOTIABLE") {
        return commission_types.NEGOTIABLE;
    }

    if (readableTypes.length === 1) {
        return `They accept ${readableTypes[0]} as payment.`;
    }

    const last = readableTypes.pop();
    return `They accept ${readableTypes.join(", ")} or ${last} as payment.`;
};


// Pages
// will default to the first page if no page is set in the url

// url: The name of the page in the url
// name: The name of the tab in the nav bar
// hidden: If it's set to true, it will be hiddden on the nav bar
// content: The html the content container gets set to when the button is clicked
const pages = [
    {
        url: "home",
        name: "Home",
        hidden: false,
        content: `
            <img src="${urls.CDN}/assets/jellyhome.png" alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
            <div class="text-block center">
                <h2>Welcome to Jelly's Space!</h2>
                <p>Here, you can find a huge catalog of custom-made Avatar Decorations to use with the Decor plugin for Vencord!</p>
                <p>^o^</p>
            </div>
            <div class="homenav-grid"></div>
            <div class="text-block center">
                <p>Thank you callievd, jack, marsh & amia!</p>
            </div>
            <div class="text-block center">
                <img src="${urls.CDN}/assets/discordlogo.png" alt="Discord Logo" style="height: 50px; margin-bottom: 0px;" oncontextmenu="return false;" loading="lazy">
                <h2 style="margin: 0px;">If you are interested in creating decors for the site</h2>
                <h2><a href="https://discord.gg/VR2CVDu5nh" target="_blank" rel="noopener">join our Discord Server.</a></h2>
            </div>
        `
    },
    {
        url: "decors",
        name: "Decors",
        hidden: false,
        content: `
            <div class="text-block center">
                <img src="${urls.CDN}/assets/jellydecors.png" alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
                <p>Custom Avatar Decorations for your Vencord!</p>
                <p>Make sure you check out the guide so you know how to use them!</p>
                <p>(>^.^)><(^o^<)</p>
            </div>
            <div class="pagination"></div>

            <div class="categories-container">
            </div>

            <div class="pagination"></div>
        `
    },
    {
        url: "rehash",
        name: "Re-hash",
        hidden: false,
        content: `
            <div class="text-block center">
                <h1>PNG Hash Randomizer</h1>
                <p>Select a PNG or JPEG image. JPEGs will be converted to PNG. Other formats are not supported.</p>
            </div>

            <br>
            <label for="upload" class="custom-file-label">Choose an image</label>
            <br>
            <input type="file" id="upload" accept="image/*" class="hidden" />
            <p id="filename" aria-live="polite"></p>

            <br>
            <button id="button" disabled>Randomize Hash</button>

            <p id="hash">Hash: N/A</p>
            <img id="img" />
        `
    },
    {
        url: "guide",
        name: "Guide",
        hidden: false,
        content: `
            <img src="${urls.CDN}/assets/jellyguide.png" alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
            <div class="text-block center">
                <p>Here's how to get your own custom Decor!</p>
                <p>Follow this guide and you'll be lookin' sweet in no time :D</p>
            </div>

            <div class="text-block center">
                <p><u><b>How to use our Decors:</b></u></p>
                <hr class="inv">
                <p>You will need to make sure you have Vencord installed to use our decorations.</p>
                <p><a href="https://vencord.dev/download/" target="_blank" rel="noopener noreferrer">Download Vencord from here.</a></p>
                <p>Now follow the guide below on how to use our decorations!</p>
            </div>

            <div class="text-block center guide-step">
                <p>Step 1: After Vencord is installed, go to the Plugins menu in your Discord Settings ⚙️</p>
                <p>and enable the Decor Plugin.</p>
                <img src="https://beta.jellys-space.vip/guide/1.png" loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 2: Now go back to Discord Settings ⚙️ and go to the Profiles page.</p>
                <p>Click on "Change Decoration" under Decor.</p>
                <img src="https://beta.jellys-space.vip/guide/2.png" loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 3: Authorize Decor when prompted.</p>
                <img src="https://beta.jellys-space.vip/guide/3.gif" loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 4: Find any decor from our site! Just mouse over & click.</p>
                <img src="https://beta.jellys-space.vip/guide/4.png" loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 5: If you like it, hit the download button.</p>
                <img src="https://beta.jellys-space.vip/guide/5.png" loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 6: Go back to your Profile Settings ⚙️ and click "Change Decoration".</p>
                <p>You'll wanna click the Create button!</p>
                <img src="https://beta.jellys-space.vip/guide/6.png" loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 7: Click the "Browse" button and choose the decor you downloaded.</p>
                <img src="https://beta.jellys-space.vip/guide/7.png" loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 8: Give your decor a name and click "Submit for Review".</p>
                <img src="https://beta.jellys-space.vip/guide/8.png" loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 9: Once submitted, it will appear under "Pending Review".</p>
                <img src="https://beta.jellys-space.vip/guide/9.png" loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 10: Join the <a href="https://discord.gg/dXp2SdxDcP">Decor Server</a> and do the following:</p>
                <img src="https://beta.jellys-space.vip/guide/10.png" loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 11: Enable Direct Messages so our Decorator bot</p>
                <p>can tell you when your decor is approved!</p>
                <img src="https://beta.jellys-space.vip/guide/11.png" loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 12: This is what the DM will look like.</p>
                <img src="https://beta.jellys-space.vip/guide/12.png" loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 13: Your decoration will now be active and visible in your list!</p>
                <img src="https://beta.jellys-space.vip/guide/13.png" loading="lazy">
            </div>
        `
    },
    {
        url: "artists",
        name: "Artists",
        hidden: false,
        content: `
            <img src="${urls.CDN}/assets/jellyartists.png" alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
            <div class="text-block center">
                <p>Here are some of the artists who make Jelly's Space what it is~</p>
                <p>They are amazing people who deserve love~</p>
                <p>You can click the name of the artist to go directly to their Discord Profile!</p>
                <strong>Fancy being featured here? Reach out to Jelly!</strong>
            </div>

            <div class="artists-list">
            </div>
        `
    },
    {
        url: "faq",
        name: "Faq",
        hidden: false,
        content: `
            <img src="${urls.CDN}/assets/jellyfaq.png" alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
            <div class="text-block center">
                <p>Here, you'll find the frequently asked questions</p>
                <p>^-^</p>
            </div>
            <div class="text-block">
                <p><u><b>How do I upload my decors to your site?</b></u></p>
                <p>To submit your decors, you will need to contact me on Discord. You can join the <a href="https://discord.gg/dXp2SdxDcP">Decor Server</a> and then ping me in the #decoration-discussion channel.</p>
                <p>Please follow these guidelines as well as <a href="https://i.imgur.com/WHo9g5S.png">Decor's Guidelines</a>:</p>
                <p><b>1.</b> Must be <b>YOUR OWN</b> work. Stolen/unoriginal decorations will be denied.</p>
                <p><b>2.</b> Must have a particular theme/category, rather than several unrelated decors.</p>
                <p><b>3.</b> Must submit a minimum of 6 decors per submission. I'd rather not create a new category and banner just for 1 or 2 decorations. (Negotiations can be made)</p>
                <p><b>4.</b> AI Generated decorations are NOT accepted at this point in time.</p>
                <p><b>5.</b> Must use the <a href="https://i.imgur.com/PdfzGUl.png">template</a> to ensure correct sizing. Please try to avoid the red and blue areas.</p>
                <hr class="inv">
                <p><u><b>Failed to fetch?</b></u></p>
                <p>If you get the 'Failed to fetch' error upon authorizing Decor, this is likely due to restrictions on your internet network.</p>
                <p>Try using a VPN and seeing if that allows you to authorize!</p>
                <hr class="inv">
                <p><u><b>Request Takedown</b></u></p>
                <p>If for some reason you would like your decoration removed, or you're an artist claiming something as stolen, please contact me immediately. You can find me in the <a href="https://discord.gg/dXp2SdxDcP">Decor Server</a> on Discord.</p>
                <p>All Decorations submitted to me do go through background checks, but people can obviously lie and fake things. It is not the intention of this website to host unauthorized material.</p>
                <hr class="inv">
                <p><u><b>Donators:</b></u></p>
                <p><b>callievd:</b> Thank you SO MUCH for your kind and generous donation, and for the amazing decors you made for the site and for other people. You are a star!</p>
                <p><b>jack:</b> Words cannot express how appreciative I am for your donation. You are the one who made all of this happen; the person who made the magic come to be~ Without you, there is no Decor</p>
                <p><b>doger:</b> You are worth a thousand hugs and more, your kind donation means the world to me ♥</p>
                <p><b>blairdactyl:</b> You are amazing and your donation is very much appreciated. I am hugging you through the screen 🤗</p>
                <p><b>marshift:</b> Thank you SO MUCH for your kind and generous donation 🥺</p>
                <p><b>KRY$TAL:</b> AWW I APPRECIATE YOU!! Thank you for your donation xoxo</p>
                <hr class="inv">
                <p><u><b>Legal:</b></u></p>
                <p>The Discord Logo and all Discord related assets belong to Hammer &amp; Chisel/Discord Inc.</p>
                <p>Vencord is a third-party client modification that <b><u>violates Discord's Terms of Service</u></b>. You understand and accept that risk by using this website.</p>
                <p>This website is non-commercial and contains no ads or paid content of any kind. All decorations are provided by the artists free of charge for personal use only.</p>
                <hr class="inv">
                <p><u><b>Commission Rules:</b></u></p>
                <p>Any artist who is listed as 'accepting commissions' have their own set of rules that apply to them. By contacting said artist for a commission, you accept that they may charge a fee for your request, or outright deny your request at their own discretion.</p>
            </div>
        `
    },
    {
        url: "donate",
        name: "Donate",
        hidden: false,
        content: `
            <img src="${urls.CDN}/assets/jellythx.png" alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
            <div class="text-block center">
                <p>If you would like to donate to me, the links to do so will be below!</p>
                <p>Mwah~</p>
            </div>
            <div class="text-block">
                <p><u><b>Info</b></u></p>
                <p>Hi, I am Jelly~</p>
                <hr class="inv">
                <p>I am the creator of the Jelly's Space Decor website. I am also a Moderator &amp; Reviewer for the Decor Vencord Plugin. Chances are, if you've submitted something to Decor it probably got approved (or denied haha) by me!</p>
                <hr class="inv">
                <p>I made this page because I am currently living in a homeless shelter and my finances are not very great at all. I also struggle with physical and mental disabilities which is making life all the worst, with a lack of sustainable income or workplace environments.</p>
                <hr class="inv">
                <p>Not only that, but my country's government refuses to acknowledge me or support me. No benefits or housing support or income support. My physical disability prevents me from being able to stand or walk for very long, so most jobs aren't applicable. And working from home jobs are scarce.</p>
                <hr class="inv">
                <p>As of June 2025, my situation has slightly improved, but it remains challenging. I would greatly appreciate any support you can offer. I’ve dedicated countless hours, days, weeks, and months to providing a free service. Gaining web development skills through this experience has been a significant milestone for me.</p>
                <hr class="inv">
                <p>As I provide a free service via my Jelly's Space Decor website as well as providing a place for artists to build a public portfolio, I would be extremely appreciative of any and all donations❤️ But rest assured that donating is entirely OPTIONAL.</p>
                <hr class="inv">
                <p>Please note that I am <b><u>NOT</u></b> paywalling the site, adding paid features or implementing ads. Donating is entirely optional. The site will remain free and open source as it always has been!</p>
                <hr class="inv">
                <p><u><b>Donation Links</b></u></p>
                <p><b>Buy Me A Coffee:</b> <a href="https://buymeacoffee.com/jellythecutie">Click Here</a></p>
                <p><b>Donate via GitHub:</b> <a href="https://github.com/sponsors/jellys-space">Click Here</a></p>
            </div>
        `
    }
];

let isPageFocused = document.hasFocus();

window.addEventListener("focus", () => {
    isPageFocused = true;
});

window.addEventListener("blur", () => {
    isPageFocused = false;
});


/********************************
* 1) CONFETTI: HELPER FUNCTION
********************************/
function spawnConfettiPiece(container) {
    if (!isPageFocused) return; 
    if (optionsStore.disable_bg_effect) return;
    const confetti = document.createElement('img');

    const confettiImages = [
        'styles/1jelly.png',
        'styles/2jelly.png',
        'styles/3jelly.png',
        'styles/4jelly.png'
    ];

    const randomImage = confettiImages[Math.floor(Math.random() * confettiImages.length)];
    confetti.src = randomImage;
    confetti.classList.add('confetti-piece');

    const animationName = Math.random() < 0.5 ? 'confettiDriftCW' : 'confettiDriftCCW';
    confetti.style.animationName = animationName;

    const size = Math.floor(Math.random() * 20) + 30;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;

    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = '-50px';

    const smallDelay = Math.random() * 0.5;
    confetti.style.animationDelay = `${smallDelay}s`;

    const duration = 10 + Math.random() * 10;
    confetti.style.animationDuration = `${duration}s`;

    confetti.addEventListener('animationend', () => {
        container.removeChild(confetti);
    });

    container.appendChild(confetti);
}

/********************************
* 2) CONFETTI: CONTINUOUS SPAWN
********************************/
const container = document.querySelector('.confetti-container');
if (container) {
    for (let i = 0; i < 5; i++) {
        spawnConfettiPiece(container);
    }

    setInterval(() => {
        spawnConfettiPiece(container);
    }, 1000);
}

/********************************
* 3) SPARKLY MOUSE TRAIL
********************************/
window.addEventListener('mousemove', function(e) {
    if (optionsStore.disable_mouse_effect) return;
    const arr = [1, 0.9, 0.8, 0.5, 0.2];

    arr.forEach(function(i) {
        const x = (1 - i) * 75;
        const star = document.createElement('div');
        star.className = 'star';

        star.style.top = e.clientY + Math.round(Math.random() * x - x / 2) + 'px';
        star.style.left = e.clientX + Math.round(Math.random() * x - x / 2) + 'px';

        document.body.appendChild(star);

        window.setTimeout(function() {
            document.body.removeChild(star);
        },  Math.round(Math.random() * i * 600));
    });
}, false);

// Checks to see if "?page=" is in the url. if it isn't: it takes you to the home page. if it is but not a valid page: it takes you to the 404 page
window.addEventListener("DOMContentLoaded", () => {
    const currentPath = params.get("page");
    const match = pages.find(page => page.url === currentPath);
    if (params.get("page")) {
        setPage(params.get("page"));
    } else if (!match) {
        setPage('home');
    } else {
        primaryContainer.innerHTML = notFoundHTMLContent;
    }
});

// Adds each page from "pages" to the nav bar
pages.forEach(page => {
    const tab = document.createElement('p');
    tab.textContent = page.name;
    tab.id = `${page.url}-tab`;
    navBar.appendChild(tab);
    tab.addEventListener("click", () => {
        setPage(page.url);
    });
    if (page.hidden) tab.classList.add('hidden');
});

let toggle_73485748 = false;

// Selects the page button on the nav bar and sets the page content
function setPage(url) {
    pageSearchBar.value = '';
    primaryContainer.className = '';
    const page = pages.find(p => p.url === url);
    const tabs = navBar.querySelectorAll('p');
    tabs.forEach((el) => {
        el.classList.remove("selected");
    });

    const match = pages.find(page => page.url === url);
    if (!match) {
        setParams({page: url})
        return primaryContainer.innerHTML = notFoundHTMLContent;
    }

    try {
        navBar.querySelector('#'+page.url+'-tab').classList.add("selected");
        addParams({page: page.url})
        primaryContainer.classList.add(page.url);
        primaryContainer.innerHTML = page.content;

        // Code that's run after the set page loads
        if (page.url === "home") {
            const homenavGrid = primaryContainer.querySelector('.homenav-grid');
            homenavGrid.innerHTML = `
                <div class="var1" onclick="setPage('decors')">
                    <div class="decoration-container">
                        <img class="avatar" src="${urls.CDN}/assets/default-avatar.png" oncontextmenu="return false;" loading="lazy">
                        <img class="deco" src="${marketing[Math.floor(Math.random() * marketing.length)]}" oncontextmenu="return false;" loading="lazy">
                    </div>
                    <h1>Decors</h1>
                </div>
                <div class="var2" onclick="setPage('guide')">
                    <div>
                        <img src="${urls.CDN}/assets/jellythonk.webp" oncontextmenu="return false;" loading="lazy">
                    </div>
                    <h1>How-To</h1>
                </div>
                <div class="var3" onclick="setPage('rehash')">
                    <div>
                        <img src="${urls.CDN}/assets/rehashicon.png" oncontextmenu="return false;" loading="lazy">
                    </div>
                    <h1>Re-Hash</h1>
                </div>
            `;
        } else if (page.url === "decors") {
            renderDecorsData(categories, primaryContainer.querySelector('.categories-container'));
            if (params.get("category") && !categoryFullViewCache) {
                if (toggle_73485748 === false) {
                    toggle_73485748 = true;
                    categoryFullViewCache = params.get("category");
                    openCategoryPage({
                        data: categories.find(c => c.name === categoryFullViewCache)
                    })
                }
            }
        } else if (page.url === "artists") {
            const artistsList = primaryContainer.querySelector('.artists-list');
            artists.forEach((artist) => {
                if (artist.listed != false) {
                    const banner = document.createElement('div');
                    if (artist.assets.banner.animated === true) {
                        banner.innerHTML = `
                            <video src="${urls.CDN}/artists/${artist.assets.banner.asset}-banner.webm" disablepictureinpicture muted loop playsinline autoplay></video>
                        `;
                    } else {
                        banner.innerHTML = `
                            <img src="${urls.CDN}/artists/${artist.assets.banner.asset}-banner.png" oncontextmenu="return false;" loading="lazy">
                        `;
                    }
                    banner.addEventListener("click", () => {
                        openModal({
                            type: modal_types.USER,
                            data: artist
                        });
                    });
                    artistsList.appendChild(banner);
                }
            });
        } else if (page.url === "rehash") {
            let uploadedImageBlob = null;
            let originalFilename = "image";
            let wasConverted = false;

            document.getElementById("upload").addEventListener("change", async (e) => {
              const file = e.target.files[0];
              if (!file) return;
            
              const filenameDisplay = document.getElementById("filename");
              const ext = file.name.split('.').pop().toLowerCase();
            
              if (!["png", "jpg", "jpeg"].includes(ext)) {
                alert("❌ File format not accepted. PNG, APNG and JPG/JPEG only.");
                return;
              }
          
              const arrayBufferToHash = async (buffer) => {
                const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
              };
          
              const bytes = await file.arrayBuffer();
              let icon = "✅";
              wasConverted = false;
          
              if (ext === "jpg" || ext === "jpeg") {
              alert("⚠️ This is a JPEG image and will be changed into PNG format upon rehash.");
                // Convert JPEG to PNG
                icon = "⚠️";
                wasConverted = true;
                const img = new Image();
                img.src = URL.createObjectURL(file);
                await new Promise((res) => img.onload = res);
            
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext("2d").drawImage(img, 0, 0);
                const blob = await new Promise(r => canvas.toBlob(r, "image/png"));
                uploadedImageBlob = await blob.arrayBuffer();
              } else {
                uploadedImageBlob = bytes;
              }
          
              originalFilename = (file.name || "image").replace(/\.(png|jpg|jpeg)$/i, "");
              const fileSizeKb = Math.round(file.size / 1024);
              const hash = await arrayBufferToHash(bytes);
          
              filenameDisplay.innerText = `${icon} Loaded: ${file.name}${wasConverted ? " (converted to PNG)" : ""}
            ${fileSizeKb}kb
            Original Hash: ${hash}`;
              filenameDisplay.style.display = "block";
              document.getElementById("button").disabled = false;
            });

            document.getElementById("button").addEventListener("click", async () => {
              const view = new DataView(uploadedImageBlob);
              const sig = uploadedImageBlob.slice(0, 8);
            
              const splitChunks = () => {
                const chunks = [];
                let offset = 8;
                while (offset < uploadedImageBlob.byteLength) {
                  const length = view.getUint32(offset);
                  const type = new TextDecoder().decode(new Uint8Array(uploadedImageBlob, offset + 4, 4));
                  const data = new Uint8Array(uploadedImageBlob, offset + 8, length);
                  const crc = view.getUint32(offset + 8 + length);
                  chunks.push({ length, type, data, crc });
                  offset += 12 + length;
                }
                return chunks;
              };
          
              const crcTable = (() => {
                let table = [], c;
                for (let n = 0; n < 256; n++) {
                  c = n;
                  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
                  table[n] = c;
                }
                return table;
              })();
          
              const crc32 = (buff) => {
                let crc = ~0;
                for (let i = 0; i < buff.length; i++)
                  crc = (crc >>> 8) ^ crcTable[(crc ^ buff[i]) & 0xff];
                return ~crc >>> 0;
              };
          
              const keyword = "HashScramble";
              const random = Math.random().toString(30).slice(2);
              const textData = new TextEncoder().encode(keyword + "\0" + random);
          
              const createChunk = (type, data) => {
                const input = new Uint8Array(type.length + data.length);
                input.set(new TextEncoder().encode(type), 0);
                input.set(data, type.length);
                const crc = crc32(input);
                return { type, data, crc };
              };
          
              const randomChunk = createChunk("tEXt", textData);
              const chunks = splitChunks();
          
              const newChunks = [];
              for (const chunk of chunks) {
                if (chunk.type === "IEND") newChunks.push(randomChunk);
                newChunks.push(chunk);
              }
          
              const parts = [sig];
              for (const chunk of newChunks) {
                const lengthBuf = new Uint8Array(4);
                new DataView(lengthBuf.buffer).setUint32(0, chunk.data.length);
                parts.push(lengthBuf);
                parts.push(new TextEncoder().encode(chunk.type));
                parts.push(chunk.data);
                const crcBuf = new Uint8Array(4);
                new DataView(crcBuf.buffer).setUint32(0, chunk.crc);
                parts.push(crcBuf);
              }
          
              const finalBlob = new Blob(parts, { type: "image/png" });
              const url = URL.createObjectURL(finalBlob);
          
              const hashBuffer = await crypto.subtle.digest("SHA-256", await finalBlob.arrayBuffer());
              const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
          
              document.getElementById("img").src = url;
              document.getElementById("img").style.display = "block";
              document.getElementById("hash").innerText = "New Hash: " + hashHex;
          
              const a = document.createElement("a");
              a.href = url;
              a.download = originalFilename + "_newhash.png";
              a.click();
            });
        }

        if (page.url != "decors") {
            if (params.get("category")) {
                removeParams("category");
                categoryFullViewCache = null;
            }
        }
    } catch(err) {
        console.error("Error loading page: "+err)
    }
};

function paginate(items, page = 1, perPage = 5) {
    const pages = [];
    let currentPage = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item?.force_break) {
            // Push current page if it has items
            if (currentPage.length > 0) {
                pages.push(currentPage);
                currentPage = [];
            }
            // Force-break item gets its own page
            pages.push([item]);
        } else {
            currentPage.push(item);
            // If we reach perPage, start a new page
            if (currentPage.length === perPage) {
                pages.push(currentPage);
                currentPage = [];
            }
        }
    }

    // Push any leftover items
    if (currentPage.length > 0) {
        pages.push(currentPage);
    }

    const totalPages = pages.length;

    return {
        pageData: pages[page - 1] || [],
        totalPages
    };
};
function createPaginationControls(container, totalPages, currentPage, onPageChange) {
    if (container) {
        container.innerHTML = '';

        const btn = (text, page, disabled = false, isCurrent = false, isNav = false) => {
            const b = document.createElement('button');
            b.textContent = text;
            b.classList.add(isNav ? 'nav-btn' : 'circle-btn');
            if (disabled) b.disabled = true;
            if (isCurrent) b.classList.add('current-page');
            b.addEventListener('click', () => onPageChange(page));
            return b;
        };

        container.appendChild(btn('< Back', currentPage - 1, currentPage === 1, false, true));

        const range = Math.min(5, totalPages);
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + range - 1);
        if (endPage - startPage < range - 1) startPage = Math.max(1, endPage - range + 1);

        if (startPage > 1) {
            container.appendChild(btn('1', 1));
            if (startPage > 2) container.appendChild(document.createTextNode('...'));
        }

        for (let i = startPage; i <= endPage; i++) {
            container.appendChild(btn(i, i, false, i === currentPage));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) container.appendChild(document.createTextNode('...'));
            container.appendChild(btn(totalPages, totalPages));
        }

        container.appendChild(btn('Next >', currentPage + 1, currentPage === totalPages, false, true));
    }
};
function filterCategories(data, search) {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.map(cat => {
        const catMatch = cat.name.toLowerCase().includes(term);
        const filteredProducts = cat.decorations?.filter(p =>
            p.name.toLowerCase().includes(term)
        ) || [];
        const artistMatch = (cat.artists?.length === 1) 
        ? cat.artists[0].name.toLowerCase().includes(term) 
        : false;

        if (catMatch || artistMatch || filteredProducts.length > 0) {
            return {
                ...cat,
                decorations: (catMatch || artistMatch) ? cat.decorations : filteredProducts
            };
        }
        return null;
    }).filter(Boolean);
};


async function renderDecorsData(data, output) {
    const paginationContainers = [];
    
    const mainPaginationById = document.getElementById('pagination');
    if (mainPaginationById) {
        paginationContainers.push(mainPaginationById);
    }
    
    const paginationByClass = document.querySelectorAll('.pagination');
    paginationByClass.forEach(container => {
        if (!paginationContainers.includes(container)) {
            paginationContainers.push(container);
        }
    });

    const paginationByDataAttr = document.querySelectorAll('[data-pagination]');
    paginationByDataAttr.forEach(container => {
        if (!paginationContainers.includes(container)) {
            paginationContainers.push(container);
        }
    });

    let itemsPerPage = 5;
    let filteredData = data;

    const renderPage = (page) => {
        currentPage = page;
        output.innerHTML = '';
        const { pageData, totalPages } = paginate(filteredData, page, itemsPerPage);
        output.scrollTo(0,0);

        if (data.length <= itemsPerPage) {
            paginationContainers.forEach(container => {
                container.classList.add('hidden');
            });
        } else {
            paginationContainers.forEach(container => {
                container.classList.remove('hidden');
            });
        }

        pageData.forEach((categoryData) => {
            renderCategory(categoryData, output)
        });
        
        // Create pagination controls for all containers
        paginationContainers.forEach(container => {
            createPaginationControls(container, totalPages, page, renderPage);
        });
    };

    window.renderPage = renderPage;

    pageSearchBar.addEventListener('input', () => {
        filteredData = filterCategories(data, pageSearchBar.value);
        renderPage(1);
        if (filteredData.length === 0) document.querySelector('.categories-container').innerHTML = `
            <div class="failed-search">
                <img style="padding: 30px;" src="${urls.CDN}/assets/jellydecor404.png">
                <h2>Sorry, we couldn't find any decors that matched your search :(</h2>
            </div>
        `;
    });

    renderPage(1);
};

function renderCategory(categoryData, output) {
    const category = document.createElement("div");
    category.classList.add('category');


    category.innerHTML = `
        <img src="${urls.CDN}/banners/${categoryData.banner}" class="banner" oncontextmenu="return false;" loading="lazy">
        <p class="artist_info">${categoryData.artist_info}</p>
        <div class="decorations"></div>
    `;

    if (categoryData.artist_info === null) category.querySelector('.artist_info').remove();

    const banner = category.querySelector(".banner");
    banner.addEventListener("click", () => {
        openCategoryPage({
            type: modal_types.CATEGORY,
            data: categoryData
        });
    });

    categoryData.decorations.forEach((dco) => {
        rendereDecor(categoryData, dco, category.querySelector('.decorations'))
    });

    output.appendChild(category);
};

function rendereDecor(categoryData, dco, output) {
    let creators = artists[0];
    if (categoryData.artists?.length > 1 && dco.artist) {
        creators = dco.artist;
    } else if (categoryData.artists) {
        creators = categoryData.artists[0];
    }
    const deco = {
        name: dco.name,
        summary: dco.summary,
        asset: dco.asset,
        banner: categoryData.banner,
        artist: creators
    };
    const decoCard = document.createElement("div");
    decoCard.classList.add('deco-card');

    decoCard.innerHTML = `
        <div class="decoration-container">
            <img class="avatar" src="${urls.CDN}/assets/default-avatar.png" oncontextmenu="return false;" loading="lazy">
            <img class="deco" src="${urls.CDN}/decors/${deco.asset}" oncontextmenu="return false;" loading="lazy">
        </div>
    `;

    decoCard.addEventListener("click", () => {
        openModal({
            type: modal_types.DECOR,
            data: deco
        });
    });

    output.appendChild(decoCard);
};





// Modal Code


// height is in pixels (px), can be set to null for auto size
// width is in pixels (px), can be set to null for auto size
// itemsCenter: if the content is centered in the modal, set to false and the content will be on the left
// textCenter: if the text is centered in the modal, set to false and the text will be on the left
// accentColor: the background color of the modal
// bgOpacity: the opacity of the modal background

// Do NOT change these settings here, these are the default settings, some modals could break if these settings are modified
function openModal({
    type = null,
    height = null,
    width = null,
    maxHeight = null,
    maxWidth = null,
    itemsCenter = true,
    textCenter = true,
    accentColor = "#393A41",
    borderColor = "#ffffff57",
    bgOpacity = 1,
    data = null
} = {}) {
    openModalsCache += 1;

    // Code to hide the not top most modal
    try {
        const amount = openModalsCache - 1;
        if (!document.querySelector('.open-modal-' + amount).classList.contains('modalv3')) {
            document.querySelector('.open-modal-' + amount).classList.remove('show');
            document.querySelector('.open-back-modal-' + amount).classList.remove('show');
        }
    } catch {}

    const modal = document.createElement("div");
    modal.classList.add('modal-container');
    modal.classList.add('open-modal-' + openModalsCache);
    modal.style.zIndex = 301 + openModalsCache;

    const modal_back = document.createElement("div");
    modal_back.classList.add('modal-back');
    modal_back.classList.add('open-back-modal-' + openModalsCache);
    modal_back.id = 'modal-back';
    modal_back.style.zIndex = 300 + openModalsCache;

    modal.innerHTML = `
        <div class="modal"></div>
    `;
    const modalContent = modal.querySelector('.modal');

    if (type === modal_types.USER) {
        const user = data;

        maxWidth = 500;
        accentColor = user.colors?.primary;
        bgOpacity = 0.2;

        modalContent.innerHTML = `
            <div id="banner-container">
                <img src="${urls.CDN}/artists/${user.assets.avatar.asset}-avatar.png" alt="${user.name}" style="height: 120px;" oncontextmenu="return false;" loading="lazy">
            </div>
            <h2><a href="https://discord.com/users/${user.id}" target="_blank" rel="noopener noreferrer">${user.name}</a></h2>
            <p>${processSummary(user.sumarry)}</p>
        `;
        Object.assign(modalContent.style, {
            gap: '20px'
        });
    } else if (type === modal_types.DECOR) {
        const deco = data;

        if (isMobile) {
            height = 550;
            width = 400;
            textCenter = false;
            borderColor = null;

            modal.classList.add('modal-mobile');

            modalContent.innerHTML = `
                <img class="pdp-bg" src="${urls.CDN}/banners/${deco.banner}">
                <div class="decoration-title-container">
                    <h2>${deco.name}</h2>
                    <p>By <a onclick="openModal()">${deco.artist.name}</a></p>
                </div>
                <div class="decoration-container">
                    <img class="avatar" src="${urls.CDN}/assets/default-avatar.png" oncontextmenu="return false;" loading="lazy">
                    <img class="deco" src="${urls.CDN}/decors/${deco.asset}" oncontextmenu="return false;" loading="lazy">
                </div>
                <div class="modal-bottom">
                    <button class="download-button" style="width: 100%;">Download</button>
                    <p>Make sure you have read the <a id="guide-page-link">Guide Page</a>. So you know how to apply this Decoration!</p>
                </div>
            `;
            modalContent.querySelector('#guide-page-link').addEventListener("click", () => {
                closeModal();
                setPage('guide');
            });
            Object.assign(modalContent.style, {
                gap: '20px',
                scale: '2'
            });
        } else {
            height = 500;
            width = 700;
            textCenter = false;
            borderColor = null;

            modal.classList.add('modal-desktop');

            let desc = "";
            if (deco.summary) desc = deco.summary;

            modalContent.innerHTML = `
                <div class="modal-left">
                    <img class="pdp-bg" src="${urls.CDN}/banners/${deco.banner}">
                    <div class="decoration-container">
                        <img class="avatar" src="${urls.CDN}/assets/default-avatar.png" oncontextmenu="return false;" loading="lazy">
                        <img class="deco" src="${urls.CDN}/decors/${deco.asset}" oncontextmenu="return false;" loading="lazy">
                    </div>
                    <div class="modal-bottom">
                        <button class="download-button" style="width: 100%;">Download</button>
                    </div>
                </div>
                <div class="modal-right">
                    <div class="decoration-title-container">
                        <h2>${deco.name}</h2>
                        <p id="item-credits">By ${deco.artist.name}</p>
                    </div>
                    <div class="commission-block">
                        <p>This artist is accepting commissions.</p>
                        <p>${deco.artist.commissions}</p>
                        <p>Contact them on Discord <a href="https://discord.com/users/${deco.artist.id}" target="_blank" rel="noopener noreferrer">here</a>.</p>
                    </div>
                    <p id="item-desc">${desc}</p>
                    <div class="modal-bottom-text">
                        <p>Make sure you have read the <a id="guide-page-link">Guide Page</a>. So you know how to apply this Decoration!</p>
                    </div>
                </div>
            `;
            if (deco.artist.listed !== false) {
                modalContent.querySelector('#item-credits').innerHTML = `
                    By <a id="artist-name">${deco.artist.name}</a>
                `;
                modalContent.querySelector('#artist-name').addEventListener("click", () => {
                    openModal({
                        type: modal_types.USER,
                        data: deco.artist
                    });
                });
            }
            modalContent.querySelector('#guide-page-link').addEventListener("click", () => {
                closeModal();
                setPage('guide');
            });

            if (deco.description) {
                modalContent.querySelector('#item-desc').textContent = deco.description;
            }

            const commissionBlock = modalContent.querySelector('.commission-block');
            if (!deco.artist.commissions) commissionBlock.remove();

            Object.assign(modalContent.style, {
                flexDirection: 'unset'
            });
        }

        modalContent.querySelector('.download-button').addEventListener("click", () => {
            downloadPngWithRandomChunk(urls.CDN+'/decors/'+deco.asset)
        });
    } else {
        modalContent.innerHTML = `
            <p>this is a test modal, a modal type was not set</p>
        `;
    }

    Object.assign(modalContent.style, {
        height: height ? height+'px' : 'auto',
        width: width ? width+'px' : 'auto',
        maxHeight: maxHeight ? maxHeight+'px' : 'unset',
        maxWidth: maxWidth ? maxWidth+'px' : 'unset',
        alignItems: itemsCenter ? 'center' : 'unset',
        textAlign: textCenter ? 'center' : 'unset',
        border: borderColor ? '2px solid'+borderColor : 'unset',
        backgroundColor: accentColor ? hexWithOpacity(accentColor, bgOpacity) : 'unset'
    });

    document.body.appendChild(modal);
    document.body.appendChild(modal_back);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modal.classList.add('show');
            modal_back.classList.add('show');
        });
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
};

function closeModal() {
    if (openModalsCache != 0) {
        const modal = document.querySelector('.open-modal-' + openModalsCache);
        const modal_back = document.querySelector('.open-back-modal-' + openModalsCache);

        // Code to hide the not top most modal
        try {
            const amount = openModalsCache - 1;
            if (!document.querySelector('.open-modal-' + amount).classList.contains('modalv3')) {
                document.querySelector('.open-modal-' + amount).classList.add('show');
                document.querySelector('.open-back-modal-' + amount).classList.add('show');
            }
        } catch {}

        if (modal) modal.classList.remove('show');
        if (modal_back) modal_back.classList.remove('show');
        setTimeout(() => {
            if (modal) modal.remove();
            if (modal_back) modal_back.remove();
        }, 300);
        openModalsCache -= 1;
    }
};

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeModal()
    }
});


function openCategoryPage({
    data = null
} = {}) {

    addParams({category: data.name})
    
    const modal = document.createElement("div");
    modal.classList.add("category-clicked-container")

    modal.innerHTML = `
        <div class="pagination">
            <button class="nav-btn">&lt; Back</button>
        </div>
        <div class="categories-container"></div>
    `;
    const modalContent = modal.querySelector('.categories-container');

    renderCategory(data, modalContent)

    document.querySelector('#content').appendChild(modal);
    document.body.scrollTo(0,0);

    modal.querySelector('.nav-btn').addEventListener("click", () => {
        modal.remove();
        removeParams("category");
    });
};




// Other crap

function hexWithOpacity(hex, alpha) {
    if (/^#?[0-9a-fA-F]{3}$/.test(hex)) {
        hex = hex.replace(/^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/, 
            (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`);
    }

    hex = hex.replace(/^#/, '');

    if (/^[0-9a-fA-F]{8}$/.test(hex)) {
        hex = hex.slice(0, 6);
    }

    if (!/^([0-9a-fA-F]{6})$/.test(hex)) {
        throw new Error('Invalid hex color format');
    }

    const clampedAlpha = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
    const alphaHex = clampedAlpha.toString(16).padStart(2, '0');

    return `#${hex}${alphaHex}`;
};



function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};
function processSummary(text) {
    const lines = text
        .replace(/\r?\n/g, '\\n')
        .split(/\\n/g);

    const processedLines = lines.map(line => {
        const trimmed = line.trim();
        const escaped = escapeHtml(trimmed);
        const linked = escaped.replace(
            /(https?:\/\/[^\s<>"']*[^.,!?()\[\]{}\s<>"'])/g,
            url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
        );
        return linked;
    });

    return processedLines.join('<br>');
};



async function downloadPngWithRandomChunk(imageUrl) {
    const fileName = decodeURIComponent(imageUrl.split("/").pop());

    const buff = await fetch(imageUrl).then(res => res.arrayBuffer());
    const view = new DataView(buff);
    const sig = buff.slice(0, 8);

    // Parse PNG chunks
    function splitChunks() {
        let chunks = [], offset = 8;
        while (offset < buff.byteLength) {
            const length = view.getUint32(offset);
            const type = new TextDecoder().decode(new Uint8Array(buff, offset + 4, 4));
            const data = new Uint8Array(buff, offset + 8, length);
            const crc = view.getUint32(offset + 8 + length);
            chunks.push({ type, data, crc });
            offset += 12 + length;
        }
        return chunks;
    }

    // CRC table + function
    const crcTable = Array.from({ length: 256 }, (_, n) => {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        return c;
    });

    const crc32 = (arr) => {
        let crc = ~0;
        for (let i = 0; i < arr.length; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ arr[i]) & 0xff];
        }
        return ~crc >>> 0;
    };

    // Create tEXt chunk
    function createChunk(type, data) {
        const input = new Uint8Array(type.length + data.length);
        input.set(new TextEncoder().encode(type), 0);
        input.set(data, type.length);
        const crc = crc32(input);
        return { type, data, crc };
    }

    const randomChunk = createChunk(
        "tEXt",
        new TextEncoder().encode("HashScramble\0" + Math.random().toString(30).slice(2))
    );

    // Insert before IEND
    const chunks = splitChunks();
    const newChunks = [];
    for (const chunk of chunks) {
        if (chunk.type === "IEND") newChunks.push(randomChunk);
        newChunks.push(chunk);
    }

    // Rebuild PNG
    const parts = [sig];
    for (const chunk of newChunks) {
        const lengthBuf = new Uint8Array(4);
        new DataView(lengthBuf.buffer).setUint32(0, chunk.data.length);
        parts.push(lengthBuf, new TextEncoder().encode(chunk.type), chunk.data);
        const crcBuf = new Uint8Array(4);
        new DataView(crcBuf.buffer).setUint32(0, chunk.crc);
        parts.push(crcBuf);
    }

    // Download
    const blob = new Blob(parts, { type: "image/png" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: fileName });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};







// Global variables for clickablePopup management
let currentclickablePopup = null;
let clickablePopupBackdrop = null;

// Create backdrop element
function createBackdrop() {
    if (!clickablePopupBackdrop) {
        clickablePopupBackdrop = document.createElement('div');
        clickablePopupBackdrop.className = 'clickablePopup-backdrop';
        document.body.appendChild(clickablePopupBackdrop);
        
        clickablePopupBackdrop.addEventListener('click', closeclickablePopup);
    }
    return clickablePopupBackdrop;
}

// Main function to create a button with clickablePopup popup
function createclickablePopupButton(buttonElement, clickablePopupButtons) {
    buttonElement.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Close existing clickablePopup if open
        if (currentclickablePopup) {
            closeclickablePopup();
            return;
        }
        
        // Create clickablePopup popup
        const clickablePopup = document.createElement('div');
        clickablePopup.className = 'clickablePopup-popup';
        
        // Add buttons to clickablePopup
        clickablePopupButtons.forEach(buttonConfig => {
            const button = document.createElement('button');
            button.className = 'clickablePopup-button';
            
            // Add icon if provided
            if (buttonConfig.icon) {
                button.innerHTML = buttonConfig.icon + '<span>' + buttonConfig.name + '</span>';
            } else {
                button.innerHTML = '<span>' + buttonConfig.name + '</span>';
            }
            
            // Add click handler
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Execute the function
                if (typeof buttonConfig.function === 'string') {
                    // If it's a string, evaluate it
                    eval(buttonConfig.function);
                } else if (typeof buttonConfig.function === 'function') {
                    // If it's already a function, call it
                    buttonConfig.function();
                }
                
                closeclickablePopup();
            });
            
            clickablePopup.appendChild(button);
        });
        
        // Position clickablePopup
        document.body.appendChild(clickablePopup);
        positionclickablePopup(buttonElement, clickablePopup);
        
        // Show clickablePopup with animation
        setTimeout(() => {
            clickablePopup.classList.add('show');
        }, 10);
        
        // Set up backdrop
        const backdrop = createBackdrop();
        backdrop.classList.add('active');
        
        currentclickablePopup = clickablePopup;
    });
}

// Position clickablePopup relative to button
function positionclickablePopup(buttonElement, clickablePopup) {
    const buttonRect = buttonElement.getBoundingClientRect();
    const clickablePopupRect = clickablePopup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = buttonRect.right + 10; // Default: right side
    let top = buttonRect.top;
    
    // Check if there's enough space on the right
    if (left + clickablePopupRect.width > viewportWidth - 20) {
        // Not enough space on right, position on left
        left = buttonRect.left - clickablePopupRect.width - 10;
        
        // If still not enough space on left, center it
        if (left < 20) {
            left = buttonRect.left + (buttonRect.width / 2) - (clickablePopupRect.width / 2);
            top = buttonRect.bottom + 10; // Position below button
        }
    }
    
    // Ensure clickablePopup doesn't go off top or bottom of screen
    if (top + clickablePopupRect.height > viewportHeight - 20) {
        top = viewportHeight - clickablePopupRect.height - 20;
    }
    if (top < 20) {
        top = 20;
    }
    
    clickablePopup.style.left = Math.max(20, left) + 'px';
    clickablePopup.style.top = top + 'px';
}

// Close clickablePopup function
function closeclickablePopup() {
    if (currentclickablePopup) {
        currentclickablePopup.classList.remove('show');
        setTimeout(() => {
            if (currentclickablePopup && currentclickablePopup.parentNode) {
                currentclickablePopup.parentNode.removeChild(currentclickablePopup);
            }
            currentclickablePopup = null;
        }, 150);
    }
    
    if (clickablePopupBackdrop) {
        clickablePopupBackdrop.classList.remove('active');
    }
}

// Initialize demo buttons
document.addEventListener('DOMContentLoaded', function() {
    // Basic button example
    createclickablePopupButton(document.getElementById('options-cog'), [
        {
            "name": "Toggle Background Effect",
            "function": "toggleSetting('disable_bg_effect')",
            "icon": null
        },
        {
            "name": "Toggle Mouse Effect",
            "function": "toggleSetting('disable_mouse_effect')",
            "icon": null
        }
    ]);
});
