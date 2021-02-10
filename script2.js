/*
how to fix current loading:
after searching up a string (eg. bul) and deleting a character,
the last few pokemon that shoudnt be on the screen are stil on teh screen
to fiux this issue, we need to completely reset the display list
*/
const typeRelations = {
    typeOrder: {
        0: "normal",
		1: "fire",
		2: "water",
		3: "electric",
		4: "grass",
		5: "ice",
		6: "fighting",
		7: "poison",
		8: "ground",
		9: "flying",
		10:"psychic",
		11: "bug",
		12: "rock",
		13: "ghost",
		14: "dragon",
		15: "dark",
        16: "steel",
        17: "fairy"
    },
    typeChart: {
        "normal": [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
		"fire": [1, 0.5, 2, 1, 0.5, 0.5, 1, 1, 2, 1, 1, 0.5, 2, 1, 1, 1, 0.5, 0.5],
		"water": [1, 0.5, 0.5, 2, 2, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5],
		"electric": [1, 1, 1, 0.5, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 1, 1, 1, 0.5, 1],
		"grass": [1, 2, 0.5, 0.5, 0.5, 2, 1, 2, 0.5, 2, 1, 2, 1, 1, 1, 1, 1, 1],
		"ice": [1, 2, 1, 1, 1, 0.5, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1],
		"fighting": [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 0.5, 0.5, 1, 1, 0.5, 1, 2],
		"poison": [1, 1, 1, 1, 0.5, 1, 0.5, 0.5, 2, 1, 2, 0.5, 1, 1, 1, 1, 1, 0.5],
		"ground": [1, 1, 2, 0, 2, 2, 1, 0.5, 1, 1, 1, 1, 0.5, 1, 1, 1, 1, 1],
		"flying": [1, 1, 1, 2, 0.5, 2, 0.5, 1, 0, 1, 1, 0.5, 2, 1, 1, 1, 1, 1],
		"psychic": [1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 0.5, 2, 1, 2, 1, 2, 1, 1],
		"bug": [1, 2, 1, 1, 0.5, 1, 0.5, 1, 0.5, 2, 1, 1, 2, 1, 1, 1, 1, 1],
		"rock": [0.5, 0.5, 2, 1, 2, 1, 2, 0.5, 2, 0.5, 1, 1, 1, 1, 1, 1, 2, 1],
		"ghost": [0, 1, 1, 1, 1, 1, 0, 0.5, 1, 1, 1, 0.5, 1, 2, 1, 2, 1, 1],
		"dragon": [1, 0.5, 0.5, 0.5, 0.5, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2],
		"dark": [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 2, 1, 0.5, 1, 0.5, 1, 2],
        "steel": [0.5, 2, 1, 1, 0.5, 0.5, 2, 0, 2, 0.5, 0.5, 0.5, 0.5, 1, 0.5, 1, 0.5, 0.5],
        "fairy": [1, 1, 1, 1, 1, 1, 0.5, 2, 1, 1, 1, 0.5, 1, 1, 0, 0.5, 2, 1]
    }
}

let pokemonIdList = {
    "queue": [],    // whatever will appear on the DOM is in queue
    "displayed": [] // whatever is on the DOM is in displayed
};

let promises = {
    1: [],
    2: []
};

let pokemonData;

document.getElementById("loadingRing1").classList.add("lds-ring");

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
                name: pokemon.species.name,
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
                    document.getElementById("pokemonGrid").innerHTML = "";
                    pokemonIdList["displayed"] = [];
                    filterQueue(input);
                    filterDisplayed(input);
                }
            }
        });

        document.addEventListener("click", (e) => {
            e = e || window.event;
            let target = e.target;
            let isFocused = document.getElementById("overlayID").style.display === "block";

            if (!isFocused && target.classList.contains("transpCardCover")) {
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

/* DATA LOADING RELATED FUNCTIONS */

function loadRestOfData() {
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
                    name: pokemon.species.name,
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

            document.getElementById("loadingRing1").classList.remove("lds-ring");

            filterQueue(document.getElementById("searchBar").value.toLowerCase());
            filterDisplayed(document.getElementById("searchBar").value.toLowerCase());
        })
        .catch(err => {
            console.log(err);
        });
}

function fetchSpeciesInfo(pokemon) {
    fetch("https://pokeapi.co/api/v2/pokemon-species/" + pokemon.id + "/")
        .then(response => {
            return response.json();
        })
        .then(species => {
            fetch(species.evolution_chain.url)
                .then(response => {
                    return response.json();
                })
                .then(evolChain => {
                    createEvolutionTree(evolChain.chain, document.getElementById("evolChain"));
                    document.getElementById("loadingRing2").classList.remove("lds-ring");
                })
                .catch(err => {
                    console.log(err);
                });
            
            if (species.varieties.length > 1) {
                getVarieties(species);
            }
            else {
                document.getElementById("altForms").appendChild(
                    document.createTextNode("This Pokemon has no alternate forms."));
            }
            document.getElementById("loadingRing3").classList.remove("lds-ring");
        })
        .catch(err => {
            console.log(err);
        });
}

function createEvolutionTree(chain, parent) {
    /* recursively creates the evolution chain */
    if (chain.evolves_to.length === 0) {
        createEvolLeaf(chain, parent);
    }
    else {
        let newParent = createEvolPokemon(chain, parent);
        for (let i = 0; i < chain.evolves_to.length; i++) {
            createEvolutionTree(chain.evolves_to[i], newParent);
        }
    }
}

function createEvolPokemon(chain, parent) {

    let childContainer = document.createElement("ul");

    childContainer.setAttribute("class", "tree");
    
    createEvolLeaf(chain, parent).appendChild(childContainer);

    return childContainer;
}

function createEvolLeaf(chain, parent) {
    const splitted = chain.species.url.split("/"),
        id = parseInt(splitted[splitted.length - 2]);
    let li = document.createElement("li"),
        wrapper = document.createElement("div"),
        img = document.createElement("img"),
        name = document.createElement("p");

    wrapper.setAttribute("class", "evolWrapper");

    img.src = pokemonData[id - 1].sprite;

    name.appendChild(document.createTextNode(capitalizeString(chain.species.name)));

    wrapper.appendChild(img);
    wrapper.appendChild(name);
    li.appendChild(wrapper);

    parent.appendChild(li);

    return li
}

function getVarieties(species) {
    let proms = [];
    for (let i = 0; i < species.varieties.length; i++) {
        proms.push(fetch(species.varieties[i].pokemon.url));
    }

    Promise.all(proms)
        .then(responses => {
            return Promise.all(responses.map(response => {
                return response.json();
            }))
        })
        .then(results => {
            let forms = results.map(pokemon => {
                return {
                    name: pokemon.name,
                    type: getType(pokemon),
                    sprite: pokemon.sprites.front_default,
                    offArt: pokemon.sprites.other["official-artwork"].front_default,
                    stats: getStats(pokemon),
                    abilities: getAbilities(pokemon),
                    height: (0.1 * pokemon.height).toFixed(2) + " m",
                    weight: (0.1 * pokemon.weight).toFixed(2) + " kg"
                };
            });
            forms.slice(1, forms.length).forEach(pokemon => {
                createAltForm(pokemon);
            });
        })
        .catch(err => {
            console.log(err);
        });
}

function createAltForm(pokemon) {
    let wrapper = document.createElement("div"),
        img = document.createElement("img"),
        name = document.createElement("p");
    wrapper.setAttribute("class", "altFormCard")
    
    if (pokemon.sprite === null) {
        if (pokemon.offArt === null) {

        }
        else {
            img.src = pokemon.offArt;
            img.width = "96";
            img.height = "96";
        }
    }
    else {
        img.src = pokemon.sprite;
    }
    
    name.appendChild(document.createTextNode(capitalizeString(pokemon.name)));

    wrapper.appendChild(img);
    wrapper.appendChild(name);
    document.getElementById("altForms").appendChild(wrapper);
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

/* QUEUE AND DISPLAY RELATED FUNCTIONS */

function filterQueue(input) {
    const searchType = document.getElementById("searchSelect").value;

    // here we dequeue any pokemon that no longer satisfy the searched properties
    for (let i = pokemonIdList["queue"].length - 1; i >= 0; i--) {
        // if pokemon name does not contain input, remove it from the queue
        if (checkFilterCondition(pokemonData[pokemonIdList["queue"][i] - 1], searchType, input)) {
            dequeuePokemon(i);
        }
    }

    // here we queue up any pokemon that now satisfy the properties
    // note that pokemon that are displayed should not be queued up
    for (let i = 0; i < pokemonData.length; i++) {
        const pokemon = pokemonData[i]
        if (!pokemonIdList["displayed"].includes(pokemon.id) && !checkFilterCondition(pokemon, searchType, input)) {
            queuePokemon(pokemon.id);
        }
    }

    sortPokemonData("queue");
}

function queuePokemon(id) {
    if (!pokemonIdList["queue"].includes(id)) {
        pokemonIdList["queue"].push(id);
    }
}

function dequeuePokemon(index = 0) {
    pokemonIdList["queue"].splice(index, 1);
}

function filterDisplayed(input) {
    const searchType = document.getElementById("searchSelect").value;

    // here we undisplay any pokemon that no longer satisfy the searched properties
    for (let i = pokemonIdList["displayed"].length - 1; i >= 0; i--) {
        // if pokemon name does not contain input, remove it from the display
        if (checkFilterCondition(pokemonData[pokemonIdList["displayed"][i] - 1], searchType, input)) {
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

function checkFilterCondition(pokemon, searchType, input) {
    /* returns an array of two bools, the first bool being whether or not  */
    if (input === "") {
        return false;
    }
    else if (searchType === "name") {
        return !pokemon.name.toLowerCase().includes(input);
    }
    else if (searchType === "id") {
        return !(pokemon.id === parseInt(input));
    }
    else {
        let hasType = false;
        pokemon.type.forEach(t => {
            if (t.includes(input)) {
                hasType = true;
            }
        })

        return !hasType;
    }
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

function resetAllPokemon(input="") {
    resetCards();

    pokemonIdList["queue"] = [];
    pokemonIdList["displayed"] = [];

    filterQueue(input);

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
    sortPokemonData("displayed");

    // add all cards to dom
    pokemonIdList["displayed"].forEach(id => {
        createPokemonCard(id);
    });
}

function sortPokemonData(ListName) {
    /* we can sort by name, id, height, weight, stat (hp, atk, sp. atk, spd, def, sp. def) */
    const sortBy = document.getElementById("sortBy").value,
        sortOrder = document.getElementById("sortOrder").value,
        stat = ["hp", "attack", "special-atk", "speed", "defense", "special-defense"];

    if (sortBy === "id") {
        if (sortOrder === "ascend") {
            pokemonIdList[ListName].sort((a, b) => {return parseInt(pokemonData[a - 1].id) - parseInt(pokemonData[b - 1].id)});
        }
        else {
            pokemonIdList[ListName].sort((a, b) => {return parseInt(pokemonData[b - 1].id) - parseInt(pokemonData[a - 1].id)});
        }
    }
    else if (sortBy === "name") {
        if (sortOrder === "ascend") {
            pokemonIdList[ListName].sort((a, b) => {return pokemonData[a - 1].name.localeCompare(pokemonData[b - 1].name)});
        }
        else {
            pokemonIdList[ListName].sort((a, b) => {return pokemonData[b - 1].name.localeCompare(pokemonData[a - 1].name)});
        }
    }
    else if (stat.includes(sortBy)) {
        if (sortOrder === "ascend") {
            pokemonIdList[ListName].sort((a, b) => {return parseInt(pokemonData[a - 1].stats[sortBy]) - parseInt(pokemonData[b - 1].stats[sortBy])});
        }
        else {
            pokemonIdList[ListName].sort((a, b) => {return parseInt(pokemonData[b - 1].stats[sortBy]) - parseInt(pokemonData[a - 1].stats[sortBy])});
        }
    }
    else {
        if (sortOrder === "ascend") {
            pokemonIdList[ListName].sort((a, b) => {return parseFloat(pokemonData[a - 1][sortBy]) - parseFloat(pokemonData[b - 1][sortBy])});
        }
        else {
            pokemonIdList[ListName].sort((a, b) => {return parseFloat(pokemonData[b - 1][sortBy]) - parseFloat(pokemonData[a - 1][sortBy])});
        }
    }
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
    contentWrapper.setAttribute("class", "vertiFlex");
    contentWrapper.className += " contentWrapper";

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
        li.appendChild(document.createTextNode(capitalizeString(t)));
        typeList.appendChild(li);
    });
}

function setFocusedPicture(pokemon) {
    document.getElementById("loadingRing2").classList.add("lds-ring");
    document.getElementById("loadingRing3").classList.add("lds-ring");
    // set the sprite link
    document.getElementById("overlaySprite").src = pokemon.offArt;

    // create the evolution chain
    fetchSpeciesInfo(pokemon);

    // set the overlay title
    document.getElementById("overlayName").innerHTML = capitalizeString(pokemon.name) + " " + formatPokemonId(pokemon.id);

    // set the details of the pokemon (ie. height, weight, abilities)
    document.getElementById("height").children[1].innerHTML = pokemon.height;
    document.getElementById("weight").children[1].innerHTML = pokemon.weight;

    // create ability list
    createAbilityList(pokemon);

    // create the type list
    createTypeLi(document.getElementById("overlayTypeList"), pokemon);

    // create the stat list
    createStatList(pokemon);

    // create the weaknesses list
    createWeaknessList(pokemon);

    // add the bulbapedia link
    document.getElementById("bulbapediaLink").href = createBulbLink(pokemon);

    document.getElementById("overlayID").style.display = "block";
}

function closeFocusedPicture() {
    document.getElementById("overlayID").style.display = "none";
    overlaySprite.src = "";
    document.getElementById("pokemonStats").innerHTML = "";
    document.getElementById("overlayTypeList").innerHTML = "";
    document.getElementById("overlayTypeDisadv").innerHTML = "";
    document.getElementById("abilities").children[1].innerHTML = "";
    document.getElementById("evolChain").innerHTML = "";
    document.getElementById("altForms").innerHTML = "";
    document.getElementById("bulbapediaLink").href = "";
}

function createAbilityList(pokemon) {
    let abilityList = document.getElementById("abilities").children[1];
    Object.keys(pokemon.abilities).forEach(ability => {
        let li = document.createElement("li");
        let span = document.createElement("span");
        if (!pokemon.abilities[ability]) {
            span.appendChild(document.createTextNode(capitalizeString(ability.replace("-", " "))));
            span.setAttribute("class", "attributeValue");
            li.appendChild(span);
        }
        else {
            span.appendChild(document.createTextNode("(" + capitalizeString(ability.replace("-", " ")) + ")"));
            span.setAttribute("class", "attributeValue");
            li.appendChild(span);
        }
        abilityList.appendChild(li);
    });
}

function createStatList(pokemon) {
    table = document.getElementById("pokemonStats");
    Object.keys(pokemon.stats).forEach(stat => {
        let newRow = table.insertRow(-1), 
            statName = newRow.insertCell(0), 
            moveVal = newRow.insertCell(1);
        
        statName.appendChild(document.createTextNode(capitalizeString(stat.replace("-", " "))));
        moveVal.appendChild(document.createTextNode(pokemon.stats[stat]));
    });
}

function createWeaknessList(pokemon) {
    const weaknesses = calculateTypeWeakness(pokemon);
    Object.keys(weaknesses).forEach(type => {
        let li = document.createElement("li");
        li.setAttribute("class", "bg-color-" + type);
        li.appendChild(document.createTextNode(String(weaknesses[type]) + "x " + capitalizeString(type)));
        document.getElementById("overlayTypeDisadv").appendChild(li);
    });
}

function createBulbLink(pokemon) {
    return "https://bulbapedia.bulbagarden.net/wiki/" + pokemon.name + "_(Pok%C3%A9mon)";
}

/* BASIC CONVERSION / DATA MANIPULATION FUNCTIONS */

function capitalizeString(string) {
    /* capitalize a string */
    let lst = string.split(" "),
        result = "";
    
    for (let i = 0; i < lst.length - 1; i++) {
        result = result + lst[i][0].toUpperCase() + lst[i].slice(1, lst[i].length) + " "
    }

    return result + lst[lst.length - 1][0].toUpperCase() + lst[lst.length - 1].slice(1, lst[lst.length - 1].length);
}

function formatPokemonId(id) {
    if (id > 99) {
        return "#" + String(id);
    }
    else {
        return "#" + ("0" + ("0" + id).slice(-2)).slice(-3);
    }
}

function calculateTypeWeakness(pokemon) {
    const types = pokemon.type;
    let vals = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    let weaknesses = {};
    types.forEach(type => {
        for (let i = 0; i < 18; i++) {
            vals[i] = vals[i] * typeRelations["typeChart"][type][i];
        }
    });

    for (let i = 0; i < vals.length; i++) {
        if (vals[i] > 1) {
            weaknesses[typeRelations["typeOrder"][i]] = vals[i];
        }
    }

    return weaknesses;
}