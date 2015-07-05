import restler from 'restler';
import {read, write} from '../utils/files';
import * as commandsHelper from '../utils/commands';


const BASE_API_ADDRESS = 'http://mymemory.translated.net/api/get';

function unescapeHtml(text) {
  return text
      .replace("&amp;", "&")
      .replace("&lt;", "<")
      .replace("&gt;", ">")
      .replace("&quot;", '"')
      .replace("&#039;", "'")
      .replace("&#39;", "'");
}

function changeUserData(userId, data) {
  let users = read('users');

  // Find user in config
  let user = undefined;
  for (let i = 0, max = users.length; i < max; i++) {
    if (users[i].id === userId) {
      user = i;
      break;
    }
  }

  // If it's already there!
  if (user !== undefined) {
    users[user] = Object.assign(users[user], data);
  } else {
    users.push(Object.assign({id: userId}, data));
  }
  write('users', users);
}

function swapLang(userId) {
  let users = read('users');

  // Find user in config
  let user = undefined;
  for (let i = 0, max = users.length; i < max; i++) {
    if (users[i].id === userId) {
      user = i;
      break;
    }
  }

  // If it's already there!
  if (user !== undefined) {
    let src = users[user].source;
    let dst = users[user].destination;
    users[user].source = dst;
    users[user].destination = src;
    write('users', users);
    return `Source and destination languages swapped!
Source: ${dst}
Destination: ${src}`;
  }

  return 'You must set languages first.';
}

export default class Translate {
  static tl(params) {

    let userId = params.userId,
        text = params.params,
        sourceLang = undefined,
        destinationLang = undefined;

    // read src,dest from params
    let lang = text.split(' ').shift();
    if(lang.indexOf(':')) {
      let tmp = lang.split(':');
      if (tmp.length === 2) {
        sourceLang = tmp[0];
        destinationLang = tmp[1];
        text = text.replace(lang+' ','');
      }
    }

    if (!destinationLang) {
      // read user config
      let users = read('users');

      for (var i = 0, max = users.length; i < max; i++) {
        if (users[i].id === userId) {
          destinationLang = users[i].destination;
          sourceLang = users[i].source;
          break;
        }
      }

      // default
      if (!destinationLang) {
        sourceLang = 'en';
        destinationLang = 'fa';
      }

    }


    let query = {
      q: text,
      mt: 1,
      langpair: `${sourceLang}|${destinationLang}`
    }
    //console.log(query);

    return new Promise((res, rej) => {
      restler.get(BASE_API_ADDRESS, {
        query: query
      }).on('complete', response => {
        if (response instanceof Error) {
          return rej(response);
        }
        //console.log(response.matches);
        let tl = 'Nothing found. :(';
        let maxQuality = 0;
        let maxMatch = 0;
        for (let i = 0, max = response.matches.length; i < max; i++) {
          if (response.matches[i].match > maxMatch && response.matches[i].quality > maxQuality) {
            maxQuality = response.matches[i].quality;
            maxMatch = response.matches[i].match;
            tl = response.matches[i].translation;
          }
          if (response.matches[i]['created-by'] === 'MT!' && response.matches[i].match > maxMatch) {
            tl = response.matches[i].translation;
            break;
          }
        }
        return res(unescapeHtml(tl));
      });
    })
  }

  static src(params) {
    let userId = params.userId,
        lang   = params.params;
    changeUserData(userId, {source: lang.trim()});
    return new Promise((res, rej) => {
      res(`Source language changed to ${lang}!`);
    });
  }

  static dest(params) {
    let userId = params.userId,
        lang   = params.params;
    changeUserData(userId, {destination: lang.trim()});
    return new Promise((res, rej) => {
      res(`Destination language changed to ${lang}!`);
    });
  }

  static swp(params) {
    let userId = params.userId;
    return new Promise((res, rej) => {
      res(swapLang(userId));
    });
  }

  static start(params) {
    return this.help(params);
  }

  static help(params) {
    let command = params.params;
    return new Promise((res, rej) => {
      res(commandsHelper.help(command));
    });
  }

}
