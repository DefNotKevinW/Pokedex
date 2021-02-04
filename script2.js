/*
IDEAS:
-load all required data from pokeapi at the beginning
-play a loading animation while the user waits for all the data to be loaded in
-once loading is completed, allow the user to interact with the pokedex

NEW IDEA
default page is a grid of pokemon "cards"
cards contain the following information:
- name
- type
- sprite
when you click on one of them, a pokedex appears (animated) and gives more detailed information on the pokemon
these detailed stats include:
- name
- id
- type
- sprite
- official artwork
- stats
- abilities
- height
- weight

features to add:
- pokemon forms 
- evolution chain
*/
let genToId = {
    "gen1": [1, 151, true],
    "gen2": [152, 251, false],
    "gen3": [252, 386, false],
    "gen4": [387, 493, false],
    "gen5": [494, 649, false],
    "gen6": [650, 721, false],
    "gen7": [722, 809, false],
    "gen8": [810, 898, false]
};

let pokemonIdList = {
    "queue": [],    // whatever will appear on the DOM is in queue
    "displayed": [] // whatever is on the DOM is in displayed
};

let promises = {
    1: [],
    2: []
};

let pokemonData;

document.getElementById("loading ring").classList.add("lds-ring");

for (let i = 1; i < 49; i++) {
    promises[1].push(fetch("https://pokeapi.co/api/v2/pokemon/"+ String(i) +"/"));
}

Promise.all(promises[1])
    .then(responses => {
        return Promise.all(responses.map(response => {
            return response.json();
        }))
    })
    .then(results => {
        pokemonData = results.map(pokemon => {
            return {
                name: pokemon.name,
                id: pokemon.id,
                type: getType(pokemon),
                sprite: pokemon.sprites.front_default,
                offArt: pokemon.sprites.other["official-artwork"].front_default,
                stats: getStats(pokemon),
                abilities: getAbilities(pokemon),
                height: (0.1 * pokemon.height).toFixed(2) + " m",
                weight: (0.1 * pokemon.weight).toFixed(2) + " kg"
            };
        })

        loadRestOfData();

        resetAllPokemon();

        // addCards(pokemonData, "gen1");

        document.getElementById("searchBar").addEventListener("keyup", (e) => {
            const pokeCardList = document.getElementsByClassName("pokemonCard"),
                input = e.target.value.toLowerCase();
            if (input === "") {
                resetAllPokemon();
            }
            else {
                if (false /*toggleSearchType()*/) { // this feature isn't completed yet
                    searchForCardType(pokeCardList, input);
                }
                else {
                    filterQueue(input);
                    filterDisplayed(input);
                    //filterPokemonFromGen();
                }
                
            }
        });

        document.addEventListener("click", (e) => {
            e = e || window.event;
            let target = e.target;
            let isFocused = document.getElementById("overlayID").style.display === "block";
        
            if (isFocused && !document.getElementById("bigPicWrapper").contains(target)) {
                closeFocusedPicture();
            }
            else if (!isFocused && target.classList.contains("transpCardCover")) {
                setFocusedPicture(pokemonData[parseInt(target.parentNode.id) - 1]);
            }
        }, false);

        window.onscroll = function() {
            if ((window.innerHeight + Math.ceil(window.pageYOffset)) >= document.body.offsetHeight) {
                if (pokemonIdList["queue"].length > 0) {
                    loadMorePokemon();
                }
            }
        };
    })
    .catch(err => {
        console.log(err);
    });

function loadRestOfData() {
    console.log("hello!");
    for (let i = 49; i < 899; i++) {
        promises[2].push(fetch("https://pokeapi.co/api/v2/pokemon/"+ String(i) +"/"));
    }

    Promise.all(promises[2])
        .then(responses => {
            return Promise.all(responses.map(response => {
                return response.json();
            }))
        })
        .then(results => {
            let pokemonData2 = results.map(pokemon => {
                return {
                    name: pokemon.name,
                    id: pokemon.id,
                    type: getType(pokemon),
                    sprite: pokemon.sprites.front_default,
                    offArt: pokemon.sprites.other["official-artwork"].front_default,
                    stats: getStats(pokemon),
                    abilities: getAbilities(pokemon),
                    height: (0.1 * pokemon.height).toFixed(2) + " m",
                    weight: (0.1 * pokemon.weight).toFixed(2) + " kg"
                };
            });
            pokemonData = pokemonData.concat(pokemonData2);

            document.getElementById("loading ring").classList.remove("lds-ring");

            filterQueue(document.getElementById("searchBar").value.toLowerCase());
            filterDisplayed(document.getElementById("searchBar").value.toLowerCase());
        })
        .catch(err => {
            console.log(err);
        });
}

function getType(pokemon) {
    /* get the type(s) of the pokemon */
    let typeList = [];
    for (let i = 0; i < pokemon.types.length; i++) {
        typeList.push(pokemon.types[i].type.name);
    }
    return typeList;
}

function getStats(pokemon) {
    /* get the base stats of the pokemon */
    let statObj = {};
    for (let i = 0; i < pokemon.stats.length; i++) {
        statObj[pokemon.stats[i].stat.name] = pokemon.stats[i].base_stat;
    }
    return statObj;
}

function getAbilities(pokemon) {
    /* get the ability names of the pokemon */
    let abilityObj = {};
    for (let i = 0; i < pokemon.abilities.length; i++) {
        abilityObj[pokemon.abilities[i].ability.name] = pokemon.abilities[i].is_hidden;
    }
    return abilityObj;
}

function createPokemonCard(id) {
    const pokemon = pokemonData[id - 1];

    /* create the elements for each pokemon and inject them into the dom */
    let card = document.createElement("div"),
        textContainer = document.createElement("div"),
        cardSprite = document.createElement("img"),
        cardName = document.createElement("h3"),
        cardTypeList = document.createElement("ul"),
        transpCover = document.createElement("div"),
        contentWrapper = document.createElement("div"),
        pokemonID = document.createElement("p");

    // create the card div element
    card.setAttribute("id", String(pokemon.id));
    card.setAttribute("class", "pokemonCard");

    // create the sprite image element
    cardSprite.setAttribute("class", "cardSprite");
    cardSprite.setAttribute("loading", "lazy");
    cardSprite.src = pokemon.sprite;
    
    // create text container div element
    textContainer.setAttribute("class", "textContainer");

    // create the card name element
    cardName.setAttribute("class", "cardName");
    cardName.appendChild(document.createTextNode(capitalizeString(pokemon.name)));

    // create the card type elements and add them to the type list
    cardTypeList.setAttribute("class", "cardTypeList");
    createTypeLi(cardTypeList, pokemon);

    // create the id p element
    pokemonID.appendChild(document.createTextNode(formatPokemonId(pokemon.id)));

    // create the content wrapper
    contentWrapper.setAttribute("class", "contentWrapper");

    // create the transparent div cover
    transpCover.setAttribute("class", "transpCardCover");

    // add each of the elements to the card
    contentWrapper.appendChild(cardSprite);
    textContainer.appendChild(cardName);
    textContainer.appendChild(cardTypeList);
    textContainer.appendChild(pokemonID);
    contentWrapper.appendChild(textContainer);
    card.appendChild(contentWrapper);
    card.appendChild(transpCover);

    // add the card to the DOM
    document.getElementById("pokemonGrid").appendChild(card);
}

function createTypeLi (typeList, pokemon) {
    pokemon.type.forEach(t => {
        let li = document.createElement("li");
        li.setAttribute("class", "bg-color-" + t);
        li.appendChild(document.createTextNode(t));
        typeList.appendChild(li);
    });
}

function formatPokemonId(id) {
    if (id > 99) {
        return "#" + String(id);
    }
    else {
        return "#" + ("0" + ("0" + id).slice(-2)).slice(-3);
    }
}

function filterQueue(input) {
    // here we dequeue any pokemon that no longer satisfy the searched properties
    for (let i = pokemonIdList["queue"].length - 1; i >= 0; i--) {
        // if pokemon name does not contain input, remove it from the queue
        if (!pokemonData[pokemonIdList["queue"][i] - 1].name.toLowerCase().includes(input)) {
            dequeuePokemon(i);
        }
    }

    // here we queue up any pokemon that now satisfy the properties
    // note that pokemon that are displayed should not be queued up
    for (let i = 0; i < pokemonData.length; i++) {
        const pokemon = pokemonData[i]
        if (!pokemonIdList["displayed"].includes(pokemon.id) && pokemon.name.toLowerCase().includes(input)) {
            queuePokemon(pokemon.id);
        }
    }
}

function queuePokemon(id) {
    if (!pokemonIdList["queue"].includes(id)) {
        pokemonIdList["queue"].push(id);
    }

    pokemonIdList["queue"].sort((a, b) => a - b);
}

function dequeuePokemon(index = 0) {
    pokemonIdList["queue"].splice(index, 1);
}

function filterDisplayed(input) {
    // here we undisplay any pokemon that no longer satisfy the searched properties
    for (let i = pokemonIdList["displayed"].length - 1; i >= 0; i--) {
        // if pokemon name does not contain input, remove it from the display
        if (!pokemonData[pokemonIdList["displayed"][i] - 1].name.toLowerCase().includes(input)) {
            removePokemon(i);
            // additionally, if the queue isn't empty, we can replace the removed pokemon with a new one.
            if (pokemonIdList["queue"].length > 0) {
                addPokemon();
            }
        }
    }

    // now we display new pokemon
    if (pokemonIdList["displayed"].length < 24) {
        while (pokemonIdList["displayed"].length < 24 && pokemonIdList["queue"].length > 0) {
            addPokemon();
        }
    }

    displayCards();
}

function removePokemon(index) {
    let displayed = pokemonIdList["displayed"];

    // remove from dom
    document.getElementById(String(displayed[index])).remove();

    // remove from displayed list
    displayed.splice(index, 1);
}

function addPokemon() {
    // add to displayed
    pokemonIdList["displayed"].push(pokemonIdList["queue"][0]);
    dequeuePokemon();
}

function resetAllPokemon() {
    resetCards();

    pokemonIdList["queue"] = [];
    pokemonIdList["displayed"] = [];

    filterQueue("");

    for (let i = 0; i < 24; i++) {
        addPokemon();
    }
    displayCards();
}

function resetCards() {
    document.getElementById("pokemonGrid").innerHTML = "";
}

function loadMorePokemon() {
    let i = 0;
    while (i < 12 && pokemonIdList["queue"].length > 0) {
        addPokemon();
        i++;
    }
    displayCards();
}

function displayCards() {
    // when we add a pokemon, we want everything to maintain its correct order (ascending by pokemon id)
    // so we will sort the displayed
    resetCards();
    pokemonIdList["displayed"].sort((a, b) => a - b);

    // add all cards to dom
    pokemonIdList["displayed"].forEach(id => {
        createPokemonCard(id);
    });
}

/*function addCards(pokemonList, gen) {
    /* create a card for each pokemon /
    for (let i = pokemonIdList[gen][0]; i <= pokemonIdList[gen][1]; i++) {
        createPokemonCard(pokemonList[i]);
    }
}

function removeCards(gen) {
    for (let i = pokemonIdList[gen][0]; i <= pokemonIdList[gen][1]; i++) {
        document.getElementById(String(i + 1)).remove();
    }
}*/

/*function togglePokemonGen(n) {
    if (genToId["gen" + n][2]) {
        genToId["gen" + n][2] = false;
    }
    else {
        genToId["gen" + n][2] = true;
    }
    //filterPokemonFromGen();
}*/


/*function filterPokemonFromGen() {
    // we want to remove everything thats not in at least one of the chosen generations
    // the idea is that we use normal filters first, then specialized filters

    // note that this function should only be removing things from queue and displayed, 
    // while only moving pokemon from queued to displayed

    // this for loop dequeues anything that isn't from selected generations
    for (let i = pokemonIdList["queue"].length - 1; i >= 0; i--) {
        let isFromGen = false, j = 0;
        
        while (j < Object.keys(genToId).length && !isFromGen) {
            const genVal = genToId["gen" + String(j + 1)];
            if (genVal[2] && pokemonIdList["queue"][i] <= genVal[1] && pokemonIdList["queue"][i] >= genVal[0]) {
                isFromGen = true;
            }
            j++;
        }
        if (!isFromGen) {
            dequeuePokemon(i);
        }
    }

    // this loop removes any displayed pokemon that aren't from selected generations
    for (let i = pokemonIdList["displayed"].length - 1; i >= 0; i--) {
        let isFromGen = false, j = 0;

        while (j < Object.keys(genToId).length && !isFromGen) {
            const genVal = genToId["gen" + String(j + 1)];
            if (genVal[2] && pokemonIdList["displayed"][i] <= genVal[1] && pokemonIdList["displayed"][i] >= genVal[0]) {
                isFromGen = true;
            }
            j++;
        }
        if (!isFromGen) {
            removePokemon(i);
            if (pokemonIdList["queue"].length > 0) {
                addPokemon();
            }
            
        }
    }
    console.log("here it is!");
    console.log(pokemonIdList["displayed"]);
    console.log(pokemonIdList["queue"]);
}*/

function capitalizeString(string) {
    /* capitalize a string */
    return string[0].toUpperCase() + string.slice(1, string.length);
}

/*function searchForCardName(cardList, input) {
    /* search for pokemon by name /
    for (let i = 0; i < cardList.length; i++) {
        let cardName = cardList[i].children[0].children[1].children[0].innerHTML;
        
        if (cardName.toLowerCase().includes(input)) {
            cardList[i].style.display = "grid";
        }
        else {
            cardList[i].style.display = "none";
        }
    }
}*/

function searchForCardType(cardList, input) {
    /* search for pokemon by type */
    for (let i = 0; i < cardList.length; i++) {
        let liLst = cardList[i].children[0].children[1].children[1].children, j = 0, typeFound = false;
        while (j < liLst.length && !typeFound) {
            if (liLst[j].innerHTML.toLowerCase().includes(input)) {
                typeFound = true;
            }
            j++;
        }
        
        if (typeFound) {
            cardList[i].style.display = "grid";
        }
        else {
            cardList[i].style.display = "none";
        }
    }
}

function toggleSearchType() {
    /* returns true if switch is toggled on and false otherwise. */
    return document.getElementById("searchToggle").checked;
}

function setFocusedPicture(pokemon) {
    const overlaySprite = document.getElementById("overlaySprite");

    // set the sprite link
    overlaySprite.src = pokemon.offArt;

    // set the overlay title
    document.getElementById("overlayName").innerHTML = pokemon.name + " " + formatPokemonId(pokemon.id);

    // set the details of the pokemon (ie. height, weight, abilities)
    document.getElementById("height").children[1].innerHTML = pokemon.height;
    document.getElementById("weight").children[1].innerHTML = pokemon.weight;

    abilityList = document.getElementById("abilities").children[1];
    Object.keys(pokemon.abilities).forEach(ability => {
        let li = document.createElement("li");
        let span = document.createElement("span");
        if (!pokemon.abilities[ability]) {
            span.appendChild(document.createTextNode(ability));
            span.setAttribute("class", "attributeValue");
            li.appendChild(span);
        }
        else {
            span.appendChild(document.createTextNode("(" + ability + ")"));
            span.setAttribute("class", "attributeValue");
            li.appendChild(span);
        }
        abilityList.appendChild(li);
    });

    // create the type list
    createTypeLi(document.getElementById("overlayTypeList"), pokemon);

    // create the stat list
    statList = document.getElementById("pokemonStats");
    Object.keys(pokemon.stats).forEach(stat => {
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(stat + ": " + String(pokemon.stats[stat])));
        statList.appendChild(li);
    });

    document.getElementById("overlayID").style.display = "block";
}

function closeFocusedPicture() {
    document.getElementById("overlayID").style.display = "none";
    overlaySprite.src = "";
    document.getElementById("pokemonStats").innerHTML = "";
    document.getElementById("overlayTypeList").innerHTML = "";
    document.getElementById("abilities").children[1].innerHTML = "";
}