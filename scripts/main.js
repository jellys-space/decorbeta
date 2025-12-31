const navBar = document.querySelector('.top-nav');
const primaryContainer = document.querySelector('#content');
const pageSearchBar = document.querySelector('.search-bar');

// ===== Spooky "boo!" easter egg =====
(function setupSpookyEgg() {
  if (!pageSearchBar) return;

  // Grab overlay (or create it if missing)
  let overlay = document.getElementById('spookyOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'spookyOverlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `<img src="styles/spooky.png" alt="boo!">`;
    document.body.appendChild(overlay);
  }

  // Preload the image
  const preload = new Image();
  preload.src = 'styles/spooky.png';

  let isShowing = false;

  function showSpooky() {
    if (isShowing) return;
    isShowing = true;

    // NEW: quick page shake while the image is popping in
    document.body.classList.add('page-shake');
    setTimeout(() => {
        document.body.classList.remove('page-shake');
    }, 420);

    overlay.classList.remove('fade-out');
    overlay.classList.add('show');

    // keep your existing auto-hide timing
    setTimeout(() => {
        overlay.classList.add('fade-out');
        overlay.addEventListener('animationend', () => {
            overlay.classList.remove('show', 'fade-out');
            isShowing = false;
        }, { once: true });
    }, 1500); // or your current value
}


  // Trigger on exact "boo!" (case-insensitive), ignoring extra spaces
  pageSearchBar.addEventListener('input', () => {
    const val = (pageSearchBar.value || '').trim().toLowerCase();
    if (val === 'boo!') showSpooky();
  });

  // Optional: allow click to dismiss immediately
  overlay.addEventListener('click', () => {
    if (!overlay.classList.contains('show')) return;
    overlay.classList.add('fade-out');
    overlay.addEventListener('animationend', () => {
      overlay.classList.remove('show', 'fade-out');
      isShowing = false;
    }, { once: true });
  });
})();



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
    CDN: "https://cdn.jellys-space.vip" // The cdn link that assets will use (makes it esier to change if you wanted to use cdn.jellys-space.vip)
};

const notFoundHTMLContent = `
    <img src="${urls.CDN}/assets/jelly404.png", alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
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
    `${urls.CDN}/decors/pink%20pumpkin%20by%20nuki.png`,
    `${urls.CDN}/decors/teefs%20by%20cal.png`,
    `${urls.CDN}/decors/mlem.png`,
    `${urls.CDN}/decors/miles%20morales%20decor.png`,
    `${urls.CDN}/decors/rick%20astley.png`,
    `${urls.CDN}/decors/queen%20bee.png`,
    `${urls.CDN}/decors/plantera.png`,
    `${urls.CDN}/decors/vortex.png`,
    `${urls.CDN}/decors/sunflowersandsakurasanimated.png`,
    `${urls.CDN}/decors/Realm%20Prison.png`,
    `${urls.CDN}/decors/Dimensional%20Portal.png`,
    `${urls.CDN}/decors/Gods%20Mirror.png`,
];


// List of artists

// id: the users discord id
// name: The users discord username (or just a name they want)
// listed: true: the artist is listed in the artists tab. false: the artist is not listed in the artists tab
// assets: for the avatar and banner, put the asset id (e.g <asset>-avatar.png) and "-avatar.png", "-avatar.webm", "-banner.png", and "-banner.webm" will be automatically added when rendering the assets on the client
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
        sumarry: `Hai!!! My name is alide and i go by she/her, im a big fan of the colour pink 🩷\nhttps://alide.straw.page/`,
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
        commissions: []
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
        name: "T8dyi",
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
                "type": "STEAM_GIFTS",
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
        sumarry: `hiiiii im jenku\ni do uh, a lot of different stuff; art, web&bot development, vtube rigging, 3d modelling etcetera etcetera and am studying maths, physics, computer science and design engineering!\nOh also I collect nintendo consoles.\ni also have a couple of presets here and in the actual plugin!\nmy interests are all over the place: mainly nintendo, ultrakill and portal\nmy site is https://jenku.xyz/, more info about me there !!\nhttps://decor.jenku.xyz/ (decor faq) and https://theme.jenku.xyz/ (mobile discord theme maker)`,
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
    {
        id: "1062953673610772480",
        name: "Clockwork",
        assets: {
            avatar: {
                asset: "clockwork",
                animated: false
            },
            banner: {
                asset: "clockwork",
                animated: false
            }
        },
        sumarry: `i do game stuff`,
        colors: {
            primary: "#dee824ff"
        },
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
        id: "1364263466000584764",
        name: "Kim",
        assets: {
            avatar: {
                asset: "kim",
                animated: false
            },
            banner: {
                asset: "kim",
                animated: false
            }
        },
        sumarry: `LCB Card: NO. C351361244 LV. 058, Male and 17. Big fan of Yi Sang and Heathcliff.\nlinks: https://www.youtube.com/@StarAndCityJJS`,
        colors: {
            primary: "#3c3c3cff"
        },
        commissions: []
    },
    {
        id: "1106968627036557322",
        name: "Nype",
        assets: {
            avatar: {
                asset: "nype",
                animated: false
            },
            banner: {
                asset: "nype",
                animated: false
            }
        },
        sumarry: `hi im nype (or oreo as some know me) and i like to do some silly stuff sometimes, also i speedrun and shit, check it out!\nhttps://speedrun.com/users/Nype/about`,
        colors: {
            primary: "#55ba50"
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
        id: "845613407818088498",
        name: "BunBwon",
        listed: false,
        commissions: [
            {
                "type": "NEGOTIABLE",
                "link": null
            }
        ]
    },
    {
        id: "1199872963575550022",
        name: "Fishy",
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
        id: "1317653030652608558",
        name: "reese",
        listed: false,
        commissions: [
            {
                "type": "NEGOTIABLE",
                "link": null
            }
        ]
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
        id: "1167490687789449290",
        name: "Subspace",
        listed: false
    },
    {
        id: "1324198892648009760",
        name: "Kalebinho",
        listed: false
    },
    {
        id: "186133651271057410",
        name: "Kuma",
        listed: false
    },
    {
        id: "736626422717612083",
        name: "CANDYSTAR",
        listed: false
    },
    {
        id: "1098726243920261200",
        name: "Queen",
        listed: false
    },
    {
        id: "994067777579143190",
        name: "Saturn",
        listed: false
    },
];

const categories = [
    {
        "name": "Pokemon Legends ZA",
        "banner": "pokemonza-banner.png",
        "artist_info": `CallieVD is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('811114235966521364')
        ],
        "decorations": [
            {
                "name": "Zygarde Cell",
                "asset": "Zygarde Cell.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"green",
					"video game",
					"white"
				]
            },
            {
                "name": "Zygarde Core",
                "asset": "Zygarde Core.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"green",
					"video game",
					"white"
				]
            },
            {
                "name": "Zygarde 10%",
                "asset": "Zygarde%2010%25.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"green",
					"video game",
					"dog",
					"animal"
				]
            },
            {
                "name": "Zygarde 50%",
                "asset": "Zygarde%2050%25.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"green",
					"black",
					"grey",
					"gray",
					"video game"
				]
            },
            {
                "name": "Zygarde 100% Complete",
                "asset": "Zygarde%20100%25%20Complete.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"green",
					"black",
					"grey",
					"gray",
					"video game"
				]
            },
            {
                "name": "Mega Zygarde",
                "asset": "Mega Zygarde.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"green",
					"black",
					"grey",
					"gray",
					"video game"
				]
            },
            {
                "name": "Ange",
                "asset": "Ange.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"blue",
					"video game",
					"plant"
				]
            },
            {
                "name": "Eternal Flower Floette",
                "asset": "Eternal Flower Floette.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"red",
					"blue",
					"video game",
					"plant"
				]
            },
            {
                "name": "AZ",
                "asset": "AZ.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"white",
					"hair",
					"video game"
				]
            },
            {
                "name": "Harmony",
                "asset": "Harmony.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"white",
					"brown",
					"red",
					"hat",
					"hair",
					"video game"
				]
            },
            {
                "name": "Paxton",
                "asset": "Paxton.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"black",
					"blue",
					"grey",
					"gray",
					"hat",
					"hair",
					"video game"
				]
            },
            {
                "name": "Taunie",
                "asset": "Taunie.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"pink",
					"hair",
					"video game"
				]
            },
            {
                "name": "Urbain",
                "asset": "Urbain.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"pink",
					"hair",
					"video game"
				]
            },
            {
                "name": "Lida",
                "asset": "Lida.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"blue",
					"hair",
					"black",
					"video game"
				]
            },
            {
                "name": "Naveen",
                "asset": "Naveen.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"brown",
					"hair",
					"white",
					"video game"
				]
            },
            {
                "name": "Emma",
                "asset": "Emma.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"grey",
					"gray",
					"beige",
					"yellow",
					"detective",
					"hair",
					"video game"
				]
            },
            {
                "name": "L",
                "asset": "L.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"white",
					"lysandre",
					"hair",
					"video game"
				]
            },
            {
                "name": "Mable",
                "asset": "Mable.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"blue",
					"hair",
					"researcher",
					"goggles",
					"video game"
				]
            },
            {
                "name": "Nurse Joy",
                "asset": "Nurse Joy.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"red",
					"white",
					"hair",
					"video game"
				]
            },
            {
                "name": "Rotom Phone",
                "asset": "Rotom Phone.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"red",
					"orange",
					"video game"
				]
            },
            {
                "name": "Jett",
                "asset": "Jett.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"grey",
					"gray",
					"gold",
					"hair",
					"video game"
				]
            },
            {
                "name": "Vinnie",
                "asset": "Vinnie.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"brown",
					"sun glasses",
					"buneary",
					"pancham",
					"beard",
					"video game"
				]
            },
            {
                "name": "Tarragon",
                "asset": "Tarragon.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"grey",
					"gray",
					"brown",
					"helmet",
					"hair",
					"video game"
				]
            },
            {
                "name": "Canari",
                "asset": "Canari.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"grey",
					"gray",
					"yellow",
					"blue",
					"hair",
					"video game"
				]
            },
            {
                "name": "Gwynn",
                "asset": "Gwynn.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"black",
					"purple",
					"white",
					"hair",
					"video game"
				]
            },
            {
                "name": "Ivor",
                "asset": "Ivor.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"yellow",
					"hair",
					"video game"
				]
            },
            {
                "name": "Philippe",
                "asset": "Philippe.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"black",
					"spikes",
					"hair",
					"video game"
				]
            },
            {
                "name": "Corbeau",
                "asset": "Corbeau.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"purple",
					"pink",
					"glasses",
					"hair",
					"video game"
				]
            },
            {
                "name": "Lebanne",
                "asset": "Lebanne.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"white",
					"maid",
					"bow",
					"ribbon",
					"video game"
				]
            },
            {
                "name": "Jacinthe",
                "asset": "Jacinthe.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"purple",
					"white",
					"ribbon",
					"bow",
					"video game"
				]
            },
            {
                "name": "Griselle",
                "asset": "Griselle.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"white",
					"red",
					"glasses",
					"hair",
					"video game"
				]
            },
            {
                "name": "Grisham",
                "asset": "Grisham.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
				"tags": [
					"white",
					"red",
					"glasses",
					"hair",
					"video game"
				]
            },
            {
                "name": "Mega Feraligatr",
                "asset": "mega feraligatr.png",
                "summary": "Toilet.\n\nPart of the Pokémon Legends: Z-A Preset pack.",
                "tags": [
                    "grey",
                    "red",
                    "gray",
                    "video game",
					"toilet"
                ]
            },
            {
                "name": "Mega Meganium",
                "asset": "mega meganium.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
                "tags": [
                    "pink",
                    "red",
                    "white",
					"flower",
					"antennae",
                    "video game"
                ]
            },
            {
                "name": "Mega Emboar",
                "asset": "mega emboar.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
                "tags": [
                    "gray",
					"grey",
                    "red",
					"fire",
                    "yellow",
                    "video game"
                ]
            },
            {
                "name": "Mega Victreebel",
                "asset": "mega victreebel.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
                "tags": [
                    "green",
                    "brown",
                    "plant",
					"leaf",
                    "video game"
                ]
            },
            {
                "name": "Mega Dragonite",
                "asset": "mega dragonite.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
                "tags": [
                    "white",
                    "blue",
                    "cyan",
					"horns",
					"wings",
                    "video game"
                ]
            },
            {
                "name": "Mega Clefable",
                "asset": "mega clefable.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
                "tags": [
                    "fairy",
                    "pink",
                    "yellow",
					"wings",
                    "video game"
                ]
            },
            {
                "name": "Mega Starmie",
                "asset": "Mega Starmie.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
                "tags": [
                    "purple",
                    "red",
                    "yellow",
                    "video game"
                ]
            },
            {
                "name": "Mega Raichu X",
                "asset": "mega raichu x.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
                "tags": [
                    "orange",
					"yellow",
                    "black",
                    "electric",
                    "video game"
                ]
            },
            {
                "name": "Mega Raichu Y",
                "asset": "mega raichu y.png",
                "summary": "Part of the Pokémon Legends: Z-A Preset pack.",
                "tags": [
                    "yellow",
                    "brown",
                    "electric",
                    "video game"
                ]
            },
        ]
    },
    {
        "name": "Bee Swarm Simulator",
        "banner": "bee-banner.png",
        "artist_info": `Alide is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('1096831760089763860')
        ],
        "decorations": [
            {
                "name": "Demon Bee",
                "asset": "Demon bee.png",
                "summary": "Part of the Bee Swarm Simulator Preset pack.",
            },
            {
                "name": "Tadpole Bee",
                "asset": "Tadpole bee.png",
                "summary": "Part of the Bee Swarm Simulator Preset pack.",
            },
            {
                "name": "Buoyant Bee",
                "asset": "Buoyant bee.png",
                "summary": "Part of the Bee Swarm Simulator Preset pack.",
            },
            {
                "name": "Precise Bee",
                "asset": "Precise bee.png",
                "summary": "Part of the Bee Swarm Simulator Preset pack.",
            },
            {
                "name": "Spicy Bee",
                "asset": "Spicy bee.png",
                "summary": "Part of the Bee Swarm Simulator Preset pack.",
            },
            {
                "name": "Fuzzy Bee",
                "asset": "Fuzzy bee.png",
                "summary": "Part of the Bee Swarm Simulator Preset pack.",
            },
            {
                "name": "Tabby Bee",
                "asset": "Tabby bee.png",
                "summary": "Part of the Bee Swarm Simulator Preset pack.",
            },
            {
                "name": "Gummy Bee",
                "asset": "Gummy bee.png",
                "summary": "Part of the Bee Swarm Simulator Preset pack.",
            },
        ]
    },
    {
        "name": "Christmas Xmas",
        "banner": "xmas-banner.png",
        "artist_info": `Some artists are accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('811114235966521364'),
            findUser('1364263466000584764'),
            findUser('994067777579143190'),
            findUser('1088105926030000178'),
            findUser('808325271949934652'),
            findUser('1106968627036557322'),
            findUser('1062953673610772480'),
            findUser('1033224131795243008'),
            findUser('995598255612239884'),
        ],
        "decorations": [
            {
                "name": "Christmas Lights",
                "artist": findUser('811114235966521364'),
                "asset": "christmas lights by cal.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "animated",
					"cal",
					"red",
					"yellow",
					"green",
					"blue",
					"winter",
					"holidays"
                ]
            },
            {
                "name": "Christmas Tree",
                "artist": findUser('811114235966521364'),
                "asset": "christmas tree by cal.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "green",
                    "yellow",
					"blue",
					"purple",
                    "cal",
					"holidays",
					"winter"
                ]
            },
            {
                "name": "Gift",
                "artist": findUser('811114235966521364'),
                "asset": "gift by cal.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "red",
					"yellow",
					"present",
					"box",
					"square",
                    "cal",
					"winter",
					"holidays"
                ]
            },
            {
                "name": "Santa Hat",
                "artist": findUser('811114235966521364'),
                "asset": "santa hat by cal.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
					"white",
					"red",
					"christmas",
					"holidays",
					"winter",
                    "cal"
				]
            },
            {
                "name": "Snowman",
                "artist": findUser('811114235966521364'),
                "asset": "snowman by cal.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "white",
					"hat",
					"black",
					"green",
					"scarf",
                    "cal",
					"winter",
					"holidays"
                ]
            },
            {
                "name": "Wreath",
                "artist": findUser('811114235966521364'),
                "asset": "wreath by cal.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
					"green",
					"red",
					"bow",
					"ribbon",
					"yellow",
					"bell",
					"bells",
					"holidays",
					"winter",
                    "cal"
				]
            },
            {
                "name": "Eternal Singing Angel",
                "artist": findUser('1088105926030000178'),
                "asset": "eternal singing angel by sharr.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
					"white",
					"blue",
					"snow",
					"holidays",
					"winter",
                    "sharr"
				]
            },
            {
                "name": "Snow Hat",
                "artist": findUser('1088105926030000178'),
                "asset": "snow hat by sharr.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "white",
					"santa",
					"red",
					"animated",
					"holidays",
					"winter",
                    "sharr"
                ]
            },
            {
                "name": "Peeking through the icy window",
                "artist": findUser('1088105926030000178'),
                "asset": "Peeking through the icy window by sharr.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "white",
					"santa",
					"red",
					"holidays",
					"winter",
                    "sharr"
                ]
            },
            {
                "name": "Flying Santa",
                "artist": findUser('808325271949934652'),
                "asset": "flying santa by t8dyi.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
					"black",
					"red",
					"white",
					"yellow",
					"holidays",
					"house",
					"sleigh",
					"winter",
                    "t8dyi"
				]
            },
            {
                "name": "Gingerbread",
                "artist": findUser('808325271949934652'),
                "asset": "Gingerbread by t8dyi.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
					"brown",
					"cookie",
					"biscuit",
					"holidays",
					"winter",
                    "t8dyi"
				]
            },
			{
                "name": "Snowman",
                "artist": findUser('808325271949934652'),
                "asset": "snowman by t8dyi.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
					"black",
					"white",
					"carrot",
					"hat",
					"holidays",
					"winter",
                    "t8dyi"
                ]
            },
            {
                "name": "Snowy Forest with a Doe",
                "artist": findUser('808325271949934652'),
                "asset": "Snowy Forest with a Doe by t8dyi.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "white",
					"green",
					"trees",
					"confetti",
					"deer",
					"holidays",
					"winter",
                    "t8dyi"
                ]
            },
            {
                "name": "Snowy Forest",
                "artist": findUser('808325271949934652'),
                "asset": "Snowy Forest by t8dyi.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "white",
					"green",
					"trees",
					"confetti",
					"holidays",
					"winter",
                    "t8dyi"
                ]
            },
            {
                "name": "Holly Wreath",
                "artist": findUser('994067777579143190'),
                "asset": "holly wrath by saturn.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "green",
					"plant",
					"plants",
					"mistletoe",
					"red",
					"holidays",
					"winter",
                    "saturn"
                ]
            },
            {
                "name": "Hot Cocoa",
                "artist": findUser('994067777579143190'),
                "asset": "hot cocoa by saturn.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "white",
                    "chocolate",
                    "brown",
					"holidays",
					"winter",
                    "saturn"
                ]
            },
            {
                "name": "Being the Gift",
                "artist": findUser('994067777579143190'),
                "asset": "being the gift by saturn.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "green",
					"pink",
					"red",
					"square",
					"holidays",
                    "saturn"
                ]
            },
            {
                "name": "Miracle In District 20",
                "artist": findUser('1364263466000584764'),
                "asset": "Miracle In District 20 by hyst.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "red",
					"holidays",
					"winter",
					"square",
                    "kim"
                ]
            },
            {
                "name": "Holiday (Outis)",
                "artist": findUser('1364263466000584764'),
                "asset": "Holiday (Outis) by hyst.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "green",
					"red",
					"square",
					"gift",
					"present",
					"santa",
					"ribbon",
					"bow",
					"lights",
					"winter",
                    "kim"
                ]
            },
            {
                "name": "Holiday (Heath)",
                "artist": findUser('1364263466000584764'),
                "asset": "Holday (Heath) by hyst.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "green",
					"red",
					"gift",
					"present",
					"santa",
					"ribbon",
					"bow",
					"lights",
					"winter",
                    "kim"
                ]
            },
            {
                "name": "Christmas Nightmare (Ishmael)",
                "artist": findUser('1364263466000584764'),
                "asset": "Christmas Nightmare (Ishmael) by hyst.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "yellow",
					"lights",
					"project moon",
					"game",
					"limbus company",
					"snow",
					"gingerbread",
					"cookies",
					"holidays",
					"winter",
                    "kim"
                ]
            },
            {
                "name": "Christmas Nightmare (Gregor)",
                "artist": findUser('1364263466000584764'),
                "asset": "Christmas Nightmare (Gregor) by hyst.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "yellow",
					"lights",
					"project moon",
					"game",
					"limbus company",
					"snow",
					"wreath",
					"stocking",
					"holidays",
					"winter",
                    "kim"
                ]
            },
            {
                "name": "Reindeer",
                "artist": findUser('1033224131795243008'),
                "asset": "reindeer by doger.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "black",
					"glow",
					"bauble",
                    "doger"
                ]
            },
            {
                "name": "Snowflakes",
                "artist": findUser('1062953673610772480'),
                "asset": "snowflakes by clockwork.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "black",
					"glow",
					"bauble",
                    "clockwork"
                ]
            },
            {
                "name": "Snowflakes Alt",
                "artist": findUser('1062953673610772480'),
                "asset": "snowflakes alt by clockwork.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "black",
					"glow",
					"bauble",
                    "clockwork"
                ]
            },
            {
                "name": "Minecraft Snowflake",
                "artist": findUser('1062953673610772480'),
                "asset": "snowflake mc by clockwork.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "black",
					"glow",
					"bauble",
                    "clockwork"
                ]
            },
            {
                "name": "Misty",
                "artist": findUser('995598255612239884'),
                "asset": "misty_by prince.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "black",
					"glow",
					"bauble",
                    "prince"
                ]
            },
            {
                "name": "Sakuraflakes",
                "artist": findUser('995598255612239884'),
                "asset": "Sakuraflakes_by prince.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "black",
					"glow",
					"bauble",
                    "prince"
                ]
            },
            {
                "name": "Snowflakes",
                "artist": findUser('995598255612239884'),
                "asset": "snowflakes_by prince.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "black",
					"glow",
					"bauble",
                    "prince"
                ]
            },
            {
                "name": "Snowman",
                "artist": findUser('995598255612239884'),
                "asset": "snowman_by prince.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "black",
					"glow",
					"bauble",
                    "prince"
                ]
            },
            {
                "name": "Winter Pearls",
                "artist": findUser('995598255612239884'),
                "asset": "winter pearls_by prince.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "black",
					"glow",
					"bauble",
                    "prince"
                ]
            },
            {
                "name": "Black Ornament",
                "artist": findUser('1106968627036557322'),
                "asset": "Black Ornament by Nype.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "black",
					"glow",
					"bauble",
                    "nype"
                ]
            },
            {
                "name": "Blue Ornament",
                "artist": findUser('1106968627036557322'),
                "asset": "Blue Ornamentby Nype.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "blue",
					"glow",
					"bauble",
                    "nype"
                ]
            },
            {
                "name": "Cyan Ornament",
                "artist": findUser('1106968627036557322'),
                "asset": "Cyan Ornamentby Nype.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "cyan",
					"glow",
					"bauble",
                    "nype"
                ]
            },
            {
                "name": "Green Ornament",
                "artist": findUser('1106968627036557322'),
                "asset": "Green Ornamentby Nype.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "green",
					"glow",
					"bauble",
                    "nype"
                ]
            },
            {
                "name": "Orange Ornament",
                "artist": findUser('1106968627036557322'),
                "asset": "Orange Ornamentby Nype.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "orange",
					"glow",
					"bauble",
                    "nype"
                ]
            },
            {
                "name": "Pink Ornament",
                "artist": findUser('1106968627036557322'),
                "asset": "Pink Ornamentby Nype.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "pink",
					"glow",
					"bauble",
                    "nype"
                ]
            },
            {
                "name": "Purple Ornament",
                "artist": findUser('1106968627036557322'),
                "asset": "Purple Ornamentby Nype.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "purple",
					"glow",
					"bauble",
                    "nype"
                ]
            },
            {
                "name": "Red Ornament",
                "artist": findUser('1106968627036557322'),
                "asset": "Red Ornamentby Nype.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "red",
					"glow",
					"bauble",
                    "nype"
                ]
            },
            {
                "name": "White Ornament",
                "artist": findUser('1106968627036557322'),
                "asset": "White Ornamentby Nype.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "white",
					"glow",
					"bauble",
                    "nype"
                ]
            },
            {
                "name": "Yellow Ornament",
                "artist": findUser('1106968627036557322'),
                "asset": "Yellow Ornamentby Nype.png",
                "summary": "Part of the Frozen Fantasy Preset pack. Add some festive flair to your profile this Christmas!",
                "tags": [
                    "yellow",
					"glow",
					"bauble",
                    "nype"
                ]
            },
        ]
    },
    {
        "name": "Checkpoint",
        "banner": "checkpoint-banner.png",
        "artist_info": `This category was made by a mixture of cool people. Some are accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('1147940825330876538'),
            findUser('808325271949934652'),
            findUser('1062953673610772480'),
            findUser('995598255612239884'),
            findUser('1106968627036557322')
        ],
        "decorations": [
            {
                "name": "Bonsai - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "bonsai.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Donut - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "donut.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Capybara - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "capybara.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Disco - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "disco.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Disco (Alt) - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "disco2.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Origami - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "crane.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Snail - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "snail.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Ducky - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "duck.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Banana - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "banan.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Cat - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "catcheckpoint.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Cassette - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "cassette.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Frog - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "frog.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Seal - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "seal.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Shark - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "shark.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Saxophone - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "saxophone.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Flame - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "flame.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Boat - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "boatcheckpoint.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Fox - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "fox_checkpoint.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Campfire - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "fireplace.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Toadstool - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "shroom.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Bumblebee - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "bumblebee.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Flower - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "flower_checkpoint.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Axolotl - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "axolotl_checkpoint.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Banana (Beta) - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "beta_banana.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Moon - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "moon_checkpoint.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Cursed Jellyfish - Checkpoint 2025",
                "artist": findUser('808325271949934652'),
                "asset": "cursedjelly_checkpoint.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Bee Movie - Checkpoint 2025",
                "artist": findUser('1062953673610772480'),
                "asset": "bee by clockwork.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Dog - Checkpoint 2025",
                "artist": findUser('995598255612239884'),
                "asset": "dog by prince.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Moon - Checkpoint 2025",
                "artist": findUser('1106968627036557322'),
                "asset": "moon_checkpoint2.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Decor - Checkpoint 2025",
                "artist": findUser('1147940825330876538'),
                "asset": "decor.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Vencord - Checkpoint 2025",
                "artist": findUser('1147940825330876538'),
                "asset": "vencord.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Jelly - Checkpoint 2025",
                "artist": findUser('1147940825330876538'),
                "asset": "jelly.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Wumpus - Checkpoint 2025",
                "artist": findUser('1147940825330876538'),
                "asset": "wumpus.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Clyde - Checkpoint 2025",
                "artist": findUser('1147940825330876538'),
                "asset": "clyde.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
            {
                "name": "Orbs - Checkpoint 2025",
                "artist": findUser('1147940825330876538'),
                "asset": "orbs.png",
                "summary": "Part of the Checkpoint Preset pack.",
                "tags": [
                    "animated"
				]
            },
        ]
    },
    {
        "name": "Honkai Star Rail",
        "banner": "starrail-banner.png",
        "artist_info": `Zin is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('452679089929846784')
        ],
        "decorations": [
            {
                "name": "Herta Profile",
                "asset": "herta_profile.png",
                "summary": "Part of the Honkai Star Rail Preset pack.",
                "tags": [
					"flower",
				]
            },
            {
                "name": "Therta Profile",
                "asset": "therta_profile (The Herta).png",
                "summary": "Part of the Honkai Star Rail Preset pack.",
                "tags": [
					"flower",
				]
            },
            {
                "name": "Tribbie Profile",
                "asset": "tribbie_profile.png",
                "summary": "Part of the Honkai Star Rail Preset pack.",
                "tags": [
					"flower",
				]
            },
            {
                "name": "Trianne Profile",
                "asset": "trianne_profile.png",
                "summary": "Part of the Honkai Star Rail Preset pack.",
                "tags": [
					"flower",
				]
            },
            {
                "name": "Trinnon Profile",
                "asset": "trinnon_profile.png",
                "summary": "Part of the Honkai Star Rail Preset pack.",
                "tags": [
					"flower",
				]
            },
            {
                "name": "Evernight Profile",
                "asset": "evernight_profile.png",
                "summary": "Part of the Honkai Star Rail Preset pack.",
                "tags": [
					"flower",
				]
            },
        ]
    },
    {
        "name": "GENSHIN",
        "banner": "newgenshin-banner.png",
        "artist_info": `Zin is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('452679089929846784')
        ],
        "decorations": [
            {
                "name": "Xiangling Skill",
                "asset": "xiangling_skill.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Sayu Profile",
                "asset": "sayu_profile.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Greater Lord Rukkhadevata",
                "asset": "Greater_Lord_Rukkhadevata.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Nahida",
                "asset": "Nahida.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Nahida Skill",
                "asset": "nahida_skill.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Layla Skill",
                "asset": "layla_skill.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Kirara Skill",
                "asset": "kirara-skill.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Charlotte Skill",
                "asset": "charlotte_skill.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Chevreuse Skill",
                "asset": "chevreuse_skill.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Mualani Profile",
                "asset": "mualani_profile.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Citlali",
                "asset": "citlali.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Varesa",
                "asset": "Varesa.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Skirk",
                "asset": "Skirk.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Dahlia",
                "asset": "Dahlia.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Ineffa",
                "asset": "Ineffa.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Lauma Profile",
                "asset": "lauma_profile.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
            {
                "name": "Jahoda Profile",
                "asset": "jahoda_profile.png",
                "summary": "Part of the Genshin Impact Preset pack.",
            },
        ]
    },
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
                "asset": "Xiva.png",
                "summary": "Part of the Fate Trigger Preset pack.",
                "tags": [
                    "animated",
                    "blue",
                    "fire"
                ]
            },
            {
                "name": "Camille Healing",
                "asset": "camille healing.png",
                "summary": "Part of the Fate Trigger Preset pack.",
                "tags": [
                    "animated",
                    "heart",
                    "green"
                ]
            },
            {
                "name": "Huxleys Myst",
                "asset": "Huxleys Myst.png",
                "summary": "Part of the Fate Trigger Preset pack.",
                "tags": [
                    "animated",
                    "heart",
                    "purple",
                    "pink"
                ]
            }
        ]
    },
    {
        "name": "Halloween",
        "banner": "halloween-banner.png",
        "artist_info": `CallieVD & T8dyi are accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('1143994313034960967'),
            findUser('811114235966521364'),
            findUser('808325271949934652'),
        ],
        "decorations": [
            {
                "name": "Pink Pumpkin",
                "artist": findUser('1143994313034960967'),
                "asset": "pink pumpkin by nuki.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
                    "pink",
					"bat",
					"cute",
					"kawaii",
					"spooky",
                    "nuki"
                ]
            },
            {
                "name": "Pumpkin",
                "artist": findUser('811114235966521364'),
                "asset": "pumpkin by cal.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
                    "orange",
                    "spooky",
                    "cal"
                ]
            },
            {
                "name": "Witch Cat",
                "artist": findUser('811114235966521364'),
                "asset": "witch_cat by cal.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
                    "orange",
                    "cat",
					"spooky",
					"cute",
					"animal",
                    "cal"
                ]
            },
            {
                "name": "Teefs",
                "artist": findUser('811114235966521364'),
                "asset": "teefs by cal.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
					"white",
					"teeth",
					"spooky",
                    "cal"
				]
            },
            {
                "name": "Black Cat",
                "artist": findUser('811114235966521364'),
                "asset": "black cat by cal.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
                    "cat",
					"black",
					"gray",
					"grey",
					"animal",
                    "cal"
                ]
            },
            {
                "name": "Demon Hoodie",
                "artist": findUser('811114235966521364'),
                "asset": "demon hoodie by cal.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
					"black",
					"red",
					"spooky",
                    "cal"
				]
            },
            {
                "name": "Fox Hoodie",
                "artist": findUser('811114235966521364'),
                "asset": "fox hoodie by cal.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
					"orange",
					"animal",
                    "cal"
				]
            },
            {
                "name": "Frakenstein's Monster",
                "artist": findUser('811114235966521364'),
                "asset": "frankenstein's monster by cal.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
					"green",
					"spooky",
                    "cal"
				]
            },
            {
                "name": "Monster Hoodie",
                "artist": findUser('811114235966521364'),
                "asset": "monster hoodie by cal.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
					"purple",
					"green",
					"spooky",
                    "cal"
				]
            },
			{
                "name": "Spider Web",
                "artist": findUser('808325271949934652'),
                "asset": "spider web by t8.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
					"spooky",
					"white",
                    "t8dyi"
                ]
            },
            {
                "name": "Witch Cat",
                "artist": findUser('808325271949934652'),
                "asset": "witch cat by t8.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
                    "cat",
					"spooky",
					"purple",
					"black",
                    "t8dyi"
                ]
            },
            {
                "name": "Halloween Pumpkins (No Face)",
                "artist": findUser('808325271949934652'),
                "asset": "halloween pumpkins no face by t8.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
                    "orange",
					"spooky",
                    "t8dyi"
                ]
            },
            {
                "name": "Halloween Pumpkins (With Face)",
                "artist": findUser('808325271949934652'),
                "asset": "halloween pumpkins face by t8.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
                    "orange",
					"spooky",
                    "t8dyi"
                ]
            },
            {
                "name": "Halloween Pumpkins (Animated)",
                "artist": findUser('808325271949934652'),
                "asset": "Halloween Pumpkins Decor (Animated) by t8.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
                    "animated",
                    "orange",
                    "spooky",
                    "t8dyi"
                ]
            },
            {
                "name": "Flying Ghost",
                "artist": findUser('808325271949934652'),
                "asset": "Flying Ghost Decor by t8.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
                    "animated",
					"white",
					"spooky",
                    "t8dyi"
                ]
            },
            {
                "name": "Ghost Circle",
                "artist": findUser('808325271949934652'),
                "asset": "Ghost Circle Decor by t8.png",
                "summary": "Part of the Halloween Preset pack. Add some festive flair to your profile this Halloween!",
                "tags": [
                    "animated",
					"white",
					"spooky",
                    "t8dyi"
                ]
            },
        ]
    },
    {
        "name": "Deltarune",
        "banner": "deltarune-banner.png",
        "artist_info": `Ca-Cawthon is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('323205750262595595'),
            findUser('995651435519815772')
        ],
        "decorations": [
            {
                "name": "[[HEARTSHAPEDOBJECT]]",
                "artist": findUser('323205750262595595'),
                "asset": "[[HEARTSHAPEDOBJECT]].png",
                "summary": "That is your soul! The very culmination of your being!",
                "tags": [
					"red",
					"game",
					"heart",
                    "jenku"
				]
            },
            {
                "name": "a horned headband, its said to make you more monsterlike",
                "artist": findUser('323205750262595595'),
                "asset": "a horned headband, its said to make you more monsterlike.png",
                "summary": "...",
                "tags": [
					"red",
					"yellow",
					"green",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Battle UI",
                "artist": findUser('323205750262595595'),
                "asset": "battle ui.png",
                "summary": "Out of everyone, I'm glad we encountered you!",
                "tags": [
					"red",
					"orange",
					"black",
					"game",
                    "jenku"
				]
            },
            {
                "name": "BECOMED [[NEO]]",
                "artist": findUser('323205750262595595'),
                "asset": "BECOMED [[NEO]].PNG",
                "summary": "NOW'S YOUR CHANCE TO BE A [BIG SHOT]",
                "tags": [
					"pink",
					"yellow",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Castle Town",
                "artist": findUser('323205750262595595'),
                "asset": "castle town.png",
                "summary": "Why the hell is there a castle inside of a supply closet?",
                "tags": [
					"blue",
					"game",
                    "jenku"
				]
            },
            {
                "name": "CHAOS CHAOS",
                "artist": findUser('323205750262595595'),
                "asset": "CHAOS CHAOS.PNG",
                "summary": "I CAN DO ANYTHING!",
                "tags": [
					"yellow",
					"purple",
					"game",
                    "jenku"
				]
            },
            {
                "name": "CYBERS WORLD",
                "artist": findUser('323205750262595595'),
                "asset": "CYBERS WORLD.png",
                "summary": "A CYBER'S WORLD?",
                "tags": [
					"pink",
					"yellow",
					"neon",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Dark Fountain",
                "artist": findUser('323205750262595595'),
                "asset": "dark fountain.png",
                "summary": "NO! DON'T MAKE ANOTHER FOUNTAIN!",
                "tags": [
                    "animated",
					"black",
					"white",
					"game",
                    "jenku"
                ]
            },
            {
                "name": "DEALMAKER[]PUPPETSCARF",
                "artist": findUser('323205750262595595'),
                "asset": "DEALMAKER[]PUPPETSCARF.png",
                "summary": "Two pairs of glasses..?",
                "tags": [
					"green",
					"game",
                    "jenku"
				]
            },
            {
                "name": "DEVILSKNIFE[]JEVILSTAIL",
                "artist": findUser('323205750262595595'),
                "asset": "DEVILSKNIFE[]JEVILSTAIL.png",
                "summary": "Metamorphosis!",
                "tags": [
					"purple",
					"green",
					"game",
                    "jenku"
				]
            },
            {
                "name": "FINDHER",
                "artist": findUser('323205750262595595'),
                "asset": "FINDHER.PNG",
                "summary": "A lost girl.",
                "tags": [
					"brown",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Friend Inside Me",
                "artist": findUser('323205750262595595'),
                "asset": "friend inside me.png",
                "summary": "Modern mouth mike, I think.",
                "tags": [
					"red",
					"brown",
					"hat",
					"cowboy",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Game Gear",
                "artist": findUser('323205750262595595'),
                "asset": "game gear.PNG",
                "summary": "Berdly, I Only Play Mobile Games",
                "tags": [
					"orange",
					"green",
                    "jenku"
				]
            },
            {
                "name": "Green Pippins",
                "artist": findUser('323205750262595595'),
                "asset": "geen pippins.png",
                "summary": "WHO IS MIKE???? IS HE TENNA'S IMAGINARY FRIEND?? IS HE EVEN REAL???",
                "tags": [
					"green",
					"game",
					"suit",
                    "jenku"
				]
            },
            {
                "name": "GONER",
                "artist": findUser('323205750262595595'),
                "asset": "GONER.png",
                "summary": "Nobody chooses who they are in this world.",
                "tags": [
					"white",
					"gray",
					"grey",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Im Old",
                "artist": findUser('323205750262595595'),
                "asset": "Im Old.PNG",
                "summary": "I'm old!",
                "tags": [
					"green",
					"brown",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Mantle fit for a King",
                "artist": findUser('323205750262595595'),
                "asset": "mantle fit for a king.png",
                "summary": "john mantle",
                "tags": [
					"black",
					"grey",
					"gray",
					"game",
                    "jenku"
				]
            },
            {
                "name": "No one will shed a tear for him",
                "artist": findUser('323205750262595595'),
                "asset": "no one will shed a tear for him.png",
                "summary": "Freedom, but British!",
                "tags": [
					"red",
					"pink",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Photon Readings Negative",
                "artist": findUser('323205750262595595'),
                "asset": "photon readings negative.png",
                "summary": "chair",
                "tags": [
                    "animated",
					"black",
					"blue",
					"blocky",
					"game",
                    "jenku"
                ]
            },
            {
                "name": "Piano that might have a few keys missing",
                "artist": findUser('323205750262595595'),
                "asset": "piano that might have a few keys missing.png",
                "summary": "play megalovania on the big piano something funny happens",
                "tags": [
					"blue",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Pluey",
                "artist": findUser('323205750262595595'),
                "asset": "pluey.png",
                "summary": "Implemented Pluey.",
                "tags": [
					"black",
					"bowtie",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Prince from the dark",
                "artist": findUser('323205750262595595'),
                "asset": "princefromthedark.png",
                "summary": "Prophetic, is that a word?",
                "tags": [
					"brown",
					"yellow",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Quiet Study",
                "artist": findUser('323205750262595595'),
                "asset": "quiet study.png",
                "summary": "Five dollar specials!",
                "tags": [
					"brown",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Ralsei Hat",
                "artist": findUser('323205750262595595'),
                "asset": "ralsei hat.png",
                "summary": "The prince of the dark, hat edition!",
                "tags": [
					"green",
					"pink",
					"purple",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Ralsei No Hat",
                "artist": findUser('323205750262595595'),
                "asset": "ralsei no hat.png",
                "summary": "The prince of the dark, edition!",
                "tags": [
					"pink",
					"purple",
					"horns",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Red Pippins",
                "artist": findUser('323205750262595595'),
                "asset": "red pippins.png",
                "summary": "why are you in chapter 1",
                "tags": [
					"suit",
					"game",
                    "jenku"
				]
            },
            {
                "name": "Snow",
                "artist": findUser('323205750262595595'),
                "asset": "snow.png",
                "summary": "I don't know how to cast that spell",
                "tags": [
					"blue",
					"ice",
					"game",
                    "jenku"
				]
            },
            {
                "name": "SWOON",
                "artist": findUser('323205750262595595'),
                "asset": "SWOON.png",
                "summary": "We have too much swords, send them to the fun gang!",
                "tags": [
					"black",
					"game",
					"spooky",
                    "jenku"
				]
            },
            {
                "name": "Tenna",
                "artist": findUser('323205750262595595'),
                "asset": "tenna.png",
                "summary": "It's TV TIME!",
                "tags": [
					"purple",
					"white",
					"game",
					"tv",
                    "jenku"
				]
            },
            {
                "name": "THE CAGE",
                "artist": findUser('323205750262595595'),
                "asset": "THE CAGE.PNG",
                "summary": "Pretty annoying, dawg... wait a minute",
                "tags": [
					"red",
					"brown",
					"game",
                    "jenku"
				]
            },
            {
                "name": "THEYLL SEE THE TAIL OF HELL TAKE CRAWL",
                "artist": findUser('323205750262595595'),
                "asset": "THEYLL SEE THE TAIL OF HELL TAKE CRAWL.PNG",
                "summary": "A friend on the inside.",
                "tags": [
					"black",
					"game",
					"spooky",
                    "jenku"
				]
            },
            {
                "name": "Roaring Knight",
                "artist": findUser('995651435519815772'),
                "asset": "Roaring Knight (cawthon).png",
                "summary": "The knight.. the Roaring Knight",
                "tags": [
					"black",
					"white",
					"game",
					"spooky",
                    "cawthon"
				]
            },
            {
                "name": "Watercooler",
                "artist": findUser('995651435519815772'),
                "asset": "Watercooler (cawthon).png",
                "summary": "oh god",
                "tags": [
					"blue",
					"blocky",
					"gray",
					"grey",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "Newborn Titan",
                "artist": findUser('995651435519815772'),
                "asset": "Newborn Titan (Cawthon).png",
                "summary": "The fear of the dark.",
                "tags": [
					"white",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "The Weather Sticks Together",
                "artist": findUser('995651435519815772'),
                "asset": "The Weather Sticks Together (cawthon).png",
                "summary": "The weather always sticks together.",
                "tags": [
					"white",
					"grey",
					"gray",
					"red",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "Lanino",
                "artist": findUser('995651435519815772'),
                "asset": "Lanino (cawthon).png",
                "summary": "The weather didn't stick together.",
                "tags": [
					"white",
					"grey",
					"gray",
					"red",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "Shuttah",
                "artist": findUser('995651435519815772'),
                "asset": "Shuttah (cawthon).png",
                "summary": "Take a picture!",
                "tags": [
					"white",
					"yellow",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "Tenna Secondary Option",
                "artist": findUser('995651435519815772'),
                "asset": "Tenna Secondary Option (cawthon).png",
                "summary": "It's TV TIME! I think",
                "tags": [
					"purple",
					"white",
					"game",
					"tv",
                    "cawthon"
				]
            },
            {
                "name": "ERAM",
                "artist": findUser('995651435519815772'),
                "asset": "ERAM ( cawthon).png",
                "summary": "john mantle (so retro!)",
                "tags": [
					"black",
					"orange",
					"blocky",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "Elnina",
                "artist": findUser('995651435519815772'),
                "asset": "Elnina (cawthon).png",
                "summary": "yeah no they are NOT together",
                "tags": [
					"white",
					"grey",
					"gray",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "Knight Gerson",
                "artist": findUser('995651435519815772'),
                "asset": "Knight Gerson (cawthon).png",
                "summary": "I'm bold!",
                "tags": [
					"purple",
					"grey",
					"gray",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "Lightners Live Kris",
                "artist": findUser('995651435519815772'),
                "asset": "Lightners Live Kris (cawthon).png",
                "summary": "Raise up your bat and face the fright!",
                "tags": [
                    "animated",
					"guitar",
					"music",
					"blue",
					"game",
                    "cawthon"
                ]
            },
            {
                "name": "Lightners Live Susie",
                "artist": findUser('995651435519815772'),
                "asset": "Lightners Live Susie (cawthon).png",
                "summary": "🥁🥁🥁🥁🥁🥁🥁🥁🥁🥁🥁🥁",
                "tags": [
                    "animated",
					"drum",
					"music",
					"blue",
					"pink",
					"game",
                    "cawthon"
                ]
            },
            {
                "name": "Lighters Live Ralsei",
                "artist": findUser('995651435519815772'),
                "asset": "Lighters Live Ralsei (cawthon).png",
                "summary": "Let's bring your friends and fly a kite!",
                "tags": [
                    "animated",
					"music",
					"green",
					"game",
                    "cawthon"
                ]
            },
            {
                "name": "Laser Pointere",
                "artist": findUser('995651435519815772'),
                "asset": "Laser Pointere (cawthon).png",
                "summary": "Okay, Okay pauseth for a second...",
                "tags": [
                    "animated",
					"white",
					"game",
                    "cawthon"
                ]
            },
        ]
    },
    {
        "name": "Hollow Knight",
        "banner": "hollowknight-banner.png",
        "artist_info": `Ca-Cawthon is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('1167490687789449290'),
            findUser('995651435519815772'),
            findUser('1364263466000584764'),
        ],
        "decorations": [
            {
                "name": "Hollow Knight UI",
                "artist": findUser('1167490687789449290'),
                "asset": "theknightthing.png",
                "summary": "Part of the Hollow Knight Preset pack.",
                "tags": [
					"white",
					"gray",
					"grey",
					"game",
                    "subspace"
				]
            },
            {
                "name": "Silksong UI",
                "artist": findUser('1167490687789449290'),
                "asset": "hornetthing.png",
                "summary": "Part of the Hollow Knight Preset pack.",
                "tags": [
					"white",
					"gray",
					"grey",
					"game",
                    "subspace"
				]
            },
            {
                "name": "Groal the Great",
                "artist": findUser('995651435519815772'),
                "asset": "frog guy.png",
                "summary": "Part of the Hollow Knight Preset pack.",
                "tags": [
					"green",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "Ass Jim",
                "artist": findUser('995651435519815772'),
                "asset": "ass jim.png",
                "summary": "Part of the Hollow Knight Preset pack.",
                "tags": [
					"brown",
					"white",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "Hornet",
                "artist": findUser('995651435519815772'),
                "asset": "hornet.png",
                "summary": "Part of the Hollow Knight Preset pack.",
                "tags": [
					"red",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "Moss Mother",
                "artist": findUser('995651435519815772'),
                "asset": "moss mother.png",
                "summary": "Part of the Hollow Knight Preset pack.",
                "tags": [
					"green",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "Trobbio",
                "artist": findUser('995651435519815772'),
                "asset": "trobbio.png",
                "summary": "Part of the Hollow Knight Preset pack.",
                "tags": [
					"red",
					"pink",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "Shakra",
                "artist": findUser('995651435519815772'),
                "asset": "Shakra.png",
                "summary": "Part of the Hollow Knight Preset pack.",
                "tags": [
					"brown",
					"red",
					"game",
                    "cawthon"
				]
            },
            {
                "name": "Pure Vessel [ Given Nail and named Knight ]",
                "artist": findUser('1364263466000584764'),
                "asset": "Pure Vessel [ Given Nail and named Knight ].png",
                "summary": "Part of the Hollow Knight Preset pack.",
                "tags": [
					"white",
					"grey",
					"gray",
					"game",
					"armour",
					"armor",
                    "kim"
				]
            },
            {
                "name": "The Knight [ The Vessel ]",
                "artist": findUser('1364263466000584764'),
                "asset": "The Knight [ The Vessel ].png",
                "summary": "Part of the Hollow Knight Preset pack.",
                "tags": [
					"white",
					"grey",
					"gray",
					"game",
                    "kim"
				]
            },
            {
                "name": "Hornet [ Silk-Weaving Needle ]",
                "artist": findUser('1364263466000584764'),
                "asset": "Hornet [ Silk-Weaving Needle ].png",
                "summary": "Part of the Hollow Knight Preset pack.",
                "tags": [
					"white",
					"grey",
					"gray",
					"game",
                    "kim"
				]
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
                "asset": "controller.png",
                "summary": "Part of the Kawaii Gamer Girl Preset pack.",
				"tags": [
					"pink",
					"cute",
					"kawaii",
					"gaming"
				]
            },
            {
                "name": "Error",
                "asset": "error.png",
                "summary": "Part of the Kawaii Gamer Girl Preset pack.",
				"tags": [
					"pink",
					"cute",
					"kawaii"
				]
            },
            {
                "name": "Tamagotchi",
                "asset": "tamagotchi.png",
                "summary": "Part of the Kawaii Gamer Girl Preset pack.",
                "tags": [
                    "animated",
					"pink",
					"purple",
					"cute",
					"kawaii"
                ]
            },
            {
                "name": "Lives",
                "asset": "lives.png",
                "summary": "Part of the Kawaii Gamer Girl Preset pack.",
                "tags": [
                    "animated",
					"pink",
					"cute",
					"kawaii",
					"ui"
                ]
            },
            {
                "name": "Headphones",
                "asset": "headphones.png",
                "summary": "Part of the Kawaii Gamer Girl Preset pack.",
				"tags": [
					"pink",
					"cute",
					"kawaii",
					"cat"
				]
            },
            {
                "name": "Mouse",
                "asset": "mouse.png",
                "summary": "Part of the Kawaii Gamer Girl Preset pack.",
				"tags": [
					"pink",
					"purple",
					"cute",
					"kawaii"
				]
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
                "asset": "gardening.png",
                "summary": "Part of the A Frog's Life Preset pack.",
				"tags": [
					"green",
					"cute",
					"animal"
				]
            },
            {
                "name": "Lillypad",
                "asset": "lillypad.png",
                "summary": "Part of the A Frog's Life Preset pack.",
				"tags": [
					"green",
					"cute",
					"animal"
				]
            },
            {
                "name": "Mlem",
                "asset": "mlem.png",
                "summary": "Part of the A Frog's Life Preset pack.",
				"tags": [
					"green",
					"cute",
					"animal"
				]
            },
            {
                "name": "Raindrop",
                "asset": "raindrop.png",
                "summary": "Part of the A Frog's Life Preset pack.",
				"tags": [
					"green",
					"cute",
					"animal"
				]
            },
            {
                "name": "Rainy Day",
                "asset": "rainy day.png",
                "summary": "Part of the A Frog's Life Preset pack.",
				"tags": [
					"yellow",
					"orange",
					"cute",
					"animal",
					"umbrella"
				]
            },
            {
                "name": "Smiles",
                "asset": "smiles.png",
                "summary": "Part of the A Frog's Life Preset pack.",
				"tags": [
					"green",
					"cute",
					"animal"
				]
            },
        ]
    },
    {
        "name": "Ducks & Ducks",
        "banner": "ducks-banner.png",
        "artist_info": `T8dyi is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('808325271949934652')
        ],
        "decorations": [
            {
                "name": "Quack!",
                "asset": "Quack!.png",
                "summary": "Part of the Ducks & Ducks Preset pack.",
                "tags": [
                    "animated",
					"white",
					"animal"
                ]
            },
            {
                "name": "Blinking Duck",
                "asset": "Blinking Duck.png",
                "summary": "Part of the Ducks & Ducks Preset pack.",
                "tags": [
                    "animated",
					"white",
					"animal"
                ]
            },
            {
                "name": "Duck Eating Profile",
                "asset": "Duck Eating Profile.png",
                "summary": "Part of the Ducks & Ducks Preset pack.",
                "tags": [
                    "orange",
					"white",
					"animal"
                ]
            },
            {
                "name": "Swimming Duck v1",
                "asset": "Swimming Duck v1.png",
                "summary": "Part of the Ducks & Ducks Preset pack.",
                "tags": [
                    "animated",
					"green",
					"blue",
					"animal",
					"water",
					"nature"
                ]
            },
            {
                "name": "Swimming Duck v2",
                "asset": "Swimming Duck v2.png",
                "summary": "Part of the Ducks & Ducks Preset pack.",
                "tags": [
                    "animated",
					"green",
					"blue",
					"animal",
					"water",
					"nature"
                ]
            },
            {
                "name": "Lake (No Duck)",
                "asset": "Lake (No Duck).png",
                "summary": "Part of the Ducks & Ducks Preset pack.",
				"tags": [
					"blue",
					"green",
					"water",
					"nature"
				]
            },
            {
                "name": "Lake With Duck (White)",
                "asset": "Lake With Duck (White).png",
                "summary": "Part of the Ducks & Ducks Preset pack.",
				"tags": [
					"blue",
					"green",
					"water",
					"nature",
					"animal"
				]
            },
            {
                "name": "Lake With Duck (Yellow)",
                "asset": "Lake With Duck (Yellow).png",
                "summary": "Part of the Ducks & Ducks Preset pack.",
				"tags": [
					"blue",
					"green",
					"water",
					"nature",
					"animal"
				]
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
                "asset": "peter Porker decor.png",
                "summary": "Part of the Spider-Man Preset pack.",
				"tags": [
					"red",
					"pig",
					"movie",
					"marvel"
				]
            },
            {
                "name": "Graffiti Spider Logo",
                "asset": "graffiti spider logo.png",
                "summary": "Part of the Spider-Man Preset pack.",
				"tags": [
					"rainbow",
					"spider",
					"movie",
					"marvel"
				]
            },
            {
                "name": "Miguel o Hara (Spider-Man 2099)",
                "asset": "Miguel o hara (spiderman 2099) decor.png",
				"tags": [
					"red",
					"movie",
					"marvel"
				]
            },
            {
                "name": "Miles Morales",
                "asset": "miles morales decor.png",
                "summary": "Part of the Spider-Man Preset pack.",
				"tags": [
					"red",
					"green",
					"movie",
					"marvel"
				]
            },
            {
                "name": "Pavitr Prabhakar",
                "asset": "Pavitr prabhakar decor.png",
                "summary": "Part of the Spider-Man Preset pack.",
				"tags": [
					"red",
					"blue",
					"movie",
					"marvel"
				]
            },
            {
                "name": "Peni Parker Mech",
                "asset": "peni parker mech decor.png",
                "summary": "Part of the Spider-Man Preset pack.",
				"tags": [
					"red",
					"blue",
					"movie",
					"marvel"
				]
            },
            {
                "name": "Spider Gwen",
                "asset": "spider Gwen decor.png",
                "summary": "Part of the Spider-Man Preset pack.",
				"tags": [
					"white",
					"pink",
					"movie",
					"marvel"
				]
            },
            {
                "name": "Spider Noir",
                "asset": "spider noir decor.png",
                "summary": "Part of the Spider-Man Preset pack.",
				"tags": [
					"black",
					"grey",
					"gray",
					"movie",
					"marvel"
				]
            },
            {
                "name": "Spider Punk",
                "asset": "spider punk decor.png",
                "summary": "Part of the Spider-Man Preset pack.",
				"tags": [
					"yellow",
					"movie",
					"marvel"
				]
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
                "asset": "Red bull gives u wing.png",
                "summary": "Part of the Red Bull Fan Club Preset pack.",
				"tags": [
					"red",
					"silver",
					"grey",
					"gray",
					"drink"
				]
            },
            {
                "name": "Red Bull Normal",
                "asset": "Red bull normal.png",
                "summary": "Part of the Red Bull Fan Club Preset pack.",
				"tags": [
					"red",
					"silver",
					"grey",
					"gray",
					"drink"
				]
            },
            {
                "name": "Red Bull Amber Edition",
                "asset": "Red bull amber edition.png",
                "summary": "Part of the Red Bull Fan Club Preset pack.",
				"tags": [
					"red",
					"silver",
					"grey",
					"gray",
					"orange",
					"drink"
				]
            },
            {
                "name": "Red Bull Green (dragonfruit) Edition",
                "asset": "Red bull green (dragonfruit) edition.png",
                "summary": "Part of the Red Bull Fan Club Preset pack.",
				"tags": [
					"red",
					"silver",
					"grey",
					"gray",
					"green",
					"drink"
				]
            },
            {
                "name": "Red Bull Green Edition",
                "asset": "Red bull green edition.png",
                "summary": "Part of the Red Bull Fan Club Preset pack.",
				"tags": [
					"red",
					"silver",
					"grey",
					"gray",
					"green",
					"drink"
				]
            },
            {
                "name": "Red Bull Pink Edition",
                "asset": "Red bull pink edition.png",
                "summary": "Part of the Red Bull Fan Club Preset pack.",
				"tags": [
					"red",
					"silver",
					"grey",
					"gray",
					"pink",
					"drink"
				]
            },
            {
                "name": "Red Bull Purple Edition",
                "asset": "Red bull purple edition.png",
                "summary": "Part of the Red Bull Fan Club Preset pack.",
				"tags": [
					"red",
					"silver",
					"grey",
					"gray",
					"purple",
					"drink"
				]
            },
            {
                "name": "Red Bull Red Edition",
                "asset": "Red bull red edition.png",
                "summary": "Part of the Red Bull Fan Club Preset pack.",
				"tags": [
					"red",
					"silver",
					"grey",
					"gray",
					"drink"
				]
            },
            {
                "name": "Red Bull Sea Blue Edition",
                "asset": "Red bull sea blue edition.png",
                "summary": "Part of the Red Bull Fan Club Preset pack.",
				"tags": [
					"red",
					"silver",
					"grey",
					"gray",
					"blue",
					"drink"
				]
            },
            {
                "name": "Red Bull Spring Edition",
                "asset": "Red bull spring edition.png",
                "summary": "Part of the Red Bull Fan Club Preset pack.",
				"tags": [
					"red",
					"silver",
					"grey",
					"gray",
					"purple",
					"drink"
				]
            },
            {
                "name": "Red Bull White Edition",
                "asset": "Red bull white edition.png",
                "summary": "Part of the Red Bull Fan Club Preset pack.",
				"tags": [
					"red",
					"silver",
					"grey",
					"gray",
					"white",
					"drink"
				]
            },
            {
                "name": "Red Bull Yellow Edition",
                "asset": "Red bull yellow edition.png",
                "summary": "Part of the Red Bull Fan Club Preset pack.",
				"tags": [
					"red",
					"silver",
					"grey",
					"gray",
					"yellow",
					"drink"
				]
            },
            {
                "name": "Red Bull Blue Edition",
                "asset": "Red bull blue edition.png",
                "summary": "Part of the Red Bull Fan Club Preset pack.",
				"tags": [
					"red",
					"silver",
					"grey",
					"gray",
					"blue",
					"drink"
				]
            },
        ]
    },
    {
        "name": "Eminem M&Ms",
        "banner": "eminem-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1244775245966086245')
        ],
        "decorations": [
            {
                "name": "Blue Eminem M&M",
                "asset": "blue eminem m&m !.png",
                "summary": "Part of the Eminem M&Ms Preset pack.",
				"tags": [
					"blue",
					"rap",
					"candy"
				]
            },
            {
                "name": "Brown Eminem M&M",
                "asset": "brown eminem m&m !.png",
                "summary": "Part of the Eminem M&Ms Preset pack.",
				"tags": [
					"brown",
					"orange",
					"rap",
					"candy"
				]
            },
            {
                "name": "Green Eminem M&M",
                "asset": "green eminem m&m !.png",
                "summary": "Part of the Eminem M&Ms Preset pack.",
				"tags": [
					"green",
					"rap",
					"candy"
				]
            },
            {
                "name": "Orange Eminem M&M",
                "asset": "orange eminem m&m !.png",
                "summary": "Part of the Eminem M&Ms Preset pack.",
				"tags": [
					"yellow",
					"orange",
					"rap",
					"candy"
				]
            },
            {
                "name": "Purple Eminem M&M",
                "asset": "purple eminem m&m !.png",
                "summary": "Part of the Eminem M&Ms Preset pack.",
				"tags": [
					"purple",
					"rap",
					"candy"
				]
            },
            {
                "name": "Red Eminem M&M",
                "asset": "red eminem m&m !.png",
                "summary": "Part of the Eminem M&Ms Preset pack.",
				"tags": [
					"red",
					"rap",
					"candy"
				]
            },
            {
                "name": "Yellow Eminem M&M",
                "asset": "yellow eminem m&m !.png",
                "summary": "Part of the Eminem M&Ms Preset pack.",
				"tags": [
					"yellow",
					"rap",
					"candy"
				]
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
                "asset": "amitiecap.png",
                "summary": "Part of the Puyo Puyo Preset pack.",
				"tags": [
					"red",
					"game"
				]
            },
            {
                "name": "Amitie Hat",
                "asset": "amitiehat.png",
                "summary": "Part of the Puyo Puyo Preset pack.",
				"tags": [
					"red",
					"game"
				]
            },
            {
                "name": "Draco Horns",
                "asset": "dracohorns.png",
                "summary": "Part of the Puyo Puyo Preset pack.",
				"tags": [
					"white",
					"grey",
					"gray",
					"game"
				]
            },
            {
                "name": "Rulue",
                "asset": "rulue.png",
                "summary": "Part of the Puyo Puyo Preset pack.",
				"tags": [
					"white",
					"game"
				]
            },
            {
                "name": "Shigu",
                "asset": "shigu.png",
                "summary": "Part of the Puyo Puyo Preset pack.",
				"tags": [
					"blue",
					"game",
					"ladybug",
					"ladybird"
				]
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
                "asset": "avatarisyou.png",
                "summary": "Part of the Baba Is You Preset pack.",
                "tags": [
                    "animated",
					"yellow",
					"pink",
					"game"
                ]
            },
            {
                "name": "Avitur Be U",
                "asset": "aviturbeu.png",
                "summary": "Part of the Baba Is You Preset pack.",
                "tags": [
					"orange",
					"pink",
					"game"
                ]
            },
            {
                "name": "Power",
                "asset": "babapower.png",
                "summary": "Part of the Baba Is You Preset pack.",
                "tags": [
                    "animated",
					"yellow",
					"game"
                ]
            },
            {
                "name": "Sad",
                "asset": "sad.png",
                "summary": "Part of the Baba Is You Preset pack.",
                "tags": [
                    "animated",
					"blue",
					"game"
                ]
            },
            {
                "name": "Sleep",
                "asset": "sleep.png",
                "summary": "Part of the Baba Is You Preset pack.",
                "tags": [
                    "animated",
					"blue",
					"game"
                ]
            },
            {
                "name": "Win",
                "asset": "win.png",
                "summary": "Part of the Baba Is You Preset pack.",
                "tags": [
                    "animated",
					"yellow",
					"game"
                ]
            },
        ]
    },
    {
        "name": "Just Shapes & Beats",
        "banner": "jsab-banner.png",
        "artist_info": `Ca-Cawthon is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('995651435519815772')
        ],
        "decorations": [
            {
                "name": "Annihilation 1",
                "asset": "Annihilation 1.png",
                "summary": "Part of the Just Shapes & Beats Preset pack.",
				"tags": [
					"pink",
					"game"
				]
            },
            {
                "name": "Annihilation 2",
                "asset": "Annihilation 2.png",
                "summary": "Part of the Just Shapes & Beats Preset pack.",
				"tags": [
					"pink",
					"game"
				]
            },
            {
                "name": "Barracuda",
                "asset": "Barracuda.png",
                "summary": "Part of the Just Shapes & Beats Preset pack.",
				"tags": [
					"pink",
					"game",
					"black"
				]
            },
            {
                "name": "Boat",
                "asset": "Boat.png",
                "summary": "Part of the Just Shapes & Beats Preset pack.",
                "tags": [
                    "animated",
					"blue",
					"game"
                ]
            },
            {
                "name": "Close To Me Claws",
                "asset": "Close To Me Claws.png",
                "summary": "Part of the Just Shapes & Beats Preset pack.",
				"tags": [
					"pink",
					"game"
				]
            },
            {
                "name": "Friend",
                "asset": "Friend.png",
                "summary": "Part of the Just Shapes & Beats Preset pack.",
				"tags": [
					"green",
					"glow",
					"game"
				]
            },
            {
                "name": "Helicopter Love",
                "asset": "Helicopter Love.png",
                "summary": "Part of the Just Shapes & Beats Preset pack.",
                "tags": [
                    "animated",
					"blue",
					"game"
                ]
            },
            {
                "name": "JSAB Bird",
                "asset": "JSAB Bird.png",
                "summary": "Part of the Just Shapes & Beats Preset pack.",
                "tags": [
                    "animated",
					"blue",
					"game",
					"animal"
                ]
            },
            {
                "name": "The Boss",
                "asset": "The Boss.png",
                "summary": "Part of the Just Shapes & Beats Preset pack.",
				"tags": [
					"pink",
					"game"
				]
            },
            {
                "name": "The Boss (Phase 2)",
                "asset": "The Boss (Phase 2).png",
                "summary": "Part of the Just Shapes & Beats Preset pack.",
				"tags": [
					"pink",
					"game"
				]
            },
        ]
    },
    {
        "name": "Clown Doodles",
        "banner": "clown-banner.png",
        "artist_info": `CallieVD is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('811114235966521364')
        ],
        "decorations": [
            {
                "name": "Black & White Clown",
                "asset": "b_w clown.png",
                "summary": "Part of the Clown Doodles Preset pack.",
				"tags": [
					"black",
					"white"
				]
            },
            {
                "name": "Black & White Inverted Clown",
                "asset": "b_w inverted.png",
                "summary": "Part of the Clown Doodles Preset pack.",
				"tags": [
					"black",
					"white"
				]
            },
            {
                "name": "Dark Blue Clown",
                "asset": "dark blue clown.png",
                "summary": "Part of the Clown Doodles Preset pack.",
				"tags": [
					"blue",
					"white"
				]
            },
            {
                "name": "Light Blue Clown",
                "asset": "light blue clown.png",
                "summary": "Part of the Clown Doodles Preset pack.",
				"tags": [
					"blue",
					"white"
				]
            },
            {
                "name": "Yellow Clown",
                "asset": "yellow clown.png",
                "summary": "Part of the Clown Doodles Preset pack.",
				"tags": [
					"yellow",
					"white"
				]
            },
            {
                "name": "Orange Clown",
                "asset": "orange clown.png",
                "summary": "Part of the Clown Doodles Preset pack.",
				"tags": [
					"orange",
					"white"
				]
            },
            {
                "name": "Pink Clown",
                "asset": "pink clown.png",
                "summary": "Part of the Clown Doodles Preset pack.",
				"tags": [
					"pink",
					"white"
				]
            },
            {
                "name": "Purple Clown",
                "asset": "purple clown.png",
                "summary": "Part of the Clown Doodles Preset pack.",
				"tags": [
					"purple",
					"white"
				]
            },
            {
                "name": "Green Clown",
                "asset": "green clown.png",
                "summary": "Part of the Clown Doodles Preset pack.",
				"tags": [
					"green",
					"white"
				]
            },
            {
                "name": "Red Clown",
                "asset": "red clown.png",
                "summary": "Part of the Clown Doodles Preset pack.",
				"tags": [
					"red",
					"white"
				]
            },
            {
                "name": "Rainbow Clown",
                "asset": "rainbow clown.png",
                "summary": "Part of the Clown Doodles Preset pack.",
				"tags": [
					"rainbow"
				]
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
                "asset": "doise.png",
                "summary": "Part of the Pizza Tower V2 Preset pack.",
                "tags": [
                    "animated",
					"brown",
					"game"
                ]
            },
            {
                "name": "Noise",
                "asset": "noise.png",
                "summary": "Part of the Pizza Tower V2 Preset pack.",
                "tags": [
                    "animated",
					"game"
                ]
            },
            {
                "name": "Forest15",
                "asset": "forest15.png",
                "summary": "Part of the Pizza Tower V2 Preset pack.",
                "tags": [
                    "animated",
					"game"
                ]
            },
            {
                "name": "Peppino",
                "asset": "peppino.png",
                "summary": "Part of the Pizza Tower V2 Preset pack.",
                "tags": [
                    "animated",
					"game"
                ]
            },
            {
                "name": "Pizza Face",
                "asset": "pizzaface.png",
                "summary": "Part of the Pizza Tower V2 Preset pack.",
                "tags": [
                    "animated",
					"game",
					"brown"
                ]
            },
            {
                "name": "Pizza Head",
                "asset": "pizzahead.png",
                "summary": "Part of the Pizza Tower V2 Preset pack.",
                "tags": [
                    "animated",
					"game",
					"red"
                ]
            },
            {
                "name": "Secret Eye",
                "asset": "secreteye.png",
                "summary": "Part of the Pizza Tower V2 Preset pack.",
                "tags": [
                    "animated",
					"white"
                ]
            },
            {
                "name": "Vigilante",
                "asset": "vigilante.png",
                "summary": "Part of the Pizza Tower V2 Preset pack.",
				"tags": [
					"brown",
					"hat",
					"cowboy"
				]
            },
        ]
    },
    {
        "name": "Achievement Unlocked",
        "banner": "achievement-banner.png",
        "artist_info": `Clockwork is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('1062953673610772480')
        ],
        "decorations": [
            {
                "name": "Bubble Bundle",
                "asset": "bubble bundle.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nFor letting everyone know you still take bubble baths.\nWithout a rubber duck for some reason.",
				"tags": [
					"blue",
					"white"
				]
            },
            {
                "name": "Cassette Beasts UI",
                "asset": "cassette beasts.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nWhat do people who say 'No I don't like pokemon games' play instead:\n\n(hint: its Cassette Beasts)",
				"tags": [
					"white",
					"game"
				]
            },
            {
                "name": "Deltarune Battle UI",
                "asset": "Deltarune Battle UI.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nWho said you weren't a BIG SHOT ?\nBIG SHOT\nBIG SHOT\nBIG SHOT",
				"tags": [
					"black",
					"game",
					"animated"
				]
            },
            {
                "name": "Discord Saturn Border",
                "asset": "space thingy idk.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nYou either like the sega console...\nor you are REALLY into astronomy.",
				"tags": [
					"orange",
					"planet",
					"space"
				]
            },
            {
                "name": "Elden Ring UI",
                "asset": "elden ring.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nIf you like the game enough to set your decor to it, you must be pretty damn good at it.",
				"tags": [
					"black",
					"game"
				]
            },
            {
                "name": "GBA-Revile",
                "asset": "GBA-revile.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nNot a reference literally anyone will understand.\n(If you ignore the GBA aspect of it since everyone knows what the GBA is.)",
				"tags": [
					"green",
					"purple",
					"game boy",
					"game boy advanced",
					"game",
					"hat"
				]
            },
            {
                "name": "Green Grid",
                "asset": "green grid.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nYo I love the Xbox Original Titles:\n'Enter the Matrix (2003)' &\n 'The Matrix: Path of Neo (2005)' too!",
				"tags": [
					"matrix",
					"game"
					
				]
            },
            {
                "name": "Halo CE UI",
                "asset": "Halo CE ui.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\n'Sir, permission to leave the station.'\n'For what purpose Master Chief?'\n'To give the Covenant back their bomb.'\n\nwait that's the wrong game.",
				"tags": [
					"game",
					"blue",
					"grey",
					"gray"
				]
            },
            {
                "name": "Inscryption Prospector",
                "asset": "Inscryption Prospector.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nIVE STRUCK GOLD!!\n- said no one who let me be happy ever.",
				"tags": [
					"brown",
					"game"
				]
            },
            {
                "name": "Joker P5",
                "asset": "Joker P5.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nLookin' Cool Joker!\n\nget ready to sleep at 6 pm.",
				"tags": [
					"red",
					"white",
					"persona",
					"game",
					"knife",
					"dagger"
				]
            },
            {
                "name": "Master Sword Resting Grounds",
                "asset": "Master Sword Resting Grounds.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\n'The sacred blade...'\nunless you lack three random gems:\n• A big spider in a big tree\n• A big lizard in a big volcano\n• A big jellyfish virus in an even bigger fish",
				"tags": [
					"grey",
					"gray",
					"sword",
					"game",
					"zelda",
					"tloz",
					"the legend of zelda",
					"loz",
					"nintendo"
				]
            },
            {
                "name": "MCJE UI",
                "asset": "MC ui.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nNothing beats the classic Java experience.",
				"tags": [
					"minecraft",
					"grey",
					"gray",
					"heart",
					"java edition",
					"game"
				]
            },
            {
                "name": "MCPE UI",
                "asset": "MC pocket ui.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nUnless you prefer the nether reactor core.",
				"tags": [
					"minecraft",
					"grey",
					"gray",
					"heart",
					"pocket edition",
					"game"
				]
            },
            {
                "name": "Mimic Hiding",
                "asset": "Mimic Hiding.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nI feel like this is a great opportunity to Sister-Location yourself.",
				"tags": [
					"red",
					"robot",
					"fnaf",
					"five nights at freddy's",
					"game"
				]
            },
            {
                "name": "NES Game",
                "asset": "NES game.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nMake sure to abbreviate it or you might get sued. NES, make sure to abbreviate NES. Please.",
				"tags": [
					"black",
					"ui",
					"nintendo",
					"console"
				]
            },
            {
                "name": "New-World",
                "asset": "MC.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nNothing beats a fresh start, Especially not hardcore mode.",
				"tags": [
					"pixel",
					"minecraft",
					"game"
				]
            },
            {
                "name": "Omori Battle Party UI",
                "asset": "omori battle party ui.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nI swear i'll play it eventually please don't bully me.",
				"tags": [
					"white",
					"black",
					"pixel",
					"game"
				]
            },
            {
                "name": "P3R Battle UI",
                "asset": "p3r battle ui.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nMakes Mass Destruction look easy.",
				"tags": [
					"blue",
					"persona",
					"game",
					"persona 3 reload"
				]
            },
            {
                "name": "P3R FEMC Battle UI",
                "asset": "P3R FEMC Battle UI.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nStart Wiping All Out with ease.",
				"tags": [
					"red",
					"pink",
					"persona",
					"persona 3 reload",
					"game"
				]
            },
            {
                "name": "P3R Party UI",
                "asset": "p3r battle party UI.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nTo check Makoto's SP mid fight.",
				"tags": [
					"blue",
					"red",
					"persona",
					"persona 3 reload",
					"game"
				]
            },
            {
                "name": "P3R FEMC Party UI",
                "asset": "P3R FEMC Party UI.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nTo check Kotone's HP mid fight.",
				"tags": [
					"pink",
					"red",
					"persona",
					"persona 3 reload",
					"game"
				]
            },
            {
                "name": "P3R Social Link UI",
                "asset": "p3r social link.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nIf it wasn't obvious, this is more of a template.",
				"tags": [
					"blue",
					"persona",
					"persona 3 reload",
					"game"
				]
            },
            {
                "name": "P3R FEMC Social Link UI",
                "asset": "P3R FEMC Social Link UI.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nIf it wasn't obvious, this is more of a template.",
				"tags": [
					"pink",
					"purple",
					"persona",
					"persona 3 reload",
					"game"
				]
            },
            {
                "name": "P3R Police Station Shop",
                "asset": "P3R Police Station Shop.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nHelloooo Kurosawa\n\nI love bribing law enforcement.",
				"tags": [
					"black",
					"ui",
					"persona",
					"persona 3 reload",
					"game"
				]
            },
            {
                "name": "P4R Battle UI (Cayman Roader Concept)",
                "asset": "p4r battle ui (cayman roader concept).png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nDirectly inspired by Cayman Roader's P4R Concept UI video on Youtube!",
				"tags": [
					"yellow",
					"persona",
					"persona 4 revival",
					"game"
				]
            },
            {
                "name": "P4R Battle UI (Own Concept)",
                "asset": "p4r battle UI (own concept).png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nMy own original concept for P4R's battle UI made at the release of Reload!",
				"tags": [
					"yellow",
					"persona",
					"persona 4 revival",
					"game"
				]
            },
            {
                "name": "P5R Social Link",
                "asset": "p5r social link.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nIf it wasn't obvious, this is more of a template.",
				"tags": [
					"black",
					"white",
					"persona",
					"persona 5 royal",
					"game"
				]
            },
            {
                "name": "Purple Starforge",
                "asset": "purple starforge.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nInspired by one of discords unreleased decorations!",
				"tags": [
					"purple",
					"blue",
					"star",
					"pink"
				]
            },
            {
                "name": "Rainbow Mainframe",
                "asset": "Rainbow_Mainframe.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nI made this as a kind of cheap fix for someone elses decor, (it was way too big) but I'd argue it's so different it counts as a new original work, I am sure copyright law would agree with me there.",
				"tags": [
					"pink",
					"blue",
					"purple",
					"circuit"
				]
            },
            {
                "name": "Rick Astley (Get Rick Roll'd lol)",
                "asset": "rick astley.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nWere no strangers to identity theft,\nYou know the rules, and so do I!\nCriminal Commitments what I'm thinkin of,\nI couldn't take the form of any other guy!\n\nI am so sorry you read this.",
				"tags": [
					"white",
					"black",
					"music"
				]
            },
            {
                "name": "Sprite Outline",
                "asset": "rounded outline.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nNow we just need some McDonalds french fries to go with it!",
				"tags": [
					"blue",
					"green"
				]
            },
            {
                "name": "Sunken Submarine",
                "asset": "uglyglass.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nyou really have Fallen Down huh?\nidk why I put an undertale reference with this Ugly Glass.",
				"tags": [
					"white",
					"grey",
					"gray",
					"glass"
				]
            },
            {
                "name": "The Thing Guy",
                "asset": "the thing guy.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nI made this very quickly very low effort because it sounded like someone would want it.",
				"tags": [
					"white",
					"horns",
					"hat"
				]
            },
            {
                "name": "Wheately",
                "asset": "Wheately.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nAre you still there?\nprobably not after he tried to crush you,\ntotally fair to run btw.",
				"tags": [
					"portal",
					"game",
					"white"
				]
            },
            {
                "name": "Windows Selection",
                "asset": "win-selection.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\npossibly the first decor I ever made,\nI say possibly because I am not sure and I'm not willing to fact check that.",
				"tags": [
					"black",
					"ui"
				]
            },
            {
                "name": "Your Only Move Is Hustle",
                "asset": "your only move is hustle.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nIf YOMIH was a mobile game... It'd probably look much better than this let's be real.",
				"tags": [
					"black",
					"ui",
					"game"
				]
            },
            {
                "name": "P4AU Match UI",
                "asset": "P4AU Match UI.png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nJoin the shadow ops, Reach out for the truth, Beat the Shadows.",
				"tags": [
					"persona",
					"persona 4 arena ultimax",
					"game",
					"blue",
					"green"
				]
            },
            {
                "name": "P4AU Match UI (Readable)",
                "asset": "P4AU Match UI (Readable).png",
                "summary": "Part of the Achievement Unlocked Preset pack.\n\nJoin the shadow ops, Reach out for the truth, Beat the Shadows.",
				"tags": [
					"persona",
					"persona 4 arena ultimax",
					"game",
					"blue",
					"green"
				]
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
                "asset": "Neon bear blue !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal"
				]
            },
            {
                "name": "Neon Bear Glow",
                "asset": "Neon bear glow !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"green",
					"animal"
				]
            },
            {
                "name": "Neon Bear Green",
                "asset": "Neon bear green !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal"
				]
            },
            {
                "name": "Neon Bear Purple",
                "asset": "Neon bear purple !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal"
				]
            },
            {
                "name": "Neon Bear Red",
                "asset": "Neon bear red !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal"
				]
            },
            {
                "name": "Neon Bunny Blue",
                "asset": "Neon bunny blue !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal"
				]
            },
            {
                "name": "Neon Bunny Glow",
                "asset": "Neon bunny glow !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"green",
					"animal"
				]
            },
            {
                "name": "Neon Bunny Green",
                "asset": "Neon bunny green !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal"
				]
            },
            {
                "name": "Neon Bunny Purple",
                "asset": "Neon bunny purple !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal"
				]
            },
            {
                "name": "Neon Bunny Red",
                "asset": "Neon bunny red !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal"
				]
            },
            {
                "name": "Neon Demon Blue",
                "asset": "Neon demon blue !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"devil",
					"horns"
				]
            },
            {
                "name": "Neon Demon Glow",
                "asset": "Neon demon glow  !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"green",
					"devil",
					"horns"
				]
            },
            {
                "name": "Neon Demon Green",
                "asset": "Neon demon green !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"devil",
					"horns"
				]
            },
            {
                "name": "Neon Demon Purple",
                "asset": "Neon demon purple !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"devil",
					"horns"
				]
            },
            {
                "name": "Neon Demon Red",
                "asset": "Neon demon red !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"devil",
					"horns"
				]
            },
            {
                "name": "Neon Kitty Blue",
                "asset": "Neon kitty blue !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal",
					"cat"
				]
            },
            {
                "name": "Neon Kitty Glow",
                "asset": "Neon kitty glow !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"green",
					"animal",
					"cat"
				]
            },
            {
                "name": "Neon Kitty Green",
                "asset": "Neon kitty green !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal",
					"cat"
				]
            },
            {
                "name": "Neon Kitty Purple",
                "asset": "Neon purple kitty !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal",
					"cat"
				]
            },
            {
                "name": "Neon Kitty Red",
                "asset": "Neon kitty red !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal",
					"cat"
				]
            },
            {
                "name": "Neon Puppy Blue",
                "asset": "Neon puppy blue !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal",
					"dog"
				]
            },
            {
                "name": "Neon Puppy Glow",
                "asset": "Neon puppy glow !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"green",
					"animal",
					"dog"
				]
            },
            {
                "name": "UNeon Puppy Green",
                "asset": "Neon puppy green !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal",
					"dog"
				]
            },
            {
                "name": "Neon Puppy Purple",
                "asset": "Neon puppy purple !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal",
					"dog"
				]
            },
            {
                "name": "Neon Puppy Red",
                "asset": "Neon puppy red !.png",
                "summary": "Part of the Neon Animals Preset pack.",
				"tags": [
					"glow",
					"animal",
					"dog"
				]
            },
        ]
    },
    {
        "name": "World Ralley Championship",
        "banner": "wrc-banner.png",
        "artist_info": `T8dyi is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('808325271949934652')
        ],
        "decorations": [
            {
                "name": "AF16",
                "asset": "AF16.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
            {
                "name": "EE33",
                "asset": "EE33.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
            {
                "name": "SO17",
                "asset": "SO17.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
            {
                "name": "GM13",
                "asset": "GM13.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
            {
                "name": "MS22",
                "asset": "MS22.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
            {
                "name": "TK18",
                "asset": "TK18.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
            {
                "name": "SP20",
                "asset": "SP20.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
            {
                "name": "KR69",
                "asset": "KR69.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
            {
                "name": "OT8",
                "asset": "OT8.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
            {
                "name": "JM32",
                "asset": "JM32.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
            {
                "name": "TN11",
                "asset": "TN11.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
            {
                "name": "FORD M SPORT",
                "asset": "FORDMSPORT.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
            {
                "name": "HYUNDAI N",
                "asset": "HYUNDAIN.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
            {
                "name": "TOYOTA GR",
                "asset": "TOYOTAGR.png",
                "summary": "Part of the World Rally Championship Preset pack."
            },
        ]
    },
    {
        "name": "Constant Companions",
        "banner": "constantcompanions-banner.png",
        "artist_info": null,
        "artists": [
            findUser('186133651271057410')
        ],
        "decorations": [
            {
                "name": "Cadmium Colors",
                "asset": "CadmiumColors.png",
                "summary": "Part of the Constant Companions Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Moe Evo Evo",
                "asset": "moeevoevo.png",
                "summary": "Part of the Constant Companions Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Teto Spoken For",
                "asset": "TetoSpokenFor.png",
                "summary": "Part of the Constant Companions Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Constant Companions",
                "asset": "ConstantCompanions.png",
                "summary": "Part of the Constant Companions Preset pack.",
                "tags": [
                    "animated",
                ]
            },
        ]
    },
    {
        "name": "Developers",
        "banner": "developers-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1324198892648009760')
        ],
        "decorations": [
            {
                "name": "Html",
                "asset": "Html.png",
                "summary": "Part of the Developers Preset pack."
            },
            {
                "name": "CSS",
                "asset": "Css.png",
                "summary": "Part of the Developers Preset pack."
            },
            {
                "name": "JavaScript",
                "asset": "JavaScript.png",
                "summary": "Part of the Developers Preset pack."
            },
            {
                "name": "Python",
                "asset": "Python.png",
                "summary": "Part of the Developers Preset pack."
            },
            {
                "name": "Ruby",
                "asset": "Ruby.png",
                "summary": "Part of the Developers Preset pack."
            },
            {
                "name": "TypeScript",
                "asset": "TypeScript.png",
                "summary": "Part of the Developers Preset pack."
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
                "asset": "Phineas Decor.png",
                "summary": "Part of the Phineas & Ferb Preset pack."
            },
            {
                "name": "Ferb",
                "asset": "Ferb Decor.png",
                "summary": "Part of the Phineas & Ferb Preset pack."
            },
            {
                "name": "Candace",
                "asset": "Candace Decor.png",
                "summary": "Part of the Phineas & Ferb Preset pack."
            },
            {
                "name": "Isabella",
                "asset": "Isabella Decor.png",
                "summary": "Part of the Phineas & Ferb Preset pack."
            },
            {
                "name": "Perry",
                "asset": "Perry Decor.png",
                "summary": "Part of the Phineas & Ferb Preset pack."
            },
        ]
    },
    {
        "name": "Project Moon",
        "banner": "moon2-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1364263466000584764')
        ],
        "decorations": [
            {
                "name": "Apocalypse Bird",
                "asset": "Apocalypse_Bird.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Big Bird",
                "asset": "Big Bird.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Binds",
                "asset": "Binds.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Blue Star",
                "asset": "Blue_Star.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Burrowing Heaven",
                "asset": "Burrowing_Heaven.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "BYGONE DAYS",
                "asset": "BYGONE DAYS.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "CHEIF BUTLER RYOSHU",
                "asset": "CHEIF BUTLER RYOSHU.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "EDGAR FAMILY HEIR",
                "asset": "EDGAR FAMILY HEIR.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "ERLKING HEATHCLIFF",
                "asset": "ERLKING HEATHCLIFF.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "FAMILY BUTLER ISHMAEL",
                "asset": "FAMILY BUTLER ISHMAEL.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Funeral Of The Dead Butterflies",
                "asset": "Funeral_Of_The_Dead_Butterflies.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Green Dawn",
                "asset": "Green Dawn.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Il Pianto della Luna",
                "asset": "Il Pianto della Luna.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Judgement Bird",
                "asset": "JudgementBird.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Malkuth",
                "asset": "Malkuth.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Nothing There",
                "asset": "NothingThere.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Punishment Bird",
                "asset": "PunishmentBird.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Rabbit Protocol",
                "asset": "RabbitProtocol.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Red Riding Hooded Mercenary",
                "asset": "Red Riding Hooded Mercenary.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Scorched Girl",
                "asset": "Scorched Girl.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Silent Orchestra",
                "asset": "SilentOrchestra.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Snow Queen",
                "asset": "Snow Queen.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Sweeper",
                "asset": "Sweeper.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "The Arbiter",
                "asset": "TheArbiter.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "The Red Mist",
                "asset": "TheRedMist.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Tiphereth",
                "asset": "Tiphereth.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "White Night",
                "asset": "WhiteNight.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "WN Apostle",
                "asset": "WN Apostle.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Dawn Fixer",
                "asset": "Dawn Fixer.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Farmwatch",
                "asset": "Farmwatch.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Iron Maiden",
                "asset": "Iron Maiden.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Nagel und Hamer",
                "asset": "Nagel und Hamer.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Puppet",
                "asset": "Puppet.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Regret",
                "asset": "Regret.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Solemn Lament",
                "asset": "Solemn Lament.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Spicebush",
                "asset": "Spicebush.png",
                "summary": "Part of the Project Moon Preset pack."
            },
            {
                "name": "Thumb Capo",
                "asset": "Thumb Capo.png",
                "summary": "Part of the Project Moon Preset pack."
            },
        ]
    },
    {
        "name": "Terraria",
        "banner": "terraria-banner.png",
        "artist_info": `CallieVD is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('811114235966521364')
        ],
        "decorations": [
            {
                "name": "Overworld",
                "asset": "overworld.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Corruption",
                "asset": "corruption.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Crimson",
                "asset": "crimson.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "King Slime",
                "asset": "king slime.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Eye of Cthulhu",
                "asset": "eye of cthulhu.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Eater of Worlds",
                "asset": "eater of worlds.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Brain of Cthulhu",
                "asset": "brain of cthulhu.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Queen Bee",
                "asset": "queen bee.png",
                "summary": "Part of the Terraria Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Skeletron",
                "asset": "skeletron.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Deerclops",
                "asset": "deerclops.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Wall of Flesh",
                "asset": "wall of flesh.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Queen Slime",
                "asset": "queen slime.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "The Destroyer",
                "asset": "the destroyer.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Skeletron Prime",
                "asset": "skeletron prime.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "The Twins",
                "asset": "the twins.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Plantera",
                "asset": "plantera.png",
                "summary": "Part of the Terraria Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Golem",
                "asset": "golem.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Duke Fishron",
                "asset": "duke fishron.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Empress of Light",
                "asset": "empress of light.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Lunatic Cultist",
                "asset": "lunatic cultist.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Moonlord",
                "asset": "moonlord.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Solar",
                "asset": "solar.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Nebula",
                "asset": "nebula.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Vortex",
                "asset": "vortex.png",
                "summary": "Part of the Terraria Preset pack."
            },
            {
                "name": "Stardust",
                "asset": "stardust.png",
                "summary": "Part of the Terraria Preset pack."
            },
        ]
    },
    {
        "name": "Pressure",
        "banner": "pressure-banner.png",
        "artist_info": `Reese is accepting commissions. You can find his commission info from the decors below.`,
        "artists": [
            findUser('1317653030652608558')
        ],
        "decorations": [
            {
                "name": "Candlebearer",
                "asset": "candlebearer reese.png",
                "summary": "Part of the Pressure Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Dark Company",
                "asset": "dark company reese.png",
                "summary": "Part of the Pressure Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Dresscode Violation Glasses",
                "asset": "dresscode violation glasses reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "Dresscode Violation",
                "asset": "dresscode violation reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "ENRAGED Eyefestation",
                "asset": "ENRAGED eyefestation reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "OUTRAGED Eyefestation",
                "asset": "OUTRAGED eyefestation reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "Eyefestation",
                "asset": "eyefestation reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "Friends Forever",
                "asset": "friends forever reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "Friends 5EVER",
                "asset": "friends 5EVER reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "Group Hug",
                "asset": "group hug reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "Good People",
                "asset": "good people reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "Mirage",
                "asset": "mirage reese.png",
                "summary": "Part of the Pressure Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Pandemonium",
                "asset": "pandemonium reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "Paranoias Box",
                "asset": "paranoias box reese.png",
                "summary": "Part of the Pressure Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Pipsqueak Peek",
                "asset": "pipsqueak peek reese.png",
                "summary": "Part of the Pressure Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Rebarb",
                "asset": "rebarb reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "Splat!",
                "asset": "splat! reese.png",
                "summary": "Part of the Pressure Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "The Bottomfeeder",
                "asset": "the bottomfeeder reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "The Painter",
                "asset": "the painter reese.png",
                "summary": "Part of the Pressure Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "The Saboteur",
                "asset": "the saboteur reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "The Shoal",
                "asset": "the shoal reese.png",
                "summary": "Part of the Pressure Preset pack."
            },
            {
                "name": "Void Buddy Gold",
                "asset": "void buddy gold reese.png",
                "summary": "Part of the Pressure Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Void Buddy Green",
                "asset": "void buddy green reese.png",
                "summary": "Part of the Pressure Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Void Buddy Purple",
                "asset": "void buddy purple reese.png",
                "summary": "Part of the Pressure Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Void Buddy Red",
                "asset": "void buddy red reese.png",
                "summary": "Part of the Pressure Preset pack.",
                "tags": [
                    "animated",
                ]
            },
        ]
    },
    {
        "name": "Poop Monsters",
        "banner": "poop-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1298495520423149609')
        ],
        "decorations": [
            {
                "name": "Brown Poop Monster",
                "asset": "Brown Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Blue Poop Monster",
                "asset": "Blue Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Green Poop Monster",
                "asset": "Green Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Orange Poop Monster",
                "asset": "Orange Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Pink Poop Monster",
                "asset": "Pink Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Purple Poop Monster",
                "asset": "Purple Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Red Poop Monster",
                "asset": "Red Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Yellow Poop Monster",
                "asset": "Yellow Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Rainbow Poop Monster",
                "asset": "Rainbow Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Brat Poop Monster",
                "asset": "Brat Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Bisexual Poop Monster",
                "asset": "Bisexual Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Genderfluid Poop Monster",
                "asset": "Genderfluid Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Lesbian Poop Monster",
                "asset": "Lesbian Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Non-Binary Poop Monster",
                "asset": "Non-Binary Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Pansexual Poop Monster",
                "asset": "Pansexual Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Transgender Poop Monster",
                "asset": "Transgender Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "British Poop Monster",
                "asset": "British Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "United Poops of America",
                "asset": "United Poops of America.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "France Poop Monster",
                "asset": "France Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Sweden Poop Monster",
                "asset": "Sweden Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
            {
                "name": "Poland Poop Monster",
                "asset": "Poland Poop Monster.png",
                "summary": "Part of the Poop Monsters Preset pack."
            },
        ]
    },
    {
        "name": "Pokemon Partners",
        "banner": "pokemonpartners-banner.png",
        "artist_info": `This artist is accepting commissions. Contact them via Discord, their username is: cyber.piee`,
        "artists": [
            findUser('736626422717612083')
        ],
        "decorations": [
            {
                "name": "Bulbasaur",
                "asset": "0001-Bulbasaur.png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
            {
                "name": "Ivysaur",
                "asset": "0002-Ivysaur.png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
            {
                "name": "Venusaur",
                "asset": "0003-Venusaur.png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
            {
                "name": "Charmander",
                "asset": "0004-Charmander.png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
            {
                "name": "Charmeleon",
                "asset": "0005-Charmeleon.png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
            {
                "name": "Charizard",
                "asset": "0006-Charizard.png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
            {
                "name": "Squirtle",
                "asset": "0007-Squirtle.png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
            {
                "name": "Wartortle",
                "asset": "0008-Wartortle.png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
            {
                "name": "Blastoise",
                "asset": "0009-Blastoise.png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
            {
                "name": "Pikachu (Female)",
                "asset": "0025-Pikachu (Female).png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
            {
                "name": "Pikachu (Male)",
                "asset": "0025-Pikachu (Male).png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
            {
                "name": "Scorbunny",
                "asset": "0813-Scorbunny.png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
            {
                "name": "Raboot",
                "asset": "0814-Raboot.png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
            {
                "name": "Cinderace",
                "asset": "0815-Cinderace.png",
                "summary": "Part of the Pokémon Partners Preset pack."
            },
        ]
    },
    {
        "name": "Splatter of Color",
        "banner": "splat-banner.png",
        "artist_info": [],
        "artists": [
            findUser('1098726243920261200')
        ],
        "decorations": [
            {
                "name": "Red Splat",
                "asset": "01-redsplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Red Splat 2",
                "asset": "02-redsplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Pink Splat",
                "asset": "03-pinksplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Pink Splat 2",
                "asset": "04-pinksplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Orange Splat",
                "asset": "05-orangesplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Orange Splat 2",
                "asset": "06-orangesplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Peach Splat",
                "asset": "07-peachsplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Peach Splat 2",
                "asset": "08-peachsplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Yellow Splat",
                "asset": "09-yellowsplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Yellow Splat 2",
                "asset": "10-yellowsplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Light Green Splat",
                "asset": "11-lightgreensplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Light Green Splat 2",
                "asset": "12-lightgreensplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Dark Green Splat",
                "asset": "13-darkgreensplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Dark Green Splat 2",
                "asset": "14-darkgreensplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Cyan Splat",
                "asset": "15-cyansplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Cyan Splat 2",
                "asset": "16-cyansplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Dark Blue Splat",
                "asset": "17-darkbluesplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Dark Blue Splat 2",
                "asset": "18-darkbluesplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Pink Splat",
                "asset": "19-pinksplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Pink Splat 2",
                "asset": "20-pinksplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Purple Splat",
                "asset": "21-purplesplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Purple Splat 2",
                "asset": "22-purplesplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "White Splat",
                "asset": "23-whitesplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "White Splat 2",
                "asset": "24-whitesplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Black Splat",
                "asset": "25-blacksplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Black Splat 2",
                "asset": "26-blacksplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Rainbow Splat",
                "asset": "27-rainbowsplat.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Rainbow Splat 2",
                "asset": "28-rainbowsplat2.PNG",
                "summary": "Part of the Splatter of Color Preset pack.",
                "tags": [
                    "animated",
                ]
            },
        ]
    },
    {
        "name": "Epik Adventures",
        "banner": "epik-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1358056472809832688'),
            findUser('452679089929846784'),
        ],
        "decorations": [
            {
                "name": "Epik",
                "artist": findUser('1358056472809832688'),
                "asset": "Epik.png",
                "summary": "Part of the Epik Adventures Preset pack.",
                "tags": [
                    "alli",
                ]
            },
            {
                "name": "Cloudo",
                "artist": findUser('1349840616103612428'),
                "asset": "Cloudo.png",
                "summary": "Part of the Epik Adventures Preset pack.",
                "tags": [
                    "ican",
                ]
            },
            {
                "name": "Cephalo",
                "artist": findUser('1358056472809832688'),
                "asset": "Cephalo.png",
                "summary": "Part of the Epik Adventures Preset pack.",
                "tags": [
                    "alli",
                ]
            },
            {
                "name": "Epik Ronnie",
                "artist": findUser('1358056472809832688'),
                "asset": "Epik Ronnie.png",
                "summary": "Part of the Epik Adventures Preset pack.",
                "tags": [
                    "alli",
                ]
            },
            {
                "name": "Tecute",
                "artist": findUser('1358056472809832688'),
                "asset": "Tecute.png",
                "summary": "Part of the Epik Adventures Preset pack.",
                "tags": [
                    "alli",
                ]
            },
            {
                "name": "Tecbrute",
                "artist": findUser('1358056472809832688'),
                "asset": "Tecbrute.png",
                "summary": "Part of the Epik Adventures Preset pack.",
                "tags": [
                    "alli",
                ]
            },
        ]
    },
    {
        "force_break": true,
        "name": "Flags",
        "banner": "atlas-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1106968627036557322')
        ],
        "force_pagebreak": true,
        "decorations": [
            {
                "name": "Burundi 🇧🇮",
                "asset": "Burundi 🇧🇮.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Comoros 🇰🇲",
                "asset": "Comoros 🇰🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Djibouti 🇩🇯",
                "asset": "Djibouti 🇩🇯.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Eritrea 🇪🇷",
                "asset": "Eritrea 🇪🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Ethiopia 🇪🇹",
                "asset": "Ethiopia 🇪🇹.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Kenya 🇰🇪",
                "asset": "Kenya 🇰🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Madagascar 🇲🇬",
                "asset": "Madagascar 🇲🇬.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Malawi 🇲🇼",
                "asset": "Malawi 🇲🇼.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Mauritius 🇲🇺",
                "asset": "Mauritius 🇲🇺.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Mozambique 🇲🇿",
                "asset": "Mozambique 🇲🇿.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Rwanda 🇷🇼",
                "asset": "Rwanda 🇷🇼.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Seychelles 🇸🇨",
                "asset": "Seychelles 🇸🇨.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Somalia 🇸🇴",
                "asset": "Somalia 🇸🇴.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "South Sudan 🇸🇸",
                "asset": "South Sudan 🇸🇸.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Tanzania 🇹🇿",
                "asset": "Tanzania 🇹🇿.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Uganda 🇺🇬",
                "asset": "Uganda 🇺🇬.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Zambia 🇿🇲",
                "asset": "Zambia 🇿🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Zimbabwe 🇿🇼",
                "asset": "Zimbabwe 🇿🇼.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Angola 🇦🇴",
                "asset": "Angola 🇦🇴.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Cameroon 🇨🇲",
                "asset": "Cameroon 🇨🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Central African Republic 🇨🇫",
                "asset": "Central African Republic 🇨🇫.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Chad 🇹🇩",
                "asset": "Chad 🇹🇩.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Democratic Republic of the Congo 🇨🇩",
                "asset": "Democratic Republic of the Congo 🇨🇩.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Equatorial Guinea 🇬🇶",
                "asset": "Equatorial Guinea 🇬🇶.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Gabon 🇬🇦",
                "asset": "Gabon 🇬🇦.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Republic of the Congo 🇨🇬",
                "asset": "Republic of the Congo 🇨🇬.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "São Tomé and Príncipe 🇸🇹",
                "asset": "São Tomé and Príncipe 🇸🇹.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Algeria 🇩🇿",
                "asset": "Algeria 🇩🇿.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Egypt 🇪🇬",
                "asset": "Egypt 🇪🇬.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Libya 🇱🇾",
                "asset": "Libya 🇱🇾.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Morocco 🇲🇦",
                "asset": "Morocco 🇲🇦.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Sudan 🇸🇩",
                "asset": "Sudan 🇸🇩.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Tunisia 🇹🇳",
                "asset": "Tunisia 🇹🇳.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Botswana 🇧🇼",
                "asset": "Botswana 🇧🇼.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Eswatini 🇸🇿",
                "asset": "Eswatini 🇸🇿.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Lesotho 🇱🇸",
                "asset": "Lesotho 🇱🇸.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Namibia 🇳🇦",
                "asset": "Namibia 🇳🇦.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "South Africa 🇿🇦",
                "asset": "South Africa 🇿🇦.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Benin 🇧🇯",
                "asset": "Benin 🇧🇯.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Burkina Faso 🇧🇫",
                "asset": "Burkina Faso 🇧🇫.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Cape Verde 🇨🇻",
                "asset": "Cape Verde 🇨🇻.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Côte d'Ivoire 🇨🇮",
                "asset": "Côte d'Ivoire 🇨🇮.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Ghana 🇬🇭",
                "asset": "Ghana 🇬🇭.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Guinea 🇬🇳",
                "asset": "Guinea 🇬🇳.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Guinea-Bissau 🇬🇼",
                "asset": "Guinea-Bissau 🇬🇼.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Liberia 🇱🇷",
                "asset": "Liberia 🇱🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Mali 🇲🇱",
                "asset": "Mali 🇲🇱.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Mauritania 🇲🇷",
                "asset": "Mauritania 🇲🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Niger 🇳🇪",
                "asset": "Niger 🇳🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Nigeria 🇳🇬",
                "asset": "Nigeria 🇳🇬.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Senegal 🇸🇳",
                "asset": "Senegal 🇸🇳.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Sierra Leone 🇸🇱",
                "asset": "Sierra Leone 🇸🇱.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "The Gambia 🇬🇲",
                "asset": "The Gambia 🇬🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Togo 🇹🇬",
                "asset": "Togo 🇹🇬.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Antigua and Barbuda 🇦🇬",
                "asset": "Antigua and Barbuda 🇦🇬.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Barbados 🇧🇧",
                "asset": "Barbados 🇧🇧.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Cuba 🇨🇺",
                "asset": "Cuba 🇨🇺.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Dominica 🇩🇲",
                "asset": "Dominica 🇩🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Dominican Republic 🇩🇴",
                "asset": "Dominican Republic 🇩🇴.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Grenada 🇬🇩",
                "asset": "Grenada 🇬🇩.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Haiti 🇭🇹",
                "asset": "Haiti 🇭🇹.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Jamaica 🇯🇲",
                "asset": "Jamaica 🇯🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Saint Kitts and Nevis 🇰🇳",
                "asset": "Saint Kitts and Nevis 🇰🇳.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Saint Lucia 🇱🇨",
                "asset": "Saint Lucia 🇱🇨.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Saint Vincent and the Grenadines 🇻🇨",
                "asset": "Saint Vincent and the Grenadines 🇻🇨.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "The Bahamas 🇧🇸",
                "asset": "The Bahamas 🇧🇸.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Trinidad and Tobado 🇹🇹",
                "asset": "Trinidad and Tobado 🇹🇹.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Belize 🇧🇿",
                "asset": "Belize 🇧🇿.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Canada 🇨🇦",
                "asset": "Canada 🇨🇦.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Costa Rica 🇨🇷",
                "asset": "Costa Rica 🇨🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "El Salvador 🇸🇻",
                "asset": "El Salvador 🇸🇻.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Guatemala 🇬🇹",
                "asset": "Guatemala 🇬🇹.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Honduras 🇭🇳",
                "asset": "Honduras 🇭🇳.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Mexico 🇲🇽",
                "asset": "Mexico 🇲🇽.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Nicaragua 🇳🇮",
                "asset": "Nicaragua 🇳🇮.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Panama 🇵🇦",
                "asset": "Panama 🇵🇦.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "United States 🇺🇸",
                "asset": "United States 🇺🇸.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Argentina 🇦🇷",
                "asset": "Argentina 🇦🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Bolivia 🇧🇴",
                "asset": "Bolivia 🇧🇴.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Brazil 🇧🇷",
                "asset": "Brazil 🇧🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Chile 🇨🇱",
                "asset": "Chile 🇨🇱.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Colombia 🇨🇴",
                "asset": "Colombia 🇨🇴.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Ecuador 🇪🇨",
                "asset": "Ecuador 🇪🇨.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Guyana 🇬🇾",
                "asset": "Guyana 🇬🇾.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Paraguay 🇵🇾",
                "asset": "Paraguay 🇵🇾.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Peru 🇵🇪",
                "asset": "Peru 🇵🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Suriname 🇸🇷",
                "asset": "Suriname 🇸🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Uruguay 🇺🇾",
                "asset": "Uruguay 🇺🇾.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Venezuela 🇻🇪",
                "asset": "Venezuela 🇻🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Kazakhstan 🇰🇿",
                "asset": "Kazakhstan 🇰🇿.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Kyrgyzstan 🇰🇬",
                "asset": "Kyrgyzstan 🇰🇬.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Tajikistan 🇹🇯",
                "asset": "Tajikistan 🇹🇯.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Turkmenistan 🇹🇲",
                "asset": "Turkmenistan 🇹🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Uzbekistan 🇺🇿",
                "asset": "Uzbekistan 🇺🇿.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "China 🇨🇳",
                "asset": "China 🇨🇳.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Hong Kong 🇭🇰",
                "asset": "Hong Kong 🇭🇰.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Japan 🇯🇵",
                "asset": "Japan 🇯🇵.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Macau 🇲🇴",
                "asset": "Macau 🇲🇴.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Mongolia 🇲🇳",
                "asset": "Mongolia 🇲🇳.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "North Korea 🇰🇵",
                "asset": "North Korea 🇰🇵.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "South Korea 🇰🇷",
                "asset": "South Korea 🇰🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Taiwan 🇹🇼",
                "asset": "Taiwan 🇹🇼.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Brunei 🇧🇳",
                "asset": "Brunei 🇧🇳.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Cambodia 🇰🇭",
                "asset": "Cambodia 🇰🇭.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Indonesia 🇮🇩",
                "asset": "Indonesia 🇮🇩.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Laos 🇱🇦",
                "asset": "Laos 🇱🇦.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Malaysia 🇲🇾",
                "asset": "Malaysia 🇲🇾.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Myanmar 🇲🇲",
                "asset": "Myanmar 🇲🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Philippines 🇵🇭",
                "asset": "Philippines 🇵🇭.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Singapore 🇸🇬",
                "asset": "Singapore 🇸🇬.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Thailand 🇹🇭",
                "asset": "Thailand 🇹🇭.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Timor-Leste 🇹🇱",
                "asset": "Timor-Leste 🇹🇱.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Vietnam 🇻🇳",
                "asset": "Vietnam 🇻🇳.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Afghanistan 🇦🇫",
                "asset": "Afghanistan 🇦🇫.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Bangladesh 🇧🇩",
                "asset": "Bangladesh 🇧🇩.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Bhutan 🇧🇹",
                "asset": "Bhutan 🇧🇹.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "India 🇮🇳",
                "asset": "India 🇮🇳.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Iran 🇮🇷",
                "asset": "Iran 🇮🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Maldives 🇲🇻",
                "asset": "Maldives 🇲🇻.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Nepal 🇳🇵",
                "asset": "Nepal 🇳🇵.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Pakistan 🇵🇰",
                "asset": "Pakistan 🇵🇰.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Sri Lanka 🇱🇰",
                "asset": "Sri Lanka 🇱🇰.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Bahrain 🇧🇭",
                "asset": "Bahrain 🇧🇭.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Iraq 🇮🇶",
                "asset": "Iraq 🇮🇶.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Israel 🇮🇱",
                "asset": "Israel 🇮🇱.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Jordan 🇯🇴",
                "asset": "Jordan 🇯🇴.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Kuwait 🇰🇼",
                "asset": "Kuwait 🇰🇼.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Lebanon 🇱🇧",
                "asset": "Lebanon 🇱🇧.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Oman 🇴🇲",
                "asset": "Oman 🇴🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Palestine 🇵🇸",
                "asset": "Palestine 🇵🇸.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Qatar 🇶🇦",
                "asset": "Qatar 🇶🇦.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Saudi Arabia 🇸🇦",
                "asset": "Saudi Arabia 🇸🇦.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Syria 🇸🇾",
                "asset": "Syria 🇸🇾.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "United Arab Emirates 🇦🇪",
                "asset": "United Arab Emirates 🇦🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Yemen 🇾🇪",
                "asset": "Yemen 🇾🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Albania 🇦🇱",
                "asset": "Albania 🇦🇱.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Armenia 🇦🇲",
                "asset": "Armenia 🇦🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Azerbaijan 🇦🇿",
                "asset": "Azerbaijan 🇦🇿.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Belarus 🇧🇾",
                "asset": "Belarus 🇧🇾.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Bosnia and Herzegovina 🇧🇦",
                "asset": "Bosnia and Herzegovina 🇧🇦.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Bulgaria 🇧🇬",
                "asset": "Bulgaria 🇧🇬.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Croatia 🇭🇷",
                "asset": "Croatia 🇭🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Czechia 🇨🇿",
                "asset": "Czechia 🇨🇿.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Georgia 🇬🇪",
                "asset": "Georgia 🇬🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Hungary 🇭🇺",
                "asset": "Hungary 🇭🇺.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Kosovo 🇽🇰",
                "asset": "Kosovo 🇽🇰.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Moldova 🇲🇩",
                "asset": "Moldova 🇲🇩.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Montenegro 🇲🇪",
                "asset": "Montenegro 🇲🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "North Macedonia 🇲🇰",
                "asset": "North Macedonia 🇲🇰.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Poland 🇵🇱",
                "asset": "Poland 🇵🇱.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Romania 🇷🇴",
                "asset": "Romania 🇷🇴.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Russia 🇷🇺",
                "asset": "Russia 🇷🇺.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Serbia 🇷🇸",
                "asset": "Serbia 🇷🇸.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Slovakia 🇸🇰",
                "asset": "Slovakia 🇸🇰.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Slovenia 🇸🇮",
                "asset": "Slovenia 🇸🇮.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Ukraine 🇺🇦",
                "asset": "Ukraine 🇺🇦.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Denmark 🇩🇰",
                "asset": "Denmark 🇩🇰.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Estonia 🇪🇪",
                "asset": "Estonia 🇪🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Finland 🇫🇮",
                "asset": "Finland 🇫🇮.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Iceland 🇮🇸",
                "asset": "Iceland 🇮🇸.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Latvia 🇱🇻",
                "asset": "Latvia 🇱🇻.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Lithuania 🇱🇹",
                "asset": "Lithuania 🇱🇹.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Norway 🇳🇴",
                "asset": "Norway 🇳🇴.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Sweden 🇸🇪",
                "asset": "Sweden 🇸🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Cyprus 🇨🇾",
                "asset": "Cyprus 🇨🇾.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Greece 🇬🇷",
                "asset": "Greece 🇬🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Italy 🇮🇹",
                "asset": "Italy 🇮🇹.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Malta 🇲🇹",
                "asset": "Malta 🇲🇹.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Portugal 🇵🇹",
                "asset": "Portugal 🇵🇹.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "San Marino 🇸🇲",
                "asset": "San Marino 🇸🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Spain 🇪🇸",
                "asset": "Spain 🇪🇸.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Turkey 🇹🇷",
                "asset": "Turkey 🇹🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Vatican City 🇻🇦",
                "asset": "Vatican City 🇻🇦.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Andorra 🇦🇩",
                "asset": "Andorra 🇦🇩.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Austria 🇦🇹",
                "asset": "Austria 🇦🇹.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Belgium 🇧🇪",
                "asset": "Belgium 🇧🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "France 🇫🇷",
                "asset": "France 🇫🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Germany 🇩🇪",
                "asset": "Germany 🇩🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Ireland 🇮🇪",
                "asset": "Ireland 🇮🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Liechtenstein 🇱🇮",
                "asset": "Liechtenstein 🇱🇮.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Luxembourg 🇱🇺",
                "asset": "Luxembourg 🇱🇺.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Monaco 🇲🇨",
                "asset": "Monaco 🇲🇨.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Netherlands 🇳🇱",
                "asset": "Netherlands 🇳🇱.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Switzerland 🇨🇭",
                "asset": "Switzerland 🇨🇭.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "United Kingdom 🇬🇧",
                "asset": "United Kingdom 🇬🇧.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Australia 🇦🇺",
                "asset": "Australia 🇦🇺.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Fiji 🇫🇯",
                "asset": "Fiji 🇫🇯.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Kiribati 🇰🇮",
                "asset": "Kiribati 🇰🇮.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Marshall Islands 🇲🇭",
                "asset": "Marshall Islands 🇲🇭.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Micronesia 🇫🇲",
                "asset": "Micronesia 🇫🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Nauru 🇳🇷",
                "asset": "Nauru 🇳🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "New Zealand 🇳🇿",
                "asset": "New Zealand 🇳🇿.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Palau 🇵🇼",
                "asset": "Palau 🇵🇼.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Papua New Guinea 🇵🇬",
                "asset": "Papua New Guinea 🇵🇬.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Samoa 🇼🇸",
                "asset": "Samoa 🇼🇸.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Solomon Islands 🇸🇧",
                "asset": "Solomon Islands 🇸🇧.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Tonga 🇹🇴",
                "asset": "Tonga 🇹🇴.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Tuvalu 🇹🇻",
                "asset": "Tuvalu 🇹🇻.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Vanuatu 🇻🇺",
                "asset": "Vanuatu 🇻🇺.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Åland Islands 🇦🇽",
                "asset": "Åland Islands 🇦🇽.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "American Samoa 🇦🇸",
                "asset": "American Samoa 🇦🇸.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Anguilla 🇦🇮",
                "asset": "Anguilla 🇦🇮.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Aruba 🇦🇼",
                "asset": "Aruba 🇦🇼.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Bermuda 🇧🇲",
                "asset": "Bermuda 🇧🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "British Virgin Islands 🇻🇬",
                "asset": "British Virgin Islands 🇻🇬.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Cayman Islands 🇰🇾",
                "asset": "Cayman Islands 🇰🇾.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Christmas Island 🇨🇽",
                "asset": "Christmas Island 🇨🇽.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Cocos (Keeling) Islands 🇨🇨",
                "asset": "Cocos (Keeling) Islands 🇨🇨.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Cook Islands 🇨🇰",
                "asset": "Cook Islands 🇨🇰.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Curaçao 🇨🇼",
                "asset": "Curaçao 🇨🇼.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Falkland Islands 🇫🇰",
                "asset": "Falkland Islands 🇫🇰.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Faroe Islands 🇫🇴",
                "asset": "Faroe Islands 🇫🇴.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "French Polynesia 🇵🇫",
                "asset": "French Polynesia 🇵🇫.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Gibraltar 🇬🇮",
                "asset": "Gibraltar 🇬🇮.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Greenland 🇬🇱",
                "asset": "Greenland 🇬🇱.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Guam 🇬🇺",
                "asset": "Guam 🇬🇺.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Guernsey 🇬🇬",
                "asset": "Guernsey 🇬🇬.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Isle of Man 🇮🇲",
                "asset": "Isle of Man 🇮🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Jersey 🇯🇪",
                "asset": "Jersey 🇯🇪.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Montserrat 🇲🇸",
                "asset": "Montserrat 🇲🇸.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "New Caledonia 🇳🇨",
                "asset": "New Caledonia 🇳🇨.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Niue 🇳🇺",
                "asset": "Niue 🇳🇺.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Norfolk Island 🇳🇫",
                "asset": "Norfolk Island 🇳🇫.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Northen Mariana Islands 🇲🇵",
                "asset": "Northen Mariana Islands 🇲🇵.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Pitcairn Islands 🇵🇳",
                "asset": "Pitcairn Islands 🇵🇳.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Puerto Rico 🇵🇷",
                "asset": "Puerto Rico 🇵🇷.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Saint Barthélemy 🇧🇱",
                "asset": "Saint Barthélemy 🇧🇱.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Saint-Pierre and Miquelon 🇵🇲",
                "asset": "Saint-Pierre and Miquelon 🇵🇲.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Sint Maarten 🇲🇫",
                "asset": "Sint Maarten 🇲🇫.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Tokelau 🇹🇰",
                "asset": "Tokelau 🇹🇰.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Turks and Caicos Islands 🇹🇨",
                "asset": "Turks and Caicos Islands 🇹🇨.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "United States Virgin Islands 🇻🇮",
                "asset": "United States Virgin Islands 🇻🇮.png",
                "summary": "Part of the World Atlas Preset pack."
            },
            {
                "name": "Wallis and Futuna 🇼🇫",
                "asset": "Wallis and Futuna 🇼🇫.png",
                "summary": "Part of the World Atlas Preset pack."
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
                "asset": "Animated Apocalypse Bird.png",
                "summary": "Part of the Library of Ruina Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Apocalypse Bird",
                "asset": "Apocalypse Bird.png",
                "summary": "Part of the Library of Ruina Preset pack."
            },
            {
                "name": "Blue Star",
                "asset": "Blue Star.png",
                "summary": "Part of the Library of Ruina Preset pack."
            },
            {
                "name": "Burrowing Heaven",
                "asset": "Burrowing Heaven.png",
                "summary": "Part of the Library of Ruina Preset pack."
            },
            {
                "name": "The Happy Teddy Bear Decor",
                "asset": "The Happy Teddy Bear Decor.png",
                "summary": "Part of the Library of Ruina Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "The Price of Silence Decor",
                "asset": "The Price of Silence Decor.png",
                "summary": "Part of the Library of Ruina Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "The Funeral of the Dead Butterflies",
                "asset": "The Funeral of the Dead Butterflies.png",
                "summary": "Part of the Library of Ruina Preset pack."
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
                "asset": "poke ball.png",
                "summary": "Part of the Jelly's PokéMart Preset pack."
            },
            {
                "name": "Great Ball",
                "asset": "great ball.png",
                "summary": "Part of the Jelly's PokéMart Preset pack."
            },
            {
                "name": "Ultra Ball",
                "asset": "ultra ball.png",
                "summary": "Part of the Jelly's PokéMart Preset pack."
            },
            {
                "name": "Master Ball",
                "asset": "master ball.png",
                "summary": "Part of the Jelly's PokéMart Preset pack."
            },
            {
                "name": "Premier Ball",
                "asset": "premier ball.png",
                "summary": "Part of the Jelly's PokéMart Preset pack."
            },
            {
                "name": "Strange Ball",
                "asset": "strange ball.png",
                "summary": "Part of the Jelly's PokéMart Preset pack."
            },
            {
                "name": "Team Rocket Ball",
                "asset": "rocket ball.png",
                "summary": "Part of the Jelly's PokéMart Preset pack."
            },
            {
                "name": "GS Ball",
                "asset": "gs ball.png",
                "summary": "Part of the Jelly's PokéMart Preset pack."
            }
        ]
    },
    {
        "name": "Flavor Foley",
        "banner": "newflavorfoley-banner.png",
        "artist_info": `Ca-Cawthon is accepting commissions. You can find their commission info from the decors below.`,
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
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Weathergirl",
                "asset": "weathergirl.png",
                "summary": "Wouldn't you like to know, Weathergirl?",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Wei Ward Romance",
                "asset": "WeiWardRomance.png",
                "summary": "Beneath the lanterns, we'll meet!",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Static's Miku",
                "asset": "Static's Miku.png",
                "summary": "This is how it should be!",
                "tags": [
                    "animated",
                ]
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
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Vanity Knife-Swap",
                "asset": "Vanity Knife-Swap.png",
                "summary": "The slaughter's on!",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Spoken For",
                "asset": "Spoken For.png",
                "summary": "Try to give me meaning, it's a losing game.",
            },
        ]
    },
    {
        "name": "Star Wars",
        "banner": "starwars-banner.png",
        "artist_info": `T8dyi is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('808325271949934652')
        ],
        "decorations": [
            {
                "name": "Kylo Ren First Order",
                "asset": "krfo.png",
                "summary": "Part of the Star Wars Preset pack."
            },
            {
                "name": "Kylo Ren Unignited Lightsaber",
                "asset": "krunignited.png",
                "summary": "Part of the Star Wars Preset pack."
            },
            {
                "name": "Kylo Ren Ignited Lightsaber",
                "asset": "krignited.png",
                "summary": "Part of the Star Wars Preset pack."
            },
            {
                "name": "Kylo Ren Animated",
                "asset": "kr_anim.png",
                "summary": "Part of the Star Wars Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Darth Vader",
                "asset": "vader.png",
                "summary": "Part of the Star Wars Preset pack."
            },
            {
                "name": "Obi-Wan Kenobi",
                "asset": "obk.png",
                "summary": "Part of the Star Wars Preset pack."
            },
            {
                "name": "Kylo Ren Dark Side",
                "asset": "kr_illsytds.png",
                "summary": "Part of the Star Wars Preset pack."
            },
            {
                "name": "Yoda May the Force be With You",
                "asset": "yoda_mtfbwy.png",
                "summary": "Part of the Star Wars Preset pack."
            },
            {
                "name": "Peeking Grogu",
                "asset": "Grogu.png",
                "summary": "Part of the Star Wars Preset pack."
            },
            {
                "name": "The Armorer",
                "asset": "ta.png",
                "summary": "Part of the Star Wars Preset pack."
            },
            {
                "name": "Mythosaur",
                "asset": "mys.png",
                "summary": "Part of the Star Wars Preset pack."
            },
            {
                "name": "Clan Mudhorn",
                "asset": "CM.png",
                "summary": "Part of the Star Wars Preset pack."
            },
            {
                "name": "Bo-Katan Kryze",
                "asset": "bkk.png",
                "summary": "Part of the Star Wars Preset pack."
            },
            {
                "name": "Dark Side",
                "asset": "ds_logo.png",
                "summary": "Part of the Star Wars Preset pack."
            },
            {
                "name": "Luke Skywalker",
                "asset": "LS.png",
                "summary": "Part of the Star Wars Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Luke Skywalker (no retraction)",
                "asset": "LSnr.png",
                "summary": "Part of the Star Wars Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Ahsoka Tano Lightsabers",
                "asset": "ATsaber.png",
                "summary": "Part of the Star Wars Preset pack.",
                "tags": [
                    "animated",
                ]
            }
        ]
    },
    {
        "name": "Bugs",
        "banner": "1bugs-banner.png",
        "artist_info": `CallieVD is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('811114235966521364')
        ],
        "decorations": [
            {
                "name": "Bee",
                "asset": "bee.png",
                "summary": "Part of the Garden Critters Preset pack."
            },
            {
                "name": "Butterfly",
                "asset": "butterfly.png",
                "summary": "Part of the Garden Critters Preset pack."
            },
            {
                "name": "Butterfly Blue Variant",
                "asset": "butterfly var.png",
                "summary": "Part of the Garden Critters Preset pack."
            },
            {
                "name": "Fly",
                "asset": "fly.png",
                "summary": "Part of the Garden Critters Preset pack."
            },
            {
                "name": "Moth",
                "asset": "moth.png",
                "summary": "Part of the Garden Critters Preset pack."
            },
            {
                "name": "Roly Poly",
                "asset": "roly poly.png",
                "summary": "Part of the Garden Critters Preset pack.",
                "tags": [
                    "animated",
                ]
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
                "asset": "All Black.png",
                "summary": "Part of the Danganronpa Monochrome Family Preset pack."
            },
            {
                "name": "All White",
                "asset": "All White.png",
                "summary": "Part of the Danganronpa Monochrome Family Preset pack."
            },
            {
                "name": "Monokuma",
                "asset": "Monokuma.png",
                "summary": "Part of the Danganronpa Monochrome Family Preset pack."
            },
            {
                "name": "Monodam",
                "asset": "Monodam.png",
                "summary": "Part of the Danganronpa Monochrome Family Preset pack."
            },
            {
                "name": "Monokid",
                "asset": "Monokid.png",
                "summary": "Part of the Danganronpa Monochrome Family Preset pack."
            },
            {
                "name": "Monomi",
                "asset": "Monomi.png",
                "summary": "Part of the Danganronpa Monochrome Family Preset pack."
            },
            {
                "name": "Monophanie",
                "asset": "Monophanie.png",
                "summary": "Part of the Danganronpa Monochrome Family Preset pack."
            },
            {
                "name": "Monosuke",
                "asset": "Monosuke.png",
                "summary": "Part of the Danganronpa Monochrome Family Preset pack."
            },
            {
                "name": "Monotaro",
                "asset": "Monotaro.png",
                "summary": "Part of the Danganronpa Monochrome Family Preset pack."
            },
            {
                "name": "Usami",
                "asset": "Usami.png",
                "summary": "Part of the Danganronpa Monochrome Family Preset pack."
            },
            {
                "name": "Shuichis cap",
                "asset": "Shuichis cap.png",
                "summary": "Part of the Danganronpa Monochrome Family Preset pack."
            },
            {
                "name": "Kirigiri Ramen",
                "asset": "kirigiri ramen.png",
                "summary": "Part of the Danganronpa Monochrome Family Preset pack."
            },
            {
                "name": "Junkos Hair Pins",
                "asset": "Junkos hair pins.png",
                "summary": "Part of the Danganronpa Monochrome Family Preset pack.",
                "tags": [
                    "animated",
                ]
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
                "asset": "Appel.png",
                "summary": "Part of the Doodleys Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Burnin'",
                "asset": "Burnin'.png",
                "summary": "Part of the Doodleys Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Fedora",
                "asset": "Fedora.png",
                "summary": "Part of the Doodleys Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Sleepy",
                "asset": "Sleepy.png",
                "summary": "Part of the Doodleys Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Yummers",
                "asset": "Yummers.png",
                "summary": "Part of the Doodleys Preset pack.",
                "tags": [
                    "animated",
                ]
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
                "asset": "angel halo.png",
                "summary": "Part of the Angel X Devil Preset pack."
            },
            {
                "name": "Angel Label",
                "asset": "angel label.png",
                "summary": "Part of the Angel X Devil Preset pack."
            },
            {
                "name": "Angel Wings",
                "asset": "angel wings.png",
                "summary": "Part of the Angel X Devil Preset pack."
            },
            {
                "name": "Devil Horn",
                "asset": "devil horn.png",
                "summary": "Part of the Angel X Devil Preset pack."
            },
            {
                "name": "Devil Label",
                "asset": "devil label.png",
                "summary": "Part of the Angel X Devil Preset pack."
            },
            {
                "name": "Devil Wings",
                "asset": "devil wings.png",
                "summary": "Part of the Angel X Devil Preset pack."
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
                "asset": "CloudPlatform.png",
                "summary": "Part of the SkyDreams Preset pack."
            },
            {
                "name": "Cloud Platform (Alt)",
                "asset": "CloudPlatform(Alt).png",
                "summary": "Part of the SkyDreams Preset pack."
            },
            {
                "name": "Side Clouds",
                "asset": "SideClouds.png",
                "summary": "Part of the SkyDreams Preset pack."
            },
            {
                "name": "Starry Night",
                "asset": "StarryNight.png",
                "summary": "Part of the SkyDreams Preset pack."
            },
            {
                "name": "Starry Night (Alt)",
                "asset": "StarryNight(Alt).png",
                "summary": "Part of the SkyDreams Preset pack."
            },
            {
                "name": "Sunny Day",
                "asset": "SunnyDay.png",
                "summary": "Part of the SkyDreams Preset pack."
            }
        ]
    },
    {
        "force_break": true,
        "name": "Color Mass",
        "banner": "colormass-banner.png",
        "artist_info": `BunBwon is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('845613407818088498')
        ],
        "force_pagebreak": true,
        "decorations": [
            {
                "name": "Black Spike Crimson",
                "asset": "Black Spike  Crimson 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Cherise",
                "asset": "Black Spike Cherise 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Barbie Pink",
                "asset": "Black Spike Barbie Pink 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Phlox",
                "asset": "Black Spike Phlox 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Veronica",
                "asset": "Black Spike Veronica 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Bluebonnet",
                "asset": "Black Spike Bluebonnet 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Azure",
                "asset": "Black Spike Azure 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Capri",
                "asset": "Black Spike Capri 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Fluorescent Blue",
                "asset": "Black Spike Fluorescent Blue 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Munsell 5G",
                "asset": "Black Spike Munsell 5G 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Erin",
                "asset": "Black Spike Erin 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Harlequin",
                "asset": "Black Spike Harlequin 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Acid Green",
                "asset": "Black Spike Acid Green 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Chartreuse",
                "asset": "Black Spike Chartreuse 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Lemon",
                "asset": "Black Spike Lemon 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Saffron",
                "asset": "Black Spike Saffron 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Butterscotch",
                "asset": "Black Spike Butterscotch 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Safety Orange",
                "asset": "Black Spike Safety Orange 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Tangelo",
                "asset": "Black Spike Tangelo 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Vermillion",
                "asset": "Black Spike Vermillion 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Crimson",
                "asset": "Black Wave Crimson 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Cherise",
                "asset": "Black Wave Cherise 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Barbie Pink",
                "asset": "Black Wave Barbie Pink 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Phlox",
                "asset": "Black Wave Phlox 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Veronica",
                "asset": "Black Wave Veronica 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Bluebonnet",
                "asset": "Black Wave Bluebonnet 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Azure",
                "asset": "Black Wave Azure 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Capri",
                "asset": "Black Wave Capri 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Fluorescent Blue",
                "asset": "Black Wave Fluorescent Blue 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Munsell 5G",
                "asset": "Black Wave Munsell 5G 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Erin",
                "asset": "Black Wave Erin 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Harlequin",
                "asset": "Black Wave Harlequin 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Acid Green",
                "asset": "Black Wave Acid Green 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Chartreuse",
                "asset": "Black Wave Chartreuse 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Lemon",
                "asset": "Black Wave Lemon 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Saffron",
                "asset": "Black Wave Saffron 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Butterscotch",
                "asset": "Black Wave Butterscotch 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Safety Orange",
                "asset": "Black Wave Safety Orange 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Tangelo",
                "asset": "Black Wave Tangelo 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Vermillion",
                "asset": "Black Wave Vermillion 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Bubblegum",
                "asset": "White Spike Bubblegum 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Rose Pompadour",
                "asset": "White Spike Rose Pompadour 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Rose Pink",
                "asset": "White Spike Rose Pink 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Ultra Pink",
                "asset": "White Spike Ultra Pink 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Lavender",
                "asset": "White Spike Lavender 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Cornflower",
                "asset": "White Spike Cornflower 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Maya Blue",
                "asset": "White Spike Maya Blue 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Sky Blue",
                "asset": "White Spike Sky Blue 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Celeste",
                "asset": "White Spike Celeste 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Celadon",
                "asset": "White Spike Celadon 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Pale Green",
                "asset": "White Spike Pale Green 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Mantis",
                "asset": "White Spike Mantis 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Green Tea",
                "asset": "White Spike Green Tea 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Calamansi",
                "asset": "White Spike Calamansi 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Mellow Yellow 2",
                "asset": "White Spike Mellow Yellow 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Moccasin",
                "asset": "White Spike Moccasin 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Apricot",
                "asset": "White Spike Apricot 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Coral",
                "asset": "White Spike Coral 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Atomic Tangerine",
                "asset": "White Spike Atomic Tangerine 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Tango",
                "asset": "White Spike Tango 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Bubblegum",
                "asset": "White Wave Bubblegum 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Rose Pompadour",
                "asset": "White Wave Rose Pompadour 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Rose Pink",
                "asset": "White Wave Rose Pink 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Ultra Pink",
                "asset": "White Wave Ultra Pink 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Lavender",
                "asset": "White Wave Lavender 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Cornflower",
                "asset": "White Wave Cornflower 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Maya Blue",
                "asset": "White Wave Maya Blue 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Sky Blue",
                "asset": "White Wave Sky Blue 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Celeste",
                "asset": "White Wave Celeste 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Celadon",
                "asset": "White Wave Celadon 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Pale Green",
                "asset": "White Wave Pale Green 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Mantis",
                "asset": "White Wave Mantis 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Green Tea",
                "asset": "White Wave Green Tea 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Calamansi",
                "asset": "White Wave Calamansi 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Mellow Yellow",
                "asset": "White Wave Mellow Yellow 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Moccasin",
                "asset": "White Wave Moccasin 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Apricot",
                "asset": "White Wave Apricot 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Coral",
                "asset": "White Wave Coral 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Atomic Tangerine",
                "asset": "White Wave Atomic Tangerine 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Tango",
                "asset": "White Wave Tango 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Crimson (No Status)",
                "asset": "Black Wave Crimson.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Cherise (No Status)",
                "asset": "Black Wave Cherise.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Barbie Pink (No Status)",
                "asset": "Black Wave Barbie Pink.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Phlox (No Status)",
                "asset": "Black Wave Phlox.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Veronica (No Status)",
                "asset": "Black Wave Veronica.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Bluebonnet (No Status)",
                "asset": "Black Wave Bluebonnet.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Azure (No Status)",
                "asset": "Black Wave Azure.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Capri (No Status)",
                "asset": "Black Wave Capri.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Fluerescent Blue (No Status)",
                "asset": "Black Wave Fluerescent Blue.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Munsell 5G (No Status)",
                "asset": "Black Wave Munsell 5G.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Erin (No Status)",
                "asset": "Black Wave Erin.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Harlequin (No Status)",
                "asset": "Black Wave Harlequin.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Acid Green (No Status)",
                "asset": "Black Wave Acid Green.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Chartreuse (No Status)",
                "asset": "Black Wave Chartreuse.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Lemon (No Status)",
                "asset": "Black Wave Lemon.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Saffron (No Status)",
                "asset": "Black Wave Saffron.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Butterscotch (No Status)",
                "asset": "Black Wave Butterscotch.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Safety Orange (No Status)",
                "asset": "Black Wave Safety Orange.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Tangelo (No Status)",
                "asset": "Black Wave Tangelo.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Vermillion (No Status)",
                "asset": "Black Wave Vermillion.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Crimson (No Status)",
                "asset": "Black Spike Crimson.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Cherise (No Status)",
                "asset": "Black Spike Cherise.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Barbie Pink (No Status)",
                "asset": "Black Spike Barbie Pink.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Phlox (No Status)",
                "asset": "Black Spike Phlox.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Veronica (No Status)",
                "asset": "Black Spike Veronica.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Bluebonnet (No Status)",
                "asset": "Black Spike Bluebonnet.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Azure (No Status)",
                "asset": "Black Spike Azure.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Capri (No Status)",
                "asset": "Black Spike Capri.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Fluorescent Blue (No Status)",
                "asset": "Black Spike Fluorescent Blue.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Munsell 5G (No Status)",
                "asset": "Black Spike Munsell 5G.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Erin (No Status)",
                "asset": "Black Spike Erin.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Harlequin (No Status)",
                "asset": "Black Spike Harlequin.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Acid Green (No Status)",
                "asset": "Black Spike Acid Green.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Chartreuse (No Status)",
                "asset": "Black Spike Chartreuse.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Lemon (No Status)",
                "asset": "Black Spike Lemon.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Saffron (No Status)",
                "asset": "Black Spike Saffron.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Butterscotch (No Status)",
                "asset": "Black Spike Butterscotch.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Safety Orange (No Status)",
                "asset": "Black Spike Safety Orange.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Tangelo (No Status)",
                "asset": "Black Spike Tangelo.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Vermillion (No Status)",
                "asset": "Black Spike Vermillion.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Bubblegum (No Status)",
                "asset": "White Wave Bubblegum.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Rose Pompadour (No Status)",
                "asset": "White Wave Rose Pompadour.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Rose Pink (No Status)",
                "asset": "White Wave Rose Pink.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Ultra Pink (No Status)",
                "asset": "White Wave Ultra Pink.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Lavender (No Status)",
                "asset": "White Wave Lavender.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Cornflower (No Status)",
                "asset": "White Wave Cornflower.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Maya Blue (No Status)",
                "asset": "White Wave Maya Blue.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Sky Blue (No Status)",
                "asset": "White Wave Sky Blue.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Celeste (No Status)",
                "asset": "White Wave Celeste.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Celadon (No Status)",
                "asset": "White Wave Celadon.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Pale Green (No Status)",
                "asset": "White Wave Pale Green.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Mantis (No Status)",
                "asset": "White Wave Mantis.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Green Tea (No Status)",
                "asset": "White Wave Green Tea.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Calamansi (No Status)",
                "asset": "White Wave Calamansi.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Mellow Yellow (No Status)",
                "asset": "White Wave Mellow Yellow.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Moccasin (No Status)",
                "asset": "White Wave Moccasin.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Apricot (No Status)",
                "asset": "White Wave Apricot.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Coral (No Status)",
                "asset": "White Wave Coral.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Atomic Tangerine (No Status)",
                "asset": "White Wave Atomic Tangerine.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Tango (No Status)",
                "asset": "White Wave Tango.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Bubblegum (No Status)",
                "asset": "White Spike Bubblegum.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Rose Pompadour (No Status)",
                "asset": "White Spike Rose Pompadour.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Rose Pink (No Status)",
                "asset": "White Spike Rose Pink.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Ultra Pink (No Status)",
                "asset": "White Spike Ultra Pink.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Lavender (No Status)",
                "asset": "White Spike Lavender.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Cornflower (No Status)",
                "asset": "White Spike Cornflower.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Maya Blue (No Status)",
                "asset": "White Spike Maya Blue.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Sky Blue (No Status)",
                "asset": "White Spike Sky Blue.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Celeste (No Status)",
                "asset": "White Spike Celeste.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Celadon (No Status)",
                "asset": "White Spike Celadon.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Pale Green (No Status)",
                "asset": "White Spike Pale Green.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Mantis (No Status)",
                "asset": "White Spike Mantis.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Green Tea (No Status)",
                "asset": "White Spike Green Tea.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Calamansi (No Status)",
                "asset": "White Spike Calamansi.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Mellow Yellow (No Status)",
                "asset": "White Spike Mellow Yellow.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Moccasin (Status)",
                "asset": "White Spike Moccasin.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Apricot (No Status)",
                "asset": "White Spike Apricot.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Atomic Tangerine (No Status)",
                "asset": "White Spike Atomic Tangerine.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Coral (No Status)",
                "asset": "White Spike Coral.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Tango (No Status)",
                "asset": "White Spike Tango.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike (No Status)",
                "asset": "Black Spike.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave (No Status)",
                "asset": "Black Wave.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike (No Status)",
                "asset": "White Spike.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave (No Status)",
                "asset": "White Wave.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike",
                "asset": "Black Spike 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave",
                "asset": "Black Wave 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike",
                "asset": "White Spike 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave",
                "asset": "White Wave 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike On White (No Status)",
                "asset": "Black Spike On White.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave On White (No Status)",
                "asset": "Black Wave On White.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike On Black (No Status)",
                "asset": "White Spike On Black.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave On Black (No Status)",
                "asset": "White Wave On Black.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike On White",
                "asset": "Black Spike On White 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave On White",
                "asset": "Black Wave On White 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike On Black",
                "asset": "White Spike On Black 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave On Black",
                "asset": "White Wave On Black 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Rainbow (No Status)",
                "asset": "Black Spike Rainbow.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Rainbow (No Status)",
                "asset": "Black Wave Rainbow.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Rainbow (No Status)",
                "asset": "White Spike Rainbow.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Rainbow (No Status)",
                "asset": "White Wave Rainbow.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Spike Rainbow",
                "asset": "Black Spike Rainbow 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "Black Wave Rainbow",
                "asset": "Black Wave Rainbow 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Spike Rainbow",
                "asset": "White Spike Rainbow 2.png",
                "summary": "Part of the Color Mass Preset pack."
            },
            {
                "name": "White Wave Rainbow",
                "asset": "White Wave Rainbow 2.png",
                "summary": "Part of the Color Mass Preset pack."
            }
        ]
    },
    {
        "name": "Formula 1",
        "banner": "1formula1-banner.png",
        "artist_info": `CallieVD is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('811114235966521364')
        ],
        "decorations": [
            {
                "name": "Tsunoda",
                "asset": "tsunoda.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Verstappen",
                "asset": "verstappen.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Hadjar",
                "asset": "hadjar.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Lawson",
                "asset": "lawson.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Bearman",
                "asset": "bearman.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Ocon",
                "asset": "ocon.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Bortoleto",
                "asset": "bortoleto.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Hulkenberg",
                "asset": "hulkenberg.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Alonso",
                "asset": "alonso.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Stroll",
                "asset": "stroll.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Piastri",
                "asset": "piastri.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Norris",
                "asset": "norris.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Hamilton",
                "asset": "hamilton.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Leclerc",
                "asset": "leclerc.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Albon",
                "asset": "albon.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Sainz",
                "asset": "sainz.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Antonelli",
                "asset": "antonelli.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Russell",
                "asset": "russel.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Colapinto",
                "asset": "colapinto.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Doohan",
                "asset": "doohan.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Gasly",
                "asset": "gasly.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Bianchi",
                "asset": "bianchi.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Perez",
                "asset": "perez.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Raikkonen",
                "asset": "raikkonen.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Ricciardo",
                "asset": "ricciardo.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Rosberg",
                "asset": "rosberg.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Sargeant",
                "asset": "sargeant.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Schumacher",
                "asset": "schumacher.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Senna",
                "asset": "senna.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Vettel",
                "asset": "vettel.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Webber",
                "asset": "webber.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Red Bull",
                "asset": "red bull.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Vcarb",
                "asset": "vcarb.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Haas",
                "asset": "haas.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Sauber",
                "asset": "sauber.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Aston Martin",
                "asset": "aston martin.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "McLaren",
                "asset": "mclaren.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Ferrari",
                "asset": "ferrari.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Williams",
                "asset": "williams.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Mercedes",
                "asset": "mercedes.png",
                "summary": "Part of the Formula 1 Preset pack."
            },
            {
                "name": "Alpine",
                "asset": "alpine.png",
                "summary": "Part of the Formula 1 Preset pack."
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
                "asset": "Beat Sabers.png",
                "summary": "Part of the Beat Saber Preset pack."
            },
            {
                "name": "Big Slash (Blue)",
                "asset": "Big Slash (Blue).png",
                "summary": "Part of the Beat Saber Preset pack."
            },
            {
                "name": "Big Slash (Red)",
                "asset": "Big Slash (Red).png",
                "summary": "Part of the Beat Saber Preset pack."
            },
            {
                "name": "Bombs",
                "asset": "Bombs.png",
                "summary": "Part of the Beat Saber Preset pack."
            },
            {
                "name": "The Bloq (Blue)",
                "asset": "The Bloq (Blue).png",
                "summary": "Part of the Beat Saber Preset pack."
            },
            {
                "name": "The Bloq (Red)",
                "asset": "The Bloq (Red).png",
                "summary": "Part of the Beat Saber Preset pack."
            },
            {
                "name": "The Walls",
                "asset": "The Walls.png",
                "summary": "Part of the Beat Saber Preset pack."
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
                "asset": "AB Wood Block Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "AB Glass Block",
                "asset": "AB Glass Block Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "AB Stone Block",
                "asset": "AB Stone Block Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "AB Cheetos Logo",
                "asset": "AB Cheetos Logo Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "AB Coca Cola Logo",
                "asset": "AB Coca Cola Logo Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "AB Seasons Easter Egg Logo",
                "asset": "AB Seasons Easter Egg Logo Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "AB Logo",
                "asset": "AB Logo Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "AB Space Logo",
                "asset": "AB Space Logo Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "AB Space Vuela Tazos Logo",
                "asset": "AB Space Vuela Tazos Logo Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "Attack Of Darth Maul",
                "asset": "Attack Of Darth Maul Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "Darth Vader",
                "asset": "Darth Vader Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "Solar System",
                "asset": "Solar System Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "Pork Federation",
                "asset": "Pork Federation Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "Bomb Space",
                "asset": "Bomb Space Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "Mynock Pigs",
                "asset": "Mynock Pigs Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "Electric Bomb",
                "asset": "Electric Bomb Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "Red Space",
                "asset": "Red Space Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "King Pig",
                "asset": "King Pig Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            },
            {
                "name": "Stars",
                "asset": "Stars Decor.png",
                "summary": "Part of the Angry Birds Preset pack."
            }
        ]
    },
    {
        "name": "EASTER",
        "banner": "easter-banner.png",
        "artist_info": `Zin, CallieVD & Sharr are accepting commissions. You can find their commission info from the decors below.`,
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
                "asset": "bunnie by pixie.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "nuki",
                ]
            },
            {
                "name": "Choco Bunny",
                "artist": findUser('1143994313034960967'),
                "asset": "choco bunny by pixie.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "nuki",
                ]
            },
            {
                "name": "Egg Basket",
                "artist": findUser('1143994313034960967'),
                "asset": "egg basket by pixie.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "nuki",
                ]
            },
            {
                "name": "Community Eggs",
                "artist": findUser('452679089929846784'),
                "asset": "fixed community eggs by zin.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "zin",
                ]
            },
            {
                "name": "Easter Bunny",
                "artist": findUser('811114235966521364'),
                "asset": "easter bunny by cal.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "callievd",
                ]
            },
            {
                "name": "Easter Egg",
                "artist": findUser('811114235966521364'),
                "asset": "easter egg by cal.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "callievd",
                ]
            },
            {
                "name": "Egg Basket",
                "artist": findUser('811114235966521364'),
                "asset": "egg basket by cal.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "callievd",
                ]
            },
            {
                "name": "Egg Bowl",
                "artist": findUser('811114235966521364'),
                "asset": "egg bowl by cal.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "callievd",
                ]
            },
            {
                "name": "Eggs in Grass",
                "artist": findUser('811114235966521364'),
                "asset": "eggs in grass by cal.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "callievd",
                ]
            },
            {
                "name": "Grass Egg",
                "artist": findUser('1088105926030000178'),
                "asset": "grass egg by sharr.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "shar",
                ]
            },
            {
                "name": "Pastel Blue Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel blue easter decor by teto.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "foxy",
                ]
            },
            {
                "name": "Pastel Cyan Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel cyan easter decor by teto.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "foxy",
                ]
            },
            {
                "name": "Pastel Green Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel green easter decor by teto.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "foxy",
                ]
            },
            {
                "name": "Pastel Mint Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel mint easter decor by teto.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "foxy",
                ]
            },
            {
                "name": "Pastel Orange Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel orange easter decor by teto.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "foxy",
                ]
            },
            {
                "name": "Pastel Pink Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel pink easter decor by teto.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "foxy",
                ]
            },
            {
                "name": "Pastel Red Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel red easter decor by teto.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "foxy",
                ]
            },
            {
                "name": "Pastel Teal Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel teal easter decor by teto.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "foxy",
                ]
            },
            {
                "name": "Pastel Yellow Easter Decor",
                "artist": findUser('1139815872874172456'),
                "asset": "pastel yellow easter decor by teto.png",
                "summary": "Part of the Easter Preset pack.",
                "tags": [
                    "foxy",
                ]
            }
        ]
    },
    {
        "name": "BLOONS",
        "banner": "bloons-banner.png",
        "artist_info": `Sharr is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('1088105926030000178')
        ],
        "decorations": [
            {
                "name": "Adora",
                "asset": "adora.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Benjamin",
                "asset": "benjamin.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Brickell",
                "asset": "brickell.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Churchill",
                "asset": "churchill.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Corvus",
                "asset": "corvus.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Etienne",
                "asset": "etienne.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Ezili",
                "asset": "ezili.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Gwendolin",
                "asset": "gwendolin.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Jones",
                "asset": "jones.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Obyn",
                "asset": "obyn.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Pat",
                "asset": "pat.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Psi",
                "asset": "psi.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Quincy",
                "asset": "quincy.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Alchemist",
                "asset": "004-Alchemistdecorx.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Boomerang Monkey",
                "asset": "500-BoomerangMonkeyDecorx.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Sniper Monkey",
                "asset": "500-SniperMonkeydecorx.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Geraldox",
                "asset": "geraldox.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Outclassed by icicle",
                "asset": "out-classed-by-icicle-impalex.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Rosaliax",
                "asset": "rosaliax.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "True Sun Godx",
                "asset": "truesungodx.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "005-Super Monkey",
                "asset": "005-SuperMonkeydecor.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "005-Wizard Monkey",
                "asset": "005-WizardMokeydecor.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "050-Druid Monkey",
                "asset": "050-DruidMonkeydecor.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "050-Engineer Monkey",
                "asset": "050-EngineerMonkeydecor.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "050-Ice Monkey",
                "asset": "050-IceMonkeydecor.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "500-Monkey Submarine",
                "asset": "500-MonkeySubmarinedecor.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "500-Ninja Monkey",
                "asset": "500-NinjaMonkeydecor.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Anti-Bloons",
                "asset": "Anti-Bloons.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Bomb Blitz",
                "asset": "Bomb Blitz.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Sentry Champion",
                "asset": "Sentry Champion.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Glue Storm",
                "asset": "Glue Storm.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Grand Saboteur",
                "asset": "Grand Saboteur.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
            },
            {
                "name": "Sauda",
                "asset": "Sauda.png",
                "summary": "Part of the Bloons Tower Defense 6 Preset pack."
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
                "asset": "pinkboba.png",
                "summary": "Part of the Baker's Dozen Preset pack."
            },
            {
                "name": "Cherry On Top",
                "asset": "cherryontop.png",
                "summary": "Part of the Baker's Dozen Preset pack."
            },
            {
                "name": "Chocolate Roll",
                "asset": "choco_roll.png",
                "summary": "Part of the Baker's Dozen Preset pack."
            },
            {
                "name": "Strawberry Roll",
                "asset": "strawberry_roll.png",
                "summary": "Part of the Baker's Dozen Preset pack."
            },
            {
                "name": "Cookie",
                "asset": "cookie.png",
                "summary": "Part of the Baker's Dozen Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Croissant",
                "asset": "croissant.png",
                "summary": "Part of the Baker's Dozen Preset pack."
            },
            {
                "name": "Crumb",
                "asset": "crumb.png",
                "summary": "Part of the Baker's Dozen Preset pack."
            },
            {
                "name": "Pink Cupcake Circle",
                "asset": "pinkcupcake.png",
                "summary": "Part of the Baker's Dozen Preset pack."
            },
            {
                "name": "Cupcake Tray",
                "asset": "cupcaketray.png",
                "summary": "Part of the Baker's Dozen Preset pack."
            },
            {
                "name": "Mixing Bowl",
                "asset": "mixingbowl.png",
                "summary": "Part of the Baker's Dozen Preset pack."
            },
            {
                "name": "Pie Slice",
                "asset": "pieslice.png",
                "summary": "Part of the Baker's Dozen Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Strawberries",
                "asset": "strawberries.png",
                "summary": "Part of the Baker's Dozen Preset pack."
            },
            {
                "name": "Sundae Bowl",
                "asset": "sundaebowl.png",
                "summary": "Part of the Baker's Dozen Preset pack."
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
                "asset": "protoss.png",
                "summary": "Part of the StarCraft Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Protoss Green",
                "asset": "Protoss_green.png",
                "summary": "Part of the StarCraft Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Protoss Purple",
                "asset": "Protoss_purp.png",
                "summary": "Part of the StarCraft Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Terran",
                "asset": "terran.png",
                "summary": "Part of the StarCraft Preset pack."
            },
            {
                "name": "Terran Green",
                "asset": "terran_green.png",
                "summary": "Part of the StarCraft Preset pack."
            },
            {
                "name": "Terran Red",
                "asset": "terran_red.png",
                "summary": "Part of the StarCraft Preset pack."
            },
            {
                "name": "Zerg",
                "asset": "zerg.png",
                "summary": "Part of the StarCraft Preset pack."
            },
            {
                "name": "Zerg Green",
                "asset": "Zerg_green.png",
                "summary": "Part of the StarCraft Preset pack."
            },
            {
                "name": "Zerg Pink",
                "asset": "Zerg_pink.png",
                "summary": "Part of the StarCraft Preset pack."
            },
            {
                "name": "Zerg Purple",
                "asset": "Zerg_purp.png",
                "summary": "Part of the StarCraft Preset pack."
            }
        ]
    },
    {
        "name": "limbus",
        "banner": "limbus-banner.png",
        "artist_info": `Alide is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('1096831760089763860')
        ],
        "decorations": [
            {
                "name": "Don Quixote",
                "asset": "don_quixote.png",
                "summary": "Part of the Limbus Company Preset pack.",
            },
            {
                "name": "Heathcliff",
                "asset": "heathcliff.png",
                "summary": "Part of the Limbus Company Preset pack.",
            },
            {
                "name": "Hong Lu",
                "asset": "hong_lu.png",
                "summary": "Part of the Limbus Company Preset pack.",
            },
            {
                "name": "Ishmael",
                "asset": "ishmael.png",
                "summary": "Part of the Limbus Company Preset pack.",
            },
            {
                "name": "Meursault",
                "asset": "meursault.png",
                "summary": "Part of the Limbus Company Preset pack.",
            },
            {
                "name": "Middle Brother",
                "asset": "middle_brother.png",
                "summary": "Part of the Limbus Company Preset pack.",
            },
            {
                "name": "Ryoshu",
                "asset": "ryoshu.png",
                "summary": "Part of the Limbus Company Preset pack.",
            }
        ]
    },
    {
        "name": "JOJO",
        "banner": "newjojo-banner.png",
        "artist_info": null,
        "artists": [
            findUser('1037013172114182234')
        ],
        "decorations": [
            {
                "name": "Aerosmith",
                "asset": "Aerosmith.png",
                "summary": "Part of the JoJo's Bizarre Adventure Preset pack.",
            },
            {
                "name": "bitesthedustunderrr",
                "asset": "bitesthedustunderrr.png",
                "summary": "Part of the JoJo's Bizarre Adventure Preset pack.",
            },
            {
                "name": "Echoes Act 1",
                "asset": "echoes_act_1.png",
                "summary": "Part of the JoJo's Bizarre Adventure Preset pack.",
            },
            {
                "name": "Echoes Act 2",
                "asset": "echoes_act_2.png",
                "summary": "Part of the JoJo's Bizarre Adventure Preset pack.",
            },
            {
                "name": "Hermit",
                "asset": "hermit.png",
                "summary": "Part of the JoJo's Bizarre Adventure Preset pack.",
            },
            {
                "name": "Killer Queen",
                "asset": "killer_queen.png",
                "summary": "Part of the JoJo's Bizarre Adventure Preset pack.",
            },
            {
                "name": "Six Pistols",
                "asset": "SixPistols.png",
                "summary": "Part of the JoJo's Bizarre Adventure Preset pack.",
            },
            {
                "name": "Gyro Zeppeli",
                "asset": "Gyro Zeppeli.png",
                "summary": "Part of the JoJo's Bizarre Adventure Preset pack.",
            },
            {
                "name": "Johnny Joestar",
                "asset": "Johnny Joestar.png",
                "summary": "Part of the JoJo's Bizarre Adventure Preset pack.",
            },
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
                "asset": "Ameican_Doritos_Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Cheese Doritos",
                "asset": "Cheese_Doritos_Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Flaming Hot Doritos",
                "asset": "Flaming_Hot_Doritos_Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Mountain Dew Doritos",
                "asset": "Mountain_Dew_Doritos_Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Rainbow Doritos",
                "asset": "Raimbow_Doritos_Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Sweet Chilli Pepper Doritos",
                "asset": "Sweet_Chilli_Pepper_Doritos_Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Whopper Doritos",
                "asset": "Whopper_Doritos_Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Sweet Paprika Doritos Bits",
                "asset": "Sweet_Paprika_Doritos_Bits_Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Honey BBQ Doritos Bits",
                "asset": "Honey_BBQ_Doritos_Bts_Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Mountain Dew Drink Doritos",
                "asset": "Montain_Dew_Drink_Doritos_Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Flaming Hot Chicken Fries",
                "asset": "Flaming_Hot_Chicken_Fries_Doritos.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Chilli Heatwave Chicken Fries",
                "asset": "Chilli_Heatwave_Chicken_Fries_Doritos.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Cheese Chicken Fries",
                "asset": "Cheese_Chicken_Fries_Doritos.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Golem American Doritos",
                "asset": "Golem American Doritos Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Skeleton Cheese Doritos",
                "asset": "Skeleton Cheese Doritos Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "Steve Chilli Heatwave Doritos",
                "asset": "Steve Chilli Heatwave Doritos Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "The Creeper Vinegar Doritos",
                "asset": "The Creeper Vinegar Doritos Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
            },
            {
                "name": "The Ghast BBQ Doritos",
                "asset": "The Ghast BBQ Doritos Decor.png",
                "summary": "Part of the Doritos Fanclub Preset pack.",
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
                "asset": "apple (granny smith).png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Apple",
                "asset": "apple.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Banana",
                "asset": "banana.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Beans",
                "asset": "beans.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Broccoli",
                "asset": "broccoli.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Burger",
                "asset": "burger.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Burrito",
                "asset": "burito.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Cabbage",
                "asset": "cabbage.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Carrot",
                "asset": "carrot.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Cheese",
                "asset": "cheese.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Chips",
                "asset": "chips.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Chocolate",
                "asset": "chocolate.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Real Cookie",
                "asset": "realcookie.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Corns",
                "asset": "corns.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Cotton Candy",
                "asset": "cotton candy.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Real Cupcake",
                "asset": "realcupcake.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Dragon Fruit",
                "asset": "dragon fruit.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Fries",
                "asset": "fries.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Grape",
                "asset": "grape.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Hot Dog",
                "asset": "hot dog.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Strawberry Ice Cream",
                "asset": "ice cream (strawberry).png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Jelly Beans",
                "asset": "jelly beans.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Mandarin",
                "asset": "mandarin.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Mango",
                "asset": "mango.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Pancake",
                "asset": "pancake.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Pie",
                "asset": "pie.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Pizza",
                "asset": "pizza.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Popcorn",
                "asset": "popcorns.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Pudding",
                "asset": "pudding.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Red Mushroom",
                "asset": "red mushroom (srry i only make 1 mushroom decor cuz i have mycophobia).png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Rice",
                "asset": "rice.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Salad",
                "asset": "salad.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Salmon",
                "asset": "salmon.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Strawberry",
                "asset": "strawberry.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Taco",
                "asset": "taco.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Watermelon",
                "asset": "watermelon.png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "The Forbidden Cheese",
                "asset": "the forbidden cheese (sulfur).png",
                "summary": "Part of the Om Nom's Preset pack.",
            },
            {
                "name": "Uranium",
                "asset": "Uranium (special).png",
                "summary": "Part of the Om Nom's Preset pack.",
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
                "asset": "black collar black cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Black Collar Blue Cat Ears",
                "asset": "black collar blue cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Black Collar Calico Cat Ears",
                "asset": "black collar calico cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Black Collar Dark Orange Cat Ears",
                "asset": "black collar dark orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Black Collar Green Cat Ears",
                "asset": "black collar green cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Black Collar Light Gray Cat Ears",
                "asset": "black collar light gray cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Black Collar Light Orange Cat Ears",
                "asset": "black collar light orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Black Collar Light Yellow Cat Ears",
                "asset": "black collar light yellow cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Black Collar Purple Cat Ears",
                "asset": "black collar purple cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Black Collar Red Cat Ears",
                "asset": "black collar red cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Black Collar White Cat Ears",
                "asset": "black collar white cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Blue Collar Black Cat Ears",
                "asset": "blue collar black cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Blue Collar Blue Cat Ears",
                "asset": "blue collar blue cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Blue Collar Calico Cat Ears",
                "asset": "blue collar calico cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Blue Collar Dark Orange Cat Ears",
                "asset": "blue collar dark orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Blue Collar Gray Cat Ears",
                "asset": "blue collar gray cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Blue Collar Green Cat Ears",
                "asset": "blue collar green cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Blue Collar Light Orange Cat Ears",
                "asset": "blue collar light orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Blue Collar Purple Cat Ears",
                "asset": "blue collar purple cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Blue Collar Red Cat Ears",
                "asset": "blue collar red cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Blue Collar White Cat Ears",
                "asset": "blue collar white cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Cyan Collar Black Cat Ears",
                "asset": "cyan collar black cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Cyan Collar Blue Cat Ears",
                "asset": "cyan collar blue cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Cyan Collar Calico Cat Ears",
                "asset": "cyan collar calico cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Cyan Collar Dark Orange Cat Ears",
                "asset": "cyan collar dark orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Cyan Collar Green Cat Ears",
                "asset": "cyan collar green cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Cyan Collar Light Gray Cat Ears",
                "asset": "cyan collar light gray cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Cyan Collar Light Orange Cat Ears",
                "asset": "cyan collar light orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Cyan Collar Light Yellow Cat Ears",
                "asset": "cyan collar light yellow cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Cyan Collar Red Cat Ears",
                "asset": "cyan collar red cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Cyan Collar White Cat Ears",
                "asset": "cyan collar white cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Green Collar Black Cat Ears",
                "asset": "green collar black cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Green Collar Blue Cat Ears",
                "asset": "green collar blue cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Green Collar Calico Cat Ears",
                "asset": "green collar calico cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Green Collar Dark Orange Cat Ears",
                "asset": "green collar dark orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Green Collar Green Cat Ears",
                "asset": "green collar green cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Green Collar Light Gray Cat Ears",
                "asset": "green collar light gray cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Green Collar Light Orange Cat Ears",
                "asset": "green collar light orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Green Collar Light Yellow Cat Ears",
                "asset": "green collar light yellow cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Green Collar Purple Cat Ears",
                "asset": "green collar purple cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Green Collar Red Cat Ears",
                "asset": "green collar red cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Green Collar White Cat Ears",
                "asset": "green collar white cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Magenta Collar Black Cat Ears",
                "asset": "magneta collar black cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Magenta Collar Blue Cat Ears",
                "asset": "magneta collar blue cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Magenta Collar Calico Cat Ears",
                "asset": "magneta collar calico cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Magenta Collar Dark Orange Cat Ears",
                "asset": "magneta collar dark orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Magenta Collar Green Cat Ears",
                "asset": "magneta collar green cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Magenta Collar Light Gray Cat Ears",
                "asset": "magneta collar light gray cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Magenta Collar Light Yellow Cat Ears",
                "asset": "magneta collar light yellow cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Magenta Collar Purple Cat Ears",
                "asset": "magneta collar purple cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Magenta Collar Red Cat Ears",
                "asset": "magneta red cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Magenta Collar White Cat Ears",
                "asset": "magneta collar white cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Orange Collar Black Cat Ears",
                "asset": "orange collar black cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Orange Collar Blue Cat Ears",
                "asset": "orange collar blue cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Orange Collar Calico Cat Ears",
                "asset": "orange collar calico cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Orange Collar Dark Orange Cat Ears",
                "asset": "orange collar dark orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Orange Collar Green Cat Ears",
                "asset": "orange collar green cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Orange Collar Light Gray Cat Ears",
                "asset": "orange collar light gray cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Orange Collar Light Yellow Cat Ears",
                "asset": "orange collar light yellow cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Orange Collar Orange Cat Ears",
                "asset": "orange collar orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Orange Collar Purple Cat Ears",
                "asset": "orange collar purple cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Orange Collar Red Cat Ears",
                "asset": "orange collar red cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Orange Collar White Cat Ears",
                "asset": "orange collar white cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Red Collar Black Cat Ears",
                "asset": "red collar black cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Red Collar Blue Cat Ears",
                "asset": "red collar blue cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Red Collar Calico Cat Ears",
                "asset": "red collar calico cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Red Collar Dark Orange Cat Ears",
                "asset": "red collar dark orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Red Collar Green Cat Ears",
                "asset": "red collar green cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Red Collar Light Orange Cat Ears",
                "asset": "red collar light orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Red Collar Light Yellow Cat Ears",
                "asset": "red collar light yellow cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Red Collar Purple Cat Ears",
                "asset": "red collar purple cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Red Collar Red Cat Ears",
                "asset": "red collar red cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Red Collar White Cat Ears",
                "asset": "red collar white cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "White Collar Black Cat Ears",
                "asset": "white collar black cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "White Collar Blue Cat Ears",
                "asset": "white collar blue cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "White Collar Calico Cat Ears",
                "asset": "white collar calico cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "White Collar Dark Orange Cat Ears",
                "asset": "white collar dark orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "White Collar Green Cat Ears",
                "asset": "white collar green cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "White Collar Light Gray Cat Ears",
                "asset": "white collar light gray cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "White Collar Light Orange Cat Ears",
                "asset": "white collar light orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "White Collar Light Yellow Cat Ears",
                "asset": "white collar light yellow cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "White Collar Purple Cat Ears",
                "asset": "white collar purple cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "White Collar Red Cat Ears",
                "asset": "white collar red cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "White Collar White Cat Ears",
                "asset": "white collar white cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Blue Cat Ears",
                "asset": "blue cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Calico Cat Ears",
                "asset": "calico cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Cyan Cat Ears",
                "asset": "cyan cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Dark Orange Cat Ears",
                "asset": "dark orange cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Green Cat Ears",
                "asset": "green cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Light Gray Cat Ears",
                "asset": "light gray cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Light Yellow Cat Ears",
                "asset": "light yellow cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Purple Cat Ears",
                "asset": "purple cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "Red Cat Ears",
                "asset": "red cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            },
            {
                "name": "White Cat Ears",
                "asset": "white cat ears.png",
                "summary": "Part of the Crazy Cat Person Preset pack.",
            }
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
                "asset": "cynthia.png",
                "summary": "Part of the Pokémon: Legendary Showdown Preset pack.",
            },
            {
                "name": "Natural Harmonia Gropius",
                "asset": "N.png",
                "summary": "Part of the Pokémon: Legendary Showdown Preset pack.",
            },
            {
                "name": "Giratina",
                "asset": "giratina.png",
                "summary": "Part of the Pokémon: Legendary Showdown Preset pack.",
            },
            {
                "name": "Ceruledge",
                "asset": "ceruledge.png",
                "summary": "Part of the Pokémon: Legendary Showdown Preset pack.",
            },
            {
                "name": "Reshiram",
                "asset": "reshiram.png",
                "summary": "Part of the Pokémon: Legendary Showdown Preset pack.",
            },
            {
                "name": "Mew",
                "asset": "mew.png",
                "summary": "Part of the Pokémon: Legendary Showdown Preset pack.",
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
                "asset": "bomby-and-nickel.png",
                "summary": "Part of the Battle for Dream Island Preset pack.",
            },
            {
                "name": "Dirt Cake",
                "asset": "dirt-cake.png",
                "summary": "Part of the Battle for Dream Island Preset pack.",
            },
            {
                "name": "Freesmart",
                "asset": "freesmart-alternates.png",
                "summary": "Part of the Battle for Dream Island Preset pack.",
            },
            {
                "name": "Gumdrop Galore",
                "asset": "gumdrop-galore.png",
                "summary": "Part of the Battle for Dream Island Preset pack.",
            },
            {
                "name": "Inside Bubble",
                "asset": "inside-bubble.png",
                "summary": "Part of the Battle for Dream Island Preset pack.",
            },
            {
                "name": "Inside the donut hole",
                "asset": "inside-the-donut-hole.png",
                "summary": "Part of the Battle for Dream Island Preset pack.",
            },
            {
                "name": "Pop that bubble",
                "asset": "pop-that-bubble.png",
                "summary": "Part of the Battle for Dream Island Preset pack.",
            },
            {
                "name": "Rocky Barf",
                "asset": "rocky-barf.png",
                "summary": "Part of the Battle for Dream Island Preset pack.",
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
                "asset": "DARNELL_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "Face Sticker",
                "asset": "FACE_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "Tankman Sticker",
                "asset": "TANKMAN_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "GF Sticker",
                "asset": "GF_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "Daddy Dearest Sticker",
                "asset": "DADDY_DEAREST_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "Mommy Dearest Sticker",
                "asset": "MOMMY_DEAREST_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "Sempai Sticker",
                "asset": "SEMPAI_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "Ski And Pump Sticker",
                "asset": "SKIDANDPUMP_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "Speakers Sticker",
                "asset": "SPEAKERS_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "Spirit Sticker",
                "asset": "SPIRIT_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "Lemon Demon Sticker",
                "asset": "LEMON_DEMON_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "BF Sticker",
                "asset": "Bf_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "Pico Sticker",
                "asset": "PICO_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "Nene Sticker",
                "asset": "NENE_Sticker_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "BF Fan",
                "asset": "Bf_Fan_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "FNF Player",
                "asset": "FNF_Player_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
            },
            {
                "name": "GF Sit",
                "asset": "GF_Sit_Decor.png",
                "summary": "Part of the Friday Night Funkin' Preset pack.",
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
                "asset": "chef.png",
                "summary": "Part of the Pizza Tower Preset pack.",
            },
            {
                "name": "Chef Hat",
                "asset": "chefhat.png",
                "summary": "Part of the Pizza Tower Preset pack.",
            },
            {
                "name": "Goo",
                "asset": "goo.png",
                "summary": "Part of the Pizza Tower Preset pack.",
            },
            {
                "name": "Mouth",
                "asset": "mouth.png",
                "summary": "Part of the Pizza Tower Preset pack.",
            },
            {
                "name": "Rat Knife",
                "asset": "ratknife.png",
                "summary": "Part of the Pizza Tower Preset pack.",
            },
            {
                "name": "Brick",
                "asset": "brick.png",
                "summary": "Part of the Pizza Tower Preset pack.",
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
                "asset": "Blackmask.png",
                "summary": "Part of the Kisune Appearings Preset pack.",
            },
            {
                "name": "Blue Mask",
                "asset": "Bluemask.png",
                "summary": "Part of the Kisune Appearings Preset pack.",
            },
            {
                "name": "Green Mask",
                "asset": "Greenmask.png",
                "summary": "Part of the Kisune Appearings Preset pack.",
            },
            {
                "name": "Pink Mask",
                "asset": "Pinkmask.png",
                "summary": "Part of the Kisune Appearings Preset pack.",
            },
            {
                "name": "Purple Mask",
                "asset": "Purplemask.png",
                "summary": "Part of the Kisune Appearings Preset pack.",
            },
            {
                "name": "Red Mask",
                "asset": "Redmask.png",
                "summary": "Part of the Kisune Appearings Preset pack.",
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
                "asset": "flamelike.png",
                "summary": "Part of the Neon Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Prideful",
                "asset": "prideful.png",
                "summary": "Part of the Neon Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Split Globe",
                "asset": "split-globe.png",
                "summary": "Part of the Neon Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Glitch",
                "asset": "glitch.png",
                "summary": "Part of the Neon Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "RGB Circle",
                "asset": "rgbcircle.png",
                "summary": "Part of the Neon Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Purple Glow",
                "asset": "purple-glow.png",
                "summary": "Part of the Neon Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Geometric",
                "asset": "geometric.png",
                "summary": "Part of the Neon Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Particle Circle",
                "asset": "particle-circle.png",
                "summary": "Part of the Neon Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Retro Car",
                "asset": "retrocar.png",
                "summary": "Part of the Neon Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Runic",
                "asset": "runic.png",
                "summary": "Part of the Neon Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Wireframe",
                "asset": "wireframe.png",
                "summary": "Part of the Neon Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Galaxy",
                "asset": "Galaxy.png",
                "summary": "Part of the Neon Preset pack.",
                "tags": [
                    "animated",
                ]
            }
        ]
    },
    {
        "name": "Stardew",
        "banner": "1stardew-banner.png",
        "artist_info": `CallieVD is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('811114235966521364')
        ],
        "decorations": [
            {
                "name": "Abigail",
                "asset": "abigail.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Alex",
                "asset": "alex.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Elliott",
                "asset": "elliott.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Emily",
                "asset": "emily.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Haley",
                "asset": "haley.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Harvey",
                "asset": "harvey.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Hat Mouse",
                "asset": "hatmouse.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Junimo",
                "asset": "junimo.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Leah",
                "asset": "leah.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Maru",
                "asset": "maru.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Mr Qi",
                "asset": "mrqi.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Pendant",
                "asset": "pendant.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Penny",
                "asset": "penny.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Sam",
                "asset": "sam.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Sebastian",
                "asset": "sebastian.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Shane",
                "asset": "shane.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            },
            {
                "name": "Portrait",
                "asset": "portrait.png",
                "summary": "Part of the Stardew Valley Preset pack.",
            }
        ]
    },
    {
        "name": "Squish",
        "banner": "1squishmallow-banner.png",
        "artist_info": `CallieVD is accepting commissions. You can find their commission info from the decors below.`,
        "artists": [
            findUser('811114235966521364')
        ],
        "decorations": [
            {
                "name": "Carotene",
                "asset": "carotene.png",
                "summary": "Part of the Squishmallows Preset pack.",
            },
            {
                "name": "Davina",
                "asset": "davina.png",
                "summary": "Part of the Squishmallows Preset pack.",
            },
            {
                "name": "Mario",
                "asset": "mario.png",
                "summary": "Part of the Squishmallows Preset pack.",
            },
            {
                "name": "Rebecca",
                "asset": "rebecca.png",
                "summary": "Part of the Squishmallows Preset pack.",
            },
            {
                "name": "Tristan",
                "asset": "tristan.png",
                "summary": "Part of the Squishmallows Preset pack.",
            },
            {
                "name": "Omnomnom",
                "asset": "omnomnom.png",
                "summary": "Part of the Squishmallows Preset pack.",
            },
            {
                "name": "Sam Sundae",
                "asset": "sam sundae.png",
                "summary": "Part of the Squishmallows Preset pack.",
            },
            {
                "name": "Pom Pom Burger",
                "asset": "pom pom burger.png",
                "summary": "Part of the Squishmallows Preset pack.",
            },
            {
                "name": "Akilah",
                "asset": "akilah.png",
                "summary": "Part of the Squishmallows Preset pack.",
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
                "asset": "dandelionautumn.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dandelion Blue",
                "asset": "dandelionblue.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dandelion Cherry",
                "asset": "dandelioncherry.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dandelion Cyan",
                "asset": "dandelioncyan.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dandelion Green",
                "asset": "dandeliongreen.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dandelion Mystical",
                "asset": "dandelionmystical.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dandelion Pink",
                "asset": "dandelionpink.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dandelion Purple",
                "asset": "dandelionpurple.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dandelion Yellow",
                "asset": "dandelionyellow.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dust Azure",
                "asset": "dustazure.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dust Cyan",
                "asset": "dustcyan.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dust Forest",
                "asset": "dustforest.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dust Green",
                "asset": "dustgreen.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dust Magical",
                "asset": "dustmagical.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dust Pink",
                "asset": "dustpink.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dust Purple",
                "asset": "dustpurple.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dust Red",
                "asset": "dustred.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Dust Yellow",
                "asset": "dustyellow.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Gemstone Autumn",
                "asset": "gemstoneautumn.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Gemstone Blue",
                "asset": "gemstoneblue.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Gemstone Green",
                "asset": "gemstonegreen.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Gemstone Pastel",
                "asset": "gemstonepastel.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Gemstone Pink",
                "asset": "gemstonepink.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Gemstone Red",
                "asset": "gemstonered.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Gemstone Spring",
                "asset": "gemstonespring.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Gemstone Summer",
                "asset": "gemstonesummer.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Gemstone Yellow",
                "asset": "gemstoneyellow.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Holly Autumn",
                "asset": "hollyautumn.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Holly Blue",
                "asset": "hollyblue.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Holly Brown",
                "asset": "hollybrown.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Holly Cherry",
                "asset": "hollycherry.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Holly Forest",
                "asset": "hollyforest.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Holly Green",
                "asset": "hollygreen.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Holly Mint",
                "asset": "hollymint.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Holly Purple",
                "asset": "hollypurple.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Holly Red",
                "asset": "hollyred.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Lantern Autumn",
                "asset": "lanternautumn.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Lantern Blue",
                "asset": "lanternblue.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Lantern Cherry",
                "asset": "lanterncherry.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Lantern Crystal",
                "asset": "lanterncrystal.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Lantern Green",
                "asset": "lanterngreen.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Lantern Pink",
                "asset": "lanternpink.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Lantern Purple",
                "asset": "lanternpurple.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Lantern Red",
                "asset": "lanternred.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Lantern Yellow",
                "asset": "lanternyellow.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "No Lantern Autumn",
                "asset": "nolanternautumn.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "No Lantern Blue",
                "asset": "nolanternblue.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "No Lantern Cherry",
                "asset": "nolanterncherry.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "No Lantern Crystal",
                "asset": "nolanterncrystal.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "No Lantern Green",
                "asset": "nolanterngreen.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "No Lantern Pink",
                "asset": "nolanternpink.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "No Lantern Purple",
                "asset": "nolanternpurple.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "No Lantern Red",
                "asset": "nolanternred.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "No Lantern Yellow",
                "asset": "nolanternyellow.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Quartz Blue",
                "asset": "quartzblue.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Quartz Cyan",
                "asset": "quartzcyan.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Quartz Green",
                "asset": "quartzgreen.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Quartz Orange",
                "asset": "quartzorange.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Quartz Purple",
                "asset": "quartzpurple.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Quartz Red",
                "asset": "quartzred.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Quartz Rose",
                "asset": "quartzrose.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Quartz Yellow",
                "asset": "quartzyellow.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Quartz Rainbow",
                "asset": "quartzrainbow.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Ribbon Blue",
                "asset": "ribbonblue.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Ribbon Cyan",
                "asset": "ribboncyan.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Ribbon Forest",
                "asset": "ribbonforest.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Ribbon Mint",
                "asset": "ribbonmint.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Ribbon Pink",
                "asset": "ribbonpink.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Ribbon Purple",
                "asset": "ribbonpurple.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Ribbon Red",
                "asset": "ribbonred.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Ribbon Rose",
                "asset": "ribbonrose.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Ribbon Yellow",
                "asset": "ribbonyellow.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Sakura Autumn",
                "asset": "sakuraautumn.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Sakura Dawn",
                "asset": "sakuradawn.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Sakura Cyan",
                "asset": "sakuracyan.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Sakura Emerald",
                "asset": "sakuraemerald.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Sakura Mint",
                "asset": "sakuramint.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Sakura Moonlight",
                "asset": "sakuramoonlight.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Sakura Twilight",
                "asset": "sakuratwilight.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Sakura Pink",
                "asset": "sakurapink.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Sakura Yellow",
                "asset": "sakurayellow.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Leaves Autumn",
                "asset": "leavesautumn.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Leaves Blue",
                "asset": "leavesblue.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Leaves Green",
                "asset": "leavesgreen.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Leaves Magenta",
                "asset": "leavesmagenta.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Leaves Mint",
                "asset": "leavesmint.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Leaves Pink",
                "asset": "leavespink.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Leaves Red",
                "asset": "leavesred.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Leaves Winter",
                "asset": "leaveswinter.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
            },
            {
                "name": "Leaves Yellow",
                "asset": "leavesyellow.png",
                "summary": "Part of the Tales of Crystal Wonderland Preset pack.",
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
                "asset": "pinkjelly.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "jelly",
                ]
            },
            {
                "name": "Happy Jellyfish",
                "artist": findUser('272359106839314446'),
                "asset": "happyjelly.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "kurama"
                ]
            },
            {
                "name": "Axolotl Blue",
                "artist": findUser('713791218160500796'),
                "asset": "axoblue.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Axolotl Pink",
                "artist": findUser('713791218160500796'),
                "asset": "axopink.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Axolotl Purple",
                "artist": findUser('713791218160500796'),
                "asset": "axopurple.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Axolotl White",
                "artist": findUser('713791218160500796'),
                "asset": "axowhite.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Axolotl Yellow",
                "artist": findUser('713791218160500796'),
                "asset": "axoyellow.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Float Blue",
                "artist": findUser('713791218160500796'),
                "asset": "floatblue.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Float Green",
                "artist": findUser('713791218160500796'),
                "asset": "floatgreen.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Float Pink",
                "artist": findUser('713791218160500796'),
                "asset": "floatpink.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Float Purple",
                "artist": findUser('713791218160500796'),
                "asset": "floatpurple.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Float Yellow",
                "artist": findUser('713791218160500796'),
                "asset": "floatyellow.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Blue Knife",
                "artist": findUser('713791218160500796'),
                "asset": "blueknife.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Green Knife",
                "artist": findUser('713791218160500796'),
                "asset": "greenknife.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Mint Knife",
                "artist": findUser('713791218160500796'),
                "asset": "mintknife.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Pink Knife",
                "artist": findUser('713791218160500796'),
                "asset": "pinkknife.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Purple Knife",
                "artist": findUser('713791218160500796'),
                "asset": "purpleknife.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Red Knife",
                "artist": findUser('713791218160500796'),
                "asset": "redknife.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "Yellow Knife",
                "artist": findUser('713791218160500796'),
                "asset": "yellowknife.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "animated",
                    "glassconsumer69"
                ]
            },
            {
                "name": "White Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "a_ white jelly.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "foxy"
                ]
            },
            {
                "name": "Cyan Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "cyan jelly.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "foxy"
                ]
            },
            {
                "name": "Light Purple Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "d_light purple jelly.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "foxy"
                ]
            },
            {
                "name": "Pink Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "d_pink jelly.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "foxy"
                ]
            },
            {
                "name": "Light Green Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "f_light green jelly.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "foxy"
                ]
            },
            {
                "name": "Dark Green Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "g_dark green jelly.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "foxy"
                ]
            },
            {
                "name": "Light Yellow Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "g_light yellow jelly.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "foxy"
                ]
            },
            {
                "name": "Gold Jelly",
                "artist": findUser('1139815872874172456'),
                "asset": "g1_gold jelly.png",
                "summary": "Part of the Coral Reef Preset pack.",
                "tags": [
                    "foxy"
                ]
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
                "asset": "bunnyears.png",
                "summary": "Part of the Petting Zoo Preset pack.",
            },
            {
                "name": "Cat Ears",
                "asset": "catears.png",
                "summary": "Part of the Petting Zoo Preset pack.",
            },
            {
                "name": "Deer Ears",
                "asset": "deerears.png",
                "summary": "Part of the Petting Zoo Preset pack.",
            },
            {
                "name": "Dog Ears No Tail",
                "asset": "dogearsnotail.png",
                "summary": "Part of the Petting Zoo Preset pack.",
            },
            {
                "name": "Dog Ears Tail",
                "asset": "dogearstail.png",
                "summary": "Part of the Petting Zoo Preset pack.",
            },
            {
                "name": "Wing Ears",
                "asset": "wingears.png",
                "summary": "Part of the Petting Zoo Preset pack.",
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
                "asset": "hollyjolly.png",
                "summary": "Part of The Garage Preset pack.",
            },
            {
                "name": "Rated M",
                "asset": "ratedm.png",
                "summary": "Part of The Garage Preset pack.",
            },
            {
                "name": "Beat",
                "asset": "Beat.png",
                "summary": "Part of The Garage Preset pack.",
            },
            {
                "name": "Corn",
                "asset": "Corn.png",
                "summary": "Part of The Garage Preset pack.",
            },
            {
                "name": "Gum",
                "asset": "Gum.png",
                "summary": "Part of The Garage Preset pack.",
            },
            {
                "name": "Evil Dead",
                "asset": "evildead.png",
                "summary": "Part of The Garage Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Neon Chainsaw",
                "asset": "neonchainsaw.png",
                "summary": "Part of The Garage Preset pack.",
            },
            {
                "name": "Lava Lamp",
                "asset": "lavadecor.png",
                "summary": "Part of The Garage Preset pack.",
                "tags": [
                    "animated",
                ]
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
                "asset": "another.png",
                "summary": "Part of the Wonderlands x Showtime Preset pack.",
            },
            {
                "name": "Cat Cap",
                "asset": "catcap.png",
                "summary": "Part of the Wonderlands x Showtime Preset pack.",
            },
            {
                "name": "Emu",
                "asset": "Emu.png",
                "summary": "Part of the Wonderlands x Showtime Preset pack.",
            },
            {
                "name": "Glowy",
                "asset": "less_light.png",
                "summary": "Part of the Wonderlands x Showtime Preset pack.",
            },
            {
                "name": "Nene",
                "asset": "Nene.png",
                "summary": "Part of the Wonderlands x Showtime Preset pack.",
            },
            {
                "name": "Peachy",
                "asset": "remake.png",
                "summary": "Part of the Wonderlands x Showtime Preset pack.",
            },
            {
                "name": "Rui",
                "asset": "Rui.png",
                "summary": "Part of the Wonderlands x Showtime Preset pack.",
            },
            {
                "name": "Teto Pear",
                "asset": "teto_frame_ig.png",
                "summary": "Part of the Wonderlands x Showtime Preset pack.",
            },
            {
                "name": "Teto Bow",
                "asset": "tetoo.png",
                "summary": "Part of the Wonderlands x Showtime Preset pack.",
            },
            {
                "name": "Teto Swirl",
                "asset": "tetoswirl.png",
                "summary": "Part of the Wonderlands x Showtime Preset pack.",
            },
            {
                "name": "More Teto",
                "asset": "tetoteto.png",
                "summary": "Part of the Wonderlands x Showtime Preset pack.",
            },
            {
                "name": "Tsukasa",
                "asset": "Tsukasa.png",
                "summary": "Part of the Wonderlands x Showtime Preset pack.",
            },
            {
                "name": "Wonderhoy",
                "asset": "wonderhoy.png",
                "summary": "Part of the Wonderlands x Showtime Preset pack.",
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
                "asset": "fork.png",
                "summary": "Part of the Pancake Day Preset pack.",
            },
            {
                "name": "Munching",
                "asset": "munching.png",
                "summary": "Part of the Pancake Day Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Syrup",
                "asset": "syrup.png",
                "summary": "Part of the Pancake Day Preset pack.",
            },
            {
                "name": "Syrup 2",
                "asset": "syrup2.png",
                "summary": "Part of the Pancake Day Preset pack.",
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
                "asset": "plumbing.png",
                "summary": "Part of the Oxygen Not Included Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Power",
                "asset": "power.png",
                "summary": "Part of the Oxygen Not Included Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Radbolts",
                "asset": "radbolts.png",
                "summary": "Part of the Oxygen Not Included Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Slickster",
                "asset": "slickster.png",
                "summary": "Part of the Oxygen Not Included Preset pack.",
                "tags": [
                    "animated",
                ]
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
                "asset": "choco.png",
                "summary": "Part of the Sanrio Preset pack.",
            },
            {
                "name": "Cinnamoroll",
                "asset": "cinnamoroll.png",
                "summary": "Part of the Sanrio Preset pack.",
            },
            {
                "name": "Hello Kitty",
                "asset": "kitty.png",
                "summary": "Part of the Sanrio Preset pack.",
            },
            {
                "name": "Kuromi",
                "asset": "kuromi.png",
                "summary": "Part of the Sanrio Preset pack.",
            },
            {
                "name": "Melody",
                "asset": "melody.png",
                "summary": "Part of the Sanrio Preset pack.",
            },
            {
                "name": "Purin",
                "asset": "purin.png",
                "summary": "Part of the Sanrio Preset pack.",
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
                "asset": "Annies_Hair.png",
                "summary": "Part of the Scribbletastic Preset pack.",
            },
            {
                "name": "Anton's Hair",
                "asset": "Antons_Hair.png",
                "summary": "Part of the Scribbletastic Preset pack.",
            },
            {
                "name": "Cookie",
                "asset": "Cookie_decoration.png",
                "summary": "Part of the Scribbletastic Preset pack.",
            },
            {
                "name": "Green Dude",
                "asset": "Greendude_decoration.png",
                "summary": "Part of the Scribbletastic Preset pack.",
            },
            {
                "name": "Marcie",
                "asset": "Marcie_decoration.png",
                "summary": "Part of the Scribbletastic Preset pack.",
            },
            {
                "name": "Taunt",
                "asset": "Taunt_decor.png",
                "summary": "Part of the Scribbletastic Preset pack.",
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
                "asset": "goat horns.png",
                "summary": "Part of the Horns Preset pack.",
            },
            {
                "name": "Devil Horns",
                "asset": "devil horns.png",
                "summary": "Part of the Horns Preset pack.",
            },
            {
                "name": "Squishy Horns",
                "asset": "squishy horns.png",
                "summary": "Part of the Horns Preset pack.",
            },
            {
                "name": "Over Horns",
                "asset": "over horns.png",
                "summary": "Part of the Horns Preset pack.",
            },
            {
                "name": "Stylish Horns",
                "asset": "stylish horns.png",
                "summary": "Part of the Horns Preset pack.",
            },
            {
                "name": "Alien Ears",
                "asset": "alien ears.png",
                "summary": "Part of the Horns Preset pack.",
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
                "asset": "yashiro clips.png",
                "summary": "Part of the Toilet-Bound Hanako-Kun Preset pack.",
            },
            {
                "name": "Hanako Ghosts",
                "asset": "hanako ghosts.png",
                "summary": "Part of the Toilet-Bound Hanako-Kun Preset pack.",
            },
            {
                "name": "Tsukasa Ghosts",
                "asset": "tsukasa ghosts.png",
                "summary": "Part of the Toilet-Bound Hanako-Kun Preset pack.",
            },
            {
                "name": "Yako Ears",
                "asset": "yako ears.png",
                "summary": "Part of the Toilet-Bound Hanako-Kun Preset pack.",
            },
            {
                "name": "Yako Ears Alt",
                "asset": "yako ears alt.png",
                "summary": "Part of the Toilet-Bound Hanako-Kun Preset pack.",
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
                "asset": "abstractpurple.png",
                "summary": "Part of the Abstract Preset pack.",
            },
            {
                "name": "Bubble",
                "asset": "bubble.png",
                "summary": "Part of the Abstract Preset pack.",
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
                "asset": "kisses.png",
                "summary": "Part of the Valentine Doodlez Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Envelope",
                "asset": "envelope.png",
                "summary": "Part of the Valentine Doodlez Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Love Thoughts",
                "asset": "lovethoughts.png",
                "summary": "Part of the Valentine Doodlez Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Blue Flower",
                "asset": "blueflower.png",
                "summary": "Part of the Valentine Doodlez Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Pink Flower",
                "asset": "pinkflower.png",
                "summary": "Part of the Valentine Doodlez Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Blue Candy",
                "asset": "blue candy.png",
                "summary": "Part of the Valentine Doodlez Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Pink Candy",
                "asset": "pink candy.png",
                "summary": "Part of the Valentine Doodlez Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Blue Hat",
                "asset": "bluehat.png",
                "summary": "Part of the Valentine Doodlez Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Pink Hat",
                "asset": "pinkhat.png",
                "summary": "Part of the Valentine Doodlez Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Valentines Day",
                "asset": "valentinesday.png",
                "summary": "Part of the Valentine Doodlez Preset pack.",
                "tags": [
                    "animated",
                ]
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
                "asset": "holdingbaby.png",
                "summary": "Part of the Wavy & Sonic's Love Story Preset pack.",
            },
            {
                "name": "Greetings",
                "asset": "greetings.png",
                "summary": "Part of the Wavy & Sonic's Love Story Preset pack.",
            },
            {
                "name": "Sonic Pal",
                "asset": "sonicpal.png",
                "summary": "Part of the Wavy & Sonic's Love Story Preset pack.",
            },
            {
                "name": "Marry Me",
                "asset": "marryme.png",
                "summary": "Part of the Wavy & Sonic's Love Story Preset pack.",
            },
            {
                "name": "Big Day",
                "asset": "bigday.png",
                "summary": "Part of the Wavy & Sonic's Love Story Preset pack.",
            },
            {
                "name": "Streamer",
                "asset": "streamer.png",
                "summary": "Part of the Wavy & Sonic's Love Story Preset pack.",
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
                "asset": "abstract.png",
                "summary": "Part of the Balatro Preset pack.",
            },
            {
                "name": "Baron",
                "asset": "baron.png",
                "summary": "Part of the Balatro Preset pack.",
            },
            {
                "name": "Canio",
                "asset": "canio.png",
                "summary": "Part of the Balatro Preset pack.",
            },
            {
                "name": "Chicot",
                "asset": "chicot.png",
                "summary": "Part of the Balatro Preset pack.",
            },
            {
                "name": "Jimbo",
                "asset": "jimbo.png",
                "summary": "Part of the Balatro Preset pack.",
            },
            {
                "name": "Mime",
                "asset": "mime.png",
                "summary": "Part of the Balatro Preset pack.",
            },
            {
                "name": "Perkeo",
                "asset": "perkeo.png",
                "summary": "Part of the Balatro Preset pack.",
            },
            {
                "name": "Red Chip",
                "asset": "red chip.png",
                "summary": "Part of the Balatro Preset pack.",
            },
            {
                "name": "Triboulet",
                "asset": "triboulet.png",
                "summary": "Part of the Balatro Preset pack.",
            },
            {
                "name": "Wheel of Fortune",
                "asset": "wheel of fortune.png",
                "summary": "Part of the Balatro Preset pack.",
            },
            {
                "name": "White Chip",
                "asset": "white chip.png",
                "summary": "Part of the Balatro Preset pack.",
            },
            {
                "name": "Yorick",
                "asset": "yorick.png",
                "summary": "Part of the Balatro Preset pack.",
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
                "asset": "brownalien.png",
                "summary": "Part of the Doodles N' Bobs Preset pack.",
            },
            {
                "name": "Purple Alien",
                "asset": "purplealien.png",
                "summary": "Part of the Doodles N' Bobs Preset pack.",
            },
            {
                "name": "Sanford",
                "asset": "sanford.png",
                "summary": "Part of the Doodles N' Bobs Preset pack.",
            },
            {
                "name": "Deimos",
                "asset": "deimos.png",
                "summary": "Part of the Doodles N' Bobs Preset pack.",
            },
            {
                "name": "Dynamite",
                "asset": "dynamite.png",
                "summary": "Part of the Doodles N' Bobs Preset pack.",
            },
            {
                "name": "Ganyu",
                "asset": "ganyu.png",
                "summary": "Part of the Doodles N' Bobs Preset pack.",
            },
            {
                "name": "Shark with a Trident",
                "asset": "sharktrident.png",
                "summary": "Part of the Doodles N' Bobs Preset pack.",
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
                "asset": "senshi.png",
                "summary": "Part of the Delicious in Dungeon Preset pack.",
            },
            {
                "name": "Senshi with mustache",
                "asset": "senshi1.png",
                "summary": "Part of the Delicious in Dungeon Preset pack.",
            },
            {
                "name": "Laios Touden",
                "asset": "laios-touden.png",
                "summary": "Part of the Delicious in Dungeon Preset pack.",
            },
            {
                "name": "Marcille Donato",
                "asset": "marcille-donato.png",
                "summary": "Part of the Delicious in Dungeon Preset pack.",
            },
            {
                "name": "Chilchuck Tims",
                "asset": "chilchuck-tims.png",
                "summary": "Part of the Delicious in Dungeon Preset pack.",
            },
            {
                "name": "Falin Touden",
                "asset": "falin-touden.png",
                "summary": "Part of the Delicious in Dungeon Preset pack.",
            },
            {
                "name": "Izutsumi",
                "asset": "izutsumi.png",
                "summary": "Part of the Delicious in Dungeon Preset pack.",
            },
            {
                "name": "Neck Warmer",
                "asset": "neckwarmer.png",
                "summary": "Part of the Delicious in Dungeon Preset pack.",
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
                "asset": "acespec.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Agender",
                "asset": "agender.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Aroace",
                "asset": "aroace.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Aroacespec",
                "asset": "aroacespec.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Aromantic",
                "asset": "aromantic.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Arospec",
                "asset": "arospec.png","summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Asexual",
                "asset": "asexual.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Demiagender",
                "asset": "demiagender.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Demiboy",
                "asset": "demiboy.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Demigender",
                "asset": "demigender.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Demigirl",
                "asset": "demigirl.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Demimix",
                "asset": "demimix.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Gay",
                "asset": "gay.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Genderqueer",
                "asset": "genderqueer.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Lesbian",
                "asset": "lesbian.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Librafem",
                "asset": "librafem.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Libramasc",
                "asset": "libramasc.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Non Binary",
                "asset": "nonbinary.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Transbian",
                "asset": "transbian.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Trans Gay",
                "asset": "trans-gay.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Transgender",
                "asset": "transgender.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Transfem",
                "asset": "transfem.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Transmasc",
                "asset": "transmasc.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Transneutral",
                "asset": "transneutral.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Abrosexual",
                "asset": "abrosexual.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Bisexual",
                "asset": "bisexual.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Omnisexual",
                "asset": "omnisexual.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Pansexual",
                "asset": "pansexual.png",
                "summary": "Part of the Pride Preset pack.",
            },
            {
                "name": "Polysexual",
                "asset": "polysexual.png",
                "summary": "Part of the Pride Preset pack.",
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
                "asset": "moon.png",
                "summary": "Part of the Stars & Planets Preset pack.",
            },
            {
                "name": "Moon & Stars",
                "asset": "moonstars.png",
                "summary": "Part of the Stars & Planets Preset pack.",
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
                "asset": "chibi-totoro1.png",
                "summary": "Part of the My Neighbour Totoro Preset pack.",
            },
            {
                "name": "Chibi Totoro Animated",
                "asset": "chibi-totoroanimated.png",
                "summary": "Part of the My Neighbour Totoro Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Chu Totoro",
                "asset": "chu-totoro.png",
                "summary": "Part of the My Neighbour Totoro Preset pack.",
            },
            {
                "name": "Chu Totoro Animated",
                "asset": "chu-totoroanimated.png",
                "summary": "Part of the My Neighbour Totoro Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Chibi Totoro Green",
                "asset": "chibi-totorofixed.png",
                "summary": "Part of the My Neighbour Totoro Preset pack.",
            },
            {
                "name": "Totoro",
                "asset": "totoro.png",
                "summary": "Part of the My Neighbour Totoro Preset pack.",
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
                "asset": "ladybug.png",
                "summary": "Part of the By The Lake Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Ducky",
                "asset": "ducky.png",
                "summary": "Part of the By The Lake Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Leaves",
                "asset": "leaves.png",
                "summary": "Part of the By The Lake Preset pack.",
                "tags": [
                    "animated",
                ]
            },
            {
                "name": "Picnic",
                "asset": "picnic.png",
                "summary": "Part of the By The Lake Preset pack.",
                "tags": [
                    "animated",
                ]
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
                "asset": "boba.png",
                "summary": "Part of the Drippy Desserts Preset pack.",
            },
            {
                "name": "Cupcake",
                "asset": "cupcake.png",
                "summary": "Part of the Drippy Desserts Preset pack.",
            },
            {
                "name": "Ice Cream",
                "asset": "icecream.png",
                "summary": "Part of the Drippy Desserts Preset pack.",
            },
            {
                "name": "Macarons",
                "asset": "macarons.png",
                "summary": "Part of the Drippy Desserts Preset pack.",
            },
            {
                "name": "Strawberry Cake",
                "asset": "strawberry-cake.png",
                "summary": "Part of the Drippy Desserts Preset pack.",
            }
        ]
    },
    {
        "name": "Collector's Dream",
        "banner": "collectors-banner.png",
        "artist_info": null,
        "artists": [
            findUser('773625796807360563')
        ],
        "decorations": [
            {
                "name": "Mew Card",
                "asset": "mewcard.png",
                "summary": "Part of the Collector's Dream Preset pack.",
                "tags": [
                    "pokemon",
                ]
            },
            {
                "name": "Charizard Card",
                "asset": "charizardcard.png",
                "summary": "Part of the Collector's Dream Preset pack.",
                "tags": [
                    "pokemon",
                ]
            },
            {
                "name": "Pokéball",
                "asset": "pokeball.png",
                "summary": "Part of the Collector's Dream Preset pack.",
                "tags": [
                    "pokemon",
                ]
            },
            {
                "name": "GameBoy",
                "asset": "gameboy.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "SNES",
                "asset": "snes.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Nintendo 3DS",
                "asset": "3ds.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Nintendo Wii",
                "asset": "wii.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "PlayStation",
                "asset": "playstation.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "DreamCast",
                "asset": "dreamcast.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Nintendo Switch",
                "asset": "switch.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Xbox One",
                "asset": "xbox1.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Xbox Series S",
                "asset": "xboxs.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "My Hero Academia",
                "asset": "mha.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Sword Art Online",
                "asset": "sao.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Bleach",
                "asset": "bleach.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Majoras Mask",
                "asset": "zelda.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Cat",
                "asset": "cat.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Naruto",
                "asset": "naruto.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "My Deer Friend Nokotan",
                "asset": "nokotan.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Antler",
                "asset": "antler.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Hu Tao",
                "asset": "hutao.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Cat Hug",
                "asset": "cathug.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Sword Girl",
                "asset": "swordgirl.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Jujutsu Kaisen 1",
                "asset": "juju1.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Jujutsu Kaisen 2",
                "asset": "juju2.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Girl 1",
                "asset": "girl1.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Girl 2",
                "asset": "girl2.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            },
            {
                "name": "Girl 3",
                "asset": "girl3.png",
                "summary": "Part of the Collector's Dream Preset pack.",
            }
        ]
    },
    {
        "name": "UNCATEGORIZED",
        "banner": "uncategorized-banner.png",
        "artist_info": `Some of the artists in this category are accepting commissions. You can find their commission info from the decors below.`,
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
                "asset": "bamboo.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "jelly",
                ]
            },
            {
                "name": "Kawaii Cat",
                "artist": findUser("272359106839314446"),
                "asset": "kawaiicat.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "kurama"
                ]
            },
            {
                "name": "Spheal",
                "artist": findUser("272359106839314446"),
                "asset": "spheal.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "kurama",
                    "pokemon"
                ]
            },
            {
                "name": "Daggers",
                "artist": findUser("272359106839314446"),
                "asset": "daggers.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "kurama",
                ]
            },
            {
                "name": "Shuriken",
                "artist": findUser("272359106839314446"),
                "asset": "shuriken.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "kurama"
                ]
            },
            {
                "name": "Purple Devil",
                "artist": findUser("1097272848583770212"),
                "asset": "purpledevil.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "kyu",
                    "cat"
                ]
            },
            {
                "name": "Pink Devil",
                "artist": findUser("1097272848583770212"),
                "asset": "pinkdevil.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "kyu",
                    "cat",
                    "pink"
                ]
            },
            {
                "name": "Green Devil",
                "artist": findUser("1097272848583770212"),
                "asset": "greendevil.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "kyu",
                    "cat"
                ]
            },
            {
                "name": "Neon Devil",
                "artist": findUser("1097272848583770212"),
                "asset": "neondevil.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "kyu",
                    "cat"
                ]
            },
            {
                "name": "Rimuru",
                "artist": findUser("760501309937287260"),
                "asset": "rimuru.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "x.zii",
                ]
            },
            {
                "name": "Piplup using Bubblebeam",
                "artist": findUser("1147940825330876538"),
                "asset": "piplup decor.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "jelly",
                    "pokemon"
                ]
            },
            {
                "name": "Green Radar",
                "artist": findUser("599654027764039690"),
                "asset": "green-radar.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "xavvi"
                ]
            },
            {
                "name": "Jellies",
                "artist": findUser("1143994313034960967"),
                "asset": "jellies.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "nuki",
                ]
            },
            {
                "name": "Nyan Cat",
                "artist": findUser("1143994313034960967"),
                "asset": "nyancat.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "nuki"
                ]
            },
            {
                "name": "Energy Ring",
                "artist": findUser("1031549301001814059"),
                "asset": "energyring.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "shadow"
                ]
            },
            {
                "name": "Biblically Accurate Angel",
                "artist": findUser("1143994313034960967"),
                "asset": "angel no sparkle.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "nuki",
                ]
            },
            {
                "name": "Biblically Accurate Angel with Sparkles",
                "artist": findUser("1143994313034960967"),
                "asset": "angel sparkle.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "nuki",
                ]
            },
            {
                "name": "Pink Ribbon",
                "artist": findUser("1096831760089763860"),
                "asset": "pinkribbon.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "pink",
                    "alide"
                ]
            },
            {
                "name": "Interstellar Smoke",
                "artist": findUser("334062444718587905"),
                "asset": "0 sec delay.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "seele"
                ]
            },
            {
                "name": "Gods Portal",
                "artist": findUser("334062444718587905"),
                "asset": "jellys.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "seele"
                ]
            },
            {
                "name": "Dark Fountain Smoke",
                "artist": findUser("555409394297339936"),
                "asset": "darkfountainsmoke.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "little glimbo"
                ]
            },
            {
                "name": "Ancient Writings",
                "artist": findUser("995598255612239884"),
                "asset": "ancient writings.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "prince",
                ]
            },
            {
                "name": "Barbed Wires",
                "artist": findUser("995598255612239884"),
                "asset": "barbed wires.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "prince",
                ]
            },
            {
                "name": "Demon",
                "artist": findUser("995598255612239884"),
                "asset": "demon.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "prince",
                ]
            },
            {
                "name": "Sunflowers & Sakuras",
                "artist": findUser("710255469519831050"),
                "asset": "sunflowersandsakurasanimated.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "ostensiblyrain"
                ]
            },
            {
                "name": "Lavender & Lillies",
                "artist": findUser("710255469519831050"),
                "asset": "lavenderandlilliesanimated.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "ostensiblyrain"
                ]
            },
            {
                "name": "Dandelion Daydreams",
                "artist": findUser("710255469519831050"),
                "asset": "dandeliondaydreamsanimated.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "ostensiblyrain"
                ]
            },
            {
                "name": "Realm Prison",
                "artist": findUser("334062444718587905"),
                "asset": "Realm Prison.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "seele"
                ]
            },
            {
                "name": "Dimensional Portal",
                "artist": findUser("334062444718587905"),
                "asset": "Dimensional Portal.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "seele"
                ]
            },
            {
                "name": "Gods Mirror",
                "artist": findUser("334062444718587905"),
                "asset": "Gods Mirror.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "animated",
                    "seele"
                ]
            },
            {
                "name": "Pink Flowers",
                "artist": findUser("1143994313034960967"),
                "asset": "pink flowers by nuki.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "nuki",
                ]
            },
            {
                "name": "Light Pink Flowers",
                "artist": findUser("1143994313034960967"),
                "asset": "light pink flowers by nuki.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "nuki",
                ]
            },
            {
                "name": "Dog Ears",
                "artist": findUser("1143994313034960967"),
                "asset": "dog ears by nuki.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "nuki",
                ]
            },
            {
                "name": "Dog Ears With Bow",
                "artist": findUser("1143994313034960967"),
                "asset": "dog ears with bow by nuki.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "nuki",
                ]
            },
            {
                "name": "Touch Grass",
                "artist": findUser("1147940825330876538"),
                "asset": "touch grass.png",
                "summary": "This decoration is uncategorized because it is a standalone decoration with no other category it could be placed in.",
                "tags": [
                    "jelly",
                ]
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
            <img src="${urls.CDN}/assets/jellyhome.png", alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
            <div class="text-block center">
                <h2>Welcome to Jelly's Space!</h2>
                <p>Here, you can find a huge catalog of custom-made Avatar Decorations to use with the Decor plugin for Vencord!</p>
                <p>^o^</p>
            </div>
            <div class="homenav-grid"></div>
            <div class="text-block center">
                <p>Thank you callievd, jack, marsh, amia, DTACat & Zin!</p>
            </div>
            <div class="text-block center">
                <img src="${urls.CDN}/assets/discordlogo.png", alt="Discord Logo" style="height: 50px; margin-bottom: 0px;" oncontextmenu="return false;" loading="lazy">
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
                <img src="${urls.CDN}/assets/jellydecors.png", alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
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
            <img src="${urls.CDN}/assets/jellyguide.png", alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
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
                <img src="${urls.CDN}/assets/1.png", loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 2: Now go back to Discord Settings ⚙️ and go to the Profiles page.</p>
                <p>Click on "Change Decoration" under Decor.</p>
                <img src="${urls.CDN}/assets/2.png", loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 3: Authorize Decor when prompted.</p>
                <img src="${urls.CDN}/assets/3.gif" loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 4: Find any decor from our site! Just mouse over & click.</p>
                <img src="${urls.CDN}/assets/new4.png", loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 5: If you like it, hit the download button.</p>
                <img src="${urls.CDN}/assets/new5.png", loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 6: Go back to your Profile Settings ⚙️ and click "Change Decoration".</p>
                <p>You'll wanna click the Create button!</p>
                <img src="${urls.CDN}/assets/6.png", loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 7: Click the "Browse" button and choose the decor you downloaded.</p>
                <img src="${urls.CDN}/assets/7.png", loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 8: Give your decor a name and click "Submit for Review".</p>
                <img src="${urls.CDN}/assets/8.png", loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 9: Once submitted, it will appear under "Pending Review".</p>
                <img src="${urls.CDN}/assets/9.png", loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 10: Join the <a href="https://discord.gg/dXp2SdxDcP">Decor Server</a> and do the following:</p>
                <img src="${urls.CDN}/assets/10.png", loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 11: Enable Direct Messages so our Decorator bot</p>
                <p>can tell you when your decor is approved!</p>
                <img src="${urls.CDN}/assets/11.png", loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 12: This is what the DM will look like.</p>
                <img src="${urls.CDN}/assets/12.png", loading="lazy">
            </div>

            <div class="text-block center guide-step">
                <p>Step 13: Your decoration will now be active and visible in your list!</p>
                <img src="${urls.CDN}/assets/13.png", loading="lazy">
            </div>
        `
    },
    {
        url: "artists",
        name: "Artists",
        hidden: false,
        content: `
            <img src="${urls.CDN}/assets/jellyartists.png", alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
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
            <img src="${urls.CDN}/assets/jellyfaq.png", alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
            <div class="text-block center">
                <p>Here, you'll find the frequently asked questions</p>
                <p>^-^</p>
            </div>
            <div class="text-block">
                <p><u><b>How do I upload my decors to your site?</b></u></p>
                <p>To submit your decors, you will need to contact me on Discord. You can join the <a href="https://discord.gg/dXp2SdxDcP">Decor Server</a> and then ping me in the #decoration-discussion channel.</p>
                <p>Please follow these guidelines as well as <a href="https://i.ibb.co/6cRgtS7G/WHo9g5S.png",>Decor's Guidelines</a>:</p>
                <p><b>1.</b> Must be <b>YOUR OWN</b> work. Stolen/unoriginal decorations will be denied.</p>
                <p><b>2.</b> Must have a particular theme/category, rather than several unrelated decors.</p>
                <p><b>3.</b> Must submit a minimum of 6 decors per submission. I'd rather not create a new category and banner just for 1 or 2 decorations. (Negotiations can be made)</p>
                <p><b>4.</b> AI Generated decorations are NOT accepted at this point in time.</p>
                <p><b>5.</b> Must use the <a href="https://i.ibb.co/mCB0mBYL/newtemplate.png",>template</a> to ensure correct sizing. Please try to avoid the red and blue areas.</p>
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
                <p><b>amia:</b> You are one of the most kindest people I've ever met, and I will cherish your generous act <3</p>
                <hr class="inv">
                <p><u><b>Legal:</b></u></p>
                <p>The Discord Logo and all Discord related assets belong to Hammer &amp; Chisel/Discord Inc.</p>
                <p>Vencord is a third-party client modification that <b><u>violates Discord's Terms of Service</u></b>. You understand and accept that risk by using this website.</p>
                <p>This website is non-commercial and contains no ads or paid content of any kind. All decorations are provided by the artists free of charge for personal use only.</p>
                <hr class="inv">
                <p><u><b>Commission Rules:</b></u></p>
                <p>Any artist who is listed as 'accepting commissions' have their own set of rules that apply to them. By contacting said artist for a commission, you accept that they may charge a fee for your request, or outright deny your request at their own discretion.</p>
                <hr class="inv">
                <p><u><b>Extra Credits:</b></u></p>
                <p><b>DTACat:</b> Rewrite of the site to include prettier designs & faster image loading.</p>
                <p><b>Zin:</b> The Navigation (jellyfish) images for each page, and for not giving up on me with this project. Jelly's Space wouldn't be what it is now without you.</p>
                <hr class="inv">
            </div>
        `
    },
    {
        url: "donate",
        name: "Donate",
        hidden: false,
        content: `
            <img src="${urls.CDN}/assets/jellythx.png", alt="Jelly" style="height: 200px;" oncontextmenu="return false;" loading="lazy">
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
                <p>Since June 21, I have been suffering from a medical condition that has limited my mobility; with numerous hospital visits, tons of medications, an x-ray and MRI scan, as well as paying for a private podiatrist for physical examination. I am still recovering from this situation, but it IS showing signs of improvement at long last. During the time between June and October, I have spent countless hours making improvements to this website to offer stability & performance upgrades among cleaner design and overall better experience in general.</p>
                <hr class="inv">
                <p>As I provide a free service via my Jelly's Space Decor website as well as providing a place for artists to build a public portfolio, I would be extremely appreciative of any and all donations❤️ But rest assured that donating is entirely OPTIONAL.</p>
                <hr class="inv">
                <p>Please note that I am <b><u>NOT</u></b> paywalling the site, adding paid features or implementing ads. Donating is entirely optional. The site will remain free and open source as it always has been!</p>
                <hr class="inv">
                <p><u><b>Donation Links</b></u></p>
                <p><b>Buy Me A Coffee:</b> <a href="https://buymeacoffee.com/jellythecutie">Click Here</a></p>
                <p><b>Donate via GitHub:</b> <a href="https://github.com/sponsors/jellys-space">Click Here</a></p>
                <hr class="inv">
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
        'styles/4jelly.png',
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
                        <img class="avatar" src="${urls.CDN}/assets/default-avatar.png", oncontextmenu="return false;" loading="lazy">
                        <img class="deco" src="${marketing[Math.floor(Math.random() * marketing.length)]}" oncontextmenu="return false;" loading="lazy">
                    </div>
                    <h1>Decors</h1>
                </div>
                <div class="var2" onclick="setPage('guide')">
                    <div>
                        <img src="${urls.CDN}/assets/jellythonk.png" oncontextmenu="return false;" loading="lazy">
                    </div>
                    <h1>How-To</h1>
                </div>
                <div class="var3" onclick="setPage('rehash')">
                    <div>
                        <img src="${urls.CDN}/assets/rehashicon.png", oncontextmenu="return false;" loading="lazy">
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
                            <img src="${urls.CDN}/artists/${artist.assets.banner.asset}-banner.png", oncontextmenu="return false;" loading="lazy">
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
        const artistMatch = (cat.artists?.length === 1)
        ? cat.artists[0].name.toLowerCase().includes(term)
        : false;

        // Filter decorations by name OR tags
        const filteredProducts = cat.decorations?.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(term);
            const tagMatch = Array.isArray(p.tags) && p.tags.some(tag => tag.toLowerCase().includes(term));
            return nameMatch || tagMatch;
        }) || [];

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
                <img style="padding: 30px;" src="${urls.CDN}/assets/jellydecor404.png",>
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
            <img class="avatar" src="${urls.CDN}/assets/default-avatar.png", oncontextmenu="return false;" loading="lazy">
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
                <img src="${urls.CDN}/artists/${user.assets.avatar.asset}-avatar.png", alt="${user.name}" style="height: 120px;" oncontextmenu="return false;" loading="lazy">
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
                    <p id="item-credits">By ${deco.artist.name}</p>
                </div>
                <div class="decoration-container">
                    <img class="avatar" src="${urls.CDN}/assets/default-avatar.png", oncontextmenu="return false;" loading="lazy">
                    <img class="deco" src="${urls.CDN}/decors/${deco.asset}" oncontextmenu="return false;" loading="lazy">
                </div>
                <div class="modal-bottom">
                    <button class="download-button" style="width: 100%;">Download</button>
                    <p>Make sure you have read the <a id="guide-page-link">Guide Page</a>. So you know how to apply this Decoration!</p>
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
            if (deco.summary) desc = processSummary(deco.summary);

            modalContent.innerHTML = `
                <div class="modal-left">
                    <img class="pdp-bg" src="${urls.CDN}/banners/${deco.banner}">
                    <div class="decoration-container">
                        <img class="avatar" src="${urls.CDN}/assets/default-avatar.png", oncontextmenu="return false;" loading="lazy">
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
