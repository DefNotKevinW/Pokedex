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
const generationToID = {
    "gen1": [0, 150],
    "gen2": [151, 250],
    "gen3": [251, 385],
    "gen4": [386, 492],
    "gen5": [493, 648],
    "gen6": [649, 721],
    "gen7": [721, 808],
    "gen8": [809, 897]
};

const promises = [];
let pokemonData;

document.getElementById("loading ring").classList.add("lds-ring");

for (let i = 1; i < 899; i++) {
    promises.push(fetch("https://pokeapi.co/api/v2/pokemon/"+ String(i) +"/"));
}

Promise.all(promises)
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
                height: String(0.1 * pokemon.height) + " m",
                weight: String(0.1 * pokemon.weight) + " kg"
            };
        })
        document.getElementById("loading ring").classList.remove("lds-ring");

        addCards(pokemonData, "gen1");

        document.getElementById("searchBar").addEventListener("keyup", (e) => {
            const pokeCardList = document.getElementsByClassName("pokemonCard"),
                input = e.target.value.toLowerCase();
            if (input === "") {
                for (let i = 0; i < pokeCardList.length; i++) {
                    pokeCardList[i].style.display = "grid";
                }
            }
            else {
                if (false /*toggleSearchType()*/) { // this feature isn't completed yet
                    searchForCardType(pokeCardList, input);
                }
                else {
                    searchForCardName(pokeCardList, input);
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
    })
    .catch(err => {
        console.log(err);
    });

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

function createPokemonCard(pokemon) {
    /* create the elements for each pokemon and inject them into the dom */
    let card = document.createElement("div"),
        textContainer = document.createElement("div"),
        cardSprite = document.createElement("img"),
        cardName = document.createElement("h3"),
        cardTypeList = document.createElement("ul"),
        transpCover = document.createElement("div"),
        contentWrapper = document.createElement("div");

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
    pokemon.type.forEach(t => {
        let li = document.createElement("li");
        li.setAttribute("class", "bg-color-" + t);
        li.appendChild(document.createTextNode(t));
        cardTypeList.appendChild(li);
    });

    // create the content wrapper
    contentWrapper.setAttribute("class", "contentWrapper");

    // create the transparent div cover
    transpCover.setAttribute("class", "transpCardCover");

    // add each of the elements to the card
    contentWrapper.appendChild(cardSprite);
    textContainer.appendChild(cardName);
    textContainer.appendChild(cardTypeList);
    contentWrapper.appendChild(textContainer);
    card.appendChild(contentWrapper);
    card.appendChild(transpCover);

    // add the card to the DOM
    document.getElementById("pokemonGrid").appendChild(card);
}

function addCards(pokemonList, gen) {
    /* create a card for each pokemon */
    for (let i = generationToID[gen][0]; i <= generationToID[gen][1]; i++) {
        createPokemonCard(pokemonList[i]);
    }
}

function removeCards(gen) {
    console.log(gen);
    for (let i = generationToID[gen][0]; i <= generationToID[gen][1]; i++) {
        console.log(document.getElementById(String(i+1)));
        document.getElementById(String(i + 1)).remove();
    }
}

function togglePokemonFromGen(gen) {
    switch (gen) {
        case 'gen1':
            if (document.getElementById("gen1Tog").checked) {
                addCards(pokemonData, gen);
            }
            else {
                removeCards(gen);
            }
            break;
        case 'gen2':
            if (document.getElementById("gen2Tog").checked) {
                addCards(pokemonData, gen);
            }
            else {
                removeCards(gen);
            }
            break;
        case 'gen3':
            if (document.getElementById("gen3Tog").checked) {
                addCards(pokemonData, gen);
            }
            else {
                removeCards(gen);
            }
            break;
        case 'gen4':
            if (document.getElementById("gen4Tog").checked) {
                addCards(pokemonData, gen);
            }
            else {
                removeCards(gen);
            }
            break;
        case 'gen5':
            if (document.getElementById("gen5Tog").checked) {
                addCards(pokemonData, gen);
            }
            else {
                removeCards(gen);
            }
            break;
        case 'gen6':
            if (document.getElementById("gen6Tog").checked) {
                addCards(pokemonData, gen);
            }
            else {
                removeCards(gen);
            }
            break;
        case 'gen7':
            if (document.getElementById("gen7Tog").checked) {
                addCards(pokemonData, gen);
            }
            else {
                removeCards(gen);
            }
            break;
        case 'gen8':
            if (document.getElementById("gen8Tog").checked) {
                addCards(pokemonData, gen);
            }
            else {
                removeCards(gen);
            }
            break;
    }
}

function capitalizeString(string) {
    /* capitalize a string */
    return string[0].toUpperCase() + string.slice(1, string.length);
}

function searchForCardName(cardList, input) {
    /* search for pokemon by name */
    for (let i = 0; i < cardList.length; i++) {
        let cardName = cardList[i].children[0].children[1].children[0].innerHTML;
        

        if (cardName.toLowerCase().includes(input)) {
            cardList[i].style.display = "grid";
        }
        else {
            cardList[i].style.display = "none";
        }
    }
}

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

    // set the link of the big picture to the new link
    overlaySprite.src = pokemon.offArt;
    document.getElementById("overlayID").style.display = "block";

    document.getElementById("overlayName").innerHTML = pokemon.name + " #" + String(pokemon.id);

}

function closeFocusedPicture() {
    document.getElementById("overlayID").style.display = "none";
}