/* First attempt at JS for DragonClicker
	I haven't done much JavaScript before.
	Mostly, I'm being inspired by CivClicker.
	I don't need fancy graphics and such. 
	Just an idea and a dream :)
	*/
var version = 0.1;
console.log('Started running');

//Initialized resources
var gold = {
	name:'gold',
	total:0,
	hoard:0,
	click:1,
},
strength = {
	name:'strength',
	total:0,
	arcane: 0
},
reputation = {
	name:'reputation',
	total: 0,
	influence: 0,
	base : 0
},
fodder = {
	name:'fodder',
	normal:0,
	click: 1,
	breeders:0,
	breedPrice:10,
	mortality:0.125,
	fert:0.4,
	maxBred:1,//ratio of parent/max
	bredP:0.2,
	fodToStr:0.5,
	cycle: 0
},
buildings = {
	'Lair': false,
	'Farmland': false,
	'Treasure Room': false,
	'Castle': false	
},
upgrades = {
	wings: false,
	breathWeapon: false,
	color: false,
	claws: false,
	airCombat: false
},
animalValue = {
	bunny:0.25,
	sheep:0.5,
	cow:1,
	cheat:10000
},
dragonStats = {
	age:0,
	color:'',
	size:0,
	name:'Milonti'
},
spells = {

},
workers = {
	miners: 0,
	farmers: 0,
	appraisers: 0
};
	
//Static(?) resources
var DSIZE = {
	5:'Wyrm',
	4:'Dragon',
	3:'Drake',
	2:'Dragonling',
	1:'Wyrmling',
	0:'Eggling'
},
DAGE = {
	8:'Ascended',
	7:'Forgotten',
	6:'Mythical',
	5:'Eternal',
	4:'Ancient',
	3:'Elder',
	2:'Great',
	1:'',
	0:'Young'
}

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
	alert('Your browser doesn\'t support local storage. Get a newer browser.')
    return false;
  }
}

var html5Storage = supports_html5_storage()
console.log('Supports storage: ' + html5Storage )

//Unused
function bakeCookie(){
	var c = ""
	c += 'dragonCookie=my cookie test; '
	var d = new Date();
	d.setFullYear(d.getFullYear()+1)
	c += 'expires='+d.toUTCString()+'; '
	c += 'path=/'
	var cookie = ['dragonCookie', '=', 'cookie test','; expires=.', d.toUTCString(), '; domain=.', window.location.host.toString(), '; path=/;'].join('');
	document.cookie = c
}
//Unused
function alertThingy(message){
	var d = new Date();
	d.setFullYear(d.getFullYear()+1)
	f = document.cookie;
	alert(f);
}

function addGold(amount){
	gold.total += amount;
	document.getElementById('currGold').innerHTML = gold.total;
}

function goldToHoard(amount){
	if(gold.total >= amount){
		gold.total -= amount
		gold.hoard += amount
		document.getElementById('currGold').innerHTML = gold.total
		document.getElementById('hoardGold').innerHTML = gold.hoard
	}
}

function buildBuilding(bname){
	if(buildings[bname]) return;
	switch(bname){
		case 'Lair':
			if(strength.total >=5 ){
				reputation.influence += 5;
				buildings['Lair'] = true;
				document.getElementById('currInf').innerHTML = Math.floor(reputation.influence)
			}
			else logEvent('Not strong enough to secure a lair.')
		break;
		case 'Mining Hole':
			if(strength.total >= 20){
				reputation.total += 5;
				buildings['Mining Hole'] = true;
				gold.click *= 2;
			}
			else logEvent('Not strong enough to dig out a mining hole.')
		case 'Baited Clearing':
			if(strength.total >= 10 && gold.total >=5){
				gold.total -= 5;
				buildings['Baited Clearing'] = true;
				fodder.click *= 2;
				document.getElementById('currGold').innerHTML = Math.floor(gold.total)
			}
			else if(strength.total < 10) logEvent('Not strong enough to clear area.')
			else logEvent('Cannot afford bait')
		default:
			buildings[bname] = true;
			logEvent(bname + 'has no effect. But you built it anyway.')
			break;
	}
	updateBuildingList()
	
}

function buildableList(){
	var buildList = []
	//Only include building requirements (and tech-tree exclusivity)
	//Building costs handled by buildBuilding
	if(!buildings['Lair'] ) buildList.push('Lair')
	if(!buildings['Mine Hole'] && buildings['Lair'] ) buildList.push('Mine Hole')
	if(!buildings['Baited Clearing'] && buildings['Lair']  ) buildList.push('Baited Clearing')
	if(!buildings['Copper Mine'] && buildings['Lair'] && buildings['Mine Hole']) buildList.push('Copper Mine')
	
	//Build Button List
	var bColOne = document.getElementById('buildPaneCol1')
	bColOne.innerHTML = ""
	for(key in buildList){
		var newLi = document.createElement('li')
		newLi.setAttribute('style','list-style:none;')
		var newDiv = document.createElement('div')
		newDiv.setAttribute('class','buildButton')
		newDiv.setAttribute('onclick',"buildBuilding(\'"+buildList[key]+"\')")
		newDiv.innerHTML = buildList[key]
		newLi.appendChild(newDiv)
		bColOne.appendChild(newLi)
	}
	//console.log(bColOne.innerHTML)
}

function updateBuildingList(){
	var bList = document.getElementById('buildingList')
	bList.innerHTML = ""
	for(var b in buildings){
		if(buildings[b]) bList.innerHTML += "<li>" + b + "<\/li>"
	}
}

function eatFodder(amount){
	if(amount > fodder.normal ) return;
	else{
		fodder.normal -= amount
		strength.total += amount*fodder.fodToStr
		document.getElementById('currStr').innerHTML = strength.total
		document.getElementById('currFodder').innerHTML = fodder.normal
	}
}

function gatherFodder(animal){
	var aVal = animalValue[animal]
	if(isNaN(aVal)) return
	fodder.normal += aVal
	document.getElementById('currFodder').innerHTML = fodder.normal
}

function clickFodder(){
	fodder.normal += fodder.click
	document.getElementById('currFodder').innerHTML = fodder.normal
}

function clickGold(){
	gold.total += gold.click
	document.getElementById('currGold').innerHTML = gold.total
}

function clickHoard(val){
	if(val == null) val = 1;
	if(val > gold.total) return
	gold.total -= val
	gold.hoard += val
	document.getElementById('currGold').innerHTML = gold.total
	document.getElementById('hoardGold').innerHTML = gold.hoard
}

function clickBreed(){
	fodder.breedPrice = 10 + Math.floor((fodder.breeders/10)*1.618)
	if(gold.total < fodder.breedPrice) {
		console.log('Too expensive!')
		return;
	}
	gold.total -= fodder.breedPrice
	fodder.breeders += 1
	document.getElementById('currGold').innerHTML = gold.total
	document.getElementById('breeders').innerHTML = fodder.breeders
}

function updateTitle(){
	var newSize= null,
		newAge= null;
	if(strength.total >= 10000000){
		newAge = 8
	}
	else if(strength.total >= 1000000){
		newAge = 7
	}
	else if(strength.total >= 100000){
		newAge = 6
	}
	else if(strength.total >= 50000){
		newAge = 5
	}
	else if(strength.total >= 10000){
		newAge = 4
	}
	else if(strength.total >= 5000){
		newAge = 3
	}
	else if(strength.total >= 1000){
		newAge = 2
	}
	else if(strength.total >= 100){
		newAge = 1
	}
	
	if(gold.hoard >= 1000000){
		newSize = 5
	}
	else if(gold.hoard >= 100000){
		newSize = 4
	}
	else if(gold.hoard >= 10000){
		newSize = 3
	}
	else if(gold.hoard >= 1000){
		newSize = 2
	}
	else if(gold.hoard >= 100){
		newSize = 1
	}
	
	if(newAge <= dragonStats.age && newSize <= dragonStats.size)return;
	
	if(newAge == null || newAge <= dragonStats.age) newAge = dragonStats.age
	if(newSize == null || newSize <= dragonStats.size) newSize = dragonStats.size
	
	var newTitleString = ""
	newTitleString += DAGE[newAge] + ' '
	dragonStats.age = newAge
	newTitleString += dragonStats.color
	if(dragonStats.color != '') newTitleString += ' '
	newTitleString += DSIZE[newSize] + ' '
	dragonStats.size = newSize
	document.getElementById('dragonAgeColorSize').innerHTML = newTitleString
}

function updateFodder(){
	fodder.cycle++

	//Update Breeders
	//first check for breeding
	if(fodder.breeders >=2){
		
		if(Math.random() < fodder.fert) {
			var bred = Math.floor(Math.random() * (fodder.breeders/fodder.maxBred))
			
			//I have bredP chance per cow out of bred total cows
			//Normal distribution over bred = 30, below that actually roll
			var bbred = 0;
			if(bred < 30){
				for(var i = 0; i < bred; i++){
					if(Math.random() < fodder.bredP) bbred++
				}
			}
			else bbred = Math.floor(bred * fodder.bredP)
			fodder.normal += (bred - bbred);
			fodder.breeders += bbred;
		}
	}
	//Next, check for breeder deaths
	if(fodder.cycle%3 == 0 && fodder.breeders >= 1){
		var deadBr = 0;
		if(fodder.breeders < 30){
			for(var i = 0; i < fodder.breeders; i++){
				if(Math.random() < fodder.mortality) deadBr++;
			}
		}
		else deadBr = Math.ceil(fodder.breeders * fodder.mortality)
		fodder.breeders -= deadBr
		if(fodder.breeders < 0) fodder.breeders = 0
	}
	//Last, check for normal fodder death
	if(fodder.cycle%3 == 0 && fodder.normal >= 1){
		var deadNm = 0;
		if(fodder.normal < 30){
			for(var i = 0; i < fodder.normal; i++){
				if(Math.random() < fodder.mortality) deadNm++;
			}
		}
		else deadNm = Math.ceil(fodder.normal * fodder.mortality)
		fodder.normal -= deadNm
		if(fodder.normal < 0) fodder.normal = 0
	}
	if(fodder.cycle >=3) fodder.cycle = 0
}

function updateGold(){
}

function castSpell(sName){
	if(!spells[sName]) return
	switch(sName){
		case 'Dominate Peasant':
			var newPeasant = Object.keys(workers)[Math.floor(Math.random() * Object.keys(workers).length)]
			var amount = 1 + Math.floor(Math.random()*(strength.arcane/100))
			workers[newPeasant] += amount
			break;
	}
}

function logEvent(event){
	var list = document.getElementById('eventList')
	var newLi = document.createElement('li')
	var date = new Date(Date.now())
	newLi.innerHTML = "<b>" + date.toLocaleTimeString() + ":<\/b> " + event
	if(list.children.length > 0) list.insertBefore(newLi, list.children[0])
	else list.appendChild(newLi)
	if(list.children.length > 20) list.removeChild(list.children[list.children.length-1])
}

function changeName(){
	if(dragonStats.age <=1 && dragonStats.size <=1) dragonStats.name = prompt('Choose a new name for yourself.\nEventually your name will be permanent.')
	else logEvent('Your name has settled; it can no longer be changed.')
	document.getElementById('dragonName').innerHTML = dragonStats.name
}

function saveGame(){
	var game = {
		gold:gold,
		strength:strength,
		fodder:fodder,
		buildings:buildings,
		upgrades:upgrades,
		animalValue:animalValue,
		dragonStats:dragonStats,
		reputation:reputation,
		spells:spells,
		workers:workers
		}
	localStorage.setItem('dragonClicker', JSON.stringify(game))
	var d = new Date()
	logEvent('Game Saved')
	//console.log('Game Saved at: ' + d.getHours() + ':' + ((d.getMinutes()<10) ? '0'+d.getMinutes() : d.getMinutes()))	
}

function loadGame(){
	var string1 = localStorage.getItem('dragonClicker')
	if(string1 ) {
		gameLoad = JSON.parse(string1)	
	}
	if(gameLoad.gold != null) gold = gameLoad.gold;
	if(gameLoad.strength != null) strength = gameLoad.strength;
	if(gameLoad.fodder != null) fodder = gameLoad.fodder;
	if(gameLoad.buildings != null) buildings = gameLoad.buildings;
	if(gameLoad.upgrades != null) upgrades = gameLoad.upgrades;
	if(gameLoad.animalValue != null) animalValue = gameLoad.animalValue;
	if(gameLoad.dragonStats != null) dragonStats = gameLoad.dragonStats;
	if(gameLoad.reputation != null) reputation = gameLoad.reputation;
	if(gameLoad.spells != null) spells = gameLoad.spells;
	if(gameLoad.workers != null) workers = gameLoad.workers;
	
	updateGUI()
	logEvent('Game Loaded')
}

function updateGUI(){
	document.getElementById('currFodder').innerHTML = fodder.normal
	document.getElementById('currStr').innerHTML = strength.total
	document.getElementById('currGold').innerHTML = gold.total
	document.getElementById('breeders').innerHTML = fodder.breeders
	document.getElementById('currInf').innerHTML = reputation.influence
	document.getElementById('hoardGold').innerHTML = gold.hoard
	updateTitle();
	updateBuildingList();
}

function selectPane(pane){
	if(pane == 'buildings'){
		document.getElementById('selectBuild').className = 'tabMenu tabSelected'
		document.getElementById('selectUpgra').className = 'tabMenu'
		document.getElementById('selectPhysi').className = 'tabMenu'
		document.getElementById('selectArcan').className = 'tabMenu'
		document.getElementById('selectEmpir').className = 'tabMenu'
		
	}
	else if(pane == 'upgrades'){
		document.getElementById('selectBuild').className = 'tabMenu'
		document.getElementById('selectUpgra').className = 'tabMenu tabSelected'
		document.getElementById('selectPhysi').className = 'tabMenu'
		document.getElementById('selectArcan').className = 'tabMenu'
		document.getElementById('selectEmpir').className = 'tabMenu'
		
	}
	else if(pane == 'physical'){
		document.getElementById('selectBuild').className = 'tabMenu'
		document.getElementById('selectUpgra').className = 'tabMenu'
		document.getElementById('selectPhysi').className = 'tabMenu tabSelected'
		document.getElementById('selectArcan').className = 'tabMenu'
		document.getElementById('selectEmpir').className = 'tabMenu'
		
	}
	else if(pane == 'arcane'){
		document.getElementById('selectBuild').className = 'tabMenu'
		document.getElementById('selectUpgra').className = 'tabMenu'
		document.getElementById('selectPhysi').className = 'tabMenu'
		document.getElementById('selectArcan').className = 'tabMenu tabSelected'
		document.getElementById('selectEmpir').className = 'tabMenu'
		
	}
	else if(pane == 'empire'){
		document.getElementById('selectBuild').className = 'tabMenu'
		document.getElementById('selectUpgra').className = 'tabMenu'
		document.getElementById('selectPhysi').className = 'tabMenu'
		document.getElementById('selectArcan').className = 'tabMenu'
		document.getElementById('selectEmpir').className = 'tabMenu tabSelected'
		
	}
}

//Once per minute cycle
window.setInterval(function(){
	saveGame()
	updateFodder()
	updateGUI()
	console.log('Ran once per minute cycle')
}, 60000)

// MAIN GAME LOOP
//Once per second
window.setInterval(function(){
	updateTitle();
	
}, 1000)


