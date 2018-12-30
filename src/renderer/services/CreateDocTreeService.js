import Url from "url-parse";

const trimAny = (str, any) => {
  return str.replace(new RegExp("^" + any + "+|" + any + "+$", "g"),'');
};

export default {
  createDocTree(docs) {
    const tree = [];
    docs.forEach((doc) => {
      const url = new Url(doc.url);
      const fullPath = url.pathname;

      let current = tree;
      trimAny(fullPath, '/').split('/').forEach(path => {
        if (current[path] === undefined) {
          current[path] = [];
        }
        current = current[path];
      });
    });
    return tree;
  }
}