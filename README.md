# Wockie

<div align="center">
<img src="https://raw.githubusercontent.com/t-kuni/wockie/master/design/icon.png" alt="icon" title="icon">
</div>

Wockie is web documents searcher.

Recently, the frequency of reading documents on the web such as Installation, Tutorial, Api reference, Issue, etc... is increasing.  
However, the search function of the document on the web is entrusted to the implementation of the site, also the interface is not unified, it is inconvenient.  
By using Wockie, you can quickly access document with specified keywords.  

![demo](https://raw.github.com/wiki/tigmium/wockie/2019-01-06_11h19_43.gif)

# Feature

* Recursively import documents on the web to local and cache them.
* Quick full text search from imported documents.

# Installation

Note: Wockie only support Windows now.

[Download](https://github.com/t-kuni/wockie/releases)

# Contribution

```
npm install
npm run dev
```

# Clean up build directory

```
npm run build:clean
```

# Release Build 

```
npm run build:dir
```

then zip `build/win-unpacked` directory and upload to github.

# Related Documents

https://simulatedgreg.gitbooks.io/electron-vue/content/
https://electronjs.org/docs