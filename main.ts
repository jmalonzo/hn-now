import axios from 'axios';
import * as chalk from 'chalk';

const defaultURI = 'https://news.ycombinator.com/item?id=';
const endpoints = {
    top:  'https://hacker-news.firebaseio.com/v0/topstories.json',
    new:  'https://hacker-news.firebaseio.com/v0/newstories.json',
    best: 'https://hacker-news.firebaseio.com/v0/beststories.json',
    ask:  'https://hacker-news.firebaseio.com/v0/askstories.json',
    show: 'https://hacker-news.firebaseio.com/v0/showstories.json',
    job:  'https://hacker-news.firebaseio.com/v0/jobstories.json',
    item: 'https://hacker-news.firebaseio.com/v0/item/'
}

// Cap this to 100 - anyone needs to glance > 100 items at a time?
const hardlimit = 100;

// HN Frontpage defaults to 30 so use that.
let limit = process.argv[3] || 30;
if (limit > hardlimit) {
    console.log(`Capping limit to ${hardlimit} for now.`);
    limit = hardlimit;
}

const useEndpoint = endpoints.hasOwnProperty(process.argv[2]) ? process.argv[2] : 'top';

axios.get(endpoints[useEndpoint]).then(response => {
    const ids = response.data.slice(0, limit);
    const promises = ids.map((id: number) => axios.get(`${endpoints.item}/${id}.json`));
    axios.all(promises).then(response => {
        response
            .sort((a: any, b: any) =>  {
                if (b.data && a.data) {
                    return b.data.score - a.data.score
                }
                return 0;
            })
            .filter((resp: any) => resp && resp.data)
            .map((resp: any) => {
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
    })
});
