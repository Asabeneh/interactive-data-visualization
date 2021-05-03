// const url = 'https://restcountries.eu/rest/v2/all';
// const countriesData =[]
// async function fetchData () {
//   const response = await fetch(url)
//   const data = await response.json()
//   for(const item of data){
//     console.log(item)
//     countriesData.push(item)
//   }
//   console.log(countriesData)
// console.log(JSON.stringify(countriesData, undefined, 4));

// }

// console.log(fetchData())
// console.log(countriesData)

// console.log(JSON.stringify(countriesData, undefined, 4))

// console.log(
// 	JSON.stringify(
// 		data.map((item, index) => {
// 			let rank = index + 1;
// 			item.Happiness_Rank = rank;
// 			return item;
// 		}),
// 		undefined,
// 		4,
// 	),
// );
// Happiness_Rank,
// 	Country,
// 	Happiness_Score,
// 	GDP_per_Capita,
// 	Social_support,
// 	Healthy_Life_Expectancy,
// 	Freedom,
// 	Generosity,
// 	Perceptions_Of_Corruption;

const url = './world_countries.json';
const countriesData = [];
const happiness = [];
const gdp = [];
async function fetchData() {
	const response = await fetch(url);
	const data = await response.json();
	const whrResponse = await fetch('./data/whr_2015.json');
	const whrResponseData = await whrResponse.json();
	console.log(whrResponseData);
	console.log(
		JSON.stringify(
			data.features.map((item) => {
				let happiness = whrResponseData.filter((c) => {
					console.log(item.properties.name);
					return c.Country == item.properties.name;
				})[0];
				return Object.assign({}, item, {
					happiness: { year: 215, happiness: happiness },
				});
			}),
			undefined,
			4,
		),
	);
}

// fetchData()
