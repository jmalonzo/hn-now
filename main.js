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
const hardlimit = 100;
let limit = process.argv[3] || 30;
if (limit > hardlimit) {
    console.log(`Capping limit to ${hardlimit} for now.`);
    limit = hardlimit;
}
const useEndpoint = endpoints.hasOwnProperty(process.argv[2]) ? process.argv[2] : 'top';
axios_1.default.get(endpoints[useEndpoint]).then(response => {
    const ids = response.data.slice(0, limit);
    const promises = ids.map((id) => axios_1.default.get(`${endpoints.item}/${id}.json`));
    axios_1.default.all(promises).then(response => {
        response
            .filter((resp) => resp && resp.data)
            .map((resp) => {
            let data = resp.data;
            let comments = '';
            if (data.descendants) {
                const ncommentStr = data.descendants > 1 ? 'replies' : 'reply';
                let commentURI = '';
                if (data.url && data.url !== `${defaultURI}${data.id}`) {
                    commentURI = chalk.gray.underline(`${defaultURI}${data.id}`);
                    commentURI = ' ' + commentURI;
                }
                comments = chalk.gray(`(${data.descendants} ${ncommentStr}${commentURI})`);
            }
            if (!data.url) {
                data.url = `${defaultURI}${data.id}`;
            }
            let uri = chalk.white.underline(data.url);
            return ` ${chalk.bold(data.title)} — ${uri} ${comments}`;
        })
            .forEach(story => console.log(story));
    });
});
