"use strict";
const axios_1 = require("axios");
const chalk = require("chalk");
const defaultURI = 'https://news.ycombinator.com/item?id=';
const endpoints = {
    top: 'https://hacker-news.firebaseio.com/v0/topstories.json',
    new: 'https://hacker-news.firebaseio.com/v0/newstories.json',
    best: 'https://hacker-news.firebaseio.com/v0/beststories.json',
    ask: 'https://hacker-news.firebaseio.com/v0/askstories.json',
    show: 'https://hacker-news.firebaseio.com/v0/showstories.json',
    job: 'https://hacker-news.firebaseio.com/v0/jobstories.json',
    item: 'https://hacker-news.firebaseio.com/v0/item/'
};
const hardlimit = 60;
let limit = process.argv[3] || 20;
if (limit > hardlimit) {
    console.log(`Capping limit to ${hardlimit} for now.`);
    limit = hardlimit;
}
const useEndpoint = endpoints.hasOwnProperty(process.argv[2]) ? process.argv[2] : 'top';
axios_1.default.get(endpoints[useEndpoint]).then(response => {
    let ids = response.data.slice(0, limit);
    let promises = ids.map((id) => axios_1.default.get(`${endpoints.item}/${id}.json`));
    axios_1.default.all(promises).then(response => {
        response
            .sort((a, b) => {
            if (b.data && a.data) {
                return b.data.score - a.data.score;
            }
            return 0;
        })
            .filter((resp) => resp && resp.data)
            .map((resp) => {
            let data = resp.data;
            let points = '';
            if (data.descendants) {
                points = chalk.gray(`(${data.descendants || 0} replies)`);
            }
            if (!data.url) {
                data.url = `${defaultURI}${data.id}`;
            }
            let uri = chalk.white.underline(data.url);
            return ` ${data.title} ${points} — ${uri}`;
        })
            .forEach(story => console.log(story));
    });
});
