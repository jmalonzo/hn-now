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

// Cap this for now
const hardlimit = 60;
let limit = process.argv[3] || 20;
if (limit > hardlimit) {
    console.log(`Capping limit to ${hardlimit} for now.`);
    limit = hardlimit;
}

const useEndpoint = endpoints.hasOwnProperty(process.argv[2]) ? process.argv[2] : 'top';

axios.get(endpoints[useEndpoint]).then(response => {
    let ids = response.data.slice(0, limit);
    let promises = ids.map((id: number) => axios.get(`${endpoints.item}/${id}.json`));
    axios.all(promises).then(response => {
        let details = response
            .sort((a: any, b: any) =>  {
                if (b.data && a.data) {
                    return b.data.score - a.data.score
                }
                return 0;
            })
            .filter((resp: any) => resp && resp.data)
            .map((resp: any) => {
                let data = resp.data;
                let points = '';
                if (data.descendants) {
                    points = chalk.gray(`(${data.descendants||0} replies)`);
                }
                if (!data.url) {
                    data.url = `${defaultURI}${data.id}`;
                }
                let uri = chalk.white.underline(data.url);
                return ` ${data.title} ${points} — ${uri}`;
            })
        console.log(details.join('\n'));
    })
});
