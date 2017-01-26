"use strict";
const axios_1 = require("axios");
const chalk = require("chalk");
const endpoints = {
    topstories: 'https://hacker-news.firebaseio.com/v0/topstories.json',
    newstories: 'https://hacker-news.firebaseio.com/v0/newstories.json',
    beststories: 'https://hacker-news.firebaseio.com/v0/beststories.json',
    item: 'https://hacker-news.firebaseio.com/v0/item/'
};
const hardlimit = 60;
let useEndpoint = 'topstories';
let limit = process.argv[3] || 20;
if (limit > hardlimit) {
    console.log(`Capping limit to ${hardlimit} for now.`);
    limit = hardlimit;
}
switch (process.argv[2]) {
    case 'best':
        useEndpoint = 'beststories';
        break;
    case 'new':
        useEndpoint = 'newstories';
        break;
}
axios_1.default.get(endpoints[useEndpoint]).then(response => {
    let ids = response.data.slice(0, limit);
    let promises = ids.map((id) => axios_1.default.get(`${endpoints.item}/${id}.json`));
    axios_1.default.all(promises).then(response => {
        let details = response
            .sort((a, b) => {
            if (b.data && a.data) {
                return b.data.score - a.data.score;
            }
            return 0;
        })
            .filter((resp) => resp && resp.data)
            .map((resp) => {
            let data = resp.data;
            let points = chalk.gray(`(${data.descendants || 0} replies)`);
            let uri = chalk.white.underline(data.url);
            return ` ${data.title} ${points} — ${uri}`;
        });
        console.log(details.join('\n'));
    });
});
